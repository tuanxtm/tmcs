import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { ThingsSection } from '@/app/(frontend)/_components/things/things-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { FEED_SOURCE_REGISTRY } from '@/app/(frontend)/_lib/feed-registry'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import { CACHE_TAGS } from '@/lib/cache-tags'
import type { LocaleCode } from '@/lib/locales'

const THINGS_FEED_CLASSNAME = 'pl-2 md:pl-3 lg:pl-4 pt-2 md:pt-3 lg:pt-4'

const THINGS_FEED_LIMIT = 48

async function loadThingsFeedCached(locale: LocaleCode): Promise<ThingCardView[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.things, CACHE_TAGS.media)
  return FEED_SOURCE_REGISTRY.things.loadCards({
    locale,
    source: 'latest',
    limit: THINGS_FEED_LIMIT,
    manualIds: [],
  })
}

const loadThingsFeed = cache(async (locale: LocaleCode): Promise<ThingCardView[]> => {
  return loadThingsFeedCached(locale)
})

const { Page: ThingsFeedPage, generateMetadata: generateThingsFeedMetadata } = createFeedPageShell({
  slug: 'things',
  label: 'Things',
  feedType: 'things',
  loadFeed: (locale) => loadThingsFeed(locale),
  renderFeed: ({ locale, feed, adapter }) => {
    const docs = feed as ThingCardView[]
    return (
      <ThingsSection
        locale={locale}
        sectionId="things-feed"
        headingId="things-feed-heading"
        heading={adapter.defaultHeading}
        description={null}
        docs={docs}
        cursorPopup={adapter.defaultCursorPopup}
        cursorPopupEmpty={adapter.defaultCursorPopupEmpty}
        cursorPopupItem={adapter.defaultCursorPopupItem}
        showViewAll={false}
        className={THINGS_FEED_CLASSNAME}
      />
    )
  },
})

export { ThingsFeedPage, generateThingsFeedMetadata }
export default ThingsFeedPage
