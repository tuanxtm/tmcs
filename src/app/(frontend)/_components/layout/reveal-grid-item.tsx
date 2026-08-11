'use client'

import { useEffect, useState, useRef, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

import { useBootReady } from '@/app/(frontend)/_components/providers/boot-reveal'

/** Travel distance for the fly-up enter. */
const FLY_Y_PX = 48
/** Enter duration - slow enough to read as motion. */
const DURATION_S = 0.75
/** Stagger between items in the same row only. */
const ROW_STAGGER_S = 0.12

type GridBreakpoints = {
  /** Columns below `sm` (default 1). */
  base?: number
  /** Columns from 640px. */
  sm: number
  /** Columns from 1024px. */
  lg: number
}

/** Matches feed-grid / things-grid CSS breakpoints. */
export function useGridColumnCount({ base = 1, sm, lg }: GridBreakpoints): number {
  const [columns, setColumns] = useState(base)

  useEffect(() => {
    const mqSm = window.matchMedia('(min-width: 640px)')
    const mqLg = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      setColumns(mqLg.matches ? lg : mqSm.matches ? sm : base)
    }
    sync()
    mqSm.addEventListener('change', sync)
    mqLg.addEventListener('change', sync)
    return () => {
      mqSm.removeEventListener('change', sync)
      mqLg.removeEventListener('change', sync)
    }
  }, [base, sm, lg])

  return columns
}

type RevealGridItemProps = {
  index: number
  /** Current column count - used so stagger resets per row. */
  columns: number
  className?: string
  children: ReactNode
}

/**
 * Fly-up enter when the item’s row first enters the viewport.
 * Stagger is within-row only (index % columns), not across the whole grid.
 */
export function RevealGridItem({ index, columns, className, children }: RevealGridItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const bootReady = useBootReady()
  // Fire as soon as any pixel of the item enters the screen (row entering view).
  const inView = useInView(ref, { once: true, amount: 'some' })
  const show = Boolean(reduceMotion) || (bootReady && inView)
  const colCount = Math.max(1, columns)
  const colIndex = index % colCount

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: FLY_Y_PX }}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: FLY_Y_PX }}
      transition={{
        duration: reduceMotion ? 0.05 : DURATION_S,
        ease: [0.22, 1, 0.36, 1],
        delay: show && !reduceMotion ? colIndex * ROW_STAGGER_S : 0,
      }}
    >
      {children}
    </motion.div>
  )
}
