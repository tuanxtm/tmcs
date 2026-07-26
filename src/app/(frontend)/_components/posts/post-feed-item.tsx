'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import type { GridPlacement } from '@/app/(frontend)/_lib/feed-packer'
import { placementStyle } from '@/app/(frontend)/_lib/grid-placement'
import type { PostCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'

type PostFeedItemProps = {
  post: PostCardView
  locale: LocaleCode
  index: number
  placement: GridPlacement
  className?: string
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

function imageSizes(placement: GridPlacement): string {
  if (placement.columnSpan >= 3) {
    return '(min-width: 1024px) 75vw, (min-width: 768px) 100vw, 100vw'
  }
  if (placement.columnSpan === 2) {
    return '(min-width: 1024px) 50vw, (min-width: 768px) 100vw, 100vw'
  }
  return '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw'
}

export function PostFeedItem({
  post,
  locale,
  index,
  placement,
  className,
}: PostFeedItemProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(post.publishedAt, locale)
  const idLabel = String(index + 1).padStart(3, '0')

  const body = (
    <div className="relative h-full p-2">
      <div className="relative h-full overflow-hidden rounded-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 overflow-hidden rounded-t-xl">
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0 bg-gradient-to-b from-black/10 to-transparent backdrop-blur-md',
              '[mask-image:linear-gradient(to_bottom,black_40%,transparent)]',
              '[-webkit-mask-image:linear-gradient(to_bottom,black_40%,transparent)]',
            )}
          />
          <div className="relative flex items-start justify-between gap-3 p-2">
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.03em] text-foreground/90 transition-colors group-hover:text-primary group-hover:font-semibold group-focus-within:text-primary group-focus-within:font-semibold">
              {dateLabel || 'Draft'}
            </span>
            <span className="font-mono text-[0.625rem] uppercase tracking-[0.03em] text-foreground/90 transition-colors group-hover:text-primary group-hover:font-semibold group-focus-within:text-primary group-focus-within:font-semibold">
              ID {idLabel}
            </span>
          </div>
        </div>

        {post.image ? (
          <CmsImage
            media={post.image}
            fill
            sizes={imageSizes(placement)}
            className="absolute inset-0"
            imgClassName={cn(
              'object-contain p-4 transition-transform duration-500',
              !reduceMotion && 'group-hover:scale-[1.02] group-focus-visible:scale-[1.02]',
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            <span className="page-label">No cover</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 overflow-hidden rounded-b-xl">
          <div
            aria-hidden="true"
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/20 via-black/10 to-transparent backdrop-blur-md',
              '[mask-image:linear-gradient(to_top,black_55%,transparent)]',
              '[-webkit-mask-image:linear-gradient(to_top,black_55%,transparent)]',
            )}
          />
          <div className="relative px-2 pb-2 pt-5">
            <h3 className="text-sm font-medium leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary group-focus-within:text-primary md:text-base">
              {post.title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )

  const shellClass = cn(
    'bento-tile group relative bg-transparent outline-none transition-colors duration-200',
    'hover:bg-foreground focus-within:bg-foreground',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    className,
  )

  const style = placementStyle(placement)

  if (post.href) {
    return (
      <motion.article
        className={shellClass}
        style={style}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Link href={post.href} className="block h-full focus:outline-none">
          {body}
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article
      className={shellClass}
      style={style}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {body}
    </motion.article>
  )
}
