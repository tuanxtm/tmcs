'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeaderNav } from '@/app/(frontend)/_components/layout/header-nav'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

const SCROLL_BLUR_THRESHOLD = 8

function subscribeScroll(onStoreChange: () => void) {
  window.addEventListener('scroll', onStoreChange, { passive: true })
  return () => window.removeEventListener('scroll', onStoreChange)
}

function getScrolledSnapshot() {
  return window.scrollY > SCROLL_BLUR_THRESHOLD
}

function getScrolledServerSnapshot() {
  return false
}

type SiteHeaderProps = {
  siteName: string
  locale: LocaleCode
  navigation: NavItemView[]
}

export function SiteHeader({ siteName, locale, navigation }: SiteHeaderProps) {
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    getScrolledSnapshot,
    getScrolledServerSnapshot,
  )

  return (
    <header
      data-scrolled={scrolled ? 'true' : 'false'}
      className={cn(
        'sticky top-0 z-40 transition-[background-color,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-out',
        scrolled
          ? 'bg-background/35 backdrop-blur-md supports-backdrop-filter:bg-background/25'
          : 'bg-transparent',
      )}
    >
      <div className="flex h-[var(--header-height)] min-h-[var(--header-height)] items-center justify-between gap-4 p-2">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt={siteName} width={100} height={100} className="size-3" />
          <Link
            href={homeHref(locale)}
            className="inline-flex min-h-11 items-center font-mono text-xs font-bold lowercase text-foreground transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {siteName}
          </Link>
        </div>
        <HeaderNav items={navigation} className="min-w-0" />
      </div>
    </header>
  )
}
