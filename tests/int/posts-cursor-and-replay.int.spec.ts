import { describe, expect, it } from 'vitest'

import {
  decodePostsCursor,
  encodePostsCursor,
  cursorFromPost,
} from '@/app/(frontend)/_lib/posts-cursor'

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
