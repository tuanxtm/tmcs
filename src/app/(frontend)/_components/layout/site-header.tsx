'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'

import { DesktopNav } from './desktop-nav'
import { LocaleSwitcher } from './locale-switcher'
import { MobileNav } from './mobile-nav'

type SiteHeaderProps = {
  locale: LocaleCode
  siteName: string
  navigation: NavItemView[]
}

export function SiteHeader({ locale, siteName, navigation }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-dashed border-[color:var(--border-dashed)] transition-[background-color,backdrop-filter,box-shadow]',
        scrolled
          ? 'bg-background/75 shadow-[0_1px_0_0_var(--border)] backdrop-blur-md'
          : 'bg-background/55 backdrop-blur-sm',
      )}
    >
      <div className="page-frame">
        <div
          className="flex items-center justify-between gap-4"
          style={{ minHeight: 'var(--header-height)' }}
        >
          <Link
            href={homeHref(locale)}
            className="font-mono text-sm uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          >
            {siteName}
          </Link>

          <div className="flex items-center gap-3">
            <DesktopNav items={navigation} />
            <div className="hidden lg:block">
              <LocaleSwitcher locale={locale} />
            </div>
            <MobileNav items={navigation} locale={locale} siteName={siteName} />
          </div>
        </div>
      </div>
    </header>
  )
}
