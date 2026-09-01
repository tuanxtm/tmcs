import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { getImageAspect } from '@/app/(frontend)/_components/media/image-aspect'
import { FieldRow } from '@/app/(frontend)/_components/layout/field-row'
import type { MediaView } from '@/app/(frontend)/_lib/types'
import { Scales } from '@/components/ui/scales'
import { cn } from '@/lib/utils'

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
 *  - `dash-line-b`, `border-l-primary border-l-3 md:border-l-4 lg:border-l-5`
 *  - `pt-2 md:pt-1 md:pb-1.5` vertical padding
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
      <section
        id="detail-hero"
        className={cn(
          'relative flex min-h-auto md:h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]',
          'bg-background dash-line-b',
          'pt-2 md:pt-1 md:pb-1.5',
          'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
        )}
      >
        <div className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row">
          <div className="relative isolate min-h-0 flex-1 overflow-hidden">
            <div className={cn('relative z-10 h-full overflow-y-auto', 'px-2 py-4 md:p-3 lg:p-4')}>
              <div className="grid grid-cols-2 gap-x-16 gap-y-4 md:gap-y-8 lg:gap-x-8 lg:gap-y-16">
                <FieldRow label="title">
                  <h1 className="text-foreground text-sm font-medium md:text-base lg:text-lg">
                    {title}
                  </h1>
                </FieldRow>
                <div aria-hidden="true" />
              </div>
            </div>
          </div>
          <div
            className={cn(
              'relative overflow-hidden md:h-full',
              'h-40 w-full md:w-[calc((100%-20px)/3)] lg:w-[calc((100%-40px)/4)]',
              'max-sm:pl-2',
            )}
            aria-hidden="true"
          />
        </div>
      </section>
    )
  }

  return (
    <section
      id="detail-hero"
      className={cn(
        'relative flex min-h-auto md:h-[calc(var(--hero-fold-height)*0.6)] lg:h-[calc(var(--hero-fold-height)*0.7)]',
        'bg-background dash-line-b',
        'pt-2 md:pt-1 md:pb-1.5',
        'border-l-primary border-l-3 md:border-l-4 lg:border-l-5',
      )}
    >
      <div className="flex h-full w-full flex-col-reverse items-stretch justify-between md:flex-row">
        <div className="relative isolate min-h-0 flex-1 overflow-hidden">
          <div className={cn('relative z-10 h-full overflow-y-auto', 'px-2 py-4 md:p-3 lg:p-4')}>
            <div className="relative h-full w-full">
              <FieldRow label={'PROJECT'} className="absolute bottom-0 left-0">
                <h1
                  className={cn('text-foreground text-sm font-medium md:text-base lg:text-3xl')}
                >
                  {title}
                </h1>
              </FieldRow>
            </div>
          </div>
        </div>
        <div
          className={cn(
            'relative overflow-hidden md:h-full',
            'h-40 w-full md:w-1/2',
            'max-sm:pl-2',
          )}
        >
          <Scales className="text-primary" />
          <div className="relative z-10 flex h-full w-full items-center justify-center p-2 md:p-3 lg:p-4">
            <div className={cn('relative h-full w-auto max-w-full overflow-hidden', aspectClass)}>
              <CmsImage
                media={image}
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                priority={priority}
                fill
                imgClassName="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
