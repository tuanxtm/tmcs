/**
 * Custom Cloudflare Worker entrypoint for OpenNext.
 *
 * Reuses the generated OpenNext fetch handler and adds a `scheduled` handler
 * so Cloudflare Cron Triggers can run Payload jobs (scheduled publish/unpublish).
 *
 * Why this file exists:
 * - OpenNext's default worker only exports `fetch`
 * - Payload `schedulePublish` queues jobs but does not run them on Workers
 * - `jobs.autoRun` is for long-running Node servers — do not enable it here
 *
 * Local testing:
 * - `wrangler dev --test-scheduled`
 * - or POST/GET `/api/cron/jobs` with `Authorization: Bearer $CRON_SECRET`
 *
 * Production setup:
 * 1. Set Worker secret `CRON_SECRET`
 * 2. Ensure wrangler `triggers.crons` is configured
 * 3. Ensure `WORKER_SELF_REFERENCE` service binding matches the Worker name
 *
 * @see https://opennext.js.org/cloudflare/howtos/custom-worker
 * @see https://payloadcms.com/docs/jobs-queue/queues
 */

// `.open-next/worker.js` is generated at build time by OpenNext.
// @ts-ignore generated worker module
import { default as handler } from './.open-next/worker.js'

export default {
  fetch: handler.fetch,

  async scheduled(event, env, ctx) {
    // Invoke the Next.js route that runs Payload jobs.
    // Prefer the service binding when available so we stay on-Worker.
    const secret = env.CRON_SECRET
    if (!secret) {
      console.error(
        JSON.stringify({ level: 'error', msg: 'CRON_SECRET missing in scheduled handler' }),
      )
      return
    }

    const run = async () => {
      try {
        const binding = env.WORKER_SELF_REFERENCE
        const request = new Request('https://internal/api/cron/jobs?limit=10', {
          method: 'POST',
          headers: {
            authorization: `Bearer ${secret}`,
            'x-cron-secret': secret,
          },
        })

        let response: Response
        if (binding && typeof binding.fetch === 'function') {
          response = await binding.fetch(request)
        } else {
          // Fallback for local/dev without service binding
          response = await fetch(request)
        }

        const text = await response.text()
        console.log(
          JSON.stringify({
            level: 'info',
            msg: 'scheduled jobs invocation',
            cron: event.cron,
            status: response.status,
            body: text.slice(0, 500),
          }),
        )
      } catch (error) {
        console.error(
          JSON.stringify({
            level: 'error',
            msg: 'scheduled jobs invocation failed',
            cron: event.cron,
            error: error instanceof Error ? error.message : String(error),
          }),
        )
      }
    }

    ctx.waitUntil(run())
  },
} satisfies ExportedHandler<CloudflareEnv>

// Re-export Durable Object handlers if OpenNext caching uses them.
// @ts-ignore generated worker module
export { DOQueueHandler, DOShardedTagCache } from './.open-next/worker.js'
