import type { CheckboxField, TextField } from 'payload'

import type { ReservedCollection } from '@/hooks/slugReservations'
import { checkSlugConflictHook, formatSlugHook } from '@/hooks/slugFieldHook'

type TextFieldSingle = Extract<TextField, { hasMany?: false | undefined }>
type FieldOverrides = {
  field?: Omit<Partial<TextFieldSingle>, 'name' | 'type' | 'hooks' | 'localized' | 'required'>
  checkbox?: Partial<CheckboxField>
}

type Args = {
  /**
   * Name of the top-level field the slug should be derived from.
   * @default 'title'
   */
  useAsSlug?: string
  /** Enable Payload localization on the slug field. */
  localized?: boolean
  /** Whether the slug field is required. */
  required?: boolean
  /**
   * Collection slug this slug lives on. Required to wire the cross-collection
   * conflict check against `slug_reservations`.
   */
  collectionSlug: ReservedCollection
  /** Granular overrides applied last. */
  overrides?: FieldOverrides
}

/**
 * Build the slug + lock checkbox field pair used across content collections.
 *
 * Replaces Payload's experimental `slugField()` with our own implementation
 * so we can:
 * - strip Vietnamese diacritics via `vietnameseToAscii`
 * - render a custom Admin field component with a lock toggle
 * - cross-check the slug against the `slug_reservations` table and reject
 *   duplicates already owned by another collection in the same locale
 *
 * Returns a `[TextField, CheckboxField]` tuple - spread both into your
 * collection's `fields` array.
 */
export const slugField = (args: Args): [TextField, CheckboxField] => {
  const { useAsSlug = 'title', localized, required, collectionSlug, overrides } = args
  const { field: fieldOverrides, checkbox: checkboxOverrides } = overrides ?? {}

  const checkboxField: CheckboxField = {
    name: 'slugLock',
    type: 'checkbox',
    defaultValue: true,
    // The lock state is per-locale so the boolean travels with the slug it
    // gates. This mirrors how Payload's stock `slugField` localized the
    // `generateSlug` flag and keeps the column on the `_locales` table.
    localized,
    admin: {
      hidden: true,
      position: 'sidebar',
      ...(checkboxOverrides?.admin ?? {}),
    },
    ...checkboxOverrides,
  }

  const textField: TextField = {
    name: 'slug',
    type: 'text',
    index: true,
    label: 'Slug',
    localized,
    required,
    hooks: {
      // Order matters: format first so the conflict check sees the final slug
      // value, then check against the reservations table.
      beforeValidate: [
        formatSlugHook(useAsSlug, checkboxField.name),
        checkSlugConflictHook(collectionSlug),
      ],
    },
    admin: {
      position: 'sidebar',
      ...(fieldOverrides?.admin ?? {}),
      components: {
        ...(fieldOverrides?.admin?.components ?? {}),
        Field: {
          path: '@/fields/slug/SlugComponent#SlugComponent',
          clientProps: {
            useAsSlug,
            checkboxFieldPath: checkboxField.name,
          },
        },
      },
    },
    ...(fieldOverrides ?? {}),
  }

  return [textField, checkboxField]
}