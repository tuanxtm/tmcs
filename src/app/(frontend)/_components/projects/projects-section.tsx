'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import { loadFeedPage } from '@/app/(frontend)/_lib/actions'
import type {
  FeedDecorationView,
  FeedPaginationMode,
  ProjectCardView,
  ProjectsPageView,
} from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

import { ProjectsCanvas } from './projects-canvas'
import styles from './projects.module.css'

export type ProjectsSectionProps = {
  locale: LocaleCode
  sectionId: string
  headingId: string
  heading: string
  description: string | null
  docs: ProjectCardView[]
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

type ProjectsFeedState = ProjectsPageView & {
  loading: boolean
  error: string | null
}

const EMPTY_MESSAGE = 'No projects yet'
const LOADING_MESSAGE = 'Loading projects...'
const MORE_MESSAGE = 'There are more ...'
const END_MESSAGE = 'End of projects'
const ERROR_MESSAGE = 'Could not load more projects. Try again.'
const SCROLL_HINT = 'Scroll to load more projects'

function createInitialState(
  docs: ProjectCardView[],
  nextCursor: string | null,
  hasNextPage: boolean,
): ProjectsFeedState {
  return { docs, nextCursor, hasNextPage, loading: false, error: null }
}

export function ProjectsSection({
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
  cursorPopupItem,
  cursorPopupViewAll,
  className,
  decorations,
}: ProjectsSectionProps) {
  const infinite = pagination === 'infinite'
  const [state, setState] = useState<ProjectsFeedState>(() =>
    createInitialState(initialDocs, initialNextCursor, initialHasNextPage),
  )
  const stateRef = useRef(state)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)
  const movingRef = useRef(false)
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
      if (movingRef.current) return
      if (current.error && !options?.retry) return
      if (!current.hasNextPage) return

      const cursor = current.nextCursor
      if (!cursor) return

      // Set the guard synchronously before awaiting so repeated intersections
      // during the request produce exactly one request.
      loadingRef.current = true
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const page = (await loadFeedPage('projects', locale, cursor)) as ProjectsPageView
        if (!mountedRef.current) return

        // A non-null continuation cursor must advance or the loop would spin.
        if (page.nextCursor === cursor) {
          stateRef.current = {
            ...stateRef.current,
            hasNextPage: false,
            nextCursor: null,
            loading: false,
          }
          setState(stateRef.current)
          return
        }

        const seen = new Set(current.docs.map((project) => project.id))
        const appended = page.docs.filter((project) => {
          if (seen.has(project.id)) return false
          seen.add(project.id)
          return true
        })

        const next: ProjectsFeedState = {
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
        const next: ProjectsFeedState = { ...current, loading: false, error: ERROR_MESSAGE }
        stateRef.current = next
        setState(next)
      } finally {
        loadingRef.current = false
      }
    },
    [infinite, locale],
  )

  // Reobserve whenever the continuation cursor changes so an initially
  // visible sentinel can keep filling a tall viewport.
  useEffect(() => {
    if (!infinite) return
    const node = sentinelRef.current
    if (!node) return

    observerRef.current?.disconnect()
    if (moving || stateRef.current.loading || stateRef.current.error) return
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
  }, [infinite, loadMore, moving, state.nextCursor, state.error])

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

  const sectionCursor =
    state.docs.length === 0
      ? cursorPopupEmpty || cursorPopup || undefined
      : cursorPopup || undefined

  if (state.docs.length === 0) {
    return (
      <section
        id={sectionId}
        aria-labelledby={headingId}
        data-feed-type="projects"
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
      data-feed-type="projects"
      data-cursor-popup={sectionCursor}
      className={`${styles.section} ${className ?? ''}`}
    >
      <div className={styles.frame}>
        <h2 id={headingId} className={styles.heading}>
          {heading}
        </h2>
        <ProjectsCanvas
          projects={state.docs}
          description={description}
          cursorPopupItem={cursorPopupItem}
          decorations={decorations}
          onMovementChange={handleMovementChange}
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
                data-project-retry=""
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
                  data-project-load-more=""
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
          <div className={styles.viewAll}>
            <Link
              href={viewAllHref}
              transitionTypes={['nav-forward']}
              data-cursor-popup={cursorPopupViewAll || resolvedViewAllLabel.toLowerCase()}
              className={styles.viewAllLink}
            >
              {resolvedViewAllLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  )
}
