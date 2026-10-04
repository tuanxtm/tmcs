import type { CSSProperties } from 'react'
import Link from 'next/link'

import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'
import type { FeedDecorationView, ProjectCardView } from '@/app/(frontend)/_lib/types'

import { IMAGE_SCALE, OFFSET_X, OFFSET_Y } from './project-canvas-layout'
import styles from './projects.module.css'

/** Stable per-project decoration pick, mirroring FeedCard. */
export function pickProjectDecoration(
  decorations: FeedDecorationView[] | undefined,
  projectId: number,
): FeedDecorationView | null {
  if (!decorations?.length) return null
  return decorations[Math.abs(projectId) % decorations.length] ?? null
}

export function projectNumber(index: number): string {
  return `${String(index + 1).padStart(2, '0')}.`
}

const IMAGE_SIZES = '(min-width: 1024px) 240px, (min-width: 640px) 220px, 180px'

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

function Deco({ decoration }: { decoration: FeedDecorationView }) {
  return (
    <span className={styles.deco} aria-hidden="true">
      <span
        className="block h-full w-full"
        style={{
          WebkitMaskImage: `url("${decoration.imageUrl}")`,
          maskImage: `url("${decoration.imageUrl}")`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          backgroundColor: 'var(--accent)',
        }}
      />
    </span>
  )
}

/** Image (or decoration / placeholder) sized inside the reserved image area. */
function ProjectImage({
  project,
  decoration,
}: {
  project: ProjectCardView
  decoration: FeedDecorationView | null
}) {
  return (
    <span className={styles.imageFit} data-project-image="" onDragStart={(e) => e.preventDefault()}>
      {project.image ? (
        <CmsImage
          media={project.image}
          fill
          sizes={IMAGE_SIZES}
          className="bg-transparent!"
          imgClassName="object-contain object-bottom"
        />
      ) : decoration ? (
        <Deco decoration={decoration} />
      ) : (
        <span className={styles.placeholder} aria-hidden="true" />
      )}
    </span>
  )
}

/**
 * Server-renderable project tile: image on the left, number + title on its
 * right, and a dedicated movement handle outside both links. Default geometry
 * comes from CSS custom properties so it is correct before hydration.
 */
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
  const style = {
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
          <ProjectImage project={project} decoration={decoration} />
        </Link>
      ) : (
        <span
          className={styles.imageArea}
          data-project-drag-surface=""
          onPointerDown={onImagePointerDown}
        >
          <ProjectImage project={project} decoration={decoration} />
        </span>
      )}

      <div className={styles.label}>
        <button
          ref={registerHandleRef}
          type="button"
          disabled={!interactive}
          data-project-drag-handle={project.id}
          data-movement-open={movementOpen ? 'true' : undefined}
          aria-label={`Move project: ${project.title}`}
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
