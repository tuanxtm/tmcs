import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'

import { ThingsGridSection } from '@/app/(frontend)/_components/feed/things-grid-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { FEED_SOURCE_REGISTRY } from '@/app/(frontend)/_lib/feed-registry'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import { CACHE_TAGS } from '@/lib/cache-tags'
import type { LocaleCode } from '@/lib/locales'

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

const { Page: ThingsFeedPage, generateMetadata: generateThingsFeedMetadata } =
  createFeedPageShell({
    slug: 'things',
    label: 'Things',
    feedType: 'things',
    loadFeed: (locale) => loadThingsFeed(locale),
    // `ThingsGridSection` needs `contact` info from the shell; the shell
    // hands it through so we don't refetch.
    renderFeed: ({ locale, feed, shell, adapter }) => {
      const docs = feed as ThingCardView[]
      return (
        <ThingsGridSection
          locale={locale}
          heading={adapter.defaultHeading}
          docs={docs}
          cursorPopup={adapter.defaultCursorPopup}
          cursorPopupEmpty={adapter.defaultCursorPopupEmpty}
          cursorPopupItem={adapter.defaultCursorPopupItem}
        />
      )
    },
  })

export { ThingsFeedPage, generateThingsFeedMetadata }
export default ThingsFeedPage