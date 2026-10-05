'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

import { VideoProviderRow } from '@/app/(frontend)/_components/videos/video-provider-row'
import {
  groupVideosByProvider,
  VIDEOS_PROVIDER_LABEL,
  VIDEOS_PROVIDER_ORDER,
} from '@/app/(frontend)/_lib/videos-feed'
import type { LocaleCode } from '@/lib/locales'
import type { VideoCardView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

import styles from './videos.module.css'

const ENTER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EMPTY_MESSAGE = 'No videos yet'

export type VideosSectionProps = {
  sectionId: string
  headingId: string
  heading: string
  description?: string | null
  docs: VideoCardView[]
  locale: LocaleCode
  cursorPopup?: string | null
  cursorPopupEmpty?: string | null
  cursorPopupViewAll?: string | null
  showViewAll?: boolean
  viewAllLabel?: Record<LocaleCode, string> | string | null
  viewAllHref?: string | null
}

export function VideosSection({
  sectionId,
  headingId,
  heading,
  description,
  docs,
  locale,
  cursorPopup,
  cursorPopupEmpty,
  cursorPopupViewAll,
  showViewAll = false,
  viewAllLabel,
  viewAllHref,
}: VideosSectionProps) {
  const reduceMotion = useReducedMotion()
  const docsKey = useMemo(() => docs.map((doc) => doc.id).join('|'), [docs])
  // Track the active YouTube id. When the resolved docs snapshot changes
  // (e.g. after a navigation or revalidation), reset to null so visitors
  // never see a stale iframe for a doc that's gone missing. This is the
  // "use derived key + keyed reset" pattern: we treat the snapshot as a
  // key and reset the active id from props instead of using an effect.
  const [activeYouTubeId, setActiveYouTubeId] = useState<number | null>(null)
  const [lastSnapshotKey, setLastSnapshotKey] = useState(docsKey)
  if (lastSnapshotKey !== docsKey) {
    setLastSnapshotKey(docsKey)
    if (activeYouTubeId !== null) setActiveYouTubeId(null)
  }

  const grouped = useMemo(() => groupVideosByProvider(docs), [docs])
  const orderedProviders = VIDEOS_PROVIDER_ORDER.filter((p) => grouped[p].length > 0)
  const isEmpty = orderedProviders.length === 0

  const activate = useCallback((id: number | null) => {
    setActiveYouTubeId(id)
  }, [])

  const resolvedViewAllLabel = viewAllLabel
    ? typeof viewAllLabel === 'string'
      ? viewAllLabel
      : (viewAllLabel[locale] ?? viewAllLabel.en ?? '')
    : ''

  const sectionCursor = isEmpty
    ? cursorPopupEmpty || cursorPopup || undefined
    : cursorPopup || undefined

  if (isEmpty) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        data-feed-type="videos"
        data-cursor-popup={sectionCursor}
        className={cn(styles.section)}
      >
        <SectionHeader heading={heading} description={description} headingId={headingId} />
        <p className={styles.emptyMessage} role="status" aria-live="polite">
          {EMPTY_MESSAGE}
        </p>
      </section>
    )
  }

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      data-feed-type="videos"
      data-cursor-popup={sectionCursor}
      className={cn(styles.section)}
    >
      <SectionHeader heading={heading} description={description} headingId={headingId} />
      <div className={styles.rows}>
        {orderedProviders.map((provider) => (
          <VideoProviderRow
            key={provider}
            provider={provider}
            label={VIDEOS_PROVIDER_LABEL[provider]}
            cards={grouped[provider]}
            locale={locale}
            cursorPopupItem={cursorPopup ?? 'play'}
            activeYouTubeId={activeYouTubeId}
            onActivateYouTubeAction={activate}
          />
        ))}
      </div>
      {showViewAll && viewAllHref && resolvedViewAllLabel ? (
        <div className={styles.viewAll}>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0.05 : 0.45, ease: ENTER_EASE }}
          >
            <Link
              href={viewAllHref}
              transitionTypes={['nav-forward']}
              data-cursor-popup={cursorPopupViewAll || resolvedViewAllLabel.toLowerCase()}
              className={styles.viewAllLink}
            >
              {resolvedViewAllLabel}
            </Link>
          </motion.div>
        </div>
      ) : null}
    </section>
  )
}

type SectionHeaderProps = {
  headingId: string
  heading: string
  description: string | null | undefined
}

function SectionHeader({ headingId, heading, description }: SectionHeaderProps) {
  const reduceMotion = useReducedMotion()
  return (
    <div className={styles.headerFrame}>
      <motion.h2
        id={headingId}
        className={styles.heading}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.05 : 0.45, ease: ENTER_EASE }}
      >
        {heading}
      </motion.h2>
      {description ? (
        <motion.p
          className={styles.description}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0.05 : 0.45, ease: ENTER_EASE, delay: 0.05 }}
        >
          {description}
        </motion.p>
      ) : null}
    </div>
  )
}