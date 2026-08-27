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
  youtube: 'aspect-video',
  tiktok: 'aspect-[3/4]',
  instagram: 'aspect-[3/4]',
  other: 'aspect-[3/4]',
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
    <div
      className={cn(
        'video-card-media bg-foreground/5 relative w-full overflow-hidden',
        VIDEO_CARD_ASPECT[doc.provider],
      )}
    >
      {isPlaying && doc.youtubeId ? (
        <iframe
          title={doc.title}
          src={youtubeEmbedUrl(doc.youtubeId)}
          className="absolute inset-0 h-full w-full border-0"
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
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full"
              imgClassName={cn(
                'transition-transform duration-500',
                !reduceMotion && 'group-hover:scale-[1.01] group-focus-visible:scale-[1.01]',
              )}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <IconBrandYoutube className="text-muted-foreground size-8" />
            </div>
          )}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="bg-background/85 text-foreground flex size-11 items-center justify-center rounded-full shadow-sm">
              <IconPlayerPlay className="size-5 translate-x-px" />
            </span>
          </span>
        </>
      )}
    </div>
  )

  const meta = (
    <span
      className={cn(
        'text-primary font-mono text-[0.5rem] leading-none tracking-tight uppercase md:text-[0.625rem]',
        'absolute top-0 left-0',
        'bg-background pr-0.5 pb-0.5',
      )}
    >
      {PROVIDER_LABEL[doc.provider]}
      {dateLabel ? ` · ${dateLabel}` : ''}
    </span>
  )

  const title = (
    <h3
      id={titleId}
      className={cn(
        'text-foreground text-xs leading-none font-medium tracking-tight md:text-sm lg:text-base',
        'lowercase',
        'border-primary/50 border-l-2 md:border-l-3 lg:border-l-4',
        'pl-0.75 md:pl-1 lg:pl-2',
      )}
    >
      {doc.title}
    </h3>
  )

  const shellClass = cn(
    'group relative block bg-transparent outline-none cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    className,
  )

  if (isYouTube) {
    return (
      <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
        <div className="flex flex-col gap-1 md:gap-1.5 lg:gap-2">
          {isPlaying ? (
            media
          ) : (
            <button
              type="button"
              className="relative block w-full text-left focus:outline-none"
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
              className={cn(
                'text-primary flex items-center gap-1 text-sm tracking-tight lowercase underline-offset-2 hover:underline',
                'font-medium',
                'border-primary/50 border-l-2 md:border-l-3 lg:border-l-4',
                'pl-0.5 md:pl-1 lg:pl-2',
              )}
              data-cursor-popup={undefined}
            >
              View on YouTube
              <IconExternalLink className="text-primary size-4" />
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
        className="block focus:outline-none"
        aria-labelledby={titleId}
      >
        <div className="flex flex-col gap-1 md:gap-1.5 lg:gap-2">
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
