'use client'

import { motion, useReducedMotion } from 'motion/react'

import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { cn } from '@/lib/utils'

import type { GridPlacement } from '@/app/(frontend)/_lib/feed-packer'
import { placementStyle } from '@/app/(frontend)/_lib/grid-placement'
import type { EndOfFeedView, StoryShape } from '@/app/(frontend)/_lib/types'

type ClosingFeedItemProps = {
  text: EndOfFeedView['text']
  shape: StoryShape
  placement: GridPlacement
  className?: string
}

export function ClosingFeedItem({ text, placement, className }: ClosingFeedItemProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      className={cn('bento-tile group relative bg-transparent outline-none', className)}
      style={placementStyle(placement)}
      aria-label="End of feed"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="flex h-full w-full flex-col items-end justify-end gap-2 p-2 text-right">
        <CmsRichText
          data={text}
          className="min-w-0 text-base leading-relaxed md:text-lg [&_p]:m-0 [&_p+p]:mt-2 [&_p:first-child]:font-medium [&_p:first-child]:tracking-tight"
        />
      </div>
    </motion.article>
  )
}
