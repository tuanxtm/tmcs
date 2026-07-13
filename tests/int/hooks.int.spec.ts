import { describe, it, beforeAll, expect } from 'vitest'
import type { Payload } from 'payload'

import { ensureTestUsers, initPayload, richText, type TestUsers } from '../helpers/payload'
import { estimateReadingMinutes } from '@/lib/readingTime'

describe('Hooks and SEO', () => {
  let payload: Payload
  let users: TestUsers

  beforeAll(async () => {
    payload = await initPayload()
    users = await ensureTestUsers(payload)
  })

  it('estimates reading time from lexical content', () => {
    const minutes = estimateReadingMinutes(
      richText(Array.from({ length: 450 }, () => 'word').join(' ')),
    )
    expect(minutes).toBeGreaterThanOrEqual(3)
  })

  it('sets owner and readingTime on create', async () => {
    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Hook Post',
        slug: `hook-post-${Date.now()}`,
        content: richText('Hello world content for reading time.'),
        _status: 'draft',
      },
      draft: true,
      user: users.creatorA,
      overrideAccess: false,
    })

    expect(typeof post.owner === 'object' && post.owner ? post.owner.id : post.owner).toBe(
      users.creatorA.id,
    )
    expect(post.readingTime).toBeGreaterThanOrEqual(1)
  })

  it('sets publishedAt on first publish only', async () => {
    const draft = await payload.create({
      collection: 'posts',
      data: {
        title: 'Publish Date Post',
        slug: `pub-date-${Date.now()}`,
        content: richText('content'),
        owner: users.admin.id,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: true,
    })

    const published = await payload.update({
      collection: 'posts',
      id: draft.id,
      data: { _status: 'published' },
      user: users.admin,
      overrideAccess: false,
    })

    expect(published.publishedAt).toBeTruthy()
    const first = published.publishedAt

    const updated = await payload.update({
      collection: 'posts',
      id: draft.id,
      data: { title: 'Publish Date Post Updated', _status: 'published' },
      user: users.admin,
      overrideAccess: false,
    })

    expect(updated.publishedAt).toBe(first)
  })

  it('rejects invalid JSON-LD override on publish', async () => {
    // Draft saves skip validation (versions.drafts.validate: false).
    // Publishing should enforce SEO JSON-LD validation.
    await expect(
      payload.create({
        collection: 'posts',
        data: {
          title: 'Bad SEO',
          slug: `bad-seo-${Date.now()}`,
          content: richText('x'),
          owner: users.admin.id,
          _status: 'published',
          seo: {
            structuredData: {
              jsonLdOverride: 'not-json',
            },
          },
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow()
  })
})
