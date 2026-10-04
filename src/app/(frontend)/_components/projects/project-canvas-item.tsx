import Link from 'next/link'

import type { FeedDecorationView, ProjectCardView } from '@/app/(frontend)/_lib/types'

import { CanvasImage, CanvasHandle, canvasItemStyle, canvasNumber } from '../canvas/canvas-item'
export { pickCanvasDecoration as pickProjectDecoration } from '../canvas/canvas-item'
import styles from '../canvas/canvas.module.css'

export const projectNumber = canvasNumber

type ProjectCanvasItemProps = {
  project: ProjectCardView
  index: number
  decoration: FeedDecorationView | null
  cursorPopup?: string | null
  /** Manual px override applied after drag; absent means CSS default. */
  manual?: { x: number; y: number } | null
  /** Manual z-index while the item is active or focused. */
  zIndex?: number | null
  /** True once hydration + measurement complete; movement controls unlock. */
  interactive?: boolean
  movementOpen?: boolean
  /** Mouse users can drag from the image or the handle. */
  onImagePointerDown?: (event: React.PointerEvent<HTMLElement>) => void
  onHandlePointerDown?: (event: React.PointerEvent<HTMLElement>) => void
  onHandleKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  onHandleClick?: () => void
  onItemFocusCapture?: () => void
  registerItemRef?: (element: HTMLElement | null) => void
  registerHandleRef?: (element: HTMLElement | null) => void
}

export function ProjectCanvasItem({
  project,
  index,
  decoration,
  cursorPopup,
  manual = null,
  zIndex = null,
  interactive = true,
  movementOpen = false,
  onImagePointerDown,
  onHandlePointerDown,
  onHandleKeyDown,
  onHandleClick,
  onItemFocusCapture,
  registerItemRef,
  registerHandleRef,
}: ProjectCanvasItemProps) {
  const style = canvasItemStyle(index, manual, zIndex)

  return (
    <article
      ref={registerItemRef}
      style={style}
      data-project-item={project.id}
      data-cursor-popup={cursorPopup || undefined}
      onFocusCapture={onItemFocusCapture}
      className={styles.item}
    >
      {project.href ? (
        <Link
          href={project.href}
          transitionTypes={['nav-forward']}
          aria-label={project.title}
          className={styles.imageArea}
          data-project-drag-surface=""
          onPointerDown={onImagePointerDown}
        >
          <CanvasImage kind="project" image={project.image} decoration={decoration} />
        </Link>
      ) : (
        <span
          className={styles.imageArea}
          data-project-drag-surface=""
          onPointerDown={onImagePointerDown}
        >
          <CanvasImage kind="project" image={project.image} decoration={decoration} />
        </span>
      )}

      <div className={styles.label}>
        <CanvasHandle
          item={project}
          kind="project"
          name={project.title}
          interactive={interactive}
          movementOpen={movementOpen}
          registerHandleRef={registerHandleRef}
          onHandlePointerDown={onHandlePointerDown}
          onHandleKeyDown={onHandleKeyDown}
          onHandleClick={onHandleClick}
        />
        <span className={styles.number}>{projectNumber(index)}</span>
        {project.href ? (
          <Link
            href={project.href}
            transitionTypes={['nav-forward']}
            title={project.title}
            className={styles.title}
          >
            {project.title}
          </Link>
        ) : (
          <span title={project.title} className={styles.title}>
            {project.title}
          </span>
        )}
      </div>
    </article>
  )
}
