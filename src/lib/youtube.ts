/**
 * YouTube URL helpers - parse IDs and build privacy-enhanced embed / thumbnail URLs.
 * Used at save-time (thumbnail import) and client click-to-play (embed only).
 */

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
])

/** 11-char YouTube video id. */
const VIDEO_ID_RE = /^[\w-]{11}$/

export function parseYouTubeVideoId(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null

  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null

  const host = url.hostname.toLowerCase()
  if (!YOUTUBE_HOSTS.has(host)) return null

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0]
    return id && VIDEO_ID_RE.test(id) ? id : null
  }

  const path = url.pathname

  if (path === '/watch') {
    const id = url.searchParams.get('v')
    return id && VIDEO_ID_RE.test(id) ? id : null
  }

  const embedMatch = path.match(/^\/(?:embed|shorts|live|v)\/([\w-]{11})/)
  if (embedMatch?.[1] && VIDEO_ID_RE.test(embedMatch[1])) {
    return embedMatch[1]
  }

  return null
}

export function youtubeThumbnailUrls(videoId: string): { max: string; hq: string } {
  return {
    max: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  }
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
}

export function isYouTubeUrl(raw: string): boolean {
  return parseYouTubeVideoId(raw) != null
}
