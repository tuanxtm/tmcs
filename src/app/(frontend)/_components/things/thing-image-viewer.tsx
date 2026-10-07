'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import Image from 'next/image'
import { IconRestore } from '@tabler/icons-react'
import type { LocaleCode } from '@/lib/locales'
import type { MediaView } from '@/app/(frontend)/_lib/types'
import styles from './thing-detail.module.css'

const COPY = {
  en: {
    region: 'Product image inspection',
    unavailable: 'Image unavailable',
    help: 'Scroll or pinch to zoom. Drag to pan. Use +, -, or arrow keys. Press 0 to reset.',
    reset: 'Reset image',
    resetCursor: 'RESET IMAGE',
  },
  vi: {
    region: 'Kiểm tra hình ảnh sản phẩm',
    unavailable: 'Không có hình ảnh',
    help: 'Lăn chuột hoặc chụm để thu phóng. Kéo để di chuyển. Dùng +, -, hoặc phím mũi tên. Nhấn 0 để đặt lại.',
    reset: 'Đặt lại hình ảnh',
    resetCursor: 'ĐẶT LẠI ẢNH',
  },
} as const

const MIN_SCALE = 1
const MAX_SCALE = 4
const FIT_RATIO = 0.9
const IDENTITY = { scale: 1, x: 0, y: 0 }
type Transform = typeof IDENTITY
type Point = { x: number; y: number }
type Gesture = {
  base: Transform
  origin: Point
  distance: number | null
  dragging: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isDirty({ scale, x, y }: Transform) {
  return Math.abs(scale - 1) > 0.001 || Math.abs(x) > 0.5 || Math.abs(y) > 0.5
}

function clampPan(next: Transform, width: number, height: number, fit: Point): Transform {
  const w = fit.x * next.scale
  const h = fit.y * next.scale
  const maxX = Math.max(0, (width + w) / 2 - Math.min(44, w))
  const maxY = Math.max(0, (height + h) / 2 - Math.min(44, h))
  return { scale: next.scale, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) }
}

function zoomAt(base: Transform, scale: number, origin: Point, destination = origin): Transform {
  const ratio = scale / base.scale
  return {
    scale,
    x: destination.x - (origin.x - base.x) * ratio,
    y: destination.y - (origin.y - base.y) * ratio,
  }
}

type Props = {
  image: MediaView | null
  primaryUrl: string | null
  name: string
  locale: LocaleCode
  active: boolean
  children: ReactNode
}

