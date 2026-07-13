import { getPayload } from 'payload'
import config from '@payload-config'

import { constantTimeEqual } from '@/lib/crypto'

export const runtime = 'nodejs'

/**
 * Protected jobs runner for Cloudflare Cron / scheduled publishing.
 *
 * Payload `schedulePublish` only queues jobs. On Cloudflare Workers there is
 * no long-running `autoRun` process, so this endpoint must be invoked on a
 * schedule (see root `worker.ts` + wrangler cron triggers).
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret: <CRON_SECRET>`
 * Rejects browser navigations and missing/invalid secrets.
 *
 * Caps work per invocation to fit Workers CPU limits. Failed jobs remain
 * retryable on the next run.
 */
export async function GET(request: Request): Promise<Response> {
  return runJobs(request)
}

export async function POST(request: Request): Promise<Response> {
  return runJobs(request)
}

async function runJobs(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return Response.json({ ok: false, error: 'CRON_SECRET not configured' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const headerSecret = request.headers.get('x-cron-secret') || ''
  const provided = bearer || headerSecret

  if (!provided || !constantTimeEqual(provided, secret)) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Reject casual browser navigations
  const secFetch = request.headers.get('sec-fetch-mode')
  if (secFetch === 'navigate') {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const limit = Math.min(Number(url.searchParams.get('limit') || 10) || 10, 25)

  const payload = await getPayload({ config })

  // `payload.jobs.run` handles due schedules by default and executes queued jobs.
  const result = await payload.jobs.run({
    limit,
    queue: 'default',
  })

  // Log counts only — never log secrets or document content.
  console.log(
    JSON.stringify({
      level: 'info',
      msg: 'cron jobs run',
      limit,
      jobStatus: result ?? null,
    }),
  )

  return Response.json({
    ok: true,
    limit,
    result: result ?? null,
  })
}
