import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import {
  toPostCard,
  toProjectCard,
  toThingCard,
  toVideoCard,
} from '@/app/(frontend)/_lib/cms'
import type {
  FeedType,
  PostCardView,
  ProjectCardView,
  ThingCardView,
  VideoCardView,
} from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { publishedStatusWhere } from '@/lib/payload-queries'
import type { Post, Project, Thing, Video } from '@/payload-types'
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
  defaultViewAllLabel: string
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
  const select = { title: true, featuredImage: true, publishedAt: true } as const

  if (args.source === 'manual') {
    return loadOrderedManual({
      collection: 'posts',
      locale: args.locale,
      manualIds: args.manualIds,
      limit,
      select,
      toCard: (doc) => toPostCard(doc as Post),
    })
  }

  return loadLatestOrFeatured({
    collection: 'posts',
    locale: args.locale,
    source: args.source,
    limit,
    select,
    toCard: (doc) => toPostCard(doc as Post),
  })
}

async function loadProjects(args: {
  locale: LocaleCode
  source: FeedSourceMode
  limit: number
  manualIds: number[]
}): Promise<ProjectCardView[]> {
  const limit = clampLimit(args.limit)
  const select = { title: true, coverImage: true, publishedAt: true } as const

  if (args.source === 'manual') {
    return loadOrderedManual({
      collection: 'projects',
      locale: args.locale,
      manualIds: args.manualIds,
      limit,
      select,
      toCard: (doc) => toProjectCard(doc as Project),
    })
  }

  return loadLatestOrFeatured({
    collection: 'projects',
    locale: args.locale,
    source: args.source,
    limit,
    select,
    toCard: (doc) => toProjectCard(doc as Project),
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
    detailImage: true,
    affiliateUrl: true,
    linkLabel: true,
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

export const FEED_SOURCE_REGISTRY: { [K in FeedType]: FeedSourceAdapter<K> } = {
  posts: {
    defaultViewAllLabel: 'View all posts',
    defaultCursorPopup: 'explore posts',
    defaultCursorPopupEmpty: 'nothing here yet',
    defaultCursorPopupItem: 'view details',
    defaultCursorPopupViewAll: 'view all posts',
    defaultHeading: 'posts',
    loadCards: loadPosts,
  },
  projects: {
    defaultViewAllLabel: 'View all projects',
    defaultCursorPopup: "cool projects, isn't it ?",
    defaultCursorPopupEmpty: 'nothing here yet',
    defaultCursorPopupItem: 'view details',
    defaultCursorPopupViewAll: 'view all projects',
    defaultHeading: 'projects',
    loadCards: loadProjects,
  },
  things: {
    defaultViewAllLabel: 'View all things',
    defaultCursorPopup: 'tools & gear',
    defaultCursorPopupEmpty: 'nothing here yet',
    defaultCursorPopupItem: 'shop this',
    defaultCursorPopupViewAll: 'view all things',
    defaultHeading: 'things',
    loadCards: loadThings,
  },
  videos: {
    defaultViewAllLabel: 'View all videos',
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
