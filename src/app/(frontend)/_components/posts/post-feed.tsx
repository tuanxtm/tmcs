'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useInView } from 'motion/react'

import { loadPostsPage } from '@/app/(frontend)/_lib/actions'
import {
  appendPostsAndFillStories,
  createPackerState,
  DESKTOP_COLUMNS,
  MOBILE_COLUMNS,
  sealWithClosingTile,
  TABLET_COLUMNS,
  type PackerState,
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
import { PostFeedItem } from './post-feed-item'
import { ShortStoryFeedItem } from './short-story-feed-item'

type PostFeedProps = {
  locale: LocaleCode
  initialDocs: PostCardView[]
  initialShortStories: ShortStoryCardView[]
  initialDecorations: FeedDecorationView[]
  endOfFeed: EndOfFeedView | null
  initialHasNextPage: boolean
  initialNextPage: number | null
}

type BreakpointPackers = {
  mobile: PackerState
  tablet: PackerState
  desktop: PackerState
}

function packPage(options: {
  state: PackerState
  posts: PostCardView[]
  stories: ShortStoryCardView[]
  decorations: FeedDecorationView[]
  locale: LocaleCode
  isFinal: boolean
  endOfFeed: EndOfFeedView | null
}): PackerState {
  if (!options.isFinal) {
    return appendPostsAndFillStories({
      state: options.state,
      posts: options.posts,
      stories: options.stories,
      decorations: options.decorations,
      locale: options.locale,
      fillStories: true,
    })
  }

  // Final page: posts only, then one closing tile, then decorations in leftovers.
  const packed = appendPostsAndFillStories({
    state: options.state,
    posts: options.posts,
    stories: options.stories,
    decorations: [],
    locale: options.locale,
    fillStories: false,
  })

  return sealWithClosingTile({
    state: packed,
    closing: options.endOfFeed ?? {
      enabled: false,
      eyebrow: null,
      title: '',
      message: null,
      preferredShape: '1x1',
    },
    decorations: options.decorations,
    locale: options.locale,
  })
}

function packAllBreakpoints(options: {
  states: BreakpointPackers
  posts: PostCardView[]
  stories: ShortStoryCardView[]
  decorations: FeedDecorationView[]
  locale: LocaleCode
  isFinal: boolean
  endOfFeed: EndOfFeedView | null
}): BreakpointPackers {
  const shared = {
    posts: options.posts,
    stories: options.stories,
    decorations: options.decorations,
    locale: options.locale,
    isFinal: options.isFinal,
    endOfFeed: options.endOfFeed,
  }
  return {
    mobile: packPage({ ...shared, state: options.states.mobile }),
    tablet: packPage({ ...shared, state: options.states.tablet }),
    desktop: packPage({ ...shared, state: options.states.desktop }),
  }
}

function createInitialPackers(): BreakpointPackers {
  return {
    mobile: createPackerState(MOBILE_COLUMNS),
    tablet: createPackerState(TABLET_COLUMNS),
    desktop: createPackerState(DESKTOP_COLUMNS),
  }
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
}: {
  tile: PlacedFeedTile
  locale: LocaleCode
  postIndex: number
}) {
  if (tile.kind === 'post') {
    return (
      <PostFeedItem
        post={tile.post}
        locale={locale}
        index={postIndex}
        placement={tile.placement}
        explicitPlacement
      />
    )
  }

  if (tile.kind === 'closing') {
    return (
      <ClosingFeedItem
        eyebrow={tile.eyebrow}
        title={tile.title}
        message={tile.message}
        shape={tile.shape}
        placement={tile.placement}
        explicitPlacement
      />
    )
  }

  if (tile.kind === 'decoration') {
    return (
      <DecorationFeedItem
        decoration={tile.decoration}
        shape={tile.shape}
        placement={tile.placement}
        explicitPlacement
      />
    )
  }

  return (
    <ShortStoryFeedItem
      story={tile.story}
      shape={tile.shape}
      placement={tile.placement}
      explicitPlacement
    />
  )
}

