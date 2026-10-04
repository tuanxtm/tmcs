export type Point = { x: number; y: number }
export type Size = { width: number; height: number }

export type CanvasPlacement = Point &
  Size & {
    imageWidth: number
    imageHeight: number
  }

export const OFFSET_X = [0.15, 0.7, 0.35, 0.85, 0.05] as const
export const OFFSET_Y = [0.1, 0.6, 0.3, 0.8, 0.45] as const
export const IMAGE_SCALE = [0.9, 1, 0.85, 0.95, 1] as const

/** Minimum gap reserved between neighbouring lanes and rows. */
export const LANE_GAP = 24

export function getCanvasLayout(
  width: number,
  count: number,
  kind: 'project' | 'thing' = 'project',
) {
  const columns = width >= 1024 ? 3 : 2
  const padding = width >= 640 ? 24 : 16
  const rowHeight =
    kind === 'thing'
      ? width >= 1024
        ? 360
        : width >= 640
          ? 340
          : 280
      : width >= 1024
        ? 280
        : width >= 640
          ? 260
          : 220
  const laneWidth = Math.max(1, width - padding * 2) / columns
  const itemWidth =
    width < 640 ? Math.min(laneWidth * 0.92, laneWidth - 16) : Math.min(400, laneWidth * 0.84)
  const itemHeight =
    kind === 'thing' ? (width >= 1024 ? 280 : width >= 640 ? 260 : 200) : rowHeight - 80

  const placements: CanvasPlacement[] = Array.from({ length: count }, (_, index) => {
    const column = index % columns
    const row = Math.floor(index / columns)
    const scale = IMAGE_SCALE[index % IMAGE_SCALE.length]
    const horizontalSlack = Math.max(0, laneWidth - itemWidth - LANE_GAP)
    const verticalSlack = rowHeight - itemHeight - LANE_GAP

    return {
      x: padding + column * laneWidth + horizontalSlack * OFFSET_X[index % OFFSET_X.length],
      y: padding + row * rowHeight + verticalSlack * OFFSET_Y[index % OFFSET_Y.length],
      width: itemWidth,
      height: itemHeight,
      imageWidth: itemWidth * (kind === 'thing' ? 1 : width < 640 ? 0.55 : 0.6) * scale,
      imageHeight: (kind === 'thing' ? itemHeight - 100 : itemHeight) * scale,
    }
  })

  return {
    width,
    height: padding * 2 + Math.ceil(count / columns) * rowHeight,
    columns,
    padding,
    placements,
  }
}

export function clampCanvasPosition(
  point: Point,
  canvas: Size,
  item: Size,
  padding: number,
): Point {
  const maxX = Math.max(padding, canvas.width - item.width - padding)
  const maxY = Math.max(padding, canvas.height - item.height - padding)

  return {
    x: Math.min(maxX, Math.max(padding, point.x)),
    y: Math.min(maxY, Math.max(padding, point.y)),
  }
}

export type ManualPosition = Point

/** Preserve relative placement across resize, then clamp into the new bounds. */
export function remapCanvasPosition(args: {
  position: ManualPosition
  oldCanvas: Size
  newCanvas: Size
  item: Size
  oldItem?: Size
  oldPadding: number
  newPadding: number
}): Point {
  const { position, oldCanvas, newCanvas, item, oldItem = item, oldPadding, newPadding } = args

  const oldRange = Math.max(0, oldCanvas.width - oldItem.width - 2 * oldPadding)
  const newRange = Math.max(0, newCanvas.width - item.width - 2 * newPadding)
  const xFraction =
    oldRange > 0 ? Math.min(1, Math.max(0, (position.x - oldPadding) / oldRange)) : 0
  const resizedX = newPadding + xFraction * newRange

  const oldVerticalRange = Math.max(0, oldCanvas.height - oldItem.height - 2 * oldPadding)
  const newVerticalRange = Math.max(0, newCanvas.height - item.height - 2 * newPadding)
  const yFraction =
    oldVerticalRange > 0
      ? Math.min(1, Math.max(0, (position.y - oldPadding) / oldVerticalRange))
      : 0
  const resizedY = newPadding + yFraction * newVerticalRange

  return clampCanvasPosition({ x: resizedX, y: resizedY }, newCanvas, item, newPadding)
}
