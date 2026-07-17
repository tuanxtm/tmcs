import { CARD_SIZE_SPANS, hashId, type ResolvedCardSize } from './post-card-layout'
import type {
  EndOfFeedView,
  FeedDecorationView,
  PostCardView,
  ShortStoryCardView,
  StoryShape,
} from './types'

export const MOBILE_COLUMNS = 2
export const TABLET_COLUMNS = 3
export const DESKTOP_COLUMNS = 4

export type GridPlacement = {
  column: number
  row: number
  columnSpan: number
  rowSpan: number
}

export type PlacedPostTile = {
  kind: 'post'
  key: string
  post: PostCardView
  placement: GridPlacement
}

export type PlacedStoryTile = {
  kind: 'story'
  key: string
  story: ShortStoryCardView
  shape: StoryShape
  placement: GridPlacement
}

export type PlacedClosingTile = {
  kind: 'closing'
  key: 'closing'
  eyebrow: string | null
  title: string
  message: string | null
  shape: StoryShape
  placement: GridPlacement
}

export type PlacedDecorationTile = {
  kind: 'decoration'
  key: string
  decoration: FeedDecorationView
  shape: StoryShape
  placement: GridPlacement
}

export type PlacedFeedTile =
  | PlacedPostTile
  | PlacedStoryTile
  | PlacedClosingTile
  | PlacedDecorationTile

export type PackerState = {
  columns: number
  occupied: boolean[][]
  heights: number[]
  usedStoryIds: number[]
  tiles: PlacedFeedTile[]
  generation: number
}

export type StoryShapeSpan = {
  shape: StoryShape
  columnSpan: number
  rowSpan: number
  weight: number
}

export const STORY_SHAPE_SPANS: StoryShapeSpan[] = [
  { shape: '3x1', columnSpan: 3, rowSpan: 1, weight: 3 },
  { shape: '2x2', columnSpan: 2, rowSpan: 2, weight: 5 },
  { shape: '2x1', columnSpan: 2, rowSpan: 1, weight: 4 },
  { shape: '1x2', columnSpan: 1, rowSpan: 2, weight: 3 },
  { shape: '1x1', columnSpan: 1, rowSpan: 1, weight: 3 },
]

type Cell = { column: number; row: number }

function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function ensureRows(occupied: boolean[][], rowCount: number, columns: number): void {
  while (occupied.length < rowCount) {
    occupied.push(Array.from({ length: columns }, () => false))
  }
}

function canPlace(
  occupied: boolean[][],
  columns: number,
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number,
): boolean {
  if (column < 0 || row < 0 || column + columnSpan > columns) return false
  ensureRows(occupied, row + rowSpan, columns)
  for (let r = row; r < row + rowSpan; r += 1) {
    for (let c = column; c < column + columnSpan; c += 1) {
      if (occupied[r]?.[c]) return false
    }
  }
  return true
}

function markOccupied(
  occupied: boolean[][],
  heights: number[],
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number,
): void {
  ensureRows(occupied, row + rowSpan, heights.length)
  for (let r = row; r < row + rowSpan; r += 1) {
    for (let c = column; c < column + columnSpan; c += 1) {
      occupied[r][c] = true
    }
  }
  for (let c = column; c < column + columnSpan; c += 1) {
    heights[c] = Math.max(heights[c], row + rowSpan)
  }
}

function findSkylinePlacement(
  heights: number[],
  columns: number,
  columnSpan: number,
  rowSpan: number,
): GridPlacement | null {
  let best: GridPlacement | null = null

  for (let column = 0; column <= columns - columnSpan; column += 1) {
    let startRow = 0
    for (let c = column; c < column + columnSpan; c += 1) {
      startRow = Math.max(startRow, heights[c] ?? 0)
    }

    const candidate: GridPlacement = {
      column,
      row: startRow,
      columnSpan,
      rowSpan,
    }

    if (
      !best ||
      candidate.row < best.row ||
      (candidate.row === best.row && candidate.column < best.column)
    ) {
      best = candidate
    }
  }

  return best
}

function cellKey(column: number, row: number): string {
  return `${column},${row}`
}

function findClosedEmptyCells(occupied: boolean[][], heights: number[], columns: number): Cell[] {
  const waterline = Math.max(0, ...heights)
  const empty: Cell[] = []
  for (let row = 0; row < waterline; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      if (!occupied[row]?.[column]) {
        empty.push({ column, row })
      }
    }
  }
  return empty
}

