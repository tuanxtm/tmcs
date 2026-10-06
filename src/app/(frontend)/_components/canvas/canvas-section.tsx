'use client'

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react'
import Link from 'next/link'
import { IconArrowRight } from '@tabler/icons-react'

import { loadFeedPage } from '@/app/(frontend)/_lib/actions'
import type { FeedDecorationView, FeedPaginationMode } from '@/app/(frontend)/_lib/types'
import { Scales } from '@/components/ui/scales'
import type { LocaleCode } from '@/lib/locales'

import styles from './canvas.module.css'

export type CanvasContentProps<T> = {
  docs: T[]
  locale: LocaleCode
  description: string | null
  cursorPopupItem?: string | null
  decorations?: FeedDecorationView[]
  onMovementChange: (moving: boolean) => void
  onOverlayChange: (open: boolean) => void
}

export type CanvasSectionProps<T extends { id: number }> = {
  locale: LocaleCode
  sectionId: string
  headingId: string
  heading: string
  description: string | null
  docs: T[]
  pagination: FeedPaginationMode
  nextCursor?: string | null
  hasNextPage?: boolean
  showViewAll?: boolean
  viewAllLabel?: Record<LocaleCode, string> | string | null
  viewAllHref?: string | null
  cursorPopup?: string | null
  cursorPopupEmpty?: string | null
  cursorPopupItem?: string | null
  cursorPopupViewAll?: string | null
  decorations?: FeedDecorationView[]
  className?: string
}

type CanvasFeedState<T> = {
  docs: T[]
  nextCursor: string | null
  hasNextPage: boolean
  loading: boolean
  error: string | null
}

const MORE_MESSAGE = 'There are more ...'

function createInitialState<T>(
  docs: T[],
  nextCursor: string | null,
  hasNextPage: boolean,
): CanvasFeedState<T> {
  return { docs, nextCursor, hasNextPage, loading: false, error: null }
}

