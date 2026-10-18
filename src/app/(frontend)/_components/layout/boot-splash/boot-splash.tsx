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
import styles from './boot-splash.module.css'
import { cn } from '@/lib/utils'
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
    <AnimatePresence onExitComplete={() => actionsRef.current.revealContent()}>
      {visible && (
        <motion.div
          key="boot-splash"
          className={cn(styles.root, 'boot-splash')}
          role="status"
          aria-live="polite"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: exitDuration,
            ease: 'easeOut',
          }}
        >
          <div className={styles.content}>
            <SiteHeaderLogo siteName="tuantm" />
            <Typewriter
              text={GREETINGS[locale]}
              speed={60}
              loop={false}
              onComplete={() => setTypewriterDone(true)}
              className={styles.text}
              cursorChar="_"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
