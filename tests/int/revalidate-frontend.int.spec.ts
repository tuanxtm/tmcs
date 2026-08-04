import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

import {
  createCollectionRevalidateDeleteHook,
  createCollectionRevalidateHook,
  createGlobalRevalidateHook,
  revalidatePages,
} from '@/hooks/revalidateFrontend'
import { CACHE_TAGS } from '@/lib/cache-tags'

describe('revalidateFrontend hooks', () => {
  beforeEach(() => {
    revalidateTag.mockClear()
  })

  it('revalidates when a published document changes', () => {
    const hook = createCollectionRevalidateHook([CACHE_TAGS.posts])
    const doc = { _status: 'published' }
    const result = hook({
      doc,
      previousDoc: { _status: 'draft' },
      req: { context: {}, payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(result).toBe(doc)
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.posts, 'max')
  })

  it('skips invalidation when context.disableRevalidate is set', () => {
    const hook = createCollectionRevalidateHook([CACHE_TAGS.posts])
    hook({
      doc: { _status: 'published' },
      previousDoc: { _status: 'published' },
      req: { context: { disableRevalidate: true }, payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('does not revalidate draft-only changes', () => {
    const hook = createCollectionRevalidateHook([CACHE_TAGS.posts])
    hook({
      doc: { _status: 'draft' },
      previousDoc: { _status: 'draft' },
      req: { context: {}, payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('revalidates on delete of published docs', () => {
    const hook = createCollectionRevalidateDeleteHook([CACHE_TAGS.shortStories])
    hook({
      doc: { _status: 'published' },
      req: { context: {}, payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.shortStories, 'max')
  })

  it('always revalidates globals unless disabled', () => {
    const hook = createGlobalRevalidateHook([CACHE_TAGS.siteShell, CACHE_TAGS.decorationPacks])
    hook({
      doc: {},
      req: { context: {}, payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.siteShell, 'max')
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.decorationPacks, 'max')
  })

  it('revalidates pages and site shell when a page publishes', () => {
    revalidatePages({
      doc: { _status: 'published', template: 'home' },
      previousDoc: { _status: 'draft', template: 'home' },
      req: { context: {}, payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.pages, 'max')
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.siteShell, 'max')
  })
})
