import { ContentGalleryBlock } from './content-blocks/gallery'
import { ContentMediaBlock } from './content-blocks/media'
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
import { TemplatePostBlock } from './template-blocks/post'
import { TemplateProjectBlock } from './template-blocks/project'

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
