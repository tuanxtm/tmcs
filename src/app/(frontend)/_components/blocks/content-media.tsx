import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { ContentMediaBlockView } from '@/app/(frontend)/_lib/types'

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
    <figure className="not-prose w-screen relative left-1/2 right-1/2 -mx-[50vw] my-12">
      <CmsImage
        media={block.media}
        sizes="100vw"
        className="w-full"
        imgClassName="h-auto w-full"
        priority
      />
      {block.caption ? (
        <figcaption className="mx-auto mt-3 max-w-3xl px-4 text-xs text-muted-foreground">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}