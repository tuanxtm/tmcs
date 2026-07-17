'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'

import { DesktopNav } from './desktop-nav'
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
    <header className="dash-b sticky top-0 z-40 bg-transparent">
      {/* Gutter wrapper — no blur here, so outside the rails stays clear */}
      <div className="mx-auto w-full max-w-[var(--content-max)] px-[var(--page-gutter)]">
        <div
          className={cn(
            'flex items-center justify-between gap-4 transition-[background-color,backdrop-filter]',
            scrolled ? 'backdrop-blur-md' : 'bg-transparent',
          )}
          style={{ minHeight: 'var(--header-height)' }}
        >
          <Link
            href={homeHref(locale)}
            className="p-2 font-mono font-bold text-sm uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          >
            {siteName}
          </Link>

          <div className="flex items-center gap-3">
            <DesktopNav items={navigation} />
            <MobileNav items={navigation} siteName={siteName} />
          </div>
        </div>
      </div>
    </header>
  )
}
