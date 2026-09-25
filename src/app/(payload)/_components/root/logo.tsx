'use client'

import { useEffect } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'

/**
 * Site logo rendered as 3 vertical bars that fill bottom-up
 * to spell the letters in a short rhythm.
 *
 * Each letter is described as a sequence of frames. A frame lists the
 * target fill level (0 = empty, 1 = half, 2 = full) for slots 0..2.
 *
 *   t -> 0:2
 *   u -> 0:1, 1:1, 2:2
 *   a -> 0:1, 1:2
 *   n -> 0:2, 1:1
 *   t -> 0:2
 *   m -> 0:2, 1:2
 *
 * The level value is the slot's raw height in "bar units" (0, 1, or 2).
 * `scaleY = level / 2` maps that onto a 0..1 vertical scale anchored
 * at the bottom, so the bar fills from the baseline up.
 */
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

type LogoSize = 'sm' | 'lg'

// 'lg' = Login view (default). 'sm' = Payload Icon slot (hard-capped 16×16).
const SIZE_PRESETS: Record<
  LogoSize,
  { barWidth: number; unit: number; gap: number; radius: number }
> = {
  sm: { barWidth: 4, unit: 4, gap: 1.75, radius: 0.5 },
  lg: { barWidth: 12, unit: 12, gap: 6, radius: 1.5 },
}

const ACCENT_BAR_BG = 'var(--accent, oklch(0.471 0.1753 268.84))'

// Faint track behind the accent bar (~15% opacity on the brand color).
const ACCENT_BAR_BG_FAINT = `color-mix(in oklch, ${'oklch(0.471 0.1753 268.84)'} 15%, transparent)`

function Highlight({
  level,
  preset,
}: {
  level: MotionValue<number>
  preset: (typeof SIZE_PRESETS)[LogoSize]
}) {
  const scaleY = useTransform(level, (v) => v / 2)
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'block',
        width: preset.barWidth,
        height: preset.unit * 3,
        background: ACCENT_BAR_BG_FAINT,
        transformOrigin: 'bottom',
        transform: 'rotate(30deg)',
        borderRadius: `${preset.radius}px`,
      }}
    >
      <motion.span
        aria-hidden="true"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: ACCENT_BAR_BG,
          transformOrigin: 'bottom',
          scaleY,
          borderRadius: `${preset.radius}px`,
        }}
      />
    </span>
  )
}

type LogoProps = {
  siteName: string
  size?: LogoSize
}

export default function Logo({ siteName, size = 'lg' }: LogoProps) {
  const preset = SIZE_PRESETS[size]
  const reduceMotion = useReducedMotion()
  const level0 = useMotionValue(0)
  const level1 = useMotionValue(0)
  const level2 = useMotionValue(0)

  useEffect(() => {
    const slots = [level0, level1, level2]
    if (reduceMotion) {
      for (const s of slots) s.set(2)
      return
    }

    // Track the current frame index for each slot.
    // Advance all slots one step at a time with a fixed STEP_MS interval.
    const letterIdx = { current: 0 }
    const frameIdx = { current: 0 }
    let timer: ReturnType<typeof setTimeout> | null = null

    const applyFrame = (letter: Letter, frame: number, duration = STEP_MS) => {
      const frames = SEQUENCES[letter]
      const target = frames[frame] as Frame
      for (let i = 0; i < slots.length; i++) {
        animate(slots[i], target[i], {
          duration: duration / 1000,
          ease: 'easeOut',
        })
      }
    }

    const tick = () => {
      const letter = LETTERS[letterIdx.current]
      const frames = SEQUENCES[letter]
      const maxFrame = frames.length - 1

      if (frameIdx.current < maxFrame) {
        // Advance to next frame within the current letter.
        frameIdx.current++
        applyFrame(letter, frameIdx.current)
        timer = setTimeout(tick, STEP_MS)
      } else {
        // Letter complete - breathe, then reset and move to next letter.
        timer = setTimeout(() => {
          frameIdx.current = 0
          applyFrame(letter, 0)
          letterIdx.current = (letterIdx.current + 1) % LETTERS.length
          timer = setTimeout(tick, LETTER_BREATH_MS)
        }, LETTER_BREATH_MS)
      }
    }

    // Start immediately at the first frame of the first letter.
    applyFrame(LETTERS[0], 0)
    timer = setTimeout(tick, STEP_MS)

    return () => {
      if (timer !== null) clearTimeout(timer)
    }
  }, [reduceMotion, level0, level1, level2])

  return (
    <div
      role="img"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      aria-label={siteName}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: `${preset.gap}px`,
          marginLeft: '-6px',
        }}
      >
        <Highlight level={level0} preset={preset} />
        <Highlight level={level1} preset={preset} />
        <Highlight level={level2} preset={preset} />
      </div>
    </div>
  )
}
