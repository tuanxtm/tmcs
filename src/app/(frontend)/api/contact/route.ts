import { getPayload } from 'payload'
import config from '@payload-config'

import { hashWithSecret } from '@/lib/crypto'
import { getContactHashSecret, getServerURL } from '@/lib/env'
import { isLocaleCode } from '@/lib/locales'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 8 * 1024 // 8KB
const MIN_SUBMIT_MS = 1500
const DEDUPE_WINDOW_MS = 60_000

type ContactBody = {
  name?: unknown
  email?: unknown
  subject?: unknown
  category?: unknown
  message?: unknown
  locale?: unknown
  sourcePage?: unknown
  consent?: unknown
  /** Honeypot — must be empty. Real browsers leave this blank. */
  website?: unknown
  /** Client-side form open timestamp (ms). */
  openedAt?: unknown
}

const isNonEmptyString = (value: unknown, max: number): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max

const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254

/**
 * Public contact endpoint.
 *
 * Why this exists instead of public REST create on `contact-submissions`:
 * - Collection create access is intentionally `false` for everyone.
 * - This route validates, rate-limits/dedupes, hashes abuse metadata, then
 *   performs a trusted Local API create (system-level) after those checks.
 *
 * Extension points (not wired yet):
 * - Cloudflare Turnstile verification
 * - Email notification provider (Resend / Email Workers)
 */
export async function POST(request: Request): Promise<Response> {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: 'Payload too large' }, { status: 413 })
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return Response.json({ ok: false, error: 'Invalid body' }, { status: 400 })
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: 'Payload too large' }, { status: 413 })
  }

  let body: ContactBody
  try {
    body = JSON.parse(rawBody) as ContactBody
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    // Pretend success to avoid tipping off bots
    return Response.json({ ok: true })
  }

  if (typeof body.openedAt === 'number') {
    const elapsed = Date.now() - body.openedAt
    if (elapsed >= 0 && elapsed < MIN_SUBMIT_MS) {
      return Response.json({ ok: true })
    }
  }

  if (!isNonEmptyString(body.name, 120)) {
    return Response.json({ ok: false, error: 'Invalid name' }, { status: 400 })
  }
  if (!isNonEmptyString(body.email, 254) || !isValidEmail(body.email.trim())) {
    return Response.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  }
  if (!isNonEmptyString(body.message, 5000)) {
    return Response.json({ ok: false, error: 'Invalid message' }, { status: 400 })
  }
  if (body.consent !== true) {
    return Response.json({ ok: false, error: 'Consent required' }, { status: 400 })
  }

  const locale = isLocaleCode(body.locale) ? body.locale : 'en'
  const category =
    typeof body.category === 'string' &&
    ['general', 'project', 'speaking', 'other'].includes(body.category)
      ? (body.category as 'general' | 'project' | 'speaking' | 'other')
      : 'general'

  let sourcePage: string | undefined
  if (typeof body.sourcePage === 'string' && body.sourcePage.trim()) {
    try {
      const url = new URL(body.sourcePage)
      const server = new URL(getServerURL())
      if (url.origin !== server.origin) {
        return Response.json({ ok: false, error: 'Invalid source page' }, { status: 400 })
      }
      sourcePage = url.toString()
    } catch {
      return Response.json({ ok: false, error: 'Invalid source page' }, { status: 400 })
    }
  }

  let hashSecret: string
  try {
    hashSecret = getContactHashSecret()
  } catch {
    return Response.json({ ok: false, error: 'Server misconfigured' }, { status: 500 })
  }

  const forwarded =
    request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || ''
  const ip = forwarded.split(',')[0]?.trim() || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const ipHash = hashWithSecret(ip, hashSecret)
  const userAgentHash = hashWithSecret(userAgent, hashSecret)

  const payload = await getPayload({ config })

  // Deduplicate bursts from same email+ip hash within a short window
  const since = new Date(Date.now() - DEDUPE_WINDOW_MS).toISOString()
  const recent = await payload.find({
    collection: 'contact-submissions',
    where: {
      and: [
        { email: { equals: body.email.trim().toLowerCase() } },
        { 'abuse.ipHash': { equals: ipHash } },
        { createdAt: { greater_than_equal: since } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (recent.totalDocs > 0) {
    // Generic success — do not aid enumeration
    return Response.json({ ok: true })
  }

  await payload.create({
    collection: 'contact-submissions',
    data: {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      subject: typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : undefined,
      category,
      message: body.message.trim(),
      locale,
      status: 'new',
      sourcePage,
      consent: true,
      abuse: {
        ipHash,
        userAgentHash,
        honeypotTriggered: false,
      },
    },
    overrideAccess: true,
  })

  // Extension point: enqueue email notification job here later.

  return Response.json({ ok: true })
}
