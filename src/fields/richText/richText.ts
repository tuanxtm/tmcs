import {
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  TextStateFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { inlineBlocks } from '@/blocks/inline-blocks'

import { textStateConfig } from '../textStateConfig'

/**
 * Default Lexical editor — inline blocks only. Safe for any `type: 'richText'` field.
 * Do NOT import `pageBlocks` here (cycle risk with `generate:types`).
 * For row-level blocks, use `richTextFull` from `./richTextFull`.
 */

export const richText = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    TextStateFeature({ state: textStateConfig }),
    BlocksFeature({
      inlineBlocks: inlineBlocks,
    }),
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
    }),
  ],
})

export const richTextWithoutBlock = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    TextStateFeature({ state: textStateConfig }),
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
    }),
  ],
})
