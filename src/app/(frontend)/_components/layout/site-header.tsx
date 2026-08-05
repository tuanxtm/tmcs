'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { HeaderNav } from '@/app/(frontend)/_components/layout/header-nav'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

const HERO_ID = 'hero'
const FALLBACK_SCROLL_THRESHOLD = 8

type SiteHeaderProps = {
  siteName: string
  locale: LocaleCode
  navigation: NavItemView[]
}

export function SiteHeader({ siteName, locale, navigation }: SiteHeaderProps) {
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    const hero = document.getElementById(HERO_ID)
    if (!hero) {
      // No hero block on this route — reveal controls on first scroll.
      const onScroll = () => setPastHero(window.scrollY > FALLBACK_SCROLL_THRESHOLD)
      onScroll()
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    // Reveal controls when the hero starts being hidden behind the sticky
    // header — not only after it has fully scrolled past the viewport top.
    // Otherwise the hero text bleeds through the still-transparent header
    // and crosses the nav links on its way out.
    // `BLUR_LEAD_PX` starts the backdrop transition a bit early so it is
    // well underway (or finished) by the time the hero text actually
    // reaches the header line — tune up if the cross-through still flashes.
    const BLUR_LEAD_PX = 48
    let frame = 0
    const check = () => {
      frame = 0
      const headerH = document.querySelector('header')?.offsetHeight ?? 0
      const heroBottom = hero.getBoundingClientRect().bottom
      setPastHero(heroBottom <= headerH + BLUR_LEAD_PX)
    }
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(check)
    }
    check()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <header
      data-scrolled={pastHero ? 'true' : 'false'}
      className={cn(
        'sticky top-0 z-40 transition-[background-color,backdrop-filter,-webkit-backdrop-filter] duration-300 ease-out',
        pastHero
          ? 'bg-background/35 backdrop-blur-md supports-backdrop-filter:bg-background/25'
          : 'bg-transparent',
      )}
    >
      <div className="flex h-[var(--header-height)] min-h-[var(--header-height)] items-center justify-between gap-4 p-2">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt={siteName} width={100} height={100} className="size-3" />
          <Link
            href={homeHref(locale)}
            tabIndex={pastHero ? 0 : -1}
            aria-hidden={pastHero ? undefined : true}
            className={cn(
              'inline-flex min-h-11 items-center font-mono text-xs font-bold lowercase text-foreground transition-[opacity,transform] duration-300 ease-out',
              pastHero ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {siteName}
          </Link>
        </div>
        <HeaderNav
          items={navigation}
          className={cn(
            'min-w-0 transition-[opacity,transform] duration-300 ease-out',
            pastHero ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        />
      </div>
    </header>
  )
}
