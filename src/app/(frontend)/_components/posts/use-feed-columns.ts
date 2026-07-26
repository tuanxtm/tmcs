'use client'

import { useSyncExternalStore } from 'react'

import {
  DESKTOP_COLUMNS,
  MOBILE_COLUMNS,
  TABLET_COLUMNS,
} from '@/app/(frontend)/_lib/feed-packer'

const TABLET_QUERY = '(min-width: 768px)'
const DESKTOP_QUERY = '(min-width: 1024px)'

function readBreakpointColumns(): number {
  if (typeof window === 'undefined') return MOBILE_COLUMNS
  if (window.matchMedia(DESKTOP_QUERY).matches) return DESKTOP_COLUMNS
  if (window.matchMedia(TABLET_QUERY).matches) return TABLET_COLUMNS
  return MOBILE_COLUMNS
}

function subscribeBreakpoint(onStoreChange: () => void): () => void {
  const tablet = window.matchMedia(TABLET_QUERY)
  const desktop = window.matchMedia(DESKTOP_QUERY)
  tablet.addEventListener('change', onStoreChange)
  desktop.addEventListener('change', onStoreChange)
  return () => {
    tablet.removeEventListener('change', onStoreChange)
    desktop.removeEventListener('change', onStoreChange)
  }
}

function getServerSnapshot(): number {
  return MOBILE_COLUMNS
}

/**
 * SSR-safe active bento column count matching Tailwind md/lg breakpoints.
 * Server + first client render use mobile columns; client then upgrades.
 */
export function useFeedColumns(): number {
  return useSyncExternalStore(subscribeBreakpoint, readBreakpointColumns, getServerSnapshot)
}
