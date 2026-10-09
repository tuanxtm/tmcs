'use client'

import Link from 'next/link'
import { useReducedMotion } from 'motion/react'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import type { PostCardView, ProjectCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'
import { formatDate } from '@/app/(frontend)/_lib/formatters'

type FeedCardProps = {
  doc: PostCardView | ProjectCardView
  locale: LocaleCode
  className?: string
  cursorPopup?: string | null
}

export function FeedCard({
  doc,
  locale,
  className,
  cursorPopup = 'view details',
}: FeedCardProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(doc.publishedAt, locale)

  // Same aspect class on the feed card image and the detail hero image so the
  // detail page can mount the hero at the same dimensions.
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
      ) : (
        <div
          className={cn(
            'flex aspect-square w-full items-center justify-center',
            'bg-white/80',
          )}
          aria-hidden="true"
        />
      )}
    </div>
  )

  const imageWrapper = imageContent

  const body = (
    <div className="flex flex-col">
      <div className={cn('flex h-full flex-col', 'gap-1 md:gap-1.5 lg:gap-2')}>
        <div className="h-full w-full object-cover">{imageWrapper}</div>
        <h3
          className={cn(
            'text-foreground text-xs leading-none font-medium tracking-tight md:text-sm lg:text-base',
            'lowercase',
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
