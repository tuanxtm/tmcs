import type { Metadata } from 'next'

import { PageBlocks } from '@/app/(frontend)/_components/blocks/page-blocks'
import { SiteHeader } from '@/app/(frontend)/_components/layout/site-header'
import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { firstHeroBlock, getHomePage } from '@/app/(frontend)/_lib/home-page'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'

export const dynamic = 'force-dynamic'

type HomePageProps = {
  locale: LocaleCode
}

export async function generateHomeMetadata(locale: LocaleCode): Promise<Metadata> {
  const [shell, home] = await Promise.all([getSiteShell(locale), getHomePage(locale)])
  const hero = firstHeroBlock(home.blocks)

  const title = home.seo.metaTitle || home.title || shell.seo.metaTitle || shell.siteName
  const description =
    home.seo.metaDescription ||
    home.summary ||
    hero?.tagline ||
    shell.seo.metaDescription ||
    shell.description ||
    undefined
  const image = home.seo.ogImage || home.pageImage || hero?.heroImage || shell.seo.ogImage || shell.defaultSocialImage
  const canonical = home.seo.canonicalUrl || `${shell.siteUrl}${homeHref(locale)}`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${shell.siteUrl}/`,
        vi: `${shell.siteUrl}/vi`,
      },
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
      home.seo.noIndex || !shell.robotsIndex
        ? {
            index: false,
            follow: !home.seo.noFollow && shell.robotsIndex,
          }
        : home.seo.noFollow
          ? { follow: false }
          : undefined,
  }
}

export async function HomePage({ locale }: HomePageProps) {
  const [shell, home] = await Promise.all([getSiteShell(locale), getHomePage(locale)])

  return (
    <div>
      <SiteHeader siteName={shell.siteName} locale={locale} navigation={shell.navigation} />
      <PageBlocks
        blocks={home.blocks}
        locale={locale}
        siteName={shell.siteName}
      />
    </div>
  )
}