function connectedRegions(cells: Cell[], columns: number): Cell[][] {
  const remaining = new Map(cells.map((cell) => [cellKey(cell.column, cell.row), cell]))
  const regions: Cell[][] = []

  while (remaining.size > 0) {
    const start = remaining.values().next().value as Cell
    remaining.delete(cellKey(start.column, start.row))
    const region: Cell[] = []
    const queue = [start]

    while (queue.length > 0) {
      const current = queue.shift()!
      region.push(current)
      const neighbors = [
        { column: current.column - 1, row: current.row },
        { column: current.column + 1, row: current.row },
        { column: current.column, row: current.row - 1 },
        { column: current.column, row: current.row + 1 },
      ]
      for (const neighbor of neighbors) {
        if (neighbor.column < 0 || neighbor.column >= columns || neighbor.row < 0) continue
        const key = cellKey(neighbor.column, neighbor.row)
        if (!remaining.has(key)) continue
        remaining.delete(key)
        queue.push(neighbor)
      }
    }

    regions.push(region)
  }

  return regions
}

function shapeFitsInRegion(
  regionKeys: Set<string>,
  column: number,
  row: number,
  columnSpan: number,
  rowSpan: number,
): boolean {
  for (let r = row; r < row + rowSpan; r += 1) {
    for (let c = column; c < column + columnSpan; c += 1) {
      if (!regionKeys.has(cellKey(c, r))) return false
    }
  }
  return true
}

function storyAllowsShape(story: ShortStoryCardView, shape: StoryShape): boolean {
  if (!story.allowedShapes || story.allowedShapes.length === 0) return true
  return story.allowedShapes.includes(shape)
}

function pickWeighted<T extends { weight: number }>(items: T[], rand: () => number): T | null {
  if (items.length === 0) return null
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let cursor = rand() * total
  for (const item of items) {
    cursor -= item.weight
    if (cursor <= 0) return item
  }
  return items[items.length - 1] ?? null
}

type ShapeCandidate = {
  shape: StoryShape
  column: number
  row: number
  columnSpan: number
  rowSpan: number
  weight: number
  area: number
}

/** Mark hole cells occupied without raising the skyline — keeps gaps empty of tiles. */
function reserveCells(occupied: boolean[][], columns: number, cells: Iterable<Cell>): void {
  for (const cell of cells) {
    ensureRows(occupied, cell.row + 1, columns)
    occupied[cell.row]![cell.column] = true
  }
}

function collectShapeCandidates(regionKeys: Set<string>): ShapeCandidate[] {
  const candidates: ShapeCandidate[] = []
  for (const key of regionKeys) {
    const [column, row] = key.split(',').map(Number)
    for (const shapeDef of STORY_SHAPE_SPANS) {
      if (
        shapeFitsInRegion(regionKeys, column, row, shapeDef.columnSpan, shapeDef.rowSpan)
      ) {
        candidates.push({
          shape: shapeDef.shape,
          column,
          row,
          columnSpan: shapeDef.columnSpan,
          rowSpan: shapeDef.rowSpan,
          weight: shapeDef.weight,
          area: shapeDef.columnSpan * shapeDef.rowSpan,
        })
      }
    }
  }
  return candidates
}

function pickLargestPlacement(
  candidates: ShapeCandidate[],
  rand: () => number,
): ShapeCandidate | null {
  if (candidates.length === 0) return null
  const maxArea = Math.max(...candidates.map((candidate) => candidate.area))
  const largest = candidates.filter((candidate) => candidate.area === maxArea)
  return pickWeighted(largest, rand)
}

function pickStoryForShape(
  stories: ShortStoryCardView[],
  usedStoryIds: Set<number>,
  shape: StoryShape,
  seed: number,
  rand: () => number,
): ShortStoryCardView | null {
  const available = stories.filter(
    (story) => !usedStoryIds.has(story.id) && storyAllowsShape(story, shape),
  )
  if (available.length === 0) return null

  const ordered = [...available].sort((a, b) => {
    const ha = hashId(`${seed}:${a.id}`)
    const hb = hashId(`${seed}:${b.id}`)
    return ha - hb
  })
  return ordered[Math.floor(rand() * ordered.length)] ?? null
}

