import type { LayoutBlankSpaceBlockView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'
import { Scales } from '@/components/ui/scales'

type BlankSpaceBlockProps = {
  block: LayoutBlankSpaceBlockView
}

/**
 * Renders an empty section with the configured height to add vertical
 * spacing between page blocks. Default height matches the Typewriter block.
 */
export function BlankSpaceBlock({ block }: BlankSpaceBlockProps) {
  return (
    <section
      id={`block-${block.id}`}
      aria-hidden="true"
      style={{ height: block.height }}
      className={cn(
        'relative bg-background dash-line-b',
        'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
      )}
    >
      <Scales />
    </section>
  )
}
