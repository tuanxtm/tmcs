'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useInView } from 'motion/react'

import { loadPostsPage } from '@/app/(frontend)/_lib/actions'
import {
  DESKTOP_COLUMNS,
  MOBILE_COLUMNS,
  TABLET_COLUMNS,
  type PlacedFeedTile,
} from '@/app/(frontend)/_lib/feed-packer'
import type {
  EndOfFeedView,
  FeedDecorationView,
  PostCardView,
  ShortStoryCardView,
} from '@/app/(frontend)/_lib/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { LocaleCode } from '@/lib/locales'

import { ClosingFeedItem } from './closing-feed-item'
import { DecorationFeedItem } from './decoration-feed-item'
import { ExploreFeedButton } from './explore-feed-button'
import { PostFeedItem } from './post-feed-item'
import { replayPackerBatches, type LoadedPostBatch } from './replay-packer'
import { ShortStoryFeedItem } from './short-story-feed-item'
import { useFeedColumns } from './use-feed-columns'

type PostFeedProps = {
  locale: LocaleCode
  initialDocs: PostCardView[]
  initialShortStories: ShortStoryCardView[]
  initialDecorations: FeedDecorationView[]
  endOfFeed: EndOfFeedView | null
  initialHasNextPage: boolean
  initialNextCursor: string | null
}

type GridCell = {
  key: string
  column: number
  row: number
  columnSpan: number
  rowSpan: number
}

function tilesToCells(tiles: PlacedFeedTile[]): GridCell[] {
  return tiles.map((tile) => ({
    key: tile.key,
    column: tile.placement.column,
    row: tile.placement.row,
    columnSpan: tile.placement.columnSpan,
    rowSpan: tile.placement.rowSpan,
  }))
}

function rowCount(tiles: PlacedFeedTile[]): number {
  return tiles.reduce(
    (count, tile) => Math.max(count, tile.placement.row + tile.placement.rowSpan),
    0,
  )
}

function gridClassName(columns: number): string {
  if (columns === DESKTOP_COLUMNS) return 'bento-grid grid'
  if (columns === TABLET_COLUMNS) return 'bento-grid grid'
  return 'bento-grid grid'
}

/** Separators live on the grid container (not tiles) so zoom/subpixel rounding can't stagger them. */
function BentoSeparators({
  cells,
  columns,
  rows,
}: {
  cells: GridCell[]
  columns: number
  rows: number
}) {
  if (rows <= 0 || columns <= 0 || cells.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {cells.flatMap((cell) => {
        const rightEdge = cell.column + cell.columnSpan
        const bottomEdge = cell.row + cell.rowSpan
        const seps: React.ReactElement[] = []

        if (rightEdge < columns) {
          seps.push(
            <span
              key={`${cell.key}-r`}
              className="bento-grid-sep bento-grid-sep-v"
              style={{
                left: `${(rightEdge / columns) * 100}%`,
                top: `${(cell.row / rows) * 100}%`,
                height: `${(cell.rowSpan / rows) * 100}%`,
              }}
            />,
          )
        }

        if (bottomEdge < rows) {
          seps.push(
            <span
              key={`${cell.key}-b`}
              className="bento-grid-sep bento-grid-sep-h"
              style={{
                top: `${(bottomEdge / rows) * 100}%`,
                left: `${(cell.column / columns) * 100}%`,
                width: `${(cell.columnSpan / columns) * 100}%`,
              }}
            />,
          )
        }

        return seps
      })}
    </div>
  )
}

function FeedTileView({
  tile,
  locale,
  postIndex,
  columns,
}: {
  tile: PlacedFeedTile
  locale: LocaleCode
  postIndex: number
  columns: number
}) {
  if (tile.kind === 'post') {
    return (
      <PostFeedItem post={tile.post} locale={locale} index={postIndex} placement={tile.placement} />
    )
  }

  if (tile.kind === 'closing') {
    return <ClosingFeedItem text={tile.text} shape={tile.shape} placement={tile.placement} />
  }

  if (tile.kind === 'decoration') {
    return (
      <DecorationFeedItem
        decoration={tile.decoration}
        shape={tile.shape}
        placement={tile.placement}
        columns={columns}
      />
    )
  }

  return (
    <ShortStoryFeedItem
      story={tile.story}
      shape={tile.shape}
      placement={tile.placement}
      columns={columns}
    />
  )
}

