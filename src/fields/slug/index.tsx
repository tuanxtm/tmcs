import type { CheckboxField, TextField } from 'payload'

import { formatSlugHook } from '@/hooks/slugFieldHook'

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
 * - keep the field fully under our control (no upstream experimental API)
 *
 * Returns a `[TextField, CheckboxField]` tuple - spread both into your
 * collection's `fields` array.
 */
export const slugField = (args: Args = {}): [TextField, CheckboxField] => {
  const { useAsSlug = 'title', localized, required, overrides } = args
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
      // Field hook keeps API/CLI/seed writes in sync with the title.
      beforeValidate: [formatSlugHook(useAsSlug, checkboxField.name)],
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