'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useReducedMotion } from 'motion/react'

import { BootReveal, useBootReveal } from '@/app/(frontend)/_components/providers/boot-reveal'

const ColorBends = dynamic(() => import('@/components/ui/color-bends'), {
  ssr: false,
})

// Match the CSS animation duration in styles.css (.boot-bg-fade-in). Kept here
// as a safety net: tabs that throttle animations may never fire `animationend`,
// so we also call `finish()` after this timeout to keep the boot sequence alive.
const BG_FADE_IN_DURATION_MS = 2000
const BG_FADE_IN_FALLBACK_MS = BG_FADE_IN_DURATION_MS + 400

function BackgroundEffect() {
  const {
    state: { phase },
    actions: { finish },
  } = useBootReveal()
  // Defer the Three.js chunk until the splash handoff reaches the background beat.
  const loadWebGL = phase === 'background' || phase === 'ready'
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Drive `finish()` off the keyframe's animationend so the timing lives in one place
  // (the CSS rule). When reduced motion is preferred or the tab throttles animations,
  // fall back to a setTimeout so the boot sequence never stalls on `background`.
  useEffect(() => {
    if (phase !== 'background') return
    if (reduceMotion) {
      finish()
      return
    }
    const el = ref.current
    if (!el) {
      // Element not mounted yet (rare): resolve on next microtask.
      const id = window.setTimeout(finish, 0)
      return () => window.clearTimeout(id)
    }
    let settled = false
    const settle = () => {
      if (settled) return
      settled = true
      finish()
    }
    const onEnd = () => settle()
    const fallbackId = window.setTimeout(settle, BG_FADE_IN_FALLBACK_MS)
    el.addEventListener('animationend', onEnd)
    return () => {
      el.removeEventListener('animationend', onEnd)
      window.clearTimeout(fallbackId)
    }
  }, [phase, finish, reduceMotion])

  return (
    <BootReveal.Effect>
      {loadWebGL ? (
        <div ref={ref} className="boot-bg-fade-in h-full w-full">
          <ColorBends
            colors={['#8BA876', '#5A7D4A', '#C5D4A8']}
            bandWidth={4}
            rotation={180}
            speed={0.03}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0.05}
            noise={0.12}
            parallax={0.15}
            iterations={1}
            intensity={2}
            fontSize={12}
            timeOffset={64}
            gridOpacity={0.2}
            transparent
            autoRotate={0}
          />
        </div>
      ) : null}
    </BootReveal.Effect>
  )
}

export function Background() {
  // Full-width page frame: rails sit on the page gutters.
  const railInset = 'var(--page-gutter)'

  return (
    <>
      {/* Solid plane always present so splash never reveals emptiness.
          ColorBends loads only after the splash content reveal. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-dvh w-full overflow-hidden bg-background"
      >
        <BackgroundEffect />
      </div>
      {/* Rails above header blur so L/R strokes aren't doubled or buried */}
      <BootReveal.Chrome>
        <div className="pointer-events-none fixed inset-0 z-[45]">
          <span
            className="dash-rail dash-rail-left absolute inset-y-0"
            style={{ left: railInset }}
          />
          <span
            className="dash-rail dash-rail-right absolute inset-y-0"
            style={{ right: railInset }}
          />
        </div>
      </BootReveal.Chrome>
    </>
  )
}
