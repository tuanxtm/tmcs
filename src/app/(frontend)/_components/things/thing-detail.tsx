'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { useLenis } from 'lenis/react'
import { motion, useReducedMotion } from 'motion/react'
import { IconArrowRight, IconX } from '@tabler/icons-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { cn } from '@/lib/utils'
import { ThingImageViewer } from './thing-image-viewer'
import styles from './thing-detail.module.css'

const COPY = {
  en: {
    close: 'Close',
    closeCursor: 'CLOSE',
    description: 'Product description',
  },
  vi: {
    close: 'Đóng',
    closeCursor: 'ĐÓNG',
    description: 'Mô tả sản phẩm',
  },
} as const

// Framed detail sheet with equal image and content halves.
export function ThingDetail({
  open,
  onOpenChangeAction,
  locale,
  thing,
  returnFocus,
}: {
  open: boolean
  onOpenChangeAction: (open: boolean) => void
  locale: LocaleCode
  thing: ThingCardView
  returnFocus?: RefObject<HTMLButtonElement | null>
}) {
  const copy = COPY[locale]
  const image = thing.primaryImage
  const lenis = useLenis()
  const reducedMotion = useReducedMotion()
  // Track whether we've paused Lenis so we only resume on the open->closed
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

  const frameMotion = reducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.36, delay: 0.06, ease: [0.22, 1, 0.36, 1] as const },
      }
  const textMotion = reducedMotion
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.36, delay: 0.12, ease: [0.22, 1, 0.36, 1] as const },
      }

  return (
    <Drawer swipeDirection="down" open={open} onOpenChange={onOpenChangeAction}>
      <DrawerContent finalFocus={returnFocus} className={cn(styles.popup)}>
        {!thing.description ? (
          <DrawerDescription className="sr-only">{copy.description}</DrawerDescription>
        ) : null}

        <motion.div {...frameMotion} className={styles.frame} data-thing-detail-frame="">
          <ThingImageViewer
            key={`${thing.id}:${image?.id ?? 'none'}:${image?.url ?? 'none'}`}
            image={image}
            primaryUrl={thing.primaryUrl}
            name={thing.name}
            locale={locale}
            active={open}
          >
            <DrawerClose
              className={styles.control}
              aria-label={copy.close}
              data-cursor-popup={copy.closeCursor}
            >
              <IconX aria-hidden="true" />
            </DrawerClose>
          </ThingImageViewer>

          <div className={styles.content} data-thing-detail-content="">
            <motion.div {...textMotion} className={styles.scroller} data-lenis-prevent>
              <div className={styles.copy}>
                <DrawerTitle className={styles.title}>{thing.name}</DrawerTitle>
                {thing.description ? (
                  <DrawerDescription className={styles.description}>
                    {thing.description}
                  </DrawerDescription>
                ) : null}
              </div>
            </motion.div>
            {thing.links.length > 0 ? (
              <ul className={styles.links} data-thing-detail-links="">
                {thing.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className={cn(styles.link, 'site-cell-hover')}
                    >
                      {link.label}
                      <IconArrowRight className={styles.arrow} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </motion.div>
      </DrawerContent>
    </Drawer>
  )
}
