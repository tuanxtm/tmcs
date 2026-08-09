import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload } from 'payload'

import {
  clampLimit,
  FEED_SOURCE_REGISTRY,
  isFeedType,
  relationIds,
} from '@/app/(frontend)/_lib/feed-registry'
import { APIError } from 'payload'
import { validateHomePage } from '@/hooks'
import config from '@payload-config'

describe('homepage feed helpers', () => {
  it('clamps feed limits into a safe range', () => {
    expect(clampLimit(undefined)).toBe(11)
    expect(clampLimit(0)).toBe(1)
    expect(clampLimit(100)).toBe(48)
    expect(clampLimit(7.8)).toBe(7)
  })

  it('extracts relation ids from mixed Payload relationship values', () => {
    expect(relationIds([1, { id: 2 }, 'x', null])).toEqual([1, 2])
  })

  it('exposes posts, projects, things, and videos feed adapters', () => {
    expect(isFeedType('posts')).toBe(true)
    expect(isFeedType('videos')).toBe(true)
    expect(isFeedType('things')).toBe(true)
    expect(isFeedType('notes')).toBe(false)
    expect(FEED_SOURCE_REGISTRY.posts.defaultHeading).toBe('posts')
    expect(FEED_SOURCE_REGISTRY.projects.defaultViewAllLabel).toBe('View all projects')
    expect(FEED_SOURCE_REGISTRY.things.defaultHeading).toBe('things')
    expect(FEED_SOURCE_REGISTRY.videos.defaultCursorPopupItem).toBe('play')
  })
})

describe('validateHomePage', () => {
  it('rejects published home pages without exactly one hero block', async () => {
    await expect(
      validateHomePage({
        data: {
          template: 'home',
          _status: 'published',
          layout: [{ blockType: 'layoutFeedSection' }],
        },
        originalDoc: null,
        operation: 'create',
        req: {
          payload: {
            find: async () => ({ totalDocs: 0, docs: [] }),
          },
        },
      } as never),
    ).rejects.toBeInstanceOf(APIError)
  })

  it('rejects a second published home page', async () => {
    await expect(
      validateHomePage({
        data: {
          template: 'home',
          _status: 'published',
          layout: [{ blockType: 'layoutHero', title: 'Home' }],
        },
        originalDoc: null,
        operation: 'create',
        req: {
          payload: {
            find: async () => ({ totalDocs: 1, docs: [{ id: 99 }] }),
          },
        },
      } as never),
    ).rejects.toBeInstanceOf(APIError)
  })

  it('allows a valid published home page when no other home exists', async () => {
    const data = {
      template: 'home',
      _status: 'published',
      layout: [{ blockType: 'layoutHero', title: 'Home' }],
    }

    const result = await validateHomePage({
      data,
      originalDoc: null,
      operation: 'create',
      req: {
        payload: {
          find: async () => ({ totalDocs: 0, docs: [] }),
        },
      },
    } as never)

    expect(result).toBe(data)
  })
})

describe('home page Local API query', () => {
  let payload: Awaited<ReturnType<typeof getPayload>>

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  it('can query published home pages by template with access control enabled', async () => {
    const result = await payload.find({
      collection: 'pages',
      locale: 'en',
      where: {
        and: [{ _status: { equals: 'published' } }, { template: { equals: 'home' } }],
      },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      select: {
        title: true,
        template: true,
        layout: true,
      },
    })

    expect(result.docs.length).toBeLessThanOrEqual(1)
    if (result.docs[0]) {
      expect(result.docs[0].template).toBe('home')
      const layout = result.docs[0].layout || []
      const heroes = layout.filter((block) => block.blockType === 'layoutHero')
      expect(heroes.length).toBe(1)
    }
  })
})
