import { ViewTransition } from 'react'

import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'
import type { MediaView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type DetailHeroProps = {
  slug: string
  id: number
  title: string
  excerpt: string | null
  image: MediaView | null
  publishedAt: string | null
  author: { name: string } | null
  readingTime: number | null
  tags: { name: string }[]
  priority?: boolean
}

/**
 * Detail hero - the image + title section that lives above the rich content.
 *
 * Layout adapts to the image's natural ratio:
 *  - Landscape (ratio > 1): full-width image with the title overlaid as a
 *    gradient at the bottom (Shadwell-style).
 *  - Portrait / square (ratio <= 1): side-by-side grid with the image on the
 *    left and the title in its own reading column on the right.
 *
 * View Transitions:
 *  - The image is the shared element - it carries the same `card-image-${slug}`
 *    name on both the feed card and this hero so the morph stays smooth.
 *    We apply the same aspect class on both sides so the start/end frames
 *    match. slug is globally unique across all feed types so there are no
 *    collisions when multiple feed sections render on the same page.
 *  - The title uses a separate `detail-title-${id}` boundary with a fade-in
 *    so it appears cleanly after the image morph completes (and never gets
 *    scaled/rastered along with the image).
 */
export function DetailHero({
  slug,
  id,
  title,
  excerpt,
  image,
  publishedAt,
  author,
  readingTime,
  tags,
  priority = true,
}: DetailHeroProps) {
  const { variant, aspectClass } = getImageAspect(image)

  // slug is globally unique; falls back to id for draft/unpublished items.
  const imageVtName = slug ? `card-image-${slug}` : `card-image-${id}`

  const metaItems = (
    <>
      {author && <span>By {author.name}</span>}
      {publishedAt && <span aria-hidden>·</span>}
      {publishedAt && <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>}
      {readingTime !== null && <span aria-hidden>·</span>}
      {readingTime !== null && <span>{readingTime} min read</span>}
      {tags.length > 0 && <span aria-hidden>·</span>}
      {tags.length > 0 && <span>{tags.map((t) => t.name).join(', ')}</span>}
    </>
  )

  // No image - fall back to a split layout with a gradient placeholder so the
  // title still has somewhere to live.
  if (!image) {
    return (
      <section className="grid grid-cols-1 items-start gap-6 px-6 py-8 md:grid-cols-[auto_1fr] md:gap-12">
        <div className={cn('w-full bg-linear-to-b from-zinc-900 to-zinc-950', aspectClass)} />
        <ViewTransition name={`detail-title-${id}`} enter="fade-in" default="none">
          <div className="py-4">
            <h1 className="text-foreground mb-4 text-3xl leading-tight font-bold sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {excerpt && <p className="text-foreground/70 mb-6 max-w-xl text-lg">{excerpt}</p>}
            <div className="text-foreground/60 flex flex-wrap items-center gap-3 text-sm">
              {metaItems}
            </div>
          </div>
        </ViewTransition>
      </section>
    )
  }

  if (variant === 'overlay') {
    return (
      <section className="relative w-full bg-zinc-950">
        <ViewTransition name={imageVtName} share="morph">
          <div className={cn('relative w-full overflow-hidden', aspectClass)}>
            <CmsImage
              media={image}
              fill
              sizes="100vw"
              priority={priority}
              className="h-full w-full"
              imgClassName="object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8 md:p-12">
              <ViewTransition name={`detail-title-${id}`} enter="fade-in" default="none">
                <div className="text-foreground max-w-3xl">
                  <h1 className="mb-4 text-3xl leading-tight font-bold sm:text-5xl md:text-6xl">
                    {title}
                  </h1>
                  <div className="text-foreground/80 flex flex-wrap items-center gap-3 text-sm">
                    {metaItems}
                  </div>
                </div>
              </ViewTransition>
            </div>
          </div>
        </ViewTransition>
      </section>
    )
  }

  // Portrait / square - side-by-side.
  return (
    <section className="grid grid-cols-1 items-start gap-6 px-6 py-8 md:grid-cols-[auto_1fr] md:gap-12">
      <ViewTransition name={imageVtName} share="morph">
        <div
          className={cn(
            'relative w-full overflow-hidden bg-zinc-950 md:max-h-[80dvh] md:w-auto md:max-w-[55vw]',
            aspectClass,
          )}
        >
          <CmsImage
            media={image}
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            priority={priority}
            className="h-full w-full"
            imgClassName="object-cover"
          />
        </div>
      </ViewTransition>
      <ViewTransition name={`detail-title-${id}`} enter="fade-in" default="none">
        <div className="py-4">
          <h1 className="text-foreground mb-4 text-3xl leading-tight font-bold sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {excerpt && <p className="text-foreground/70 mb-6 max-w-xl text-lg">{excerpt}</p>}
          <div className="text-foreground/60 flex flex-wrap items-center gap-3 text-sm">
            {metaItems}
          </div>
        </div>
      </ViewTransition>
    </section>
  )
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
