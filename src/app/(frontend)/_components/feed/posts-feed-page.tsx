import { FeedSection } from '@/app/(frontend)/_components/feed/feed-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { getPostsPage } from '@/app/(frontend)/_lib/cms'
import type { PostsPageView } from '@/app/(frontend)/_lib/types'

const { Page: PostsFeedPage, generateMetadata: generatePostsFeedMetadata } =
  createFeedPageShell({
    slug: 'posts',
    label: 'Posts',
    feedType: 'posts',
    loadFeed: (locale) => getPostsPage(locale, null),
    renderFeed: ({ locale, feed, adapter }) => {
      const { docs, nextCursor, hasNextPage } = feed as PostsPageView
      return (
        <FeedSection
          locale={locale}
          sectionId="posts-feed"
          headingId="posts-feed-heading"
          heading={adapter.defaultHeading}
          description={null}
          cursorPopup={adapter.defaultCursorPopup}
          cursorPopupEmpty={adapter.defaultCursorPopupEmpty}
          cursorPopupItem={adapter.defaultCursorPopupItem}
          pagination="infinite"
          nextCursor={nextCursor}
          hasNextPage={hasNextPage}
          showViewAll={false}
          feedType="posts"
          docs={docs}
        />
      )
    },
  })

export { PostsFeedPage, generatePostsFeedMetadata }