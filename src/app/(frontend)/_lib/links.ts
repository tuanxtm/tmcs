import type { LocaleCode } from '@/lib/locales'

import { homeHref, localePath } from './locale'

export type CmsLinkInput = {
  label?: string | null
  linkType?: 'internal' | 'external' | null
  page?: unknown
  url?: string | null
  newTab?: boolean | null
}

export type ResolvedLink = {
  label: string
  href: string
  newTab: boolean
  external: boolean
}

/**
 * Public App Router paths that exist today.
 * Internal CMS page links are suppressed until matching dynamic routes ship.
 */
export function isImplementedPublicPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, '') || '/'
  return normalized === '/' || normalized === '/vi' || normalized.startsWith('/api/')
}

function getPageSlug(page: unknown): string | null {
  if (!page || typeof page !== 'object') return null
  const slug = (page as { slug?: unknown }).slug
  return typeof slug === 'string' && slug.length > 0 ? slug : null
}

export function resolveCmsLink(
  link: CmsLinkInput | null | undefined,
  locale: LocaleCode,
): ResolvedLink | null {
  if (!link?.label) return null

  if (link.linkType === 'external') {
    if (!link.url) return null
    return {
      label: link.label,
      href: link.url,
      newTab: Boolean(link.newTab),
      external: true,
    }
  }

  const slug = getPageSlug(link.page)
  if (!slug) return null

  // Special-case: treat an explicit home page slug as the locale home route.
  if (slug === 'home' || slug === 'homepage') {
    return {
      label: link.label,
      href: homeHref(locale),
      newTab: Boolean(link.newTab),
      external: false,
    }
  }

  const href = localePath(locale, `/${slug}`)
  if (!isImplementedPublicPath(href)) {
    return null
  }

  return {
    label: link.label,
    href,
    newTab: Boolean(link.newTab),
    external: false,
  }
}
