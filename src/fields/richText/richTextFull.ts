import {
  AlignFeature,
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  ChecklistFeature,
  FixedToolbarFeature,
  IndentFeature,
  InlineCodeFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { pageBlocks } from '@/blocks'
import { inlineBlocks } from '@/blocks'

/**
 * Lexical editor with row-level blocks via `BlocksFeature({ blocks: pageBlocks })`.
 * Lives in its own file to avoid a cycle: `richTextFull.ts -> @/blocks -> page-blocks/hero.ts -> richText.ts`.
 * Do NOT use inside `pageBlocks` itself - use `richText` instead.
 *
 * Features are an explicit allowlist (no `defaultFeatures`) so `HeadingFeature`
 * stays out and the toolbar is deterministic.
 */

export const richTextFull = lexicalEditor({
  features: () => [
    FixedToolbarFeature(),
    ParagraphFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    InlineCodeFeature(),
    AlignFeature(),
    IndentFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    ChecklistFeature(),
    LinkFeature(),
    RelationshipFeature(),
    BlockquoteFeature(),
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
