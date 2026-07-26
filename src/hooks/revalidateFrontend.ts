import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'
import { revalidateTag } from 'next/cache'

import { CACHE_TAGS, type CacheTag } from '@/lib/cache-tags'

type RevalidateContext = {
  disableRevalidate?: boolean
}

function shouldSkip(context: unknown): boolean {
  return Boolean((context as RevalidateContext | undefined)?.disableRevalidate)
}

function revalidateTags(tags: CacheTag[], logger?: { info?: (msg: string) => void }): void {
  for (const tag of tags) {
    try {
      // OpenNext + Next 16: profile 'max' expires tagged entries for the next request.
      revalidateTag(tag, 'max')
      logger?.info?.(`Revalidated cache tag: ${tag}`)
    } catch {
      // Local API / vitest / seed runs outside a Next request have no static
      // generation store. Skip quietly; production Admin/frontend paths work.
    }
  }
}

function isPublishedStatus(status: unknown): boolean {
  return status === 'published'
}

/**
 * Collection afterChange: invalidate when published content changes or is unpublished.
 */
export function createCollectionRevalidateHook(tags: CacheTag[]): CollectionAfterChangeHook {
  return ({ doc, previousDoc, req: { context, payload } }) => {
    if (shouldSkip(context)) return doc

    const becameOrIsPublished =
      isPublishedStatus(doc?._status) || isPublishedStatus(previousDoc?._status)

    if (becameOrIsPublished) {
      revalidateTags(tags, payload.logger)
    }

    return doc
  }
}

/**
 * Collection afterDelete: invalidate when a previously published doc is removed.
 * Collections without drafts always invalidate.
 */
export function createCollectionRevalidateDeleteHook(
  tags: CacheTag[],
  options?: { always?: boolean },
): CollectionAfterDeleteHook {
  return ({ doc, req: { context, payload } }) => {
    if (shouldSkip(context)) return doc

    if (options?.always || isPublishedStatus(doc?._status)) {
      revalidateTags(tags, payload.logger)
    }

    return doc
  }
}

/** Globals always affect the public shell or frontpage when updated. */
export function createGlobalRevalidateHook(tags: CacheTag[]): GlobalAfterChangeHook {
  return ({ doc, req: { context, payload } }) => {
    if (shouldSkip(context)) return doc
    revalidateTags(tags, payload.logger)
    return doc
  }
}

export const revalidatePosts = createCollectionRevalidateHook([CACHE_TAGS.posts])
export const revalidatePostsDelete = createCollectionRevalidateDeleteHook([CACHE_TAGS.posts])

export const revalidateShortStories = createCollectionRevalidateHook([CACHE_TAGS.shortStories])
export const revalidateShortStoriesDelete = createCollectionRevalidateDeleteHook([
  CACHE_TAGS.shortStories,
])

export const revalidatePages = createCollectionRevalidateHook([CACHE_TAGS.siteShell])
export const revalidatePagesDelete = createCollectionRevalidateDeleteHook([CACHE_TAGS.siteShell])

export const revalidateMedia = createCollectionRevalidateHook([
  CACHE_TAGS.media,
  CACHE_TAGS.posts,
  CACHE_TAGS.frontpage,
  CACHE_TAGS.siteShell,
])
export const revalidateMediaDelete = createCollectionRevalidateDeleteHook(
  [CACHE_TAGS.media, CACHE_TAGS.posts, CACHE_TAGS.frontpage, CACHE_TAGS.siteShell],
  { always: true },
)

export const revalidateDecorationPacks = createCollectionRevalidateHook([
  CACHE_TAGS.decorationPacks,
  CACHE_TAGS.siteShell,
  CACHE_TAGS.frontpage,
])
export const revalidateDecorationPacksDelete = createCollectionRevalidateDeleteHook(
  [CACHE_TAGS.decorationPacks, CACHE_TAGS.siteShell, CACHE_TAGS.frontpage],
  { always: true },
)

export const revalidateFeedDecorations = createCollectionRevalidateHook([
  CACHE_TAGS.decorationPacks,
  CACHE_TAGS.siteShell,
])
export const revalidateFeedDecorationsDelete = createCollectionRevalidateDeleteHook(
  [CACHE_TAGS.decorationPacks, CACHE_TAGS.siteShell],
  { always: true },
)

export const revalidateSiteShellGlobal = createGlobalRevalidateHook([CACHE_TAGS.siteShell])
export const revalidateFrontpageGlobal = createGlobalRevalidateHook([
  CACHE_TAGS.frontpage,
  CACHE_TAGS.siteShell,
  CACHE_TAGS.decorationPacks,
])
