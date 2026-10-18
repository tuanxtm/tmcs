import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'
import { FieldRow } from '@/app/(frontend)/_components/layout/field-row'
import type { MediaView } from '@/app/(frontend)/_lib/types'
import { Scales } from '@/components/ui/scales'
import { cn } from '@/lib/utils'
import styles from './detail-hero.module.css'
type DetailHeroProps = {
  title: string
  image: MediaView | null
  priority?: boolean
}
/**
 * Detail hero - mirrors the home `Hero` block token-for-token.
 *
 * Outer chrome, padding, gaps, and image-cell dimensions are identical to
 * `src/app/(frontend)/_components/blocks/hero.tsx` so the section above the
 * fold reads as a continuation of the home page:
 *  - `min-h-auto md:h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]`
 *  - `pt-2 md:pt-1 md:pb-1.5`
 *
 * Layout:
 *  - Left column wraps the title in the same `FieldRow` chrome (label +
 *    lowercase value, uppercase mono label) so the typographic rhythm matches
 *    the home hero.
 *  - Right column sits behind a `<Scales />` pattern. The image renders in the
 *    same aspect-class box as the feed card (`getImageAspect`, `object-cover`).
 *    The box is height-bound (`h-full w-auto max-w-full`) and centered, so the
 *    image scales to fit inside the cell instead of overflowing or letterboxing.
 */
export function DetailHero({ title, image, priority = true }: DetailHeroProps) {
  // Same aspect class as the feed card (see getImageAspect) so the detail
  // page can mount the hero at the same dimensions as the originating card.
  // The box is height-bound and centered so the image always fits inside the cell.
  const { aspectClass } = getImageAspect(image)
  if (!image) {
    return (
      <section id="detail-hero" className={styles.root}>
        <div className={styles.layout}>
          <div className={styles.textFrame}>
            <div className={styles.scroller}>
              <div className={styles.textGrid}>
                <FieldRow label="title">
                  <h1 className={styles.heading}>{title}</h1>
                </FieldRow>
                <div aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className={styles.splitImageColumn} aria-hidden="true" />
        </div>
      </section>
    )
  }
  return (
    <section id="detail-hero" className={styles.root}>
      <div className={styles.layout}>
        <div className={styles.textFrame}>
          <div className={styles.scroller}>
            <div className={styles.overlayImage}>
              <FieldRow label={'PROJECT'} className={styles.overlayCaption}>
                <h1 className={styles.overlayHeading}>{title}</h1>
              </FieldRow>
            </div>
          </div>
        </div>
        <div className={styles.overlayImageColumn}>
          <Scales className={styles.scales} />
          <div className={styles.imageFrame}>
            <div className={cn(styles.imageContainer, aspectClass)}>
              <CmsImage
                media={image}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                priority={priority}
                fill
                imgClassName={styles.image}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