function BentoGrid({
  columns,
  packer,
  locale,
  postIndexById,
  className,
  keyPrefix,
}: {
  columns: number
  packer: PackerState
  locale: LocaleCode
  postIndexById: Map<number, number>
  className: string
  keyPrefix: string
}) {
  const cells = useMemo(() => tilesToCells(packer.tiles), [packer.tiles])
  const rows = useMemo(() => rowCount(packer.tiles), [packer.tiles])

  return (
    <div className={className} style={{ ['--bento-cols' as string]: columns }}>
      <BentoSeparators cells={cells} columns={columns} rows={rows} />
      {packer.tiles.map((tile) => (
        <FeedTileView
          key={`${keyPrefix}-${tile.key}`}
          tile={tile}
          locale={locale}
          postIndex={tile.kind === 'post' ? (postIndexById.get(tile.post.id) ?? 0) : 0}
        />
      ))}
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
  initialNextPage,
}: PostFeedProps) {
  const [docs, setDocs] = useState(initialDocs)
  const [stories] = useState(initialShortStories)
  const [decorations] = useState(initialDecorations)
  const [packers, setPackers] = useState(() =>
    packAllBreakpoints({
      states: createInitialPackers(),
      posts: initialDocs,
      stories: initialShortStories,
      decorations: initialDecorations,
      locale,
      isFinal: !initialHasNextPage,
      endOfFeed,
    }),
  )
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(sentinelRef, { margin: '200px 0px' })

  const postIndexById = useMemo(() => {
    const map = new Map<number, number>()
    docs.forEach((post, index) => map.set(post.id, index))
    return map
  }, [docs])

  const loadMore = useCallback(() => {
    if (!hasNextPage || !nextPage || loadingRef.current) return

    loadingRef.current = true
    setError(null)

    startTransition(async () => {
      try {
        const data = await loadPostsPage(locale, nextPage)
        let incoming: PostCardView[] = []
        const isFinal = !data.hasNextPage

        setDocs((current) => {
          const seen = new Set(current.map((post) => post.id))
          incoming = data.docs.filter((post) => !seen.has(post.id))
          return [...current, ...incoming]
        })
        setPackers((current) =>
          packAllBreakpoints({
            states: current,
            posts: incoming,
            stories,
            decorations,
            locale,
            isFinal,
            endOfFeed,
          }),
        )
        setHasNextPage(Boolean(data.hasNextPage))
        setNextPage(data.nextPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        loadingRef.current = false
      }
    })
  }, [decorations, endOfFeed, hasNextPage, locale, nextPage, stories])

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

  return (
    <section aria-labelledby="posts-heading">
      <div className="dash-b min-h-[var(--header-height)] px-2">
        <h2 id="posts-heading" className="mt-2 text-xl font-medium tracking-tight">
          Latest writing
        </h2>
      </div>

      <BentoGrid
        columns={MOBILE_COLUMNS}
        packer={packers.mobile}
        locale={locale}
        postIndexById={postIndexById}
        className="bento-grid grid md:hidden"
        keyPrefix="m"
      />

      <BentoGrid
        columns={TABLET_COLUMNS}
        packer={packers.tablet}
        locale={locale}
        postIndexById={postIndexById}
        className="bento-grid hidden md:grid lg:hidden"
        keyPrefix="t"
      />

      <BentoGrid
        columns={DESKTOP_COLUMNS}
        packer={packers.desktop}
        locale={locale}
        postIndexById={postIndexById}
        className="bento-grid hidden lg:grid"
        keyPrefix="d"
      />

      {!hasNextPage ? <div className="dash-b h-0" aria-hidden="true" /> : null}

      <div className="sr-only" aria-live="polite">
        {isPending ? 'Loading more posts' : null}
        {!hasNextPage ? 'End of posts' : null}
        {error ? error : null}
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
