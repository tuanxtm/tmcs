'use client'

import { useRef, useState } from 'react'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { CanvasHandle, CanvasImage, canvasItemStyle, canvasNumber } from '../canvas/canvas-item'
import type { CanvasItemProps } from '../canvas/draggable-canvas'
import styles from '../canvas/canvas.module.css'
import { ThingDetail } from './thing-detail'

export function ThingCanvasItem(
  props: CanvasItemProps<ThingCardView> & {
    locale: LocaleCode
    onDetailOpenChange?: (open: boolean) => void
  },
) {
  const {
    item: thing,
    index,
    locale,
    manual,
    zIndex,
    onDetailOpenChange,
    registerItemRef,
    registerHandleRef,
    onItemFocusCapture,
    cursorPopup,
    onImagePointerDown,
    interactive,
    movementOpen,
    onHandlePointerDown,
    onHandleKeyDown,
    onHandleClick,
  } = props
  const [open, setOpen] = useState(false)
  const detailRef = useRef<HTMLButtonElement | null>(null)
  const buy = locale === 'vi' ? 'Mua ngay' : 'Buy now'
  const detail = locale === 'vi' ? 'Xem thêm' : 'Detail'

  function changeOpen(next: boolean) {
    onDetailOpenChange?.(next)
    setOpen(next)
  }

  const image = <CanvasImage kind="thing" image={thing.primaryImage} />
  return (
    <article
      ref={registerItemRef}
      style={canvasItemStyle(index, manual, zIndex, thing.primaryImage)}
      className={`${styles.item} ${styles.thingItem}`}
      data-thing-item={thing.id}
      data-cursor-popup={cursorPopup || undefined}
      onFocusCapture={onItemFocusCapture}
    >
      {thing.primaryUrl ? (
        <a
          href={thing.primaryUrl}
          aria-label={thing.name}
          draggable={false}
          className={styles.thingPrimaryLink}
          data-thing-drag-surface=""
          onPointerDown={onImagePointerDown}
        />
      ) : null}
      <div className={styles.thingLabel} data-thing-label="">
        <CanvasHandle
          item={thing}
          kind="thing"
          name={thing.name}
          interactive={interactive}
          movementOpen={movementOpen}
          registerHandleRef={registerHandleRef}
          onHandlePointerDown={onHandlePointerDown}
          onHandleKeyDown={onHandleKeyDown}
          onHandleClick={onHandleClick}
        />
        <span className={styles.number}>{canvasNumber(index)}</span>
        <span data-thing-title="" className={`${styles.title} ${styles.thingTitle}`}>
          {thing.name}
        </span>
        <div className={styles.thingActions}>
          {thing.primaryUrl ? (
            <a
              href={thing.primaryUrl}
              className={styles.thingAction}
              aria-label={`${buy}: ${thing.name}`}
              data-cursor-popup=""
            >
              {buy}
            </a>
          ) : null}
          <button
            ref={detailRef}
            type="button"
            className={styles.thingAction}
            aria-label={`${detail}: ${thing.name}`}
            data-cursor-popup=""
            onClick={() => changeOpen(true)}
          >
            {detail}
          </button>
        </div>
      </div>
      <span
        className={styles.imageArea}
        data-thing-drag-surface={thing.primaryUrl ? undefined : ''}
        onPointerDown={thing.primaryUrl ? undefined : onImagePointerDown}
      >
        {image}
      </span>
      <ThingDetail
        open={open}
        onOpenChangeAction={changeOpen}
        locale={locale}
        thing={thing}
        returnFocus={detailRef}
      />
    </article>
  )
}
