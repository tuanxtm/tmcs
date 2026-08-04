import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { getPayload } from 'payload'

import {
  clampLimit,
  FEED_SOURCE_REGISTRY,
  isFeedPaginationMode,
  isFeedSourceMode,
  isFeedType,
  relationIds,
  type FeedPaginationMode,
  type FeedSourceMode,
} from '@/app/(frontend)/_lib/feed-registry'
import {
  getHero,
  getPostsPage,
  getProjectsPage,
  getVideosPage,
  toMediaView,
} from '@/app/(frontend)/_lib/cms'
import { resolveCmsLink, resolvePageHref } from '@/app/(frontend)/_lib/links'
import type {
  CallToActionBlockView,
  CmsPageView,
  FeedSectionBlockView,
  FeedType,
  HeroBlockView,
  HomePageView,
  MediaBlockView,
  NavChildView,
  PostCardView,
  ProjectCardView,
  ProjectsGridBlockView,
  ResolvedBlockView,
  RichTextBlockView,
  ThingCardView,
  VideoCardView,
} from '@/app/(frontend)/_lib/types'
import { CACHE_TAGS } from '@/lib/cache-tags'
import type { LocaleCode } from '@/lib/locales'
import { publishedStatusWhere } from '@/lib/payload-queries'
import type { Page } from '@/payload-types'
import config from '@payload-config'

const getPayloadClient = cache(async () => getPayload({ config }))

type PageLayoutBlock = NonNullable<Page['layout']>[number]

const PAGE_SELECT = {
  title: true,
  summary: true,
  heroMedia: true,
  layout: true,
  seo: true,
  slug: true,
  template: true,
} as const

function blockId(block: { id?: string | null }, fallback: string): string {
  return typeof block.id === 'string' && block.id.length > 0 ? block.id : fallback
}

function toNavLinks(
  links:
    | {
        id?: string | null
        label: string
        linkType: 'internal' | 'external'
        page?: unknown
        url?: string | null
        newTab?: boolean | null
      }[]
    | null
    | undefined,
  locale: LocaleCode,
): NavChildView[] {
  if (!links?.length) return []
  return links.flatMap((link, index) => {
    const resolved = resolveCmsLink(link, locale)
    if (!resolved) return []
    return [
      {
        id: link.id || `link-${index}`,
        ...resolved,
      },
    ]
  })
}

function toPageSeo(page: Page) {
  return {
    metaTitle: page.seo?.metaTitle ?? null,
    metaDescription: page.seo?.metaDescription ?? page.summary ?? null,
    ogImage: toMediaView(page.seo?.ogImage) || toMediaView(page.heroMedia),
    canonicalUrl: page.seo?.canonicalUrl ?? null,
    noIndex: Boolean(page.seo?.noIndex),
    noFollow: Boolean(page.seo?.noFollow),
  }
}

async function resolveHeroBlock(
  block: Extract<PageLayoutBlock, { blockType: 'hero' }>,
  locale: LocaleCode,
  index: number,
): Promise<HeroBlockView> {
  return {
    blockType: 'hero',
    id: blockId(block, `hero-${index}`),
    label: block.label ?? null,
    title: block.title,
    tagline: block.tagline ?? null,
    bio: (block.bio as DefaultTypedEditorState | null | undefined) ?? null,
    coverImage: toMediaView(block.coverImage),
    profileImage: toMediaView(block.profileImage),
    links: toNavLinks(block.links, locale),
    cursorPopup: block.cursorPopup ?? 'scroll down',
  }
}

