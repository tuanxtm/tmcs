import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Thing } from '@payload-types'

const { find, cacheTag } = vi.hoisted(() => ({ find: vi.fn(), cacheTag: vi.fn() }))
vi.mock('payload', () => ({ getPayload: vi.fn(async () => ({ find })) }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag }))

const { getThingsPage, toThingCard } = await import('@/app/(frontend)/_lib/cms')
const { loadFeedPage } = await import('@/app/(frontend)/_lib/actions')
const { FEED_SOURCE_REGISTRY } = await import('@/app/(frontend)/_lib/feed-registry')
const { decodePostsCursor } = await import('@/app/(frontend)/_lib/posts-cursor')

function thing(id: number, publishedAt = '2026-01-01T00:00:00.000Z'): Thing {
  return {
    id,
    name: `Thing ${id}`,
    publishedAt,
    primaryUrl: 'https://shop.example/',
    primaryImage: { id: 100 + id, url: `/primary-${id}.png`, alt: 'Primary' },
    detailImage: { id: 200 + id, url: `/secondary-${id}.png`, alt: 'Secondary' },
  } as Thing
}

describe('Things keyset archive', () => {
  beforeEach(() => {
    find.mockReset()
    cacheTag.mockClear()
  })

  it('queries published Things with access checks, Primary Image, 10 visible and one lookahead', async () => {
    find.mockResolvedValue({ docs: Array.from({ length: 11 }, (_, i) => thing(30 - i)) })
    const page = await getThingsPage('vi')
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'things',
        locale: 'vi',
        sort: '-publishedAt,-id',
        limit: 11,
        depth: 1,
        overrideAccess: false,
        where: { _status: { equals: 'published' } },
        select: expect.objectContaining({ primaryImage: true }),
      }),
    )
    expect(find.mock.calls[0][0].select).not.toHaveProperty('detailImage')
    expect(cacheTag).toHaveBeenCalledWith('things', 'media')
    expect(page.docs.map((doc) => doc.id)).toEqual([30, 29, 28, 27, 26, 25, 24, 23, 22, 21])
    expect(page.docs[0].primaryImage?.url).toBe('/primary-30.png')
    expect(page.docs[0]).not.toHaveProperty('detailImage')
    expect(page.hasNextPage).toBe(true)
    expect(decodePostsCursor(page.nextCursor)).toEqual({
      id: 21,
      publishedAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('advances with the publishedAt/id tie-break and ends at the last batch', async () => {
    find.mockResolvedValueOnce({ docs: Array.from({ length: 11 }, (_, i) => thing(30 - i)) })
    const first = await getThingsPage('en')
    find.mockResolvedValueOnce({ docs: [thing(20)] })
    const second = await loadFeedPage('things', 'en', first.nextCursor)
    expect(find.mock.calls[1][0].where).toEqual({
      and: [
        { _status: { equals: 'published' } },
        {
          or: [
            { publishedAt: { less_than: '2026-01-01T00:00:00.000Z' } },
            {
              and: [
                { publishedAt: { equals: '2026-01-01T00:00:00.000Z' } },
                { id: { less_than: 21 } },
              ],
            },
          ],
        },
      ],
    })
    expect(second).toMatchObject({ nextCursor: null, hasNextPage: false })
    expect(second.docs).toHaveLength(1)
  })

  it.each([
    ['unknown', 'en', null],
    ['things', 'fr', null],
    ['things', 'en', 'bad'],
    ['things', 'en', 'x'.repeat(513)],
  ])('rejects invalid inputs before querying', async (feed, locale, cursor) => {
    await expect(loadFeedPage(feed!, locale!, cursor)).rejects.toThrow(/Invalid/)
    expect(find).not.toHaveBeenCalled()
  })

  it('never falls back to a secondary image', () => {
    expect(
      toThingCard({ ...thing(1), primaryImage: null } as unknown as Thing).primaryImage,
    ).toBeNull()
  })

  it('preserves manual ordering and applies the preview count', async () => {
    find.mockResolvedValue({ docs: [thing(2), thing(9), thing(8)] })
    const cards = await FEED_SOURCE_REGISTRY.things.loadCards({
      locale: 'en',
      source: 'manual',
      limit: 2,
      manualIds: [8, 2, 9],
    })
    expect(cards.map((doc) => doc.id)).toEqual([8, 2])
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideAccess: false,
        where: { and: [{ _status: { equals: 'published' } }, { id: { in: [8, 2, 9] } }] },
      }),
    )
  })

  it('restricts featured previews to featured published Things', async () => {
    find.mockResolvedValue({ docs: [thing(1)] })
    await FEED_SOURCE_REGISTRY.things.loadCards({
      locale: 'vi',
      source: 'featured',
      limit: 12,
      manualIds: [],
    })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: 'vi',
        limit: 12,
        where: { and: [{ _status: { equals: 'published' } }, { featured: { equals: true } }] },
      }),
    )
  })
})
