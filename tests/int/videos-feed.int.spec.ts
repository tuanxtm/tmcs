import { describe, expect, it } from 'vitest'

import {
  groupVideosByProvider,
  normalizeVideoProviderLimit,
  VIDEOS_PROVIDER_LABEL,
  VIDEOS_PROVIDER_LIMIT,
  VIDEOS_PROVIDER_ORDER,
} from '@/app/(frontend)/_lib/videos-feed'
import type { VideoCardView } from '@/app/(frontend)/_lib/types'

function video(id: number, provider: VideoCardView['provider']): VideoCardView {
  return {
    id,
    slug: null,
    title: `${provider}-${id}`,
    provider,
    sourceUrl: 'https://example.com/' + id,
    youtubeId: provider === 'youtube' ? 'abcdefghijk' : null,
    publishedAt: '2026-01-01T00:00:00.000Z',
    image: null,
  }
}

describe('videos-feed provider constants', () => {
  it('lists providers in the canonical order', () => {
    expect(VIDEOS_PROVIDER_ORDER).toEqual(['youtube', 'instagram', 'tiktok', 'other'])
  })

  it('ships a label per provider', () => {
    expect(VIDEOS_PROVIDER_LABEL.youtube).toBe('YouTube')
    expect(VIDEOS_PROVIDER_LABEL.instagram).toBe('Instagram')
    expect(VIDEOS_PROVIDER_LABEL.tiktok).toBe('TikTok')
    expect(VIDEOS_PROVIDER_LABEL.other).toBe('Other')
  })
})

describe('normalizeVideoProviderLimit', () => {
  it('defaults to the hard cap for missing or non-finite values', () => {
    expect(normalizeVideoProviderLimit(undefined)).toBe(VIDEOS_PROVIDER_LIMIT)
    expect(normalizeVideoProviderLimit(null)).toBe(VIDEOS_PROVIDER_LIMIT)
    expect(normalizeVideoProviderLimit(Number.NaN)).toBe(VIDEOS_PROVIDER_LIMIT)
    expect(normalizeVideoProviderLimit(Number.POSITIVE_INFINITY)).toBe(VIDEOS_PROVIDER_LIMIT)
  })

  it('clamps values below 1 up to 1', () => {
    expect(normalizeVideoProviderLimit(0)).toBe(1)
    expect(normalizeVideoProviderLimit(-3)).toBe(1)
  })

  it('floors fractional values before clamping', () => {
    expect(normalizeVideoProviderLimit(3.9)).toBe(3)
  })

  it('returns the saved value inside [1, 10]', () => {
    expect(normalizeVideoProviderLimit(1)).toBe(1)
    expect(normalizeVideoProviderLimit(4)).toBe(4)
    expect(normalizeVideoProviderLimit(10)).toBe(10)
  })

  it('clamps values above 10 down to 10', () => {
    expect(normalizeVideoProviderLimit(11)).toBe(10)
    expect(normalizeVideoProviderLimit(48)).toBe(10)
  })
})

describe('groupVideosByProvider', () => {
  it('preserves incoming order within each provider', () => {
    const cards = [
      video(1, 'youtube'),
      video(2, 'youtube'),
      video(3, 'instagram'),
      video(4, 'tiktok'),
      video(5, 'youtube'),
    ]
    const grouped = groupVideosByProvider(cards)
    expect(grouped.youtube.map((c) => c.id)).toEqual([1, 2, 5])
    expect(grouped.instagram.map((c) => c.id)).toEqual([3])
    expect(grouped.tiktok.map((c) => c.id)).toEqual([4])
    expect(grouped.other).toEqual([])
  })

  it('returns an empty bucket for every provider with no matching cards', () => {
    const grouped = groupVideosByProvider([])
    for (const provider of VIDEOS_PROVIDER_ORDER) {
      expect(grouped[provider]).toEqual([])
    }
  })
})