function placeStoryTile(options: {
  story: ShortStoryCardView
  shape: StoryShape
  column: number
  row: number
  columnSpan: number
  rowSpan: number
  occupied: boolean[][]
  heights: number[]
  usedStoryIds: Set<number>
}): PlacedStoryTile {
  const { story, shape, column, row, columnSpan, rowSpan, occupied, heights, usedStoryIds } =
    options
  usedStoryIds.add(story.id)
  markOccupied(occupied, heights, column, row, columnSpan, rowSpan)
  return {
    kind: 'story',
    key: `story-${story.id}`,
    story,
    shape,
    placement: { column, row, columnSpan, rowSpan },
  }
}

/** Stories must not share an edge — keeps fillers visually separated. */
function storiesShareEdge(a: GridPlacement, b: GridPlacement): boolean {
  const aRight = a.column + a.columnSpan
  const aBottom = a.row + a.rowSpan
  const bRight = b.column + b.columnSpan
  const bBottom = b.row + b.rowSpan

  const touchHorizontally = aRight === b.column || bRight === a.column
  const touchVertically = aBottom === b.row || bBottom === a.row
  const overlapY = a.row < bBottom && b.row < aBottom
  const overlapX = a.column < bRight && b.column < aRight

  return (touchHorizontally && overlapY) || (touchVertically && overlapX)
}

function conflictsWithPlacedStories(
  placement: GridPlacement,
  placedStories: PlacedStoryTile[],
): boolean {
  return placedStories.some((tile) => storiesShareEdge(placement, tile.placement))
}

/**
 * Place at most one story in a closed gap, preferring the largest footprint.
 * Remaining cells are reserved (no tile) so later pages do not densify the hole.
 */
function fillRegionOnce(options: {
  region: Cell[]
  stories: ShortStoryCardView[]
  usedStoryIds: Set<number>
  occupied: boolean[][]
  heights: number[]
  columns: number
  locale: string
  generation: number
  regionIndex: number
  placedStories: PlacedStoryTile[]
}): PlacedStoryTile | null {
  const {
    region,
    stories,
    usedStoryIds,
    occupied,
    heights,
    columns,
    locale,
    generation,
    regionIndex,
    placedStories,
  } = options
  const regionKeys = new Set(region.map((cell) => cellKey(cell.column, cell.row)))
  const seed = hashId(
    `${locale}:${generation}:${regionIndex}:${[...regionKeys].sort().join('|')}`,
  )
  const rand = createRng(seed)

  const candidates = collectShapeCandidates(regionKeys)
  if (candidates.length === 0) {
    return null
  }

  const areas = [...new Set(candidates.map((candidate) => candidate.area))].sort((a, b) => b - a)

  for (const area of areas) {
    const pool = candidates.filter((candidate) => candidate.area === area)
    // Try a few weighted picks at this size before stepping down.
    const attempts = Math.min(pool.length, 3)
    const remaining = [...pool]
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const picked = pickWeighted(remaining, rand)
      if (!picked) break
      remaining.splice(remaining.indexOf(picked), 1)

      if (conflictsWithPlacedStories(picked, placedStories)) continue

      const story = pickStoryForShape(stories, usedStoryIds, picked.shape, seed, rand)
      if (!story) continue

      return placeStoryTile({
        story,
        shape: picked.shape,
        column: picked.column,
        row: picked.row,
        columnSpan: picked.columnSpan,
        rowSpan: picked.rowSpan,
        occupied,
        heights,
        usedStoryIds,
      })
    }
  }

  // Leave the pocket for decorations — do not reserve empties here.
  return null
}

function shapeSpan(shape: StoryShape): { columnSpan: number; rowSpan: number } {
  const found = STORY_SHAPE_SPANS.find((entry) => entry.shape === shape)
  return found
    ? { columnSpan: found.columnSpan, rowSpan: found.rowSpan }
    : { columnSpan: 1, rowSpan: 1 }
}

function decorationAllowsShape(decoration: FeedDecorationView, shape: StoryShape): boolean {
  if (!decoration.allowedShapes || decoration.allowedShapes.length === 0) {
    return shape === '1x1'
  }
  return decoration.allowedShapes.includes(shape)
}

