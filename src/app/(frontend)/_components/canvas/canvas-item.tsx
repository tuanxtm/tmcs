import type { CSSProperties } from 'react'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { FeedDecorationView, MediaView } from '@/app/(frontend)/_lib/types'
import { IMAGE_SCALE, OFFSET_X, OFFSET_Y } from './canvas-layout'
import type { CanvasItemProps } from './draggable-canvas'
import styles from './canvas.module.css'

export function pickCanvasDecoration(decorations: FeedDecorationView[] | undefined, id: number) {
  return decorations?.length ? (decorations[Math.abs(id) % decorations.length] ?? null) : null
}

export function canvasNumber(index: number) {
  return `${String(index + 1).padStart(2, '0')}.`
}

export function canvasItemStyle(
  index: number,
  manual?: { x: number; y: number } | null,
  zIndex?: number | null,
): CSSProperties {
  return {
    '--column-mobile': index % 2,
    '--row-mobile': Math.floor(index / 2),
    '--column-tablet': index % 2,
    '--row-tablet': Math.floor(index / 2),
    '--column-desktop': index % 3,
    '--row-desktop': Math.floor(index / 3),
    '--offset-x': OFFSET_X[index % OFFSET_X.length],
    '--offset-y': OFFSET_Y[index % OFFSET_Y.length],
    '--image-scale': IMAGE_SCALE[index % IMAGE_SCALE.length],
    ...(manual ? { '--manual-x': `${manual.x}px`, '--manual-y': `${manual.y}px` } : {}),
    ...(zIndex != null ? { '--item-z': zIndex } : {}),
  } as CSSProperties
}

export function CanvasImage({
  image,
  decoration,
  kind,
}: {
  image: MediaView | null
  decoration: FeedDecorationView | null
  kind: 'project' | 'thing'
}) {
  return (
    <span
      className={styles.imageFit}
      {...{ [`data-${kind}-image`]: '' }}
      onDragStart={(e) => e.preventDefault()}
    >
      {image ? (
        <CmsImage
          media={image}
          fill
          sizes={
            kind === 'project'
              ? '(min-width: 1024px) 240px, (min-width: 640px) 220px, 180px'
              : '(min-width: 1024px) 400px, (min-width: 640px) 280px, 180px'
          }
          className="bg-transparent!"
          imgClassName="object-contain object-bottom"
        />
      ) : decoration ? (
        <span className={styles.deco} aria-hidden="true">
          <span
            className="block h-full w-full"
            style={{
              maskImage: `url("${decoration.imageUrl}")`,
              WebkitMaskImage: `url("${decoration.imageUrl}")`,
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              backgroundColor: 'var(--accent)',
            }}
          />
        </span>
      ) : (
        <span className={styles.placeholder} aria-hidden="true" />
      )}
    </span>
  )
}

export function CanvasHandle<T extends { id: number }>({
  item,
  interactive = true,
  movementOpen,
  registerHandleRef,
  onHandlePointerDown,
  onHandleKeyDown,
  onHandleClick,
  kind,
  name,
}: {
  kind: 'project' | 'thing'
  name: string
} & Pick<CanvasItemProps<T>, 'item'> &
  Partial<
    Pick<
      CanvasItemProps<T>,
      | 'interactive'
      | 'movementOpen'
      | 'registerHandleRef'
      | 'onHandlePointerDown'
      | 'onHandleKeyDown'
      | 'onHandleClick'
    >
  >) {
  return (
    <button
      ref={registerHandleRef}
      type="button"
      disabled={!interactive}
      {...{ [`data-${kind}-drag-handle`]: item.id }}
      data-movement-open={movementOpen ? 'true' : undefined}
      aria-label={`Move ${kind}: ${name}`}
      aria-expanded={movementOpen}
      className={styles.dragHandle}
      onPointerDown={onHandlePointerDown}
      onKeyDown={onHandleKeyDown}
      onClick={onHandleClick}
    >
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M8 1v14M1 8h14M8 1 6 3M8 1l2 2M8 15l-2-2M8 15l2-2M1 8l2-2M1 8l2 2M15 8l-2-2M15 8l-2 2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
