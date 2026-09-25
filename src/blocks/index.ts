import { ContentGalleryBlock, ContentMediaBlock } from './content-blocks/index'
import {
  PageBlankSpaceBlock,
  PageFeedSectionBlock,
  PageFooterBlock,
  PageHeroBlock,
  PageRelatedItemsBlock,
  PageRichTextBlock,
  PageScrambleHoverBlock,
  PageTypewriterBlock,
} from './page-blocks'
import { TemplatePostBlock, TemplateProjectBlock } from './template-blocks'
import { InlineImageBlock } from './inline-blocks'

export {
  ContentGalleryBlock,
  ContentMediaBlock,
  PageBlankSpaceBlock,
  PageFeedSectionBlock,
  PageFooterBlock,
  PageHeroBlock,
  PageRelatedItemsBlock,
  PageRichTextBlock,
  PageScrambleHoverBlock,
  PageTypewriterBlock,
  TemplatePostBlock,
  TemplateProjectBlock,
}

export const pageBlocks = [
  PageHeroBlock,
  PageFeedSectionBlock,
  PageRichTextBlock,
  ContentMediaBlock,
  ContentGalleryBlock,
  PageRelatedItemsBlock,
  PageTypewriterBlock,
  PageScrambleHoverBlock,
  PageBlankSpaceBlock,
  PageFooterBlock,
  TemplatePostBlock,
  TemplateProjectBlock,
]

export const inlineBlocks = [InlineImageBlock]
