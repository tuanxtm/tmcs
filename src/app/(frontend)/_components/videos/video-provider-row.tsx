'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'

import { VideoRowCard } from '@/app/(frontend)/_components/videos/video-row-card'
import { useBootReady } from '@/app/(frontend)/_components/providers/boot-reveal'
import type { VideoCardView, VideoProvider } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

import styles from './videos.module.css'

const ENTER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const TWO_PX_TOLERANCE = 2
const STAGGER_PER_ITEM_MS = 40
/** Stagger cap of 4 keeps the last card's delay under the 160ms budget. */
const STAGGER_INDEX_CAP = 4

type VideoProviderRowProps = {
  provider: VideoProvider
  label: string
  cards: VideoCardView[]
  locale: 'en' | 'vi'
  cursorPopupItem?: string | null
  activeYouTubeId: number | null
  onActivateYouTubeAction: (id: number | null) => void
}

export function VideoProviderRow({
  provider,
  label,
  cards,
  locale,
  cursorPopupItem,
  activeYouTubeId,
  onActivateYouTubeAction,
}: VideoProviderRowProps) {
  const reduceMotion = useReducedMotion()
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)
  const headingId = useId()
  const regionId = useId()

  const updateBoundaries = useCallback(() => {
    const node = scrollerRef.current
    if (!node) {
      setCanPrev(false)
      setCanNext(false)
      return
    }
    const { scrollLeft, scrollWidth, clientWidth } = node
    const max = scrollWidth - clientWidth
    if (max <= TWO_PX_TOLERANCE) {
      setCanPrev(false)
      setCanNext(false)
      return
    }
    setCanPrev(scrollLeft > TWO_PX_TOLERANCE)
    setCanNext(scrollLeft < max - TWO_PX_TOLERANCE)
  }, [])

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    updateBoundaries()
    const onScroll = () => updateBoundaries()
    node.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => updateBoundaries())
    ro.observe(node)
    Array.from(node.children).forEach((child) => {
      if (child instanceof HTMLElement) ro.observe(child)
    })
    observerRef.current = ro
    return () => {
      node.removeEventListener('scroll', onScroll)
      ro.disconnect()
      observerRef.current = null
    }
  }, [updateBoundaries, cards.length])

  const scrollByOneCard = useCallback(
    (direction: 1 | -1) => {
      const node = scrollerRef.current
      if (!node) return
      const first = node.querySelector<HTMLElement>('[data-video-card]')
      if (!first) return
      const cardWidth = first.getBoundingClientRect().width
      const computed = getComputedStyle(node)
      const gap = parseFloat(computed.columnGap || computed.gap || '0') || 0
      const delta = (cardWidth + gap) * direction
      node.scrollBy({
        left: delta,
        behavior: reduceMotion ? 'auto' : 'smooth',
      })
    },
    [reduceMotion],
  )

  const handlePrev = useCallback(() => scrollByOneCard(-1), [scrollByOneCard])
  const handleNext = useCallback(() => scrollByOneCard(1), [scrollByOneCard])

  const handleRegionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null
      if (target && target !== event.currentTarget) {
        if (
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        scrollByOneCard(1)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        scrollByOneCard(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        scrollerRef.current?.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
      } else if (event.key === 'End') {
        event.preventDefault()
        const node = scrollerRef.current
        if (!node) return
        node.scrollTo({
          left: node.scrollWidth,
          behavior: reduceMotion ? 'auto' : 'smooth',
        })
      }
    },
    [reduceMotion, scrollByOneCard],
  )

  return (
    <section
      className={styles.rowSection}
      aria-labelledby={headingId}
      data-video-provider={provider}
    >
      <header className={styles.rowHeader}>
        <h3 id={headingId} className={styles.rowHeading}>
          {label}
        </h3>
        <div className={styles.rowControls}>
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canPrev}
            aria-controls={regionId}
            aria-label={`Previous ${label} videos`}
            className={styles.rowArrow}
          >
            <IconArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext}
            aria-controls={regionId}
            aria-label={`Next ${label} videos`}
            className={styles.rowArrow}
          >
            <IconArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </header>
      <div
        id={regionId}
        ref={scrollerRef}
        role="region"
        aria-labelledby={headingId}
        tabIndex={0}
        onKeyDown={handleRegionKeyDown}
        className={styles.rowScroller}
        data-lenis-prevent-horizontal
        data-video-scroller
      >
        <ul className={styles.rowList}>
          {cards.map((card, index) => (
            <RowItem
              key={card.id}
              card={card}
              index={index}
              locale={locale}
              cursorPopupItem={cursorPopupItem}
              activeYouTubeId={activeYouTubeId}
              onActivateYouTubeAction={onActivateYouTubeAction}
            />
          ))}
        </ul>
      </div>
    </section>
  )
}

type RowItemProps = {
  card: VideoCardView
  index: number
  locale: 'en' | 'vi'
  cursorPopupItem?: string | null
  activeYouTubeId: number | null
  onActivateYouTubeAction: (id: number | null) => void
}

function RowItem({
  card,
  index,
  locale,
  cursorPopupItem,
  activeYouTubeId,
  onActivateYouTubeAction,
}: RowItemProps) {
  const reduceMotion = useReducedMotion()
  const bootReady = useBootReady()
  const ref = useRef<HTMLLIElement | null>(null)
  const inView = useInView(ref, { once: true, amount: 'some' })
  const visible = Boolean(reduceMotion) || (bootReady && inView)
  const delay = reduceMotion ? 0 : Math.min(index, STAGGER_INDEX_CAP) * STAGGER_PER_ITEM_MS

  return (
    <motion.li
      ref={ref}
      data-video-card
      data-video-card-index={index}
      className={cn(styles.rowItem, 'group')}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: reduceMotion ? 0.05 : 0.45, ease: ENTER_EASE, delay: delay / 1000 }}
    >
      <VideoRowCard
        doc={card}
        locale={locale}
        cursorPopup={cursorPopupItem}
        activeYouTubeId={activeYouTubeId}
        onActivateYouTubeAction={onActivateYouTubeAction}
      />
    </motion.li>
  )
}