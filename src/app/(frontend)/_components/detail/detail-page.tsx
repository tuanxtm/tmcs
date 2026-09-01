import { PageTransition } from '@/app/(frontend)/_components/layout/page-transition'
import { DetailHero } from '@/app/(frontend)/_components/detail/detail-hero'
import { DetailMeta } from '@/app/(frontend)/_components/detail/detail-meta'
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

/**
 * Shared detail page shell for Posts and Projects.
 *
 * The hero is rendered by `<DetailHero>` (mirrors the home `Hero` block
 * token-for-token) and the body / metadata live in `<DetailMeta>` as a
 * 4-column container-query grid: author + meta on the left, content on the
 * right.
 *
 * The whole page is wrapped in `<PageTransition>` so nav-forward /
 * nav-back tagged `<Link>` clicks slide the entire page in from the
 * matching side. Element-level VTs are intentionally avoided — page-level
 * slides are clearer than per-element morphs.
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

  return (
    <PageTransition>
      <DetailHero title={view.title} image={image} priority />
      <DetailMeta view={view} locale={locale} siteName={shell.siteName} />
    </PageTransition>
  )
}
