import { describe, expect, it } from 'vitest'

import {
  appendPostsAndFillStories,
  createPackerState,
  DESKTOP_COLUMNS,
  MOBILE_COLUMNS,
  sealWithClosingTile,
  TABLET_COLUMNS,
} from '@/app/(frontend)/_lib/feed-packer'
import { resolvePostCardSize } from '@/app/(frontend)/_lib/post-card-layout'
import type { PostCardView, ShortStoryCardView } from '@/app/(frontend)/_lib/types'

function makePost(overrides: Partial<PostCardView> & Pick<PostCardView, 'id' | 'cardSize'>): PostCardView {
  return {
    title: `Post ${overrides.id}`,
    slug: `post-${overrides.id}`,
    href: null,
    excerpt: null,
    publishedAt: '2026-01-01T00:00:00.000Z',
    readingTime: 3,
    authorName: 'Author',
    categories: [],
    image: null,
    featured: false,
    ...overrides,
  }
}

function makeStory(
  overrides: Partial<ShortStoryCardView> & Pick<ShortStoryCardView, 'id'>,
): ShortStoryCardView {
  return {
    title: `Story ${overrides.id}`,
    text: `Body for story ${overrides.id}`,
    variant: 'note',
    image: null,
    allowedShapes: null,
    href: null,
    newTab: false,
    publishedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('resolvePostCardSize', () => {
  it('honors explicit non-auto sizes', () => {
    expect(resolvePostCardSize({ id: 1, cardSize: 'tall', featured: true })).toBe('tall')
    expect(resolvePostCardSize({ id: 1, cardSize: 'wide' })).toBe('wide')
  })

  it('uses large for featured auto posts', () => {
    expect(resolvePostCardSize({ id: 1, cardSize: 'auto', featured: true })).toBe('large')
  })

  it('uses aspect ratio thresholds', () => {
    expect(
      resolvePostCardSize({
        id: 1,
        cardSize: 'auto',
        image: { width: 1600, height: 900 },
      }),
    ).toBe('wide')
    expect(
      resolvePostCardSize({
        id: 1,
        cardSize: 'auto',
        image: { width: 600, height: 1200 },
      }),
    ).toBe('tall')
  })

  it('is deterministic for missing dimensions', () => {
    const a = resolvePostCardSize({ id: 42, cardSize: 'auto' })
    const b = resolvePostCardSize({ id: 42, cardSize: 'auto' })
    expect(a).toBe(b)
  })
})

describe('feed packer', () => {
  const closing = {
    enabled: true,
    eyebrow: 'End of feed',
    title: 'Thanks for reading',
    message: 'Come back later.',
    preferredShape: '2x1' as const,
  }

  it('packs posts and fills closed gaps with unique stories', () => {
    const posts = [
      makePost({ id: 1, cardSize: 'large' }),
      makePost({ id: 2, cardSize: 'small' }),
      makePost({ id: 3, cardSize: 'tall' }),
      makePost({ id: 4, cardSize: 'wide' }),
    ]
    const stories = Array.from({ length: 20 }, (_, index) => makeStory({ id: index + 1 }))

    const packed = appendPostsAndFillStories({
      state: createPackerState(),
      posts,
      stories,
      locale: 'en',
    })

    expect(packed.columns).toBe(DESKTOP_COLUMNS)
    expect(packed.tiles.some((tile) => tile.kind === 'post')).toBe(true)

    const storyIds = packed.tiles.filter((tile) => tile.kind === 'story').map((tile) => tile.story.id)
    expect(new Set(storyIds).size).toBe(storyIds.length)

    // No overlapping cells.
    const cells = new Set<string>()
    for (const tile of packed.tiles) {
      for (let row = tile.placement.row; row < tile.placement.row + tile.placement.rowSpan; row += 1) {
        for (
          let column = tile.placement.column;
          column < tile.placement.column + tile.placement.columnSpan;
          column += 1
        ) {
          const key = `${column},${row}`
          expect(cells.has(key)).toBe(false)
          cells.add(key)
          expect(column).toBeGreaterThanOrEqual(0)
          expect(column).toBeLessThan(DESKTOP_COLUMNS)
        }
      }
    }
  })

  it('places at most one story per closed pocket and never edge-adjacent stories', () => {
    const posts = [
      makePost({ id: 1, cardSize: 'large' }),
      makePost({ id: 2, cardSize: 'tall' }),
      makePost({ id: 3, cardSize: 'small' }),
      makePost({ id: 4, cardSize: 'wide' }),
      makePost({ id: 5, cardSize: 'small' }),
      makePost({ id: 6, cardSize: 'tall' }),
    ]
    const stories = Array.from({ length: 40 }, (_, index) => makeStory({ id: index + 1 }))

    const packed = appendPostsAndFillStories({
      state: createPackerState(),
      posts,
      stories,
      locale: 'en',
    })

    const storyTiles = packed.tiles.filter((tile) => tile.kind === 'story')
    for (let i = 0; i < storyTiles.length; i += 1) {
      for (let j = i + 1; j < storyTiles.length; j += 1) {
        const a = storyTiles[i]!.placement
        const b = storyTiles[j]!.placement
        const aRight = a.column + a.columnSpan
        const aBottom = a.row + a.rowSpan
        const bRight = b.column + b.columnSpan
        const bBottom = b.row + b.rowSpan
        const touchHorizontally = aRight === b.column || bRight === a.column
        const touchVertically = aBottom === b.row || bBottom === a.row
        const overlapY = a.row < bBottom && b.row < aBottom
        const overlapX = a.column < bRight && b.column < aRight
        expect((touchHorizontally && overlapY) || (touchVertically && overlapX)).toBe(false)
      }
    }
  })

  it('seals the feed with a single closing tile', () => {
    const posts = [
      makePost({ id: 1, cardSize: 'large' }),
      makePost({ id: 2, cardSize: 'tall' }),
      makePost({ id: 3, cardSize: 'small' }),
    ]
    const stories = Array.from({ length: 20 }, (_, index) => makeStory({ id: index + 1 }))

    const packed = appendPostsAndFillStories({
      state: createPackerState(),
      posts,
      stories,
      locale: 'en',
      fillStories: false,
    })
    const sealed = sealWithClosingTile({
      state: packed,
      closing,
      locale: 'en',
    })

    const closings = sealed.tiles.filter((tile) => tile.kind === 'closing')
    const storiesPlaced = sealed.tiles.filter((tile) => tile.kind === 'story')
    expect(closings).toHaveLength(1)
    expect(storiesPlaced).toHaveLength(0)
    expect(closings[0]?.title).toBe('Thanks for reading')
  })

  it('fills leftover holes with decorations', () => {
    const posts = [
      makePost({ id: 1, cardSize: 'large' }),
      makePost({ id: 2, cardSize: 'tall' }),
      makePost({ id: 3, cardSize: 'small' }),
      makePost({ id: 4, cardSize: 'wide' }),
    ]
    const stories = Array.from({ length: 8 }, (_, index) => makeStory({ id: index + 1 }))
    const decorations = Array.from({ length: 4 }, (_, index) => ({
      id: index + 1,
      title: `Plant ${index + 1}`,
      pack: 'plant' as const,
      svgMarkup: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="currentColor"/></svg>',
      allowedShapes: ['1x1'] as const,
      weight: 1,
    })).map((d) => ({ ...d, allowedShapes: [...d.allowedShapes] }))

    const packed = appendPostsAndFillStories({
      state: createPackerState(),
      posts,
      stories,
      decorations,
      locale: 'en',
    })

    const decoTiles = packed.tiles.filter((tile) => tile.kind === 'decoration')
    expect(decoTiles.length).toBeGreaterThan(0)

    // Closed holes below the waterline should be gone.
    const waterline = Math.max(...packed.heights)
    for (let row = 0; row < waterline; row += 1) {
      for (let column = 0; column < DESKTOP_COLUMNS; column += 1) {
        expect(packed.occupied[row]?.[column]).toBe(true)
      }
    }
  })

  it('produces identical output for the same inputs', () => {
    const posts = [
      makePost({ id: 10, cardSize: 'large' }),
      makePost({ id: 11, cardSize: 'small' }),
      makePost({ id: 12, cardSize: 'wide' }),
    ]
    const stories = Array.from({ length: 12 }, (_, index) => makeStory({ id: index + 100 }))

    const a = appendPostsAndFillStories({
      state: createPackerState(),
      posts,
      stories,
      locale: 'en',
    })
    const b = appendPostsAndFillStories({
      state: createPackerState(),
      posts,
      stories,
      locale: 'en',
    })

    expect(a.tiles).toEqual(b.tiles)
    expect(a.usedStoryIds).toEqual(b.usedStoryIds)
  })

  it('respects allowedShapes filtering', () => {
    const posts = [makePost({ id: 1, cardSize: 'large' }), makePost({ id: 2, cardSize: 'small' })]
    const stories = [
      makeStory({ id: 1, allowedShapes: ['1x1'] }),
      makeStory({ id: 2, allowedShapes: ['1x1'] }),
      makeStory({ id: 3, allowedShapes: ['1x1'] }),
      makeStory({ id: 4, allowedShapes: ['1x1'] }),
    ]

    const packed = appendPostsAndFillStories({
      state: createPackerState(),
      posts,
      stories,
      locale: 'en',
    })

    for (const tile of packed.tiles) {
      if (tile.kind === 'story') {
        expect(tile.shape).toBe('1x1')
      }
    }
  })

  it('does not move previous tiles when appending a new page', () => {
    const stories = Array.from({ length: 30 }, (_, index) => makeStory({ id: index + 1 }))
    const first = appendPostsAndFillStories({
      state: createPackerState(),
      posts: [makePost({ id: 1, cardSize: 'large' }), makePost({ id: 2, cardSize: 'tall' })],
      stories,
      locale: 'en',
    })

    const firstSnapshot = structuredClone(first.tiles)
    const second = appendPostsAndFillStories({
      state: first,
      posts: [makePost({ id: 3, cardSize: 'wide' }), makePost({ id: 4, cardSize: 'small' })],
      stories,
      locale: 'en',
    })

    expect(second.tiles.slice(0, firstSnapshot.length)).toEqual(firstSnapshot)
    expect(second.tiles.length).toBeGreaterThanOrEqual(firstSnapshot.length)
  })

  it('leaves gaps when the story pool is exhausted', () => {
    const packed = appendPostsAndFillStories({
      state: createPackerState(),
      posts: [makePost({ id: 1, cardSize: 'large' }), makePost({ id: 2, cardSize: 'tall' })],
      stories: [],
      locale: 'en',
    })

    expect(packed.tiles.every((tile) => tile.kind === 'post')).toBe(true)
  })

  function assertNoOverlapsAndInBounds(packed: ReturnType<typeof appendPostsAndFillStories>) {
    const cells = new Set<string>()
    for (const tile of packed.tiles) {
      for (let row = tile.placement.row; row < tile.placement.row + tile.placement.rowSpan; row += 1) {
        for (
          let column = tile.placement.column;
          column < tile.placement.column + tile.placement.columnSpan;
          column += 1
        ) {
          const key = `${column},${row}`
          expect(cells.has(key)).toBe(false)
          cells.add(key)
          expect(column).toBeGreaterThanOrEqual(0)
          expect(column).toBeLessThan(packed.columns)
        }
      }
    }
  }

  it('packs large posts into a 2-column mobile grid without overlaps', () => {
    const posts = [
      makePost({ id: 1, cardSize: 'large' }),
      makePost({ id: 2, cardSize: 'small' }),
      makePost({ id: 3, cardSize: 'tall' }),
      makePost({ id: 4, cardSize: 'wide' }),
      makePost({ id: 5, cardSize: 'small' }),
    ]
    const stories = Array.from({ length: 20 }, (_, index) =>
      makeStory({ id: index + 1, allowedShapes: ['3x1', '2x2', '2x1', '1x2', '1x1'] }),
    )

    const packed = appendPostsAndFillStories({
      state: createPackerState(MOBILE_COLUMNS),
      posts,
      stories,
      locale: 'en',
    })

    expect(packed.columns).toBe(MOBILE_COLUMNS)
    const large = packed.tiles.find((tile) => tile.kind === 'post' && tile.post.id === 1)
    expect(large?.placement.columnSpan).toBe(2)
    expect(large?.placement.rowSpan).toBe(2)
    assertNoOverlapsAndInBounds(packed)

    // 3x1 stories cannot fit on a 2-column grid.
    for (const tile of packed.tiles) {
      if (tile.kind === 'story') {
        expect(tile.shape).not.toBe('3x1')
        expect(tile.placement.columnSpan).toBeLessThanOrEqual(MOBILE_COLUMNS)
      }
    }
  })

  it('packs into a 3-column tablet grid and may place 3x1 stories', () => {
    const posts = [
      makePost({ id: 1, cardSize: 'large' }),
      makePost({ id: 2, cardSize: 'small' }),
      makePost({ id: 3, cardSize: 'tall' }),
      makePost({ id: 4, cardSize: 'wide' }),
      makePost({ id: 5, cardSize: 'small' }),
      makePost({ id: 6, cardSize: 'small' }),
    ]
    const stories = Array.from({ length: 30 }, (_, index) =>
      makeStory({ id: index + 1, allowedShapes: ['3x1', '2x2', '2x1', '1x2', '1x1'] }),
    )

    const packed = appendPostsAndFillStories({
      state: createPackerState(TABLET_COLUMNS),
      posts,
      stories,
      locale: 'en',
    })

    expect(packed.columns).toBe(TABLET_COLUMNS)
    assertNoOverlapsAndInBounds(packed)

    for (const tile of packed.tiles) {
      expect(tile.placement.column + tile.placement.columnSpan).toBeLessThanOrEqual(TABLET_COLUMNS)
    }
  })
})
