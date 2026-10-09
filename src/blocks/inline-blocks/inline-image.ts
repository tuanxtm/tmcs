import type { Block, Field } from 'payload'

/**
 * Inline image block - inserts an image inline inside a rich-text paragraph.
 *
 * Lives under `src/blocks/inline-blocks/` so it can be reused by any rich-text
 * editor that pulls from this folder barrel. The constant is the single source
 * of truth for the `inlineImage` slug and field schema; consumed by
 * `src/fields/richText.ts` via `BlocksFeature({ inlineBlocks: [...] })` and by
 * generated Payload types as `InlineImageBlock`.
 *
 * The `image` field's `relationTo` is parameterized at build time so the same
 * fields are reused for the Hero-specific editor (relationTo `inline-images`).
 * Ordinary rich text uses `media`; the Hero editor uses `inline-images`.
 *
 * Field contract:
 *   - image: required upload. relationTo passed in by the factory.
 *   - caption: optional short caption shown below the image.
 *   - scale: optional real-layout size multiplier (default 1). Allocates
 *     actual inline-flow space (em x scale) so text reflows around the
 *     visible image - no overlap with same-line text.
 *   - align: optional vertical alignment on the text line. Maps to CSS
 *     `vertical-align`; default `text-bottom` keeps the image rooted at
 *     the descender line of the surrounding text.
 */
function createInlineImageFields(imageCollection: 'media' | 'inline-images'): Field[] {
  return [
    {
      name: 'image',
      type: 'upload',
      relationTo: imageCollection,
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'scale',
      type: 'number',
      defaultValue: 1,
      min: 0.5,
      max: 3,
      admin: {
        step: 0.05,
        description: 'Visual size multiplier. Cap-height: 1. Step: 0.05. Min: 0.5. Max: 3.',
      },
    },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'text-bottom',
      options: [
        { label: 'Text bottom (default)', value: 'text-bottom' },
        { label: 'Baseline', value: 'baseline' },
        { label: 'Middle', value: 'middle' },
        { label: 'Text top', value: 'text-top' },
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
      ],
      admin: {
        description:
          'Vertical alignment on the text line. Default: text-bottom (rooted at descender line).',
      },
    },
  ]
}

/** Ordinary rich-text inline image block: uses Media. */
export const InlineImageBlock: Block = {
  slug: 'inlineImage',
  interfaceName: 'InlineImageBlock',
  labels: {
    singular: 'Inline Image',
    plural: 'Inline Images',
  },
  fields: createInlineImageFields('media'),
}

/** Hero-only inline image block: uses the dedicated Inline Images collection. */
export const HeroInlineImageBlock: Block = {
  slug: 'heroInlineImage',
  interfaceName: 'HeroInlineImageBlock',
  labels: {
    singular: 'Inline Image',
    plural: 'Inline Images',
  },
  fields: createInlineImageFields('inline-images'),
}
