'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import {
  BootReveal,
  SPLASH_EXIT_DURATION_S,
} from '@/app/(frontend)/_components/providers/boot-reveal'
import type { LocaleCode } from '@/lib/locales'

function subscribeClientReady() {
  return () => {}
}

function getClientReadySnapshot() {
  return true
}

function getServerReadySnapshot() {
  return false
}

const GREETINGS = {
  en: "hi 🖐️, i'm tuantm. ",
  vi: 'xin chào 🖐️, mình là tuantm.',
} as const

const STATUS = {
  en: { loading: 'Loading', done: 'Loading complete' },
  vi: { loading: 'Đang tải', done: 'Tải xong' },
} as const

const INTRO_MS = 600 // duration + stagger, matches CSS
const FILL_DURATION_MS = 1200

/** Bar width tracks the greeting’s visible glyphs (emoji collapsed out). */
function consoleBarSlots(greeting: string): number {
  const stripped = greeting
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/\u200D/g, '')
  return Math.max(1, [...stripped].length - 3)
}

function barText(filled: number, slotCount: number): string {
  let slots = ''
  for (let i = 0; i < slotCount; i++) {
    slots += i < filled ? '#' : '-'
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
  const jsReady = useSyncExternalStore(
    subscribeClientReady,
    getClientReadySnapshot,
    getServerReadySnapshot,
  )

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
  const barDelay = reduceMotion ? 0 : 0.08
  const lineExit = reduceMotion ? { opacity: 0 } : { y: '-100%' }
  const lineTransition = {
    duration: exitDuration,
    ease: 'easeOut' as const,
  }

  return (
    <AnimatePresence onExitComplete={() => actionsRef.current.revealContent()}>
      {visible ? (
        <motion.div
          key="boot-splash"
          className={jsReady ? 'boot-splash boot-splash--js' : 'boot-splash'}
          role="status"
          aria-live="polite"
          aria-busy={busy}
          aria-label={busy ? status.loading : status.done}
          initial={false}
          // Keep the solid backdrop until the clipped lines finish rolling up.
          exit={{ opacity: 1 }}
          transition={{
            duration: exitDuration + barDelay,
            ease: 'easeOut',
          }}
        >
          <div className="boot-splash-inner flex w-max flex-col gap-2">
            <div className="boot-splash-line boot-splash-greeting-wrap">
              <motion.p
                className="boot-splash-greeting text-md whitespace-pre font-medium lowercase tracking-tight text-foreground/90"
                exit={lineExit}
                transition={lineTransition}
              >
                {greeting}
              </motion.p>
            </div>
            <div className="boot-splash-line boot-splash-bar-wrap">
              <motion.div exit={lineExit} transition={{ ...lineTransition, delay: barDelay }}>
                <p
                  ref={barRef}
                  aria-hidden="true"
                  className="boot-splash-bar font-mono text-sm lowercase tracking-tight text-foreground/90 whitespace-pre"
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
