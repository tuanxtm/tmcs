'use client'

import { useState, type MouseEvent } from 'react'
import Link from 'next/link'
import { useReducedMotion } from 'motion/react'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { ThingDetail } from '@/app/(frontend)/_components/things/thing-detail'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

const BUY_LABEL: Record<LocaleCode, string> = { en: 'Buy', vi: 'Mua' }
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
  // to primaryUrl.
  const openDialog = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setOpen(true)
  }

  return (
    <article
      className={cn('group relative flex min-w-0 flex-col', className)}
      data-cursor-popup={cursorPopup || undefined}
    >
      {/* Image — primaryUrl link wraps it on all breakpoints */}
      <div className="relative aspect-square min-w-0 overflow-hidden">
        {image?.url && (
          <Link
            href={thing.primaryUrl ?? '#'}
            aria-label={thing.name}
            className={cn(
              'focus-visible:outline-ring absolute inset-0 z-10 block',
              'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
            )}
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
      </div>

      <div
        className="grid shrink-0 grid-cols-2 gap-y-1 py-2 md:gap-y-1.5 md:py-3"
        data-cursor-popup={undefined}
      >
        {/* Top-left: THING + #ID */}
        <p className={cn(
                'text-primary/80 self-start font-mono leading-none tracking-tight uppercase',
                'text-xs md:text-sm',
              )}>
          ID #{thing.id}
        </p>

        {/* Bottom-left: thing name */}
        <h4 className={cn(
                'text-foreground col-start-1 row-start-2 inline-flex items-baseline self-end leading-none font-medium tracking-tight lowercase',
                'text-sm md:text-base',
              )}>
          {thing.name}
        </h4>

        {/* Top-right: DETAIL */}
        <button
          type="button"
          onClick={openDialog}
          aria-label={DETAIL_LABEL[locale]}
          className={cn(
            'text-primary/80 col-start-2 row-start-1 inline-flex cursor-pointer items-baseline self-end justify-self-end',
            'rounded-none border-0 bg-transparent p-0 text-right',
            'font-mono leading-none tracking-tight uppercase underline-offset-4',
            'hover:underline',
            'text-xs md:text-sm',
          )}
        >
          {DETAIL_LABEL[locale]}
        </button>

        {/* Bottom-right: BUY */}
        <Link
          href={thing.primaryUrl ?? '#'}
          aria-label={BUY_LABEL[locale]}
          className={cn(
            'text-primary/80 col-start-2 row-start-2 inline-flex cursor-pointer items-baseline self-end justify-self-end',
            'rounded-none border-0 bg-transparent p-0 text-right',
            'font-mono leading-none tracking-tight uppercase underline-offset-4',
            'hover:underline',
            'text-xs md:text-sm',
          )}
        >
          {BUY_LABEL[locale]}
        </Link>
      </div>

      <ThingDetail open={open} onOpenChangeAction={setOpen} locale={locale} thing={thing} />
    </article>
  )
}
