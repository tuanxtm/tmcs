import { ViewTransition } from 'react'

import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'
import type { MediaView } from '@/app/(frontend)/_lib/types'
import { cn } from '@/lib/utils'

type DetailHeroProps = {
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
 *  - The image is the shared element - it carries the same `card-image-${id}`
 *    name on both the feed card and this hero so the morph stays smooth.
 *    We apply the same aspect class on both sides so the start/end frames
 *    match.
 *  - The title uses a separate `detail-title-${id}` boundary with a fade-in
 *    so it appears cleanly after the image morph completes (and never gets
 *    scaled/rastered along with the image).
 */
export function DetailHero({
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
      <section className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-12 px-6 py-8 items-start">
        <div className={cn('w-full bg-gradient-to-b from-zinc-900 to-zinc-950', aspectClass)} />
        <ViewTransition name={`detail-title-${id}`} enter="fade-in" default="none">
          <div className="py-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              {title}
            </h1>
            {excerpt && <p className="text-lg text-foreground/70 mb-6 max-w-xl">{excerpt}</p>}
            <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
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
        <ViewTransition name={`card-image-${id}`} share="morph">
          <div className={cn('relative w-full overflow-hidden', aspectClass)}>
            <CmsImage
              media={image}
              fill
              sizes="100vw"
              priority={priority}
              className="w-full h-full"
              imgClassName="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8 md:p-12">
              <ViewTransition name={`detail-title-${id}`} enter="fade-in" default="none">
                <div className="max-w-3xl text-foreground">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/80">
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
    <section className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-12 px-6 py-8 items-start">
      <ViewTransition name={`card-image-${id}`} share="morph">
        <div
          className={cn(
            'relative w-full md:w-auto md:max-h-[80dvh] md:max-w-[55vw] overflow-hidden bg-zinc-950',
            aspectClass,
          )}
        >
          <CmsImage
            media={image}
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            priority={priority}
            className="w-full h-full"
            imgClassName="object-cover"
          />
        </div>
      </ViewTransition>
      <ViewTransition name={`detail-title-${id}`} enter="fade-in" default="none">
        <div className="py-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            {title}
          </h1>
          {excerpt && <p className="text-lg text-foreground/70 mb-6 max-w-xl">{excerpt}</p>}
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
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
