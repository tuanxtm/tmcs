import type {
  FeedSectionBlockView,
  ProjectsPageView,
  ResolvedBlockView,
} from '@/app/(frontend)/_lib/types'

/** Visible projects per archive batch. */
export const PROJECTS_BATCH_SIZE = 10
export const PROJECTS_PREVIEW_LIMIT = 12

type ProjectsBlock = Extract<FeedSectionBlockView, { feedType: 'projects' }>

/**
 * Canonical projects archive policy for a CMS-configured Projects page.
 *
 * The first project block becomes the full infinite archive fed by the
 * already-loaded archive page; every later project block stays a static
 * preview. Pure helper: never mutates the cached block objects.
 */
export function prepareProjectsArchiveBlocks(
  blocks: ResolvedBlockView[],
  page: ProjectsPageView,
  fallback: ProjectsBlock,
): ResolvedBlockView[] {
  const index = blocks.findIndex(
    (block) => block.blockType === 'pageFeedSection' && block.feedType === 'projects',
  )

  const base = index >= 0 ? (blocks[index] as ProjectsBlock) : fallback

  const archive: ProjectsBlock = {
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

/** Registry defaults for the fallback archive block on the Projects page. */
export function createProjectsArchiveBlock(args: {
  page: ProjectsPageView
  defaults: {
    heading: string
    cursorPopup: string
    cursorPopupEmpty: string
    cursorPopupItem: string
  }
}): ProjectsBlock {
  return {
    blockType: 'pageFeedSection',
    id: 'projects-archive',
    feedType: 'projects',
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
  }
}
