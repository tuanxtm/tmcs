/**
 * Localization constants.
 *
 * English is the source/default locale. Vietnamese falls back to English
 * when a localized field has no translation.
 *
 * Frontend query contract:
 * - Always pass `locale`
 * - Use fallback by default
 * - For routes that require a real translation, use
 *   `fallbackLocale: false` + `where: { slug: { exists: true } }`
 */

export const LOCALES = [
  {
    code: 'en',
    label: 'English',
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    fallbackLocale: 'en',
  },
] as const

export const DEFAULT_LOCALE = 'en'

export type LocaleCode = (typeof LOCALES)[number]['code']

export const LOCALE_CODES: LocaleCode[] = LOCALES.map((locale) => locale.code)

export const isLocaleCode = (value: unknown): value is LocaleCode =>
  typeof value === 'string' && LOCALE_CODES.includes(value as LocaleCode)
