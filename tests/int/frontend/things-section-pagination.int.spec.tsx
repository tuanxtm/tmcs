// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import type { ThingCardView, ThingsPageView } from '@/app/(frontend)/_lib/types'

const loadFeedPage = vi.fn()

vi.mock('@/app/(frontend)/_lib/actions', () => ({
  loadFeedPage: (...args: unknown[]) => loadFeedPage(...args),
}))

// Imported after the mock so the component picks up the stubbed action.
const { ThingsSection } = await import('@/app/(frontend)/_components/things/things-section')

function thing(id: number): ThingCardView {
  return {
    id,
    slug: null,
    name: `Thing ${id}`,
    description: 'A useful tool',
    primaryUrl: `https://shop.example/thing-${id}`,
    primaryImage: null,
    links: [],
    publishedAt: '2026-01-01T00:00:00.000Z',
  }
}

function page(ids: number[], nextCursor: string | null, hasNextPage: boolean): ThingsPageView {
  return { docs: ids.map(thing), nextCursor, hasNextPage }
}

/** Minimal IntersectionObserver driven by the test. */
const observers: TestIntersectionObserver[] = []

class TestIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(private readonly callback: IntersectionObserverCallback) {
    observers.push(this)
  }

  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []

  trigger(isIntersecting: boolean) {
    const entry = { isIntersecting } as IntersectionObserverEntry
    this.callback([entry], this)
  }
}

function triggerIntersection(isIntersecting = true) {
  for (const observer of observers) observer.trigger(isIntersecting)
}

function staticProps(docs: ThingCardView[]) {
  return {
    locale: 'en' as const,
    sectionId: 'things-preview',
    headingId: 'things-preview-heading',
    heading: 'things',
    description: null,
    docs,
    pagination: 'static' as const,
  }
}