function fillRemainingWithDecorations(options: {
  occupied: boolean[][]
  heights: number[]
  columns: number
  decorations: FeedDecorationView[]
  locale: string
  generation: number
  tiles: PlacedFeedTile[]
}): void {
  const { occupied, heights, columns, decorations, locale, generation, tiles } = options
  if (decorations.length === 0) return

  let step = 0
  // Keep packing until closed holes are gone. Decorations may repeat.
  while (true) {
    const emptyCells = findClosedEmptyCells(occupied, heights, columns)
    if (emptyCells.length === 0) break

    const regions = connectedRegions(emptyCells, columns).sort((a, b) => b.length - a.length)
    let placedAny = false

    for (let regionIndex = 0; regionIndex < regions.length; regionIndex += 1) {
      const region = regions[regionIndex]!
      const regionKeys = new Set(region.map((cell) => cellKey(cell.column, cell.row)))
      const seed = hashId(
        `${locale}:deco:${generation}:${step}:${regionIndex}:${[...regionKeys].sort().join('|')}`,
      )
      const rand = createRng(seed)

      const candidates = collectShapeCandidates(regionKeys).filter((candidate) =>
        decorations.some((decoration) => decorationAllowsShape(decoration, candidate.shape)),
      )
      if (candidates.length === 0) {
        // Nothing fits — reserve so we do not loop forever.
        reserveCells(occupied, columns, region)
        continue
      }

      const areas = [...new Set(candidates.map((c) => c.area))].sort((a, b) => b - a)
      let placed: PlacedDecorationTile | null = null

      for (const area of areas) {
        const pool = candidates.filter((candidate) => candidate.area === area)
        const picked = pickWeighted(pool, rand)
        if (!picked) continue

        const poolDecorations = decorations
          .filter((decoration) => decorationAllowsShape(decoration, picked.shape))
          .map((decoration) => ({ ...decoration, weight: decoration.weight }))
        const decoration = pickWeighted(poolDecorations, rand)
        if (!decoration) continue

        markOccupied(
          occupied,
          heights,
          picked.column,
          picked.row,
          picked.columnSpan,
          picked.rowSpan,
        )
        placed = {
          kind: 'decoration',
          key: `decoration-${decoration.id}-${picked.column}-${picked.row}-${generation}-${step}`,
          decoration,
          shape: picked.shape,
          placement: {
            column: picked.column,
            row: picked.row,
            columnSpan: picked.columnSpan,
            rowSpan: picked.rowSpan,
          },
        }
        break
      }

      if (placed) {
        tiles.push(placed)
        placedAny = true
        step += 1
      } else {
        reserveCells(occupied, columns, region)
      }
    }

    if (!placedAny) break
  }
}

export function createPackerState(columns = DESKTOP_COLUMNS): PackerState {
  return {
    columns,
    occupied: [],
    heights: Array.from({ length: columns }, () => 0),
    usedStoryIds: [],
    tiles: [],
    generation: 0,
  }
}

function placePosts(options: {
  posts: PostCardView[]
  occupied: boolean[][]
  heights: number[]
  columns: number
  tiles: PlacedFeedTile[]
}): void {
  for (const post of options.posts) {
    const size: ResolvedCardSize = post.cardSize
    const span = CARD_SIZE_SPANS[size]
    const placement = findSkylinePlacement(
      options.heights,
      options.columns,
      span.columnSpan,
      span.rowSpan,
    )
    if (!placement) continue
    if (
      !canPlace(
        options.occupied,
        options.columns,
        placement.column,
        placement.row,
        placement.columnSpan,
        placement.rowSpan,
      )
    ) {
      continue
    }

    markOccupied(
      options.occupied,
      options.heights,
      placement.column,
      placement.row,
      placement.columnSpan,
      placement.rowSpan,
    )
    options.tiles.push({
      kind: 'post',
      key: `post-${post.id}`,
      post,
      placement,
    })
  }
}

/**
 * Append posts and sparsely fill closed gaps with at most one Short story per pocket.
 * Remaining holes are packed with decorations from the active pack (reuse allowed).
 */
export function appendPostsAndFillStories(options: {
  state: PackerState
  posts: PostCardView[]
  stories: ShortStoryCardView[]
  decorations?: FeedDecorationView[]
  locale: string
  /** When false, only posts are placed (used on the final page before sealing). */
  fillStories?: boolean
}): PackerState {
  const occupied = options.state.occupied.map((row) => [...row])
  const heights = [...options.state.heights]
  const usedStoryIds = new Set(options.state.usedStoryIds)
  const tiles = [...options.state.tiles]
  const columns = options.state.columns
  const generation = options.state.generation + 1
  const fillStories = options.fillStories !== false
  const decorations = options.decorations ?? []

  placePosts({ posts: options.posts, occupied, heights, columns, tiles })

  if (fillStories) {
    const emptyCells = findClosedEmptyCells(occupied, heights, columns)
    const regions = connectedRegions(emptyCells, columns).sort((a, b) => b.length - a.length)
    const placedStories = tiles.filter((tile): tile is PlacedStoryTile => tile.kind === 'story')

    regions.forEach((region, regionIndex) => {
      const tile = fillRegionOnce({
        region,
        stories: options.stories,
        usedStoryIds,
        occupied,
        heights,
        columns,
        locale: options.locale,
        generation,
        regionIndex,
        placedStories,
      })
      if (tile) {
        tiles.push(tile)
        placedStories.push(tile)
      }
    })
  }

  fillRemainingWithDecorations({
    occupied,
    heights,
    columns,
    decorations,
    locale: options.locale,
    generation,
    tiles,
  })

  return {
    columns,
    occupied,
    heights,
    usedStoryIds: [...usedStoryIds],
    tiles,
    generation,
  }
}

