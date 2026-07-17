'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

import type { GridPlacement } from '@/app/(frontend)/_lib/feed-packer'
import type { PostCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'

type PostFeedItemProps = {
  post: PostCardView
  locale: LocaleCode
  index: number
  placement: GridPlacement
  explicitPlacement?: boolean
  className?: string
}

function formatDate(value: string | null, locale: LocaleCode): string | null {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(value))
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
  explicitPlacement = true,
  className,
}: PostFeedItemProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(post.publishedAt, locale)
  const idLabel = String(index + 1).padStart(3, '0')

  const body = (
    <div className="relative h-full p-2">
      <div className="relative h-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-foreground/80">
            {dateLabel || 'Draft'}
          </span>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-foreground/80">
            ID {idLabel}
          </span>
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="page-label">No cover</span>
          </div>
        )}

        <div
          className={cn(
            'absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background/50 via-background/20 to-transparent pt-8',
            'opacity-100 md:opacity-0 md:transition-opacity md:duration-200',
            'md:group-hover:opacity-100 md:group-focus-within:opacity-100',
          )}
        >
          <h3 className="text-sm font-medium leading-snug tracking-tight text-foreground md:text-base">
            {post.title}
          </h3>
          <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
            {[
              post.authorName,
              post.readingTime ? `${post.readingTime} min` : null,
              post.categories[0]?.title,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      <span className="sr-only">{post.title}</span>
    </div>
  )

  const shellClass = cn(
    'bento-tile group relative bg-transparent outline-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    className,
  )

  const style = explicitPlacement
    ? ({
        gridColumn: `${placement.column + 1} / span ${placement.columnSpan}`,
        gridRow: `${placement.row + 1} / span ${placement.rowSpan}`,
      } as React.CSSProperties)
    : undefined

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
      tabIndex={0}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {body}
    </motion.article>
  )
}
