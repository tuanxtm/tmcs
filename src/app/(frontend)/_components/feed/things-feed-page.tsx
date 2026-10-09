import { ThingsSection } from '@/app/(frontend)/_components/things/things-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { getThingsPage } from '@/app/(frontend)/_lib/cms'
import { FEED_SOURCE_REGISTRY } from '@/app/(frontend)/_lib/feed-registry'
import {
  createThingsArchiveBlock,
  prepareThingsArchiveBlocks,
} from '@/app/(frontend)/_lib/things-feed'
import type { ThingsPageView } from '@/app/(frontend)/_lib/types'

/** Fallback archive block used when the CMS Things page has no Things block. */
function buildArchiveFallback(page: ThingsPageView) {
  return createThingsArchiveBlock({
    page,
    defaults: {
      heading: FEED_SOURCE_REGISTRY.things.defaultHeading,
      cursorPopup: FEED_SOURCE_REGISTRY.things.defaultCursorPopup,
      cursorPopupEmpty: FEED_SOURCE_REGISTRY.things.defaultCursorPopupEmpty,
      cursorPopupItem: FEED_SOURCE_REGISTRY.things.defaultCursorPopupItem,
    },
  })
}

const { Page: ThingsFeedPage, generateMetadata: generateThingsFeedMetadata } = createFeedPageShell({
  slug: 'things',
  label: 'Things',
  feedType: 'things',
  loadFeed: (locale) => getThingsPage(locale, null),
  transformPageBlocks: ({ blocks, feed }) => {
    const page = feed as ThingsPageView
    return prepareThingsArchiveBlocks(blocks, page, buildArchiveFallback(page))
  },
  renderFeed: ({ locale, feed, adapter }) => {
    const { docs, nextCursor, hasNextPage } = feed as ThingsPageView
    return (
      <ThingsSection
        key={JSON.stringify([locale, docs, nextCursor, hasNextPage])}
        locale={locale}
        sectionId="things-feed"
        headingId="things-feed-heading"
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

export { ThingsFeedPage, generateThingsFeedMetadata }

export default ThingsFeedPage
