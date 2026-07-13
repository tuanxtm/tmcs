/**
 * Reset local development database helpers.
 *
 * WARNING: This does NOT wipe remote Cloudflare D1.
 * It clears local Wrangler/OpenNext caches and reminds you how to
 * recreate a disposable local D1 state safely.
 *
 * Usage:
 *   bun run reset:local
 */

import { rmSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const targets = ['.next', '.open-next', '.wrangler']

for (const dir of targets) {
  const full = path.join(root, dir)
  if (existsSync(full)) {
    rmSync(full, { recursive: true, force: true })
    console.log(`Removed ${dir}/`)
  } else {
    console.log(`Skip missing ${dir}/`)
  }
}

console.log(`
Local caches cleared.

To fully reset local D1 data:
1. Ensure wrangler.jsonc points at a disposable/local database (never production).
2. Re-run migrations: bun run migrate
3. Re-seed: bun run seed

Never run destructive resets against production D1.
`)
