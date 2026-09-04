import { cache } from 'react'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { CACHE_TAGS } from '@/lib/cache-tags'
import { getServerURL } from '@/lib/env'
import type { LocaleCode } from '@/lib/locales'
import { publishedStatusWhere } from '@/lib/payload-queries'
import { lexicalToPlainText } from '@/lib/readingTime'
import type {
  DecorationPack,
  FeedDecoration,
  Media,
  Page,
  Post,
  Project,
  ShortStory,
  Thing,
  Video,
} from '@payload-types'
import config from '@payload-config'

import { resolveCmsLink } from './links'
import { pageHref } from './locale'
import { cursorFromPost, decodePostsCursor } from './posts-cursor'
import type {
  FeedDecorationView,
  MediaView,
  NavChildView,
  NavItemView,
  PostCardView,
  PostsPageView,
  ProjectCardView,
  ProjectsPageView,
  HeroView,
  ShortStoryCardView,
  SiteShellView,
  ThingCardView,
  ThingPlatformLink,
  VideoCardView,
  VideoProvider,
  VideosPageView,
} from './types'
import { parseYouTubeVideoId } from '@/lib/youtube'

export const POSTS_PAGE_SIZE = 11
export const PROJECTS_PAGE_SIZE = 11
export const VIDEOS_PAGE_SIZE = 11
export const SHORT_STORIES_POOL_LIMIT = 48
export const FEED_DECORATIONS_POOL_LIMIT = 48
export const FEED_POOL_LIMIT = 48
/** Homepage Things showcase: default preview tile count (plus optional View all). */
export const THINGS_HOMEPAGE_LIMIT = 5

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

function toLinkChild(
  linkDoc: unknown,
  locale: LocaleCode,
  fallbackIndex: number,
  fallbackId: string,
): NavChildView | null {
  if (!linkDoc || typeof linkDoc !== 'object') return null
  const link = linkDoc as {
    id?: number | string | null
    label?: string | null
    linkType?: 'internal' | 'external' | null
    page?: number | null | Page
    url?: string | null
    newTab?: boolean | null
  }

  const resolved = resolveCmsLink(
    {
      label: link.label,
      linkType: link.linkType,
      page: isPage(link.page) ? link.page : null,
      url: link.url,
      newTab: link.newTab,
    },
    locale,
  )
  if (!resolved) return null

  return {
    id: link.id != null ? String(link.id) : fallbackId,
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

function toFeedDecorationView(
  packId: number,
  item: NonNullable<SlimDecorationPack['items']>[number],
): FeedDecorationView | null {
  if (!item.id) return null

  const file = item.file
  const imageUrl = isFeedDecorationFile(file) ? file.url : null
  if (!imageUrl) return null

  return {
    id: item.id,
    packId,
    imageUrl,
    // Packer default until the feed layout is redesigned.
    allowedShapes: ['1x1'],
    weight: typeof item.weight === 'number' && item.weight > 0 ? item.weight : 1,
  }
}

function toPostCard(post: Post, locale: LocaleCode): PostCardView {
  const image = toMediaView(post.featuredImage)
  const slug = typeof post.slug === 'string' ? post.slug : null

  return {
    id: post.id,
    slug,
    title: post.title,
    href: slug ? pageHref(locale, slug) : null,
    publishedAt: post.publishedAt ?? null,
    image,
  }
}

function toProjectCard(project: Project, locale: LocaleCode): ProjectCardView {
  const image = toMediaView(project.featuredImage)
  const slug = typeof project.slug === 'string' ? project.slug : null

  return {
    id: project.id,
    slug,
    title: project.title,
    href: slug ? pageHref(locale, slug) : null,
    publishedAt: project.publishedAt ?? null,
    image,
  }
}

function toThingCard(thing: Thing): ThingCardView {
  const primaryImage = toMediaView(thing.primaryImage)
  const detailImage = toMediaView(thing.detailImage) || primaryImage

  const links: ThingPlatformLink[] = (thing.links ?? []).flatMap((l) =>
    l?.label && l?.url ? [{ label: l.label, url: l.url }] : [],
  )

  return {
    id: thing.id,
    slug: null,
    name: thing.name,
    description: thing.description ?? null,
    primaryImage,
    detailImage,
    primaryUrl: thing.primaryUrl ?? null,
    links,
    publishedAt: thing.publishedAt ?? null,
  }
}

function toVideoProvider(value: unknown): VideoProvider {
  if (value === 'tiktok' || value === 'instagram' || value === 'other' || value === 'youtube') {
    return value
  }
  return 'other'
}

function toVideoCard(video: Video): VideoCardView {
  const provider = toVideoProvider(video.provider)
  const sourceUrl = video.sourceUrl || ''
  const youtubeId = provider === 'youtube' ? parseYouTubeVideoId(sourceUrl) : null

  return {
    id: video.id,
    slug: null,
    title: video.title,
    provider,
    sourceUrl,
    youtubeId,
    publishedAt: video.publishedAt ?? null,
    image: toMediaView(video.thumbnail),
  }
}

export { toPostCard, toProjectCard, toThingCard, toVideoCard }

async function loadPostBySlug(locale: LocaleCode, slug: string): Promise<Post | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    locale,
    fallbackLocale: false,
    where: {
      and: [publishedStatusWhere, { slug: { equals: slug } }, { slug: { exists: true } }],
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      layout: true,
      featuredImage: true,
      publishedAt: true,
      readingTime: true,
      author: true,
      categories: true,
      tags: true,
      seo: true,
      templatePage: true,
    },
  })
  return (docs[0] as Post | undefined) ?? null
}

