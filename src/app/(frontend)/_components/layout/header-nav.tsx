'use client'

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconArrowRight, IconMenu2, IconMinus } from '@tabler/icons-react'
import { externalLinkProps } from '@/app/(frontend)/_lib/link-props'
import { switchLocalePath } from '@/app/(frontend)/_lib/locale'
import type { NavItemView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'
import styles from './site-header.module.css'

type HeaderNavProps = { items: NavItemView[]; locale: LocaleCode; className?: string }

export function HeaderNav({ items, locale, className }: HeaderNavProps) {
  const pathname = usePathname()
  const routeKey = `${locale}:${pathname}`
  const [state, setState] = useState({ routeKey, open: false, submenu: null as string | null })
  if (state.routeKey !== routeKey) {
    setState({ routeKey, open: false, submenu: null })
  }
  const open = state.routeKey === routeKey && state.open
  const submenu = state.routeKey === routeKey ? state.submenu : null
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const submenuTriggers = useRef(new Map<string, HTMLAnchorElement>())
  const submenuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const panelId = useId()
  const isVi = locale === 'vi'
  const cancelSubmenuClose = useCallback(() => {
    if (submenuCloseTimer.current) clearTimeout(submenuCloseTimer.current)
    submenuCloseTimer.current = null
  }, [])
  const close = () => {
    cancelSubmenuClose()
    setState({ routeKey, open: false, submenu: null })
  }

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const reset = () => {
      cancelSubmenuClose()
      setState({ routeKey, open: false, submenu: null })
    }
    media.addEventListener('change', reset)
    return () => {
      cancelSubmenuClose()
      media.removeEventListener('change', reset)
    }
  }, [cancelSubmenuClose, routeKey])

  useEffect(() => {
    if (!open && !submenu) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        cancelSubmenuClose()
        setState({ routeKey, open: false, submenu: null })
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      cancelSubmenuClose()
      if (submenu) {
        setState({ routeKey, open, submenu: null })
        submenuTriggers.current.get(submenu)?.focus()
      } else {
        setState({ routeKey, open: false, submenu: null })
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [cancelSubmenuClose, open, submenu, routeKey])

  return (
    <div
      ref={rootRef}
      className={cn(styles.navigation, className)}
      style={{ '--site-nav-cell-count': items.length + 1 } as CSSProperties}
      data-open={open}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cn(styles.menuTrigger, 'site-cell-hover')}
        aria-label={isVi ? (open ? 'Đóng menu' : 'Mở menu') : open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setState({ routeKey, open: !open, submenu: null })}
      >
        {open ? <IconMinus aria-hidden="true" /> : <IconMenu2 aria-hidden="true" />}
      </button>
      <nav
        id={panelId}
        className={styles.panel}
        aria-label={isVi ? 'Điều hướng chính' : 'Primary'}
        data-lenis-prevent
      >
        <ul className={styles.navList}>
          <li className={styles.localeCell}>
            <Link
              href={switchLocalePath(pathname ?? '/', isVi ? 'en' : 'vi')}
              aria-label={isVi ? 'Switch language to English' : 'Switch language to Vietnamese'}
              className={cn(styles.navLink, 'site-cell-hover')}
              onClick={close}
            >
              EN/VI
            </Link>
          </li>
          {items.map((item, index) => {
            const expanded = submenu === item.id
            const childId = `${panelId}-${index}`
            const final = index === items.length - 1
            const hasChildren = item.children.length > 0
            return (
              <li
                key={item.id}
                className={styles.navItem}
                data-final={final}
                onPointerEnter={(event) => {
                  if (
                    hasChildren &&
                    event.pointerType === 'mouse' &&
                    window.matchMedia('(min-width: 1024px)').matches
                  ) {
                    cancelSubmenuClose()
                    setState({ routeKey, open, submenu: item.id })
                  }
                }}
                onPointerLeave={(event) => {
                  if (
                    hasChildren &&
                    window.matchMedia('(min-width: 1024px)').matches &&
                    !event.currentTarget.contains(document.activeElement)
                  ) {
                    cancelSubmenuClose()
                    submenuCloseTimer.current = setTimeout(() => {
                      setState((current) =>
                        current.submenu === item.id ? { ...current, submenu: null } : current,
                      )
                      submenuCloseTimer.current = null
                    }, 120)
                  }
                }}
                onBlur={(event) => {
                  if (
                    hasChildren &&
                    window.matchMedia('(min-width: 1024px)').matches &&
                    !event.currentTarget.contains(event.relatedTarget)
                  ) {
                    cancelSubmenuClose()
                    setState((current) =>
                      current.submenu === item.id ? { ...current, submenu: null } : current,
                    )
                  }
                }}
              >
                <div className={styles.navRow}>
                  <Link
                    ref={(element) => {
                      if (hasChildren && element) submenuTriggers.current.set(item.id, element)
                      else submenuTriggers.current.delete(item.id)
                    }}
                    href={item.href}
                    {...externalLinkProps(item)}
                    {...(item.external || item.newTab ? {} : { transitionTypes: ['nav-forward'] })}
                    className={cn(styles.navLink, 'site-cell-hover')}
                    aria-expanded={hasChildren ? expanded : undefined}
                    aria-controls={hasChildren ? childId : undefined}
                    data-expanded={expanded}
                    onClick={(event) => {
                      if (
                        hasChildren &&
                        !window.matchMedia('(min-width: 1024px)').matches &&
                        !event.metaKey &&
                        !event.ctrlKey &&
                        !event.shiftKey &&
                        !event.altKey
                      ) {
                        event.preventDefault()
                        setState({ routeKey, open, submenu: expanded ? null : item.id })
                      } else close()
                    }}
                    onKeyDown={(event) => {
                      if (!hasChildren || (event.key !== 'ArrowDown' && event.key !== ' ')) return
                      event.preventDefault()
                      cancelSubmenuClose()
                      setState({ routeKey, open, submenu: item.id })
                      requestAnimationFrame(() => {
                        document.getElementById(childId)?.querySelector('a')?.focus()
                      })
                    }}
                  >
                    {item.label}
                    {hasChildren ? (
                      <span className={styles.corner} aria-hidden="true" />
                    ) : final ? (
                      <IconArrowRight className={styles.arrow} aria-hidden="true" />
                    ) : null}
                  </Link>
                </div>
                {hasChildren ? (
                  <ul
                    id={childId}
                    className={styles.submenu}
                    data-expanded={expanded}
                    aria-hidden={!expanded}
                    inert={!expanded}
                  >
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          {...externalLinkProps(child)}
                          {...(child.external || child.newTab
                            ? {}
                            : { transitionTypes: ['nav-forward'] })}
                          className={cn(styles.childLink, 'site-cell-hover')}
                          onClick={close}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
