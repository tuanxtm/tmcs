import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageTransition } from '@/app/(frontend)/_components/layout/page-transition'
import { PageBlocks } from '@/app/(frontend)/_components/blocks/page-blocks'
import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import {
  firstHeroBlock,
  getPageBySlug,
  isReservedCmsPageSlug,
  resolveLayoutBlocks,
} from '@/app/(frontend)/_lib/page-data'
import { homeHref, pageHref } from '@/app/(frontend)/_lib/locale'
import type { PostDetailView, ProjectDetailView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

export type CmsPageDetailView =
  | { kind: 'post'; view: PostDetailView }
  | { kind: 'project'; view: ProjectDetailView }

type CmsPageProps = {
  locale: LocaleCode
  slug: string
  /**
   * When set, the layout is rendered as a template Page for the given
   * Post or Project. Pass through the just-loaded `*DetailView` so the
   * `Detail - Post` / `Detail - Project` block can bind to it at render time.
   */
  detailView?: CmsPageDetailView
}

export async function generateCmsPageMetadata(
  locale: LocaleCode,
  slug: string,
): Promise<Metadata> {
  const [shell, page] = await Promise.all([getSiteShell(locale), getPageBySlug(locale, slug)])
  if (!page) {
    return { title: 'Not found' }
  }

  const hero = firstHeroBlock(page.blocks)
  const title = page.seo.metaTitle || page.title || shell.seo.metaTitle || shell.siteName
  const description =
    page.seo.metaDescription ||
    page.summary ||
    hero?.tagline ||
    shell.seo.metaDescription ||
    shell.description ||
    undefined
  const image =
    page.seo.ogImage ||
    page.pageImage ||
    hero?.heroImage ||
    shell.seo.ogImage ||
    shell.defaultSocialImage
  const canonical = page.seo.canonicalUrl || `${shell.siteUrl}${pageHref(locale, page.slug)}`

  const languages: Record<string, string> = {
    [locale]: canonical,
  }
  if (page.alternateSlug) {
    const otherLocale: LocaleCode = locale === 'en' ? 'vi' : 'en'
    languages[otherLocale] = `${shell.siteUrl}${pageHref(otherLocale, page.alternateSlug)}`
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: shell.siteName,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
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
      description,
      images: image ? [image.url] : undefined,
    },
    robots:
      page.seo.noIndex || !shell.robotsIndex
        ? {
            index: false,
            follow: !page.seo.noFollow && shell.robotsIndex,
          }
        : page.seo.noFollow
          ? { follow: false }
          : undefined,
  }
}

export async function CmsPage({ locale, slug, detailView }: CmsPageProps) {
  const [shell, page] = await Promise.all([getSiteShell(locale), getPageBySlug(locale, slug)])
  if (!page) notFound()

  // When rendering as a Post/Project template, re-resolve the template's
  // blocks with the current-view context so the field-less `Detail - Post`
  // / `Detail - Project` block picks up the routed document. The cached
  // `page.blocks` were computed without context (they have no idea who
  // routed here), so we must re-run once with the right context. React
  // dedupes the Local API calls via the per-collection loaders inside.
  const blocks = detailView
    ? await resolveLayoutBlocks(page.layout, locale, {
        currentPostView: detailView.kind === 'post' ? detailView.view : null,
        currentProjectView: detailView.kind === 'project' ? detailView.view : null,
      })
    : page.blocks

  return (
    <PageTransition>
      <PageBlocks
        blocks={blocks}
        locale={locale}
        siteName={shell.siteName}
        currentView={detailView}
      />
    </PageTransition>
  )
}

/** Reserved so home stays at `/` / `/vi` and is never served via `[slug]`. */
export function isReservedPageSlug(slug: string): boolean {
  return isReservedCmsPageSlug(slug)
}

export function cmsPageCanonicalPath(locale: LocaleCode, slug: string): string {
  if (isReservedPageSlug(slug)) return homeHref(locale)
  return pageHref(locale, slug)
}
