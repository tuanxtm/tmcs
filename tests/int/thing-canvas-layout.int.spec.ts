import { describe, expect, it } from 'vitest'

import {
  clampCanvasPosition,
  remapCanvasPosition,
  type CanvasPlacement,
} from '@/app/(frontend)/_components/canvas/canvas-layout'
import { getCanvasLayout } from '@/app/(frontend)/_components/canvas/canvas-layout'
import {
  createThingsArchiveBlock,
  prepareThingsArchiveBlocks,
} from '@/app/(frontend)/_lib/things-feed'
import type {
  FeedSectionBlockView,
  ThingCardView,
  ThingsPageView,
  ResolvedBlockView,
} from '@/app/(frontend)/_lib/types'

const getThingsCanvasLayout = (width: number, count: number) =>
  getCanvasLayout(width, count, 'thing')

const WIDTHS = [320, 390, 768, 1024, 1440, 1536, 1920, 2560]
const COUNTS = [1, 9, 10, 11, 20, 25]

function thing(id: number): ThingCardView {
  return {
    id,
    slug: null,
    name: `Thing ${id}`,
    description: null,
    primaryUrl: null,
    primaryImage: null,
    links: [],
    publishedAt: '2026-01-01T00:00:00.000Z',
  }
}

function bounds(width: number, count: number) {
  const layout = getThingsCanvasLayout(width, count)
  return layout
}

function overlaps(a: CanvasPlacement, b: CanvasPlacement): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

describe('project canvas layout', () => {
  it.each(WIDTHS)('keeps every default item inside the canvas at %ipx', (width) => {
    for (const count of COUNTS) {
      const layout = bounds(width, count)
      for (const placement of layout.placements) {
        expect(placement.x).toBeGreaterThanOrEqual(0)
        expect(placement.y).toBeGreaterThanOrEqual(0)
        expect(placement.x + placement.width).toBeLessThanOrEqual(layout.width + 0.001)
        expect(placement.y + placement.height).toBeLessThanOrEqual(layout.height + 0.001)
      }
    }
  })

  it('switches to three and four columns at the container breakpoints', () => {
    expect(getThingsCanvasLayout(320, 10).columns).toBe(2)
    expect(getThingsCanvasLayout(639, 10).columns).toBe(2)
    expect(getThingsCanvasLayout(640, 10).columns).toBe(2)
    expect(getThingsCanvasLayout(1023, 10).columns).toBe(2)
    expect(getThingsCanvasLayout(1024, 10).columns).toBe(3)
    expect(getThingsCanvasLayout(1535, 10).columns).toBe(3)
    expect(getThingsCanvasLayout(1536, 10).columns).toBe(4)
  })

  it('uses the documented padding, row height, and grid cell sizes', () => {
    expect(getThingsCanvasLayout(390, 10).padding).toBe(16)
    expect(getThingsCanvasLayout(768, 10).padding).toBe(24)
    expect(getThingsCanvasLayout(1440, 10).columns).toBe(3)
  })

  it('produces identical placements for identical inputs', () => {
    const first = getThingsCanvasLayout(1024, 20)
    const second = getThingsCanvasLayout(1024, 20)
    expect(second.placements).toEqual(first.placements)
  })

  it('never overlaps default items', () => {
    for (const width of WIDTHS) {
      for (const count of COUNTS) {
        const { placements } = getThingsCanvasLayout(width, count)
        for (let i = 0; i < placements.length; i += 1) {
          for (let j = i + 1; j < placements.length; j += 1) {
            expect(overlaps(placements[i], placements[j])).toBe(false)
          }
        }
      }
    }
  })

  it('reserves at least the minimum separation between default items', () => {
    for (const width of WIDTHS) {
      for (const count of COUNTS) {
        const { placements } = getThingsCanvasLayout(width, count)
        for (let i = 0; i < placements.length; i += 1) {
          for (let j = i + 1; j < placements.length; j += 1) {
            const a = placements[i]
            const b = placements[j]
            const gapX = Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width))
            const gapY = Math.max(b.y - (a.y + a.height), a.y - (b.y + b.height))
            expect(Math.max(gapX, gapY)).toBeGreaterThanOrEqual((width < 640 ? 16 : 24) - 0.001)
          }
        }
      }
    }
  })

  it('preserves earlier default coordinates when things are appended', () => {
    for (const width of WIDTHS) {
      const before = getThingsCanvasLayout(width, 9)
      const after = getThingsCanvasLayout(width, 25)
      expect(after.placements.slice(0, 9)).toEqual(before.placements)
      const partial = getThingsCanvasLayout(width, 7)
      expect(after.placements.slice(0, 7)).toEqual(partial.placements)
    }
  })
})

