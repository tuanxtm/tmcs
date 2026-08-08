'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  id: string
  children: React.ReactNode
  className?: string
}

function siteHeaderOffset(): number {
  const header = document.querySelector('header')
  return header?.getBoundingClientRect().height ?? 48
}

/**
 * Sticky section title that sits under the site header.
 * When stuck: shrinks to --section-sticky-header-height, primary + blur.
 */
export function SectionHeader({ id, children, className }: SectionHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    let observer: IntersectionObserver | null = null

    const connect = () => {
      observer?.disconnect()
      const topOffset = siteHeaderOffset()
      observer = new IntersectionObserver(
        ([entry]) => {
          setStuck(!entry.isIntersecting)
        },
        {
          rootMargin: `-${topOffset}px 0px 0px 0px`,
          threshold: 0,
        },
      )
      observer.observe(sentinel)
    }

    connect()
    window.addEventListener('resize', connect)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', connect)
    }
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="pointer-events-none h-0 w-full" aria-hidden="true" />
      <div
        className={cn(
          'section-header transition-[height,min-height,background-color,backdrop-filter,-webkit-backdrop-filter,padding] duration-300 ease-out',
          stuck
            ? 'h-[var(--section-sticky-header-height)] min-h-[var(--section-sticky-header-height)] bg-primary/35 py-0 backdrop-blur-md supports-backdrop-filter:bg-primary/25'
            : 'h-[var(--header-height)] min-h-[var(--header-height)] bg-transparent',
          className,
        )}
        data-stuck={stuck ? 'true' : 'false'}
      >
        <h2 id={id} className="text-xs font-bold text-foreground">
          {children}
        </h2>
      </div>
    </>
  )
}
