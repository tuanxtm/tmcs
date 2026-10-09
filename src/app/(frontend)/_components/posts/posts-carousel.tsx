'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import Link from 'next/link'

import type { FlexCarouselItem, FlexCarouselProps } from '@/components/ui/flex-carousel'
import { formatDate } from '@/app/(frontend)/_lib/formatters'
import type { PostCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

import styles from './posts.module.css'

/** Lazy boundary keeps OGL/three out of the non-Posts bundle. */
const useFlexCarousel = (): ComponentType<FlexCarouselProps> | null => {
  const [Component, setComponent] = useState<ComponentType<FlexCarouselProps> | null>(null)
  useEffect(() => {
    let cancelled = false
    import('@/components/ui/flex-carousel')
      .then((mod) => {
        if (cancelled) return
        setComponent(() => mod.default)
      })
      .catch(() => {
        // Keep the reserved viewport and first post link if loading fails.
      })
    return () => {
      cancelled = true
    }
  }, [])
  return Component
}

/** Neutral 1x1 transparent pixel data URL. Never borrows demo images. */
const NEUTRAL_RASTER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

type PostsCarouselProps = {
  docs: PostCardView[]
  locale: LocaleCode
  cursorPopupItem?: string | null
}

/** Keep the loaded engine behind a stable component boundary. */
function CarouselMount({
  Component,
  ...props
}: FlexCarouselProps & {
  Component: ComponentType<FlexCarouselProps>
}) {
  return <Component {...props} />
}

export function PostsCarousel({ docs, locale, cursorPopupItem }: PostsCarouselProps) {
  // Deduplicate by id, preserve order. Duplicate image URLs for different IDs
  // remain separate items.
  const ordered = useMemo(() => {
    const seen = new Set<number>()
    const result: PostCardView[] = []
    for (const doc of docs) {
      if (seen.has(doc.id)) continue
      seen.add(doc.id)
      result.push(doc)
    }
    return result
  }, [docs])

  const items = useMemo<FlexCarouselItem[]>(
    () =>
      ordered.map((post) => ({
        src: post.image?.url || NEUTRAL_RASTER,
        alt: post.image?.alt || post.title,
        title: post.title,
        subtitle: formatDate(post.publishedAt, locale) ?? undefined,
      })),
    [ordered, locale],
  )

  const FlexCarousel = useFlexCarousel()

  if (ordered.length === 0) return null

  const renderCaption = (item: FlexCarouselItem, index: number) => {
    const post = ordered[index]
    return (
      <>
        <span className={styles.title}>{item.title || item.alt}</span>
        {item.subtitle || post?.href ? (
          <span className={styles.metadata}>
            {item.subtitle ? (
              <time className={styles.date} dateTime={post?.publishedAt ?? undefined}>
                {item.subtitle}
              </time>
            ) : null}
            {post?.href ? (
              <Link
                href={post.href}
                transitionTypes={['nav-forward']}
                className={styles.openPostLink}
                data-cursor-popup={cursorPopupItem || 'open post'}
                aria-label={`Open post: ${post.title}`}
              >
                Open post
              </Link>
            ) : null}
          </span>
        ) : null}
      </>
    )
  }

  return (
    <div className={styles.viewport} data-cursor-popup={cursorPopupItem || 'view details'}>
      {FlexCarousel ? (
        <CarouselMount
          Component={FlexCarousel}
          items={items}
          captureWheel={false}
          className={styles.carousel}
          renderCaption={renderCaption}
        />
      ) : (
        <>
          <div className={styles.loading} role="status">
            Loading…
          </div>
          <div className={styles.fallbackCaption}>{renderCaption(items[0], 0)}</div>
        </>
      )}
    </div>
  )
}