describe('clampCanvasPosition', () => {
  const canvas = { width: 1000, height: 800 }
  const item = { width: 200, height: 100 }
  const padding = 24

  it('clamps beyond every edge and corner', () => {
    expect(clampCanvasPosition({ x: -500, y: -500 }, canvas, item, padding)).toEqual({
      x: padding,
      y: padding,
    })
    expect(clampCanvasPosition({ x: 5000, y: 5000 }, canvas, item, padding)).toEqual({
      x: canvas.width - item.width - padding,
      y: canvas.height - item.height - padding,
    })
  })

  it('leaves in-bounds positions untouched', () => {
    expect(clampCanvasPosition({ x: 100, y: 200 }, canvas, item, padding)).toEqual({
      x: 100,
      y: 200,
    })
  })

  it('falls back to the padding on an axis where the item is larger than the canvas', () => {
    const oversizedWidth = { width: 2000, height: 10 }
    expect(
      clampCanvasPosition({ x: 40, y: 40 }, { width: 300, height: 200 }, oversizedWidth, padding),
    ).toEqual({ x: padding, y: 40 })

    const oversizedHeight = { width: 10, height: 2000 }
    expect(
      clampCanvasPosition({ x: 40, y: 40 }, { width: 300, height: 200 }, oversizedHeight, padding),
    ).toEqual({ x: 40, y: padding })
  })
})

describe('remapCanvasPosition', () => {
  it('uses the previous item size when preserving the right and bottom edges on resize', () => {
    const result = remapCanvasPosition({
      position: { x: 1016, y: 976 },
      oldCanvas: { width: 1440, height: 1200 },
      newCanvas: { width: 390, height: 800 },
      oldItem: { width: 400, height: 200 },
      item: { width: 160, height: 140 },
      oldPadding: 24,
      newPadding: 16,
    })
    expect(result).toEqual({ x: 214, y: 644 })
  })
  it('keeps the minimum position at the new minimum', () => {
    const result = remapCanvasPosition({
      position: { x: 24, y: 24 },
      oldCanvas: { width: 1440, height: 1200 },
      newCanvas: { width: 390, height: 800 },
      item: { width: 200, height: 160 },
      oldPadding: 24,
      newPadding: 16,
    })
    expect(result.x).toBeCloseTo(16, 6)
    expect(result.y).toBeCloseTo(16, 6)
  })

  it('keeps the maximum position at the new maximum', () => {
    const result = remapCanvasPosition({
      position: { x: 1440 - 200 - 24, y: 1200 - 160 - 24 },
      oldCanvas: { width: 1440, height: 1200 },
      newCanvas: { width: 390, height: 800 },
      item: { width: 200, height: 160 },
      oldPadding: 24,
      newPadding: 16,
    })
    expect(result.x).toBeCloseTo(390 - 200 - 16, 6)
    expect(result.y).toBeCloseTo(800 - 160 - 16, 6)
  })

  it('preserves the mid-range fraction', () => {
    const oldRange = 1440 - 200 - 48
    const newRange = 390 - 200 - 32
    const fraction = 0.25
    const result = remapCanvasPosition({
      position: { x: 24 + oldRange * fraction, y: 24 },
      oldCanvas: { width: 1440, height: 1200 },
      newCanvas: { width: 390, height: 800 },
      item: { width: 200, height: 160 },
      oldPadding: 24,
      newPadding: 16,
    })
    expect(result.x).toBeCloseTo(16 + newRange * fraction, 6)
  })
})

type ThingsBlock = Extract<FeedSectionBlockView, { feedType: 'things' }>

function thingsBlock(id: string, overrides: Partial<ThingsBlock> = {}): ThingsBlock {
  return {
    blockType: 'pageFeedSection',
    id,
    feedType: 'things',
    heading: `heading ${id}`,
    description: `description ${id}`,
    pagination: 'static',
    nextCursor: null,
    hasNextPage: false,
    showViewAll: true,
    viewAllLabel: { en: 'View all things', vi: 'Xem tất cả dự án' },
    viewAllHref: '/things',
    cursorPopup: 'things',
    cursorPopupEmpty: 'empty',
    cursorPopupItem: 'item',
    cursorPopupViewAll: 'view all',
    docs: [thing(1), thing(2)],
    ...overrides,
  }
}

