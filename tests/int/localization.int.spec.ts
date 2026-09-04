import { describe, it, beforeAll, expect } from 'vitest'
import type { Payload } from 'payload'

import {
  ensureTemplatePages,
  ensureTestUsers,
  initPayload,
  richText,
  type TestUsers,
} from '../helpers/payload'

describe('Localization', () => {
  let payload: Payload
  let users: TestUsers
  let postId: number
let postTemplatePageId: number

  beforeAll(async () => {
    payload = await initPayload()
    users = await ensureTestUsers(payload)
    const templates = await ensureTemplatePages(payload)
    postTemplatePageId = templates.postTemplatePageId

    const stamp = Date.now()
    const enSlug = `bilingual-${stamp}`
    const viSlug = `bai-viet-${stamp}`
    const viTitle = `Bài viết song ngữ ${stamp}`

    const post = await payload.create({
      collection: 'posts',
      data: {
        title: 'Bilingual Post',
        slug: enSlug,
        excerpt: 'English excerpt',
        content: richText('English body'),
        owner: users.admin.id,
        templatePage: postTemplatePageId,
        _status: 'published',
        translationReady: { vi: false },
        seo: {
          metaTitle: 'EN Meta Title',
          metaDescription: 'English meta description for SEO testing.',
        },
      },
      locale: 'en',
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    postId = post.id

    await payload.update({
      collection: 'posts',
      id: postId,
      data: {
        title: viTitle,
        slug: viSlug,
        excerpt: 'Tóm tắt tiếng Việt',
        content: richText('Nội dung tiếng Việt'),
        seo: {
          metaTitle: 'TIÊU ĐỀ META',
          metaDescription: 'Mô tả meta tiếng Việt cho kiểm thử SEO.',
        },
      },
      locale: 'vi',
      overrideAccess: true,
      context: { disableRevalidate: true },
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
    expect(doc.title).toMatch(/^Bài viết song ngữ/)
  })

  it('falls back to English when Vietnamese missing and fallback enabled', async () => {
    const partial = await payload.create({
      collection: 'posts',
      data: {
        title: 'English Only',
        slug: `en-only-${Date.now()}`,
        content: richText('only en'),
        owner: users.admin.id,
        templatePage: postTemplatePageId,
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
