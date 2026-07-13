'use server'

import { getPostsPage } from '@/app/(frontend)/_lib/cms'
import { parseLocale } from '@/app/(frontend)/_lib/locale'
import type { PostsPageView } from '@/app/(frontend)/_lib/types'
import { isLocaleCode } from '@/lib/locales'

/**
 * Paginated published posts via Payload Local API.
 * Prefer this over a custom REST route — public CRUD remains under `(payload)/api`.
 */
export async function loadPostsPage(
  localeInput: string,
  pageInput: number,
): Promise<PostsPageView> {
  if (!isLocaleCode(localeInput)) {
    throw new Error('Invalid locale')
  }

  const page = Number(pageInput)
  if (!Number.isInteger(page) || page < 1 || page > 1000) {
    throw new Error('Invalid page')
  }

  return getPostsPage(parseLocale(localeInput), page)
}
