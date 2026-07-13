import { DEFAULT_LOCALE, isLocaleCode, type LocaleCode } from '@/lib/locales'

export const SITE_LOCALE_HEADER = 'x-site-locale'

export function parseLocale(value: string | null | undefined): LocaleCode {
  if (isLocaleCode(value)) return value
  return DEFAULT_LOCALE
}

export function localePath(locale: LocaleCode, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`

  if (locale === 'en') {
    return normalized === '/vi' ? '/' : normalized.replace(/^\/vi(?=\/|$)/, '') || '/'
  }

  if (normalized === '/') return '/vi'
  if (normalized === '/vi' || normalized.startsWith('/vi/')) return normalized
  return `/vi${normalized}`
}

export function switchLocalePath(pathname: string, target: LocaleCode): string {
  const withoutLocale = pathname.replace(/^\/vi(?=\/|$)/, '') || '/'
  return localePath(target, withoutLocale)
}

export function homeHref(locale: LocaleCode): string {
  return localePath(locale, '/')
}