/**
 * Place exactly one Homepage end-of-feed tile into the last gaps, then fill leftovers with decorations.
 */
export function sealWithClosingTile(options: {
  state: PackerState
  closing: EndOfFeedView
  decorations?: FeedDecorationView[]
  locale: string
}): PackerState {
  const occupied = options.state.occupied.map((row) => [...row])
  const heights = [...options.state.heights]
  const tiles = [...options.state.tiles]
  const columns = options.state.columns
  const generation = options.state.generation + 1
  const decorations = options.decorations ?? []

  if (tiles.some((tile) => tile.kind === 'closing')) {
    return { ...options.state }
  }

  const emptyCells = findClosedEmptyCells(occupied, heights, columns)
  const regionKeys = new Set(emptyCells.map((cell) => cellKey(cell.column, cell.row)))
  const seed = hashId(`${options.locale}:closing:${[...regionKeys].sort().join('|')}`)
  const rand = createRng(seed)

  let placement: GridPlacement | null = null
  let shape: StoryShape = options.closing.preferredShape

  if (options.closing.enabled) {
    const candidates = collectShapeCandidates(regionKeys)
    const preferred = candidates.filter(
      (candidate) => candidate.shape === options.closing.preferredShape,
    )
    const picked =
      pickLargestPlacement(preferred.length > 0 ? preferred : candidates, rand) ??
      pickLargestPlacement(candidates, rand)

    if (picked) {
      placement = {
        column: picked.column,
        row: picked.row,
        columnSpan: picked.columnSpan,
        rowSpan: picked.rowSpan,
      }
      shape = picked.shape
    } else {
      // No closed hole — sit the closer on the skyline.
      const preferredSpan = shapeSpan(options.closing.preferredShape)
      const skyline = findSkylinePlacement(
        heights,
        columns,
        preferredSpan.columnSpan,
        preferredSpan.rowSpan,
      )
      if (
        skyline &&
        canPlace(
          occupied,
          columns,
          skyline.column,
          skyline.row,
          skyline.columnSpan,
          skyline.rowSpan,
        )
      ) {
        placement = skyline
        shape = options.closing.preferredShape
      } else {
        const fallback = findSkylinePlacement(heights, columns, 1, 1)
        if (
          fallback &&
          canPlace(
            occupied,
            columns,
            fallback.column,
            fallback.row,
            fallback.columnSpan,
            fallback.rowSpan,
          )
        ) {
          placement = fallback
          shape = '1x1'
        }
      }
    }
  }

  if (options.closing.enabled && placement) {
    markOccupied(
      occupied,
      heights,
      placement.column,
      placement.row,
      placement.columnSpan,
      placement.rowSpan,
    )
    tiles.push({
      kind: 'closing',
      key: 'closing',
      eyebrow: options.closing.eyebrow,
      title: options.closing.title,
      message: options.closing.message,
      shape,
      placement,
    })
  }

  fillRemainingWithDecorations({
    occupied,
    heights,
    columns,
    decorations,
    locale: options.locale,
    generation,
    tiles,
  })

  return {
    columns,
    occupied,
    heights,
    usedStoryIds: [...options.state.usedStoryIds],
    tiles,
    generation,
  }
}

/** Logical feed order for mobile / simplified layouts. */
export function sortTilesForReading(tiles: PlacedFeedTile[]): PlacedFeedTile[] {
  return [...tiles].sort((a, b) => {
    if (a.placement.row !== b.placement.row) return a.placement.row - b.placement.row
    if (a.placement.column !== b.placement.column) {
      return a.placement.column - b.placement.column
    }
    return a.key.localeCompare(b.key)
  })
}
