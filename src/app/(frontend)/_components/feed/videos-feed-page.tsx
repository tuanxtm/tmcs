import { FeedSection } from '@/app/(frontend)/_components/feed/feed-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { getVideosPage } from '@/app/(frontend)/_lib/cms'
import type { VideosPageView } from '@/app/(frontend)/_lib/types'

const { Page: VideosFeedPage, generateMetadata: generateVideosFeedMetadata } =
  createFeedPageShell({
    slug: 'videos',
    label: 'Videos',
    feedType: 'videos',
    loadFeed: (locale) => getVideosPage(locale, null),
    renderFeed: ({ locale, feed, adapter, decorations }) => {
      const { docs, nextCursor, hasNextPage } = feed as VideosPageView
      return (
        <FeedSection
          locale={locale}
          sectionId="videos-feed"
          headingId="videos-feed-heading"
          heading={adapter.defaultHeading}
          description={null}
          cursorPopup={adapter.defaultCursorPopup}
          cursorPopupEmpty={adapter.defaultCursorPopupEmpty}
          cursorPopupItem={adapter.defaultCursorPopupItem}
          pagination="infinite"
          nextCursor={nextCursor}
          hasNextPage={hasNextPage}
          feedType="videos"
          docs={docs}
          decorations={decorations}
        />
      )
    },
  })

export { VideosFeedPage, generateVideosFeedMetadata }