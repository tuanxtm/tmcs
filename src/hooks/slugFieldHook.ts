import { ValidationError as PayloadValidationError, type FieldHook } from 'payload'

import { formatSlug } from '@/lib/slugify'
import { checkSlugReservationConflict, type ReservedCollection } from '@/hooks/slugReservations'

const COLLECTION_SINGULAR_LABEL: Record<ReservedCollection, string> = {
  pages: 'page',
  posts: 'post',
  projects: 'project',
  tags: 'tag',
  categories: 'category',
  'decoration-packs': 'decoration pack',
  things: 'thing',
}

/**
 * `beforeValidate` hook for the custom slug field.
 *
 * - If the sibling `lockFieldName` checkbox is truthy, the slug is always
 *   overwritten from the value at `useAsSlug` (default: `title`). Manual
 *   edits are dropped.
 * - If the checkbox is falsy, the slug is only filled when the user has not
 *   typed one. Manual edits are preserved (matches Payload's stock
 *   `generateSlug` create-branch behaviour).
 * - If both the source field and the incoming slug are empty, the existing
 *   `originalDoc` slug is preserved as a last resort.
 */
export const formatSlugHook =
  (useAsSlug: string, lockFieldName: string): FieldHook =>
  ({ data, originalDoc, value }) => {
    if (!data) return value

    const locked = Boolean((data as Record<string, unknown>)[lockFieldName])
    const source = (data as Record<string, unknown>)[useAsSlug]

    if (locked) {
      if (typeof source === 'string' && source.length > 0) {
        return formatSlug(source)
      }
      return (originalDoc as Record<string, unknown> | undefined)?.['slug'] ?? value ?? null
    }

    if (value && typeof value === 'string' && value.length > 0) {
      return value
    }

    if (typeof source === 'string' && source.length > 0) {
      return formatSlug(source)
    }

    return (originalDoc as Record<string, unknown> | undefined)?.['slug'] ?? value ?? null
  }

/**
 * `beforeValidate` hook that rejects slugs already reserved by another
 * collection in the same locale. Per-collection duplicates are still caught
 * by the underlying unique indexes on `<collection>_locales.slug`, so this
 * hook only worries about cross-collection collisions.
 *
 * - Runs after `formatSlugHook` (registered second in the hook array).
 * - Reads the value off `data['slug']` because the format hook will have just
 *   rewritten it on the same `data` payload. We deliberately do not
 *   re-format here - whatever is in `data.slug` is what would be saved.
 * - Returns `value` (the slug string / localized shape) unchanged when
 *   there is no conflict. Throwing `ValidationError` short-circuits the
 *   payload with a field-level error.
 */
export const checkSlugConflictHook =
  (collectionSlug: ReservedCollection): FieldHook =>
  async ({ data, originalDoc, value, req, operation }) => {
    const slugValue =
      (data as Record<string, unknown> | undefined)?.['slug'] !== undefined
        ? (data as Record<string, unknown>)['slug']
        : value

    if (!slugValue) return value

    const selfId =
      operation === 'update' && typeof (originalDoc as { id?: unknown } | undefined)?.id === 'number'
        ? ((originalDoc as { id: number }).id)
        : undefined

    const candidates: Array<{ locale: 'en' | 'vi'; slug: string }> = []
    if (typeof slugValue === 'string') {
      candidates.push({ locale: 'en', slug: slugValue })
    } else if (typeof slugValue === 'object' && slugValue !== null) {
      for (const loc of ['en', 'vi'] as const) {
        const v = (slugValue as Record<string, unknown>)[loc]
        if (typeof v === 'string' && v.length > 0) {
          candidates.push({ locale: loc, slug: v })
        }
      }
    }
    if (candidates.length === 0) return value

    for (const { locale: loc, slug } of candidates) {
      const conflict = await checkSlugReservationConflict(
        req.payload,
        loc,
        slug,
        collectionSlug,
        selfId,
      )
      if (conflict) {
        const field = COLLECTION_SINGULAR_LABEL[conflict] ?? conflict
        throw new PayloadValidationError(
          {
            errors: [
              {
                message: `Slug "${slug}" (${loc}) is already used by another ${field}. Choose a different slug or unlock the field and edit it.`,
                path: 'slug',
              },
            ],
          },
        ) as unknown as Error
      }
    }

    return value
  }