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
  loadShortStoryTexts,
  toMediaView,
} from '@/app/(frontend)/_lib/cms'
import { resolveCmsLink, resolvePageHref } from '@/app/(frontend)/_lib/links'
import { loadPostBySlug } from '@/app/(frontend)/_lib/cms'
import type {
  BlankSpaceBlockView,
  CallToActionBlockView,
  CmsPageView,
  FeedSectionBlockView,
  FeedType,
  FooterBlockView,
  HeroBlockView,
  HomePageView,
  MediaBlockView,
  NavChildView,
  PostCardView,
  PostDetailView,
  ProjectCardView,
  ProjectsGridBlockView,
  ResolvedBlockView,
  RichTextBlockView,
  ThingCardView,
  TypewriterBlockView,
  VideoCardView,
  ScrambleHoverBlockView,
} from '@/app/(frontend)/_lib/types'
import { CACHE_TAGS, CMS_CACHE_VERSION } from '@/lib/cache-tags'
import type { LocaleCode } from '@/lib/locales'
import { publishedStatusWhere } from '@/lib/payload-queries'
import type { Link, Page, Post } from '@payload-types'
import config from '@payload-config'

const getPayloadClient = cache(async () => getPayload({ config }))

type PageLayoutBlock = NonNullable<Page['layout']>[number]

const PAGE_SELECT = {
  title: true,
  summary: true,
  pageImage: true,
  layout: true,
  seo: true,
  slug: true,
  template: true,
} as const

function blockId(block: { id?: string | null }, fallback: string): string {
  return typeof block.id === 'string' && block.id.length > 0 ? block.id : fallback
}


/**
 * Resolve Link IDs (from a relationship picker) into `NavChildView` items.
 * Loads each Link via the Local API and applies the same resolver used inline.
 * Accepts either unpopulated numeric IDs or populated Link objects; for
 * populated objects we extract the id and resolve them directly.
 *
 * Wrapped with `cache()` so multiple blocks on the same page that reference
 * overlapping Link ids share one Local API call per request.
 */
function collectLinkIds(
  ids: Array<number | string | { id?: number | null } | null | undefined> | null | undefined,
): number[] {
  if (!ids?.length) return []
  const seen = new Set<number>()
  const numericIds: number[] = []
  for (const value of ids) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      if (!seen.has(value)) {
        seen.add(value)
        numericIds.push(value)
      }
    } else if (typeof value === 'string' && value.length > 0 && /^\d+$/.test(value)) {
      const num = Number(value)
      if (!seen.has(num)) {
        seen.add(num)
        numericIds.push(num)
      }
    } else if (value && typeof value === 'object' && typeof value.id === 'number') {
      if (!seen.has(value.id)) {
        seen.add(value.id)
        numericIds.push(value.id)
      }
    }
  }
  return numericIds
}

const loadLinksByIds = cache(
  async (locale: LocaleCode, numericIds: readonly number[]): Promise<Map<number, Link>> => {
    if (numericIds.length === 0) return new Map()
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'links',
      locale,
      fallbackLocale: false,
      where: { id: { in: [...numericIds] } },
      limit: numericIds.length,
      depth: 1,
      overrideAccess: false,
    })
    const byId = new Map<number, Link>()
    for (const doc of result.docs) {
      const link = doc as Link
      byId.set(link.id, link)
    }
    return byId
  },
)

async function resolveLinkIds(
  ids: Array<number | string | { id?: number | null } | null | undefined> | null | undefined,
  locale: LocaleCode,
  fallbackPrefix: string,
): Promise<NavChildView[]> {
  const numericIds = collectLinkIds(ids)
  if (numericIds.length === 0) return []
  const byId = await loadLinksByIds(locale, numericIds)

  const out: NavChildView[] = []
  for (const id of numericIds) {
    const link = byId.get(id)
    if (!link) continue
    const resolved = resolveCmsLink(
      {
        label: link.label,
        linkType: link.linkType,
        page: link.page ?? null,
        url: link.url,
        newTab: link.newTab,
      },
      locale,
    )
    if (!resolved) continue
    out.push({
      id: `${fallbackPrefix}-${id}`,
      ...resolved,
    })
  }
  return out
}

