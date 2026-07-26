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

export type FooterGroupView = {
  id: string
  title: string
  links: NavChildView[]
}

export type SocialLinkView = {
  id: string
  platform: string
  url: string
  label: string
}

export type SiteShellView = {
  locale: LocaleCode
  siteName: string
  tagline: string | null
  description: string | null
  siteUrl: string
  contactEmail: string | null
  navigation: NavItemView[]
  footer: {
    text: DefaultTypedEditorState | null
    decorationImageUrl: string | null
    groups: FooterGroupView[]
    socialLinks: SocialLinkView[]
    legalLinks: NavChildView[]
    copyright: string | null
  }
  robotsIndex: boolean
  defaultSocialImage: MediaView | null
  seo: {
    metaTitle: string | null
    metaDescription: string | null
    ogImage: MediaView | null
  }
}

export type HeroView = {
  heading: string
  subheading: string | null
  profileSummary: string | null
  image: MediaView | null
}

export type EndOfFeedView = {
  enabled: boolean
  text: DefaultTypedEditorState
  preferredShape: StoryShape
}

export type FrontpageView = HeroView & {
  endOfFeed: EndOfFeedView | null
  activeDecorationPackId: number
}

/** Slim DTO for homepage feed tiles — only fields the UI and packer consume. */
export type PostCardView = {
  id: number
  title: string
  /** Present only when a public post detail route exists. */
  href: string | null
  publishedAt: string | null
  image: MediaView | null
  cardSize: 'small' | 'wide' | 'tall' | 'large'
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
