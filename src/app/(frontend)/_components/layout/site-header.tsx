'use client'

import Link from 'next/link'
import Image from 'next/image'
import { HeaderNav } from '@/app/(frontend)/_components/layout/header-nav'
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
    <header
      className={cn(
        'bg-background dash-line-b fixed inset-x-0 top-0',
        'mt-4 md:mt-8 lg:mt-16',
        className,
      )}
    >
      <div
        className={cn(
          'bg-background relative flex h-(--header-height) min-h-(--header-height) items-center justify-between',
          'px-2 md:px-3 lg:px-4',
          'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <Link href={homeHref(locale)}>
            <Image
              src="/logo.svg"
              alt={siteName}
              width={100}
              height={100}
              className="size-4 lg:size-5"
            />
          </Link>
        </div>
        <HeaderNav items={navigation} />
      </div>
    </header>
  )
}