function richText(id: string): ResolvedBlockView {
  return {
    blockType: 'pageRichText',
    id,
    content: {
      root: { type: 'root', children: [], version: 1, direction: 'ltr', format: '', indent: 0 },
    },
  }
}

function footer(id: string): ResolvedBlockView {
  return {
    blockType: 'pageFooter',
    id,
    footerText: null,
    labelSocialLinks: null,
    socialLinks: [],
    labelOtherLinks: null,
    otherLinks: [],
    cursorPopup: null,
    copyright: null,
  }
}

const archivePage: ThingsPageView = {
  docs: Array.from({ length: 10 }, (_, index) => thing(100 + index)),
  nextCursor: 'cursor-1',
  hasNextPage: true,
}

const fallback = thingsBlock('things-archive', { heading: 'things' })

describe('prepareThingsArchiveBlocks', () => {
  it('replaces the first things block and preserves its CMS labels and ids', () => {
    const first = thingsBlock('first-things', { heading: 'selected builds' })
    const second = thingsBlock('second-things')
    const blocks = [richText('intro'), first, second, footer('footer')]

    const result = prepareThingsArchiveBlocks(blocks, archivePage, fallback)

    expect(result).toHaveLength(4)
    const archive = result[1] as ThingsBlock
    expect(archive.id).toBe('first-things')
    expect(archive.heading).toBe('selected builds')
    expect(archive.description).toBe('description first-things')
    expect(archive.docs).toEqual(archivePage.docs)
    expect(archive.pagination).toBe('infinite')
    expect(archive.nextCursor).toBe('cursor-1')
    expect(archive.hasNextPage).toBe(true)
    expect(archive.showViewAll).toBe(false)
    expect(archive.viewAllLabel).toBeNull()
    expect(archive.viewAllHref).toBeNull()
    expect(archive.cursorPopupViewAll).toBeNull()
  })

  it('leaves additional project blocks as static previews', () => {
    const blocks = [thingsBlock('first-things'), thingsBlock('second-things')]
    const result = prepareThingsArchiveBlocks(blocks, archivePage, fallback)
    expect((result[1] as ThingsBlock).pagination).toBe('static')
    expect((result[1] as ThingsBlock).docs).toEqual([thing(1), thing(2)])
  })

  it('inserts the archive before the footer when no project block exists', () => {
    const blocks = [richText('intro'), footer('footer')]
    const result = prepareThingsArchiveBlocks(blocks, archivePage, fallback)
    expect(result).toHaveLength(3)
    const archive = result[1] as ThingsBlock
    expect(archive.id).toBe('things-archive')
    expect(archive.pagination).toBe('infinite')
    expect(archive.docs).toEqual(archivePage.docs)
    expect(result[2].blockType).toBe('pageFooter')
  })

  it('appends the archive when no footer exists', () => {
    const blocks = [richText('intro')]
    const result = prepareThingsArchiveBlocks(blocks, archivePage, fallback)
    expect(result).toHaveLength(2)
    const archive = result[1] as ThingsBlock
    expect(archive.id).toBe('things-archive')
    expect(archive.pagination).toBe('infinite')
  })

  it('leaves the source arrays and objects unchanged', () => {
    const first = thingsBlock('first-things')
    const blocks = [first, footer('footer')]
    const snapshot = JSON.parse(JSON.stringify(blocks))

    prepareThingsArchiveBlocks(blocks, archivePage, fallback)

    expect(JSON.parse(JSON.stringify(blocks))).toEqual(snapshot)
    expect(blocks[0]).toBe(first)
  })
})

describe('createThingsArchiveBlock', () => {
  it('builds an infinite archive block with no Show all link', () => {
    const block = createThingsArchiveBlock({
      page: archivePage,
      defaults: {
        heading: 'things',
        cursorPopup: 'cool things',
        cursorPopupEmpty: 'empty',
        cursorPopupItem: 'item',
      },
    })

    expect(block.id).toBe('things-archive')
    expect(block.feedType).toBe('things')
    expect(block.description).toBeNull()
    expect(block.pagination).toBe('infinite')
    expect(block.docs).toBe(archivePage.docs)
    expect(block.showViewAll).toBe(false)
    expect(block.viewAllHref).toBeNull()
  })
})
