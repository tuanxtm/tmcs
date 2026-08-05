'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import {
  BootReveal,
  SPLASH_EXIT_DURATION_S,
} from '@/app/(frontend)/_components/providers/boot-reveal'
import type { LocaleCode } from '@/lib/locales'

const GREETINGS = {
  en: "hi 🖐️, i'm tuantm. ",
  vi: 'xin chào 🖐️, mình là tuấn.',
} as const

const STATUS = {
  en: { loading: 'Loading', done: 'Loading complete' },
  vi: { loading: 'Đang tải', done: 'Tải xong' },
} as const

const INTRO_MS = 600 // duration + stagger, matches CSS
const FILL_DURATION_MS = 1500

/** Bar width tracks the greeting’s monospace columns (emoji count as 2). */
const graphemeSegmenter = new Intl.Segmenter(undefined, {
  granularity: 'grapheme',
})

function visualWidth(value: string): number {
  let width = 0
  for (const { segment } of graphemeSegmenter.segment(value)) {
    width += /\p{Extended_Pictographic}/u.test(segment) ? 2 : 1
  }
  return width
}

function consoleBarSlots(greeting: string): number {
  return Math.max(1, visualWidth(greeting) - 6)
}

function barText(filled: number, slotCount: number): string {
  let slots = ''
  for (let i = 0; i < slotCount; i++) {
    slots += i < filled ? '#' : '_'
  }
  return `[${slots}]`
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function BootSplash({ locale }: { locale: LocaleCode }) {
  const reduceMotion = useReducedMotion()
  const { actions } = BootReveal.use()
  const actionsRef = useRef(actions)
  const barRef = useRef<HTMLParagraphElement>(null)

  const greeting = GREETINGS[locale]
  const status = STATUS[locale]
  const slotCount = consoleBarSlots(greeting)

  const [visible, setVisible] = useState(true)
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  useEffect(() => {
    actionsRef.current.startSplash()

    const writeBar = (filled: number) => {
      if (barRef.current) barRef.current.textContent = barText(filled, slotCount)
    }

    if (reduceMotion) {
      writeBar(slotCount)
      const timer = window.setTimeout(() => {
        setBusy(false)
        setVisible(false)
        actionsRef.current.revealContent()
      }, 50)
      return () => window.clearTimeout(timer)
    }

    let frame = 0
    let start = 0
    let lastFilled = -1
    const startTimer = window.setTimeout(() => {
      start = performance.now()

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / FILL_DURATION_MS)
        const filled = Math.round(easeOutCubic(progress) * slotCount)
        if (filled !== lastFilled) {
          lastFilled = filled
          writeBar(filled)
        }

        if (progress < 1) {
          frame = window.requestAnimationFrame(tick)
          return
        }

        writeBar(slotCount)
        setBusy(false)
        setVisible(false)
      }

      frame = window.requestAnimationFrame(tick)
    }, INTRO_MS)

    return () => {
      window.clearTimeout(startTimer)
      window.cancelAnimationFrame(frame)
    }
  }, [reduceMotion, slotCount])

  const exitDuration = reduceMotion ? 0.05 : SPLASH_EXIT_DURATION_S
  const lineExit = reduceMotion ? { opacity: 0 } : { y: '-100%' }
  const lineInitial = reduceMotion ? { opacity: 0 } : { y: '100%' }
  const lineTransition = {
    duration: exitDuration,
    ease: 'easeOut' as const,
  }

  return (
    <AnimatePresence onExitComplete={() => actionsRef.current.revealContent()}>
      {visible ? (
        <motion.div
          key="boot-splash"
          className="boot-splash"
          role="status"
          aria-live="polite"
          aria-busy={busy}
          aria-label={busy ? status.loading : status.done}
          initial={false}
          animate={{ opacity: 1 }}
          // Keep the solid backdrop until the clipped lines finish rolling up.
          exit={{ opacity: 1 }}
          transition={{
            duration: exitDuration,
            ease: 'easeOut',
          }}
        >
          <div className="boot-splash-inner flex w-max flex-col gap-2">
            <div className="boot-splash-line boot-splash-greeting-wrap">
              <motion.p
                className="boot-splash-greeting text-md whitespace-pre font-medium lowercase tracking-tight text-foreground/90"
                initial={lineInitial}
                animate={{ y: 0, opacity: 1 }}
                exit={lineExit}
                transition={lineTransition}
              >
                {greeting}
              </motion.p>
            </div>
            <div className="boot-splash-line boot-splash-bar-wrap">
              <motion.div
                initial={lineInitial}
                animate={{ y: 0, opacity: 1 }}
                exit={lineExit}
                transition={lineTransition}
              >
                <p
                  ref={barRef}
                  aria-hidden="true"
                  className="boot-splash-bar font-mono text-sm lowercase tracking-normal text-foreground/90 whitespace-pre"
                >
                  {barText(0, slotCount)}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
