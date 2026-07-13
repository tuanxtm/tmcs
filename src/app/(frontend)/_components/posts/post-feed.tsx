'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useInView } from 'motion/react'

import { loadPostsPage } from '@/app/(frontend)/_lib/actions'
import type { PostCardView } from '@/app/(frontend)/_lib/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { LocaleCode } from '@/lib/locales'

import { PostFeedItem } from './post-feed-item'

type PostFeedProps = {
  locale: LocaleCode
  initialDocs: PostCardView[]
  initialHasNextPage: boolean
  initialNextPage: number | null
}

export function PostFeed({
  locale,
  initialDocs,
  initialHasNextPage,
  initialNextPage,
}: PostFeedProps) {
  const [docs, setDocs] = useState(initialDocs)
  const [hasNextPage, setHasNextPage] = useState(initialHasNextPage)
  const [nextPage, setNextPage] = useState(initialNextPage)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const loadingRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const inView = useInView(sentinelRef, { margin: '200px 0px' })

  const loadMore = useCallback(() => {
    if (!hasNextPage || !nextPage || loadingRef.current) return

    loadingRef.current = true
    setError(null)

    startTransition(async () => {
      try {
        const data = await loadPostsPage(locale, nextPage)

        setDocs((current) => {
          const seen = new Set(current.map((post) => post.id))
          const incoming = data.docs.filter((post) => !seen.has(post.id))
          return [...current, ...incoming]
        })
        setHasNextPage(Boolean(data.hasNextPage))
        setNextPage(data.nextPage)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        loadingRef.current = false
      }
    })
  }, [hasNextPage, locale, nextPage])

  useEffect(() => {
    if (inView) loadMore()
  }, [inView, loadMore])

  if (docs.length === 0) {
    return (
      <section className="page-frame py-16" aria-labelledby="posts-heading">
        <p className="page-label">02 / Posts</p>
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
      <div className="page-frame py-8">
        <p className="page-label">02 / Posts</p>
        <h2 id="posts-heading" className="mt-2 text-xl font-medium tracking-tight">
          Latest writing
        </h2>
      </div>

      <div>
        {docs.map((post, index) => (
          <PostFeedItem key={post.id} post={post} locale={locale} index={index} />
        ))}
      </div>

      <div className="page-frame py-10">
        <div ref={sentinelRef} className="h-1" aria-hidden="true" />

        <div className="sr-only" aria-live="polite">
          {isPending ? 'Loading more posts' : null}
          {!hasNextPage ? 'End of posts' : null}
          {error ? error : null}
        </div>

        {isPending ? (
          <div className="space-y-4" aria-hidden="true">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : null}

        {error ? (
          <div className="flex flex-col items-start gap-3 border border-dashed border-[color:var(--border-dashed)] p-4">
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

        {!hasNextPage ? <p className="page-label mt-2">End of feed</p> : null}
      </div>
    </section>
  )
}
