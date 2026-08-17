import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import type { LocaleCode } from '@/lib/locales'
import type { StoryShape } from '@/lib/story-shapes'

export type { StoryShape }

export type MediaView = {
  id: number
  url: string
  alt: string
  width: number | null
  height: number | null
  dominantColor: string | null
}

export type NavChildView = {
  id: string
  label: string
  href: string
  newTab: boolean
  external: boolean
}

export type NavItemView = {
  id: string
  label: string
  href: string
  newTab: boolean
  external: boolean
  children: NavChildView[]
}

export type SiteShellView = {
  locale: LocaleCode
  siteName: string
  tagline: string | null
  description: string | null
  siteUrl: string
  contactEmail: string | null
  /** Website / social links from Site Settings (for contact dialogs, etc.). */
  profileLinks: NavChildView[]
  navigation: NavItemView[]
  activeDecorationPackId: number
  robotsIndex: boolean
  defaultSocialImage: MediaView | null
  seo: {
    metaTitle: string | null
    metaDescription: string | null
    ogImage: MediaView | null
  }
}

export type HeroView = {
  siteName: string
  tagline: string | null
  coverImage: MediaView | null
  bio: DefaultTypedEditorState | null
  links: NavChildView[]
}

/** Slim DTO for homepage feed tiles - only fields the UI consumes. */
export type PostCardView = {
  id: number
  slug: string | null
  title: string
  /** Present only when a public post detail route exists. */
  href: string | null
  publishedAt: string | null
  image: MediaView | null
}

export type ProjectCardView = {
  id: number
  slug: string | null
  title: string
  /** Present only when a public project detail route exists. */
  href: string | null
  publishedAt: string | null
  image: MediaView | null
}

export type ThingPlatformLink = { label: string; url: string }

export type ThingCardView = {
  id: number
  /** Stable identifier for the ViewTransition name. Things have no detail route,
   * so slug is null — FeedCard falls back to id for the morph name. */
  slug: string | null
  name: string
  description: string | null
  primaryImage: MediaView | null
  detailImage: MediaView | null
  /** Localized primary URL - shown on the tile, opened directly if user clicks the tile card. */
  primaryUrl: string | null
  /** Non-localized platform links - drive the dialog buttons. */
  links: ThingPlatformLink[]
  publishedAt: string | null
}

export type VideoProvider = 'youtube' | 'tiktok' | 'instagram' | 'other'

export type VideoCardView = {
  id: number
  /** Stable identifier for the ViewTransition name. Videos have no detail route,
   * so slug is null — FeedCard falls back to id for the morph name. */
  slug: string | null
  title: string
  provider: VideoProvider
  sourceUrl: string
  /** Parsed YouTube id when provider is youtube; otherwise null. */
  youtubeId: string | null
  publishedAt: string | null
  image: MediaView | null
}

export type ShortStoryCardView = {
  id: number
  title: string
  /** Plain text extracted from Lexical for compact tile rendering. */
  text: string
  variant: 'note' | 'quote' | 'image'
  allowedShapes: StoryShape[] | null
  href: string | null
  newTab: boolean
}

export type FeedDecorationView = {
  /** Pack item row id (string) or legacy numeric id in tests. */
  id: string | number
  packId: number
  imageUrl: string
  allowedShapes: StoryShape[]
  weight: number
}

export type PostsPageView = {
  docs: PostCardView[]
  /** Opaque keyset cursor for the next page; null when exhausted. */
  nextCursor: string | null
  hasNextPage: boolean
}

export type PostDetailView = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: DefaultTypedEditorState | null
  /** Optional blocks rendered below the article body (CTAs, related feeds, etc.). */
  blocks: ResolvedBlockView[]
  featuredImage: MediaView | null
  publishedAt: string | null
  readingTime: number | null
  author: { name: string } | null
  categories: { name: string }[]
  tags: { name: string }[]
  seo: PageSeoView
}

export type ProjectDetailView = {
  id: number
  title: string
  slug: string
  summary: string | null
  content: DefaultTypedEditorState | null
  /** Optional blocks rendered below the project body (CTAs, related feeds, etc.). */
  blocks: ResolvedBlockView[]
  coverImage: MediaView | null
  publishedAt: string | null
  author: { name: string } | null
  categories: { name: string }[]
  tags: { name: string }[]
  seo: PageSeoView
}

export type ProjectsPageView = {
  docs: ProjectCardView[]
  /** Opaque keyset cursor for the next page; null when exhausted. */
  nextCursor: string | null
  hasNextPage: boolean
}

