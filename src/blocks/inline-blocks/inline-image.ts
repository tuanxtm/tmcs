import type { Block } from 'payload'

/**
 * Inline image block - inserts an image inline inside a rich-text paragraph.
 *
 * Lives under `src/blocks/inline-blocks/` so it can be reused by any rich-text
 * editor that pulls from this folder barrel. The constant is the single source
 * of truth for the `inlineImage` slug and field schema; consumed by
 * `src/fields/richText.ts` via `BlocksFeature({ inlineBlocks: [...] })` and by
 * generated Payload types as `InlineImageBlock`.
 *
 * Field contract:
 *   - image: required media upload (relationTo 'media').
 *   - caption: optional short caption shown below the image.
 *   - scale: optional real-layout size multiplier (default 1). Allocates
 *     actual inline-flow space (em × scale) so text reflows around the
 *     visible image — no overlap with same-line text. Vertical bleed
 *     into the leading/descender of adjacent lines is intentional, and
 *     matches printed-media behavior for inline figures.
 *     Common picks: 1.05, 1.1, 1.25, 1.5.
 *   - align: optional vertical alignment on the text line. Maps to CSS
 *     `vertical-align`; default `text-bottom` keeps the image rooted at
 *     the descender line of the surrounding text.
 */
export const InlineImageBlock: Block = {
  slug: 'inlineImage',
  interfaceName: 'InlineImageBlock',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
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
        description: 'Vertical alignment on the text line. Default: text-bottom (rooted at descender line).',
      },
    },
  ],
}