function toPageSeo(page: Page) {
  return {
    metaTitle: page.seo?.metaTitle ?? null,
    metaDescription: page.seo?.metaDescription ?? page.summary ?? null,
    ogImage: toMediaView(page.seo?.ogImage) || toMediaView(page.pageImage),
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
  const links = await resolveLinkIds(block.links, locale, `hero-${index}-link`)
  return {
    blockType: 'hero',
    id: blockId(block, `hero-${index}`),
    label: block.label ?? null,
    title: block.title,
    tagline: block.tagline ?? null,
    bio: (block.bio as DefaultTypedEditorState | null | undefined) ?? null,
    heroImage: toMediaView(block.heroImage),
    links,
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
  const links = await resolveLinkIds(block.links, locale, `cta-${index}-link`)
  return {
    blockType: 'callToAction',
    id: blockId(block, `cta-${index}`),
    heading: block.heading,
    body: block.body ?? null,
    links,
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

async function resolveBlankSpaceBlock(
  block: Extract<PageLayoutBlock, { blockType: 'blankSpace' }>,
  index: number,
): Promise<BlankSpaceBlockView> {
  return {
    blockType: 'blankSpace',
    id: blockId(block, `blank-space-${index}`),
    height: block.height || '60vh',
  }
}

async function resolveTypewriterBlock(
  block: Extract<PageLayoutBlock, { blockType: 'typewriter' }>,
  locale: LocaleCode,
  index: number,
): Promise<TypewriterBlockView | null> {  const ids = relationIds(block.stories)
  if (ids.length === 0) return null

  const texts = await loadShortStoryTexts(locale, ids)
  const filtered = texts.filter((text) => text.length > 0)
  if (filtered.length === 0) return null

  return {
    blockType: 'typewriter',
    id: blockId(block, `typewriter-${index}`),
    texts: filtered,
  }
}

async function resolveScrambleHoverBlock(
  block: Extract<PageLayoutBlock, { blockType: 'scramble-hover' }>,
  locale: LocaleCode,
  index: number,
): Promise<ScrambleHoverBlockView | null> {
  const ids = relationIds(block.stories)
  if (ids.length === 0) return null

  const texts = await loadShortStoryTexts(locale, ids)
  const filtered = texts.filter((text) => text.length > 0)
  if (filtered.length === 0) return null

  return {
    blockType: 'scramble-hover',
    id: blockId(block, `scramble-hover-${index}`),
    texts: filtered,
  }
}

async function resolveFooterBlock(
  block: Extract<PageLayoutBlock, { blockType: 'footer' }>,
  locale: LocaleCode,
  index: number,
): Promise<FooterBlockView> {
  const legalLinks = await resolveLinkIds(block.legalLinks, locale, `footer-${index}-legal`)

  return {
    blockType: 'footer',
    id: blockId(block, `footer-${index}`),
    footerText: (block.footerText as DefaultTypedEditorState | null | undefined) ?? null,
    legalLinks,
    copyright: block.copyright ?? null,
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
        case 'typewriter':
          return resolveTypewriterBlock(block, locale, index)
        case 'scramble-hover':
          return resolveScrambleHoverBlock(block, locale, index)
        case 'blankSpace':
          return resolveBlankSpaceBlock(block, index)
        case 'footer':
          return resolveFooterBlock(block, locale, index)
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
    pageImage: toMediaView(page.pageImage),
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
      heroImage: hero.coverImage,
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

  const pageImage = hero.coverImage

  return {
    title: hero.siteName,
    summary: hero.tagline,
    slug: 'home',
    template: 'home',
    pageImage,
    seo: {
      metaTitle: null,
      metaDescription: hero.tagline,
      ogImage: pageImage,
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
  // Cache key is namespaced by `CMS_CACHE_VERSION` so shape-changing edits
  // can invalidate everything via a constant bump (see lib/cache-tags.ts).
  unstable_cache(async () => loadHomePage(locale), [`home-page-v${CMS_CACHE_VERSION}`, locale], {
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
  // Same versioning policy as `getCachedHomePage` — see lib/cache-tags.ts.
  unstable_cache(
    async () => loadPageBySlug(locale, slug),
    [`cms-page-v${CMS_CACHE_VERSION}`, locale, slug],
    {
      tags: [
        CACHE_TAGS.pages,
        CACHE_TAGS.posts,
        CACHE_TAGS.projects,
        CACHE_TAGS.things,
        CACHE_TAGS.videos,
        CACHE_TAGS.media,
      ],
    },
  )()

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

// ─── Slug Dispatcher ───────────────────────────────────────────────────────────

type SlugReservation = {
  collection: 'pages' | 'posts'
  contentId: number
}

async function loadSlugReservation(
  locale: LocaleCode,
  slug: string,
): Promise<SlugReservation | null> {
  const payload = await getPayloadClient()
  // payload.db is the Drizzle DatabaseAdapter; the raw D1 binding (with
  // .prepare()) is at payload.db.binding. Set at adapter construction time,
  // so it's always available even before connect() runs.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db: any = payload.db.binding
  const stmt = db.prepare('SELECT collection, content_id FROM slug_reservations WHERE slug = ? AND locale = ? LIMIT 1')
  const result = (await stmt.bind(slug, locale).first()) as { collection: string; content_id: number } | null
  if (!result) return null
  return { collection: result.collection as 'pages' | 'posts', contentId: result.content_id }
}

/** Resolve a slug to its collection + content ID. Returns null if not reserved. */
export async function resolveSlug(
  locale: LocaleCode,
  slug: string,
): Promise<{ collection: 'pages' | 'posts'; contentId: number } | null> {
  return loadSlugReservation(locale, slug)
}

function toPostDetailView(post: Post): PostDetailView {
  return {
    id: post.id,
    title: post.title,
    slug: typeof post.slug === 'string' ? post.slug : '',
    excerpt: post.excerpt ?? null,
    content: post.content ?? null,
    featuredImage: toMediaView(post.featuredImage),
    publishedAt: post.publishedAt ?? null,
    readingTime: post.readingTime ?? null,
    author:
      post.author && typeof post.author === 'object' && 'title' in post.author
        ? { name: String((post.author as { title?: unknown }).title) || 'Unknown' }
        : null,
    categories: (post.categories || [])
      .map((c) =>
        typeof c === 'object' && c && 'title' in c
          ? { name: String((c as { title?: unknown }).title) }
          : null,
      )
      .filter((c): c is { name: string } => c !== null),
    tags: (post.tags || [])
      .map((t) =>
        typeof t === 'object' && t && 'title' in t
          ? { name: String((t as { title?: unknown }).title) }
          : null,
      )
      .filter((t): t is { name: string } => t !== null),
    seo: {
      metaTitle: post.seo?.metaTitle ?? null,
      metaDescription: post.seo?.metaDescription ?? post.excerpt ?? null,
      ogImage: toMediaView(post.seo?.ogImage) || toMediaView(post.featuredImage),
      canonicalUrl: post.seo?.canonicalUrl ?? null,
      noIndex: Boolean(post.seo?.noIndex),
      noFollow: Boolean(post.seo?.noFollow),
    },
  }
}

/** Load a post by slug. Returns null if the slug is not reserved for posts. */
export async function getPostBySlug(
  locale: LocaleCode,
  slug: string,
): Promise<PostDetailView | null> {
  const resolved = await resolveSlug(locale, slug)
  if (!resolved || resolved.collection !== 'posts') return null

  const post = await loadPostBySlug(locale, slug)
  if (!post) return null

  return toPostDetailView(post)
}
