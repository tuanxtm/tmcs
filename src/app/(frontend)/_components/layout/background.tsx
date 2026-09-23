'use client'

import { cn } from '@/lib/utils'

const GRID_OPACITY = 0.07
const TICK_SIZE = 4
const TICK_WIDTH = 1.5
const TICK_OPACITY = 0.5
const MASK_GAP = 10

type Intersection = [string, string]

// 4 columns × 3 rows grid: 3 verticals at 1/4/2/4/3/4, 2 horizontals at 1/3 and 2/3.
const STOPS = {
  v: ['25%', '50%', '75%'] as const,
  h: ['33.333%', '66.666%'] as const,
}

const INTERSECTIONS: Intersection[] = STOPS.h.flatMap((y) =>
  STOPS.v.map((x): Intersection => [x, y]),
)

function GridMask({ id, intersections }: { id: string; intersections: Intersection[] }) {
  return (
    <mask id={id} x="0" y="0" width="100%" height="100%" maskUnits="userSpaceOnUse">
      <rect x="0" y="0" width="100%" height="100%" fill="white" />
      {intersections.map(([x, y], i) => (
        <rect
          key={i}
          x={`calc(${x} - ${MASK_GAP}px)`}
          y={`calc(${y} - ${MASK_GAP}px)`}
          width={`${MASK_GAP * 2}px`}
          height={`${MASK_GAP * 2}px`}
          fill="black"
        />
      ))}
    </mask>
  )
}

function GridCrosshairs({ points }: { points: Intersection[] }) {
  return (
    <>
      {points.map(([x, y], i) => (
        <g
          key={i}
          stroke="var(--accent)"
          strokeWidth={TICK_WIDTH}
          strokeLinecap="square"
          opacity={TICK_OPACITY}
        >
          <line
            x1={x}
            y1={`calc(${y} - ${TICK_SIZE}px)`}
            x2={x}
            y2={`calc(${y} + ${TICK_SIZE}px)`}
          />
          <line
            x1={`calc(${x} - ${TICK_SIZE}px)`}
            y1={y}
            x2={`calc(${x} + ${TICK_SIZE}px)`}
            y2={y}
          />
        </g>
      ))}
    </>
  )
}

function GridLines({
  intersections,
  className,
}: {
  intersections: Intersection[]
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      className={cn('h-full w-full', className)}
    >
      <defs>
        <GridMask id="grid-mask" intersections={intersections} />
      </defs>

      {/* All horizontal lines, masked at every intersection X */}
      <g
        mask="url(#grid-mask)"
        stroke="var(--accent)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="square"
        opacity={GRID_OPACITY}
      >
        {STOPS.h.map((p) => (
          <line key={`h-${p}`} x1="0" y1={p} x2="100%" y2={p} />
        ))}
      </g>

      {/* All vertical lines, same mask */}
      <g
        mask="url(#grid-mask)"
        stroke="var(--accent)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="square"
        opacity={GRID_OPACITY}
      >
        {STOPS.v.map((p) => (
          <line key={`v-${p}`} x1={p} y1="0" x2={p} y2="100%" />
        ))}
      </g>

      <GridCrosshairs points={intersections} />
    </svg>
  )
}

export function Background() {
  return (
    <>
      {/* Base wash */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 -z-10 h-dvh w-full overflow-hidden',
          'bg-background',
        )}
      ></div>

      {/* 4×3 grid (4 cols × 3 rows) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden"
      >
        <GridLines intersections={INTERSECTIONS} />
      </div>
    </>
  )
}
