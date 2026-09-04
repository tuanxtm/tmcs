import { LayoutBlankSpaceBlock } from './blank-space'
import { ContentGalleryBlock } from './content-gallery'
import { ContentMediaBlock } from './content-media'
import { DetailPostBlock } from './detail-post'
import { DetailProjectBlock } from './detail-project'
import { LayoutFeedSectionBlock } from './feed-section'
import { LayoutFooterBlock } from './footer'
import { LayoutHeroBlock } from './hero'
import { LayoutRelatedItemsBlock } from './layout-related-items'
import { LayoutRichTextWithoutBlock } from './rich-text'
import { LayoutScrambleHoverBlock } from './scramble-hover'
import { LayoutTypewriterBlock } from './typewriter'

export {
  ContentGalleryBlock,
  ContentMediaBlock,
  DetailPostBlock,
  DetailProjectBlock,
  LayoutBlankSpaceBlock,
  LayoutFeedSectionBlock,
  LayoutFooterBlock,
  LayoutHeroBlock,
  LayoutRelatedItemsBlock,
  LayoutRichTextWithoutBlock,
  LayoutScrambleHoverBlock,
  LayoutTypewriterBlock,
}

export const pageBlocks = [
  LayoutHeroBlock,
  LayoutFeedSectionBlock,
  LayoutRichTextWithoutBlock,
  ContentMediaBlock,
  ContentGalleryBlock,
  LayoutRelatedItemsBlock,
  LayoutTypewriterBlock,
  LayoutScrambleHoverBlock,
  LayoutBlankSpaceBlock,
  LayoutFooterBlock,
  DetailPostBlock,
  DetailProjectBlock,
]
