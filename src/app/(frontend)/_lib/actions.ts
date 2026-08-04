'use server'

import { getPostsPage, getProjectsPage, getVideosPage } from '@/app/(frontend)/_lib/cms'
import { isFeedType } from '@/app/(frontend)/_lib/feed-registry'
import { decodePostsCursor } from '@/app/(frontend)/_lib/posts-cursor'
import type {
  FeedType,
  PostsPageView,
  ProjectsPageView,
  VideosPageView,
} from '@/app/(frontend)/_lib/types'
import { isLocaleCode, type LocaleCode } from '@/lib/locales'

export type FeedPageView = PostsPageView | ProjectsPageView | VideosPageView

/**
 * Paginated published feed via Payload Local API (keyset cursor).
 * Prefer this over a custom REST route — public CRUD remains under `(payload)/api`.
 * Things homepage sections are static-only and are not loaded through this action.
 */
export async function loadFeedPage(
  feedTypeInput: string,
  localeInput: string,
  cursorInput: string | null = null,
): Promise<FeedPageView> {
  if (!isFeedType(feedTypeInput) || feedTypeInput === 'things') {
    throw new Error('Invalid feed type')
  }

  if (!isLocaleCode(localeInput)) {
    throw new Error('Invalid locale')
  }

  const locale: LocaleCode = localeInput
  const feedType: FeedType = feedTypeInput

  if (cursorInput != null) {
    if (typeof cursorInput !== 'string' || cursorInput.length > 512) {
      throw new Error('Invalid cursor')
    }
    if (!decodePostsCursor(cursorInput)) {
      throw new Error('Invalid cursor')
    }
  }

  if (feedType === 'posts') {
    return getPostsPage(locale, cursorInput)
  }

  if (feedType === 'projects') {
    return getProjectsPage(locale, cursorInput)
  }

  return getVideosPage(locale, cursorInput)
}

/** @deprecated Prefer `loadFeedPage('posts', …)`. */
export async function loadPostsPage(
  localeInput: string,
  cursorInput: string | null = null,
): Promise<PostsPageView> {
  return loadFeedPage('posts', localeInput, cursorInput) as Promise<PostsPageView>
}

/** @deprecated Prefer `loadFeedPage('projects', …)`. */
export async function loadProjectsPage(
  localeInput: string,
  cursorInput: string | null = null,
): Promise<ProjectsPageView> {
  return loadFeedPage('projects', localeInput, cursorInput) as Promise<ProjectsPageView>
}
