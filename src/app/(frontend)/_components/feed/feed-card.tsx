'use client'

import Link from 'next/link'
import { useReducedMotion } from 'motion/react'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import type { PostCardView, ProjectCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'

type FeedCardProps = {
  doc: PostCardView | ProjectCardView
  locale: LocaleCode
  index: number
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

export function FeedCard({
  doc,
  locale,
  index,
  className,
  cursorPopup = 'view details',
}: FeedCardProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(doc.publishedAt, locale)
  void index

  const body = (
    <div className="flex flex-col gap-1 p-2">
      {doc.image ? (
        <CmsImage
          media={doc.image}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="w-full"
          imgClassName={cn(
            'h-auto w-full transition-transform duration-500',
            !reduceMotion && 'group-hover:scale-[1.01] group-focus-visible:scale-[1.01]',
          )}
        />
      ) : (
        <div
          className="flex aspect-[4/3] w-full items-center justify-center bg-foreground/5"
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col gap-1">
        <span className="font-mono text-[0.625rem] uppercase tracking-tight leading-none text-secondary-foreground">
          {dateLabel || 'Draft'}
        </span>
        <h3 className="text-sm font-medium leading-none tracking-tight text-foreground md:text-base">
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
        <Link href={doc.href} className="block focus:outline-none">
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
