import type { Metadata } from 'next'

import { getFeedDecorations, getSiteShell } from '@/app/(frontend)/_lib/cms'
import { SiteHeader } from '@/app/(frontend)/_components/layout/site-header'
import { PageBlocks } from '@/app/(frontend)/_components/blocks/page-blocks'
import { getPageBySlug } from '@/app/(frontend)/_lib/page-data'
import { FEED_SOURCE_REGISTRY } from '@/app/(frontend)/_lib/feed-registry'
import type { FeedDecorationView, FeedType } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

type FeedPageShellOptions = {
  /** Path under each locale, e.g. `posts`, `projects`, `things`, `videos`. */
  slug: string
  /** Singular label used in metadata fallback, e.g. `Posts`. */
  label: string
  /** Registry key for adapter defaults (cursor popups, heading). */
  feedType: FeedType
  /** Load the feed payload when no CMS page is configured. */
  loadFeed: (locale: LocaleCode) => Promise<unknown>
  /** Render the loaded feed payload. */
  renderFeed: (args: {
    locale: LocaleCode
    feed: unknown
    shell: SiteShell
    adapter: (typeof FEED_SOURCE_REGISTRY)[FeedType]
    decorations?: FeedDecorationView[]
  }) => React.ReactNode
}

type SiteShell = Awaited<ReturnType<typeof getSiteShell>>

/**
 * Build a `{ Page, generateMetadata }` pair for a feed-page route.
 *
 * Consolidates the four near-identical feed page files (posts, projects,
 * things, videos). Each consumes the same shell + page lookups, the same
 * fallback chrome, and only differs in how it loads + renders its cards.
 */
export function createFeedPageShell({
  slug,
  label,
  feedType,
  loadFeed,
  renderFeed,
}: FeedPageShellOptions) {
  const adapter = FEED_SOURCE_REGISTRY[feedType]

  async function generateMetadata(locale: LocaleCode): Promise<Metadata> {
    const [shell, page] = await Promise.all([
      getSiteShell(locale),
      getPageBySlug(locale, slug),
    ])

    const path = locale === 'vi' ? `vi/${slug}` : slug
    const alternates = {
      canonical: `${shell.siteUrl}/${path}`,
      languages: {
        en: `${shell.siteUrl}/${slug}`,
        vi: `${shell.siteUrl}/vi/${slug}`,
      },
    }

    if (page) {
      const title = page.seo.metaTitle || page.title || `${shell.siteName} · ${label}`
      const description =
        page.seo.metaDescription || page.summary || shell.seo.metaDescription || undefined
      return {
        title,
        description,
        alternates,
        robots: page.seo.noIndex || !shell.robotsIndex ? { index: false } : undefined,
      }
    }

    return {
      title: `${label} · ${shell.siteName}`,
      description: shell.tagline || shell.description || shell.seo.metaDescription || undefined,
      alternates,
      robots: shell.robotsIndex ? undefined : { index: false },
    }
  }

  async function FeedPage({ locale }: { locale: LocaleCode }) {
    const [shell, page, feed] = await Promise.all([
      getSiteShell(locale),
      getPageBySlug(locale, slug),
      loadFeed(locale),
    ])

    const decorations = shell.activeDecorationPackId
      ? await getFeedDecorations(shell.activeDecorationPackId)
      : undefined

    if (page) {
      return (
        <div>
          <SiteHeader siteName={shell.siteName} locale={locale} navigation={shell.navigation} />
          <PageBlocks
            blocks={page.blocks}
            locale={locale}
            siteName={shell.siteName}
          />
        </div>
      )
    }

    return (
      <div>
        <SiteHeader siteName={shell.siteName} locale={locale} navigation={shell.navigation} />
        {renderFeed({ locale, feed, shell, adapter, decorations })}
      </div>
    )
  }

  return { Page: FeedPage, generateMetadata }
}