async function cachedLoadPostBySlug(locale: LocaleCode, slug: string): Promise<Post | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.media)
  return loadPostBySlug(locale, slug)
}

export { cachedLoadPostBySlug as loadPostBySlug }

async function loadProjectBySlug(locale: LocaleCode, slug: string): Promise<Project | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'projects',
    locale,
    fallbackLocale: false,
    where: {
      and: [publishedStatusWhere, { slug: { equals: slug } }, { slug: { exists: true } }],
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      content: true,
      layout: true,
      featuredImage: true,
      publishedAt: true,
      author: true,
      categories: true,
      tags: true,
      seo: true,
      templatePage: true,
    },
  })
  return (docs[0] as Project | undefined) ?? null
}

async function cachedLoadProjectBySlug(
  locale: LocaleCode,
  slug: string,
): Promise<Project | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.projects, CACHE_TAGS.media)
  return loadProjectBySlug(locale, slug)
}

export { cachedLoadProjectBySlug as loadProjectBySlug }

async function loadThingBySlug(
  locale: LocaleCode,
  slug: string,
): Promise<Record<string, unknown> | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'things',
    locale,
    fallbackLocale: false,
    where: {
      and: [publishedStatusWhere, { slug: { equals: slug } }, { slug: { exists: true } }],
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
    select: {
      id: true,
      slug: true,
      name: true,
      primaryUrl: true,
      links: true,
    },
  })
  return (docs[0] as unknown as Record<string, unknown> | undefined) ?? null
}

async function cachedLoadThingBySlug(
  locale: LocaleCode,
  slug: string,
): Promise<Record<string, unknown> | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.things, CACHE_TAGS.media)
  return loadThingBySlug(locale, slug)
}

export { cachedLoadThingBySlug as loadThingBySlug }

function toShortStoryCard(story: ShortStory, locale: LocaleCode): ShortStoryCardView {
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
    // Packer default: allow every footprint until the feed layout is redesigned.
    allowedShapes: null,
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

async function cachedLoadDecorationPack(packId: number): Promise<SlimDecorationPack | null> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.decorationPacks)
  return loadDecorationPack(packId)
}

async function loadSiteSettings(locale: LocaleCode) {
  const payload = await getPayloadClient()
  return payload.findGlobal({
    slug: 'site-settings',
    locale,
    depth: 2,
    overrideAccess: false,
  })
}

async function cachedLoadSiteSettings(locale: LocaleCode) {
  'use cache'
  cacheLife('days')
  cacheTag(
    CACHE_TAGS.siteShell,
    CACHE_TAGS.media,
    CACHE_TAGS.decorationPacks,
    CACHE_TAGS.links,
  )
  return loadSiteSettings(locale)
}

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
    },
  })

  const hasNextPage = result.docs.length > POSTS_PAGE_SIZE
  const pageDocs = hasNextPage ? result.docs.slice(0, POSTS_PAGE_SIZE) : result.docs
  const cards = pageDocs.map((post) => toPostCard(post as Post, locale))
  const last = cards[cards.length - 1]
  const nextCursor = hasNextPage && last ? cursorFromPost(last) : null

  return {
    docs: cards,
    nextCursor,
    hasNextPage,
  }
}

