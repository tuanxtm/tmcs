'use client'

import Link from 'next/link'
import { HeaderNav } from '@/app/(frontend)/_components/layout/header-nav'
import { SiteHeaderLogo } from '@/app/(frontend)/_components/layout/site-header-logo'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

type SiteHeaderProps = {
  siteName: string
  locale: LocaleCode
  navigation: NavItemView[]
  className?: string
}

export function SiteHeader({ siteName, locale, navigation, className }: SiteHeaderProps) {
  return (
    <header className={className} style={{ viewTransitionName: 'site-header' }}>
      <div
        className={cn(
          'relative flex h-(--header-height) min-h-(--header-height) items-center justify-between',
          'px-2 md:px-3 lg:px-4',
          'mt-2 md:mt-3 lg:mt-4',
        )}
      >
        <div>
          <Link href={homeHref(locale)} aria-label={siteName}>
            <SiteHeaderLogo siteName={siteName} />
          </Link>
        </div>
        <HeaderNav items={navigation} siteName={siteName} locale={locale} />
      </div>
    </header>
  )
}
