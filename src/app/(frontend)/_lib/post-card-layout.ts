import type { MediaView } from './types'

export type CardSizeChoice = 'auto' | 'small' | 'wide' | 'tall' | 'large'
export type ResolvedCardSize = 'small' | 'wide' | 'tall' | 'large'

export type GridSpan = {
  columnSpan: number
  rowSpan: number
}

export const CARD_SIZE_SPANS: Record<ResolvedCardSize, GridSpan> = {
  small: { columnSpan: 1, rowSpan: 1 },
  wide: { columnSpan: 2, rowSpan: 1 },
  tall: { columnSpan: 1, rowSpan: 2 },
  large: { columnSpan: 2, rowSpan: 2 },
}

/** Stable FNV-1a style hash for deterministic layout choices. */
export function hashId(value: string | number): number {
  const input = String(value)
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/**
 * Resolve the homepage bento footprint for a post.
 * Explicit editor choices win; otherwise featured → large, then aspect ratio, then ID hash.
 */
export function resolvePostCardSize(input: {
  cardSize?: CardSizeChoice | null
  featured?: boolean | null
  image?: Pick<MediaView, 'width' | 'height'> | null
  id: number | string
}): ResolvedCardSize {
  const choice = input.cardSize ?? 'auto'
  if (choice !== 'auto') return choice

  if (input.featured) return 'large'

  const width = input.image?.width
  const height = input.image?.height
  if (typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0) {
    const ratio = width / height
    if (ratio >= 1.45) return 'wide'
    if (ratio <= 0.75) return 'tall'
  }

  // Mostly small, with occasional large tiles for visual rhythm.
  const bucket = hashId(input.id) % 10
  return bucket === 0 ? 'large' : 'small'
}
