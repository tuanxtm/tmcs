'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLenis } from 'lenis/react'
import { IconMenu2, IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { externalLinkProps } from '@/app/(frontend)/_lib/link-props'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type HeaderNavProps = {
  items: NavItemView[]
  siteName: string
  locale: LocaleCode
  className?: string
}

export function HeaderNav({ items, siteName, locale, className }: HeaderNavProps) {
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const pausedLenisRef = useRef(false)

  // Pause Lenis while the mobile drawer is open. Drawer locks <body>, but Lenis
  // still owns the wheel via its own RAF loop and would otherwise scroll the
  // page underneath the drawer.
  useEffect(() => {
    if (!lenis) return
    if (open && !pausedLenisRef.current) {
      lenis.stop()
      pausedLenisRef.current = true
    } else if (!open && pausedLenisRef.current) {
      lenis.start()
      pausedLenisRef.current = false
    }
  }, [lenis, open])

  // Safety net: if the nav unmounts while open, restore Lenis.
  useEffect(() => {
    return () => {
      if (pausedLenisRef.current) {
        lenis?.start()
        pausedLenisRef.current = false
      }
    }
  }, [lenis])

  return (
    <div className={cn('flex shrink-0 items-center md:hidden', className)}>
      <Drawer direction="bottom" open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Open menu"
            className="rounded-none border-none text-foreground hover:bg-transparent hover:text-foreground/80"
          >
            <IconMenu2 aria-hidden="true" className="size-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent
          className="page-frame mx-auto w-full rounded-t-xl border-border bg-background text-foreground"
        >
          <DrawerTitle className="sr-only">Site navigation</DrawerTitle>
          <DrawerDescription className="sr-only">Primary site navigation menu.</DrawerDescription>
          <div className="flex items-center justify-between h-(--header-height)">
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Close menu"
                className="rounded-none border-none text-foreground hover:bg-transparent hover:text-foreground/80"
              >
                <IconX aria-hidden="true" className="size-4" />
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Link
                href={homeHref(locale)}
                aria-label={siteName}
                className="inline-flex items-center"
              >
                <Image
                  src="/logo.svg"
                  alt={siteName}
                  width={100}
                  height={100}
                  className="size-4"
                />
              </Link>
            </DrawerClose>
          </div>
          {items.length > 0 ? (
            <>
              <div className="dash-line-b" />
              <NavList items={items} direction="column" onNavigate={() => setOpen(false)} />
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  )
}

type NavListProps = {
  items: NavItemView[]
  direction: 'row' | 'column'
  onNavigate: () => void
}

function NavList({ items, direction, onNavigate }: NavListProps) {
  return (
    <nav aria-label="Primary">
      <ul
        className={cn(
          'flex items-center',
          direction === 'row'
            ? 'flex-row flex-wrap gap-x-4 gap-y-1 justify-end'
            : 'flex-col items-start gap-2',
        )}
      >
        {items.map((item, itemIndex) => (
          <li
            key={`${itemIndex}-${item.id}`}
            className={cn(
              'flex',
              direction === 'row' ? 'items-center gap-1' : 'flex-col items-start gap-1',
            )}
          >
            <Link
              href={item.href}
              {...externalLinkProps(item)}
              onClick={onNavigate}
              {...(item.newTab || item.external
                ? {}
                : { transitionTypes: ['nav-forward'] as string[] })}
              className="inline-flex items-center text-sm font-semibold leading-none uppercase tracking-tight text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
            {item.children.length > 0
              ? item.children.map((child, childIndex) => (
                  <Link
                    key={`${itemIndex}-${childIndex}-${child.id}`}
                    href={child.href}
                    {...externalLinkProps(child)}
                    onClick={onNavigate}
                    {...(child.newTab || child.external
                      ? {}
                      : { transitionTypes: ['nav-forward'] as string[] })}
                    className={cn(
                      'inline-flex items-center text-sm leading-none uppercase text-muted-foreground transition-colors hover:text-primary',
                      direction === 'column' ? 'pl-3' : '',
                    )}
                  >
                    {child.label}
                  </Link>
                ))
              : null}
          </li>
        ))}
      </ul>
    </nav>
  )
}
