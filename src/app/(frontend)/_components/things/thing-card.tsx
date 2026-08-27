'use client'

import { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { useReducedMotion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { BuyNowDialog } from '@/app/(frontend)/_components/things/buy-now-dialog'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

const BUY_LABEL: Record<LocaleCode, string> = { en: 'Buy now', vi: 'Mua ngay' }
const DETAIL_LABEL: Record<LocaleCode, string> = { en: 'Detail', vi: 'Xem thêm' }

type ThingCardProps = {
  thing: ThingCardView
  locale: LocaleCode
  /** Position in the surrounding grid. The first card may opt into priority to
   *  serve as the section's LCP candidate; all others stay lazy. */
  index?: number
  cursorPopup?: string | null
  className?: string
}

export function ThingCard({
  thing,
  locale,
  index,
  cursorPopup = 'buy now',
  className,
}: ThingCardProps) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  // Only the first card preloads - everything else stays lazy to keep the
  // initial HTML payload and <link rel="preload"> count bounded on the
  // home page and `/things`, where up to 48 cards render at once.
  const priority = index === 0

  const image = thing.primaryImage || thing.detailImage

  // Open the dialog without letting the click bubble to the wrapping image
  // <Link>. Without this, clicking Detail over the image would also navigate
  // to primaryUrl, and clicking the buy <Button asChild> link would otherwise
  // be fine but we stop propagation defensively to keep the parent link from
  // running alongside.
  const openDialog = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(true)
  }

  // Same rationale for the mobile Buy <Button asChild><Link/></Button>: stop
  // propagation so the surrounding Link or row doesn't react to the click.
  const handleBuyClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <article
      className={cn('group relative flex min-w-0 flex-col', className)}
      data-cursor-popup={cursorPopup || undefined}
    >
      {/* Image — primaryUrl link wraps it on all breakpoints */}
      <div className="relative aspect-square min-w-0 flex-1 overflow-hidden">
        {image?.url && (
          <Link
            href={thing.primaryUrl ?? '#'}
            aria-label={thing.name}
            className="focus-visible:outline-ring absolute inset-0 z-10 block focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <CmsImage
              media={image}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
              className="object-cover"
              imgClassName={cn(
                'transition-transform duration-500',
                !reduceMotion && 'group-hover:scale-[1.02]',
              )}
            />
            {thing.detailImage && thing.detailImage !== image && (
              <CmsImage
                media={thing.detailImage}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                imgClassName="transition-transform duration-500"
              />
            )}
          </Link>
        )}

        {/* Desktop overlay: name + buy button over the image */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-50 hidden items-center justify-between md:flex lg:flex"
          data-cursor-popup={''}
        >
          <h4
            className={cn(
              'relative inline-flex h-7 items-center self-end rounded-none leading-none font-medium tracking-tight mix-blend-difference',
              'text-background w-full truncate text-xs sm:text-sm lg:text-base',
            )}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-transparent mix-blend-multiply"
            />
            <span className="relative truncate px-2">{thing.name}</span>
          </h4>

          <div className="flex items-center">
            <Button
              variant={'ghost'}
              className={cn(
                'text-primary pointer-events-auto justify-center rounded-none border-0 font-medium mix-blend-difference',
                'underline-offset-4 hover:underline',
                'font-mono leading-none tracking-tight uppercase',
                'text-[0.625rem] sm:text-[0.625rem] lg:text-xs',
                'bg-background cursor-pointer',
              )}
              aria-label={DETAIL_LABEL[locale]}
              onClick={openDialog}
            >
              {DETAIL_LABEL[locale]}
            </Button>
            <Button
              variant={'ghost'}
              className={cn(
                'text-primary w-auto rounded-none border-0 p-0 font-medium',
                'font-mono leading-none tracking-tight uppercase',
                'h-auto text-[0.625rem]',
                'bg-background pointer-events-none h-7',
              )}
            >
              |
            </Button>
            <Button
              asChild
              variant={'ghost'}
              className={cn(
                'text-primary pointer-events-auto justify-center rounded-none border-0 font-medium mix-blend-difference',
                'underline-offset-4 hover:underline',
                'font-mono leading-none tracking-tight uppercase',
                'text-[0.625rem] sm:text-[0.625rem] lg:text-xs',
                'bg-background',
              )}
              aria-label={BUY_LABEL[locale]}
              onClick={handleBuyClick}
            >
              <Link href={thing.primaryUrl ?? '#'}>{BUY_LABEL[locale]}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile info row: name above, buy button below */}
      <div className="flex flex-col gap-2 py-2 md:hidden" data-cursor-popup={undefined}>
        <h4 className="min-w-0 text-xs leading-none font-medium tracking-tight">{thing.name}</h4>
        <div className="flex items-center gap-2">
          <Button
            variant={'ghost'}
            className={cn(
              'text-primary self-start rounded-none border-0 p-0 font-medium',
              'underline-offset-4 hover:underline',
              'font-mono leading-none tracking-tight uppercase',
              'h-auto cursor-pointer text-[0.625rem]',
            )}
            aria-label={DETAIL_LABEL[locale]}
            onClick={() => setOpen(true)}
          >
            {DETAIL_LABEL[locale]}
          </Button>
          <Button
            variant={'ghost'}
            className={cn(
              'text-primary w-auto rounded-none border-0 p-0 font-medium',
              'font-mono leading-none tracking-tight uppercase',
              'h-auto text-[0.625rem]',
            )}
          >
            |
          </Button>
          <Button
            asChild
            variant={'ghost'}
            className={cn(
              'text-primary self-start rounded-none border-0 p-0 font-medium',
              'font-mono leading-none tracking-tight uppercase',
              'underline-offset-4 hover:underline',
              'h-auto text-[0.625rem]',
            )}
            onClick={handleBuyClick}
          >
            <Link href={thing.primaryUrl ?? '#'}>{BUY_LABEL[locale]}</Link>
          </Button>
        </div>
      </div>

      <BuyNowDialog open={open} onOpenChangeAction={setOpen} locale={locale} thing={thing} />
    </article>
  )
}
