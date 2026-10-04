'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useLenis } from 'lenis/react'

import type { FeedDecorationView, ProjectCardView } from '@/app/(frontend)/_lib/types'

import {
  clampProjectPosition,
  getProjectCanvasLayout,
  remapProjectPosition,
  type Point,
  type Size,
} from './project-canvas-layout'
import { pickProjectDecoration, ProjectCanvasItem } from './project-canvas-item'
import styles from './projects.module.css'

/** Pointer travel before a gesture counts as a drag. */
const DRAG_THRESHOLD_PX = 5
/** Visible-band height that triggers vertical edge scrolling. */
const EDGE_BAND_PX = 48
/** Max edge-scroll speed in px/second. */
const EDGE_SCROLL_SPEED = 480
/** Canvas width change (px) that invalidates stored geometry. */
const RESIZE_EPSILON_PX = 1

const ARROW_STEP_PX = 10
const ARROW_STEP_LARGE_PX = 40

type ManualPositions = Record<number, Point>

type ActiveDrag = {
  projectId: number
  pointerId: number
  captureElement: HTMLElement
  itemElement: HTMLElement
  startClient: Point
  lastClient: Point
  startPosition: Point
  grabOffset: Point
  itemSize: Size
  moved: boolean
  completed: boolean
}

type MovementMode = {
  projectId: number
  startPosition: Point
}

type CanvasGeometry = {
  canvas: Size
  padding: number
  itemSize: Size
}

type ProjectsCanvasProps = {
  projects: ProjectCardView[]
  description?: string | null
  cursorPopupItem?: string | null
  decorations?: FeedDecorationView[]
  /** Pauses new automatic pagination requests while a visitor is moving. */
  onMovementChange?: (moving: boolean) => void
}

function readItemPosition(element: HTMLElement | undefined): Point {
  if (!element) return { x: 0, y: 0 }
  return { x: element.offsetLeft, y: element.offsetTop }
}

function readItemSize(element: HTMLElement | undefined, fallback: Size): Size {
  if (!element) return fallback
  return { width: element.offsetWidth, height: element.offsetHeight }
}

/** Id-keyed element registry shared by render-time handler factories. */
type ElementRegistry = {
  get: (id: number) => HTMLElement | undefined
  set: (id: number, element: HTMLElement | null) => void
}

function createElementRegistry(): ElementRegistry {
  const map = new Map<number, HTMLElement>()
  return {
    get: (id) => map.get(id),
    set: (id, element) => {
      if (element) map.set(id, element)
      else map.delete(id)
    },
  }
}

/**
 * Mutable canvas-side state that render-time handler factories need. Effects
 * refresh the callback slots, so cached handlers never close over stale values.
 * A plain object (not a ref) keeps the factories legal during render. Every
 * mutation goes through a method so the store itself is never reassigned.
 */
