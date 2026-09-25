import {
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
  UploadFeature,
} from '@payloadcms/richtext-lexical'

import { pageBlocks } from '@/blocks'
import { inlineBlocks } from '@/blocks/inline-blocks'

/**
 * Lexical editor with row-level blocks via `BlocksFeature({ blocks: pageBlocks })`.
 * Lives in its own file to avoid a cycle: `richTextFull.ts -> @/blocks -> page-blocks/hero.ts -> richText.ts`.
 * Do NOT use inside `pageBlocks` itself — use `richText` instead.
 */

export const richTextFull = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    BlocksFeature({ blocks: pageBlocks, inlineBlocks: inlineBlocks }),
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
    }),
  ],
})
