import Link from 'next/link'
import { HeaderNav } from '@/app/(frontend)/_components/layout/header-nav'
import { SiteHeaderLogo } from '@/app/(frontend)/_components/layout/site-header-logo'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'
import styles from './site-header.module.css'

type SiteHeaderProps = {
  siteName: string
  locale: LocaleCode
  navigation: NavItemView[]
  className?: string
}

export function SiteHeader({ siteName, locale, navigation, className }: SiteHeaderProps) {
  return (
    <header className={cn(styles.header, className)} style={{ viewTransitionName: 'site-header' }}>
      <Link href={homeHref(locale)} aria-label={siteName} className={styles.logoCell}>
        <SiteHeaderLogo siteName={siteName} />
      </Link>
      <HeaderNav items={navigation} locale={locale} />
    </header>
  )
}
