'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import styles from './site-header-logo.module.css'

type Level = 0 | 1 | 2
type Frame = readonly [Level, Level, Level]
const LETTERS = ['t1', 'u', 'a', 'n', 't2', 'm'] as const
type Letter = (typeof LETTERS)[number]
const SEQUENCES: Record<Letter, readonly Frame[]> = {
  t1: [
    [0, 0, 0],
    [2, 0, 0],
  ],
  u: [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 2],
  ],
  a: [
    [0, 0, 0],
    [1, 0, 0],
    [1, 2, 0],
  ],
  n: [
    [0, 0, 0],
    [2, 0, 0],
    [2, 1, 0],
  ],
  t2: [
    [0, 0, 0],
    [2, 0, 0],
  ],
  m: [
    [0, 0, 0],
    [2, 0, 0],
    [2, 2, 0],
  ],
}
const STEP_MS = 600
const LETTER_BREATH_MS = 600
const SLOT_WIDTH_PX = 5
const UNIT_PX = 5

// Preserve the letter rhythm in one browser timeline, independent of JS timers.
const timeline: { frame: Frame; time: number }[] = [
  { frame: [0, 0, 0], time: 0 },
  { frame: [0, 0, 0], time: STEP_MS },
]
for (const letter of LETTERS) {
  for (const frame of SEQUENCES[letter].slice(1)) {
    timeline.push({ frame, time: timeline.at(-1)!.time + STEP_MS })
  }
  timeline.push({ ...timeline.at(-1)!, time: timeline.at(-1)!.time + LETTER_BREATH_MS })
  timeline.push({ frame: [0, 0, 0], time: timeline.at(-1)!.time + STEP_MS })
}
const DURATION_MS = timeline.at(-1)!.time

type SiteHeaderLogoProps = {
  siteName: string
}
export function SiteHeaderLogo({ siteName }: SiteHeaderLogoProps) {
  const reduceMotion = useReducedMotion()
  const fills = useRef<(HTMLSpanElement | null)[]>([])
  useEffect(() => {
    if (reduceMotion) return
    const animations = fills.current.map((fill, slot) =>
      fill?.animate(
        timeline.map(({ frame, time }) => ({
          transform: `scaleY(${frame[slot] / 2})`,
          offset: time / DURATION_MS,
          easing: 'ease-out',
        })),
        { duration: DURATION_MS, iterations: Infinity },
      ),
    )
    return () => animations.forEach((animation) => animation?.cancel())
  }, [reduceMotion])
  return (
    <div role="img" className={styles.root} aria-label={siteName}>
      <div className={styles.bars}>
        {[0, 1, 2].map((slot) => (
          <span
            key={slot}
            aria-hidden="true"
            className={styles.bar}
            style={{ width: SLOT_WIDTH_PX, height: UNIT_PX * 3 }}
          >
            <span
              ref={(element) => {
                fills.current[slot] = element
              }}
              className={styles.fill}
            />
          </span>
        ))}
      </div>
    </div>
  )
}
