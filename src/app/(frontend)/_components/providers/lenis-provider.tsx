'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ReactLenis, useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import type { LenisOptions } from 'lenis'

import 'lenis/dist/lenis.css'

/** Lower lerp + softer wheel = cinematic / portfolio scroll. */
const LENIS_OPTIONS: LenisOptions = {
  autoRaf: true,
  lerp: 0.07,
  wheelMultiplier: 0.8,
  touchMultiplier: 1.4,
  syncTouch: false,
  anchors: true,
}

function LenisRouteSync() {
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true })
  }, [pathname, lenis])

  return null
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return children
  }

  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <LenisRouteSync />
      {children}
    </ReactLenis>
  )
}
