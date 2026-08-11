'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useReducedMotion } from 'motion/react'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { MediaView } from '@/app/(frontend)/_lib/types'
import { BuyNowDialog } from '@/app/(frontend)/_components/things/buy-now-dialog'
import { Button } from '@/components/ui/button'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

const BUY_LABEL: Record<LocaleCode, string> = { en: 'Buy now', vi: 'Mua ngay' }

type ThingShowcaseTileProps = {
  thing: ThingCardView
  locale: LocaleCode
  cursorPopup?: string | null
  className?: string
}

export function ThingShowcaseTile({
  thing,
  locale,
  cursorPopup = 'buy now',
  className,
}: ThingShowcaseTileProps) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const detailImage = thing.detailImage || thing.primaryImage
  // Primary URL drives the image click target. When missing, the image stays
  // non-interactive - the Buy now button is still the way into the dialog.
  const primaryHref = thing.primaryUrl

  const renderImage = (media: MediaView, sizes: string, imgClassName: string) => (
    <CmsImage media={media} sizes={sizes} className="h-full w-full" imgClassName={imgClassName} />
  )

  const wrapInLink = (media: MediaView, sizes: string, imgClassName: string) =>
    primaryHref ? (
      <Link
        href={primaryHref}
        aria-label={thing.name}
        className="block h-full w-full focus:outline-none"
      >
        {renderImage(media, sizes, imgClassName)}
      </Link>
    ) : (
      renderImage(media, sizes, imgClassName)
    )

  const primaryImgClass = cn(
    'h-full w-full object-cover transition-transform duration-500',
    !reduceMotion && 'group-hover:scale-[1.01]',
  )

  return (
    <article
      className={cn('thing-tile group relative flex h-full min-w-0 flex-col p-2', className)}
      data-cursor-popup={cursorPopup || undefined}
    >
      <div className="thing-tile-split flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
        {/* Primary image - full width on mobile, left/top on larger screens */}
        <div className="thing-tile-hero aspect-square min-w-0 flex-1 overflow-hidden">
          {thing.primaryImage
            ? wrapInLink(
                thing.primaryImage,
                '(min-width: 1024px) 22vw, (min-width: 768px) 35vw, 100vw',
                primaryImgClass,
              )
            : null}
        </div>

        {/* Panel: detail image, name, and Buy now button */}
        <div className="thing-tile-panel flex w-full flex-col gap-2 md:w-1/3 md:shrink-0">
          {detailImage ? (
            <div className="hidden aspect-square w-full overflow-hidden md:block">
              {wrapInLink(
                detailImage,
                '(min-width: 1024px) 12vw, 160px',
                'h-full w-full object-cover',
              )}
            </div>
          ) : null}

          <h4 className="text-sm font-medium leading-none tracking-tight text-foreground md:text-sm">
            {thing.name}
          </h4>

          <Button
            type="button"
            variant="outline"
            className="mt-auto w-full rounded-none justify-center transition-colors duration-300 hover:bg-gradient-3/50 hover:border-gradient-3/50"
            onClick={() => setOpen(true)}
          >
            {BUY_LABEL[locale]}
          </Button>
        </div>
      </div>

      <BuyNowDialog open={open} onOpenChangeAction={setOpen} locale={locale} thing={thing} />
    </article>
  )
}