export type VideosPageView = {
  docs: VideoCardView[]
  nextCursor: string | null
  hasNextPage: boolean
}

export type PageSeoView = {
  metaTitle: string | null
  metaDescription: string | null
  ogImage: MediaView | null
  canonicalUrl: string | null
  noIndex: boolean
  noFollow: boolean
}

export type LayoutHeroBlockView = {
  blockType: 'layoutHero'
  id: string
  labelTitle: string | null
  title: string
  labelTagline: string | null
  tagline: string | null
  labelBio: string | null
  bio: DefaultTypedEditorState | null
  heroImage: MediaView | null
  labelSocialLinks: string | null
  socialLinks: NavChildView[]
  labelOtherLinks: string | null
  otherLinks: NavChildView[]
  cursorPopup: string | null
}

export type FeedType = 'posts' | 'projects' | 'things' | 'videos'
export type FeedPaginationMode = 'static' | 'infinite'

type FeedSectionBase = {
  blockType: 'layoutFeedSection'
  id: string
  heading: string
  description: string | null
  pagination: FeedPaginationMode
  nextCursor: string | null
  hasNextPage: boolean
  showViewAll: boolean
  viewAllLabel: string | null
  viewAllHref: string | null
  cursorPopup: string | null
  cursorPopupEmpty: string | null
  cursorPopupItem: string | null
  cursorPopupViewAll: string | null
}

export type FeedSectionBlockView =
  | (FeedSectionBase & {
      feedType: 'posts'
      docs: PostCardView[]
    })
  | (FeedSectionBase & {
      feedType: 'projects'
      docs: ProjectCardView[]
    })
  | (FeedSectionBase & {
      feedType: 'things'
      docs: ThingCardView[]
    })
  | (FeedSectionBase & {
      feedType: 'videos'
      docs: VideoCardView[]
    })

export type LayoutRichTextWithoutBlockView = {
  blockType: 'layoutRichTextWithoutBlock'
  id: string
  content: DefaultTypedEditorState
}

export type ContentMediaBlockView = {
  blockType: 'contentMedia'
  id: string
  media: MediaView
  caption: string | null
}

export type LayoutTypewriterBlockView = {
  blockType: 'layoutTypewriter'
  id: string
  /** Pre-resolved plain-text strings ready for the Typewriter component. */
  texts: string[]
}

export type LayoutBlankSpaceBlockView = {
  blockType: 'layoutBlankSpace'
  id: string
  /** CSS height for the blank section (e.g. "60vh", "400px"). */
  height: string
}

export type LayoutScrambleHoverBlockView = {
  blockType: 'layoutScrambleHover'
  id: string
  /** Pre-resolved plain-text strings ready for the ScrambleHover component. */
  texts: string[]
}

export type LayoutFooterBlockView = {
  blockType: 'layoutFooter'
  id: string
  footerText: DefaultTypedEditorState | null
  legalLinks: NavChildView[]
  copyright: string | null
}

/**
 * Stub view types for blocks that have schema but no frontend renderer yet.
 * The frontend resolver returns `null` for these, so they never flow into the
 * page renderer - the types exist only to keep the `ResolvedBlockView` union
 * exhaustive when narrowing against the blockType discriminator.
 */
export type ContentGalleryBlockView = {
  blockType: 'contentGallery'
  id: string
}

export type LayoutRelatedItemsBlockView = {
  blockType: 'layoutRelatedItems'
  id: string
}

export type ResolvedBlockView =
  | LayoutHeroBlockView
  | FeedSectionBlockView
  | LayoutRichTextWithoutBlockView
  | ContentMediaBlockView
  | ContentGalleryBlockView
  | LayoutRelatedItemsBlockView
  | LayoutTypewriterBlockView
  | LayoutScrambleHoverBlockView
  | LayoutBlankSpaceBlockView
  | LayoutFooterBlockView

export type CmsPageView = {
  title: string
  summary: string | null
  slug: string
  template: 'home' | 'about' | 'contact' | 'generic'
  pageImage: MediaView | null
  seo: PageSeoView
  blocks: ResolvedBlockView[]
  /** Alternate-locale path when a localized sibling slug exists; otherwise null. */
  alternateSlug: string | null
}

export type HomePageView = CmsPageView & {
  /** True when constructed from site-settings + latest feeds because no published home page exists. */
  usedFallback: boolean
}
