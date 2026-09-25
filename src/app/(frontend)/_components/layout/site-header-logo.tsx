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
 * Site header logo rendered as 3 vertical bars that fill bottom-up
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

const SLOT_WIDTH_PX = 5
const UNIT_PX = 5

function Highlight({ level }: { level: MotionValue<number> }) {
  const scaleY = useTransform(level, (v) => v / 2)
  return (
    <span
      aria-hidden="true"
      className="bg-accent/15 block origin-bottom rotate-30 rounded-[0.5px]"
      style={{ width: SLOT_WIDTH_PX, height: UNIT_PX * 3 }}
    >
      <motion.span
        aria-hidden="true"
        className="bg-accent block h-full w-full origin-bottom rounded-[0.5px]"
        style={{ scaleY }}
      />
    </span>
  )
}

type SiteHeaderLogoProps = {
  siteName: string
}

export function SiteHeaderLogo({ siteName }: SiteHeaderLogoProps) {
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
        // Letter complete — breathe, then reset and move to next letter.
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
    <div role="img" className="flex items-center justify-center" aria-label={siteName}>
      <div className="relative flex items-center gap-0.75">
        <Highlight level={level0} />
        <Highlight level={level1} />
        <Highlight level={level2} />
      </div>
    </div>
  )
}
