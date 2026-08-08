import type { BlankSpaceBlockView } from '@/app/(frontend)/_lib/types'

type BlankSpaceBlockProps = {
  block: BlankSpaceBlockView
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
    />
  )
}