export function CanvasSection<T extends { id: number }>({
  feedType,
  Canvas,
  locale,
  sectionId,
  headingId,
  heading,
  description,
  docs: initialDocs,
  pagination = 'static',
  nextCursor: initialNextCursor = null,
  hasNextPage: initialHasNextPage = false,
  showViewAll = false,
  viewAllLabel,
  viewAllHref,
  cursorPopup,
  cursorPopupEmpty,
  cursorPopupViewAll,
  cursorPopupItem,
  decorations,
  className,
}: CanvasSectionProps<T> & {
  feedType: 'projects' | 'things'
  Canvas: ComponentType<CanvasContentProps<T>>
}) {
  const EMPTY_MESSAGE = `No ${feedType} yet`
  const LOADING_MESSAGE = `Loading ${feedType}...`
  const END_MESSAGE = `End of ${feedType}`
  const ERROR_MESSAGE = `Could not load more ${feedType}. Try again.`
  const SCROLL_HINT = `Scroll to load more ${feedType}`
  const kind = feedType === 'projects' ? 'project' : 'thing'
  const infinite = pagination === 'infinite'
  const [state, setState] = useState<CanvasFeedState<T>>(() =>
    createInitialState(initialDocs, initialNextCursor, initialHasNextPage),
  )
  const stateRef = useRef(state)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)
  const movingRef = useRef(false)
  const overlayRef = useRef(false)
  const [paused, setPaused] = useState(false)
  const [moving, setMoving] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const mountedRef = useRef(true)

  // Mirror the committed state so async guards read the latest value without
  // re-creating the loader on every render.
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const resolvedViewAllLabel =
    typeof viewAllLabel === 'string'
      ? viewAllLabel
      : (viewAllLabel?.[locale] ?? viewAllLabel?.['en'] ?? '')

  const loadMore = useCallback(
    async (options?: { retry?: boolean }) => {
      if (!infinite || !mountedRef.current) return
      const current = stateRef.current
      if (loadingRef.current) return
      if (movingRef.current || overlayRef.current) return
      if (current.error && !options?.retry) return
      if (!current.hasNextPage) return

      const cursor = current.nextCursor
      if (!cursor) return

      // Set the guard synchronously before awaiting so repeated intersections
      // during the request produce exactly one request.
      loadingRef.current = true
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const page = (await loadFeedPage(feedType, locale, cursor)) as unknown as {
          docs: T[]
          nextCursor: string | null
          hasNextPage: boolean
        }
        if (!mountedRef.current) return

        // A non-null continuation cursor must advance or the loop would spin.
        if (page.hasNextPage && (!page.nextCursor || page.nextCursor === cursor)) {
          stateRef.current = {
            ...stateRef.current,
            hasNextPage: false,
            nextCursor: null,
            loading: false,
          }
          setState(stateRef.current)
          return
        }

        const seen = new Set(current.docs.map((item) => item.id))
        const appended = page.docs.filter((item) => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })

        const next: CanvasFeedState<T> = {
          docs: [...current.docs, ...appended],
          nextCursor: page.nextCursor,
          hasNextPage: page.hasNextPage,
          loading: false,
          error: null,
        }
        // Update the ref before releasing the guard.
        stateRef.current = next
        setState(next)
      } catch {
        if (!mountedRef.current) return
        // Preserve the old cursor and documents on failure.
        const next: CanvasFeedState<T> = { ...current, loading: false, error: ERROR_MESSAGE }
        stateRef.current = next
        setState(next)
      } finally {
        loadingRef.current = false
      }
    },
    [ERROR_MESSAGE, feedType, infinite, locale],
  )

  // Reobserve whenever the continuation cursor changes so an initially
  // visible sentinel can keep filling a tall viewport.
  useEffect(() => {
    if (!infinite) return
    const node = sentinelRef.current
    if (!node) return

    observerRef.current?.disconnect()
    if (moving || paused || stateRef.current.loading || stateRef.current.error) return
    if (!stateRef.current.hasNextPage || !stateRef.current.nextCursor) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore()
      },
      { rootMargin: '240px 0px' },
    )
    observer.observe(node)
    observerRef.current = observer
    return () => {
      observer.disconnect()
      observerRef.current = null
    }
  }, [infinite, loadMore, moving, paused, state.nextCursor, state.error])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      observerRef.current?.disconnect()
    }
  }, [])

  const handleMovementChange = useCallback((moving: boolean) => {
    movingRef.current = moving
    setMoving(moving)
  }, [])

  const handleOverlayChange = useCallback((open: boolean) => {
    overlayRef.current = open
    setPaused(open)
  }, [])

  const sectionCursor =
    state.docs.length === 0
      ? cursorPopupEmpty || cursorPopup || undefined
      : cursorPopup || undefined

  if (state.docs.length === 0) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        data-feed-type={feedType}
        data-cursor-popup={sectionCursor}
        className={`${styles.section} ${className ?? ''}`}
      >
        <div className={styles.frame}>
          <h2 id={headingId} className={styles.heading}>
            {heading}
          </h2>
          {description ? <p className={styles.description}>{description}</p> : null}
          <p className={styles.status}>{EMPTY_MESSAGE}</p>
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
      className={`${styles.section} ${className ?? ''}`}
    >
      <div className={styles.frame}>
        <h2 id={headingId} className={styles.heading}>
          {heading}
        </h2>
        <Canvas
          docs={state.docs}
          locale={locale}
          description={description}
          cursorPopupItem={cursorPopupItem}
          decorations={decorations}
          onMovementChange={handleMovementChange}
          onOverlayChange={handleOverlayChange}
        />

        {infinite ? (
          <div className={styles.status}>
            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
            <span role="status" aria-live="polite">
              {state.loading
                ? LOADING_MESSAGE
                : state.error
                  ? ERROR_MESSAGE
                  : state.hasNextPage
                    ? MORE_MESSAGE
                    : END_MESSAGE}
            </span>
            {state.error ? (
              <button
                type="button"
                {...{ [`data-${kind}-retry`]: '' }}
                className={`${styles.statusAction} ${styles.statusError}`}
                onClick={() => void loadMore({ retry: true })}
              >
                Try again
              </button>
            ) : null}
            {!state.loading && !state.error && state.hasNextPage ? (
              <>
                <button
                  type="button"
                  {...{ [`data-${kind}-load-more`]: '' }}
                  className={styles.statusAction}
                  onClick={() => void loadMore()}
                >
                  Load more
                </button>
                <span>{SCROLL_HINT}</span>
              </>
            ) : null}
          </div>
        ) : null}

        {showViewAll && viewAllHref && resolvedViewAllLabel ? (
          <div className={styles.viewAll} data-canvas-view-all>
            <div className={styles.viewAllScales} aria-hidden="true" data-canvas-view-all-scales>
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
              className={`${styles.viewAllLink} site-cell-hover`}
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
