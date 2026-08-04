import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload } from 'payload'

import { isReservedCmsPageSlug } from '@/app/(frontend)/_lib/page-data'
import { isFeedPaginationMode } from '@/app/(frontend)/_lib/feed-registry'
import { publishedStatusWhere } from '@/lib/payload-queries'
import config from '@payload-config'

describe('CMS page by slug', () => {
  let payload: Awaited<ReturnType<typeof getPayload>>

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  it('recognizes feed pagination modes', () => {
    expect(isFeedPaginationMode('static')).toBe(true)
    expect(isFeedPaginationMode('infinite')).toBe(true)
    expect(isFeedPaginationMode('paged')).toBe(false)
  })

  it('treats home template slugs as reserved for dynamic page routes', () => {
    expect(isReservedCmsPageSlug('home')).toBe(true)
    expect(isReservedCmsPageSlug('Home')).toBe(true)
    expect(isReservedCmsPageSlug(' homepage ')).toBe(true)
    expect(isReservedCmsPageSlug('about')).toBe(false)
    expect(isReservedCmsPageSlug('posts')).toBe(false)
  })

  it('can query published non-home pages by slug with access control', async () => {
    const result = await payload.find({
      collection: 'pages',
      locale: 'en',
      fallbackLocale: false,
      where: {
        and: [
          publishedStatusWhere,
          { slug: { equals: 'about' } },
          { template: { not_equals: 'home' } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        template: true,
      },
    })

    expect(result.docs.length).toBeLessThanOrEqual(1)
    if (result.docs[0]) {
      expect(result.docs[0].slug).toBe('about')
      expect(result.docs[0].template).not.toBe('home')
    }
  })
})
