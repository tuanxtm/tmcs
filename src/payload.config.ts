import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { collections } from './collections'
import { globals } from './globals'
import { constantTimeEqual } from './lib/crypto'
import { getPayloadSecret, getServerURL, getTrustedOrigins } from './lib/env'
import { DEFAULT_LOCALE, LOCALES } from './lib/locales'
import { isAdminOrManager, type UserWithRole } from './lib/roles'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) =>
  realpath(value)?.endsWith(path.join('payload', 'bin.js')),
)
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' · TMCS',
    },
  },
  collections,
  globals,
  editor: lexicalEditor(),
  secret: getPayloadSecret(),
  // Empty serverURL in development so Admin uses relative URLs and works when
  // opened via localhost OR a LAN IP. A fixed serverURL (e.g. localhost) makes
  // Payload populate `csrf`, which then rejects cookies on requests that omit
  // Origin/Sec-Fetch-Site — common for Next navigations to a network IP.
  serverURL: isProduction ? getServerURL() : '',
  csrf: isProduction ? getTrustedOrigins() : [],
  cors: getTrustedOrigins(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  // REST/Local API only — GraphQL is unused and limited on Cloudflare Workers.
  graphQL: {
    disable: true,
  },
  // Jobs are queued by schedulePublish. On Cloudflare Workers they must be
  // executed by an external cron (see worker.ts + /api/cron/jobs).
  // Do NOT enable jobs.autoRun — it requires a long-running Node process.
  jobs: {
    access: {
      run: ({ req }) => {
        const user = req.user as UserWithRole | null | undefined
        if (isAdminOrManager(user)) return true

        const cronSecret = process.env.CRON_SECRET?.trim()
        const provided = req.headers.get('x-cron-secret')
        if (!cronSecret || !provided) return false
        return constantTimeEqual(provided, cronSecret)
      },
    },
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
    // Schema is managed via migrations (see src/migrations). Disable drizzle push
    // to avoid "index already exists" races in tests and multi-process local runs.
    push: false,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