async function resolveFeedSectionBlock(
  block: Extract<PageLayoutBlock, { blockType: 'feedSection' }>,
  locale: LocaleCode,
  index: number,
): Promise<FeedSectionBlockView | null> {
  if (!isFeedType(block.feedType)) return null
  const feedType: FeedType = block.feedType
  const source: FeedSourceMode = isFeedSourceMode(block.source) ? block.source : 'latest'
  const adapter = FEED_SOURCE_REGISTRY[feedType]
  const limit = clampLimit(block.limit)

  const manualIds =
    feedType === 'posts'
      ? relationIds(block.postItems)
      : feedType === 'projects'
        ? relationIds(block.projectItems)
        : feedType === 'things'
          ? relationIds((block as { thingItems?: unknown }).thingItems)
          : relationIds((block as { videoItems?: unknown }).videoItems)

  // Infinite scroll is only meaningful for latest published feeds.
  // Things homepage showcase is always static (custom layout).
  const requestedPagination: FeedPaginationMode = isFeedPaginationMode(
    (block as { pagination?: unknown }).pagination,
  )
    ? ((block as { pagination: FeedPaginationMode }).pagination)
    : 'static'
  const pagination: FeedPaginationMode =
    feedType !== 'things' && source === 'latest' && requestedPagination === 'infinite'
      ? 'infinite'
      : 'static'

  const showViewAll =
    pagination === 'infinite'
      ? false
      : (block as { showViewAll?: boolean | null }).showViewAll !== false

  const viewAllHref =
    showViewAll && 'viewAllPage' in block
      ? resolvePageHref((block as { viewAllPage?: unknown }).viewAllPage, locale)
      : null

  const base = {
    blockType: 'feedSection' as const,
    id: blockId(block, `feed-${feedType}-${index}`),
    heading: block.heading || adapter.defaultHeading,
    description: block.description ?? null,
    pagination,
    showViewAll: showViewAll && Boolean(viewAllHref),
    viewAllLabel: showViewAll ? (block.viewAllLabel ?? adapter.defaultViewAllLabel) : null,
    viewAllHref: showViewAll ? viewAllHref : null,
    cursorPopup: block.cursorPopup ?? adapter.defaultCursorPopup,
    cursorPopupEmpty: block.cursorPopupEmpty ?? adapter.defaultCursorPopupEmpty,
    cursorPopupItem: block.cursorPopupItem ?? adapter.defaultCursorPopupItem,
    cursorPopupViewAll: showViewAll
      ? (block.cursorPopupViewAll ?? adapter.defaultCursorPopupViewAll)
      : null,
  }

  if (pagination === 'infinite') {
    if (feedType === 'posts') {
      const page = await getPostsPage(locale, null)
      return {
        ...base,
        feedType: 'posts',
        docs: page.docs as PostCardView[],
        nextCursor: page.nextCursor,
        hasNextPage: page.hasNextPage,
        showViewAll: false,
        viewAllLabel: null,
        viewAllHref: null,
        cursorPopupViewAll: null,
      }
    }
    if (feedType === 'projects') {
      const page = await getProjectsPage(locale, null)
      return {
        ...base,
        feedType: 'projects',
        docs: page.docs as ProjectCardView[],
        nextCursor: page.nextCursor,
        hasNextPage: page.hasNextPage,
        showViewAll: false,
        viewAllLabel: null,
        viewAllHref: null,
        cursorPopupViewAll: null,
      }
    }
    if (feedType === 'videos') {
      const page = await getVideosPage(locale, null)
      return {
        ...base,
        feedType: 'videos',
        docs: page.docs as VideoCardView[],
        nextCursor: page.nextCursor,
        hasNextPage: page.hasNextPage,
        showViewAll: false,
        viewAllLabel: null,
        viewAllHref: null,
        cursorPopupViewAll: null,
      }
    }
    // things never infinite — fall through to static
  }

  const docs = await adapter.loadCards({
    locale,
    source,
    limit,
    manualIds,
  })

  if (feedType === 'posts') {
    return { ...base, feedType: 'posts', docs: docs as PostCardView[], nextCursor: null, hasNextPage: false }
  }
  if (feedType === 'projects') {
    return {
      ...base,
      feedType: 'projects',
      docs: docs as ProjectCardView[],
      nextCursor: null,
      hasNextPage: false,
    }
  }
  if (feedType === 'things') {
    return {
      ...base,
      feedType: 'things',
      docs: docs as ThingCardView[],
      pagination: 'static',
      nextCursor: null,
      hasNextPage: false,
    }
  }

  return {
    ...base,
    feedType: 'videos',
    docs: docs as VideoCardView[],
    nextCursor: null,
    hasNextPage: false,
  }
}

