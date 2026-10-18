'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type BlueFlameProps = {
  className?: string
  style?: CSSProperties
}

/** Decorative fire that fills a positioned parent with a defined height. */
export function BlueFlame({ className, style }: BlueFlameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !('gpu' in navigator) || !navigator.gpu) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let renderer:
      | Awaited<ReturnType<typeof import('./blue-flame-renderer').createBlueFlameRenderer>>
      | undefined
    let cancelled = false
    let starting = false
    let failed = false
    let visible = false
    let width = 0
    let height = 0
    let raf = 0
    let lastFrame = 0

    function stop() {
      cancelAnimationFrame(raf)
      raf = 0
    }

    function fail() {
      failed = true
      stop()
      renderer?.dispose()
      canvas!.style.opacity = '0'
    }

    function tick(now: number) {
      raf = 0
      if (cancelled || failed || !visible || document.hidden || width <= 0 || height <= 0) return
      try {
        if (now - lastFrame >= 1000 / 60 || motion.matches) {
          renderer?.render(now, motion.matches)
          lastFrame = now - ((now - lastFrame) % (1000 / 60))
          if (canvas!.style.opacity !== '1') canvas!.style.opacity = '1'
        }
        if (!motion.matches) raf = requestAnimationFrame(tick)
      } catch {
        fail()
      }
    }

    async function sync() {
      stop()
      if (cancelled || failed || !visible || document.hidden || width <= 0 || height <= 0) return
      if (!renderer) {
        if (starting) return
        starting = true
        try {
          const { createBlueFlameRenderer } = await import('./blue-flame-renderer')
          if (cancelled) return
          const next = await createBlueFlameRenderer(canvas!)
          if (cancelled) return next.dispose()
          renderer = next
          renderer.onError(fail)
          void renderer.lost.then(() => {
            if (!cancelled) fail()
          })
        } catch {
          if (!cancelled) fail()
        } finally {
          starting = false
        }
      }
      if (cancelled || failed || !renderer || !visible || document.hidden) return
      try {
        renderer.resize(width, height)
        raf = requestAnimationFrame(tick)
      } catch {
        fail()
      }
    }

    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width
      height = entry.contentRect.height
      void sync()
    })
    resize.observe(canvas)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      void sync()
    })
    intersection.observe(canvas)
    const theme = new MutationObserver(() => void sync())
    for (let parent = canvas.parentElement; parent; parent = parent.parentElement) {
      theme.observe(parent, { attributes: true, attributeFilter: ['class', 'style'] })
    }
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      cancelled = true
      stop()
      resize.disconnect()
      intersection.disconnect()
      theme.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      renderer?.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 block h-full w-full', className)}
      style={{ color: 'var(--accent, #3b5bdb)', opacity: 0, ...style }}
    />
  )
}

export default BlueFlame
