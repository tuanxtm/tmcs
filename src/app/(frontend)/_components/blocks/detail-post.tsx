import { DetailPage } from '@/app/(frontend)/_components/detail/detail-page'
import type { LocaleCode } from '@/lib/locales'
import type { PostDetailView } from '@/app/(frontend)/_lib/types'

type Props = {
  view: PostDetailView
  locale: LocaleCode
}

/**
 * Renders a Post using the shared `<DetailPage>` UI. The Post view is
 * injected from the surrounding template Page's resolver context (the
 * `currentView` that `<CmsPage detailView={...}>` forwards), so this
 * renderer is a thin wrapper. The block is field-less; it auto-binds to
 * whichever Post is currently routed.
 */
export function DetailPostBlock({ view, locale }: Props) {
  return <DetailPage view={view} locale={locale} imageKey="featuredImage" />
}
