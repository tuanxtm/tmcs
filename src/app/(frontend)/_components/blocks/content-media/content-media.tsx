import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { ContentMediaBlockView } from '@/app/(frontend)/_lib/types'
import styles from './content-media.module.css'
import { cn } from '@/lib/utils'
type ContentMediaBlockProps = {
  block: ContentMediaBlockView
}
/**
 * Edge-to-edge full-width media block.
 *
 * Breaks out of any parent `max-w-*` container using
 * `w-screen + left-1/2 + right-1/2 + -mx-[50vw]` so the image is flush
 * to the viewport edges. Caption sits centered below, constrained to
 * `max-w-3xl` for legibility.
 */
export function ContentMediaBlock({ block }: ContentMediaBlockProps) {
  return (
    <figure className={cn(styles.figure, 'not-prose')}>
      <CmsImage
        media={block.media}
        sizes="100vw"
        className={styles.imageFrame}
        imgClassName={styles.image}
        priority
      />
      {block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}
    </figure>
  )
}
