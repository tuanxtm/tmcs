'use client'

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useLenis } from 'lenis/react'

import type { FeedDecorationView } from '@/app/(frontend)/_lib/types'

import {
  clampCanvasPosition,
  getCanvasLayout,
  remapCanvasPosition,
  type Point,
  type Size,
} from './canvas-layout'
import { pickCanvasDecoration } from './canvas-item'
import styles from './canvas.module.css'

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
  itemId: number
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
  itemId: number
  startPosition: Point
}

type CanvasGeometry = {
  canvas: Size
  padding: number
  itemSize: Size
  itemSizes: Record<number, Size>
}

export type CanvasDoc = { id: number; title: string }

export type CanvasItemProps<T> = {
  item: T
  index: number
  decoration: FeedDecorationView | null
  cursorPopup?: string | null
  manual: Point | null
  zIndex: number | null
  interactive: boolean
  movementOpen: boolean
  onImagePointerDown: CanvasPointerHandlers['image']
  onHandlePointerDown: CanvasPointerHandlers['handle']
  onHandleKeyDown: CanvasPointerHandlers['keyDown']
  onHandleClick: () => void
  onItemFocusCapture: () => void
  registerItemRef: CanvasPointerHandlers['itemRef']
  registerHandleRef: CanvasPointerHandlers['handleRef']
}

