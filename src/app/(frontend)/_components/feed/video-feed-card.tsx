'use client'

import { useCallback, useId, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { IconBrandYoutube, IconPlayerPlay } from '@tabler/icons-react'

import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { VideoCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { youtubeEmbedUrl } from '@/lib/youtube'
import { cn } from '@/lib/utils'

type VideoFeedCardProps = {
  doc: VideoCardView
  locale: LocaleCode
  index: number
  className?: string
  cursorPopup?: string | null
  /** Currently playing video id in the section (YouTube only). */
  activeYouTubeId: number | null
  onActivateYouTube: (id: number | null) => void
}

const dateFormatters: Record<LocaleCode, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }),
  vi: new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }),
}

function formatDate(value: string | null, locale: LocaleCode): string | null {
  if (!value) return null
  try {
    return dateFormatters[locale].format(new Date(value))
  } catch {
    return null
  }
}

const PROVIDER_LABEL: Record<VideoCardView['provider'], string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  other: 'Video',
}

export function VideoFeedCard({
  doc,
  locale,
  index,
  className,
  cursorPopup = 'play',
  activeYouTubeId,
  onActivateYouTube,
}: VideoFeedCardProps) {
  const reduceMotion = useReducedMotion()
  const titleId = useId()
  const dateLabel = formatDate(doc.publishedAt, locale)
  const isYouTube = doc.provider === 'youtube' && Boolean(doc.youtubeId)
  const isPlaying = isYouTube && activeYouTubeId === doc.id
  void index

  const playYouTube = useCallback(() => {
    if (!isYouTube) return
    onActivateYouTube(doc.id)
  }, [doc.id, isYouTube, onActivateYouTube])

  const media = (
    <div className="video-card-media relative aspect-video w-full overflow-hidden bg-foreground/5">
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
              <IconBrandYoutube className="size-8 text-muted-foreground" />
            </div>
          )}
          <span
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-background/85 text-foreground shadow-sm">
              <IconPlayerPlay className="size-5 translate-x-px" />
            </span>
          </span>
        </>
      )}
    </div>
  )

  const meta = (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[0.625rem] uppercase tracking-tight leading-none text-secondary-foreground">
        {PROVIDER_LABEL[doc.provider]}
        {dateLabel ? ` · ${dateLabel}` : ''}
      </span>
      <h3
        id={titleId}
        className="text-sm font-medium leading-none tracking-tight text-foreground md:text-base"
      >
        {doc.title}
      </h3>
    </div>
  )

  const shellClass = cn(
    'group relative block bg-transparent outline-none cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    className,
  )

  if (isYouTube) {
    return (
      <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
        <div className="flex flex-col gap-1 p-2">
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
            </button>
          )}
          {meta}
          {isPlaying ? (
            <a
              href={doc.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground underline-offset-2 hover:underline"
            >
              Open on YouTube
            </a>
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
        <div className="flex flex-col gap-1 p-2">
          {media}
          {meta}
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
