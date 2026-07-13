/**
 * Environment parsing helpers.
 *
 * Keep secrets out of source control. Document placeholders in `.env.example`.
 */

export const getServerURL = (): string => {
  const value = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (!value) {
    return 'http://localhost:3000'
  }
  return value.replace(/\/$/, '')
}

/**
 * Origins allowed for cookie auth (CSRF) and CORS.
 *
 * In production, Payload only accepts auth cookies when `Origin` is in this list
 * (serverURL is included automatically). In local development CSRF is left empty
 * so Admin works on both localhost and LAN IPs; see `src/proxy.ts` for the
 * same-host Sec-Fetch-Site workaround used when those headers are missing.
 *
 * Add extra origins via `PAYLOAD_CSRF_ORIGINS` (comma-separated, no trailing slash).
 */
export const getTrustedOrigins = (): string[] => {
  const origins = new Set<string>([getServerURL()])

  const extra = process.env.PAYLOAD_CSRF_ORIGINS?.trim()
  if (extra) {
    for (const part of extra.split(',')) {
      const origin = part.trim().replace(/\/$/, '')
      if (!origin) continue
      try {
        origins.add(new URL(origin).origin)
      } catch {
        // Ignore malformed entries
      }
    }
  }

  return [...origins]
}

export const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export const getOptionalEnv = (name: string, fallback = ''): string =>
  process.env[name]?.trim() || fallback

/**
 * Payload signing/encryption secret.
 * Required always — never fall back to an empty string.
 */
export const getPayloadSecret = (): string => getRequiredEnv('PAYLOAD_SECRET')

/**
 * Secret used to hash contact abuse metadata (IP / UA).
 * Prefer CONTACT_HASH_SECRET; fall back to PAYLOAD_SECRET.
 * Never uses a hardcoded placeholder.
 */
export const getContactHashSecret = (): string => {
  const dedicated = process.env.CONTACT_HASH_SECRET?.trim()
  if (dedicated) return dedicated
  return getPayloadSecret()
}

/**
 * Shared secret for Cloudflare Cron → /api/cron/jobs.
 * Required when validating cron requests.
 */
export const getCronSecret = (): string => getRequiredEnv('CRON_SECRET')
