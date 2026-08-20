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
import { cn } from '@/lib/utils'

const CURSOR_ATTR = 'data-cursor-popup'
const OFFSET_X = 16
const OFFSET_Y = 18
const SHOW_DELAY_MS = 1000

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
  const [visible, setVisible] = useState(false)
  const [label, setLabel] = useState<string | null>(null)

  const shownLabelRef = useRef<string | null>(null)
  const pendingLabelRef = useRef<string | null>(null)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 520, damping: 38, mass: 0.4 })
  const springY = useSpring(rawY, { stiffness: 520, damping: 38, mass: 0.4 })
  const x = reduceMotion ? rawX : springX
  const y = reduceMotion ? rawY : springY
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

      rawX.set(event.clientX + OFFSET_X)
      rawY.set(event.clientY + OFFSET_Y)

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
      }, SHOW_DELAY_MS)
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
  }, [enabled, rawX, rawY])

  if (!enabled) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-60 hidden md:block"
      data-cursor-popup-root
    >
      <motion.div className="absolute top-0 left-0 will-change-transform" style={{ transform }}>
        <AnimatePresence mode="wait">
          {visible && label ? (
            <motion.div
              key={label}
              className={cn(
                'text-background overflow-hidden text-xs leading-none font-medium tracking-tight whitespace-nowrap',
                'bg-primary px-1 pt-0.5 pb-0.75',
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
      </motion.div>
    </div>
  )
}