async function resolveRichTextBlock(
  block: Extract<PageLayoutBlock, { blockType: 'richText' }>,
  index: number,
): Promise<RichTextBlockView> {
  return {
    blockType: 'richText',
    id: blockId(block, `rich-text-${index}`),
    content: block.content as DefaultTypedEditorState,
  }
}

async function resolveMediaBlock(
  block: Extract<PageLayoutBlock, { blockType: 'media' }>,
  index: number,
): Promise<MediaBlockView | null> {
  const media = toMediaView(block.media)
  if (!media) return null
  return {
    blockType: 'media',
    id: blockId(block, `media-${index}`),
    media,
    caption: block.caption ?? null,
  }
}

async function resolveCallToActionBlock(
  block: Extract<PageLayoutBlock, { blockType: 'callToAction' }>,
  locale: LocaleCode,
  index: number,
): Promise<CallToActionBlockView> {
  return {
    blockType: 'callToAction',
    id: blockId(block, `cta-${index}`),
    heading: block.heading,
    body: block.body ?? null,
    links: toNavLinks(block.links, locale),
  }
}

async function resolveProjectsGridBlock(
  block: Extract<PageLayoutBlock, { blockType: 'projectsGrid' }>,
  locale: LocaleCode,
  index: number,
): Promise<ProjectsGridBlockView> {
  const adapter = FEED_SOURCE_REGISTRY.projects
  const manualIds = relationIds(block.items)
  const source: FeedSourceMode = block.featuredOnly
    ? 'featured'
    : manualIds.length > 0
      ? 'manual'
      : 'latest'

  const docs = await adapter.loadCards({
    locale,
    source,
    limit: manualIds.length > 0 ? manualIds.length : 11,
    manualIds,
  })

  return {
    blockType: 'projectsGrid',
    id: blockId(block, `projects-grid-${index}`),
    heading: block.heading ?? null,
    docs,
  }
}

export async function resolveLayoutBlocks(
  layout: Page['layout'],
  locale: LocaleCode,
): Promise<ResolvedBlockView[]> {
  if (!layout?.length) return []

  const resolved = await Promise.all(
    layout.map(async (block, index) => {
      switch (block.blockType) {
        case 'hero':
          return resolveHeroBlock(block, locale, index)
        case 'feedSection':
          return resolveFeedSectionBlock(block, locale, index)
        case 'richText':
          return resolveRichTextBlock(block, index)
        case 'media':
          return resolveMediaBlock(block, index)
        case 'callToAction':
          return resolveCallToActionBlock(block, locale, index)
        case 'projectsGrid':
          return resolveProjectsGridBlock(block, locale, index)
        default:
          return null
      }
    }),
  )

  return resolved.filter((block): block is ResolvedBlockView => Boolean(block))
}

async function loadAlternateSlug(
  pageId: number,
  locale: LocaleCode,
): Promise<string | null> {
  const otherLocale: LocaleCode = locale === 'en' ? 'vi' : 'en'
  const payload = await getPayloadClient()
  const doc = await payload.findByID({
    collection: 'pages',
    id: pageId,
    locale: otherLocale,
    fallbackLocale: false,
    depth: 0,
    overrideAccess: false,
    select: { slug: true },
  })

  const slug = typeof doc?.slug === 'string' ? doc.slug : null
  return slug && slug.length > 0 ? slug : null
}

function toCmsPageView(
  page: Page,
  blocks: ResolvedBlockView[],
  alternateSlug: string | null,
): CmsPageView {
  return {
    title: page.title,
    summary: page.summary ?? null,
    slug: page.slug,
    template: page.template,
    heroMedia: toMediaView(page.heroMedia),
    seo: toPageSeo(page),
    blocks,
    alternateSlug,
  }
}

