'use client'

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react'
import { useLenis } from 'lenis/react'
import { motion, useReducedMotion } from 'motion/react'

export const SPLASH_EXIT_DURATION_S = 0.5
export const CONTENT_REVEAL_DURATION_S = 0.5
export const BG_REVEAL_DURATION_S = 1
export const REVEAL_EASE = 'easeIn'

const BOOT_READY_CLASS = 'boot-ready'

type BootPhase = 'idle' | 'splash' | 'content' | 'background' | 'ready'

type BootRevealState = {
  phase: BootPhase
}

type BootRevealActions = {
  startSplash: () => void
  revealContent: () => void
  revealBackground: () => void
  finish: () => void
}

type BootRevealContextValue = {
  state: BootRevealState
  actions: BootRevealActions
}

const BootRevealContext = createContext<BootRevealContextValue | null>(null)

/** Module store so grid tiles can subscribe without React context re-renders. */
let bootReadySnapshot = false
const bootReadyListeners = new Set<() => void>()

function publishBootReady(ready: boolean) {
  if (bootReadySnapshot === ready) return
  bootReadySnapshot = ready
  document.documentElement.classList.toggle(BOOT_READY_CLASS, ready)
  bootReadyListeners.forEach((listener) => listener())
}

function subscribeBootReady(onStoreChange: () => void) {
  bootReadyListeners.add(onStoreChange)
  return () => {
    bootReadyListeners.delete(onStoreChange)
  }
}

function getBootReadySnapshot() {
  return bootReadySnapshot
}

function getBootReadyServerSnapshot() {
  return false
}

/** True once splash content may animate in (content / background / ready). */
export function useBootReady() {
  return useSyncExternalStore(
    subscribeBootReady,
    getBootReadySnapshot,
    getBootReadyServerSnapshot,
  )
}

export function useBootReveal() {
  const value = use(BootRevealContext)
  if (!value) {
    throw new Error('BootReveal must be used within BootRevealProvider')
  }
  return value
}

function isBootReadyPhase(phase: BootPhase) {
  return phase === 'content' || phase === 'background' || phase === 'ready'
}

export function BootRevealProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<BootPhase>('idle')
  const reduceMotion = useReducedMotion()
  const lenis = useLenis()

  useEffect(() => {
    const root = document.documentElement
    publishBootReady(isBootReadyPhase(phase))

    if (phase === 'splash') {
      root.classList.add('boot-splash-active')
      lenis?.stop()
      return () => {
        root.classList.remove('boot-splash-active')
      }
    }

    root.classList.remove('boot-splash-active')
    if (isBootReadyPhase(phase)) {
      lenis?.start()
    }
  }, [phase, lenis])

  useEffect(() => {
    return () => {
      publishBootReady(false)
      document.documentElement.classList.remove('boot-splash-active')
    }
  }, [])

  const startSplash = useCallback(() => {
    setPhase('splash')
  }, [])

  const revealContent = useCallback(() => {
    setPhase(reduceMotion ? 'ready' : 'content')
  }, [reduceMotion])

  const revealBackground = useCallback(() => {
    setPhase((current) => (current === 'content' ? 'background' : current))
  }, [])

  const finish = useCallback(() => {
    setPhase((current) => (current === 'background' ? 'ready' : current))
  }, [])

  return (
    <BootRevealContext
      value={{
        state: { phase },
        actions: { startSplash, revealContent, revealBackground, finish },
      }}
    >
      {children}
    </BootRevealContext>
  )
}

export function BootRevealContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const {
    state: { phase },
    actions: { revealBackground },
  } = useBootReveal()
  const reduceMotion = useReducedMotion()
  const visible = isBootReadyPhase(phase)

  return (
    <motion.div
      className={className}
      initial={false}
      animate={visible ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: reduceMotion ? 0.05 : CONTENT_REVEAL_DURATION_S,
        ease: REVEAL_EASE,
      }}
      onAnimationComplete={() => {
        if (phase === 'content') revealBackground()
      }}
    >
      {children}
    </motion.div>
  )
}

/** Structural chrome (rails) — same beat as page content. */
export function BootRevealChrome({ children }: { children: React.ReactNode }) {
  const {
    state: { phase },
  } = useBootReveal()
  const reduceMotion = useReducedMotion()
  const visible = isBootReadyPhase(phase)

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={visible ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: reduceMotion ? 0.05 : CONTENT_REVEAL_DURATION_S,
        ease: REVEAL_EASE,
      }}
    >
      {children}
    </motion.div>
  )
}

/** Atmospheric background (ColorBends) — last beat on the timeline. */
export function BootRevealEffect({ children }: { children: React.ReactNode }) {
  const {
    state: { phase },
    actions: { finish },
  } = useBootReveal()
  const reduceMotion = useReducedMotion()
  const visible = phase === 'idle' || phase === 'background' || phase === 'ready'

  return (
    <motion.div
      className="h-full w-full"
      initial={false}
      animate={visible ? { opacity: 1 } : { opacity: 0 }}
      transition={{
        duration: reduceMotion ? 0.05 : BG_REVEAL_DURATION_S,
        ease: 'easeInOut',
      }}
      onAnimationComplete={() => {
        if (phase === 'background') finish()
      }}
    >
      {children}
    </motion.div>
  )
}

/** Client-only compound alias. Server Components must import named exports —
 *  RSC cannot resolve `BootReveal.Provider` as a client reference. */
export const BootReveal = {
  Provider: BootRevealProvider,
  Content: BootRevealContent,
  Chrome: BootRevealChrome,
  Effect: BootRevealEffect,
  use: useBootReveal,
  useReady: useBootReady,
}
