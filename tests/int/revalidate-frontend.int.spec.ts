import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

import {
  createCollectionRevalidateDeleteHook,
  createCollectionRevalidateHook,
  createGlobalRevalidateHook,
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
    const hook = createGlobalRevalidateHook([CACHE_TAGS.frontpage, CACHE_TAGS.siteShell])
    hook({
      doc: {},
      req: { context: {}, payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.frontpage, 'max')
    expect(revalidateTag).toHaveBeenCalledWith(CACHE_TAGS.siteShell, 'max')
  })
})
