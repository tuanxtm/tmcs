import { getServerURL } from '@/lib/env'

/**
 * Build an Admin preview URL for a content collection.
 * Public preview routes are deferred; this only prepares the Admin link.
 */
export function buildPreviewUrl(
  kind: 'posts' | 'projects' | 'pages',
  slug: string,
  locale?: string | null,
): string {
  const base = getServerURL()
  return `${base}/preview/${kind}/${slug}?locale=${locale || 'en'}`
}
