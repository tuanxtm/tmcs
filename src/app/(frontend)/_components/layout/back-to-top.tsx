'use client'

import { useSyncExternalStore } from 'react'
import { useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import { useBootReady } from '@/app/(frontend)/_components/providers/boot-reveal'
import { useLocale } from '@/app/(frontend)/_components/providers/locale'
import styles from './back-to-top.module.css'

function subscribeScroll(onStoreChange: () => void) {
  window.addEventListener('scroll', onStoreChange, { passive: true })
  window.addEventListener('resize', onStoreChange)
  return () => {
    window.removeEventListener('scroll', onStoreChange)
    window.removeEventListener('resize', onStoreChange)
  }
}

function getScrollSnapshot() {
  if (window.scrollY <= 0) return false
  const footer = document.querySelector('.page-blocks > footer')
  if (!footer) return true
  const { top, bottom } = footer.getBoundingClientRect()
  return top >= window.innerHeight || bottom <= 0
}

function getServerSnapshot() {
  return false
}

export function BackToTop() {
  const canShow = useSyncExternalStore(subscribeScroll, getScrollSnapshot, getServerSnapshot)
  const bootReady = useBootReady()
  const locale = useLocale()
  const lenis = useLenis()
  const reduceMotion = useReducedMotion()
  const label = locale === 'vi' ? 'VỀ ĐẦU TRANG' : 'BACK TO TOP'

  const visible = bootReady && canShow

  const scrollToTop = () => {
    if (lenis) lenis.scrollTo(0, { immediate: !!reduceMotion })
    else window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })
  }

  return (
    <button
      type="button"
      className={`${styles.button} bg-background/20 text-accent font-mono text-[0.625rem] leading-none font-medium tracking-[-0.015em] uppercase backdrop-blur-xs`}
      aria-label={label}
      aria-hidden={!visible}
      inert={!visible}
      data-visible={visible}
      onClick={scrollToTop}
    >
      <svg
        width="8"
        height="16"
        viewBox="0 0 12 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
      >
        <path d="M11 5v14M5 11l6-6" />
      </svg>
      <span className={styles.label} aria-hidden="true">
        {label.split(' ').map((word) => (
          <span key={word}>{word}</span>
        ))}
      </span>
    </button>
  )
}
