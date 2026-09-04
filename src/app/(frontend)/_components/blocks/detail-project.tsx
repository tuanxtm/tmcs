import { DetailPage } from '@/app/(frontend)/_components/detail/detail-page'
import type { LocaleCode } from '@/lib/locales'
import type { ProjectDetailView } from '@/app/(frontend)/_lib/types'

type Props = {
  view: ProjectDetailView
  locale: LocaleCode
}

/**
 * Renders a Project using the shared `<DetailPage>` UI. The Project view
 * is injected from the surrounding template Page's resolver context (the
 * `currentView` that `<CmsPage detailView={...}>` forwards), so this
 * renderer is a thin wrapper. The block is field-less; it auto-binds to
 * whichever Project is currently routed.
 */
export function DetailProjectBlock({ view, locale }: Props) {
  return <DetailPage view={view} locale={locale} imageKey="coverImage" />
}
