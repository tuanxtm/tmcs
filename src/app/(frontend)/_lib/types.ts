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

/** Slim DTO for homepage feed tiles — only fields the UI consumes. */
export type PostCardView = {
  id: number
  title: string
  /** Present only when a public post detail route exists. */
  href: string | null
  publishedAt: string | null
  image: MediaView | null
}

export type ProjectCardView = {
  id: number
  title: string
  /** Present only when a public project detail route exists. */
  href: string | null
  publishedAt: string | null
  image: MediaView | null
}

export type ThingCardView = {
  id: number
  name: string
  description: string | null
  primaryImage: MediaView | null
  detailImage: MediaView | null
  affiliateUrl: string | null
  linkLabel: string | null
  publishedAt: string | null
}

export type VideoProvider = 'youtube' | 'tiktok' | 'instagram' | 'other'

export type VideoCardView = {
  id: number
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
  featuredImage: MediaView | null
  publishedAt: string | null
  readingTime: number | null
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

export type HeroBlockView = {
  blockType: 'hero'
  id: string
  label: string | null
  title: string
  tagline: string | null
  bio: DefaultTypedEditorState | null
  heroImage: MediaView | null
  links: NavChildView[]
  cursorPopup: string | null
}

export type FeedType = 'posts' | 'projects' | 'things' | 'videos'

export type FeedPaginationMode = 'static' | 'infinite'

type FeedSectionBase = {
  blockType: 'feedSection'
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

export type RichTextBlockView = {
  blockType: 'richText'
  id: string
  content: DefaultTypedEditorState
}

export type MediaBlockView = {
  blockType: 'media'
  id: string
  media: MediaView
  caption: string | null
}

export type CallToActionBlockView = {
  blockType: 'callToAction'
  id: string
  heading: string
  body: string | null
  links: NavChildView[]
}

export type ProjectsGridBlockView = {
  blockType: 'projectsGrid'
  id: string
  heading: string | null
  docs: ProjectCardView[]
}

export type TypewriterBlockView = {
  blockType: 'typewriter'
  id: string
  /** Pre-resolved plain-text strings ready for the Typewriter component. */
  texts: string[]
}

export type BlankSpaceBlockView = {
  blockType: 'blankSpace'
  id: string
  /** CSS height for the blank section (e.g. "60vh", "400px"). */
  height: string
}

export type ScrambleHoverBlockView = {
  blockType: 'scramble-hover'
  id: string
  /** Pre-resolved plain-text strings ready for the ScrambleHover component. */
  texts: string[]
}

export type FooterBlockView = {
  blockType: 'footer'
  id: string
  footerText: DefaultTypedEditorState | null
  legalLinks: NavChildView[]
  copyright: string | null
}

export type ResolvedBlockView =
  | HeroBlockView
  | FeedSectionBlockView
  | RichTextBlockView
  | MediaBlockView
  | CallToActionBlockView
  | ProjectsGridBlockView
  | TypewriterBlockView
  | ScrambleHoverBlockView
  | BlankSpaceBlockView
  | FooterBlockView

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
