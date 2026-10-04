import { beforeEach, describe, expect, it, vi } from 'vitest'

const { loadCards } = vi.hoisted(() => ({ loadCards: vi.fn() }))

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/app/(frontend)/_lib/cms', () => ({
  getSiteShell: vi.fn(async () => ({ activeDecorationPackId: null })),
  getFeedDecorations: vi.fn(async () => []),
}))
vi.mock('@/app/(frontend)/_lib/feed-registry', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/(frontend)/_lib/feed-registry')>()
  return {
    ...actual,
    FEED_SOURCE_REGISTRY: {
      ...actual.FEED_SOURCE_REGISTRY,
      projects: { ...actual.FEED_SOURCE_REGISTRY.projects, loadCards },
    },
  }
})

const { resolvePageBlocks } = await import('@/app/(frontend)/_lib/page-data')

describe('CMS project previews', () => {
  beforeEach(() => {
    loadCards.mockReset().mockResolvedValue([])
  })

  it.each([3, 12, 48])(
    'honors the saved count %i even for legacy infinite blocks',
    async (limit) => {
      const [block] = await resolvePageBlocks(
        [
          {
            blockType: 'pageFeedSection',
            feedType: 'projects',
            heading: 'Projects',
            source: 'latest',
            pagination: 'infinite',
            limit,
          },
        ],
        'en',
      )

      expect(loadCards).toHaveBeenCalledWith(expect.objectContaining({ limit, source: 'latest' }))
      expect(block).toMatchObject({ pagination: 'static', nextCursor: null, hasNextPage: false })
    },
  )

  it.each(['en', 'vi'] as const)(
    'defaults missing count to 12 and uses the canonical %s archive',
    async (locale) => {
      const [block] = await resolvePageBlocks(
        [
          {
            blockType: 'pageFeedSection',
            feedType: 'projects',
            heading: 'Projects',
            source: 'manual',
            limit: undefined as unknown as number,
            projectItems: [8, 2, 9],
            showViewAll: true,
            viewAllPage: { id: 7, slug: 'custom-projects' } as never,
          },
        ],
        locale,
      )

      expect(loadCards).toHaveBeenCalledWith({
        locale,
        source: 'manual',
        manualIds: [8, 2, 9],
        limit: 12,
      })
      expect(block).toMatchObject({ viewAllHref: locale === 'vi' ? '/vi/projects' : '/projects' })
    },
  )
})