async function buildFallbackHomePage(locale: LocaleCode): Promise<HomePageView> {
  const [hero, projects, posts, things, videos] = await Promise.all([
    getHero(locale),
    getProjectsPage(locale, null),
    getPostsPage(locale, null),
    FEED_SOURCE_REGISTRY.things.loadCards({
      locale,
      source: 'latest',
      limit: 5,
      manualIds: [],
    }),
    FEED_SOURCE_REGISTRY.videos.loadCards({
      locale,
      source: 'latest',
      limit: 11,
      manualIds: [],
    }),
  ])

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[home-page] No published home page found; using site-settings fallback layout.')
  }

  const blocks: ResolvedBlockView[] = [
    {
      blockType: 'hero',
      id: 'fallback-hero',
      label: 'Hero',
      title: hero.siteName,
      tagline: hero.tagline,
      bio: hero.bio,
      coverImage: hero.coverImage,
      profileImage: hero.image,
      links: hero.links,
      cursorPopup: 'scroll down',
    },
    {
      blockType: 'feedSection',
      id: 'fallback-projects',
      heading: FEED_SOURCE_REGISTRY.projects.defaultHeading,
      description: null,
      feedType: 'projects',
      docs: projects.docs,
      pagination: 'static',
      nextCursor: null,
      hasNextPage: false,
      showViewAll: false,
      viewAllLabel: FEED_SOURCE_REGISTRY.projects.defaultViewAllLabel,
      viewAllHref: null,
      cursorPopup: FEED_SOURCE_REGISTRY.projects.defaultCursorPopup,
      cursorPopupEmpty: FEED_SOURCE_REGISTRY.projects.defaultCursorPopupEmpty,
      cursorPopupItem: FEED_SOURCE_REGISTRY.projects.defaultCursorPopupItem,
      cursorPopupViewAll: FEED_SOURCE_REGISTRY.projects.defaultCursorPopupViewAll,
    },
    {
      blockType: 'feedSection',
      id: 'fallback-posts',
      heading: FEED_SOURCE_REGISTRY.posts.defaultHeading,
      description: null,
      feedType: 'posts',
      docs: posts.docs,
      pagination: 'static',
      nextCursor: null,
      hasNextPage: false,
      showViewAll: false,
      viewAllLabel: FEED_SOURCE_REGISTRY.posts.defaultViewAllLabel,
      viewAllHref: null,
      cursorPopup: FEED_SOURCE_REGISTRY.posts.defaultCursorPopup,
      cursorPopupEmpty: FEED_SOURCE_REGISTRY.posts.defaultCursorPopupEmpty,
      cursorPopupItem: FEED_SOURCE_REGISTRY.posts.defaultCursorPopupItem,
      cursorPopupViewAll: FEED_SOURCE_REGISTRY.posts.defaultCursorPopupViewAll,
    },
    {
      blockType: 'feedSection',
      id: 'fallback-things',
      heading: FEED_SOURCE_REGISTRY.things.defaultHeading,
      description: null,
      feedType: 'things',
      docs: things,
      pagination: 'static',
      nextCursor: null,
      hasNextPage: false,
      showViewAll: false,
      viewAllLabel: null,
      viewAllHref: null,
      cursorPopup: FEED_SOURCE_REGISTRY.things.defaultCursorPopup,
      cursorPopupEmpty: FEED_SOURCE_REGISTRY.things.defaultCursorPopupEmpty,
      cursorPopupItem: FEED_SOURCE_REGISTRY.things.defaultCursorPopupItem,
      cursorPopupViewAll: null,
    },
    {
      blockType: 'feedSection',
      id: 'fallback-videos',
      heading: FEED_SOURCE_REGISTRY.videos.defaultHeading,
      description: null,
      feedType: 'videos',
      docs: videos,
      pagination: 'static',
      nextCursor: null,
      hasNextPage: false,
      showViewAll: false,
      viewAllLabel: null,
      viewAllHref: null,
      cursorPopup: FEED_SOURCE_REGISTRY.videos.defaultCursorPopup,
      cursorPopupEmpty: FEED_SOURCE_REGISTRY.videos.defaultCursorPopupEmpty,
      cursorPopupItem: FEED_SOURCE_REGISTRY.videos.defaultCursorPopupItem,
      cursorPopupViewAll: null,
    },
  ]

  return {
    title: hero.siteName,
    summary: hero.tagline,
    slug: 'home',
    template: 'home',
    heroMedia: hero.coverImage || hero.image,
    seo: {
      metaTitle: null,
      metaDescription: hero.tagline,
      ogImage: hero.coverImage || hero.image,
      canonicalUrl: null,
      noIndex: false,
      noFollow: false,
    },
    blocks,
    alternateSlug: null,
    usedFallback: true,
  }
}

