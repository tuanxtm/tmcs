'use client'

import { createContext, use } from 'react'

import { DEFAULT_LOCALE, type LocaleCode } from '@/lib/locales'

type LocaleContextValue = {
  locale: LocaleCode
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

type LocaleProviderProps = {
  locale: LocaleCode
  children: React.ReactNode
}

/**
 * Publishes the active locale to client components via context.
 *
 * The server passes `locale` literally (after reading it from
 * `SITE_LOCALE_HEADER`); client consumers read it back via `useLocale()`.
 *
 * Falls back to `DEFAULT_LOCALE` for any consumer rendered outside a
 * provider - safer than throwing since `<BootSplash>`/`<SiteHeader>`
 * already accept a locale prop and may be rendered before hydration.
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext value={{ locale }}>{children}</LocaleContext>
}

export function useLocale(): LocaleCode {
  const value = use(LocaleContext)
  return value ? value.locale : DEFAULT_LOCALE
}