import type {
  FeedDecorationView,
  FeedSectionBlockView,
  ThingsPageView,
  ResolvedBlockView,
} from '@/app/(frontend)/_lib/types'

/** Visible things per archive batch. */
export const THINGS_BATCH_SIZE = 10
export const THINGS_PREVIEW_LIMIT = 12

type ThingsBlock = Extract<FeedSectionBlockView, { feedType: 'things' }>

/** Things archive policy and defaults. */
export function prepareThingsArchiveBlocks(
  blocks: ResolvedBlockView[],
  page: ThingsPageView,
  fallback: ThingsBlock,
): ResolvedBlockView[] {
  const index = blocks.findIndex(
    (block) => block.blockType === 'pageFeedSection' && block.feedType === 'things',
  )

  const base = index >= 0 ? (blocks[index] as ThingsBlock) : fallback

  const archive: ThingsBlock = {
    ...base,
    docs: page.docs,
    pagination: 'infinite',
    nextCursor: page.nextCursor,
    hasNextPage: page.hasNextPage,
    showViewAll: false,
    viewAllLabel: null,
    viewAllHref: null,
    cursorPopupViewAll: null,
  }

  const result = blocks.slice()

  if (index >= 0) {
    result[index] = archive
    return result
  }

  const footerIndex = result.findIndex((block) => block.blockType === 'pageFooter')

  result.splice(footerIndex >= 0 ? footerIndex : result.length, 0, archive)
  return result
}

/** Registry defaults for the fallback archive block on the Things page. */
export function createThingsArchiveBlock(args: {
  page: ThingsPageView
  defaults: {
    heading: string
    cursorPopup: string
    cursorPopupEmpty: string
    cursorPopupItem: string
  }
  decorations?: FeedDecorationView[]
}): ThingsBlock {
  return {
    blockType: 'pageFeedSection',
    id: 'things-archive',
    feedType: 'things',
    heading: args.defaults.heading,
    description: null,
    pagination: 'infinite',
    nextCursor: args.page.nextCursor,
    hasNextPage: args.page.hasNextPage,
    showViewAll: false,
    viewAllLabel: null,
    viewAllHref: null,
    cursorPopup: args.defaults.cursorPopup,
    cursorPopupEmpty: args.defaults.cursorPopupEmpty,
    cursorPopupItem: args.defaults.cursorPopupItem,
    cursorPopupViewAll: null,
    docs: args.page.docs,
    decorations: args.decorations,
  }
}
