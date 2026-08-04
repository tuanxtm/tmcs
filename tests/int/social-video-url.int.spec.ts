import { describe, expect, it } from 'vitest'

import { detectVideoProvider, validateVideoSourceUrl } from '@/lib/social-video-url'
import {
  parseYouTubeVideoId,
  youtubeEmbedUrl,
  youtubeThumbnailUrls,
} from '@/lib/youtube'

describe('YouTube URL helpers', () => {
  it('parses common YouTube URL shapes', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
    expect(parseYouTubeVideoId('https://example.com/watch?v=dQw4w9WgXcQ')).toBeNull()
  })

  it('builds thumbnail and privacy-enhanced embed URLs', () => {
    expect(youtubeThumbnailUrls('dQw4w9WgXcQ').hq).toContain('/hqdefault.jpg')
    expect(youtubeEmbedUrl('dQw4w9WgXcQ')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    )
  })
})

describe('social video URL validation', () => {
  it('detects providers from absolute URLs', () => {
    expect(detectVideoProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube')
    expect(detectVideoProvider('https://www.tiktok.com/@x/video/1')).toBe('tiktok')
    expect(detectVideoProvider('https://www.instagram.com/reel/abc/')).toBe('instagram')
    expect(detectVideoProvider('https://vimeo.com/123')).toBe('other')
  })

  it('validates source URL against selected provider', () => {
    expect(
      validateVideoSourceUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
        siblingData: { provider: 'youtube' },
      }),
    ).toBe(true)

    expect(
      validateVideoSourceUrl('https://www.tiktok.com/@x/video/1', {
        siblingData: { provider: 'youtube' },
      }),
    ).toMatch(/YouTube/)

    expect(validateVideoSourceUrl('not-a-url', { siblingData: { provider: 'other' } })).toMatch(
      /absolute/,
    )
  })
})