type CanvasStore = {
  items: ElementRegistry
  handles: ElementRegistry
  setProjects: (projects: ProjectCardView[]) => void
  getProject: (id: number) => ProjectCardView | null
  setStartDrag: (
    start: ((project: ProjectCardView, element: HTMLElement) => DragStarter) | null,
  ) => void
  setKeyDown: (
    key: ((id: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => void) | null,
  ) => void
  setRaise: (raise: ((id: number) => void) | null) => void
  setActivate: (activate: (id: number) => void) => void
  getStart: () => ((project: ProjectCardView, element: HTMLElement) => DragStarter) | null
  getKey: () => ((id: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => void) | null
  getRaise: () => ((id: number) => void) | null
  getActivate: () => ((id: number) => void) | null
  handlers: Map<number, ProjectPointerHandlers>
}

type DragStarter = (event: React.PointerEvent<HTMLElement>) => void

type ProjectPointerHandlers = {
  image: (e: React.PointerEvent<HTMLElement>) => void
  handle: (e: React.PointerEvent<HTMLElement>) => void
  keyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void
  itemRef: (el: HTMLElement | null) => void
  handleRef: (el: HTMLElement | null) => void
  raise: () => void
  activate: () => void
}

function createCanvasStore(): CanvasStore {
  const items = createElementRegistry()
  const handles = createElementRegistry()
  const projects = new Map<number, ProjectCardView>()
  const slots: {
    startDrag: ((project: ProjectCardView, element: HTMLElement) => DragStarter) | null
    keyDown: ((id: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => void) | null
    raise: ((id: number) => void) | null
    activate: ((id: number) => void) | null
  } = { startDrag: null, keyDown: null, raise: null, activate: null }

  const store: CanvasStore = {
    items,
    handles,
    handlers: new Map(),
    setProjects: (next) => {
      const seen = new Set<number>()
      for (const project of next) {
        projects.set(project.id, project)
        seen.add(project.id)
      }
      for (const id of [...projects.keys()]) {
        if (!seen.has(id)) projects.delete(id)
      }
    },
    getProject: (id) => projects.get(id) ?? null,
    setStartDrag: (start) => {
      slots.startDrag = start
    },
    setKeyDown: (key) => {
      slots.keyDown = key
    },
    setRaise: (raise) => {
      slots.raise = raise
    },
    setActivate: (activate) => {
      slots.activate = activate
    },
    getStart: () => slots.startDrag,
    getKey: () => slots.keyDown,
    getRaise: () => slots.raise,
    getActivate: () => slots.activate,
  }
  return store
}

/** Lazily build (and cache) the stable handler set for a project id. */
function getProjectHandlers(store: CanvasStore, id: number) {
  const existing = store.handlers.get(id)
  if (existing) return existing
  const created: ProjectPointerHandlers = {
    image: (event) => {
      const project = store.getProject(id)
      const start = store.getStart()
      if (!project || !start) return
      start(project, event.currentTarget)(event)
    },
    handle: (event) => {
      const project = store.getProject(id)
      const start = store.getStart()
      if (project && start) start(project, event.currentTarget)(event)
    },
    keyDown: (event) => {
      store.getKey()?.(id)(event)
    },
    itemRef: (element) => store.items.set(id, element),
    handleRef: (element) => store.handles.set(id, element),
    raise: () => store.getRaise()?.(id),
    activate: () => store.getActivate()?.(id),
  }
  store.handlers.set(id, created)
  return created
}

export function ProjectsCanvas({
  projects,
  description,
  cursorPopupItem,
  decorations,
  onMovementChange,
}: ProjectsCanvasProps) {
  const lenis = useLenis()
  const canvasRef = useRef<HTMLDivElement | null>(null)
  // One plain store holds everything the per-item handler factories need. They
  // are built during render, so they must not close over refs.
  const [store] = useState(createCanvasStore)
  const { items: itemElements } = store
  const frameRef = useRef<number | null>(null)
  const dragRef = useRef<ActiveDrag | null>(null)
  const geometryRef = useRef<CanvasGeometry | null>(null)
  const positionsRef = useRef<ManualPositions>({})
  const suppressClickRef = useRef(false)
  const edgeRef = useRef({ velocity: 0, lastTime: 0 })
  const movementElRef = useRef<HTMLDivElement | null>(null)
  const zCounterRef = useRef(0)

  const [manual, setManual] = useState<ManualPositions>({})
  const [zOrder, setZOrder] = useState<Record<number, number>>({})
  const [movement, setMovement] = useState<MovementMode | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const interactiveRef = useRef(false)
  const cancelDragRef = useRef<() => void>(() => {})

  const decorationByProject = useMemo(
    () => projects.map((project) => pickProjectDecoration(decorations, project.id)),
    [decorations, projects],
  )

  // ---- geometry ------------------------------------------------------------

  const measure = useCallback((): CanvasGeometry | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const width = canvas.getBoundingClientRect().width
    // Ignore zero-width observations while the section is hidden.
    if (width <= 0) return null

    const layout = getProjectCanvasLayout(width, projects.length)
    const first = layout.placements[0]
    if (!first) return null

    return {
      canvas: { width: layout.width, height: layout.height },
      padding: layout.padding,
      itemSize: { width: first.width, height: first.height },
    }
  }, [projects.length])

  const applyGeometry = useCallback(
    (geometry: CanvasGeometry) => {
      const previous = geometryRef.current
      geometryRef.current = geometry

      // Server-rendered canvas height follows CSS; JS only needs the row
      // counts so the same height applies to a manual-positioned canvas.
      const node = canvasRef.current
      if (node) {
        node.style.setProperty('--rows-mobile', String(Math.ceil(projects.length / 2)))
        node.style.setProperty('--rows-tablet', String(Math.ceil(projects.length / 2)))
        node.style.setProperty('--rows-desktop', String(Math.ceil(projects.length / 3)))
      }

      if (!previous || Math.abs(previous.canvas.width - geometry.canvas.width) < RESIZE_EPSILON_PX)
        return

      const remapped: ManualPositions = {}
      let changed = false
      for (const [id, position] of Object.entries(positionsRef.current)) {
        const next = remapProjectPosition({
          position,
          oldCanvas: previous.canvas,
          newCanvas: geometry.canvas,
          item: geometry.itemSize,
          oldItem: previous.itemSize,
          oldPadding: previous.padding,
          newPadding: geometry.padding,
        })
        const projectId = Number(id)
        remapped[projectId] = next
        if (next.x !== position.x || next.y !== position.y) changed = true
      }
      if (changed) {
        positionsRef.current = remapped
        setManual(remapped)
      }
    },
    [projects.length],
  )

  useEffect(() => {
    const node = canvasRef.current
    if (!node) return

    const syncGeometry = () => {
      const next = measure()
      if (!next) return
      const current = geometryRef.current
      if (current && Math.abs(current.canvas.width - next.canvas.width) >= RESIZE_EPSILON_PX) {
        cancelDragRef.current()
        setMovement(null)
      }
      applyGeometry(next)
      interactiveRef.current = true
      node.setAttribute('data-project-canvas-ready', 'true')
      for (const handle of node.querySelectorAll<HTMLButtonElement>('[data-project-drag-handle]')) {
        handle.disabled = false
      }
    }
    syncGeometry()
    const observer = new ResizeObserver(syncGeometry)

    observer.observe(node)
    return () => {
      observer.disconnect()
      interactiveRef.current = false
    }
  }, [applyGeometry, measure])

  // ---- movement math -------------------------------------------------------

  const moveProject = useCallback(
    (projectId: number, delta: Point) => {
      const geometry = geometryRef.current
      if (!geometry) return
      const itemElement = itemElements.get(projectId)
      const current = positionsRef.current[projectId] ?? readItemPosition(itemElement)
      const next = clampProjectPosition(
        { x: current.x + delta.x, y: current.y + delta.y },
        geometry.canvas,
        readItemSize(itemElement, geometry.itemSize),
        geometry.padding,
      )
      positionsRef.current = { ...positionsRef.current, [projectId]: next }
      setManual(positionsRef.current)
    },
    [itemElements],
  )

  // A single monotonic counter keeps raises strictly ordered, so the most
  // recent raise always wins instead of tying with an earlier one.
  const raiseProject = useCallback((projectId: number) => {
    zCounterRef.current += 1
    const next = zCounterRef.current
    setZOrder((current) =>
      current[projectId] === next ? current : { ...current, [projectId]: next },
    )
  }, [])

  const closeMovement = useCallback((projectId: number) => {
    setMovement((current) => (current?.projectId === projectId ? null : current))
    setAnnouncement('Project placement saved')
  }, [])

  // ---- edge scrolling ------------------------------------------------------

  const stopEdgeScroll = useCallback(() => {
    edgeRef.current.velocity = 0
    edgeRef.current.lastTime = 0
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const applyDragPosition = useCallback((drag: ActiveDrag, desired: Point) => {
    const geometry = geometryRef.current
    if (!geometry) return
    const next = clampProjectPosition(desired, geometry.canvas, drag.itemSize, geometry.padding)
    // Commit React state on release; pointer frames update only this item.
    drag.itemElement.style.setProperty('--manual-x', `${next.x}px`)
    drag.itemElement.style.setProperty('--manual-y', `${next.y}px`)
    positionsRef.current = { ...positionsRef.current, [drag.projectId]: next }
  }, [])

  const tickRef = useRef<() => void>(() => {})

  const tick = useCallback(() => {
    frameRef.current = null
    const drag = dragRef.current
    if (!drag) return

    const canvas = canvasRef.current
    if (!canvas) return

    const edge = edgeRef.current
    if (edge.velocity !== 0) {
      const now = performance.now()
      const elapsed = edge.lastTime ? Math.min(64, now - edge.lastTime) : 16
      edge.lastTime = now
      const target = window.scrollY + (edge.velocity * elapsed) / 1000
      const rect = canvas.getBoundingClientRect()
      const minScroll = Math.max(0, rect.top + window.scrollY - EDGE_BAND_PX)
      const maxScroll = Math.min(
        Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
        Math.max(minScroll, rect.bottom + window.scrollY - window.innerHeight + EDGE_BAND_PX),
      )
      const clamped = Math.min(maxScroll, Math.max(minScroll, target))
      if (lenis) {
        lenis.scrollTo(clamped, { immediate: true, force: true })
      } else {
        window.scrollTo({ top: clamped, behavior: 'instant' })
      }
    } else {
      edge.lastTime = 0
    }

    // Recalculate the rectangle after scrolling so positions stay accurate.
    const canvasRect = canvas.getBoundingClientRect()
    applyDragPosition(drag, {
      x: drag.lastClient.x - canvasRect.left - drag.grabOffset.x,
      y: drag.lastClient.y - canvasRect.top - drag.grabOffset.y,
    })

    if (edge.velocity !== 0) frameRef.current = requestAnimationFrame(() => tickRef.current())
  }, [applyDragPosition, lenis])

  // Keep a stable self-scheduling handle so `tick` can re-bind to a new Lenis
  // instance without recreating every pointer listener.
  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  const computeEdgeVelocity = useCallback((clientY: number): number => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--header-height')
    const parsed = Number.parseFloat(raw)
    // The sticky site header defines the top edge of the visible content.
    const topEdge = Number.isFinite(parsed) ? parsed : 0

    if (clientY < topEdge + EDGE_BAND_PX) {
      return -EDGE_SCROLL_SPEED * Math.min(1, (topEdge + EDGE_BAND_PX - clientY) / EDGE_BAND_PX)
    }
    const bottomEdge = window.innerHeight - EDGE_BAND_PX
    if (clientY > bottomEdge) {
      return EDGE_SCROLL_SPEED * Math.min(1, (clientY - bottomEdge) / EDGE_BAND_PX)
    }
    return 0
  }, [])

  // ---- pointer lifecycle ---------------------------------------------------

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (!suppressClickRef.current) return
      const target = event.target as HTMLElement | null
      // Suppress the click that a completed drag leaves behind, whether it lands
      // on the drag surface, the image, or the keyboard handle.
      if (
        target?.closest('[data-project-drag-surface]') ||
        target?.closest('[data-project-image]') ||
        target?.closest('[data-project-drag-handle]')
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
      suppressClickRef.current = false
    }
    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [])

  const endDrag = useCallback(
    (commit: boolean) => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      stopEdgeScroll()

      if (commit && drag.moved) {
        suppressClickRef.current = true
      } else if (!commit) {
        applyDragPosition(drag, drag.startPosition)
      }
      setManual(positionsRef.current)

      try {
        if (drag.captureElement.hasPointerCapture(drag.pointerId)) {
          drag.captureElement.releasePointerCapture(drag.pointerId)
        }
      } catch {
        // Capture may already be gone; nothing to release.
      }

      onMovementChange?.(false)
    },
    [applyDragPosition, onMovementChange, stopEdgeScroll],
  )

  useEffect(() => {
    cancelDragRef.current = () => endDrag(false)
  }, [endDrag])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return

      drag.lastClient = { x: event.clientX, y: event.clientY }

      if (!drag.moved) {
        const dx = event.clientX - drag.startClient.x
        const dy = event.clientY - drag.startClient.y
        if (Math.hypot(dx, dy) <= DRAG_THRESHOLD_PX) return
        drag.moved = true
        raiseProject(drag.projectId)
        setAnnouncement('Moving project')
      }

      edgeRef.current.velocity = computeEdgeVelocity(event.clientY)
      if (frameRef.current == null) frameRef.current = requestAnimationFrame(tick)
    }

    const onPointerUp = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      // Mark complete before releasing capture so the lost-capture handler
      // does not undo the drop.
      drag.completed = true
      const moved = drag.moved
      if (moved) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect)
          applyDragPosition(drag, {
            x: event.clientX - rect.left - drag.grabOffset.x,
            y: event.clientY - rect.top - drag.grabOffset.y,
          })
      }
      endDrag(true)
      const handleTap =
        !moved &&
        event.pointerType !== 'mouse' &&
        drag.captureElement.hasAttribute('data-project-drag-handle')
      if (handleTap) {
        store.getActivate()?.(drag.projectId)
        suppressClickRef.current = true
      }
      if (moved || handleTap) {
        // The click that follows a drag is dispatched in a later task than
        // pointerup, so clear the flag on the next macrotask rather than in a
        // microtask, which would run before the click arrives.
        setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
      }
    }

    const onPointerCancel = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      drag.completed = true
      endDrag(false)
    }

    const onLostPointerCapture = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      if (drag.completed) return
      endDrag(false)
    }

    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerCancel)
    document.addEventListener('lostpointercapture', onLostPointerCapture)
    return () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointercancel', onPointerCancel)
      document.removeEventListener('lostpointercapture', onLostPointerCapture)
    }
  }, [applyDragPosition, computeEdgeVelocity, endDrag, raiseProject, store, tick])

  useEffect(
    () => () => {
      stopEdgeScroll()
      const drag = dragRef.current
      if (drag) {
        try {
          if (drag.captureElement.hasPointerCapture(drag.pointerId)) {
            drag.captureElement.releasePointerCapture(drag.pointerId)
          }
        } catch {
          // Ignore teardown capture errors.
        }
      }
      dragRef.current = null
    },
    [stopEdgeScroll],
  )

  const startPointerDrag = useCallback(
    (project: ProjectCardView, element: HTMLElement) =>
      (event: React.PointerEvent<HTMLElement>) => {
        // Primary pointer and left mouse button only.
        if (event.button !== 0 || !event.isPrimary) return

        const geometry = geometryRef.current
        const canvas = canvasRef.current
        const itemElement = itemElements.get(project.id)
        if (!interactiveRef.current || !geometry || !canvas || !itemElement || dragRef.current)
          return

        const fromHandle = Boolean(
          (event.target as HTMLElement).closest('[data-project-drag-handle]'),
        )
        // Touch and pen start only from the handle; the handle owns
        // `touch-action: none`, so ordinary page scrolling still works outside it.
        if (event.pointerType !== 'mouse' && !fromHandle) return

        const canvasRect = canvas.getBoundingClientRect()
        const itemRect = itemElement.getBoundingClientRect()

        dragRef.current = {
          projectId: project.id,
          pointerId: event.pointerId,
          captureElement: element,
          itemElement,
          startClient: { x: event.clientX, y: event.clientY },
          lastClient: { x: event.clientX, y: event.clientY },
          startPosition: { x: itemRect.left - canvasRect.left, y: itemRect.top - canvasRect.top },
          grabOffset: { x: event.clientX - itemRect.left, y: event.clientY - itemRect.top },
          itemSize: { width: itemRect.width, height: itemRect.height },
          moved: false,
          completed: false,
        }

        edgeRef.current.lastTime = 0
        try {
          element.setPointerCapture(event.pointerId)
        } catch {
          // Capture unsupported: document listeners still drive the gesture.
        }
        setMovement(null)
        onMovementChange?.(true)
      },
    [itemElements, onMovementChange],
  )

  // Keep the store in sync. Effects own every write so render stays pure, and
  // the cached handlers always resolve the latest project and callback.
  useEffect(() => {
    store.setStartDrag(startPointerDrag)
  }, [startPointerDrag, store])

  useEffect(() => {
    store.setProjects(projects)
  }, [projects, store])

  // ---- keyboard movement ---------------------------------------------------

  const activateMovement = useCallback(
    (projectId: number) => {
      if (!interactiveRef.current) return
      const project = store.getProject(projectId)
      if (!project) return
      if (movement?.projectId === projectId) {
        closeMovement(projectId)
        return
      }
      setMovement({ projectId, startPosition: readItemPosition(itemElements.get(projectId)) })
      raiseProject(projectId)
      setAnnouncement(`Movement mode on for ${project.title}`)
    },
    [closeMovement, itemElements, movement, raiseProject, store],
  )

  useEffect(() => {
    store.setActivate(activateMovement)
  }, [activateMovement, store])

  const handleKeyDownFor = useCallback(
    (projectId: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const project = store.getProject(projectId)
      if (!project) return
      const open = movement?.projectId === projectId
      const step = event.shiftKey ? ARROW_STEP_LARGE_PX : ARROW_STEP_PX
      const deltas: Record<string, Point> = {
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
      }

      if (!open) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          activateMovement(projectId)
        }
        return
      }

      const delta = deltas[event.key]
      if (delta) {
        event.preventDefault()
        moveProject(projectId, delta)
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        closeMovement(projectId)
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        positionsRef.current = { ...positionsRef.current, [projectId]: movement.startPosition }
        setManual(positionsRef.current)
        closeMovement(projectId)
        setAnnouncement('Project placement restored')
      }
    },
    [activateMovement, closeMovement, moveProject, movement, store],
  )
  useEffect(() => {
    store.setKeyDown(handleKeyDownFor)
  }, [handleKeyDownFor, store])

  const resetLayout = useCallback(() => {
    endDrag(false)
    setMovement(null)
    positionsRef.current = {}
    zCounterRef.current = 0
    setManual({})
    setZOrder({})
    setAnnouncement('Layout reset')
  }, [endDrag])

  useEffect(() => {
    onMovementChange?.(movement !== null || dragRef.current !== null)
  }, [movement, onMovementChange])

  // Keep the movement overlay inside the canvas bounds.
  useEffect(() => {
    if (!movement) return
    const overlay = movementElRef.current
    const canvas = canvasRef.current
    const item = itemElements.get(movement.projectId)
    if (!overlay || !canvas || !item) return

    const geometry = geometryRef.current
    if (!geometry) return

    const offsetX = Math.min(
      Math.max(0, geometry.canvas.width - overlay.offsetWidth - 8),
      Math.max(0, item.offsetLeft),
    )
    const offsetY = Math.min(
      Math.max(0, geometry.canvas.height - overlay.offsetHeight - 8),
      item.offsetTop + item.offsetHeight,
    )
    overlay.style.left = `${offsetX}px`
    overlay.style.top = `${offsetY}px`
  }, [itemElements, manual, movement])

  const hasManual = useMemo(() => Object.keys(manual).length > 0, [manual])

  // Stable per-project refs. Inline callbacks would be a new identity on every
  // render, so React would detach (call with null) and reattach each item,
  // leaving any in-flight drag holding a detached node.
  useEffect(() => {
    store.setRaise(raiseProject)
  }, [raiseProject, store])

  return (
    <div
      data-projects-canvas-root=""
      onBlurCapture={(event) => {
        if (!movement) return
        const next = event.relatedTarget as Node | null
        if (
          next &&
          (itemElements.get(movement.projectId)?.contains(next) ||
            movementElRef.current?.contains(next))
        )
          return
        closeMovement(movement.projectId)
      }}
    >
      <div className={styles.descriptionRow}>
        {description ? <p className={styles.description}>{description}</p> : null}
        <button
          type="button"
          data-project-reset=""
          aria-label="Reset project layout"
          title="Reset project layout"
          className={styles.reset}
          onClick={resetLayout}
          disabled={!hasManual}
        >
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 7a6 6 0 1 1 1.4 5M2 2v5h5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div
        ref={canvasRef}
        data-project-canvas=""
        className={styles.canvas}
        style={
          {
            '--rows-mobile': Math.ceil(projects.length / 2),
            '--rows-tablet': Math.ceil(projects.length / 2),
            '--rows-desktop': Math.ceil(projects.length / 3),
          } as CSSProperties
        }
      >
        {projects.map((project, index) => {
          const handlers = getProjectHandlers(store, project.id)
          return (
            <ProjectCanvasItem
              key={project.id}
              project={project}
              index={index}
              decoration={decorationByProject[index] ?? null}
              cursorPopup={cursorPopupItem}
              manual={manual[project.id] ?? null}
              zIndex={zOrder[project.id] ?? null}
              movementOpen={movement?.projectId === project.id}
              interactive={false}
              onImagePointerDown={handlers.image}
              onHandlePointerDown={handlers.handle}
              onHandleKeyDown={handlers.keyDown}
              onHandleClick={handlers.activate}
              onItemFocusCapture={handlers.raise}
              registerItemRef={handlers.itemRef}
              registerHandleRef={handlers.handleRef}
            />
          )
        })}

        {movement ? (
          <div
            ref={movementElRef}
            data-project-movement={movement.projectId}
            role="group"
            aria-label="Move project"
            className={styles.movement}
          >
            <span aria-hidden="true" />
            <button
              type="button"
              data-project-move="up"
              aria-label="Move up"
              onClick={() => moveProject(movement.projectId, { x: 0, y: -ARROW_STEP_PX })}
            >
              ↑
            </button>
            <span aria-hidden="true" />
            <button
              type="button"
              data-project-move="left"
              aria-label="Move left"
              onClick={() => moveProject(movement.projectId, { x: -ARROW_STEP_PX, y: 0 })}
            >
              ←
            </button>
            <button
              type="button"
              data-project-move="done"
              aria-label="Finish moving"
              onClick={() => closeMovement(movement.projectId)}
            >
              ✓
            </button>
            <button
              type="button"
              data-project-move="right"
              aria-label="Move right"
              onClick={() => moveProject(movement.projectId, { x: ARROW_STEP_PX, y: 0 })}
            >
              →
            </button>
            <span aria-hidden="true" />
            <button
              type="button"
              data-project-move="down"
              aria-label="Move down"
              onClick={() => moveProject(movement.projectId, { x: 0, y: ARROW_STEP_PX })}
            >
              ↓
            </button>
            <span aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <p aria-live="polite" role="status" className={styles.srOnly}>
        {announcement}
      </p>
    </div>
  )
}
