'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

import type { GridPlacement } from '@/app/(frontend)/_lib/feed-packer'
import type { ShortStoryCardView, StoryShape } from '@/app/(frontend)/_lib/types'

type ShortStoryFeedItemProps = {
  story: ShortStoryCardView
  shape: StoryShape
  placement: GridPlacement
  explicitPlacement?: boolean
  className?: string
}

function shapeLayout(shape: StoryShape) {
  switch (shape) {
    case '3x1':
    case '2x1':
      return 'horizontal'
    case '1x2':
      return 'vertical'
    case '2x2':
      return 'expanded'
    default:
      return 'compact'
  }
}

export function ShortStoryFeedItem({
  story,
  shape,
  placement,
  explicitPlacement = true,
  className,
}: ShortStoryFeedItemProps) {
  const reduceMotion = useReducedMotion()
  const layout = shapeLayout(shape)

  const content = (
    <div
      className={cn(
        'flex h-full w-full flex-col justify-center gap-2 p-2',
        layout === 'horizontal' && 'md:justify-center',
        layout === 'vertical' && 'justify-center',
        layout === 'expanded' && 'justify-center',
      )}
    >
      <h3
        className={cn(
          'font-medium tracking-tight',
          layout === 'compact' ? 'text-sm' : 'text-base md:text-lg',
          story.variant === 'quote' && 'italic',
        )}
      >
        {story.title}
      </h3>
      {story.text ? (
        <p
          className={cn(
            'text-sm leading-relaxed text-muted-foreground',
            layout === 'compact' && 'line-clamp-5',
            layout === 'horizontal' && 'line-clamp-3',
            layout === 'vertical' && 'line-clamp-10',
            layout === 'expanded' && 'line-clamp-8',
          )}
        >
          {story.variant === 'quote' ? `“${story.text}”` : story.text}
        </p>
      ) : null}
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

  const motionProps = {
    initial: reduceMotion ? false : ({ opacity: 0, y: 10 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.3, ease: 'easeOut' as const },
  }

  if (story.href) {
    return (
      <motion.article
        className={shellClass}
        style={style}
        aria-label={story.title}
        {...motionProps}
      >
        <Link
          href={story.href}
          target={story.newTab ? '_blank' : undefined}
          rel={story.newTab ? 'noopener noreferrer' : undefined}
          className="block h-full focus:outline-none"
        >
          {content}
        </Link>
      </motion.article>
    )
  }

  return (
    <motion.article
      className={shellClass}
      style={style}
      aria-label={story.title}
      tabIndex={0}
      {...motionProps}
    >
      {content}
    </motion.article>
  )
}
