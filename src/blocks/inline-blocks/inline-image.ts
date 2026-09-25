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
  ],
}
