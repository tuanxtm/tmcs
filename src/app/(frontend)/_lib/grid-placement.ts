import type { CSSProperties } from 'react'

import type { GridPlacement } from './feed-packer'

/** Shared CSS grid placement for bento tiles. */
export function placementStyle(placement: GridPlacement): CSSProperties {
  return {
    gridColumn: `${placement.column + 1} / span ${placement.columnSpan}`,
    gridRow: `${placement.row + 1} / span ${placement.rowSpan}`,
  }
}
