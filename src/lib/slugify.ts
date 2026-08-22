import { vietnameseToAscii } from './vietnamese'

/**
 * Format a free-form string into a URL-safe slug.
 *
 * - Strips Vietnamese diacritics via `vietnameseToAscii`
 * - Collapses whitespace into single hyphens
 * - Removes any character that is not a word character or hyphen
 * - Lowercases the result
 *
 * Single source of truth shared by the server-side `beforeValidate` hook
 * and the Admin client component.
 */
export const formatSlug = (val: string): string =>
  vietnameseToAscii(val)
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()