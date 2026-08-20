'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import { FeedCard } from '@/app/(frontend)/_components/feed/feed-card'
import { VideoFeedCard } from '@/app/(frontend)/_components/feed/video-feed-card'
import { ViewAllFeedTile } from '@/app/(frontend)/_components/feed/view-all-feed-tile'
import { FeedGrid } from '@/app/(frontend)/_components/layout/feed-grid'
import {
  RevealGridItem,
  useGridColumnCount,
} from '@/app/(frontend)/_components/layout/reveal-grid-item'
import { SectionHeader } from '@/app/(frontend)/_components/layout/section-header'
import { loadFeedPage } from '@/app/(frontend)/_lib/actions'
import type {
  FeedDecorationView,
  FeedPaginationMode,
  FeedType,
  PostCardView,
  ProjectCardView,
  VideoCardView,
} from '@/app/(frontend)/_lib/types'
import { Button } from '@/components/ui/button'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

type FeedCardDoc = PostCardView | ProjectCardView | VideoCardView

type FeedSectionBaseProps = {
  locale: LocaleCode
  sectionId: string
  headingId: string
  heading: string
  description?: string | null
  cursorPopup?: string | null
  cursorPopupEmpty?: string | null
  cursorPopupItem?: string | null
  cursorPopupViewAll?: string | null
  pagination?: FeedPaginationMode
  nextCursor?: string | null
  hasNextPage?: boolean
  showViewAll?: boolean
  viewAllLabel?: string | null
  viewAllHref?: string | null
  className?: string
  decorations?: FeedDecorationView[]
}

type FeedSectionProps =
  | (FeedSectionBaseProps & {
      feedType: 'posts'
      docs: PostCardView[]
    })
  | (FeedSectionBaseProps & {
      feedType: 'projects'
      docs: ProjectCardView[]
    })
  | (FeedSectionBaseProps & {
      feedType: 'videos'
      docs: VideoCardView[]
    })

export function FeedSection(props: FeedSectionProps) {
  const {
    locale,
    sectionId,
    headingId,
    heading,
    description,
    cursorPopup,
    cursorPopupEmpty,
    cursorPopupItem,
    cursorPopupViewAll,
    pagination = 'static',
    nextCursor: initialNextCursor = null,
    hasNextPage: initialHasNextPage = false,
    showViewAll = false,
    viewAllLabel,
    viewAllHref,
    feedType,
    docs: initialDocs,
    className,
    decorations,
  } = props

  const [docs, setDocs] = useState<FeedCardDoc[]>(initialDocs)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [activeYouTubeId, setActiveYouTubeId] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)
  const columns = useGridColumnCount({ base: 1, sm: 2, lg: 4 })

  const loadMore = useCallback(() => {
    if (pagination !== 'infinite') return
    if (!hasNextPage || !nextCursor || isPending || loadingRef.current) return

    loadingRef.current = true
    startTransition(async () => {
      try {
        setError(null)
        const page = await loadFeedPage(feedType, locale, nextCursor)
        setDocs((current) => {
          const seen = new Set(current.map((doc) => doc.id))
          const appended = page.docs.filter((doc) => !seen.has(doc.id))
          return [...current, ...appended]
        })
        setNextCursor(page.nextCursor)
        setHasNextPage(page.hasNextPage)
      } catch {
        setError('Could not load more items. Try again.')
      } finally {
        loadingRef.current = false
      }
    })
  }, [feedType, hasNextPage, isPending, locale, nextCursor, pagination])

  useEffect(() => {
    if (pagination !== 'infinite') return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore()
        }
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore, pagination])

  const sectionCursor =
    docs.length === 0 ? cursorPopupEmpty || cursorPopup || undefined : cursorPopup || undefined

  if (docs.length === 0) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        data-feed-type={feedType}
        data-cursor-popup={sectionCursor}
        className={className}
      >
        <SectionHeader id={headingId} heading={heading} />
      </section>
    )
  }

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      data-feed-type={feedType}
      data-cursor-popup={sectionCursor}
      className={cn(
        'border-l-primary dash-line-b border-l-3 md:border-l-4 lg:border-l-5',
        className,
      )}
    >
      <SectionHeader id={headingId} heading={heading} />

      <FeedGrid>
        {docs.map((doc, index) => (
          <RevealGridItem
            key={doc.id}
            index={index}
            columns={columns}
            dataAttributes={{ 'data-feed-grid-item': true }}
            className={cn('relative z-0 min-w-0')}
          >
            {feedType === 'videos' ? (
              // Videos intentionally skip the decoration fallback - the
              // YouTube icon placeholder communicates "video tile" more
              // clearly than an ornament would, and video cards always
              // carry a thumbnail in practice.
              <VideoFeedCard
                doc={doc as VideoCardView}
                locale={locale}
                index={index}
                cursorPopup={cursorPopupItem}
                activeYouTubeId={activeYouTubeId}
                onActivateYouTube={setActiveYouTubeId}
              />
            ) : (
              <FeedCard
                doc={doc as PostCardView | ProjectCardView}
                locale={locale}
                cursorPopup={cursorPopupItem}
                decorations={decorations}
              />
            )}
          </RevealGridItem>
        ))}

        {showViewAll && viewAllHref && viewAllLabel ? (
          <RevealGridItem
            index={docs.length}
            columns={columns}
            dataAttributes={{ 'data-feed-grid-item': true }}
            className={cn('relative z-0 min-w-0 self-stretch')}
          >
            <ViewAllFeedTile
              href={viewAllHref}
              label={viewAllLabel}
              cursorPopup={cursorPopupViewAll || viewAllLabel.toLowerCase()}
            />
          </RevealGridItem>
        ) : null}
      </FeedGrid>

      {pagination === 'infinite' ? (
        <div className="bg-background flex min-h-(--header-height) flex-col items-center justify-center gap-3 px-1.5 py-4">
          <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
          <p
            role="status"
            aria-live="polite"
            className="text-muted-foreground text-xs tracking-wide uppercase"
          >
            {isPending ? 'Loading…' : hasNextPage ? 'There are more ...' : 'End of feed'}
          </p>
          {error ? (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <p role="alert" className="text-destructive text-xs">
                {error}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={isPending}
                aria-busy={isPending}
              >
                Try again
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export type { FeedType }
