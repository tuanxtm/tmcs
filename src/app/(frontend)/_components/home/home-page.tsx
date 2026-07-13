import type { Metadata } from 'next'

import { getHomepage, getPostsPage, getSiteShell } from '@/app/(frontend)/_lib/cms'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'
import { Hero } from '@/app/(frontend)/_components/home/hero'
import { PostFeed } from '@/app/(frontend)/_components/posts/post-feed'

export const dynamic = 'force-dynamic'

type HomePageProps = {
  locale: LocaleCode
}

export async function generateHomeMetadata(locale: LocaleCode): Promise<Metadata> {
  const [shell, homepage] = await Promise.all([getSiteShell(locale), getHomepage(locale)])
  const title = homepage.heading || shell.seo.metaTitle || shell.siteName
  const description =
    homepage.subheading || shell.seo.metaDescription || shell.description || undefined
  const image = homepage.image || shell.seo.ogImage || shell.defaultSocialImage
  const canonical = `${shell.siteUrl}${homeHref(locale)}`

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
    robots: shell.robotsIndex
      ? undefined
      : {
          index: false,
          follow: false,
        },
  }
}

export async function HomePage({ locale }: HomePageProps) {
  const [hero, posts] = await Promise.all([getHomepage(locale), getPostsPage(locale, 1)])

  return (
    <div className="min-h-[50vh]">
      <Hero hero={hero} />
      <PostFeed
        locale={locale}
        initialDocs={posts.docs}
        initialHasNextPage={posts.hasNextPage}
        initialNextPage={posts.nextPage}
      />
    </div>
  )
}
