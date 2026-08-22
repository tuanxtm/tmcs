import type { FieldHook } from 'payload'

import { formatSlug } from '@/lib/slugify'

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