import { beforeEach, describe, expect, it, vi } from 'vitest'

const { loadCards, loadVideoPreviewCards } = vi.hoisted(() => ({
  loadCards: vi.fn(),
  loadVideoPreviewCards: vi.fn(),
}))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/app/(frontend)/_lib/cms', () => ({
  getSiteShell: vi.fn(async () => ({ activeDecorationPackId: null })),
  getFeedDecorations: vi.fn(async () => []),
  getPostsPage: vi.fn(async () => ({ docs: [], nextCursor: null, hasNextPage: false })),
  getProjectsPage: vi.fn(async () => ({ docs: [], nextCursor: null, hasNextPage: false })),
  getVideosPage: vi.fn(async () => ({ docs: [], nextCursor: null, hasNextPage: false })),
}))
vi.mock('@/app/(frontend)/_lib/feed-registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/(frontend)/_lib/feed-registry')>()
  return {
    ...actual,
    loadVideoPreviewCards: (...args: unknown[]) => loadVideoPreviewCards(...args),
    FEED_SOURCE_REGISTRY: {
      ...actual.FEED_SOURCE_REGISTRY,
      videos: { ...actual.FEED_SOURCE_REGISTRY.videos, loadCards },
    },
  }
})

const { resolvePageBlocks } = await import('@/app/(frontend)/_lib/page-data')

describe('CMS videos provider-rows preview', () => {
  beforeEach(() => {
    loadCards.mockReset().mockResolvedValue([])
    loadVideoPreviewCards.mockReset().mockResolvedValue([])
  })

  it('forces static pagination and provider-rows layout for ordinary Videos blocks', async () => {
    const [block] = await resolvePageBlocks(
      [
        {
          blockType: 'pageFeedSection',
          feedType: 'videos',
          heading: 'Videos',
          source: 'latest',
          pagination: 'infinite',
          limit: 12,
        },
      ],
      'en',
    )

    expect(block).toMatchObject({
      pagination: 'static',
      nextCursor: null,
      hasNextPage: false,
      videosLayout: 'provider-rows',
    })
    // Provider-rows blocks call the dedicated loader, never the grid adapter.
    expect(loadVideoPreviewCards).toHaveBeenCalledWith({
      locale: 'en',
      source: 'latest',
      limitPerProvider: 12,
      manualIds: [],
    })
    expect(loadCards).not.toHaveBeenCalled()
  })

  it('falls back to provider-rows when no videosLayout context is set', async () => {
    const [block] = await resolvePageBlocks(
      [
        {
          blockType: 'pageFeedSection',
          feedType: 'videos',
          heading: 'Videos',
          source: 'manual',
          pagination: 'static',
          limit: 3,
          videoItems: [1, 2],
        },
      ],
      'vi',
    )
    expect(block).toMatchObject({ videosLayout: 'provider-rows', pagination: 'static' })
    expect(loadVideoPreviewCards).toHaveBeenCalledWith({
      locale: 'vi',
      source: 'manual',
      limitPerProvider: 3,
      manualIds: [1, 2],
    })
  })

  it('honors grid layout via context (canonical /videos archive)', async () => {
    // Canonical grid uses `loadCards` directly because pagination stays
    // 'infinite' and the section renders through the legacy FeedSection.
    const [block] = await resolvePageBlocks(
      [
        {
          blockType: 'pageFeedSection',
          feedType: 'videos',
          heading: 'Videos',
          source: 'latest',
          pagination: 'infinite',
          limit: 12,
        },
      ],
      'en',
      { videosLayout: 'grid' },
    )
    expect(block).toMatchObject({ videosLayout: 'grid', pagination: 'infinite' })
    // Provider-rows loader must not run for the archive grid.
    expect(loadVideoPreviewCards).not.toHaveBeenCalled()
  })
})