// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'

import canvasStyles from '@/app/(frontend)/_components/canvas/canvas.module.css'

import type {
  PostCardView,
  PostsPageView,
  ProjectCardView,
  VideoCardView,
} from '@/app/(frontend)/_lib/types'

const loadFeedPage = vi.fn()

vi.mock('@/app/(frontend)/_lib/actions', () => ({
  loadFeedPage: (...args: unknown[]) => loadFeedPage(...args),
}))

// Keep section pagination tests isolated from the WebGL-backed adapter.
vi.mock('@/app/(frontend)/_components/posts/posts-carousel', () => ({
  PostsCarousel: ({ docs }: { docs: { id: number; title: string }[] }) => (
    <div data-testid="posts-carousel-stub" role="region" aria-roledescription="carousel">
      {docs.map((doc, index) => (
        <div
          key={`${doc.id}-${index}`}
          data-carousel-item-index={index}
          data-post-id={doc.id}
          data-carousel-item-title={doc.title}
        />
      ))}
    </div>
  ),
}))

const { FeedSection } = await import('@/app/(frontend)/_components/feed/feed-section')

function post(id: number, overrides: Partial<PostCardView> = {}): PostCardView {
  return {
    id,
    slug: `post-${id}`,
    title: `Post ${id}`,
    href: `/posts/post-${id}`,
    publishedAt: '2026-01-01T00:00:00.000Z',
    image: null,
    ...overrides,
  }
}

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

function video(id: number): VideoCardView {
  return {
    id,
    slug: `video-${id}`,
    title: `Video ${id}`,
    provider: 'youtube',
    sourceUrl: `https://youtube.com/watch?v=${id}`,
    youtubeId: 'abcdefghijk',
    publishedAt: '2026-01-01T00:00:00.000Z',
    image: null,
  }
}

function page(ids: number[], nextCursor: string | null, hasNextPage: boolean): PostsPageView {
  return { docs: ids.map((id) => post(id)), nextCursor, hasNextPage }
}

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

function basePostsProps(
  docs: PostCardView[],
  extras: Partial<{
    pagination: 'static' | 'infinite'
    nextCursor: string | null
    hasNextPage: boolean
    showViewAll: boolean
    viewAllLabel: string | null
    viewAllHref: string | null
    locale: 'en' | 'vi'
    heading: string
    description: string | null
  }> = {},
) {
  return {
    locale: extras.locale ?? ('en' as const),
    sectionId: 'posts-section',
    headingId: 'posts-section-heading',
    heading: extras.heading ?? 'Posts',
    description: extras.description ?? null,
    cursorPopup: 'view posts',
    cursorPopupEmpty: 'empty posts',
    cursorPopupItem: 'view details',
    cursorPopupViewAll: 'view all posts',
    pagination: extras.pagination ?? 'static',
    nextCursor: extras.nextCursor ?? null,
    hasNextPage: extras.hasNextPage ?? false,
    showViewAll: extras.showViewAll ?? false,
    viewAllLabel: extras.viewAllLabel ?? null,
    viewAllHref: extras.viewAllHref ?? null,
    feedType: 'posts' as const,
    docs,
  }
}

