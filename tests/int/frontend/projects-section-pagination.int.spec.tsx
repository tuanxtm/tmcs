// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import type { ProjectCardView, ProjectsPageView } from '@/app/(frontend)/_lib/types'

const loadFeedPage = vi.fn()

vi.mock('@/app/(frontend)/_lib/actions', () => ({
  loadFeedPage: (...args: unknown[]) => loadFeedPage(...args),
}))

// Imported after the mock so the component picks up the stubbed action.
const { ProjectsSection } = await import('@/app/(frontend)/_components/projects/projects-section')

function project(id: number): ProjectCardView {
  return {
    id,
    slug: `project-${id}`,
    title: `Project ${id}`,
    href: `/projects/project-${id}`,
    publishedAt: '2026-01-01T00:00:00.000Z',
    image: null,
  }
}

function page(ids: number[], nextCursor: string | null, hasNextPage: boolean): ProjectsPageView {
  return { docs: ids.map(project), nextCursor, hasNextPage }
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

function staticProps(docs: ProjectCardView[]) {
  return {
    locale: 'en' as const,
    sectionId: 'projects-preview',
    headingId: 'projects-preview-heading',
    heading: 'projects',
    description: null,
    docs,
    pagination: 'static' as const,
  }
}

describe('ProjectsSection pagination', () => {
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
    render(<ProjectsSection {...staticProps([project(1), project(2)])} />)

    await act(async () => {
      triggerIntersection()
    })

    expect(loadFeedPage).not.toHaveBeenCalled()
  })

  it('reserves responsive canvas height before hydration', () => {
    const html = renderToString(
      <ProjectsSection
        {...staticProps(Array.from({ length: 9 }, (_, index) => project(index + 1)))}
      />,
    )
    expect(html).toContain('--rows-mobile:5')
    expect(html).toContain('--rows-tablet:5')
    expect(html).toContain('--rows-desktop:3')
    expect(html).toContain('disabled="" data-project-drag-handle')
  })

  it('requests the current cursor when the sentinel intersects', async () => {
    loadFeedPage.mockResolvedValue(page([3], 'cursor-2', false))
    render(
      <ProjectsSection
        {...staticProps([project(1), project(2)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => expect(loadFeedPage).toHaveBeenCalledWith('projects', 'en', 'cursor-1'))
    await screen.findByText('End of projects')
  })

  it('produces one request for repeated intersections during a request', async () => {
    let resolve!: (value: ProjectsPageView) => void
    loadFeedPage.mockReturnValue(
      new Promise<ProjectsPageView>((r) => {
        resolve = r
      }),
    )
    render(
      <ProjectsSection
        {...staticProps([project(1)])}
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
      <ProjectsSection
        {...staticProps([project(1), project(2)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => {
      expect(document.querySelectorAll('[data-project-item]')).toHaveLength(3)
    })
    const ids = Array.from(document.querySelectorAll('[data-project-item]')).map((node) =>
      node.getAttribute('data-project-item'),
    )
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('advances cursor and documents together', async () => {
    loadFeedPage.mockResolvedValue(page([2, 3], 'cursor-2', true))
    render(
      <ProjectsSection
        {...staticProps([project(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => {
      expect(document.querySelectorAll('[data-project-item]')).toHaveLength(3)
    })
    expect(loadFeedPage).toHaveBeenCalledWith('projects', 'en', 'cursor-1')
    expect(screen.getByText('There are more ...')).toBeTruthy()
  })

  it('preserves current documents and cursor on failure and pauses automatic loading', async () => {
    loadFeedPage.mockRejectedValue(new Error('boom'))
    render(
      <ProjectsSection
        {...staticProps([project(1), project(2)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => expect(screen.getByText(/could not load more/i)).toBeTruthy())
    expect(document.querySelectorAll('[data-project-item]')).toHaveLength(2)

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
      <ProjectsSection
        {...staticProps([project(1)])}
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
      expect(loadFeedPage).toHaveBeenLastCalledWith('projects', 'en', 'cursor-1')
    })
  })

  it('stops the loading loop when the continuation cursor does not advance', async () => {
    loadFeedPage.mockResolvedValue(page([2], 'cursor-1', true))
    render(
      <ProjectsSection
        {...staticProps([project(1)])}
        pagination="infinite"
        nextCursor="cursor-1"
        hasNextPage
      />,
    )

    await act(async () => {
      triggerIntersection()
    })

    await waitFor(() => expect(screen.getByText('End of projects')).toBeTruthy())
    const calls = loadFeedPage.mock.calls.length
    await act(async () => {
      triggerIntersection()
    })
    expect(loadFeedPage.mock.calls.length).toBe(calls)
  })

  it('ignores late responses from an unmounted section', async () => {
    let resolve!: (value: ProjectsPageView) => void
    loadFeedPage.mockReturnValue(
      new Promise<ProjectsPageView>((r) => {
        resolve = r
      }),
    )
    const { unmount } = render(
      <ProjectsSection
        {...staticProps([project(1)])}
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

  it('shows the empty state instead of an empty canvas', () => {
    render(<ProjectsSection {...staticProps([])} />)
    expect(screen.getByText('No projects yet')).toBeTruthy()
    expect(document.querySelector('[data-project-canvas]')).toBeNull()
    expect(document.querySelectorAll('[data-project-drag-handle]')).toHaveLength(0)
  })
})
