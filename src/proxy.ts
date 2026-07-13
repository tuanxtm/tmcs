import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { SITE_LOCALE_HEADER } from '@/app/(frontend)/_lib/locale'
import { getTrustedOrigins } from '@/lib/env'
import { DEFAULT_LOCALE } from '@/lib/locales'

/**
 * Payload cookie auth rejects the session when `csrf` is non-empty and the
 * request has neither `Origin` nor an allowed `Sec-Fetch-Site` (see extractJWT).
 *
 * Next.js App Router navigations to a LAN IP often arrive without those
 * headers even though the cookie is first-party — login succeeds, then /admin
 * immediately bounces back to /login. Synthesize `Sec-Fetch-Site: same-origin`
 * for trusted same-host requests so CSRF still blocks real cross-site calls.
 *
 * Also attaches `x-site-locale` for public frontend routes (`/` and `/vi`).
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const host = requestHeaders.get('host')
  const origin = requestHeaders.get('origin')
  const secFetchSite = requestHeaders.get('sec-fetch-site')
  const pathname = request.nextUrl.pathname

  if (host && !origin && !secFetchSite && isTrustedHost(host, request)) {
    requestHeaders.set('sec-fetch-site', 'same-origin')
  }

  const locale = pathname === '/vi' || pathname.startsWith('/vi/') ? 'vi' : DEFAULT_LOCALE
  requestHeaders.set(SITE_LOCALE_HEADER, locale)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/', '/vi', '/vi/:path*', '/admin/:path*', '/api/:path*'],
}

function isTrustedHost(host: string, request: NextRequest): boolean {
  const proto = requestHeadersProto(request) || request.nextUrl.protocol.replace(':', '') || 'http'
  const requestOrigin = `${proto}://${host}`

  if (getTrustedOrigins().includes(requestOrigin)) {
    return true
  }

  // Local/dev: allow any private/loopback host so LAN IP login works without
  // continually updating PAYLOAD_CSRF_ORIGINS.
  if (process.env.NODE_ENV !== 'production') {
    const hostname = host.split(':')[0] || host
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      isPrivateIPv4(hostname)
    )
  }

  return false
}

function requestHeadersProto(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-proto')
  if (!forwarded) return null
  return forwarded.split(',')[0]?.trim() || null
}

function isPrivateIPv4(hostname: string): boolean {
  const parts = hostname.split('.').map((part) => Number(part))
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return false
  }
  const [a, b] = parts
  if (a === 10) return true
  if (a === 192 && b === 168) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  return false
}
