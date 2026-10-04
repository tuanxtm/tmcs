import type { PageBlankSpaceBlockView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type BlankSpaceBlockProps = {
  block: PageBlankSpaceBlockView
}

/**
 * Renders an empty section with the configured height
 * to add vertical spacing between page blocks.
 */
export function BlankSpaceBlock({ block }: BlankSpaceBlockProps) {
  return (
    <section
      id={`block-${block.id}`}
      aria-hidden="true"
      style={{ height: block.height }}
      className={cn('relative')}
    ></section>
  )
}