async function cachedLoadPostsPage(
  locale: LocaleCode,
  cursorRaw: string | null,
): Promise<PostsPageView> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.posts, CACHE_TAGS.media)
  return loadPostsPage(locale, cursorRaw)
}

async function loadProjectsPage(
  locale: LocaleCode,
  cursorRaw: string | null,
): Promise<ProjectsPageView> {
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
    collection: 'projects',
    locale,
    where,
    sort: '-publishedAt,-id',
    limit: PROJECTS_PAGE_SIZE + 1,
    depth: 1,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      featuredImage: true,
      publishedAt: true,
    },
  })

  const hasNextPage = result.docs.length > PROJECTS_PAGE_SIZE
  const pageDocs = hasNextPage ? result.docs.slice(0, PROJECTS_PAGE_SIZE) : result.docs
  const cards = pageDocs.map((project) => toProjectCard(project as Project, locale))
  const last = cards[cards.length - 1]
  const nextCursor = hasNextPage && last ? cursorFromPost(last) : null

  return {
    docs: cards,
    nextCursor,
    hasNextPage,
  }
}

async function cachedLoadProjectsPage(
  locale: LocaleCode,
  cursorRaw: string | null,
): Promise<ProjectsPageView> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.projects, CACHE_TAGS.media)
  return loadProjectsPage(locale, cursorRaw)
}

async function loadVideosPage(
  locale: LocaleCode,
  cursorRaw: string | null,
): Promise<VideosPageView> {
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
    collection: 'videos',
    locale,
    where,
    sort: '-publishedAt,-id',
    limit: VIDEOS_PAGE_SIZE + 1,
    depth: 1,
    overrideAccess: false,
    select: {
      title: true,
      provider: true,
      sourceUrl: true,
      thumbnail: true,
      publishedAt: true,
    },
  })

  const hasNextPage = result.docs.length > VIDEOS_PAGE_SIZE
  const pageDocs = hasNextPage ? result.docs.slice(0, VIDEOS_PAGE_SIZE) : result.docs
  const cards = pageDocs.map((video) => toVideoCard(video as Video))
  const last = cards[cards.length - 1]
  const nextCursor = hasNextPage && last ? cursorFromPost(last) : null

  return {
    docs: cards,
    nextCursor,
    hasNextPage,
  }
}

async function cachedLoadVideosPage(
  locale: LocaleCode,
  cursorRaw: string | null,
): Promise<VideosPageView> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.videos, CACHE_TAGS.media)
  return loadVideosPage(locale, cursorRaw)
}

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
      link: true,
    },
  })

  return result.docs.map((story) => toShortStoryCard(story as ShortStory, locale))
}

async function cachedLoadShortStories(locale: LocaleCode): Promise<ShortStoryCardView[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.shortStories)
  return loadShortStories(locale)
}

async function loadShortStoryTextsInner(locale: LocaleCode, ids: number[]): Promise<string[]> {
  if (ids.length === 0) return []

  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'short-stories',
    locale,
    where: {
      and: [publishedStatusWhere, { id: { in: ids } }],
    },
    sort: '-publishedAt',
    limit: ids.length,
    depth: 0,
    overrideAccess: false,
    select: {
      id: true,
      content: true,
    },
  })

  const byId = new Map<number, string>()
  for (const doc of result.docs) {
    byId.set((doc as ShortStory).id, lexicalToPlainText((doc as ShortStory).content))
  }

  return ids.map((id) => byId.get(id) ?? '')
}

export const getHero = cache(async (locale: LocaleCode): Promise<HeroView> => {
  const siteSettings = await cachedLoadSiteSettings(locale)

  const links = (siteSettings.profileLinks || [])
    .map((link, index) => toLinkChild(link, locale, index, `profile-link-${index}`))
    .filter((link): link is NavChildView => Boolean(link))

  return {
    siteName: siteSettings.siteName || 'TMCS',
    tagline: siteSettings.tagline ?? null,
    coverImage: toMediaView(siteSettings.coverImage),
    bio: (siteSettings.bio as HeroView['bio']) ?? null,
    links,
  }
})

