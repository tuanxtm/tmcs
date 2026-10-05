import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import { toPostCard, toProjectCard, toThingCard, toVideoCard } from '@/app/(frontend)/_lib/cms'
import {
  normalizeVideoProviderLimit,
  VIDEOS_PROVIDER_ORDER,
} from '@/app/(frontend)/_lib/videos-feed'
import type {
  FeedType,
  PostCardView,
  ProjectCardView,
  ThingCardView,
  VideoCardView,
} from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { publishedStatusWhere } from '@/lib/payload-queries'
import type { Post, Project, Thing, Video } from '@payload-types'
import config from '@payload-config'

const getPayloadClient = cache(async () => getPayload({ config }))

export type FeedSourceMode = 'latest' | 'featured' | 'manual'
export type FeedPaginationMode = 'static' | 'infinite'

type FeedCardMap = {
  posts: PostCardView
  projects: ProjectCardView
  things: ThingCardView
  videos: VideoCardView
}

type FeedSourceAdapter<T extends FeedType> = {
  defaultViewAllLabel: Record<LocaleCode, string>
  defaultCursorPopup: string
  defaultCursorPopupEmpty: string
  defaultCursorPopupItem: string
  defaultCursorPopupViewAll: string
  defaultHeading: string
  loadCards: (args: {
    locale: LocaleCode
    source: FeedSourceMode
    limit: number
    manualIds: number[]
  }) => Promise<FeedCardMap[T][]>
}

function relationIds(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (typeof item === 'number') return [item]
    if (item && typeof item === 'object' && 'id' in item && typeof item.id === 'number') {
      return [item.id]
    }
    return []
  })
}

function clampLimit(limit: number | null | undefined): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return 11
  return Math.min(48, Math.max(1, Math.floor(limit)))
}

async function loadOrderedManual<TDoc, TCard>(args: {
  collection: 'posts' | 'projects' | 'things' | 'videos'
  locale: LocaleCode
  manualIds: number[]
  limit: number
  select: Record<string, true>
  toCard: (doc: TDoc) => TCard
}): Promise<TCard[]> {
  if (args.manualIds.length === 0) return []
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: args.collection,
    locale: args.locale,
    where: {
      and: [publishedStatusWhere, { id: { in: args.manualIds } }],
    },
    limit: args.manualIds.length,
    depth: 1,
    overrideAccess: false,
    select: args.select,
  })
  const byId = new Map(result.docs.map((doc) => [doc.id, args.toCard(doc as TDoc)]))
  return args.manualIds
    .flatMap((id) => {
      const card = byId.get(id)
      return card ? [card] : []
    })
    .slice(0, args.limit)
}

async function loadLatestOrFeatured<TDoc, TCard>(args: {
  collection: 'posts' | 'projects' | 'things' | 'videos'
  locale: LocaleCode
  source: FeedSourceMode
  limit: number
  select: Record<string, true>
  toCard: (doc: TDoc) => TCard
}): Promise<TCard[]> {
  const payload = await getPayloadClient()
  const where: Where =
    args.source === 'featured'
      ? { and: [publishedStatusWhere, { featured: { equals: true } }] }
      : publishedStatusWhere

  const result = await payload.find({
    collection: args.collection,
    locale: args.locale,
    where,
    sort: '-publishedAt,-id',
    limit: args.limit,
    depth: 1,
    overrideAccess: false,
    select: args.select,
  })

  return result.docs.map((doc) => args.toCard(doc as TDoc))
}

async function loadPosts(args: {
  locale: LocaleCode
  source: FeedSourceMode
  limit: number
  manualIds: number[]
}): Promise<PostCardView[]> {
  const limit = clampLimit(args.limit)
  const select = { title: true, slug: true, featuredImage: true, publishedAt: true } as const

  if (args.source === 'manual') {
    return loadOrderedManual({
      collection: 'posts',
      locale: args.locale,
      manualIds: args.manualIds,
      limit,
      select,
      toCard: (doc) => toPostCard(doc as Post, args.locale),
    })
  }

  return loadLatestOrFeatured({
    collection: 'posts',
    locale: args.locale,
    source: args.source,
    limit,
    select,
    toCard: (doc) => toPostCard(doc as Post, args.locale),
  })
}

