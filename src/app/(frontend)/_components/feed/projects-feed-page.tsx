import { FeedSection } from '@/app/(frontend)/_components/feed/feed-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { getProjectsPage } from '@/app/(frontend)/_lib/cms'
import type { ProjectsPageView } from '@/app/(frontend)/_lib/types'

const { Page: ProjectsFeedPage, generateMetadata: generateProjectsFeedMetadata } =
  createFeedPageShell({
    slug: 'projects',
    label: 'Projects',
    feedType: 'projects',
    loadFeed: (locale) => getProjectsPage(locale, null),
    renderFeed: ({ locale, feed, adapter, decorations }) => {
      const { docs, nextCursor, hasNextPage } = feed as ProjectsPageView
      return (
        <FeedSection
          locale={locale}
          sectionId="projects-feed"
          headingId="projects-feed-heading"
          heading={adapter.defaultHeading}
          description={null}
          cursorPopup={adapter.defaultCursorPopup}
          cursorPopupEmpty={adapter.defaultCursorPopupEmpty}
          cursorPopupItem={adapter.defaultCursorPopupItem}
          pagination="infinite"
          nextCursor={nextCursor}
          hasNextPage={hasNextPage}
          showViewAll={false}
          feedType="projects"
          docs={docs}
          decorations={decorations}
        />
      )
    },
  })

export { ProjectsFeedPage, generateProjectsFeedMetadata }