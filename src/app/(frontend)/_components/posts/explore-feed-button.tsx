'use client'

import { useState } from 'react'
import { IconArrowDown } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

type ExploreFeedButtonProps = {
  onClick: () => void
}

export function ExploreFeedButton({ onClick }: ExploreFeedButtonProps) {
  const [hovered, setHovered] = useState(false)
  const reduceMotion = useReducedMotion()
  const showArrow = hovered && !reduceMotion

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative flex min-h-11 items-center gap-1 overflow-hidden px-1 font-mono text-xs font-bold uppercase text-secondary-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Explore posts"
    >
      <span
        className="relative inline-flex size-4 shrink-0 items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <AnimatePresence>
          {showArrow ? (
            <motion.span
              key="arrow"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ y: '-120%', opacity: 0 }}
              animate={{
                y: ['-120%', '0%', '0%', '120%'],
                opacity: [0.8, 1, 1, 0.8],
              }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{
                duration: 1.35,
                times: [0, 0.3, 0.7, 1],
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <IconArrowDown aria-hidden="true" className="size-4" stroke={2} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
      <span>Explore</span>
    </button>
  )
}
