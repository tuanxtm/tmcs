'use client'

import { useEffect, useEffectEvent, useState } from 'react'
import { motion } from 'motion/react'

import { cn } from '@/lib/utils'

interface ScrambleHoverProps {
  text: string
  scrambleSpeed?: number
  maxIterations?: number
  sequential?: boolean
  revealDirection?: 'start' | 'end' | 'center'
  useOriginalCharsOnly?: boolean
  characters?: string
  className?: string
  scrambledClassName?: string
}

type RevealDirection = 'start' | 'end' | 'center'

const ScrambleHover: React.FC<ScrambleHoverProps> = ({
  text,
  scrambleSpeed = 50,
  maxIterations = 10,
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className,
  scrambledClassName,
  sequential = false,
  revealDirection = 'start',
  ...props
}) => {
  const [isHovering, setIsHovering] = useState(false)
  const [scrambledText, setScrambledText] = useState(text)
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(() => new Set())
  const [iteration, setIteration] = useState(0)

  // Effect Event: compute one scramble step. Always reads the latest props via closure,
  // and all setState calls happen from inside the setInterval callback (an external
  // system callback) — never from a useEffect body.
  const tick = useEffectEvent((): boolean => {
    const textLength = text.length

    const getNextIndex = (currentSize: number): number => {
      switch (revealDirection as RevealDirection) {
        case 'end':
          return textLength - 1 - currentSize
        case 'center': {
          const middle = Math.floor(textLength / 2)
          const offset = Math.floor(currentSize / 2)
          const nextIndex =
            currentSize % 2 === 0 ? middle + offset : middle - offset - 1
          if (
            nextIndex >= 0 &&
            nextIndex < textLength &&
            !revealedIndices.has(nextIndex)
          ) {
            return nextIndex
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedIndices.has(i)) return i
          }
          return 0
        }
        case 'start':
        default:
          return currentSize
      }
    }

    const charPool = useOriginalCharsOnly
      ? Array.from(new Set(text.split('').filter((c) => c !== ' ')))
      : characters.split('')

    const shuffleText = (source: string, revealed: Set<number>): string => {
      if (useOriginalCharsOnly) {
        const positions = source.split('').map((char, i) => ({
          char,
          isSpace: char === ' ',
          index: i,
          isRevealed: revealed.has(i),
        }))
        const remainingChars = positions
          .filter((p) => !p.isSpace && !p.isRevealed)
          .map((p) => p.char)
        for (let i = remainingChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[remainingChars[i], remainingChars[j]] = [remainingChars[j], remainingChars[i]]
        }
        let charIndex = 0
        return positions
          .map((p) => {
            if (p.isSpace) return ' '
            if (p.isRevealed) return source[p.index]
            return remainingChars[charIndex++]
          })
          .join('')
      }
      return source
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' '
          if (revealed.has(i)) return source[i]
          return charPool[Math.floor(Math.random() * charPool.length)]
        })
        .join('')
    }

    if (sequential) {
      if (revealedIndices.size >= textLength) {
        setScrambledText(text)
        return true
      }
      const nextIndex = getNextIndex(revealedIndices.size)
      const nextRevealed = new Set(revealedIndices)
      nextRevealed.add(nextIndex)
      setRevealedIndices(nextRevealed)
      setScrambledText(shuffleText(text, nextRevealed))
      return nextRevealed.size >= textLength
    }

    setScrambledText(shuffleText(text, revealedIndices))
    const nextIteration = iteration + 1
    setIteration(nextIteration)
    if (nextIteration >= maxIterations) {
      setScrambledText(text)
      return true
    }
    return false
  })

  useEffect(() => {
    if (!isHovering) return

    const interval = setInterval(() => {
      if (tick()) clearInterval(interval)
    }, scrambleSpeed)

    return () => clearInterval(interval)
  }, [isHovering, scrambleSpeed])

  const displayText = isHovering ? scrambledText : text

  return (
    <motion.span
      onHoverStart={() => {
        setIteration(0)
        setIsHovering(true)
      }}
      onHoverEnd={() => {
        setRevealedIndices(new Set())
        setIsHovering(false)
      }}
      className={cn('inline-block whitespace-pre-wrap', className)}
      {...props}
    >
      <span className="sr-only">{displayText}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => (
          <span
            key={index}
            className={cn(
              revealedIndices.has(index) || !isHovering
                ? className
                : scrambledClassName,
            )}
          >
            {char}
          </span>
        ))}
      </span>
    </motion.span>
  )
}

export default ScrambleHover