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
  links: 'links',
  media: 'media',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/**
 * Bump this constant when the *shape* returned by a cached loader changes
 * in a way tag invalidation cannot reach (e.g. new fields joined into the
 * layout, new locale resolution rules, a payload.find select that
 * previously dropped a column).
 *
 * Cache keys are namespaced with this version (`home-page-v{N}`). Bumping
 * it forces a fresh read for every locale on the next request. Use it
 * sparingly — tag invalidation should handle the common case.
 */
export const CMS_CACHE_VERSION = 2
