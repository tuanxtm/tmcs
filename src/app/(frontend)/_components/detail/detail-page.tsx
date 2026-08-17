import { ViewTransition } from 'react'

import { PageBlocks } from '@/app/(frontend)/_components/blocks/page-blocks'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { DetailHero } from '@/app/(frontend)/_components/detail/detail-hero'
import { SiteHeader } from '@/app/(frontend)/_components/layout/site-header'
import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import type { LocaleCode } from '@/lib/locales'

import type { PostDetailView, ProjectDetailView } from '@/app/(frontend)/_lib/types'
import type { MediaView } from '@/app/(frontend)/_lib/types'

type DetailPageProps = {
  view: PostDetailView | ProjectDetailView
  locale: LocaleCode
  /** Which field on the view holds the hero image. */
  imageKey: 'featuredImage' | 'coverImage'
}

export const dynamic = 'force-dynamic'

/**
 * Shared detail page shell for Posts and Projects.
 *
 * The hero is rendered by `<DetailHero>`; the body is rich text. Categories
 * are dropped from the headline meta - they live as subtle chrome around the
 * hero rather than competing with the title - and re-mounted under the page
 * shell since the title is the primary focus.
 *
 * View Transitions:
 *  - The whole `<article>` is wrapped in a typed directional VT so the page
 *    slides in from the matching side when the user navigates via
 *    `<Link transitionTypes>` or `addTransitionType('nav-forward'|'nav-back')`.
 *  - `default="none"` quietly disables the browser cross-fade for any
 *    unrelated VTs inside the article.
 *
 * Layout blocks: when the post has a `layout` array (e.g. trailing CTA,
 * related feed, footer), `<PageBlocks>` renders them below the rich text
 * body, mirroring the home page model. Inline blocks embedded inside the
 * rich text body are rendered by the JSX converter in `CmsRichText`.
 */
export async function DetailPage({ view, locale, imageKey }: DetailPageProps) {
  const shell = await getSiteShell(locale)
  const image: MediaView | null =
    'featuredImage' in view
      ? imageKey === 'featuredImage'
        ? view.featuredImage
        : null
      : imageKey === 'coverImage'
        ? view.coverImage
        : null
  const excerpt = 'excerpt' in view ? view.excerpt : view.summary
  const readingTime = 'readingTime' in view ? view.readingTime : null

  return (
    <div>
      <SiteHeader siteName={shell.siteName} locale={locale} navigation={shell.navigation} />
      <ViewTransition
        enter={{
          'nav-forward': 'slide-from-right',
          'nav-back': 'slide-from-left',
          default: 'none',
        }}
        exit={{
          'nav-forward': 'slide-to-left',
          'nav-back': 'slide-to-right',
          default: 'none',
        }}
        default="none"
      >
        <article>
          <DetailHero
            slug={view.slug}
            id={view.id}
            title={view.title}
            excerpt={excerpt}
            image={image}
            publishedAt={view.publishedAt}
            author={view.author}
            readingTime={readingTime}
            tags={view.tags}
          />
          <div className="max-w-3xl mx-auto px-6 py-12">
            {view.content && <CmsRichText data={view.content} />}
          </div>
          {view.blocks.length > 0 ? (
            <PageBlocks
              blocks={view.blocks}
              locale={locale}
              siteName={shell.siteName}
              className="px-6 pb-12"
            />
          ) : null}
        </article>
      </ViewTransition>
    </div>
  )
}
