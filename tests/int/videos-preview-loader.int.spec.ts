import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Video } from '@payload-types'

const { find } = vi.hoisted(() => ({ find: vi.fn() }))

vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find })) }))
vi.mock('@payload-config', () => ({ default: {} }))

const { loadVideoPreviewCards } = await import('@/app/(frontend)/_lib/feed-registry')

function video(
  id: number,
  provider: Video['provider'] = 'youtube',
  publishedAt: string | null = '2026-01-01T00:00:00.000Z',
  featured = false,
): Video {
  return {
    id,
    title: `Video ${id}`,
    provider,
    sourceUrl: 'https://example.com/' + id,
    publishedAt,
    featured,
  } as unknown as Video
}

describe('loadVideoPreviewCards', () => {
  beforeEach(() => {
    find.mockReset()
  })

  function providerFromWhere(where: unknown): string | null {
    if (!where || typeof where !== 'object') return null
    const clauses = (where as { and?: unknown[] }).and
    if (!Array.isArray(clauses)) return null
    for (const clause of clauses) {
      const inner = (clause as { and?: Array<{ provider?: { equals?: string } }> }).and
      if (Array.isArray(inner)) {
        for (const sub of inner) {
          if (sub?.provider?.equals) return sub.provider.equals
        }
      }
      const direct = (clause as { provider?: { equals?: string } }).provider
      if (direct?.equals) return direct.equals
    }
    return null
  }

  it('runs four concurrent provider queries for latest and returns the canonical order', async () => {
    find.mockImplementation(async ({ where }) => {
      const provider = providerFromWhere(where)
      if (provider === 'youtube') return { docs: [video(1), video(2)] }
      if (provider === 'instagram') return { docs: [video(3)] }
      if (provider === 'tiktok') return { docs: [] }
      if (provider === 'other') return { docs: [video(4)] }
      return { docs: [] }
    })

    const cards = await loadVideoPreviewCards({
      locale: 'en',
      source: 'latest',
      limitPerProvider: 10,
      manualIds: [],
    })

    expect(find).toHaveBeenCalledTimes(4)
    expect(cards.map((c) => c.id)).toEqual([1, 2, 3, 4])
    // Each per-provider call must use published filtering + overrideAccess.
    for (const call of find.mock.calls) {
      expect(call[0]).toMatchObject({
        collection: 'videos',
        depth: 1,
        overrideAccess: false,
        sort: '-publishedAt,-id',
      })
    }
  })

  it('caps each provider at the normalized limit and ignores provider overflow', async () => {
    // Real Payload honors the `limit` arg; the mock respects it too.
    const many = Array.from({ length: 15 }, (_, i) => video(i + 1, 'youtube'))
    find.mockImplementation(async ({ where, limit }) => {
      const provider = providerFromWhere(where)
      if (provider !== 'youtube') return { docs: [] }
      return { docs: many.slice(0, limit ?? 10) }
    })

    const cards = await loadVideoPreviewCards({
      locale: 'en',
      source: 'latest',
      limitPerProvider: 4,
      manualIds: [],
    })
    expect(cards).toHaveLength(4)
    expect(cards.map((c) => c.id)).toEqual([1, 2, 3, 4])
    // youtube call uses the per-provider cap (4), not 48.
    const youtubeCall = find.mock.calls.find(
      ([args]) => providerFromWhere((args as { where?: unknown }).where) === 'youtube',
    )
    expect(youtubeCall?.[0]).toMatchObject({ limit: 4 })
  })

  it('normalizes a missing or above-cap limit to 10', async () => {
    find.mockResolvedValue({ docs: [] })

    await loadVideoPreviewCards({
      locale: 'en',
      source: 'latest',
      limitPerProvider: undefined as unknown as number,
      manualIds: [],
    })
    expect(find.mock.calls.every(([args]) => (args as { limit?: number }).limit === 10)).toBe(true)

    find.mockClear()
    await loadVideoPreviewCards({
      locale: 'en',
      source: 'latest',
      limitPerProvider: 99,
      manualIds: [],
    })
    expect(find.mock.calls.every(([args]) => (args as { limit: number }).limit === 10)).toBe(true)
  })

  it('only returns featured videos when source is featured', async () => {
    find.mockImplementation(async ({ where }) => {
      expect(where).toMatchObject({
        and: expect.arrayContaining([
          expect.objectContaining({
            and: expect.arrayContaining([{ featured: { equals: true } }]),
          }),
          { provider: expect.objectContaining({ equals: expect.any(String) }) },
        ]),
      })
      return { docs: [] }
    })

    await loadVideoPreviewCards({
      locale: 'en',
      source: 'featured',
      limitPerProvider: 5,
      manualIds: [],
    })
    expect(find).toHaveBeenCalledTimes(4)
  })

  it('preserves editor order within each provider for manual selection', async () => {
    find.mockResolvedValueOnce({
      docs: [
        video(11, 'youtube'),
        video(22, 'instagram'),
        video(33, 'tiktok'),
        video(44, 'other'),
      ],
    })

    const cards = await loadVideoPreviewCards({
      locale: 'en',
      source: 'manual',
      limitPerProvider: 5,
      manualIds: [44, 11, 33, 22],
    })

    // Canonical provider order is youtube, instagram, tiktok, other.
    expect(cards.map((c) => c.id)).toEqual([11, 22, 33, 44])
    expect(find).toHaveBeenCalledTimes(1)
    expect(find.mock.calls[0][0]).toMatchObject({
      limit: 4,
      overrideAccess: false,
      where: { and: [{ _status: { equals: 'published' } }, { id: { in: [44, 11, 33, 22] } }] },
    })
  })

  it('dedupes manual selection ids while preserving first-seen order', async () => {
    find.mockResolvedValueOnce({
      docs: [video(1, 'youtube'), video(2, 'instagram')],
    })

    const cards = await loadVideoPreviewCards({
      locale: 'en',
      source: 'manual',
      limitPerProvider: 5,
      manualIds: [1, 2, 1, 2],
    })
    expect(cards.map((c) => c.id)).toEqual([1, 2])
    // Only the unique ids should be passed to Payload.
    expect(find.mock.calls[0][0]).toMatchObject({
      limit: 2,
      where: { and: [{ _status: { equals: 'published' } }, { id: { in: [1, 2] } }] },
    })
  })

  it('returns an empty array when manual selection is empty', async () => {
    const cards = await loadVideoPreviewCards({
      locale: 'en',
      source: 'manual',
      limitPerProvider: 5,
      manualIds: [],
    })
    expect(cards).toEqual([])
    expect(find).not.toHaveBeenCalled()
  })

  it('skips deleted, unpublished, or missing manual ids without filling from other rows', async () => {
    find.mockResolvedValueOnce({
      docs: [video(2, 'youtube'), video(3, 'instagram')],
    })

    const cards = await loadVideoPreviewCards({
      locale: 'en',
      source: 'manual',
      limitPerProvider: 10,
      manualIds: [2, 9, 3, 7],
    })
    expect(cards.map((c) => c.id)).toEqual([2, 3])
  })

  it('applies the per-provider cap after editor order reconstruction for manual', async () => {
    find.mockResolvedValueOnce({
      docs: [
        video(1, 'youtube'),
        video(2, 'youtube'),
        video(3, 'youtube'),
        video(4, 'youtube'),
        video(5, 'youtube'),
      ],
    })

    const cards = await loadVideoPreviewCards({
      locale: 'en',
      source: 'manual',
      limitPerProvider: 3,
      manualIds: [1, 2, 3, 4, 5],
    })
    expect(cards.map((c) => c.id)).toEqual([1, 2, 3])
  })
})