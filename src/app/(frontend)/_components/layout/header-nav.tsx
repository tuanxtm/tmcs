'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import { IconChevronLeft, IconMenu2, IconX } from '@tabler/icons-react'
import { Barcode } from '@/components/ui/barcode'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/icons/logo'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { externalLinkProps } from '@/app/(frontend)/_lib/link-props'
import { homeHref, switchLocalePath } from '@/app/(frontend)/_lib/locale'
import { LOCALES, type LocaleCode } from '@/lib/locales'
import type { NavChildView, NavItemView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type HeaderNavProps = {
  items: NavItemView[]
  siteName: string
  locale: LocaleCode
  className?: string
}

export function HeaderNav({ items, siteName, locale, className }: HeaderNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
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

  const localeSwitcherTarget = switchLocalePath(pathname ?? '/', locale === 'vi' ? 'en' : 'vi')
  const closeOuter = () => setOpen(false)

  return (
    <div className={cn('flex shrink-0 items-center md:hidden', className)}>
      <Drawer swipeDirection="down" open={open} onOpenChange={setOpen}>
        <DrawerTrigger
          render={(triggerProps) => (
            <Button
              {...triggerProps}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Open menu"
              className="text-primary rounded-none border-none hover:bg-transparent hover:text-primary/80"
            >
              <IconMenu2 aria-hidden="true" className="size-4" />
            </Button>
          )}
        />
        <DrawerContent className="bg-background text-foreground mx-auto w-full items-center rounded-none py-5">
          <DrawerTitle className="sr-only">Site navigation</DrawerTitle>
          <DrawerDescription className="sr-only">Primary site navigation menu</DrawerDescription>
          <DrawerChrome
            onClose={closeOuter}
            siteName={siteName}
            locale={locale}
            closeIcon={<IconX className="size-5" />}
            closeLabel="Close menu"
          />
          {items.length > 0 ? (
            <NavList
              items={items}
              direction="column"
              onNavigate={closeOuter}
              locale={locale}
              className="items-center"
            />
          ) : null}
          <LocaleSwitcher
            currentLocale={locale}
            targetPath={localeSwitcherTarget}
            onNavigate={closeOuter}
          />
          <div className="text-primary mx-auto mt-5 h-4 w-20">
            <Barcode value="DESTINATION" className="h-full w-full" />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

type DrawerChromeProps = {
  onClose: () => void
  siteName: string
  locale: LocaleCode
  /**
   * Icon shown on the close/back button. Use `IconX` for the outermost drawer
   * and `IconChevronLeft` for nested drawers so the affordance matches the
   * stack level.
   */
  closeIcon: React.ReactNode
  /** Accessible label for the close/back button. */
  closeLabel: string
}

function DrawerChrome({ onClose, siteName, locale, closeIcon, closeLabel }: DrawerChromeProps) {
  return (
    <div className="-mt-1 mb-5 flex flex-col items-center gap-3.5">
      <DrawerClose
        render={(closeProps) => (
          <Button
            {...closeProps}
            type="button"
            variant="ghost"
            aria-label={closeLabel}
            className="text-foreground m-0 cursor-pointer rounded-none border-0 border-none p-0 hover:bg-transparent"
          >
            <span aria-hidden="true" className="text-primary flex items-center">
              {closeIcon}
            </span>
          </Button>
        )}
      />
      <Link
        href={homeHref(locale)}
        aria-label={siteName}
        className="text-primary inline-flex items-center"
        onClick={onClose}
      >
        <Logo size={20} aria-label={siteName} />
      </Link>
    </div>
  )
}

type NavListProps = {
  items: NavItemView[]
  direction: 'row' | 'column'
  onNavigate: () => void
  locale: LocaleCode
  className?: string
}

function NavList({ items, direction, onNavigate, locale, className }: NavListProps) {
  return (
    <nav aria-label="Primary">
      <ul
        className={cn(
          'flex items-center',
          direction === 'row'
            ? 'flex-row flex-wrap justify-end gap-x-4 gap-y-5'
            : 'flex-col items-start gap-5',
          className,
        )}
      >
        {items.map((item, itemIndex) => (
          <NavItemRow
            key={`${itemIndex}-${item.id}`}
            item={item}
            direction={direction}
            onNavigate={onNavigate}
            locale={locale}
          />
        ))}
      </ul>
    </nav>
  )
}

type NavItemRowProps = {
  item: NavItemView
  direction: 'row' | 'column'
  onNavigate: () => void
  locale: LocaleCode
}

function NavItemRow({ item, direction, onNavigate, locale }: NavItemRowProps) {
  const [nestedOpen, setNestedOpen] = useState(false)
  const hasChildren = item.children.length > 0

  const labelClassName =
    'text-foreground hover:text-primary inline-flex items-center text-xl leading-none font-medium tracking-tight lowercase transition-colors'

  const rowClassName = cn(
    'flex',
    direction === 'row' ? 'items-center gap-1' : 'flex-col items-start gap-1',
  )

  if (!hasChildren) {
    return (
      <li className={rowClassName}>
        <Link
          href={item.href}
          {...externalLinkProps(item)}
          onClick={onNavigate}
          {...(item.newTab || item.external
            ? {}
            : { transitionTypes: ['nav-forward'] as string[] })}
          className={labelClassName}
        >
          {item.label}
        </Link>
      </li>
    )
  }

  const closeNestedAndOuter = () => {
    setNestedOpen(false)
    onNavigate()
  }

  return (
    <li className={rowClassName}>
      <Drawer swipeDirection="down" open={nestedOpen} onOpenChange={setNestedOpen}>
        <DrawerTrigger
          render={(triggerProps) => (
            <Button
              {...triggerProps}
              type="button"
              variant="ghost"
              aria-label={`Open ${item.label} submenu`}
              className={cn(
                labelClassName,
                'm-0 cursor-pointer rounded-none border-0 border-none p-0 hover:bg-transparent',
              )}
            >
              <span>{item.label}</span>
            </Button>
          )}
        />
        <DrawerContent className="bg-background text-foreground mx-auto w-full items-center rounded-none py-5">
          <DrawerTitle className="sr-only">{item.label} submenu</DrawerTitle>
          <DrawerDescription className="sr-only">
            Items belonging to {item.label}.
          </DrawerDescription>
          <DrawerChrome
            onClose={closeNestedAndOuter}
            siteName={item.label}
            locale={locale}
            closeIcon={<IconChevronLeft className="size-5" />}
            closeLabel={`Back from ${item.label} submenu`}
          />
          <ul className="flex flex-col items-center gap-5">
            {item.children.map((child, childIndex) => (
              <NavChildLink
                key={`${item.id}-${childIndex}-${child.id}`}
                child={child}
                onNavigate={closeNestedAndOuter}
              />
            ))}
          </ul>
          <div className="text-primary mx-auto mt-5 h-4 w-20">
            <Barcode value="DESTINATION" className="h-full w-full" />
          </div>
        </DrawerContent>
      </Drawer>
    </li>
  )
}

type NavChildLinkProps = {
  child: NavChildView
  onNavigate: () => void
}

function NavChildLink({ child, onNavigate }: NavChildLinkProps) {
  return (
    <li>
      <Link
        href={child.href}
        {...externalLinkProps(child)}
        onClick={onNavigate}
        {...(child.newTab || child.external
          ? {}
          : { transitionTypes: ['nav-forward'] as string[] })}
        className="text-foreground hover:text-primary inline-flex items-center text-xl leading-none font-medium tracking-tight lowercase transition-colors"
      >
        {child.label}
      </Link>
    </li>
  )
}

type LocaleSwitcherProps = {
  currentLocale: LocaleCode
  targetPath: string
  onNavigate: () => void
}

function LocaleSwitcher({ currentLocale, targetPath, onNavigate }: LocaleSwitcherProps) {
  const targetLocale = LOCALES.find((l) => l.code !== currentLocale)
  if (!targetLocale) return null

  return (
    <Link
      href={targetPath}
      onClick={onNavigate}
      aria-label={`Switch language to ${targetLocale.label}`}
      className="text-foreground hover:text-primary mx-auto mt-5 items-center justify-center transition-colors"
    >
      <span className="text-xl leading-none font-medium tracking-tight lowercase">en/vi</span>
    </Link>
  )
}