export const getFeedDecorations = cache(async (packId: number): Promise<FeedDecorationView[]> => {
  if (!packId) return []

  const pack = await cachedLoadDecorationPack(packId)
  if (!pack?.items?.length) return []

  return pack.items
    .map((item) => toFeedDecorationView(pack.id, item))
    .filter((doc): doc is FeedDecorationView => Boolean(doc))
    .slice(0, FEED_DECORATIONS_POOL_LIMIT)
})

/**
 * Resolve the single Feed decoration selected by the active decoration pack's
 * `footerItem` row id. Returns null when no pack is active, the pack has no
 * footer item, or the referenced row is missing/has no image.
 *
 * Cached per pack id + footer item id pair via `React.cache()` so the home,
 * feed, and detail pages share a single Payload read per request when the
 * footer block is rendered more than once.
 */
export const getFooterDecoration = cache(
  async (packId: number, footerItemId: string | null): Promise<FeedDecorationView | null> => {
    if (!packId || !footerItemId) return null
    const pack = await cachedLoadDecorationPack(packId)
    if (!pack?.items?.length) return null
    const item = pack.items.find((row) => row?.id === footerItemId)
    if (!item) return null
    return toFeedDecorationView(pack.id, item)
  },
)

/**
 * Resolve the active decoration pack's `footerItem` row id for a locale.
 * Returns null when no pack is active or the pack does not nominate a
 * footer item. Reads through `cachedLoadDecorationPack` so the same
 * `'use cache'` boundary + tag invalidation applies as for the rest of
 * the decoration pipeline.
 */
export const getActiveFooterItemId = cache(
  async (packId: number): Promise<string | null> => {
    if (!packId) return null
    const pack = await cachedLoadDecorationPack(packId)
    const raw = pack?.footerItem
    return typeof raw === 'string' && raw.length > 0 ? raw : null
  },
)

export const getSiteShell = cache(async (locale: LocaleCode): Promise<SiteShellView> => {
  const siteSettings = await cachedLoadSiteSettings(locale)

  const packId = packIdFromValue(siteSettings.activeDecorationPack)

  const navItems: NavItemView[] = (siteSettings.navigation || []).flatMap((item, index) => {
    const parent = toLinkChild(item.link, locale, index, `nav-${index}`)
    if (!parent) return []

    const children = (item.children || [])
      .map((child, childIndex) =>
        toLinkChild(child.link, locale, childIndex, `nav-${index}-child-${childIndex}`),
      )
      .filter((child): child is NavChildView => Boolean(child))

    return [
      {
        ...parent,
        children,
      },
    ]
  })

  const profileLinks = (siteSettings.profileLinks || [])
    .map((link, index) => toLinkChild(link, locale, index, `profile-link-${index}`))
    .filter((link): link is NavChildView => Boolean(link))

  return {
    locale,
    siteName: siteSettings.siteName || 'TMCS',
    tagline: siteSettings.tagline ?? null,
    description: siteSettings.description ?? null,
    siteUrl: siteSettings.siteUrl || getServerURL(),
    contactEmail: siteSettings.contactEmail ?? null,
    profileLinks,
    navigation: navItems,
    activeDecorationPackId: packId,
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
    return cachedLoadPostsPage(locale, cursor)
  },
)

export const getProjectsPage = cache(
  async (locale: LocaleCode, cursor: string | null = null): Promise<ProjectsPageView> => {
    return cachedLoadProjectsPage(locale, cursor)
  },
)

export const getVideosPage = cache(
  async (locale: LocaleCode, cursor: string | null = null): Promise<VideosPageView> => {
    return cachedLoadVideosPage(locale, cursor)
  },
)

export const getShortStories = cache(async (locale: LocaleCode): Promise<ShortStoryCardView[]> => {
  return cachedLoadShortStories(locale)
})

async function cachedLoadShortStoryTexts(
  locale: LocaleCode,
  ids: number[],
): Promise<string[]> {
  'use cache'
  cacheLife('days')
  cacheTag(CACHE_TAGS.shortStories)
  return loadShortStoryTextsInner(locale, ids)
}

export const loadShortStoryTexts = cache(
  async (locale: LocaleCode, ids: number[]): Promise<string[]> => {
    if (ids.length === 0) return []
    return cachedLoadShortStoryTexts(locale, ids)
  },
)