function BentoGrid({
  columns,
  tiles,
  locale,
  postIndexById,
}: {
  columns: number
  tiles: PlacedFeedTile[]
  locale: LocaleCode
  postIndexById: Map<number, number>
}) {
  const cells = useMemo(() => tilesToCells(tiles), [tiles])
  const rows = useMemo(() => rowCount(tiles), [tiles])

  return (
    <div className="bento-grid-host">
      <div className={gridClassName(columns)} style={{ ['--bento-cols' as string]: columns }}>
        <BentoSeparators cells={cells} columns={columns} rows={rows} />
        {tiles.map((tile) => (
          <FeedTileView
            key={tile.key}
            tile={tile}
            locale={locale}
            columns={columns}
            postIndex={tile.kind === 'post' ? (postIndexById.get(tile.post.id) ?? 0) : 0}
          />
        ))}
      </div>
    </div>
  )
}

export function PostFeed({
  locale,
  initialDocs,
  initialShortStories,
  initialDecorations,
  endOfFeed,
  initialHasNextPage,
  initialNextCursor,
}: PostFeedProps) {
  const columns = useFeedColumns()
  const [batches, setBatches] = useState<LoadedPostBatch[]>(() => [
    { posts: initialDocs, isFinal: !initialHasNextPage },
  ])
  const [stories] = useState(initialShortStories)
  const [decorations] = useState(initialDecorations)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const exploreBarRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(sentinelRef, { margin: '200px 0px' })

  const packer = useMemo(
    () =>
      replayPackerBatches({
        columns,
        batches,
        stories,
        decorations,
        locale,
        endOfFeed,
      }),
    [batches, columns, decorations, endOfFeed, locale, stories],
  )

  const docs = useMemo(() => batches.flatMap((batch) => batch.posts), [batches])

  const scrollPastExploreBar = useCallback(() => {
    const bar = exploreBarRef.current
    if (!bar) return

    const header = document.querySelector('header')
    const offset = header?.getBoundingClientRect().height ?? 64
    // Sticky header covers the top of the viewport; land the grid flush beneath it.
    const top = window.scrollY + bar.getBoundingClientRect().bottom - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }, [])

  const postIndexById = useMemo(() => {
    const map = new Map<number, number>()
    docs.forEach((post, index) => map.set(post.id, index))
    return map
  }, [docs])

  const loadMore = useCallback(() => {
    if (!hasNextPage || !nextCursor || loadingRef.current) return

    loadingRef.current = true
    setError(null)

    startTransition(async () => {
      try {
        const data = await loadPostsPage(locale, nextCursor)
        const isFinal = !data.hasNextPage

        setBatches((current) => {
          const seen = new Set(current.flatMap((batch) => batch.posts.map((post) => post.id)))
          const incoming = data.docs.filter((post) => !seen.has(post.id))
          return [...current, { posts: incoming, isFinal }]
        })
        setHasNextPage(Boolean(data.hasNextPage))
        setNextCursor(data.nextCursor)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        loadingRef.current = false
      }
    })
  }, [hasNextPage, locale, nextCursor])

  useEffect(() => {
    if (inView) loadMore()
  }, [inView, loadMore])

  if (docs.length === 0) {
    return (
      <section className="dash-b min-h-[var(--header-height)]" aria-labelledby="posts-heading">
        <h2 id="posts-heading" className="mt-3 text-2xl font-medium">
          No published posts yet
        </h2>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          When posts are published in Payload, they will appear here newest to oldest.
        </p>
      </section>
    )
  }

  const liveMessage = error
    ? error
    : isPending
      ? 'Loading more posts…'
      : !hasNextPage
        ? 'End of feed'
        : null

  return (
    <section aria-labelledby="posts-heading">
      <h2 id="posts-heading" className="sr-only">
        Posts
      </h2>
      <div
        ref={exploreBarRef}
        className="dash-b flex min-h-[var(--header-height)] items-center justify-end px-2"
      >
        <ExploreFeedButton onClick={scrollPastExploreBar} />
      </div>

      <BentoGrid
        columns={columns || MOBILE_COLUMNS}
        tiles={packer.tiles}
        locale={locale}
        postIndexById={postIndexById}
      />

      {!hasNextPage ? <div className="dash-b h-0" aria-hidden="true" /> : null}

      <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>

      {hasNextPage || isPending || error ? (
        <div className="dash-b py-10">
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />

          {isPending ? (
            <div
              className="mt-4 grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4"
              aria-hidden="true"
            >
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="aspect-square rounded-xl md:col-span-1 lg:col-span-2" />
              <Skeleton className="aspect-square rounded-xl" />
            </div>
          ) : null}

          {error ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button type="button" variant="outline" onClick={loadMore}>
                Retry
              </Button>
            </div>
          ) : null}

          {hasNextPage && !isPending && !error ? (
            <Button type="button" variant="outline" onClick={loadMore} className="min-h-11">
              Load more
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
