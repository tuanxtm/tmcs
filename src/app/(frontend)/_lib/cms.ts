import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { CACHE_TAGS } from '@/lib/cache-tags'
import { getServerURL } from '@/lib/env'
import type { LocaleCode } from '@/lib/locales'
import { publishedStatusWhere } from '@/lib/payload-queries'
import { lexicalToPlainText } from '@/lib/readingTime'
import type { StoryShape } from '@/lib/story-shapes'
import type { DecorationPack, FeedDecoration, Media, Page, Post, ShortStory } from '@/payload-types'
import config from '@payload-config'

import { resolveCmsLink } from './links'
import { resolvePostCardSize } from './post-card-layout'
import { cursorFromPost, decodePostsCursor } from './posts-cursor'
import type {
  FeedDecorationView,
  FooterGroupView,
  FrontpageView,
  MediaView,
  NavChildView,
  NavItemView,
  PostCardView,
  PostsPageView,
  ShortStoryCardView,
  SiteShellView,
  SocialLinkView,
} from './types'

export const POSTS_PAGE_SIZE = 6
export const SHORT_STORIES_POOL_LIMIT = 48
export const FEED_DECORATIONS_POOL_LIMIT = 48
export const FEED_POOL_LIMIT = 48

/** Fields selected for public decoration-pack reads (not the full collection doc). */
type SlimDecorationPack = {
  id: number
  items?: DecorationPack['items']
  footerItem?: DecorationPack['footerItem']
}

function isMedia(value: unknown): value is Media {
  return Boolean(value && typeof value === 'object' && 'url' in value)
}

function isFeedDecorationFile(value: unknown): value is FeedDecoration {
  return Boolean(value && typeof value === 'object' && 'url' in value)
}

function isPage(value: unknown): value is Page {
  return Boolean(value && typeof value === 'object' && 'slug' in value)
}

export function toMediaView(value: unknown): MediaView | null {
  if (!isMedia(value) || !value.url) return null

  return {
    id: value.id,
    url: value.url,
    alt: value.alt || '',
    width: value.width ?? null,
    height: value.height ?? null,
    dominantColor: value.dominantColor ?? null,
  }
}

function toNavChild(
  item: {
    id?: string | null
    label: string
    linkType: 'internal' | 'external'
    page?: (number | null) | Page
    url?: string | null
    newTab?: boolean | null
  },
  locale: LocaleCode,
  index: number,
): NavChildView | null {
  const resolved = resolveCmsLink(
    {
      label: item.label,
      linkType: item.linkType,
      page: isPage(item.page) ? item.page : null,
      url: item.url,
      newTab: item.newTab,
    },
    locale,
  )
  if (!resolved) return null

  return {
    id: item.id || `link-${index}`,
    ...resolved,
  }
}

const getPayloadClient = cache(async () => getPayload({ config }))

function packIdFromValue(value: unknown): number {
  if (typeof value === 'object' && value && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : 0
  }
  return typeof value === 'number' ? value : 0
}

function footerDecorationUrlFromPack(pack: SlimDecorationPack | null | undefined): string | null {
  if (!pack?.items?.length) return null

  const footerItemId = pack.footerItem && pack.footerItem !== 'null' ? pack.footerItem : null
  const footerRow = footerItemId
    ? pack.items.find((item) => item.id === footerItemId)
    : pack.items[0]

  if (!footerRow) return null
  const file = footerRow.file
  if (isFeedDecorationFile(file) && file.url) return file.url
  return null
}

function toFeedDecorationView(
  packId: number,
  item: NonNullable<SlimDecorationPack['items']>[number],
): FeedDecorationView | null {
  if (!item.id) return null

  const file = item.file
  const imageUrl = isFeedDecorationFile(file) ? file.url : null
  if (!imageUrl) return null

  const allowedShapes =
    item.allowedShapes && item.allowedShapes.length > 0
      ? (item.allowedShapes as StoryShape[])
      : (['1x1'] as StoryShape[])

  return {
    id: item.id,
    packId,
    imageUrl,
    allowedShapes,
    weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : 1,
  }
}

function toPostCard(post: Post): PostCardView {
  const image = toMediaView(post.featuredImage)
  const featured = Boolean(post.featured)
  const cardSize = resolvePostCardSize({
    id: post.id,
    cardSize: post.cardSize,
    featured,
    image,
  })

  return {
    id: post.id,
    title: post.title,
    // Detail routes are deferred; cards render without links until then.
    href: null,
    publishedAt: post.publishedAt ?? null,
    image,
    cardSize,
  }
}