describe('FeedSection Posts branch', () => {
  beforeEach(() => {
    loadFeedPage.mockReset()
    observers.length = 0
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)
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

  it('renders the h2 with the Projects heading class', () => {
    render(<FeedSection {...basePostsProps([post(1), post(2)])} />)
    const heading = screen.getByRole('heading', { level: 2, name: 'Posts' })
    expect(heading).toBeTruthy()
    expect(heading.classList.contains(canvasStyles.heading)).toBe(true)
  })

  it('shows the empty status without mounting the carousel', () => {
    render(<FeedSection {...basePostsProps([])} />)
    expect(screen.getByRole('status').textContent).toBe('No posts yet')
    // No viewport (which only PostsCarousel renders).
    expect(document.querySelector('[role="region"][aria-roledescription="carousel"]')).toBeNull()
  })

  it('renders the description when provided', () => {
    render(<FeedSection {...basePostsProps([post(1)], { description: 'Latest writing' })} />)
    const description = screen.getByText('Latest writing')
    expect(description.tagName.toLowerCase()).toBe('p')
  })

  it('keeps static mode inert (no loadFeedPage calls)', async () => {
    render(<FeedSection {...basePostsProps([post(1), post(2)])} />)
    await act(async () => {
      triggerIntersection()
    })
    expect(loadFeedPage).not.toHaveBeenCalled()
  })

  it('requests the current cursor when infinite sentinel intersects', async () => {
    loadFeedPage.mockResolvedValue(page([3], 'cursor-2', false))
    render(
      <FeedSection
        {...basePostsProps([post(1), post(2)], {
          pagination: 'infinite',
          nextCursor: 'cursor-1',
          hasNextPage: true,
        })}
      />,
    )
    await act(async () => {
      triggerIntersection()
    })
    await waitFor(() => expect(loadFeedPage).toHaveBeenCalledWith('posts', 'en', 'cursor-1'))
  })

  it('produces one request for repeated intersections during a request', async () => {
    let resolve!: (value: PostsPageView) => void
    loadFeedPage.mockReturnValue(
      new Promise<PostsPageView>((r) => {
        resolve = r
      }),
    )
    render(
      <FeedSection
        {...basePostsProps([post(1)], {
          pagination: 'infinite',
          nextCursor: 'cursor-1',
          hasNextPage: true,
        })}
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

  it('deduplicates repeated ids in the same response', async () => {
    loadFeedPage.mockResolvedValue(page([2, 2, 3], null, false))
    render(
      <FeedSection
        {...basePostsProps([post(1), post(2)], {
          pagination: 'infinite',
          nextCursor: 'cursor-1',
          hasNextPage: true,
        })}
      />,
    )
    await act(async () => {
      triggerIntersection()
    })
    // The initial docs (1, 2) plus unique appended docs (2, 3) become (1, 2, 3).
    await waitFor(() => {
      const carouselItems = [...document.querySelectorAll('[data-carousel-item-title]')]
      expect(
        carouselItems.map((item) => [
          item.getAttribute('data-post-id'),
          item.getAttribute('data-carousel-item-title'),
        ]),
      ).toEqual([
        ['1', 'Post 1'],
        ['2', 'Post 2'],
        ['3', 'Post 3'],
      ])
    })
  })

  it('preserves documents and cursor on failure and allows retry', async () => {
    loadFeedPage
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(page([3], null, false))
    render(
      <FeedSection
        {...basePostsProps([post(1), post(2)], {
          pagination: 'infinite',
          nextCursor: 'cursor-1',
          hasNextPage: true,
        })}
      />,
    )
    await act(async () => {
      triggerIntersection()
    })
    await waitFor(() => expect(screen.getByText(/could not load more/i)).toBeTruthy())
    // Note: a single automatic retry can be triggered by the observer if the
    // sentinel is still in view. Either way the original cursor must be
    // retained and the retry must succeed.
    const retry = screen.getByText('Try again')
    await act(async () => {
      retry.click()
    })
    await waitFor(() => expect(loadFeedPage).toHaveBeenLastCalledWith('posts', 'en', 'cursor-1'))
  })

  it('hides the View all link when showViewAll is false or href/label are missing', () => {
    const { rerender } = render(<FeedSection {...basePostsProps([post(1)])} />)
    // The inline caption link is present; only the separate View all link is absent.
    expect(screen.queryByText(/^view all$/i)).toBeNull()
    rerender(
      <FeedSection
        {...basePostsProps([post(1)], {
          showViewAll: true,
          viewAllHref: null,
          viewAllLabel: 'view all',
        })}
      />,
    )
    expect(screen.queryByText(/^view all$/i)).toBeNull()
    rerender(
      <FeedSection
        {...basePostsProps([post(1)], {
          showViewAll: true,
          viewAllHref: '/posts',
          viewAllLabel: 'view all',
        })}
      />,
    )
    const link = screen.getByText('view all').closest('a')
    expect(link?.getAttribute('href')).toBe('/posts')
    expect(link?.classList.contains(canvasStyles.viewAllLink)).toBe(true)
    expect(link?.classList.contains('site-cell-hover')).toBe(true)
    const footer = link?.parentElement
    expect(footer?.classList.contains(canvasStyles.viewAll)).toBe(true)
    const scales = footer?.querySelector(
      `.${canvasStyles.viewAllScales} > div`,
    ) as HTMLElement | null
    expect(scales?.style.getPropertyValue('--scales-size')).toBe('10px')
    expect(scales?.style.getPropertyValue('--scales-angle')).toBe('315deg')
    expect(link?.querySelector('svg')).toBeTruthy()
  })

  it('falls back to the en label for vi when vi label is missing', () => {
    render(
      <FeedSection
        {...({
          ...basePostsProps([post(1)], {
            locale: 'vi',
            showViewAll: true,
            viewAllHref: '/posts',
          }),
          viewAllLabel: { en: 'view all' } as Record<'en' | 'vi', string>,
        } as unknown as Parameters<typeof FeedSection>[0])}
      />,
    )
    const link = document.querySelector('a[href="/posts"]')
    expect(link?.textContent).toBe('view all')
  })

  it('keeps the section id and aria-labelledby stable across renders', () => {
    const docs = [post(1), post(2)]
    const { rerender } = render(<FeedSection {...basePostsProps(docs)} />)
    const firstSectionId = document.getElementById('posts-section')?.id
    const firstHeadingId = screen.getByRole('heading', { level: 2 }).id
    rerender(<FeedSection {...basePostsProps(docs)} />)
    expect(document.getElementById('posts-section')?.id).toBe(firstSectionId)
    expect(screen.getByRole('heading', { level: 2 }).id).toBe(firstHeadingId)
  })

  it('passes the initial post list to the carousel branch', () => {
    render(<FeedSection {...basePostsProps([post(1), post(2)])} />)
    expect(
      [...document.querySelectorAll('[data-carousel-item-title]')].map((item) =>
        item.getAttribute('data-carousel-item-title'),
      ),
    ).toEqual(['Post 1', 'Post 2'])
  })

  it('keeps videos feed shared rendering (smoke check)', () => {
    const videos: VideoCardView[] = [video(1), video(2)]
    render(
      <FeedSection
        {...({
          ...basePostsProps([]),
          feedType: 'videos',
          docs: videos,
        } as unknown as Parameters<typeof FeedSection>[0])}
      />,
    )
    // Videos branch keeps the grid markup (no carousel).
    const gridItems = document.querySelectorAll('[data-feed-grid-item]')
    expect(gridItems.length).toBe(2)
  })

  it('keeps projects feed shared rendering (smoke check)', () => {
    const projects: ProjectCardView[] = [project(1), project(2)]
    render(
      <FeedSection
        {...({
          ...basePostsProps([]),
          feedType: 'projects',
          docs: projects,
        } as unknown as Parameters<typeof FeedSection>[0])}
      />,
    )
    const gridItems = document.querySelectorAll('[data-feed-grid-item]')
    expect(gridItems.length).toBe(2)
  })

  it('preserves the post section before hydration (heading + status present in SSR)', () => {
    const html = renderToString(<FeedSection {...basePostsProps([])} />)
    expect(html).toContain('posts-section-heading')
    expect(html).toContain('No posts yet')
  })
})