type DraggableCanvasProps<T extends CanvasDoc> = {
  items: T[]
  kind: 'project' | 'thing'
  renderItem: (props: CanvasItemProps<T>) => ReactNode
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
  const rect = element.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
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

/** Effects refresh the callback slots used by stable item handlers. */
type CanvasStore = {
  items: ElementRegistry
  handles: ElementRegistry
  setItems: (items: CanvasDoc[]) => void
  getItem: (id: number) => CanvasDoc | null
  setStartDrag: (start: ((item: CanvasDoc, element: HTMLElement) => DragStarter) | null) => void
  setKeyDown: (
    key: ((id: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => void) | null,
  ) => void
  setRaise: (raise: ((id: number) => void) | null) => void
  setActivate: (activate: (id: number) => void) => void
  getStart: () => ((item: CanvasDoc, element: HTMLElement) => DragStarter) | null
  getKey: () => ((id: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => void) | null
  getRaise: () => ((id: number) => void) | null
  getActivate: () => ((id: number) => void) | null
  handlers: Map<number, CanvasPointerHandlers>
}

type DragStarter = (event: React.PointerEvent<HTMLElement>) => void

type CanvasPointerHandlers = {
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
  const docs = new Map<number, CanvasDoc>()
  const slots: {
    startDrag: ((item: CanvasDoc, element: HTMLElement) => DragStarter) | null
    keyDown: ((id: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => void) | null
    raise: ((id: number) => void) | null
    activate: ((id: number) => void) | null
  } = { startDrag: null, keyDown: null, raise: null, activate: null }

  const store: CanvasStore = {
    items,
    handles,
    handlers: new Map(),
    setItems: (next) => {
      const seen = new Set<number>()
      for (const item of next) {
        docs.set(item.id, item)
        seen.add(item.id)
      }
      for (const id of [...docs.keys()]) {
        if (!seen.has(id)) docs.delete(id)
      }
    },
    getItem: (id) => docs.get(id) ?? null,
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

/** Lazily build (and cache) the stable handler set for a item id. */
function getItemHandlers(store: CanvasStore, id: number) {
  const existing = store.handlers.get(id)
  if (existing) return existing
  const created: CanvasPointerHandlers = {
    image: (event) => {
      const item = store.getItem(id)
      const start = store.getStart()
      if (!item || !start) return
      start(item, event.currentTarget)(event)
    },
    handle: (event) => {
      const item = store.getItem(id)
      const start = store.getStart()
      if (item && start) start(item, event.currentTarget)(event)
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

export function DraggableCanvas<T extends CanvasDoc>({
  items,
  kind,
  renderItem,
  description,
  cursorPopupItem,
  decorations,
  onMovementChange,
}: DraggableCanvasProps<T>) {
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

  const decorationByItem = useMemo(
    () => items.map((item) => pickCanvasDecoration(decorations, item.id)),
    [decorations, items],
  )

  // ---- geometry ------------------------------------------------------------

  const measure = useCallback((): CanvasGeometry | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const width = canvas.getBoundingClientRect().width
    // Ignore zero-width observations while the section is hidden.
    if (width <= 0) return null

    const layout = getCanvasLayout(width, items.length, kind)
    const first = layout.placements[0]
    if (!first) return null

    return {
      canvas: { width: layout.width, height: layout.height },
      padding: layout.padding,
      itemSize: { width: first.width, height: first.height },
      itemSizes: Object.fromEntries(
        items.map((item) => [item.id, readItemSize(itemElements.get(item.id), first)]),
      ),
    }
  }, [items, itemElements, kind])

  const applyGeometry = useCallback(
    (geometry: CanvasGeometry) => {
      const previous = geometryRef.current
      geometryRef.current = geometry

      // Server-rendered canvas height follows CSS; JS only needs the row
      // counts so the same height applies to a manual-positioned canvas.
      const node = canvasRef.current
      if (node) {
        node.style.setProperty('--rows-mobile', String(Math.ceil(items.length / 2)))
        node.style.setProperty('--rows-tablet', String(Math.ceil(items.length / 2)))
        node.style.setProperty('--rows-desktop', String(Math.ceil(items.length / 3)))
        node.style.setProperty('--rows-wide', String(Math.ceil(items.length / 4)))
      }

      if (!previous || Math.abs(previous.canvas.width - geometry.canvas.width) < RESIZE_EPSILON_PX)
        return

      const remapped: ManualPositions = {}
      let changed = false
      for (const [id, position] of Object.entries(positionsRef.current)) {
        const itemId = Number(id)
        const next = remapCanvasPosition({
          position,
          oldCanvas: previous.canvas,
          newCanvas: geometry.canvas,
          item: geometry.itemSizes[itemId] ?? geometry.itemSize,
          oldItem: previous.itemSizes[itemId] ?? previous.itemSize,
          oldPadding: previous.padding,
          newPadding: geometry.padding,
        })
        remapped[itemId] = next
        if (next.x !== position.x || next.y !== position.y) changed = true
      }
      if (changed) {
        positionsRef.current = remapped
        setManual(remapped)
      }
    },
    [items.length],
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
      node.setAttribute(`data-${kind}-canvas-ready`, 'true')
      for (const handle of node.querySelectorAll<HTMLButtonElement>(`[data-${kind}-drag-handle]`)) {
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
  }, [applyGeometry, measure, kind])

  // ---- movement math -------------------------------------------------------

  const moveItem = useCallback(
    (itemId: number, delta: Point) => {
      const geometry = geometryRef.current
      if (!geometry) return
      const itemElement = itemElements.get(itemId)
      const current = positionsRef.current[itemId] ?? readItemPosition(itemElement)
      const next = clampCanvasPosition(
        { x: current.x + delta.x, y: current.y + delta.y },
        geometry.canvas,
        readItemSize(itemElement, geometry.itemSize),
        geometry.padding,
      )
      positionsRef.current = { ...positionsRef.current, [itemId]: next }
      setManual(positionsRef.current)
    },
    [itemElements],
  )

  // A single monotonic counter keeps raises strictly ordered, so the most
  // recent raise always wins instead of tying with an earlier one.
  const raiseItem = useCallback((itemId: number) => {
    zCounterRef.current += 1
    const next = zCounterRef.current
    setZOrder((current) => (current[itemId] === next ? current : { ...current, [itemId]: next }))
  }, [])

  const closeMovement = useCallback(
    (itemId: number) => {
      setMovement((current) => (current?.itemId === itemId ? null : current))
      setAnnouncement(`${kind === 'thing' ? 'Thing' : 'Project'} placement saved`)
    },
    [kind],
  )

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
    const next = clampCanvasPosition(desired, geometry.canvas, drag.itemSize, geometry.padding)
    // Commit React state on release; pointer frames update only this item.
    drag.itemElement.style.setProperty('--manual-x', `${next.x}px`)
    drag.itemElement.style.setProperty('--manual-y', `${next.y}px`)
    drag.itemElement.style.setProperty('--manual-bottom', 'auto')
    drag.itemElement.style.setProperty('--manual-right', 'auto')
    positionsRef.current = { ...positionsRef.current, [drag.itemId]: next }
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
        target?.closest(`[data-${kind}-drag-surface]`) ||
        target?.closest(`[data-${kind}-image]`) ||
        target?.closest(`[data-${kind}-drag-handle]`)
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
      suppressClickRef.current = false
    }
    document.addEventListener('click', onClickCapture, true)
    return () => document.removeEventListener('click', onClickCapture, true)
  }, [kind])

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
        raiseItem(drag.itemId)
        setAnnouncement(`Moving ${kind}`)
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
        drag.captureElement.hasAttribute(`data-${kind}-drag-handle`)
      if (handleTap) {
        store.getActivate()?.(drag.itemId)
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
  }, [applyDragPosition, computeEdgeVelocity, endDrag, kind, raiseItem, store, tick])

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
    (item: CanvasDoc, element: HTMLElement) => (event: React.PointerEvent<HTMLElement>) => {
      // Primary pointer and left mouse button only.
      if (event.button !== 0 || !event.isPrimary) return

      const geometry = geometryRef.current
      const canvas = canvasRef.current
      const itemElement = itemElements.get(item.id)
      if (!interactiveRef.current || !geometry || !canvas || !itemElement || dragRef.current) return

      const fromHandle = Boolean(
        (event.target as HTMLElement).closest(`[data-${kind}-drag-handle]`),
      )
      // Touch and pen start only from the handle; the handle owns
      // `touch-action: none`, so ordinary page scrolling still works outside it.
      if (event.pointerType !== 'mouse' && !fromHandle) return

      const canvasRect = canvas.getBoundingClientRect()
      const itemRect = itemElement.getBoundingClientRect()

      dragRef.current = {
        itemId: item.id,
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
    [itemElements, kind, onMovementChange],
  )

  // Keep the store in sync. Effects own every write so render stays pure, and
  // the cached handlers always resolve the latest item and callback.
  useEffect(() => {
    store.setStartDrag(startPointerDrag)
  }, [startPointerDrag, store])

  useEffect(() => {
    store.setItems(items)
  }, [items, store])

  // ---- keyboard movement ---------------------------------------------------

  const activateMovement = useCallback(
    (itemId: number) => {
      if (!interactiveRef.current) return
      const item = store.getItem(itemId)
      if (!item) return
      if (movement?.itemId === itemId) {
        closeMovement(itemId)
        return
      }
      setMovement({ itemId, startPosition: readItemPosition(itemElements.get(itemId)) })
      raiseItem(itemId)
      setAnnouncement(`Movement mode on for ${item.title}`)
    },
    [closeMovement, itemElements, movement, raiseItem, store],
  )

  useEffect(() => {
    store.setActivate(activateMovement)
  }, [activateMovement, store])

  const handleKeyDownFor = useCallback(
    (itemId: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const item = store.getItem(itemId)
      if (!item) return
      const open = movement?.itemId === itemId
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
          activateMovement(itemId)
        }
        return
      }

      const delta = deltas[event.key]
      if (delta) {
        event.preventDefault()
        moveItem(itemId, delta)
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        closeMovement(itemId)
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        positionsRef.current = { ...positionsRef.current, [itemId]: movement.startPosition }
        setManual(positionsRef.current)
        closeMovement(itemId)
        setAnnouncement(`${kind === 'thing' ? 'Thing' : 'Project'} placement restored`)
      }
    },
    [activateMovement, closeMovement, kind, moveItem, movement, store],
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
    const item = itemElements.get(movement.itemId)
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

  // Stable item refs. Inline callbacks would be a new identity on every
  // render, so React would detach (call with null) and reattach each item,
  // leaving any in-flight drag holding a detached node.
  useEffect(() => {
    store.setRaise(raiseItem)
  }, [raiseItem, store])

  return (
    <div
      {...{ [`data-${kind}s-canvas-root`]: '' }}
      onBlurCapture={(event) => {
        if (!movement) return
        const next = event.relatedTarget as Node | null
        if (
          next &&
          (itemElements.get(movement.itemId)?.contains(next) ||
            movementElRef.current?.contains(next))
        )
          return
        closeMovement(movement.itemId)
      }}
    >
      <div className={styles.descriptionRow}>
        {description ? <p className={styles.description}>{description}</p> : null}
        <button
          type="button"
          {...{ [`data-${kind}-reset`]: '' }}
          aria-label={`Reset ${kind} layout`}
          title={`Reset ${kind} layout`}
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
        {...{ [`data-${kind}-canvas`]: '' }}
        className={`${styles.canvas} ${kind === 'thing' ? styles.thingsCanvas : ''}`}
        style={
          {
            '--rows-mobile': Math.ceil(items.length / 2),
            '--rows-tablet': Math.ceil(items.length / 2),
            '--rows-desktop': Math.ceil(items.length / 3),
            '--rows-wide': Math.ceil(items.length / 4),
          } as CSSProperties
        }
      >
        {items.map((item, index) => {
          const handlers = getItemHandlers(store, item.id)
          return (
            <Fragment key={item.id}>
              {renderItem({
                item,
                index,
                decoration: decorationByItem[index] ?? null,
                cursorPopup: cursorPopupItem,
                manual: manual[item.id] ?? null,
                zIndex: zOrder[item.id] ?? null,
                movementOpen: movement?.itemId === item.id,
                interactive: false,
                onImagePointerDown: handlers.image,
                onHandlePointerDown: handlers.handle,
                onHandleKeyDown: handlers.keyDown,
                onHandleClick: handlers.activate,
                onItemFocusCapture: handlers.raise,
                registerItemRef: handlers.itemRef,
                registerHandleRef: handlers.handleRef,
              })}
            </Fragment>
          )
        })}

        {movement ? (
          <div
            ref={movementElRef}
            {...{ [`data-${kind}-movement`]: movement.itemId }}
            role="group"
            aria-label={`Move ${kind}`}
            className={styles.movement}
          >
            <span aria-hidden="true" />
            <button
              type="button"
              {...{ [`data-${kind}-move`]: 'up' }}
              aria-label="Move up"
              onClick={() => moveItem(movement.itemId, { x: 0, y: -ARROW_STEP_PX })}
            >
              ↑
            </button>
            <span aria-hidden="true" />
            <button
              type="button"
              {...{ [`data-${kind}-move`]: 'left' }}
              aria-label="Move left"
              onClick={() => moveItem(movement.itemId, { x: -ARROW_STEP_PX, y: 0 })}
            >
              ←
            </button>
            <button
              type="button"
              {...{ [`data-${kind}-move`]: 'done' }}
              aria-label="Finish moving"
              onClick={() => closeMovement(movement.itemId)}
            >
              ✓
            </button>
            <button
              type="button"
              {...{ [`data-${kind}-move`]: 'right' }}
              aria-label="Move right"
              onClick={() => moveItem(movement.itemId, { x: ARROW_STEP_PX, y: 0 })}
            >
              →
            </button>
            <span aria-hidden="true" />
            <button
              type="button"
              {...{ [`data-${kind}-move`]: 'down' }}
              aria-label="Move down"
              onClick={() => moveItem(movement.itemId, { x: 0, y: ARROW_STEP_PX })}
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
