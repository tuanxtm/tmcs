'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import type { LenisOptions } from 'lenis'

import 'lenis/dist/lenis.css'

/** Lower lerp + softer wheel = cinematic / portfolio scroll. */
const LENIS_OPTIONS: LenisOptions = {
  autoRaf: true,
  lerp: 0.065,
  wheelMultiplier: 0.65,
  touchMultiplier: 1.4,
  syncTouch: false,
  anchors: true,
}

/**
 * Reads `usePathname()` and scrolls Lenis to the top on route changes.
 *
 * Cache Components (instant validation) calls `usePathname()` during the
 * prerender walk and throws "URL data usePathname() in a Client Component
 * outside of <Suspense>" for routes whose dynamic params aren't known at
 * prerender time (e.g. `/[slug]`). The validation pass walks client
 * components outside the React Suspense tree, so a nested `<Suspense>` here
 * is not sufficient — the call must be deferred to the client entirely.
 *
 * The scroll-to-top is a `useEffect` side effect with no UI, so rendering
 * this component on the server is unnecessary. `next/dynamic` with
 * `ssr: false` keeps the URL-data hook out of the prerender pass while
 * still mounting it as soon as React hydrates on the client.
 */
const LenisRouteSync = dynamic(
  () => import('./lenis-route-sync').then((m) => m.LenisRouteSync),
  { ssr: false },
)

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return children
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <Suspense fallback={null}>
        <LenisRouteSync />
      </Suspense>
      {children}
    </ReactLenis>
  )
}
