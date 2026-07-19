'use client'

import { motion, useReducedMotion } from 'motion/react'

import { cn } from '@/lib/utils'

import type { GridPlacement } from '@/app/(frontend)/_lib/feed-packer'
import { resolveAlignment } from '@/app/(frontend)/_lib/resolve-alignment'
import type { FeedDecorationView, StoryShape } from '@/app/(frontend)/_lib/types'

type DecorationFeedItemProps = {
  decoration: FeedDecorationView
  shape: StoryShape
  placement: GridPlacement
  columns: number
  explicitPlacement?: boolean
  className?: string
}

export function DecorationFeedItem({
  decoration,
  shape,
  placement,
  columns,
  explicitPlacement = true,
  className,
}: DecorationFeedItemProps) {
  const reduceMotion = useReducedMotion()
  const flipX = resolveAlignment(placement, columns) === 'right'

  const style = explicitPlacement
    ? ({
        gridColumn: `${placement.column + 1} / span ${placement.columnSpan}`,
        gridRow: `${placement.row + 1} / span ${placement.rowSpan}`,
      } as React.CSSProperties)
    : undefined

  return (
    <motion.div
      className={cn(
        'bento-tile deco-tile relative flex items-center justify-center bg-transparent',
        !reduceMotion && 'deco-tile--motion',
        className,
      )}
      style={style}
      aria-hidden="true"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      data-shape={shape}
      data-pack={decoration.pack}
    >
      <div
        className={cn(
          'deco-svg flex h-[70%] w-[70%] max-h-40 max-w-40 items-center justify-center text-foreground/55 [&_svg]:h-full [&_svg]:w-full',
          flipX && '-scale-x-100',
        )}
        dangerouslySetInnerHTML={{ __html: decoration.svgMarkup }}
      />
    </motion.div>
  )
}
