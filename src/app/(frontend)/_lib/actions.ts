'use server'

import { getPostsPage } from '@/app/(frontend)/_lib/cms'
import type { PostsPageView } from '@/app/(frontend)/_lib/types'
import { decodePostsCursor } from '@/app/(frontend)/_lib/posts-cursor'
import { isLocaleCode, type LocaleCode } from '@/lib/locales'

/**
 * Paginated published posts via Payload Local API (keyset cursor).
 * Prefer this over a custom REST route — public CRUD remains under `(payload)/api`.
 */
export async function loadPostsPage(
  localeInput: string,
  cursorInput: string | null = null,
): Promise<PostsPageView> {
  if (!isLocaleCode(localeInput)) {
    throw new Error('Invalid locale')
  }

  const locale: LocaleCode = localeInput

  if (cursorInput != null) {
    if (typeof cursorInput !== 'string' || cursorInput.length > 512) {
      throw new Error('Invalid cursor')
    }
    if (!decodePostsCursor(cursorInput)) {
      throw new Error('Invalid cursor')
    }
  }

  return getPostsPage(locale, cursorInput)
}
