// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { PostCardView } from '@/app/(frontend)/_lib/types'

let lastCarouselProps: Record<string, unknown> | null = null

vi.mock('@/components/ui/flex-carousel', async () => {
  const React = await import('react')
  function MockFlexCarousel(props: {
    items: { title?: string; src?: string; subtitle?: string }[]
    renderCaption?: (
      item: { title?: string; src?: string; subtitle?: string },
      index: number,
    ) => React.ReactNode
    onChange?: (i: number) => void
    captureWheel?: boolean
    className?: string
  }) {
    lastCarouselProps = props
    const [activeIndex, setActiveIndex] = React.useState(0)
    const activeItem = props.items[activeIndex]
    return (
      <div
        data-testid="flex-carousel-stub"
        data-item-count={props.items.length}
        data-active-index={activeIndex}
        className={props.className}
      >
        {props.items.map((item, i) => (
          <div
            key={i}
            data-carousel-item-index={i}
            data-carousel-item-title={item.title ?? ''}
            data-carousel-item-src={item.src ?? ''}
            data-carousel-item-subtitle={item.subtitle ?? ''}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            const next = (activeIndex + 1) % props.items.length
            setActiveIndex(next)
            props.onChange?.(next)
          }}
        >
          Next item
        </button>
        <div data-testid="active-caption">
          {activeItem && props.renderCaption?.(activeItem, activeIndex)}
        </div>
      </div>
    )
  }

  return {
    default: MockFlexCarousel,
  }
})

const { PostsCarousel } = await import('@/app/(frontend)/_components/posts/posts-carousel')

function post(overrides: Partial<PostCardView> & { id: number }): PostCardView {
  const slug = overrides.slug ?? `post-${overrides.id}`
  const title = overrides.title ?? `Post ${overrides.id}`
  const href = overrides.href === undefined ? `/post-${overrides.id}` : overrides.href
  const publishedAt =
    overrides.publishedAt === undefined ? '2026-01-01T00:00:00.000Z' : overrides.publishedAt
  return {
    id: overrides.id,
    slug,
    title,
    href,
    publishedAt,
    image: overrides.image ?? null,
  }
}

const NEUTRAL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='

describe('PostsCarousel adapter', () => {
  beforeEach(() => {
    lastCarouselProps = null
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('maps every post to one carousel item', async () => {
    const docs = [
      post({
        id: 1,
        title: 'Portrait',
        href: '/portrait',
        image: {
          id: 1,
          url: '/portrait.png',
          alt: 'Portrait alt',
          width: 600,
          height: 800,
          dominantColor: null,
        },
        publishedAt: '2026-01-02T00:00:00.000Z',
      }),
      post({
        id: 2,
        title: 'Square',
        href: null,
        image: {
          id: 2,
          url: '/square.png',
          alt: 'Square alt',
          width: 800,
          height: 800,
          dominantColor: null,
        },
        publishedAt: '2026-01-03T00:00:00.000Z',
      }),
      post({
        id: 3,
        title: 'No image',
        href: '/no-image',
        image: null,
        publishedAt: null,
      }),
    ]
    render(<PostsCarousel docs={docs} locale="en" />)
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    const items = Array.from(document.querySelectorAll('[data-carousel-item-index]'))
    expect(items.map((node) => node.getAttribute('data-carousel-item-title'))).toEqual([
      'Portrait',
      'Square',
      'No image',
    ])
    expect(items[0].getAttribute('data-carousel-item-src')).toBe('/portrait.png')
    expect(items[0].getAttribute('data-carousel-item-subtitle')).toBe('01/02/26')
  })

  it('renders the active post metadata and native link in the carousel caption', async () => {
    render(
      <PostsCarousel
        docs={[
          post({
            id: 1,
            title: 'Portrait',
            href: '/portrait',
            publishedAt: '2026-01-02T00:00:00.000Z',
          }),
          post({
            id: 2,
            title: 'Square',
            href: '/square',
            publishedAt: '2026-01-03T00:00:00.000Z',
          }),
          post({ id: 3, title: 'No link or date', href: null, publishedAt: null }),
        ]}
        locale="en"
      />,
    )
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    expect(screen.getByText('Portrait')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open post: Portrait' }).getAttribute('href')).toBe(
      '/portrait',
    )
    expect(screen.getByText('01/02/26').tagName.toLowerCase()).toBe('time')
    expect(screen.getAllByRole('link', { name: /^Open post:/ })).toHaveLength(1)
    expect(screen.getByTestId('flex-carousel-stub').className).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Next item' }))
    expect(screen.getByText('Square')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open post: Square' }).getAttribute('href')).toBe(
      '/square',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next item' }))
    expect(screen.getByText('No link or date')).toBeTruthy()
    expect(screen.queryByRole('link', { name: /^Open post:/ })).toBeNull()
    expect(screen.queryByText(/^01\/|^01\/03/)).toBeNull()
  })

  it('opts out of wheel capture while preserving the carousel defaults', async () => {
    render(<PostsCarousel docs={[post({ id: 1 })]} locale="en" />)
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    expect(lastCarouselProps?.captureWheel).toBe(false)
    expect(lastCarouselProps?.className).toBeTruthy()
    expect(lastCarouselProps?.renderCaption).toEqual(expect.any(Function))
    expect(lastCarouselProps?.focusOnClick).toBeUndefined()
    expect(lastCarouselProps?.autoplay).toBeUndefined()
    expect(lastCarouselProps?.preset).toBeUndefined()
    expect(lastCarouselProps?.items).toEqual([
      expect.objectContaining({ title: 'Post 1', subtitle: '01/01/26' }),
    ])
  })

  it('falls back to a neutral raster when media is missing', async () => {
    render(<PostsCarousel docs={[post({ id: 1, image: null })]} locale="en" />)
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    expect(
      document
        .querySelector('[data-carousel-item-index="0"]')
        ?.getAttribute('data-carousel-item-src'),
    ).toBe(NEUTRAL)
  })

  it('keeps distinct items even when image URLs repeat for different ids', async () => {
    const _sharedImage = {
      id: 99,
      url: '/shared.png',
      alt: 'shared',
      width: 600,
      height: 400,
      dominantColor: null,
    }
    render(
      <PostsCarousel
        docs={[post({ id: 1, image: _sharedImage }), post({ id: 2, image: _sharedImage })]}
        locale="en"
      />,
    )
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    const items = document.querySelectorAll('[data-carousel-item-index]')
    expect(items.length).toBe(2)
  })

  it('drops duplicate ids but keeps the first occurrence', async () => {
    render(
      <PostsCarousel
        docs={[post({ id: 1, title: 'One' }), post({ id: 1, title: 'One duplicate' })]}
        locale="en"
      />,
    )
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    const items = Array.from(document.querySelectorAll('[data-carousel-item-index]'))
    expect(items.length).toBe(1)
    expect(items[0].getAttribute('data-carousel-item-title')).toBe('One')
  })

  it('omits subtitle when publishedAt is null or invalid', async () => {
    render(
      <PostsCarousel
        docs={[post({ id: 1, publishedAt: null }), post({ id: 2, publishedAt: 'not-a-date' })]}
        locale="en"
      />,
    )
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    const items = document.querySelectorAll('[data-carousel-item-index]')
    expect(items[0].getAttribute('data-carousel-item-subtitle')).toBe('')
    expect(items[1].getAttribute('data-carousel-item-subtitle')).toBe('')
  })

  it('renders nothing for an empty docs array (does not mount carousel)', () => {
    const { container } = render(<PostsCarousel docs={[]} locale="en" />)
    expect(screen.queryByTestId('flex-carousel-stub')).toBeNull()
    expect(container.firstChild).toBeNull()
  })

  it('refreshes caption and link when same image src is rerendered with new metadata', async () => {
    const first = [post({ id: 1, title: 'Old title', href: '/old' })]
    const second = [post({ id: 1, title: 'New title', href: '/new' })]
    const { rerender } = render(<PostsCarousel docs={first} locale="en" />)
    await waitFor(() => expect(screen.getByTestId('flex-carousel-stub')).toBeTruthy())
    // After the new render the active link should reflect the new href/title.
    rerender(<PostsCarousel docs={second} locale="en" />)
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Open post: New title' })).toBeTruthy(),
    )
    expect(screen.getByRole('link', { name: 'Open post: New title' }).getAttribute('href')).toBe(
      '/new',
    )
  })
})
