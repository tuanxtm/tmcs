'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import { homeHref, switchLocalePath } from '@/app/(frontend)/_lib/locale'

type LocaleSwitcherProps = {
  locale: LocaleCode
  className?: string
}

export function LocaleSwitcher({ locale, className }: LocaleSwitcherProps) {
  const pathname = usePathname() || '/'

  return (
    <div
      className={cn(
        'dash-box inline-flex items-center gap-1 rounded-md px-1 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.16em]',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {(['en', 'vi'] as const).map((code) => {
        const href = code === locale ? homeHref(locale) : switchLocalePath(pathname, code)
        const active = code === locale

        return (
          <Link
            key={code}
            href={href}
            hrefLang={code}
            className={cn(
              'inline-flex min-h-9 min-w-9 items-center justify-center rounded-sm px-2 transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            aria-current={active ? 'true' : undefined}
          >
            {code}
          </Link>
        )
      })}
    </div>
  )
}
