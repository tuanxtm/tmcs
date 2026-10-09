import { ProjectsSection } from '@/app/(frontend)/_components/projects/projects-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { getProjectsPage } from '@/app/(frontend)/_lib/cms'
import { FEED_SOURCE_REGISTRY } from '@/app/(frontend)/_lib/feed-registry'
import {
  createProjectsArchiveBlock,
  prepareProjectsArchiveBlocks,
} from '@/app/(frontend)/_lib/projects-feed'
import type { ProjectsPageView } from '@/app/(frontend)/_lib/types'

/** Fallback archive block used when the CMS Projects page has no project block. */
function buildArchiveFallback(page: ProjectsPageView) {
  return createProjectsArchiveBlock({
    page,
    defaults: {
      heading: FEED_SOURCE_REGISTRY.projects.defaultHeading,
      cursorPopup: FEED_SOURCE_REGISTRY.projects.defaultCursorPopup,
      cursorPopupEmpty: FEED_SOURCE_REGISTRY.projects.defaultCursorPopupEmpty,
      cursorPopupItem: FEED_SOURCE_REGISTRY.projects.defaultCursorPopupItem,
    },
  })
}

const { Page: ProjectsFeedPage, generateMetadata: generateProjectsFeedMetadata } =
  createFeedPageShell({
    slug: 'projects',
    label: 'Projects',
    feedType: 'projects',
    loadFeed: (locale) => getProjectsPage(locale, null),
    transformPageBlocks: ({ blocks, feed }) => {
      const page = feed as ProjectsPageView
      return prepareProjectsArchiveBlocks(blocks, page, buildArchiveFallback(page))
    },
    renderFeed: ({ locale, feed, adapter }) => {
      const { docs, nextCursor, hasNextPage } = feed as ProjectsPageView
      return (
        <ProjectsSection
          key={JSON.stringify([locale, docs, nextCursor, hasNextPage])}
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
          docs={docs}
        />
      )
    },
  })

export { ProjectsFeedPage, generateProjectsFeedMetadata }