async function loadProjects(args: {
  locale: LocaleCode
  source: FeedSourceMode
  limit: number
  manualIds: number[]
}): Promise<ProjectCardView[]> {
  const limit = clampLimit(args.limit)
  const select = { title: true, slug: true, featuredImage: true, publishedAt: true } as const

  if (args.source === 'manual') {
    return loadOrderedManual({
      collection: 'projects',
      locale: args.locale,
      manualIds: args.manualIds,
      limit,
      select,
      toCard: (doc) => toProjectCard(doc as Project, args.locale),
    })
  }

  return loadLatestOrFeatured({
    collection: 'projects',
    locale: args.locale,
    source: args.source,
    limit,
    select,
    toCard: (doc) => toProjectCard(doc as Project, args.locale),
  })
}

async function loadThings(args: {
  locale: LocaleCode
  source: FeedSourceMode
  limit: number
  manualIds: number[]
}): Promise<ThingCardView[]> {
  const limit = clampLimit(args.limit)
  const select = {
    name: true,
    description: true,
    primaryImage: true,
    primaryUrl: true,
    links: true,
    publishedAt: true,
  } as const

  if (args.source === 'manual') {
    return loadOrderedManual({
      collection: 'things',
      locale: args.locale,
      manualIds: args.manualIds,
      limit,
      select,
      toCard: (doc) => toThingCard(doc as Thing),
    })
  }

  return loadLatestOrFeatured({
    collection: 'things',
    locale: args.locale,
    source: args.source,
    limit,
    select,
    toCard: (doc) => toThingCard(doc as Thing),
  })
}

async function loadVideos(args: {
  locale: LocaleCode
  source: FeedSourceMode
  limit: number
  manualIds: number[]
}): Promise<VideoCardView[]> {
  const limit = clampLimit(args.limit)
  const select = {
    title: true,
    provider: true,
    sourceUrl: true,
    thumbnail: true,
    publishedAt: true,
  } as const

  if (args.source === 'manual') {
    return loadOrderedManual({
      collection: 'videos',
      locale: args.locale,
      manualIds: args.manualIds,
      limit,
      select,
      toCard: (doc) => toVideoCard(doc as Video),
    })
  }

  return loadLatestOrFeatured({
    collection: 'videos',
    locale: args.locale,
    source: args.source,
    limit,
    select,
    toCard: (doc) => toVideoCard(doc as Video),
  })
}

const VIDEO_PREVIEW_SELECT = {
  title: true,
  provider: true,
  sourceUrl: true,
  thumbnail: true,
  publishedAt: true,
} as const

type VideoProviderQueryArgs = {
  locale: LocaleCode
  source: FeedSourceMode
  provider: 'youtube' | 'instagram' | 'tiktok' | 'other'
  limit: number
}

/** Fetch the latest or featured published videos for one provider. */
async function loadVideosForProvider(args: VideoProviderQueryArgs): Promise<VideoCardView[]> {
  const payload = await getPayloadClient()
  const baseWhere: Where =
    args.source === 'featured'
      ? { and: [publishedStatusWhere, { featured: { equals: true } }] }
      : publishedStatusWhere

  const where: Where = {
    and: [baseWhere, { provider: { equals: args.provider } }],
  }

  const result = await payload.find({
    collection: 'videos',
    locale: args.locale,
    where,
    sort: '-publishedAt,-id',
    limit: args.limit,
    depth: 1,
    overrideAccess: false,
    select: VIDEO_PREVIEW_SELECT,
  })

  return result.docs.map((doc) => toVideoCard(doc as Video))
}

/**
 * Provider-aware preview loader for the redesigned Videos section.
 *
 * Each provider is queried independently with its own per-provider cap so a
 * heavily populated YouTube list never hides available Instagram / TikTok /
 * Other records. The returned flat array is ordered by `VIDEOS_PROVIDER_ORDER`
 * and already capped; callers group by provider on the client without making
 * extra requests.
 *
 * Manual selection preserves editor order within each provider, deduped.
 */
export type VideoPreviewArgs = {
  locale: LocaleCode
  source: FeedSourceMode
  limitPerProvider: number
  manualIds: number[]
}

