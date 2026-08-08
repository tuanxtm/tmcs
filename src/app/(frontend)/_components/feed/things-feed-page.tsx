import { cache } from 'react'
import { unstable_cache } from 'next/cache'

import { ThingsGridSection } from '@/app/(frontend)/_components/feed/things-grid-section'
import { createFeedPageShell } from '@/app/(frontend)/_components/feed/feed-page-shell'
import { FEED_SOURCE_REGISTRY } from '@/app/(frontend)/_lib/feed-registry'
import { shouldUseCache } from '@/app/(frontend)/_lib/cms'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import { CACHE_TAGS } from '@/lib/cache-tags'
import type { LocaleCode } from '@/lib/locales'

const THINGS_FEED_LIMIT = 48

const loadThingsFeed = cache(async (locale: LocaleCode): Promise<ThingCardView[]> => {
  // See `shouldUseCache` in cms.ts: in dev we skip the durable cache so seed
  // updates outside a Next request show up immediately. CI sets
  // CMS_CACHE=1 to exercise `unstable_cache`.
  if (!shouldUseCache()) {
    return FEED_SOURCE_REGISTRY.things.loadCards({
      locale,
      source: 'latest',
      limit: THINGS_FEED_LIMIT,
      manualIds: [],
    })
  }
  return unstable_cache(
    async () =>
      FEED_SOURCE_REGISTRY.things.loadCards({
        locale,
        source: 'latest',
        limit: THINGS_FEED_LIMIT,
        manualIds: [],
      }),
    ['things-feed', locale, String(THINGS_FEED_LIMIT)],
    { tags: [CACHE_TAGS.things, CACHE_TAGS.media] },
  )()
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
          contact={{
            email: shell.contactEmail,
            links: shell.profileLinks,
          }}
        />
      )
    },
  })

export { ThingsFeedPage, generateThingsFeedMetadata }
export default ThingsFeedPage