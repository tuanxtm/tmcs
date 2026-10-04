'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import { useLocale } from '@/app/(frontend)/_components/providers/locale'
import { cn } from '@/lib/utils'

const CURSOR_ATTR = 'data-cursor-popup'

const CONFIG = {
  // Per-element offset (in px) relative to the cursor hot-spot.
  // POSITIVE = right/down, NEGATIVE = left/up.
  CROSS: { X: -4, Y: -4 },
  POPUP: { X: -10, Y: 4 },
  // Spring tuning (shared by the crosshair and the popup follower).
  SPRING: { STIFFNESS: 900, DAMPING: 50, MASS: 0.2 },
  // Popup reveal delay after entering a marked region.
  SHOW_DELAY_MS: 1000,
  // Stacking order.
  CROSS_Z: 'z-[-1]',
  POPUP_Z: 'z-[2147483647]',
}

function subscribeFinePointer(onStoreChange: () => void) {
  const media = window.matchMedia('(pointer: fine)')
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getFinePointerSnapshot() {
  return window.matchMedia('(pointer: fine)').matches
}

function getFinePointerServerSnapshot() {
  return false
}

function labelFromPoint(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y)
  if (!el) return null
  const host = el.closest(`[${CURSOR_ATTR}]`)
  if (!host) return null
  const label = host.getAttribute(CURSOR_ATTR)?.trim()
  return label || null
}

/**
 * Full-viewport crosshair under all content. Renders two thin lines that
 * intersect at the cursor point and track mouse/pen movement with a spring.
 * Sits at z-0 so every page element paints on top of it.
 */
function CursorCrosshair() {
  const reduceMotion = useReducedMotion()

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const { STIFFNESS, DAMPING, MASS } = CONFIG.SPRING
  const springX = useSpring(rawX, { stiffness: STIFFNESS, damping: DAMPING, mass: MASS })
  const springY = useSpring(rawY, { stiffness: STIFFNESS, damping: DAMPING, mass: MASS })
  const x = reduceMotion ? rawX : springX
  const y = reduceMotion ? rawY : springY
  const horizontalTransform = useMotionTemplate`translate3d(0, ${y}px, 0)`
  const verticalTransform = useMotionTemplate`translate3d(${x}px, 0, 0)`

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      rawX.set(event.clientX + CONFIG.CROSS.X)
      rawY.set(event.clientY + CONFIG.CROSS.Y)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [rawX, rawY])

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 hidden md:block', CONFIG.CROSS_Z)}
      data-cursor-cross-root
    >
      <motion.div
        className="bg-foreground/20 absolute top-0 left-0 h-px w-full will-change-transform"
        style={{ transform: horizontalTransform }}
      />
      <motion.div
        className="bg-foreground/20 absolute top-0 left-0 h-full w-px will-change-transform"
        style={{ transform: verticalTransform }}
      />
    </div>
  )
}

/**
 * Site-wide cursor follower. Mount once in the frontend layout.
 * Sections opt in with `data-cursor-popup="Message"`.
 * Hidden on touch/coarse pointers and outside marked regions.
 */
export function CursorPopup() {
  const enabled = useSyncExternalStore(
    subscribeFinePointer,
    getFinePointerSnapshot,
    getFinePointerServerSnapshot,
  )
  const reduceMotion = useReducedMotion()
  const locale = useLocale()
  const isVi = locale === 'vi'
  const [visible, setVisible] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  const shownLabelRef = useRef<string | null>(null)
  const pendingLabelRef = useRef<string | null>(null)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const anchorX = useMotionValue(0)
  const anchorY = useMotionValue(0)
  const { STIFFNESS, DAMPING, MASS } = CONFIG.SPRING
  const springX = useSpring(anchorX, { stiffness: STIFFNESS, damping: DAMPING, mass: MASS })
  const springY = useSpring(anchorY, { stiffness: STIFFNESS, damping: DAMPING, mass: MASS })
  const x = reduceMotion ? anchorX : springX
  const y = reduceMotion ? anchorY : springY
  const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`

  useEffect(() => {
    if (!enabled) return

    const clearShowTimer = () => {
      if (showTimerRef.current != null) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
    }

    const hidePopup = () => {
      clearShowTimer()
      pendingLabelRef.current = null
      shownLabelRef.current = null
      setVisible(false)
      setLabel(null)
    }

    const showLabel = (next: string) => {
      pendingLabelRef.current = null
      shownLabelRef.current = next
      setLabel(next)
      setVisible(true)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return

      // Anchor (anchorX, anchorY) at the cursor hot-spot. The inner wrapper is
      // translated by -100% of its width so the bubble's RIGHT edge sits at
      // (cursorX + X) and it extends leftward (opposite the cursor's approach).
      anchorX.set(event.clientX + CONFIG.POPUP.X)
      anchorY.set(event.clientY + CONFIG.POPUP.Y)

      const next = labelFromPoint(event.clientX, event.clientY)
      if (!next) {
        if (shownLabelRef.current || pendingLabelRef.current) hidePopup()
        return
      }

      // Already visible with this label - keep tracking only.
      if (shownLabelRef.current === next) return

      // Already waiting to show this label.
      if (pendingLabelRef.current === next) return

      // Switching sections while already visible - reveal immediately.
      if (shownLabelRef.current) {
        clearShowTimer()
        showLabel(next)
        return
      }

      // First appear - wait before revealing.
      clearShowTimer()
      pendingLabelRef.current = next
      showTimerRef.current = setTimeout(() => {
        showTimerRef.current = null
        if (pendingLabelRef.current === next) showLabel(next)
      }, CONFIG.SHOW_DELAY_MS)
    }

    const onPointerLeave = () => {
      hidePopup()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    return () => {
      clearShowTimer()
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [enabled, anchorX, anchorY])

  if (!enabled) return null

  return (
    <>
      <CursorCrosshair />
      <div
        aria-hidden="true"
        className={cn('pointer-events-none fixed inset-0 hidden md:block', CONFIG.POPUP_Z)}
        data-cursor-popup-root
      >
        <motion.div className="absolute top-0 left-0 will-change-transform" style={{ transform }}>
          <div className="-translate-x-full will-change-transform">
            <AnimatePresence mode="wait">
              {visible && label ? (
                <motion.div
                  key={label}
                  className={cn(
                    'text-accent overflow-hidden whitespace-nowrap',
                    'bg-background',
                    isVi ? 'px-0.75 pt-1 pb-0.75' : 'p-0.75',
                    'font-mono text-[0.625rem] leading-none font-medium tracking-[-0.015em] uppercase',
                    'border-accent border',
                  )}
                  initial={reduceMotion ? false : { clipPath: 'inset(0 50% 0 50%)' }}
                  animate={{ clipPath: 'inset(0 0% 0 0%)' }}
                  exit={reduceMotion ? undefined : { clipPath: 'inset(0 50% 0 50%)' }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                  data-cursor-popup-bubble
                >
                  {label}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}
