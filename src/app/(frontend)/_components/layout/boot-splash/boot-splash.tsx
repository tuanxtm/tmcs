'use client'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  BootReveal,
  SPLASH_EXIT_DURATION_S,
} from '@/app/(frontend)/_components/providers/boot-reveal'
import { SiteHeaderLogo } from '@/app/(frontend)/_components/layout/site-header-logo'
import type { LocaleCode } from '@/lib/locales'
import styles from './boot-splash.module.css'
import { cn } from '@/lib/utils'
const GREETINGS = {
  en: "hi 🖐️, i'm tuantm.",
  vi: 'xin chào 🖐️, mình là tuấn.',
} as const
const POST_TYPEWRITER_DELAY_MS = 1000
const TYPEWRITER_SPEED_MS = 60

function BootGreeting({ text, onComplete }: { text: string; onComplete: () => void }) {
  const lastCharacter = useRef<HTMLSpanElement>(null)
  const notifyComplete = useEffectEvent(onComplete)
  const characters = Array.from(
    new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
    ({ segment }) => segment,
  )
  useEffect(() => {
    let active = true
    // A finished animation still resolves when hydration attaches after typing.
    const animations = lastCharacter.current?.getAnimations() ?? []
    void Promise.all(animations.map((animation) => animation.finished)).then(
      () => {
        if (active) notifyComplete()
      },
      () => {},
    )
    return () => {
      active = false
    }
  }, [text])
  return (
    <div className={styles.text} data-boot-greeting>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className={styles.initialCursor}>
        _
      </span>
      {characters.map((character, index) => (
        <span key={index} aria-hidden="true" className={styles.character}>
          <span
            ref={index === characters.length - 1 ? lastCharacter : undefined}
            className={styles.ink}
            style={{ animationDuration: `${(index + 1) * TYPEWRITER_SPEED_MS}ms` }}
          >
            {character}
          </span>
          <span
            className={styles.cursor}
            style={{ animationDuration: `${(index + 1) * TYPEWRITER_SPEED_MS}ms` }}
          >
            <span
              className={index === characters.length - 1 ? styles.finalCursor : styles.cursorInk}
              style={
                index === characters.length - 1
                  ? undefined
                  : {
                      animationDuration: `${(index + 2) * TYPEWRITER_SPEED_MS}ms`,
                    }
              }
            >
              _
            </span>
          </span>
        </span>
      ))}
    </div>
  )
}

export function BootSplash({ locale }: { locale: LocaleCode }) {
  const reduceMotion = useReducedMotion()
  const { actions } = BootReveal.use()
  const actionsRef = useRef(actions)
  const [visible, setVisible] = useState(true)
  const [typewriterDone, setTypewriterDone] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  useEffect(() => {
    actionsRef.current = actions
  }, [actions])
  useEffect(() => {
    actionsRef.current.startSplash()
    const onLoad = () => setPageLoaded(true)
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [])
  // Loading only gates dismissal; the greeting and logo animate independently.
  useEffect(() => {
    if (!typewriterDone || !pageLoaded) return
    const timer = window.setTimeout(() => setVisible(false), POST_TYPEWRITER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [typewriterDone, pageLoaded])
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
            <BootGreeting text={GREETINGS[locale]} onComplete={() => setTypewriterDone(true)} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
