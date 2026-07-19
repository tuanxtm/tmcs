import type { GridPlacement } from './feed-packer'

export type FeedAlignment = 'left' | 'right'

/** Edge-dock when touching a page border; center-of-mass for middle; full-width → left. */
export function resolveAlignment(placement: GridPlacement, columns: number): FeedAlignment {
  const touchesLeft = placement.column === 0
  const touchesRight = placement.column + placement.columnSpan === columns

  if (touchesLeft && touchesRight) return 'left'
  if (touchesLeft) return 'left'
  if (touchesRight) return 'right'

  const center = placement.column + placement.columnSpan / 2
  const mid = columns / 2
  return center < mid ? 'left' : 'right'
}