export async function loadVideoPreviewCards(args: VideoPreviewArgs): Promise<VideoCardView[]> {
  const limitPerProvider = normalizeVideoProviderLimit(args.limitPerProvider)

  if (args.source === 'manual') {
    const seen = new Set<number>()
    const uniqueIds: number[] = []
    for (const id of args.manualIds) {
      if (typeof id !== 'number' || seen.has(id)) continue
      seen.add(id)
      uniqueIds.push(id)
    }

    if (uniqueIds.length === 0) return []

    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'videos',
      locale: args.locale,
      where: {
        and: [publishedStatusWhere, { id: { in: uniqueIds } }],
      },
      limit: uniqueIds.length,
      depth: 1,
      overrideAccess: false,
      select: VIDEO_PREVIEW_SELECT,
    })

    const byId = new Map<number, VideoCardView>(
      result.docs.map((doc) => [doc.id, toVideoCard(doc as Video)]),
    )

    // Reconstruct editor order, then group + cap per provider.
    const reconstructed: VideoCardView[] = []
    for (const id of uniqueIds) {
      const card = byId.get(id)
      if (card) reconstructed.push(card)
    }

    const grouped: Record<'youtube' | 'instagram' | 'tiktok' | 'other', VideoCardView[]> = {
      youtube: [],
      instagram: [],
      tiktok: [],
      other: [],
    }
    for (const card of reconstructed) {
      grouped[card.provider].push(card)
    }

    const out: VideoCardView[] = []
    for (const provider of VIDEOS_PROVIDER_ORDER) {
      const slice = grouped[provider].slice(0, limitPerProvider)
      out.push(...slice)
    }
    return out
  }

  // Latest or featured - one provider-filtered query per provider, run in parallel.
  const results = await Promise.all(
    VIDEOS_PROVIDER_ORDER.map((provider) =>
      loadVideosForProvider({
        locale: args.locale,
        source: args.source,
        provider,
        limit: limitPerProvider,
      }),
    ),
  )

  const out: VideoCardView[] = []
  for (const bucket of results) {
    out.push(...bucket)
  }
  return out
}

export const FEED_SOURCE_REGISTRY: { [K in FeedType]: FeedSourceAdapter<K> } = {
  posts: {
    defaultViewAllLabel: { en: 'View all posts', vi: 'Xem tất cả bài viết' },
    defaultCursorPopup: 'explore posts',
    defaultCursorPopupEmpty: 'nothing here yet',
    defaultCursorPopupItem: 'view details',
    defaultCursorPopupViewAll: 'view all posts',
    defaultHeading: 'posts',
    loadCards: loadPosts,
  },
  projects: {
    defaultViewAllLabel: { en: 'View all projects', vi: 'Xem tất cả dự án' },
    defaultCursorPopup: "cool projects, isn't it ?",
    defaultCursorPopupEmpty: 'nothing here yet',
    defaultCursorPopupItem: 'view details',
    defaultCursorPopupViewAll: 'view all projects',
    defaultHeading: 'projects',
    loadCards: loadProjects,
  },
  things: {
    defaultViewAllLabel: { en: 'View all things', vi: 'Xem tất cả món đồ' },
    defaultCursorPopup: 'tools & gear',
    defaultCursorPopupEmpty: 'nothing here yet',
    defaultCursorPopupItem: 'shop this',
    defaultCursorPopupViewAll: 'view all things',
    defaultHeading: 'things',
    loadCards: loadThings,
  },
  videos: {
    defaultViewAllLabel: { en: 'View all videos', vi: 'Xem tất cả videos' },
    defaultCursorPopup: 'watch',
    defaultCursorPopupEmpty: 'nothing here yet',
    defaultCursorPopupItem: 'play',
    defaultCursorPopupViewAll: 'view all videos',
    defaultHeading: 'videos',
    loadCards: loadVideos,
  },
}

export function isFeedType(value: unknown): value is FeedType {
  return value === 'posts' || value === 'projects' || value === 'things' || value === 'videos'
}

export function isFeedSourceMode(value: unknown): value is FeedSourceMode {
  return value === 'latest' || value === 'featured' || value === 'manual'
}

export function isFeedPaginationMode(value: unknown): value is FeedPaginationMode {
  return value === 'static' || value === 'infinite'
}

export { clampLimit, relationIds }