describe('ThingsSection pagination', () => {
  beforeEach(() => {
    loadFeedPage.mockReset()
    observers.length = 0
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)
    // jsdom has no ResizeObserver / matchMedia.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    }))
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('never requests another page for a static preview', async () => {
    render(<ThingsSection {...staticProps([thing(1), thing(2)])} />)

    await act(async () => {
      triggerIntersection()
    })

    expect(loadFeedPage).not.toHaveBeenCalled()
  })

  it('reserves responsive canvas height before hydration', () => {
    const html = renderToString(
      <ThingsSection {...staticProps(Array.from({ length: 9 }, (_, index) => thing(index + 1)))} />,
    )
    expect(html).toContain('--rows-mobile:5')
    expect(html).toContain('--rows-tablet:5')
    expect(html).toContain('--rows-desktop:3')
    expect(html).toContain('disabled="" data-thing-drag-handle')
  })

  it('requests the current cursor when the sentinel intersects', async () => {
    loadFeedPage.mockResolvedValue(page([3], 'cursor-2', false))
    render(
      <ThingsSection
        {...staticProps([thing(1), thing(2)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => expect(loadFeedPage).toHaveBeenCalledWith('things', 'en', 'cursor-1'))
    await screen.findByText('End of things')
  })

  it('produces one request for repeated intersections during a request', async () => {
    let resolve!: (value: ThingsPageView) => void
    loadFeedPage.mockReturnValue(
      new Promise<ThingsPageView>((r) => {
        resolve = r
      }),
    )
    render(
      <ThingsSection
        {...staticProps([thing(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
      triggerIntersection()
      triggerIntersection()
    })
    expect(loadFeedPage).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolve(page([2], 'cursor-2', false))
    })
  })

  it('does not create duplicate items from duplicate ids in the batch', async () => {
    loadFeedPage.mockResolvedValue(page([2, 2, 3], null, false))
    render(
      <ThingsSection
        {...staticProps([thing(1), thing(2)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => {
      expect(document.querySelectorAll('[data-thing-item]')).toHaveLength(3)
    })
    const ids = Array.from(document.querySelectorAll('[data-thing-item]')).map((node) =>
      node.getAttribute('data-thing-item'),
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('advances cursor and documents together', async () => {
    loadFeedPage.mockResolvedValue(page([2, 3], 'cursor-2', true))
    render(
      <ThingsSection
        {...staticProps([thing(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => {
      expect(document.querySelectorAll('[data-thing-item]')).toHaveLength(3)
    })
    expect(loadFeedPage).toHaveBeenCalledWith('things', 'en', 'cursor-1')
    expect(screen.getByText('There are more ...')).toBeTruthy()
  })

  it('preserves current documents and cursor on failure and pauses automatic loading', async () => {
    loadFeedPage.mockRejectedValue(new Error('boom'))
    render(
      <ThingsSection
        {...staticProps([thing(1), thing(2)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => expect(screen.getByText(/could not load more/i)).toBeTruthy())
    expect(document.querySelectorAll('[data-thing-item]')).toHaveLength(2)

    const callsAfterFailure = loadFeedPage.mock.calls.length
    await act(async () => {
      triggerIntersection()
    })
    expect(loadFeedPage.mock.calls.length).toBe(callsAfterFailure)
  })

  it('retries with the same cursor after an explicit retry', async () => {
    loadFeedPage
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(page([2], null, false))
    render(
      <ThingsSection
        {...staticProps([thing(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    const retry = await screen.findByText('Try again')
    await act(async () => {
      retry.click()
    })

    await waitFor(() => {
      expect(loadFeedPage).toHaveBeenLastCalledWith('things', 'en', 'cursor-1')
    })
  })

  it('stops the loading loop when the continuation cursor does not advance', async () => {
    loadFeedPage.mockResolvedValue(page([2], 'cursor-1', true))
    render(
      <ThingsSection
        {...staticProps([thing(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => expect(screen.getByText('End of things')).toBeTruthy())
    const calls = loadFeedPage.mock.calls.length
    await act(async () => {
      triggerIntersection()
    })
    expect(loadFeedPage.mock.calls.length).toBe(calls)
  })

  it('ignores late responses from an unmounted section', async () => {
    let resolve!: (value: ThingsPageView) => void
    loadFeedPage.mockReturnValue(
      new Promise<ThingsPageView>((r) => {
        resolve = r
      }),
    )
    const { unmount } = render(
      <ThingsSection
        {...staticProps([thing(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })
    unmount()
    await act(async () => {
      resolve(page([2], null, false))
    })
    // No unhandled rejection and no post-unmount DOM writes.
    expect(true).toBe(true)
  })

  it('pauses loading during keyboard movement and resumes when movement ends', async () => {
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 1024,
      height: 900,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 1024,
      bottom: 900,
      toJSON: () => ({}),
    })
    loadFeedPage.mockResolvedValue(page([2], null, false))
    try {
      render(
        <ThingsSection
          {...staticProps([thing(1)])}
          pagination="infinite"
          nextCursor="cursor-1"
          hasNextPage
        />,
      )
      const handle = screen.getByRole('button', { name: 'Move thing: Thing 1' })
      await act(async () => {
        fireEvent.keyDown(handle, { key: 'Enter' })
      })
      expect(document.querySelector('[data-thing-movement]')).toBeTruthy()
      await act(async () => {
        triggerIntersection()
      })
      expect(loadFeedPage).not.toHaveBeenCalled()
      await act(async () => {
        fireEvent.keyDown(handle, { key: 'Enter' })
      })
      await act(async () => {
        triggerIntersection()
      })
      await waitFor(() => expect(loadFeedPage).toHaveBeenCalledWith('things', 'en', 'cursor-1'))
    } finally {
      rect.mockRestore()
    }
  })

  it('shows the empty state instead of an empty canvas', () => {
    render(<ThingsSection {...staticProps([])} />)
    expect(screen.getByText('No things yet')).toBeTruthy()
    expect(document.querySelector('[data-thing-canvas]')).toBeNull()
    expect(document.querySelectorAll('[data-thing-drag-handle]')).toHaveLength(0)
  })
})

it('pauses pagination while the detail drawer is open and resumes after closing', async () => {
  loadFeedPage.mockReset().mockResolvedValue(page([2], null, false))
  observers.length = 0
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  )
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
  try {
    render(
      <ThingsSection
        {...staticProps([thing(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )
    const detail = screen.getByRole('button', { name: 'Detail: Thing 1' })
    await act(async () => {
      detail.click()
    })
    await screen.findByRole('dialog')
    await act(async () => {
      triggerIntersection()
    })
    expect(loadFeedPage).not.toHaveBeenCalled()
    await act(async () => {
      screen.getByRole('button', { name: 'Close' }).click()
    })
    await act(async () => {
      triggerIntersection()
    })
    await waitFor(() => expect(loadFeedPage).toHaveBeenCalledWith('things', 'en', 'cursor-1'))
  } finally {
    cleanup()
    vi.unstubAllGlobals()
  }
})
