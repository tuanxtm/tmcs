'use client'
import Link from 'next/link'
import { useReducedMotion } from 'motion/react'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'
import type { PostCardView, ProjectCardView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'
import { formatDate } from '@/app/(frontend)/_lib/formatters'
import styles from './feed-card.module.css'
type FeedCardProps = {
  doc: PostCardView | ProjectCardView
  locale: LocaleCode
  className?: string
  cursorPopup?: string | null
}
export function FeedCard({ doc, locale, className, cursorPopup = 'view details' }: FeedCardProps) {
  const reduceMotion = useReducedMotion()
  const dateLabel = formatDate(doc.publishedAt, locale)
  // Same aspect class on the feed card image and the detail hero image so the
  // detail page can mount the hero at the same dimensions.
  const { aspectClass } = getImageAspect(doc.image)
  const imageContent = (
    <div className={cn(styles.media, aspectClass)}>
      {doc.image ? (
        <CmsImage
          media={doc.image}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={styles.imageFrame}
          imgClassName={cn(styles.image, !reduceMotion && styles.imageInteractive)}
        />
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}
    </div>
  )
  const imageWrapper = imageContent
  const body = (
    <div className={styles.body}>
      <div className={styles.content}>
        <div className={styles.imageContainer}>{imageWrapper}</div>
        <h3 className={styles.heading}>{doc.title}</h3>
      </div>
    </div>
  )
  const shellClass = cn(styles.card, 'group', className)
  if (doc.href) {
    return (
      <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
        <Link href={doc.href} transitionTypes={['nav-forward']} className={styles.link}>
          {body}
        </Link>
      </article>
    )
  }
  return (
    <article className={shellClass} data-cursor-popup={cursorPopup || undefined}>
      {body}
    </article>
  )
}
