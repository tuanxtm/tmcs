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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

const COPY = {
  en: { close: 'Close', thing: 'Thing detail' },
  vi: { close: 'Đóng', thing: 'Chi tiết' },
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

/**
 * Bottom-sheet detail view for a Thing card. Mirrors the navigation drawer's
 * chrome (rounded-none, full-width, centered) so both overlays feel like part
 * of the same surface. The sheet is 80dvh tall on mobile (sm and below) and
 * 60dvh on md+, leaving enough of the underlying page visible to stay
 * contextual.
 */
export function ThingDetail({
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
  const hasDetailImage = Boolean(
    thing.detailImage && (!image || thing.detailImage.id !== image.id),
  )
  const lenis = useLenis()
  // Track whether we've paused Lenis so we only resume on the open→closed
  // transition, not on lenis-init or identity changes.
  const pausedRef = useRef(false)

  // Drawer locks <body> scroll, but Lenis owns the wheel via its own RAF loop
  // and keeps scrolling the page underneath. Pause/resume Lenis with the
  // drawer so the home page can't scroll while the detail is open.
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

  // Safety net: if the drawer unmounts while open (route change, parent
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
    <Drawer swipeDirection="down" open={open} onOpenChange={onOpenChangeAction}>
      <DrawerContent
        className="bg-background text-foreground mx-auto flex w-full flex-col overflow-hidden rounded-none border-none p-0 [--drawer-height:80dvh] md:[--drawer-height:60dvh]"
      >
        <DrawerTitle className="sr-only">{copy.thing}</DrawerTitle>
        <DrawerDescription className="sr-only">
          {thing.name}
        </DrawerDescription>

        {/* Close: use render to produce a bare <button> — DrawerClose renders a
            button, so wrapping it in <Button> (which also renders a button) would
            create nested buttons. */}
        <DrawerClose
          render={(closeProps) => (
            <button
              {...closeProps}
              type="button"
              aria-label={copy.close}
              className="text-primary absolute top-3 right-3 z-10 cursor-pointer rounded-none border-0 bg-transparent p-0 hover:bg-transparent hover:text-primary/80"
            >
              <IconX aria-hidden="true" className="size-5" />
            </button>
          )}
        />

        <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] overflow-y-auto md:grid-rows-1 md:grid-cols-2">
          {/* Image cell: full width/height of its grid track. Hover swaps the
              primary image for the detail image. */}
          {image ? (
            <div className="group/image relative min-h-0 w-full overflow-hidden md:aspect-auto">
              <CmsImage
                media={image}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                imgClassName="h-full w-full transition-opacity duration-300 group-hover/image:opacity-0"
              />
              {hasDetailImage && thing.detailImage ? (
                <CmsImage
                  media={thing.detailImage}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="absolute inset-0 object-cover opacity-0 transition-opacity duration-300 group-hover/image:opacity-100"
                  imgClassName="h-full w-full"
                />
              ) : null}
            </div>
          ) : null}

          {/* Content cell: name, description, and platform links. */}
          <div className="flex flex-col gap-4 p-4 md:justify-center md:p-5">
            <h2 className="text-foreground text-lg leading-none font-medium tracking-tight lowercase">
              {thing.name}
            </h2>

            {thing.description ? (
              <p className="text-primary text-sm">{thing.description}</p>
            ) : null}

            {thing.links.length > 0 ? (
              <div className="flex flex-col gap-3">
                {thing.links.map((link, i) => {
                  const PlatformIcon = getPlatformIcon(link.url)
                  return (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium whitespace-nowrap transition-all outline-none select-none touch-manipulation focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 w-full justify-center rounded-none border-border bg-background text-foreground hover:bg-muted active:translate-y-px"
                    >
                      <PlatformIcon aria-hidden="true" className="size-4" />
                      {link.label}
                    </a>
                  )
                })}
              </div>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
