'use client'

import Typewriter from '@/components/ui/typewriter'
import type { LayoutTypewriterBlockView } from '@/app/(frontend)/_lib/types'

type TypewriterBlockProps = {
  block: LayoutTypewriterBlockView
}

/**
 * Renders picked short stories as a full-width typewriter cycle.
 * Stories are typed in editor order; the loop restarts after the last one.
 */
export function TypewriterBlock({ block }: TypewriterBlockProps) {
  if (block.texts.length === 0) return null

  return (
    <section
      id={`block-${block.id}`}
      className="flex h-[60vh] items-center justify-center px-2 py-16"
      aria-label="Typewriter"
    >
      <Typewriter
        text={block.texts}
        speed={60}
        deleteSpeed={30}
        waitTime={3000}
        loop
        cursorChar="_"
        className="font-2xl tracking-tight leading-none font-medium max-w-4xl text-center lowercase text-foreground/50"
      />
    </section>
  )
}
