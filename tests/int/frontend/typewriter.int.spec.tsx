import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'

import Typewriter from '@/components/ui/typewriter'

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms))
}

describe('Typewriter character timing', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('types the hand emoji after hi in one beat and completes once', () => {
    const onComplete = vi.fn()
    const { container, rerender } = render(
      <Typewriter
        text="hi 🖐️,"
        speed={60}
        loop={false}
        showCursor={false}
        onComplete={onComplete}
      />,
    )
    advance(0)
    for (const expected of ['h', 'hi', 'hi ', 'hi 🖐️', 'hi 🖐️,']) {
      advance(60)
      expect(container.textContent).toBe(expected)
    }
    expect(onComplete).toHaveBeenCalledTimes(1)
    rerender(
      <Typewriter
        text="hi 🖐️,"
        speed={60}
        loop={false}
        showCursor={false}
        onComplete={onComplete}
      />,
    )
    advance(1000)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('types and deletes whole accented characters and emoji when cycling', () => {
    const { container } = render(
      <Typewriter
        text={['a\u0301🖐️', 'b']}
        speed={60}
        deleteSpeed={30}
        waitTime={100}
        showCursor={false}
      />,
    )
    advance(0)
    advance(60)
    expect(container.textContent).toBe('a\u0301')
    advance(60)
    expect(container.textContent).toBe('a\u0301🖐️')
    advance(100)
    advance(30)
    expect(container.textContent).toBe('a\u0301')
    advance(30)
    expect(container.textContent).toBe('')
    advance(0)
    advance(60)
    expect(container.textContent).toBe('b')
  })
})
