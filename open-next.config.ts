import { defineCloudflareConfig } from '@opennextjs/cloudflare/config'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache'
import doShardedTagCache from '@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache'

/**
 * Persist Next.js data cache (`unstable_cache` / tagged entries) on R2 and
 * store on-demand revalidation tags in a sharded Durable Object so we do not
 * consume application D1 rows for cache bookkeeping.
 *
 * Time-based ISR queue is intentionally omitted — public CMS data is cached
 * indefinitely and invalidated via Payload afterChange/afterDelete hooks.
 *
 * One-time remote provisioning (do not run from this refactor):
 *   wrangler r2 bucket create tmcs-cache
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, {
    mode: 'long-lived',
  }),
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
})
