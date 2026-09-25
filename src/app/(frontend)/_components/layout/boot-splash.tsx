'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import {
  BootReveal,
  SPLASH_EXIT_DURATION_S,
} from '@/app/(frontend)/_components/providers/boot-reveal'
import { SiteHeaderLogo } from '@/app/(frontend)/_components/layout/site-header-logo'
import Typewriter from '@/components/ui/typewriter'
import type { LocaleCode } from '@/lib/locales'

const GREETINGS = {
  en: "hi 🖐️, i'm tuantm. ",
  vi: 'xin chào 🖐️, mình là tuấn.',
} as const

const POST_TYPEWRITER_DELAY_MS = 1000

export function BootSplash({ locale }: { locale: LocaleCode }) {
  const reduceMotion = useReducedMotion()
  const { actions } = BootReveal.use()
  const actionsRef = useRef(actions)

  const [visible, setVisible] = useState(true)
  const [typewriterDone, setTypewriterDone] = useState(false)

  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  useEffect(() => {
    actionsRef.current.startSplash()
  }, [])

  // Hide shortly after typewriter completes so the full greeting can be read
  useEffect(() => {
    if (!typewriterDone) return
    const timer = window.setTimeout(() => setVisible(false), POST_TYPEWRITER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [typewriterDone])

  const exitDuration = reduceMotion ? 0.05 : SPLASH_EXIT_DURATION_S

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot-splash"
          className="boot-splash"
          role="status"
          aria-live="polite"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: exitDuration,
            ease: 'easeOut',
          }}
          onAnimationComplete={() => actionsRef.current.revealContent()}
        >
          <div className="boot-splash-inner flex w-max flex-col items-center gap-6">
            <SiteHeaderLogo siteName="tuantm" />
            <Typewriter
              text={GREETINGS[locale]}
              speed={60}
              loop={false}
              onComplete={() => setTypewriterDone(true)}
              className="text-md text-foreground/90 font-medium whitespace-pre lowercase"
              cursorChar="_"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
