import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageTransition } from '@/app/(frontend)/_components/layout/page-transition'
import { PageBlocks } from '@/app/(frontend)/_components/blocks/page-blocks'
import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { firstHeroBlock, getPageBySlug, isReservedCmsPageSlug } from '@/app/(frontend)/_lib/page-data'
import { homeHref, pageHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'

type CmsPageProps = {
  locale: LocaleCode
  slug: string
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

export async function CmsPage({ locale, slug }: CmsPageProps) {
  const [shell, page] = await Promise.all([getSiteShell(locale), getPageBySlug(locale, slug)])
  if (!page) notFound()

  return (
    <PageTransition>
      <PageBlocks
        blocks={page.blocks}
        locale={locale}
        siteName={shell.siteName}
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
