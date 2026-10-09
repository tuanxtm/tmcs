'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'

import { FeedCard } from '@/app/(frontend)/_components/feed/feed-card'
import { VideoFeedCard } from '@/app/(frontend)/_components/feed/video-feed-card'
import { FeedGrid } from '@/app/(frontend)/_components/layout/feed-grid'
import {
  RevealGridItem,
  useGridColumnCount,
} from '@/app/(frontend)/_components/layout/reveal-grid-item'
import { SectionHeader } from '@/app/(frontend)/_components/layout/section-header'
import { PostsCarousel } from '@/app/(frontend)/_components/posts/posts-carousel'
import canvasStyles from '@/app/(frontend)/_components/canvas/canvas.module.css'
import postsStyles from '@/app/(frontend)/_components/posts/posts.module.css'
import { loadFeedPage } from '@/app/(frontend)/_lib/actions'
import type {
  FeedPaginationMode,
  FeedType,
  PostCardView,
  ProjectCardView,
  VideoCardView,
} from '@/app/(frontend)/_lib/types'
import { Button } from '@/components/ui/button'
import { Scales } from '@/components/ui/scales'
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
  viewAllLabel?: Record<LocaleCode, string> | string | null
  viewAllHref?: string | null
  className?: string
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
        const page = (await loadFeedPage(feedType, locale, nextCursor)) as {
          docs: FeedCardDoc[]
          nextCursor: string | null
          hasNextPage: boolean
        }
        setDocs((current) => {
          const seen = new Set(current.map((doc) => doc.id))
          const appended = page.docs.filter((doc) => {
            if (seen.has(doc.id)) return false
            seen.add(doc.id)
            return true
          })
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

  const resolvedViewAllLabel =
    typeof viewAllLabel === 'string'
      ? viewAllLabel
      : (viewAllLabel?.[locale] ?? viewAllLabel?.['en'] ?? '')

  if (docs.length === 0) {
    if (feedType === 'posts') {
      return (
        <section
          id={sectionId}
          aria-labelledby={headingId}
          data-feed-type={feedType}
          data-cursor-popup={sectionCursor}
          className={cn(canvasStyles.section, className)}
        >
          <div className={canvasStyles.frame}>
            <h2 id={headingId} className={canvasStyles.heading}>
              {heading}
            </h2>
            {description ? <p className={canvasStyles.description}>{description}</p> : null}
            <p className={canvasStyles.status} role="status" aria-live="polite">
              No posts yet
            </p>
          </div>
        </section>
      )
    }
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

  if (feedType === 'posts') {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        data-feed-type={feedType}
        data-cursor-popup={sectionCursor}
        className={cn(canvasStyles.section, className)}
      >
        <div className={canvasStyles.frame}>
          <h2 id={headingId} className={canvasStyles.heading}>
            {heading}
          </h2>
          {description ? <p className={postsStyles.description}>{description}</p> : null}
          <PostsCarousel
            docs={docs as PostCardView[]}
            locale={locale}
            cursorPopupItem={cursorPopupItem}
          />
          {pagination === 'infinite' ? (
            <div
              className={cn(
                'bg-background flex min-h-(--header-height) flex-col items-center justify-center',
                'gap-3',
                'px-1.5 py-4',
              )}
            >
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
          {showViewAll && viewAllHref && resolvedViewAllLabel ? (
            <div className={canvasStyles.viewAll} data-canvas-view-all>
              <div
                className={canvasStyles.viewAllScales}
                aria-hidden="true"
                data-canvas-view-all-scales
              >
                <Scales
                  orientation="diagonal"
                  size={10}
                  color="var(--site-grid-line-color, color-mix(in oklch, var(--accent) 10%, transparent))"
                />
              </div>
              <Link
                href={viewAllHref}
                transitionTypes={['nav-forward']}
                data-cursor-popup={cursorPopupViewAll || resolvedViewAllLabel.toLowerCase()}
                className={cn(canvasStyles.viewAllLink, 'site-cell-hover')}
                data-canvas-view-all-link
              >
                <span>{resolvedViewAllLabel}</span>
                <IconArrowRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      data-feed-type={feedType}
      data-cursor-popup={sectionCursor}
      className={cn(className)}
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
              <VideoFeedCard
                doc={doc as VideoCardView}
                locale={locale}
                index={index}
                cursorPopup={cursorPopupItem}
                activeYouTubeId={activeYouTubeId}
                onActivateYouTubeAction={setActiveYouTubeId}
              />
            ) : (
              <FeedCard
                doc={doc as PostCardView | ProjectCardView}
                locale={locale}
                cursorPopup={cursorPopupItem}
              />
            )}
          </RevealGridItem>
        ))}
      </FeedGrid>

      {pagination === 'infinite' ? (
        <div className={cn(
          'bg-background flex min-h-(--header-height) flex-col items-center justify-center',
          'gap-3',
          'px-1.5 py-4',
        )}>
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
      <div className={cn(
        'bg-background',
        'flex h-(--header-height) items-center justify-end',
        'px-1.5 md:px-2 lg:px-3',
      )}>
        {showViewAll && viewAllHref && resolvedViewAllLabel ? (
          <Link
            href={viewAllHref}
            transitionTypes={['nav-forward']}
            data-cursor-popup={cursorPopupViewAll || resolvedViewAllLabel.toLowerCase()}
            className={cn(
              'text-foreground/90 leading-none font-medium tracking-tight lowercase',
              'hover:text-primary transition-colors',
              'text-xs md:text-sm lg:text-base',
            )}
          >
            {resolvedViewAllLabel}
          </Link>
        ) : null}
      </div>
    </section>
  )
}

export type { FeedType }
