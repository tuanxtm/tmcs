'use client'

import Link from 'next/link'
import { ViewTransition } from 'react'
import { useReducedMotion } from 'motion/react'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import type { PostCardView, ProjectCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'

type FeedCardProps = {
  doc: PostCardView | ProjectCardView
  locale: LocaleCode
  className?: string
  cursorPopup?: string | null
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

export function FeedCard({ doc, locale, className, cursorPopup = 'view details' }: FeedCardProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(doc.publishedAt, locale)

  // slug is globally unique across all feed types (posts, projects). Use it for
  // the shared-element VT name so multiple sections on the same page don't collide.
  // Falls back to doc.id if slug is null (e.g. unpublished drafts).
  const vtName = doc.slug ? `card-image-${doc.slug}` : null

  // Same aspect class on the feed card image and the detail hero image, so the
  // morph between them has matching start/end frames.
  const { aspectClass } = getImageAspect(doc.image)

  const imageContent = (
    <div className={cn('relative w-full overflow-hidden', aspectClass)}>
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
      ) : (
        <div
          className={cn(
            'flex aspect-square w-full items-center justify-center backdrop-blur-lg',
            'bg-white/80 backdrop-blur-lg',
          )}
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
                'bg-background text-primary/80 font-mono text-[0.5rem] md:text-[0.625rem]',
                'pl-px md:pl-0.5',
                'leading-tight tracking-tight',
                parts[0] === '0' && 'text-foreground/40',
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
