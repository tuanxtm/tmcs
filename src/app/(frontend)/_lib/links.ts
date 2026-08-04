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

function getPageSlug(page: unknown): string | null {
  if (!page || typeof page !== 'object') return null
  const slug = (page as { slug?: unknown }).slug
  return typeof slug === 'string' && slug.length > 0 ? slug : null
}

/**
 * Resolve a CMS link to a public href.
 * Internal page relationships use the populated localized slug.
 * Home / homepage slugs map to the locale home route.
 */
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

  return {
    label: link.label,
    href: localePath(locale, `/${slug}`),
    newTab: Boolean(link.newTab),
    external: false,
  }
}

/** Resolve a populated pages relationship to a public path, or null. */
export function resolvePageHref(page: unknown, locale: LocaleCode): string | null {
  const slug = getPageSlug(page)
  if (!slug) return null
  if (slug === 'home' || slug === 'homepage') return homeHref(locale)
  return localePath(locale, `/${slug}`)
}
