'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { IconMenu2, IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet'
import { externalLinkProps } from '@/app/(frontend)/_lib/link-props'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type HeaderNavProps = {
  items: NavItemView[]
  className?: string
}

const DESKTOP_LABEL = 'DESTINATION'
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

function subscribeDesktopMedia(onStoreChange: () => void) {
  const mq = window.matchMedia(DESKTOP_MEDIA_QUERY)
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

function getIsDesktopSnapshot() {
  return window.matchMedia(DESKTOP_MEDIA_QUERY).matches
}

function getIsDesktopServerSnapshot() {
  return false
}

export function HeaderNav({ items, className }: HeaderNavProps) {
  const [open, setOpen] = useState(false)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const reduceMotion = useReducedMotion()
  const isDesktop = useSyncExternalStore(
    subscribeDesktopMedia,
    getIsDesktopSnapshot,
    getIsDesktopServerSnapshot,
  )

  const pausedLenisRef = useRef(false)

  // Close the menu automatically if the viewport grows past the desktop
  // breakpoint while it's open - keeping the Sheet mounted in this case
  // would otherwise dim the desktop chrome.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA_QUERY)
    const handler = () => {
      if (mq.matches) setOpen(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Pause Lenis while the drawer is open on mobile. The Sheet locks <body>,
  // but Lenis still owns the wheel via its own RAF loop and would otherwise
  // scroll the page underneath the drawer.
  useEffect(() => {
    if (!lenis) return
    if (open && !isDesktop && !pausedLenisRef.current) {
      lenis.stop()
      pausedLenisRef.current = true
    } else if ((!open || isDesktop) && pausedLenisRef.current) {
      lenis.start()
      pausedLenisRef.current = false
    }
  }, [lenis, open, isDesktop])

  // Safety net: if the nav unmounts while open, restore Lenis.
  useEffect(() => {
    return () => {
      if (pausedLenisRef.current) {
        lenis?.start()
        pausedLenisRef.current = false
      }
    }
  }, [lenis])

  // Desktop only: close on click outside or Escape. On mobile the Sheet
  // handles those via its overlay + Radix focus trap.
  useEffect(() => {
    if (!open || !isDesktop) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (toggleButtonRef.current?.contains(target)) return
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, isDesktop])

  if (items.length === 0) return null

  return (
    <div className={cn('flex items-center', className)}>
      <Button
        ref={toggleButtonRef}
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="site-header-nav-panel"
        onClick={() => setOpen((value) => !value)}
        className="rounded-none border-none text-foreground hover:bg-transparent hover:text-foreground/80"
      >
        <IconMenu2 aria-hidden="true" className="size-4" />
      </Button>

      {!isDesktop ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="page-frame left-auto right-0 w-full! max-w-none! bg-background text-foreground p-2 gap-4"
          >
            <div className="flex items-center justify-between h-(--header-height)">
              <span className="text-[13px] font-semibold uppercase tracking-tight">
                {DESKTOP_LABEL}
              </span>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close menu"
                  className="rounded-none border-none text-foreground hover:bg-transparent hover:text-foreground/80"
                >
                  <IconX aria-hidden="true" className="size-4" />
                </Button>
              </SheetClose>
            </div>
            <div className="dash-line-b" />
            <NavList items={items} direction="column" onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      ) : null}

      {/* Desktop panel - sits flush under the site header. */}
      <AnimatePresence>
        {open && isDesktop ? (
          <motion.div
            id="site-header-nav-panel"
            ref={panelRef}
            key="header-nav-panel"
            role="region"
            aria-label={DESKTOP_LABEL}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex absolute inset-x-0 top-full h-(--header-height) bg-background dash-line-b items-center justify-between px-2 z-30"
          >
            <span className="text-[13px] font-semibold uppercase tracking-tight text-foreground">
              {DESKTOP_LABEL}
            </span>
            <NavList items={items} direction="row" onNavigate={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
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
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              'flex',
              direction === 'row' ? 'items-center gap-1' : 'flex-col items-start gap-1',
            )}
          >
            <Link
              href={item.href}
              {...externalLinkProps(item)}
              onClick={onNavigate}
              className="inline-flex items-center text-sm font-semibold leading-none uppercase tracking-tight text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
            {item.children.length > 0
              ? item.children.map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    {...externalLinkProps(child)}
                    onClick={onNavigate}
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