function toShortStoryCard(story: ShortStory, locale: LocaleCode): ShortStoryCardView {
  const allowedShapes =
    story.allowedShapes && story.allowedShapes.length > 0
      ? (story.allowedShapes as StoryShape[])
      : null

  let href: string | null = null
  let newTab = false
  if (story.link?.enabled) {
    const resolved = resolveCmsLink(
      {
        label: story.link.label || story.title,
        linkType: story.link.linkType,
        page: isPage(story.link.page) ? story.link.page : null,
        url: story.link.url,
        newTab: story.link.newTab,
      },
      locale,
    )
    if (resolved) {
      href = resolved.href
      newTab = resolved.newTab
    }
  }

  return {
    id: story.id,
    title: story.title,
    text: lexicalToPlainText(story.content),
    variant: story.variant,
    allowedShapes,
    href,
    newTab,
  }
}

async function loadDecorationPack(packId: number): Promise<SlimDecorationPack | null> {
  if (!packId) return null
  const payload = await getPayloadClient()
  try {
    return (await payload.findByID({
      collection: 'decoration-packs',
      id: packId,
      depth: 1,
      overrideAccess: false,
      select: {
        items: true,
        footerItem: true,
      },
    })) as SlimDecorationPack
  } catch {
    return null
  }
}

const getCachedDecorationPack = (packId: number) =>
  unstable_cache(async () => loadDecorationPack(packId), ['decoration-pack', String(packId)], {
    tags: [CACHE_TAGS.decorationPacks],
  })()

async function loadFrontpageRaw(locale: LocaleCode) {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'frontpage',
    locale,
    depth: 1,
    overrideAccess: false,
    select: {
      heroHeading: true,
      heroSubheading: true,
      profileSummary: true,
      heroImage: true,
      activeDecorationPack: true,
      endOfFeed: true,
    },
  })
}

const getCachedFrontpageRaw = (locale: LocaleCode) =>
  unstable_cache(async () => loadFrontpageRaw(locale), ['frontpage-raw', locale], {
    tags: [CACHE_TAGS.frontpage, CACHE_TAGS.media],
  })()

async function loadSiteShellGlobals(locale: LocaleCode) {
  const payload = await getPayloadClient()
  const [siteSettings, navigation, footer] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      locale,
      depth: 1,
      overrideAccess: false,
    }),
    payload.findGlobal({
      slug: 'navigation',
      locale,
      depth: 2,
      overrideAccess: false,
    }),
    payload.findGlobal({
      slug: 'footer',
      locale,
      depth: 2,
      overrideAccess: false,
    }),
  ])

  return { siteSettings, navigation, footer }
}

const getCachedSiteShellGlobals = (locale: LocaleCode) =>
  unstable_cache(async () => loadSiteShellGlobals(locale), ['site-shell-globals', locale], {
    tags: [CACHE_TAGS.siteShell, CACHE_TAGS.media],
  })()

async function loadPostsPage(locale: LocaleCode, cursorRaw: string | null): Promise<PostsPageView> {
  const payload = await getPayloadClient()
  const cursor = decodePostsCursor(cursorRaw)

  const where = cursor
    ? {
        and: [
          publishedStatusWhere,
          {
            or: [
              { publishedAt: { less_than: cursor.publishedAt } },
              {
                and: [
                  { publishedAt: { equals: cursor.publishedAt } },
                  { id: { less_than: cursor.id } },
                ],
              },
            ],
          },
        ],
      }
    : publishedStatusWhere

  const result = await payload.find({
    collection: 'posts',
    locale,
    where,
    sort: '-publishedAt,-id',
    limit: POSTS_PAGE_SIZE + 1,
    depth: 1,
    overrideAccess: false,
    select: {
      title: true,
      featuredImage: true,
      publishedAt: true,
      featured: true,
      cardSize: true,
    },
  })

  const hasNextPage = result.docs.length > POSTS_PAGE_SIZE
  const pageDocs = hasNextPage ? result.docs.slice(0, POSTS_PAGE_SIZE) : result.docs
  const cards = pageDocs.map((post) => toPostCard(post as Post))
  const last = cards[cards.length - 1]
  const nextCursor = hasNextPage && last ? cursorFromPost(last) : null

  return {
    docs: cards,
    nextCursor,
    hasNextPage,
  }
}

const getCachedPostsPage = (locale: LocaleCode, cursorRaw: string | null) =>
  unstable_cache(
    async () => loadPostsPage(locale, cursorRaw),
    ['posts-page', locale, cursorRaw ?? 'start'],
    { tags: [CACHE_TAGS.posts, CACHE_TAGS.media] },
  )()

async function loadShortStories(locale: LocaleCode): Promise<ShortStoryCardView[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'short-stories',
    locale,
    where: publishedStatusWhere,
    sort: '-publishedAt,-id',
    limit: SHORT_STORIES_POOL_LIMIT,
    depth: 1,
    overrideAccess: false,
    select: {
      title: true,
      content: true,
      variant: true,
      allowedShapes: true,
      link: true,
    },
  })

  return result.docs.map((story) => toShortStoryCard(story as ShortStory, locale))
}

