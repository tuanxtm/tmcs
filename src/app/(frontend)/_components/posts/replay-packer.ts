import {
  appendPostsAndFillStories,
  createPackerState,
  sealWithClosingTile,
  type PackerState,
} from '@/app/(frontend)/_lib/feed-packer'
import type {
  EndOfFeedView,
  FeedDecorationView,
  PostCardView,
  ShortStoryCardView,
} from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'

export type LoadedPostBatch = {
  posts: PostCardView[]
  isFinal: boolean
}

const EMPTY_CLOSING: EndOfFeedView = {
  enabled: false,
  text: {
    root: {
      type: 'root',
      children: [],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  },
  preferredShape: '1x1',
}

/**
 * Replay stored post batches through the deterministic packer for one column count.
 * Preserves story-fill on non-final pages and closing/decoration sealing on the final page.
 */
export function replayPackerBatches(options: {
  columns: number
  batches: LoadedPostBatch[]
  stories: ShortStoryCardView[]
  decorations: FeedDecorationView[]
  locale: LocaleCode
  endOfFeed: EndOfFeedView | null
}): PackerState {
  let state = createPackerState(options.columns)

  for (const batch of options.batches) {
    if (!batch.isFinal) {
      state = appendPostsAndFillStories({
        state,
        posts: batch.posts,
        stories: options.stories,
        decorations: options.decorations,
        locale: options.locale,
        fillStories: true,
      })
      continue
    }

    const packed = appendPostsAndFillStories({
      state,
      posts: batch.posts,
      stories: options.stories,
      decorations: [],
      locale: options.locale,
      fillStories: false,
    })

    state = sealWithClosingTile({
      state: packed,
      closing: options.endOfFeed ?? EMPTY_CLOSING,
      decorations: options.decorations,
      locale: options.locale,
    })
  }

  return state
}
