'use client'

import { useId } from 'react'
import Link from 'next/link'
import { useReducedMotion } from 'motion/react'
import { IconExternalLink, IconPlayerPlay } from '@tabler/icons-react'

import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { formatDate } from '@/app/(frontend)/_lib/formatters'
import type { VideoCardView } from '@/app/(frontend)/_lib/types'
import { youtubeEmbedUrl } from '@/lib/youtube'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import styles from './videos.module.css'

export type VideoRowCardProps = {
  doc: VideoCardView
  locale: LocaleCode
  cursorPopup?: string | null
  activeYouTubeId: number | null
  onActivateYouTubeAction: (id: number | null) => void
  className?: string
}

function isValidIsoDate(value: string | null): value is string {
  if (typeof value !== 'string' || value.length === 0) return false
  return Number.isFinite(Date.parse(value))
}

/** Row-variant video card. Title and date sit below the thumbnail. */
export function VideoRowCard({
  doc,
  locale,
  cursorPopup = 'play',
  activeYouTubeId,
  onActivateYouTubeAction,
  className,
}: VideoRowCardProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const dateLabel = isValidIsoDate(doc.publishedAt) ? formatDate(doc.publishedAt, locale) : null
  const isYouTube = doc.provider === 'youtube' && Boolean(doc.youtubeId)
  const isPlaying = isYouTube && activeYouTubeId === doc.id

  const playYouTube = () => {
    if (!isYouTube) return
    onActivateYouTubeAction(doc.id)
  }

  const media = (
    <div className={cn(styles.rowMedia, VIDEO_ROW_ASPECT[doc.provider])}>
      {isPlaying && doc.youtubeId ? (
        <iframe
          title={doc.title}
          src={youtubeEmbedUrl(doc.youtubeId)}
          className={styles.rowIframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <>
          {doc.image ? (
            <CmsImage
              media={doc.image}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 280px, min(80vw, 320px)"
              className={styles.rowImage}
              imgClassName={cn(
                styles.rowImageInner,
                !reduceMotion && 'group-hover:scale-[1.01] group-focus-visible:scale-[1.01]',
              )}
            />
          ) : (
            <div className={styles.rowPlaceholder} aria-hidden="true">
              <IconPlayerPlay className="text-muted-foreground size-6" />
            </div>
          )}
          <span className={styles.rowPlayBadge} aria-hidden="true">
            <span className={styles.rowPlayBadgeInner}>
              <IconPlayerPlay className="size-4 translate-x-px" />
            </span>
          </span>
        </>
      )}
    </div>
  )

  const meta = (
    <div className={styles.rowMeta}>
      <h4 id={titleId} className={cn(styles.rowTitle, 'lowercase')} title={doc.title}>
        {doc.title}
      </h4>
      {dateLabel ? (
        <time dateTime={doc.publishedAt as string} className={styles.rowDate}>
          {dateLabel}
        </time>
      ) : null}
    </div>
  )

  const shellClass = cn(styles.rowCard, className)

  if (isYouTube) {
    return (
      <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
        {isPlaying ? (
          <>
            {media}
            {meta}
            <Link
              href={doc.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.rowExternalLink}
              data-cursor-popup={undefined}
            >
              View on YouTube
              <IconExternalLink className="size-3.5" />
            </Link>
          </>
        ) : (
          <button
            type="button"
            className={styles.rowButton}
            onClick={playYouTube}
            aria-labelledby={titleId}
          >
            {media}
            {meta}
          </button>
        )}
      </article>
    )
  }

  return (
    <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
      <a
        href={doc.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.rowButton}
        aria-labelledby={titleId}
      >
        {media}
        {meta}
      </a>
    </article>
  )
}

// YouTube embeds are 16:9; Instagram / TikTok / Other are 3:4 vertical tiles.
const VIDEO_ROW_ASPECT: Record<VideoCardView['provider'], string> = {
  youtube: styles.rowMediaYoutube,
  tiktok: styles.rowMediaTall,
  instagram: styles.rowMediaTall,
  other: styles.rowMediaTall,
}
