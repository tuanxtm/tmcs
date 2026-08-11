import { isAbsoluteHttpUrl } from '@/lib/url'
import { isYouTubeUrl } from '@/lib/youtube'

export type VideoProvider = 'youtube' | 'tiktok' | 'instagram' | 'other'

const TIKTOK_HOSTS = new Set(['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'm.tiktok.com'])
const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com'])

function hostOf(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.hostname.toLowerCase()
  } catch {
    return null
  }
}

export function detectVideoProvider(raw: string): VideoProvider | null {
  if (!isAbsoluteHttpUrl(raw)) return null
  if (isYouTubeUrl(raw)) return 'youtube'
  const host = hostOf(raw)
  if (!host) return null
  if (TIKTOK_HOSTS.has(host) || host.endsWith('.tiktok.com')) return 'tiktok'
  if (INSTAGRAM_HOSTS.has(host) || host.endsWith('.instagram.com')) return 'instagram'
  return 'other'
}

/**
 * Field validate for Videos.sourceUrl - must be absolute http(s).
 * Soft-checks provider when sibling `provider` is set.
 */
export function validateVideoSourceUrl(
  value: unknown,
  options?: { siblingData?: { provider?: VideoProvider | null } },
): true | string {
  if (value == null || value === '') return 'Source URL is required'
  if (typeof value !== 'string' || !isAbsoluteHttpUrl(value)) {
    return 'Must be an absolute http(s) URL'
  }

  const provider = options?.siblingData?.provider
  if (!provider) return true

  const detected = detectVideoProvider(value)
  if (provider === 'youtube' && detected !== 'youtube') {
    return 'URL must be a YouTube link when provider is YouTube'
  }
  if (provider === 'tiktok' && detected !== 'tiktok') {
    return 'URL must be a TikTok link when provider is TikTok'
  }
  if (provider === 'instagram' && detected !== 'instagram') {
    return 'URL must be an Instagram link when provider is Instagram'
  }

  return true
}
