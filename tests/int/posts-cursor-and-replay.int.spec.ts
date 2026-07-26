import { describe, expect, it } from 'vitest'

import {
  DESKTOP_COLUMNS,
  MOBILE_COLUMNS,
  TABLET_COLUMNS,
  appendPostsAndFillStories,
  createPackerState,
  sealWithClosingTile,
} from '@/app/(frontend)/_lib/feed-packer'
import { replayPackerBatches } from '@/app/(frontend)/_components/posts/replay-packer'
import {
  decodePostsCursor,
  encodePostsCursor,
  cursorFromPost,
} from '@/app/(frontend)/_lib/posts-cursor'
import type { EndOfFeedView, PostCardView, ShortStoryCardView } from '@/app/(frontend)/_lib/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

function makePost(
  overrides: Partial<PostCardView> & Pick<PostCardView, 'id' | 'cardSize'>,
): PostCardView {
  return {
    title: `Post ${overrides.id}`,
    href: null,
    publishedAt: '2026-01-01T00:00:00.000Z',
    image: null,
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
    allowedShapes: null,
    href: null,
    newTab: false,
    ...overrides,
  }
}

const closing: EndOfFeedView = {
  enabled: true,
  text: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: 'Thanks for reading', version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  } as DefaultTypedEditorState,
  preferredShape: '2x1',
}

describe('posts cursor', () => {
  it('round-trips publishedAt + id', () => {
    const encoded = encodePostsCursor({
      publishedAt: '2026-01-02T10:00:00.000Z',
      id: 42,
    })
    expect(decodePostsCursor(encoded)).toEqual({
      publishedAt: '2026-01-02T10:00:00.000Z',
      id: 42,
    })
  })

  it('rejects malformed cursors', () => {
    expect(decodePostsCursor(null)).toBeNull()
    expect(decodePostsCursor('nope')).toBeNull()
    expect(decodePostsCursor('p1.%%%')).toBeNull()
  })

  it('builds a cursor from a post card', () => {
    expect(cursorFromPost({ id: 7, publishedAt: null })).toBeNull()
    expect(
      decodePostsCursor(cursorFromPost({ id: 7, publishedAt: '2026-01-01T00:00:00.000Z' })),
    ).toEqual({
      publishedAt: '2026-01-01T00:00:00.000Z',
      id: 7,
    })
  })
})

describe('replayPackerBatches', () => {
  it('matches sequential packing for each breakpoint', () => {
    const postsPage1 = [
      makePost({ id: 1, cardSize: 'large' }),
      makePost({ id: 2, cardSize: 'small' }),
    ]
    const postsPage2 = [
      makePost({ id: 3, cardSize: 'wide' }),
      makePost({ id: 4, cardSize: 'tall' }),
    ]
    const stories = Array.from({ length: 20 }, (_, index) => makeStory({ id: index + 1 }))

    for (const columns of [MOBILE_COLUMNS, TABLET_COLUMNS, DESKTOP_COLUMNS]) {
      const sequential = sealWithClosingTile({
        state: appendPostsAndFillStories({
          state: appendPostsAndFillStories({
            state: createPackerState(columns),
            posts: postsPage1,
            stories,
            decorations: [],
            locale: 'en',
            fillStories: true,
          }),
          posts: postsPage2,
          stories,
          decorations: [],
          locale: 'en',
          fillStories: false,
        }),
        closing,
        decorations: [],
        locale: 'en',
      })

      const replayed = replayPackerBatches({
        columns,
        batches: [
          { posts: postsPage1, isFinal: false },
          { posts: postsPage2, isFinal: true },
        ],
        stories,
        decorations: [],
        locale: 'en',
        endOfFeed: closing,
      })

      expect(replayed.tiles.map((tile) => tile.key)).toEqual(
        sequential.tiles.map((tile) => tile.key),
      )
      expect(replayed.heights).toEqual(sequential.heights)
    }
  })
})
