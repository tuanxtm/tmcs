'use client'

import { useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { IconShoppingBagDiscount, IconShoppingBag } from '@tabler/icons-react'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import {
  MissingLinkDialog,
  type ContactLinks,
} from '@/app/(frontend)/_components/things/missing-link-dialog'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'

type ThingShowcaseTileProps = {
  thing: ThingCardView
  locale: LocaleCode
  contact: ContactLinks
  cursorPopup?: string | null
  className?: string
}

const SHOP_LABEL: Record<LocaleCode, string> = {
  en: 'Shop',
  vi: 'Mua',
}

export function ThingShowcaseTile({
  thing,
  locale,
  contact,
  cursorPopup = 'shop this',
  className,
}: ThingShowcaseTileProps) {
  const reduceMotion = useReducedMotion()
  const [dialogOpen, setDialogOpen] = useState(false)
  const hasLink = Boolean(thing.affiliateUrl)
  const label = thing.linkLabel || SHOP_LABEL[locale]
  const detailImage = thing.detailImage || thing.primaryImage

  const cartClass = cn(
    'inline-flex size-4 shrink-0 items-center justify-center text-foreground transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  )

  return (
    <article
      className={cn('thing-tile group relative flex h-full min-w-0 flex-col p-2', className)}
      data-cursor-popup={cursorPopup || undefined}
    >
      <div className="thing-tile-split flex min-h-0 flex-1 flex-col gap-2 md:flex-row">
        <div className="thing-tile-hero min-w-0 flex-1 overflow-hidden">
          {thing.primaryImage ? (
            <CmsImage
              media={thing.primaryImage}
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 35vw, 100vw"
              className="h-full w-full"
              imgClassName={cn(
                'h-full w-full object-cover transition-transform duration-500',
                !reduceMotion && 'group-hover:scale-[1.01]',
              )}
            />
          ) : (
            <div className="aspect-[4/5] w-full md:h-full md:aspect-auto" aria-hidden="true" />
          )}
        </div>

        <div className="thing-tile-panel flex w-full flex-col gap-2 md:w-1/3 md:shrink-0">
          {detailImage ? (
            <div className="hidden aspect-square w-full overflow-hidden md:block">
              <CmsImage
                media={detailImage}
                sizes="(min-width: 1024px) 12vw, 160px"
                className="h-full w-full"
                imgClassName="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-1">
            <h3 className="min-w-0 flex-1 text-sm font-medium leading-none tracking-tight text-foreground md:text-base">
              {thing.name}
            </h3>
            {hasLink ? (
              <a
                href={thing.affiliateUrl!}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className={cartClass}
                aria-label={label}
              >
                <IconShoppingBagDiscount className="size-4" aria-hidden="true" />
              </a>
            ) : (
              <button
                type="button"
                className={cartClass}
                onClick={() => setDialogOpen(true)}
                aria-label={label}
              >
                <IconShoppingBag className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      <MissingLinkDialog
        open={dialogOpen}
        onOpenChangeAction={setDialogOpen}
        locale={locale}
        thingName={thing.name}
        contact={contact}
      />
    </article>
  )
}
