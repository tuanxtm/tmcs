'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ViewTransition } from 'react'
import { useReducedMotion } from 'motion/react'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import type { FeedDecorationView, PostCardView, ProjectCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'

type FeedCardProps = {
  doc: PostCardView | ProjectCardView
  locale: LocaleCode
  className?: string
  cursorPopup?: string | null
  decorations?: FeedDecorationView[]
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

// Stable per-card deco pick: same id always picks the same decoration,
// and the choice is stable across renders so React doesn't re-render the
// decoration image. Defined at module scope so it isn't recreated per render.
function pickDecoration(
  decorations: FeedDecorationView[] | undefined,
  docId: number,
): FeedDecorationView | null {
  if (!decorations?.length) return null
  return decorations[Math.abs(docId) % decorations.length] ?? null
}

export function FeedCard({
  doc,
  locale,
  className,
  cursorPopup = 'view details',
  decorations,
}: FeedCardProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(doc.publishedAt, locale)
  // Lazy state init picks the deco on first render only. The decoration image
  // itself is loaded by next/image (lazy by default), so nothing deco-related
  // ships in the initial HTML payload.
  const [deco] = useState(() => pickDecoration(decorations, doc.id))

  // slug is globally unique across all feed types (posts, projects). Use it for
  // the shared-element VT name so multiple sections on the same page don't collide.
  // Falls back to doc.id if slug is null (e.g. unpublished drafts).
  const vtName = doc.slug ? `card-image-${doc.slug}` : null

  // Same aspect class on the feed card image and the detail hero image, so the
  // morph between them has matching start/end frames.
  const { aspectClass } = getImageAspect(doc.image)

  const imageContent = (
    <div className={cn('bg-primary/4 relative w-full overflow-hidden', aspectClass)}>
      {doc.image ? (
        <CmsImage
          media={doc.image}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="h-full w-full"
          imgClassName={cn(
            'object-cover transition-transform duration-500',
            !reduceMotion && 'group-hover:scale-[1.01] group-focus-visible:scale-[1.01]',
          )}
        />
      ) : deco ? (
        <div
          className="relative h-full w-full overflow-hidden"
          aria-hidden="true"
          style={{
            WebkitMaskImage: `url("${deco.imageUrl}")`,
            maskImage: `url("${deco.imageUrl}")`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            backgroundColor: 'var(--primary)',
          }}
        />
      ) : (
        <div
          className="flex aspect-square w-full items-center justify-center bg-white/80"
          aria-hidden="true"
        />
      )}
      {dateLabel &&
        (() => {
          const parts = dateLabel.split('/')
          return (
            <div
              className={cn(
                'absolute top-0 right-0 flex flex-col items-center',
                'bg-background text-primary font-mono text-[0.5rem] md:text-[0.625rem]',
                'pl-px md:pl-0.5',
                'leading-tight tracking-tight',
                parts[0] === '0' && 'text-primary',
              )}
            >
              <span>{parts[0]}</span>
              <span className="rotate-45">/</span>
              <span>{parts[1]}</span>
              <span className="rotate-45">/</span>
              <span>{parts[2]}</span>
            </div>
          )
        })()}
    </div>
  )

  const imageWrapper = vtName ? (
    <ViewTransition name={vtName} share="morph" default="none">
      {imageContent}
    </ViewTransition>
  ) : (
    imageContent
  )

  const body = (
    <div className="flex flex-col">
      <div className="flex h-full flex-col gap-1 md:gap-1.5 lg:gap-2">
        <div className="h-full w-full object-cover">{imageWrapper}</div>
        <h3
          className={cn(
            'text-foreground text-xs leading-none font-medium tracking-tight md:text-sm lg:text-base',
            'lowercase',
            'border-primary/50 border-l-2 md:border-l-3 lg:border-l-4',
            'pl-0.5 md:pl-1 lg:pl-2',
          )}
        >
          {doc.title}
        </h3>
      </div>
    </div>
  )

  const shellClass = cn(
    'group relative block bg-transparent outline-none cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    className,
  )

  if (doc.href) {
    return (
      <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
        <Link
          href={doc.href}
          transitionTypes={['nav-forward']}
          className="block focus:outline-none"
        >
          {body}
        </Link>
      </article>
    )
  }

  return (
    <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
      {body}
    </article>
  )
}
