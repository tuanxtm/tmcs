'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCallback, useId } from 'react'
import { useReducedMotion } from 'motion/react'
import { IconBrandYoutube, IconPlayerPlay } from '@tabler/icons-react'
import { IconExternalLink } from '@tabler/icons-react'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { VideoCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { youtubeEmbedUrl } from '@/lib/youtube'
import { cn } from '@/lib/utils'
import { formatDate } from '@/app/(frontend)/_lib/formatters'
import styles from './video-feed-card.module.css'
type VideoFeedCardProps = {
  doc: VideoCardView
  locale: LocaleCode
  index: number
  className?: string
  cursorPopup?: string | null
  /** Currently playing video id in the section (YouTube only). */
  activeYouTubeId: number | null
  onActivateYouTubeAction: (id: number | null) => void
}
const PROVIDER_LABEL: Record<VideoCardView['provider'], string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  other: 'Video',
}
// YouTube embeds are 16:9 natively; TikTok / Instagram / generic video reels
// are vertical. 3:4 keeps the panel tall without forcing full 9:16 cropping.
const VIDEO_CARD_ASPECT: Record<VideoCardView['provider'], string> = {
  youtube: styles.landscape,
  tiktok: styles.portrait,
  instagram: styles.portrait,
  other: styles.portrait,
}
export function VideoFeedCard({
  doc,
  locale,
  index,
  className,
  cursorPopup = 'play',
  activeYouTubeId,
  onActivateYouTubeAction,
}: VideoFeedCardProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const dateLabel = formatDate(doc.publishedAt, locale)
  const isYouTube = doc.provider === 'youtube' && Boolean(doc.youtubeId)
  const isPlaying = isYouTube && activeYouTubeId === doc.id
  void index
  const playYouTube = useCallback(() => {
    if (!isYouTube) return
    onActivateYouTubeAction(doc.id)
  }, [doc.id, isYouTube, onActivateYouTubeAction])
  const media = (
    <div className={cn(styles.media, 'video-card-media', VIDEO_CARD_ASPECT[doc.provider])}>
      {isPlaying && doc.youtubeId ? (
        <iframe
          title={doc.title}
          src={youtubeEmbedUrl(doc.youtubeId)}
          className={styles.iframe}
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
              glow={false}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className={styles.imageFrame}
              imgClassName={cn(styles.image, !reduceMotion && styles.imageInteractive)}
            />
          ) : (
            <div className={styles.placeholder} aria-hidden="true">
              <IconBrandYoutube className={styles.placeholderIcon} />
            </div>
          )}
          <span className={styles.playBadge} aria-hidden="true">
            <span className={styles.playBadgeInner}>
              <IconPlayerPlay className={styles.playIcon} />
            </span>
          </span>
        </>
      )}
    </div>
  )
  const meta = (
    <span className={styles.metadata}>
      {PROVIDER_LABEL[doc.provider]}
      {dateLabel ? ` · ${dateLabel}` : ''}
    </span>
  )
  const title = (
    <h3 id={titleId} className={styles.heading}>
      {doc.title}
    </h3>
  )
  const shellClass = cn(styles.card, 'group', className)
  if (isYouTube) {
    return (
      <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
        <div className={styles.content}>
          {isPlaying ? (
            media
          ) : (
            <button
              type="button"
              className={styles.playButton}
              onClick={playYouTube}
              aria-labelledby={titleId}
            >
              {media}
              {meta}
            </button>
          )}
          {title}
          {isPlaying ? (
            <Link
              href={doc.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
              data-cursor-popup={undefined}
            >
              View on YouTube
              <IconExternalLink className={styles.externalIcon} />
            </Link>
          ) : null}
        </div>
      </article>
    )
  }
  return (
    <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
      <a
        href={doc.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
        aria-labelledby={titleId}
      >
        <div className={styles.content}>
          {media}
          {meta}
          {title}
        </div>
      </a>
    </article>
  )
}
/** Local helper for sections that manage one active YouTube player. */
export function useActiveYouTubePlayer() {
  const [activeYouTubeId, setActiveYouTubeId] = useState<number | null>(null)
  return { activeYouTubeId, setActiveYouTubeId }
}
