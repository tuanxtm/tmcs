import { describe, it, beforeAll, expect } from 'vitest'
import type { Payload } from 'payload'

import { ensureTestUsers, initPayload, richText, type TestUsers } from '../helpers/payload'

describe('Localization', () => {
  let payload: Payload
  let users: TestUsers
  let postId: number

  beforeAll(async () => {
    payload = await initPayload()
    users = await ensureTestUsers(payload)

    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Bilingual Post',
        slug: `bilingual-${Date.now()}`,
        excerpt: 'English excerpt',
        content: richText('English body'),
        owner: users.admin.id,
        _status: 'published',
        translationReady: { vi: false },
        seo: {
          metaTitle: 'EN Meta Title',
          metaDescription: 'English meta description for SEO testing.',
        },
      },
      locale: 'en',
      overrideAccess: true,
    })
    postId = post.id

    await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        title: 'Bài viết song ngữ',
        slug: `bai-viet-song-ngu-${Date.now()}`,
        excerpt: 'Tóm tắt tiếng Việt',
        content: richText('Nội dung tiếng Việt'),
        seo: {
          metaTitle: 'TIÊU ĐỀ META',
          metaDescription: 'Mô tả meta tiếng Việt cho kiểm thử SEO.',
        },
      },
      locale: 'vi',
      overrideAccess: true,
    })
  })

  it('returns English by default', async () => {
    const doc = await payload.findByID({
      collection: 'posts',
      id: postId,
      locale: 'en',
      overrideAccess: true,
    })
    expect(doc.title).toBe('Bilingual Post')
  })

  it('returns Vietnamese when requested', async () => {
    const doc = await payload.findByID({
      collection: 'posts',
      id: postId,
      locale: 'vi',
      fallbackLocale: false,
      overrideAccess: true,
    })
    expect(doc.title).toBe('Bài viết song ngữ')
  })

  it('falls back to English when Vietnamese missing and fallback enabled', async () => {
    const partial = await payload.create({
      collection: 'posts',
      data: {
        title: 'English Only',
        slug: `en-only-${Date.now()}`,
        content: richText('only en'),
        owner: users.admin.id,
        _status: 'published',
      },
      locale: 'en',
      overrideAccess: true,
    })

    const doc = await payload.findByID({
      collection: 'posts',
      id: partial.id,
      locale: 'vi',
      // default fallback behavior
      overrideAccess: true,
    })

    expect(doc.title).toBe('English Only')
  })

  it('stores localized SEO fields', async () => {
    const en = await payload.findByID({
      collection: 'posts',
      id: postId,
      locale: 'en',
      overrideAccess: true,
    })
    const vi = await payload.findByID({
      collection: 'posts',
      id: postId,
      locale: 'vi',
      fallbackLocale: false,
      overrideAccess: true,
    })

    expect(en.seo?.metaTitle).toBe('EN Meta Title')
    expect(vi.seo?.metaTitle).toBe('TIÊU ĐỀ META')
  })
})