const getCachedShortStories = (locale: LocaleCode) =>
  unstable_cache(async () => loadShortStories(locale), ['short-stories', locale], {
    tags: [CACHE_TAGS.shortStories],
  })()

export const getFrontpage = cache(async (locale: LocaleCode): Promise<FrontpageView> => {
  const frontpage = await getCachedFrontpageRaw(locale)

  const preferredShape = frontpage.endOfFeed?.preferredShape
  const endOfFeedEnabled = frontpage.endOfFeed?.enabled !== false
  const endOfFeedText = frontpage.endOfFeed?.text as DefaultTypedEditorState | null | undefined
  const endOfFeed =
    endOfFeedEnabled && endOfFeedText
      ? {
          enabled: true as const,
          text: endOfFeedText,
          preferredShape: (preferredShape as StoryShape | undefined) || '2x1',
        }
      : null

  return {
    heading: frontpage.heroHeading || '',
    subheading: frontpage.heroSubheading ?? null,
    profileSummary: frontpage.profileSummary ?? null,
    image: toMediaView(frontpage.heroImage),
    endOfFeed,
    activeDecorationPackId: packIdFromValue(frontpage.activeDecorationPack),
  }
})

export const getFeedDecorations = cache(async (packId: number): Promise<FeedDecorationView[]> => {
  if (!packId) return []

  const pack = await getCachedDecorationPack(packId)
  if (!pack?.items?.length) return []

  return pack.items
    .map((item) => toFeedDecorationView(pack.id, item))
    .filter((doc): doc is FeedDecorationView => Boolean(doc))
    .slice(0, FEED_DECORATIONS_POOL_LIMIT)
})

export const getSiteShell = cache(async (locale: LocaleCode): Promise<SiteShellView> => {
  const [{ siteSettings, navigation, footer }, frontpage] = await Promise.all([
    getCachedSiteShellGlobals(locale),
    getCachedFrontpageRaw(locale),
  ])

  const packId = packIdFromValue(frontpage.activeDecorationPack)
  const pack = packId ? await getCachedDecorationPack(packId) : null
  const decorationImageUrl = footerDecorationUrlFromPack(pack)

  const navItems: NavItemView[] = (navigation.items || []).flatMap((item, index) => {
    const parent = toNavChild(item, locale, index)
    if (!parent) return []

    const children = (item.children || [])
      .map((child, childIndex) => toNavChild(child, locale, childIndex))
      .filter((child): child is NavChildView => Boolean(child))

    return [
      {
        ...parent,
        children,
      },
    ]
  })

  const footerGroups: FooterGroupView[] = (footer.groups || []).map((group, index) => ({
    id: group.id || `group-${index}`,
    title: group.title,
    links: (group.links || [])
      .map((link, linkIndex) => toNavChild(link, locale, linkIndex))
      .filter((link): link is NavChildView => Boolean(link)),
  }))

  const socialLinks: SocialLinkView[] = (footer.socialLinks || []).map((link, index) => ({
    id: link.id || `social-${index}`,
    platform: link.platform,
    url: link.url,
    label: link.label || link.platform,
  }))

  const legalLinks = (footer.legalLinks || [])
    .map((link, index) => toNavChild(link, locale, index))
    .filter((link): link is NavChildView => Boolean(link))

  return {
    locale,
    siteName: siteSettings.siteName || 'TMCS',
    tagline: siteSettings.tagline ?? null,
    description: siteSettings.description ?? null,
    siteUrl: siteSettings.siteUrl || getServerURL(),
    contactEmail: siteSettings.contactEmail ?? null,
    navigation: navItems,
    footer: {
      text: (footer.text as SiteShellView['footer']['text']) ?? null,
      decorationImageUrl,
      groups: footerGroups,
      socialLinks,
      legalLinks,
      copyright: footer.copyright ?? null,
    },
    robotsIndex: siteSettings.robots?.indexSite !== false,
    defaultSocialImage: toMediaView(siteSettings.defaultSocialImage),
    seo: {
      metaTitle: siteSettings.seo?.metaTitle ?? null,
      metaDescription: siteSettings.seo?.metaDescription ?? siteSettings.description ?? null,
      ogImage:
        toMediaView(siteSettings.seo?.ogImage) || toMediaView(siteSettings.defaultSocialImage),
    },
  }
})

export const getPostsPage = cache(
  async (locale: LocaleCode, cursor: string | null = null): Promise<PostsPageView> => {
    return getCachedPostsPage(locale, cursor)
  },
)

export const getShortStories = cache(async (locale: LocaleCode): Promise<ShortStoryCardView[]> => {
  return getCachedShortStories(locale)
})
