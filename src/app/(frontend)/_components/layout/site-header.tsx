'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import { homeHref, localePath } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'

import { DesktopNav } from './desktop-nav'
import { MobileNav } from './mobile-nav'

type SiteHeaderProps = {
  locale: LocaleCode
  siteName: string
  navigation: NavItemView[]
  contactEmail: string | null
}

export function SiteHeader({ locale, siteName, navigation, contactEmail }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const contactHref = contactEmail
    ? `mailto:${contactEmail}`
    : localePath(locale, '/contact')

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
            translate="no"
            className="p-2 font-mono text-sm font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          >
            {siteName}
          </Link>

          <div className="flex items-center self-stretch">
            <DesktopNav items={navigation} />
            <div className="dash-l flex items-center self-stretch px-4">
              <Link
                href={contactHref}
                className="inline-flex items-center justify-center text-foreground px-3 py-1.5 font-sans text-xs font-medium uppercase no-underline transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Contact
              </Link>
            </div>
            <MobileNav items={navigation} siteName={siteName} />
          </div>
        </div>
      </div>
    </header>
  )
}
