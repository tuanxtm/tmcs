/**
 * Stable Next.js data-cache tags for public frontend CMS reads.
 * Invalidated from Payload afterChange/afterDelete hooks.
 */
export const CACHE_TAGS = {
  siteShell: 'site-shell',
  frontpage: 'frontpage',
  posts: 'posts',
  shortStories: 'short-stories',
  decorationPacks: 'decoration-packs',
  media: 'media',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
