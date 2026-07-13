import { describe, it, beforeAll, expect } from 'vitest'
import type { Payload } from 'payload'

import { ensureTestUsers, initPayload, type TestUsers } from '../helpers/payload'
import { POST as contactPOST } from '@/app/(frontend)/api/contact/route'
import { GET as cronGET } from '@/app/(frontend)/api/cron/jobs/route'

describe('Contact and cron routes', () => {
  let payload: Payload
  let users: TestUsers

  beforeAll(async () => {
    process.env.CONTACT_HASH_SECRET = process.env.CONTACT_HASH_SECRET || 'test-contact-secret'
    process.env.CRON_SECRET = process.env.CRON_SECRET || 'test-cron-secret'
    process.env.NEXT_PUBLIC_SERVER_URL =
      process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
    payload = await initPayload()
    users = await ensureTestUsers(payload)
  })

  it('rejects contact create via collection API for public', async () => {
    await expect(
      payload.create({
        collection: 'contact-submissions',
        data: {
          name: 'Hacker',
          email: 'hacker@example.com',
          message: 'nope',
          locale: 'en',
          consent: true,
          status: 'new',
        },
        user: undefined,
        overrideAccess: false,
      } as never),
    ).rejects.toThrow()
  })

  it('accepts valid contact submissions via hardened route', async () => {
    const res = await contactPOST(
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
        body: JSON.stringify({
          name: 'Visitor',
          email: `visitor-${Date.now()}@example.com`,
          message: 'Hello from tests',
          locale: 'en',
          consent: true,
          openedAt: Date.now() - 5000,
          sourcePage: 'http://localhost:3000/contact',
        }),
      }),
    )

    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean }
    expect(json.ok).toBe(true)

    const found = await payload.find({
      collection: 'contact-submissions',
      limit: 5,
      sort: '-createdAt',
      user: users.admin,
      overrideAccess: false,
    })
    expect(found.totalDocs).toBeGreaterThan(0)
    expect(found.docs[0].abuse?.ipHash).toBeTruthy()
  })

  it('silently accepts honeypot submissions', async () => {
    const res = await contactPOST(
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Bot',
          email: 'bot@example.com',
          message: 'spam',
          consent: true,
          website: 'http://spam.example',
          openedAt: Date.now() - 5000,
        }),
      }),
    )
    expect(res.status).toBe(200)
  })

  it('rejects unauthorized cron job runs', async () => {
    const res = await cronGET(new Request('http://localhost:3000/api/cron/jobs'))
    expect(res.status).toBe(401)
  })

  it('allows cron job runs with valid secret', async () => {
    const res = await cronGET(
      new Request('http://localhost:3000/api/cron/jobs?limit=1', {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }),
    )
    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean }
    expect(json.ok).toBe(true)
  })

  it('creator cannot read contact submissions', async () => {
    await expect(
      payload.find({
        collection: 'contact-submissions',
        user: users.creatorA,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('rejects oversized contact bodies without Content-Length', async () => {
    const huge = 'x'.repeat(9 * 1024)
    const res = await contactPOST(
      new Request('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Large',
          email: 'large@example.com',
          message: huge,
          consent: true,
          openedAt: Date.now() - 5000,
        }),
      }),
    )
    expect(res.status).toBe(413)
  })
})
