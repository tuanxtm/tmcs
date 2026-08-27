import type { LocaleCode } from '@/lib/locales'

export const dateFormatters: Record<LocaleCode, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }),
  vi: new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }),
}

export function formatDate(value: string | null, locale: LocaleCode): string | null {
  if (!value) return null
  try {
    return dateFormatters[locale].format(new Date(value))
  } catch {
    return null
  }
}
