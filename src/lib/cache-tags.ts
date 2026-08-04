/**
 * Stable Next.js data-cache tags for public frontend CMS reads.
 * Invalidated from Payload afterChange/afterDelete hooks.
 */
export const CACHE_TAGS = {
  siteShell: 'site-shell',
  pages: 'pages',
  posts: 'posts',
  projects: 'projects',
  things: 'things',
  videos: 'videos',
  shortStories: 'short-stories',
  decorationPacks: 'decoration-packs',
  media: 'media',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
