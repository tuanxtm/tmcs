import type { LocaleCode } from '@/lib/locales'

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
  navigation: NavItemView[]
  footer: {
    text: string | null
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

export type PostCardView = {
  id: number
  title: string
  slug: string
  /** Present only when a public post detail route exists. */
  href: string | null
  excerpt: string | null
  publishedAt: string | null
  readingTime: number | null
  authorName: string | null
  categories: { id: number; title: string; slug: string }[]
  image: MediaView | null
}

export type PostsPageView = {
  docs: PostCardView[]
  page: number
  nextPage: number | null
  hasNextPage: boolean
}
