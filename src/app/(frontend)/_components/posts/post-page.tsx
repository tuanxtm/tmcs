import type { Metadata } from 'next'

import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { SiteHeader } from '@/app/(frontend)/_components/layout/site-header'
import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { pageHref } from '@/app/(frontend)/_lib/locale'
import type { LocaleCode } from '@/lib/locales'
import type { PostDetailView } from '@/app/(frontend)/_lib/types'

export const dynamic = 'force-dynamic'

type PostPageProps = {
  view: PostDetailView
  locale: LocaleCode
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function PostHero({ view }: { view: PostDetailView }) {
  const image = view.featuredImage

  return (
    <section className="relative w-full bg-zinc-950 overflow-hidden" style={{ minHeight: '480px' }}>
      {image ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image.url})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" />
      )}

      <div
        className="relative z-10 flex flex-col justify-end h-full"
        style={{ minHeight: '480px' }}
      >
        <div className="w-full max-w-3xl mx-auto px-6 pb-12 pt-32">
          {view.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {view.categories.map((cat) => (
                <span
                  key={cat.name}
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-white/80"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            {view.title}
          </h1>

          {view.excerpt && <p className="text-lg text-white/70 mb-6 max-w-2xl">{view.excerpt}</p>}

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            {view.author && <span>By {view.author.name}</span>}
            {view.publishedAt && (
              <>
                <span aria-hidden="true">·</span>
                <time dateTime={view.publishedAt}>{formatDate(view.publishedAt)}</time>
              </>
            )}
            {view.readingTime !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span>{view.readingTime} min read</span>
              </>
            )}
            {view.tags.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{view.tags.map((t) => t.name).join(', ')}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export async function generatePostMetadata(
  view: PostDetailView,
  locale: LocaleCode,
): Promise<Metadata> {
  const shell = await getSiteShell(locale)

  const title = view.seo.metaTitle || view.title
  const description = view.seo.metaDescription || view.excerpt || undefined
  const image = view.seo.ogImage || view.featuredImage
  const canonical = view.seo.canonicalUrl || `${shell.siteUrl}${pageHref(locale, view.slug)}`

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
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
      description,
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

export async function PostPage({ view, locale }: PostPageProps) {
  const shell = await getSiteShell(locale)

  return (
    <div>
      <SiteHeader siteName={shell.siteName} locale={locale} navigation={shell.navigation} />
      <PostHero view={view} />
      <div className="max-w-3xl mx-auto px-6 py-12">
        {view.content && <CmsRichText data={view.content} />}
      </div>
    </div>
  )
}
