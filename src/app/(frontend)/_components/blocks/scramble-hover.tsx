'use client'

import ScrambleHover from '@/components/ui/scramble-hover'
import type { ScrambleHoverBlockView } from '@/app/(frontend)/_lib/types'

type ScrambleHoverBlockProps = {
  block: ScrambleHoverBlockView
}

/**
 * Renders picked short stories as a scramble-hover stack.
 * Each story scrambles on hover, revealing its text character by character.
 * Stories are rendered in editor order.
 */
export function ScrambleHoverBlock({ block }: ScrambleHoverBlockProps) {
  if (block.texts.length === 0) return null

  return (
    <section
      id={`block-${block.id}`}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-2 py-16"
      aria-label="Scramble Hover"
    >
      {block.texts.map((text, index) => (
        <ScrambleHover
          key={`${block.id}-${index}`}
          text={text}
          className="text-xl lowercase tracking-tight leading-none font-medium max-w-4xl text-center text-foreground/50"
        />
      ))}
    </section>
  )
}
