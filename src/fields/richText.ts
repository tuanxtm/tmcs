import {
  BlocksFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  TextStateFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { InlineImageBlock } from '@/blocks/inline-blocks'
import { textStateConfig } from './textStateConfig'

export const richText = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    InlineToolbarFeature(),
    TextStateFeature({ state: textStateConfig }),
    BlocksFeature({
      inlineBlocks: [InlineImageBlock],
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

// Re-export for callers that still expect it from this module.
export { richTextWithoutBlock } from './richTextWithoutBlock'
