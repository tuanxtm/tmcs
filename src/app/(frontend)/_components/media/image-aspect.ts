import type { MediaView } from '@/app/(frontend)/_lib/types'

/**
 * Hero layout variant, derived from the image's natural aspect ratio.
 *
 * - `overlay`: landscape / square (ratio > 1). Image takes the full row width
 *   and the title sits inside the image as a gradient overlay at the bottom.
 * - `split`:   portrait (ratio <= 1). Image stays on the left of a two-column
 *   grid so the title has a comfortable reading column on the right.
 */
export type HeroVariant = 'overlay' | 'split'

export type ImageAspect = {
  ratio: number
  variant: HeroVariant
  aspectClass: string
}

/**
 * Pick the hero variant and aspect class for a single image.
 *
 * The aspect class is applied to the image container on both the feed card and
 * the detail hero so the `<ViewTransition>` morph between them has matching
 * start/end frames.
 *
 * Falls back to a 16:9 landscape when the image has no recorded dimensions so
 * the layout never collapses to a zero-height box.
 */
export function getImageAspect(image: MediaView | null | undefined): ImageAspect {
  if (!image?.width || !image.height) {
    return { ratio: 1 / 1, variant: 'overlay', aspectClass: 'aspect-square' }
  }

  const ratio = image.width / image.height
  const variant: HeroVariant = ratio > 1 ? 'overlay' : 'split'

  const aspectClass =
    ratio > 1.78
      ? 'aspect-video' // 16:9 wide landscape
      : ratio > 1.45
        ? 'aspect-[4/3]' // 4:3 landscape
        : ratio > 1.2
          ? 'aspect-[5/4]' // 5:4 mild landscape
          : ratio > 0.95
            ? 'aspect-square' // 1:1
            : ratio > 0.7
              ? 'aspect-[4/5]' // 4:5 portrait
              : ratio > 0.55
                ? 'aspect-[3/4]' // 3:4 portrait
                : 'aspect-[9/16]' // 9:16 tall portrait

  return { ratio, variant, aspectClass }
}
