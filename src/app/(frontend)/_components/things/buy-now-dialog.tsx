'use client'

import { useEffect, useRef, type ComponentType } from 'react'
import { useLenis } from 'lenis/react'
import {
  IconBrandAmazon,
  IconBrandShopee,
  IconShoppingBag,
  IconShoppingBagCheck,
  IconX,
} from '@tabler/icons-react'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

const COPY = {
  en: { close: 'Close' },
  vi: { close: 'Đóng' },
} as const

type TablerIcon = ComponentType<{
  className?: string
  size?: string | number
  stroke?: string | number
}>

// Map a platform link URL to its marketplace icon. Hosts are matched
// case-insensitively; a missing/invalid URL falls back to the generic bag.
function getPlatformIcon(url: string): TablerIcon {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '')
    if (host.includes('amazon')) return IconBrandAmazon
    if (host.includes('shopee')) return IconBrandShopee
    if (host.includes('aliexpress')) return IconShoppingBagCheck
  } catch {
    // not a parseable absolute URL - fall through to default
  }
  return IconShoppingBag
}

export function BuyNowDialog({
  open,
  onOpenChangeAction,
  locale,
  thing,
}: {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  locale: LocaleCode
  thing: ThingCardView
}) {
  const copy = COPY[locale]
  const image = thing.primaryImage || thing.detailImage
  const lenis = useLenis()
  // Track whether we've paused Lenis so we only resume on the open→closed
  // transition, not on lenis-init or identity changes.
  const pausedRef = useRef(false)

  // Radix locks <body> scroll, but Lenis owns the wheel via its own RAF loop
  // and keeps scrolling the page underneath. Pause/resume Lenis with the
  // dialog so the home page can't scroll while the dialog is open.
  useEffect(() => {
    if (!lenis) return
    if (open && !pausedRef.current) {
      lenis.stop()
      pausedRef.current = true
    } else if (!open && pausedRef.current) {
      lenis.start()
      pausedRef.current = false
    }
  }, [lenis, open])

  // Safety net: if the dialog unmounts while open (route change, parent
  // teardown), make sure we don't leave Lenis in a stopped state.
  useEffect(() => {
    return () => {
      if (pausedRef.current) {
        lenis?.start()
        pausedRef.current = false
      }
    }
  }, [lenis])

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent
        showCloseButton={false}
        className="rounded-none sm:max-w-md flex flex-col bg-transparent border-none p-2 gap-2"
      >
        <div className="flex w-full justify-end">
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={copy.close}
              className="rounded-none border-none text-white/60 hover:bg-transparent hover:text-white/80"
            >
              <IconX aria-hidden="true" className="size-5" />
            </Button>
          </DialogClose>
        </div>

        <div className="flex flex-col gap-2 bg-background p-2">
          {image ? (
            <CmsImage
              media={image}
              sizes="(min-width: 640px) 360px, 80vw"
              className="aspect-square w-full"
              imgClassName="h-full w-full object-cover"
            />
          ) : null}

          <DialogTitle className="text-lg font-medium leading-none">{thing.name}</DialogTitle>

          {thing.description ? (
            <DialogDescription className="text-sm text-foreground/90">
              {thing.description}
            </DialogDescription>
          ) : null}

          {thing.links.length > 0 ? (
            <div className="flex flex-col gap-2">
              {thing.links.map((link, i) => {
                const PlatformIcon = getPlatformIcon(link.url)
                return (
                  <Button
                    key={i}
                    asChild
                    variant="outline"
                    className="w-full rounded-none justify-center"
                  >
                    <a href={link.url} target="_blank" rel="sponsored noopener noreferrer">
                      <PlatformIcon aria-hidden="true" className="size-4" />
                      {link.label}
                    </a>
                  </Button>
                )
              })}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
