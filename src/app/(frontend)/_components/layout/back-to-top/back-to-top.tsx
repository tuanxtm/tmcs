'use client'
import { useSyncExternalStore } from 'react'
import { useLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import { IconArrowUpLeft } from '@tabler/icons-react'
import { useBootReady } from '@/app/(frontend)/_components/providers/boot-reveal'
import { useLocale } from '@/app/(frontend)/_components/providers/locale'
import styles from './back-to-top.module.css'
import { cn } from '@/lib/utils'
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
      className={cn(styles.button, styles.appearance)}
      aria-label={label}
      aria-hidden={!visible}
      inert={!visible}
      data-visible={visible}
      onClick={scrollToTop}
    >
      <IconArrowUpLeft size={16} aria-hidden="true" />
      <span className={styles.label} aria-hidden="true">
        {label.split(' ').map((word) => (
          <span key={word}>{word}</span>
        ))}
      </span>
    </button>
  )
}
