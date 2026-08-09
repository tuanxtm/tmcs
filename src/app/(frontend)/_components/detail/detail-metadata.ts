import type { Metadata } from 'next'

import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { pageHref } from '@/app/(frontend)/_lib/locale'
import type { PostDetailView, ProjectDetailView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

/**
 * Which field on the detail view holds the hero image. Posts use
 * `featuredImage`; Projects use `coverImage` (a re-mapped field on the
 * frontend view that points at the collection's `featuredImage` upload).
 */
export type DetailImageKey = 'featuredImage' | 'coverImage'

/**
 * Build Next.js `Metadata` for a Post or Project detail page.
 *
 * Shared between the `en` and `vi` slug routes so the SEO contract is
 * defined in exactly one place. Resolution order:
 *  - title: `seo.metaTitle` → `view.title`
 *  - description: `seo.metaDescription` → `excerpt` (posts) / `summary` (projects)
 *  - og/twitter image: `seo.ogImage` → `view[imageKey]`
 *  - canonical: `seo.canonicalUrl` → `${siteUrl}${pageHref(locale, slug)}`
 */
export async function generateDetailMetadata(
  view: PostDetailView | ProjectDetailView,
  locale: LocaleCode,
  imageKey: DetailImageKey,
): Promise<Metadata> {
  const shell = await getSiteShell(locale)

  const title = view.seo.metaTitle || view.title
  const description =
    view.seo.metaDescription || ('excerpt' in view ? view.excerpt : view.summary) || null
  const viewImage =
    'featuredImage' in view
      ? imageKey === 'featuredImage'
        ? view.featuredImage
        : null
      : imageKey === 'coverImage'
        ? view.coverImage
        : null
  const image = view.seo.ogImage || viewImage
  const canonical = view.seo.canonicalUrl || `${shell.siteUrl}${pageHref(locale, view.slug)}`

  return {
    title,
    description: description ?? undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description: description ?? undefined,
      url: canonical,
      siteName: shell.siteName,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
      type: 'article',
      publishedTime: view.publishedAt ?? undefined,
      authors: view.author ? [view.author.name] : undefined,
      tags: view.tags.map((t) => t.name),
      images: image
        ? [
            {
              url: image.url,
              width: image.width || undefined,
              height: image.height || undefined,
              alt: image.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description ?? undefined,
      images: image ? [image.url] : undefined,
    },
    robots:
      view.seo.noIndex || !shell.robotsIndex
        ? { index: false, follow: !view.seo.noFollow && shell.robotsIndex }
        : view.seo.noFollow
          ? { follow: false }
          : undefined,
  }
}
