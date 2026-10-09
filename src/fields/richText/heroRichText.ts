import {
  BlocksFeature,
  FixedToolbarFeature,
  TextStateFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { HeroInlineImageBlock } from '@/blocks/inline-blocks/inline-image'
import { textStateConfig } from '../textStateConfig'

/**
 * Hero editor. Mirrors the global `richText` editor's feature set but
 * restricts inline blocks to the Hero-only `heroInlineImage` block (which
 * sources its image from the dedicated Inline Images collection). Direct
 * import avoids the page-block barrel cycle that would happen if we
 * reused `@/blocks` here.
 *
 * The `enabledCollections: ['media']` allowlist on `UploadFeature` keeps
 * the block-level upload picker pointed at Media; only the dedicated
 * inline block targets Inline Images.
 */
export const heroRichText = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),
    UploadFeature({
      collections: {
        media: {
          fields: [],
        },
      },
    }),
    TextStateFeature({ state: textStateConfig }),
    BlocksFeature({
      inlineBlocks: [HeroInlineImageBlock],
    }),
  ],
})
