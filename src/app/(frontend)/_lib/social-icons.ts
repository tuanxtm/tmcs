import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandThreads,
  IconBrandX,
  IconBrandYoutube,
  IconLink,
  IconWorld,
  type Icon,
} from '@tabler/icons-react'

export const SOCIAL_ICONS: Record<string, Icon> = {
  github: IconBrandGithub,
  linkedin: IconBrandLinkedin,
  x: IconBrandX,
  youtube: IconBrandYoutube,
  facebook: IconBrandFacebook,
  instagram: IconBrandInstagram,
  tiktok: IconBrandTiktok,
  threads: IconBrandThreads,
  website: IconWorld,
  other: IconLink,
}

const SOCIAL_HOSTS: Record<string, string> = {
  'github.com': 'github',
  'linkedin.com': 'linkedin',
  'x.com': 'x',
  'twitter.com': 'x',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'facebook.com': 'facebook',
  'fb.com': 'facebook',
  'instagram.com': 'instagram',
  'tiktok.com': 'tiktok',
  'threads.net': 'threads',
  'threads.com': 'threads',
}

/**
 * Detects a social platform key from a URL hostname. Returns null when the
 * hostname does not match a known social network so callers can fall back to
 * a generic destination icon.
 */
export function detectSocialPlatform(href: string | null | undefined): string | null {
  if (!href) return null
  let host: string
  try {
    host = new URL(href, 'https://placeholder.local').hostname.toLowerCase()
  } catch {
    return null
  }
  return SOCIAL_HOSTS[host] ?? null
}

/**
 * Strips the `https://` (or `http://`) prefix from a URL for compact display.
 */
export function trimUrlScheme(href: string | null | undefined): string {
  if (!href) return ''
  return href.replace(/^https?:\/\//, '')
}