async function loadHomePage(locale: LocaleCode): Promise<HomePageView> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    where: {
      and: [publishedStatusWhere, { template: { equals: 'home' } }],
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
    select: PAGE_SELECT,
  })

  const page = (docs[0] as Page | undefined) ?? null
  if (!page) {
    return buildFallbackHomePage(locale)
  }

  const [blocks, alternateSlug] = await Promise.all([
    resolveLayoutBlocks(page.layout, locale),
    loadAlternateSlug(page.id, locale),
  ])

  return {
    ...toCmsPageView(page, blocks, alternateSlug),
    usedFallback: false,
  }
}

export function isReservedCmsPageSlug(slug: string): boolean {
  const reserved = slug.trim().toLowerCase()
  return reserved === '' || reserved === 'home' || reserved === 'homepage'
}

async function loadPageBySlug(
  locale: LocaleCode,
  slug: string,
): Promise<CmsPageView | null> {
  const trimmed = slug.trim()
  if (!trimmed || isReservedCmsPageSlug(trimmed)) {
    return null
  }

  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    locale,
    fallbackLocale: false,
    where: {
      and: [
        publishedStatusWhere,
        { slug: { equals: trimmed } },
        { slug: { exists: true } },
        { template: { not_equals: 'home' } },
      ],
    },
    limit: 1,
    depth: 2,
    overrideAccess: false,
    select: PAGE_SELECT,
  })

  const page = (docs[0] as Page | undefined) ?? null
  if (!page) return null

  const [blocks, alternateSlug] = await Promise.all([
    resolveLayoutBlocks(page.layout, locale),
    loadAlternateSlug(page.id, locale),
  ])

  return toCmsPageView(page, blocks, alternateSlug)
}

const getCachedHomePage = (locale: LocaleCode) =>
  // Key prefix bumped when Things/Videos homepage sections landed so stale
  // layouts without those blocks are not served from the durable data cache.
  unstable_cache(async () => loadHomePage(locale), ['home-page-v2', locale], {
    tags: [
      CACHE_TAGS.pages,
      CACHE_TAGS.posts,
      CACHE_TAGS.projects,
      CACHE_TAGS.things,
      CACHE_TAGS.videos,
      CACHE_TAGS.media,
    ],
  })()

const getCachedPageBySlug = (locale: LocaleCode, slug: string) =>
  // Key prefix bumped when localized slug resolution changed so stale nulls
  // (e.g. pre-seed VI slug misses) are not served from the R2 data cache.
  unstable_cache(async () => loadPageBySlug(locale, slug), ['cms-page-v2', locale, slug], {
    tags: [
      CACHE_TAGS.pages,
      CACHE_TAGS.posts,
      CACHE_TAGS.projects,
      CACHE_TAGS.things,
      CACHE_TAGS.videos,
      CACHE_TAGS.media,
    ],
  })()

export const getHomePage = cache(async (locale: LocaleCode): Promise<HomePageView> => {
  // Seed/admin updates outside a Next request cannot revalidateTag; skip the
  // durable data cache in development so layout fixes show up immediately.
  if (process.env.NODE_ENV !== 'production') {
    return loadHomePage(locale)
  }
  return getCachedHomePage(locale)
})

export const getPageBySlug = cache(
  async (locale: LocaleCode, slug: string): Promise<CmsPageView | null> => {
    // Seed/admin updates outside a Next request cannot revalidateTag; skip the
    // durable data cache in development so slug fixes show up immediately.
    if (process.env.NODE_ENV !== 'production') {
      return loadPageBySlug(locale, slug)
    }
    return getCachedPageBySlug(locale, slug)
  },
)

export function firstHeroBlock(blocks: ResolvedBlockView[]): HeroBlockView | null {
  return blocks.find((block): block is HeroBlockView => block.blockType === 'hero') ?? null
}
