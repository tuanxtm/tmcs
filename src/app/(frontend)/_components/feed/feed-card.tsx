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

  const imageContent = doc.image ? (
    <div className={cn('relative w-full overflow-hidden bg-zinc-950', aspectClass)}>
      <CmsImage
        media={doc.image}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="w-full h-full"
        imgClassName={cn(
          'object-cover transition-transform duration-500',
          !reduceMotion && 'group-hover:scale-[1.01] group-focus-visible:scale-[1.01]',
        )}
      />
      <span className="absolute top-0 right-0 font-mono text-[0.625rem] uppercase tracking-tight leading-none mix-blend-difference text-white max-sm:hidden">
        {dateLabel || 'Draft'}
      </span>
    </div>
  ) : (
    <div
      className="flex aspect-4/3 w-full items-center justify-center bg-foreground/5 backdrop-blur-sm"
      aria-hidden="true"
    />
  )

  const imageWrapper = vtName ? (
    <ViewTransition name={vtName} share="morph" default="none">
      {imageContent}
    </ViewTransition>
  ) : (
    imageContent
  )

  const body = (
    <div className="flex flex-col gap-1 max-sm:gap-0.5">
      {imageWrapper}

      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium leading-none tracking-tight text-foreground md:text-base max-sm:hidden">
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
