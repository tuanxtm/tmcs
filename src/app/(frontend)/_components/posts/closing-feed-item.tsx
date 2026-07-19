'use client'

import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

import type { GridPlacement } from '@/app/(frontend)/_lib/feed-packer'
import type { StoryShape } from '@/app/(frontend)/_lib/types'

type ClosingFeedItemProps = {
  eyebrow: string | null
  title: string
  message: string | null
  shape: StoryShape
  placement: GridPlacement
  explicitPlacement?: boolean
  className?: string
}

export function ClosingFeedItem({
  eyebrow,
  title,
  message,
  placement,
  explicitPlacement = true,
  className,
}: ClosingFeedItemProps) {
  const reduceMotion = useReducedMotion()

  const style = explicitPlacement
    ? ({
        gridColumn: `${placement.column + 1} / span ${placement.columnSpan}`,
        gridRow: `${placement.row + 1} / span ${placement.rowSpan}`,
      } as React.CSSProperties)
    : undefined

  return (
    <motion.article
      className={cn('bento-tile group relative bg-transparent outline-none', className)}
      style={style}
      aria-label={eyebrow ? `${eyebrow}: ${title}` : title}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex h-full w-full flex-col items-end justify-end gap-2 p-2 text-right">
        <div className="min-w-0">
          {eyebrow ? <p className="page-label">{eyebrow}</p> : null}
          <h3
            className={cn(
              'font-medium tracking-tight',
              eyebrow ? 'mt-2' : null,
              'text-base md:text-lg',
            )}
          >
            {title}
          </h3>
          {message ? (
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