export function ThingImageViewer({ image, primaryUrl, name, locale, active, children }: Props) {
  const copy = COPY[locale]
  const helpId = useId()
  const regionRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const transformRef = useRef<Transform>({ ...IDENTITY })
  const fitRef = useRef<Point>({ x: 0, y: 0 })
  const naturalRef = useRef<Point | null>(null)
  const pointersRef = useRef(new Map<number, Point>())
  const gestureRef = useRef<Gesture | null>(null)
  const rafRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)
  const [fit, setFit] = useState<Point>({ x: 0, y: 0 })
  const [failed, setFailed] = useState(false)
  const [dirty, setDirty] = useState(false)

  const cancelInput = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    for (const id of pointersRef.current.keys()) {
      const region = regionRef.current
      if (region?.hasPointerCapture(id)) region.releasePointerCapture(id)
    }
    pointersRef.current.clear()
    gestureRef.current = null
  }, [])

  const reset = useCallback(() => {
    cancelInput()
    transformRef.current = { ...IDENTITY }
    suppressClickRef.current = false
    if (layerRef.current) {
      layerRef.current.style.transform = 'translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1)'
    }
    setDirty(false)
  }, [cancelInput])

  const measure = useCallback(() => {
    const region = regionRef.current
    if (!region || !image) return
    const iw = naturalRef.current?.x ?? (image.width && image.width > 0 ? image.width : 1600)
    const ih = naturalRef.current?.y ?? (image.height && image.height > 0 ? image.height : 900)
    const factor = Math.min(region.clientWidth / iw, region.clientHeight / ih) * FIT_RATIO
    if (factor <= 0) return
    const next = { x: iw * factor, y: ih * factor }
    fitRef.current = next
    setFit((previous) => (previous.x === next.x && previous.y === next.y ? previous : next))
  }, [image])

  useEffect(() => {
    if (!active || failed || !image) return
    const activationFrame = requestAnimationFrame(() => {
      reset()
      measure()
    })
    const region = regionRef.current
    if (!region) return
    const observer = new ResizeObserver(() => {
      reset()
      measure()
    })
    observer.observe(region)
    return () => {
      cancelAnimationFrame(activationFrame)
      observer.disconnect()
      cancelInput()
    }
  }, [active, failed, image, reset, measure, cancelInput])

  const scheduleTransform = useCallback((candidate: Transform) => {
    const region = regionRef.current
    if (!region || fitRef.current.x <= 0) return
    transformRef.current = clampPan(
      candidate,
      region.clientWidth,
      region.clientHeight,
      fitRef.current,
    )
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const next = transformRef.current
      if (layerRef.current) {
        layerRef.current.style.transform = `translate(-50%, -50%) translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`
      }
      setDirty(isDirty(next))
    })
  }, [])

  useEffect(() => {
    if (!active || failed || !image) return
    const region = regionRef.current
    if (!region) return
    const onWheel = (event: WheelEvent) => {
      if (fitRef.current.x <= 0) return
      event.preventDefault()
      event.stopPropagation()
      const multiplier =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? region.clientHeight : 1
      const delta = clamp(event.deltaY * multiplier, -1000, 1000)
      const current = transformRef.current
      const scale = clamp(current.scale * Math.exp(-delta * 0.002), MIN_SCALE, MAX_SCALE)
      const rect = region.getBoundingClientRect()
      const origin = {
        x: event.clientX - rect.left - region.clientWidth / 2,
        y: event.clientY - rect.top - region.clientHeight / 2,
      }
      scheduleTransform(zoomAt(current, scale, origin))
    }
    region.addEventListener('wheel', onWheel, { passive: false })
    return () => region.removeEventListener('wheel', onWheel)
  }, [active, failed, image, scheduleTransform])

  const beginGesture = useCallback(() => {
    const points = [...pointersRef.current.values()]
    if (points.length === 0) {
      gestureRef.current = null
      return
    }
    const a = points[0]
    const b = points[1]
    gestureRef.current = {
      base: { ...transformRef.current },
      origin: b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } : a,
      distance: b ? Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)) : null,
      dragging: suppressClickRef.current,
    }
  }, [])

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!active || failed || event.button !== 0 || fitRef.current.x <= 0) return
      if (pointersRef.current.size === 0) suppressClickRef.current = false
      if (pointersRef.current.size >= 2) return
      const region = event.currentTarget
      const rect = region.getBoundingClientRect()
      pointersRef.current.set(event.pointerId, {
        x: event.clientX - rect.left - region.clientWidth / 2,
        y: event.clientY - rect.top - region.clientHeight / 2,
      })
      if (pointersRef.current.size === 2) {
        suppressClickRef.current = true
        for (const id of pointersRef.current.keys()) region.setPointerCapture(id)
      }
      beginGesture()
    },
    [active, failed, beginGesture],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!active || failed || !pointersRef.current.has(event.pointerId)) return
      const region = event.currentTarget
      const rect = region.getBoundingClientRect()
      const point = {
        x: event.clientX - rect.left - region.clientWidth / 2,
        y: event.clientY - rect.top - region.clientHeight / 2,
      }
      pointersRef.current.set(event.pointerId, point)
      const gesture = gestureRef.current
      if (!gesture) return
      const points = [...pointersRef.current.values()]
      if (points.length === 2 && gesture.distance !== null) {
        const [a, b] = points
        const distance = Math.hypot(b.x - a.x, b.y - a.y)
        const scale = clamp(
          (gesture.base.scale * distance) / gesture.distance,
          MIN_SCALE,
          MAX_SCALE,
        )
        const centroid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        scheduleTransform(zoomAt(gesture.base, scale, gesture.origin, centroid))
        return
      }
      const dx = point.x - gesture.origin.x
      const dy = point.y - gesture.origin.y
      if (!gesture.dragging && Math.hypot(dx, dy) > 6) {
        gesture.dragging = true
        suppressClickRef.current = true
        region.setPointerCapture(event.pointerId)
      }
      if (gesture.dragging) {
        scheduleTransform({
          scale: gesture.base.scale,
          x: gesture.base.x + dx,
          y: gesture.base.y + dy,
        })
      }
    },
    [active, failed, scheduleTransform],
  )

  const finishPointer = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.delete(event.pointerId)) return
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
      beginGesture()
    },
    [beginGesture],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!active || failed || event.target !== event.currentTarget) return
      const base = transformRef.current
      const step = event.shiftKey ? 72 : 24
      let next: Transform
      switch (event.key) {
        case '+':
        case '=':
          next = zoomAt(base, clamp(base.scale * 1.2, MIN_SCALE, MAX_SCALE), { x: 0, y: 0 })
          break
        case '-':
        case '_':
          next = zoomAt(base, clamp(base.scale / 1.2, MIN_SCALE, MAX_SCALE), { x: 0, y: 0 })
          break
        case 'ArrowLeft':
          next = { ...base, x: base.x - step }
          break
        case 'ArrowRight':
          next = { ...base, x: base.x + step }
          break
        case 'ArrowUp':
          next = { ...base, y: base.y - step }
          break
        case 'ArrowDown':
          next = { ...base, y: base.y + step }
          break
        case '0':
          event.preventDefault()
          reset()
          return
        default:
          return
      }
      event.preventDefault()
      scheduleTransform(next)
    },
    [active, failed, reset, scheduleTransform],
  )

  return (
    <>
      <div className={styles.image} data-thing-detail-image="" data-base-ui-swipe-ignore="">
        <div className={styles.imageGrid} aria-hidden="true" />
        {image ? (
          <div
            ref={regionRef}
            className={styles.region}
            role="region"
            aria-label={copy.region}
            aria-describedby={helpId}
            tabIndex={active && !failed ? 0 : -1}
            data-failed={failed ? 'true' : 'false'}
            data-thing-detail-region=""
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
            onLostPointerCapture={finishPointer}
            onPointerLeave={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) finishPointer(event)
            }}
            onKeyDown={handleKeyDown}
            onClickCapture={(event) => {
              if (event.detail === 0 || !suppressClickRef.current) return
              event.preventDefault()
              event.stopPropagation()
              suppressClickRef.current = false
            }}
          >
            <span id={helpId} className={styles.help}>
              {copy.help}
            </span>
            {failed ? (
              <div className={styles.placeholder}>{copy.unavailable}</div>
            ) : (
              <div
                ref={layerRef}
                className={styles.layer}
                data-thing-detail-transform=""
                style={{
                  width: fit.x,
                  height: fit.y,
                  transform: 'translate(-50%, -50%) translate3d(0px, 0px, 0) scale(1)',
                }}
              >
                <Image
                  src={image.url}
                  alt={image.alt || name}
                  fill
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  draggable={false}
                  onLoad={(event) => {
                    const img = event.currentTarget
                    if (active && img.naturalWidth > 0 && img.naturalHeight > 0) {
                      naturalRef.current = { x: img.naturalWidth, y: img.naturalHeight }
                      measure()
                    }
                  }}
                  onError={() => setFailed(true)}
                  style={{ objectFit: 'contain' }}
                />
                {primaryUrl ? (
                  <a
                    href={primaryUrl}
                    aria-label={name}
                    title={name}
                    draggable={false}
                    className={styles.anchorLink}
                    data-thing-detail-image-link=""
                    tabIndex={active ? 0 : -1}
                  />
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>{copy.unavailable}</div>
        )}
      </div>
      <div className={styles.controls} data-thing-detail-controls="" data-base-ui-swipe-ignore="">
        {dirty && active && !failed ? (
          <button
            type="button"
            className={styles.control}
            aria-label={copy.reset}
            data-cursor-popup={copy.resetCursor}
            data-thing-detail-reset=""
            onClick={() => {
              reset()
              regionRef.current?.focus({ preventScroll: true })
            }}
          >
            <IconRestore aria-hidden="true" />
          </button>
        ) : null}
        {children}
      </div>
    </>
  )
}
