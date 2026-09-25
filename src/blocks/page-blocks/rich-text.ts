import type { Block } from 'payload'

import { richTextWithoutBlock } from '@/fields/richTextWithoutBlock'

/**
 * Overrides the global editor so this block's `content` rich text field does
 * NOT inherit `BlocksFeature`. Including `BlocksFeature` would create a
 * recursive schema during `generate:types`:
 *   pageBlocks includes PageRichTextBlock ->
 *     block's content has the global editor ->
 *       global editor includes BlocksFeature(pageBlocks) ->
 *         pageBlocks again includes PageRichTextBlock -> ...
 *
 * The override lives in `src/fields/richTextWithoutBlock.ts` so the import
 * chain `richText.ts <- { blocks/index.ts <- this file }` is not cyclic.
 */
export const PageRichTextBlock: Block = {
  slug: 'pageRichText',
  labels: {
    singular: 'Page - Rich text',
    plural: 'Page - Rich text',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: richTextWithoutBlock,
    },
  ],
}
