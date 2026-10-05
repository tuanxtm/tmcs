// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'

import type { VideoCardView } from '@/app/(frontend)/_lib/types'

const { VideosSection } = await import('@/app/(frontend)/_components/videos/videos-section')

function video(
  id: number,
  provider: VideoCardView['provider'],
  publishedAt: string | null = '2026-01-01T00:00:00.000Z',
): VideoCardView {
  return {
    id,
    slug: null,
    title: `${provider}-${id}`,
    provider,
    sourceUrl: 'https://example.com/' + id,
    youtubeId: provider === 'youtube' ? 'abcdefghijk' : null,
    publishedAt,
    image: null,
  }
}

function baseProps(docs: VideoCardView[]) {
  return {
    sectionId: 'videos-section',
    headingId: 'videos-section-heading',
    heading: 'Videos',
    description: null,
    docs,
    locale: 'en' as const,
    cursorPopup: 'watch',
    cursorPopupEmpty: 'nothing here yet',
    cursorPopupViewAll: 'view all videos',
    showViewAll: true,
    viewAllLabel: 'View all videos',
    viewAllHref: '/videos',
  }
}

describe('VideosSection rendering', () => {
  beforeEach(() => {
    // jsdom has no ResizeObserver / IntersectionObserver.
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    })
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

  it('renders a centered section heading as an h2', () => {
    render(<VideosSection {...baseProps([video(1, 'youtube')])} />)
    const heading = screen.getByRole('heading', { level: 2, name: 'Videos' })
    expect(heading).toBeTruthy()
    expect(heading.id).toBe('videos-section-heading')
  })

  it('renders the optional description directly below the heading', () => {
    render(<VideosSection {...baseProps([video(1, 'youtube')])} description="Watch this" />)
    const description = screen.getByText('Watch this')
    expect(description.tagName.toLowerCase()).toBe('p')
    expect(description.textContent).toBe('Watch this')
  })

  it('hides empty provider rows and renders rows in the canonical order', () => {
    const docs = [
      video(1, 'youtube'),
      video(2, 'youtube'),
      video(3, 'instagram'),
      video(4, 'other'),
    ]
    render(<VideosSection {...baseProps(docs)} />)
    const providers = Array.from(document.querySelectorAll('[data-video-provider]')).map((node) =>
      node.getAttribute('data-video-provider'),
    )
    expect(providers).toEqual(['youtube', 'instagram', 'other'])
  })

  it('shows the empty message when no provider has any videos', () => {
    render(<VideosSection {...baseProps([])} />)
    expect(screen.getByText('No videos yet')).toBeTruthy()
    expect(document.querySelectorAll('[data-video-provider]')).toHaveLength(0)
  })

  it('renders arrow controls per provider row with accessible labels', () => {
    const docs = [video(1, 'youtube'), video(2, 'instagram')]
    render(<VideosSection {...baseProps(docs)} />)
    expect(screen.getByRole('button', { name: 'Previous YouTube videos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next YouTube videos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Previous Instagram videos' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Next Instagram videos' })).toBeTruthy()
  })

  it('renders each card as a YouTube button, Instagram external link, etc.', () => {
    const docs = [video(1, 'youtube'), video(2, 'instagram'), video(3, 'tiktok')]
    render(<VideosSection {...baseProps(docs)} />)
    // YouTube row: button is the row card itself.
    expect(screen.getAllByRole('button', { name: /youtube-1/ })).toHaveLength(1)
    // Non-YouTube rows render external <a target="_blank">.
    const instagramLink = document.querySelector(
      'a[href="https://example.com/2"][target="_blank"]',
    )
    expect(instagramLink).toBeTruthy()
    const tiktokLink = document.querySelector('a[href="https://example.com/3"][target="_blank"]')
    expect(tiktokLink).toBeTruthy()
  })

  it('omits the date when publishedAt is invalid or missing', () => {
    const docs = [video(1, 'youtube', 'not-a-date'), video(2, 'youtube', null)]
    render(<VideosSection {...baseProps(docs)} />)
    expect(document.querySelector('time')).toBeNull()
  })

  it('omits empty description markup when no description is provided', () => {
    const html = render(<VideosSection {...baseProps([video(1, 'youtube')])} />).container
      .firstElementChild?.innerHTML
    expect(html).not.toMatch(/<p[^>]*>\s*<\/p>/)
  })

  it('keeps section identity stable across snapshots with the same docs', () => {
    const docs = [video(1, 'youtube')]
    const { rerender } = render(<VideosSection {...baseProps(docs)} />)
    const firstSectionId = document.getElementById('videos-section')?.id
    rerender(<VideosSection {...baseProps([...docs])} />)
    expect(document.getElementById('videos-section')?.id).toBe(firstSectionId)
  })

  it('only mounts one YouTube iframe after activating a card', async () => {
    const docs = [
      video(1, 'youtube'),
      video(2, 'youtube'),
    ]
    render(<VideosSection {...baseProps(docs)} />)
    await act(async () => {
      screen.getByRole('button', { name: /youtube-1/ }).click()
    })
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
    await act(async () => {
      screen.getByRole('button', { name: /youtube-2/ }).click()
    })
    expect(document.querySelectorAll('iframe')).toHaveLength(1)
  })
})