import { getPayload } from 'payload'

import { getServerURL } from '@/lib/env'
import type { LocaleCode } from '@/lib/locales'
import type { Author, Category, Media, Page, Post } from '@/payload-types'
import config from '@payload-config'

import { resolveCmsLink } from './links'
import type {
  FooterGroupView,
  HeroView,
  MediaView,
  NavChildView,
  NavItemView,
  PostCardView,
  PostsPageView,
  SiteShellView,
  SocialLinkView,
} from './types'

export const POSTS_PAGE_SIZE = 6

function isMedia(value: unknown): value is Media {
  return Boolean(value && typeof value === 'object' && 'url' in value)
}

function isAuthor(value: unknown): value is Author {
  return Boolean(value && typeof value === 'object' && 'displayName' in value)
}

function isCategory(value: unknown): value is Category {
  return Boolean(value && typeof value === 'object' && 'title' in value && 'slug' in value)
}

function isPage(value: unknown): value is Page {
  return Boolean(value && typeof value === 'object' && 'slug' in value)
}

export function toMediaView(value: unknown): MediaView | null {
  if (!isMedia(value) || !value.url) return null

  return {
    id: value.id,
    url: value.url,
    alt: value.alt || '',
    width: value.width ?? null,
    height: value.height ?? null,
    dominantColor: value.dominantColor ?? null,
  }
}

function toNavChild(
  item: {
    id?: string | null
    label: string
    linkType: 'internal' | 'external'
    page?: (number | null) | Page
    url?: string | null
    newTab?: boolean | null
  },
  locale: LocaleCode,
  index: number,
): NavChildView | null {
  const resolved = resolveCmsLink(
    {
      label: item.label,
      linkType: item.linkType,
      page: isPage(item.page) ? item.page : null,
      url: item.url,
      newTab: item.newTab,
    },
    locale,
  )
  if (!resolved) return null

  return {
    id: item.id || `link-${index}`,
    ...resolved,
  }
}

async function getPayloadClient() {
  return getPayload({ config })
}

export async function getSiteShell(locale: LocaleCode): Promise<SiteShellView> {
  const payload = await getPayloadClient()

  const [siteSettings, navigation, footer] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      locale,
      depth: 1,
      overrideAccess: false,
    }),
    payload.findGlobal({
      slug: 'navigation',
      locale,
      depth: 2,
      overrideAccess: false,
    }),
    payload.findGlobal({
      slug: 'footer',
      locale,
      depth: 2,
      overrideAccess: false,
    }),
  ])

  const navItems: NavItemView[] = (navigation.items || []).flatMap((item, index) => {
    const parent = toNavChild(item, locale, index)
    if (!parent) return []

    const children = (item.children || [])
      .map((child, childIndex) => toNavChild(child, locale, childIndex))
      .filter((child): child is NavChildView => Boolean(child))

    return [
      {
        ...parent,
        children,
      },
    ]
  })

  const footerGroups: FooterGroupView[] = (footer.groups || []).map((group, index) => ({
    id: group.id || `group-${index}`,
    title: group.title,
    links: (group.links || [])
      .map((link, linkIndex) => toNavChild(link, locale, linkIndex))
      .filter((link): link is NavChildView => Boolean(link)),
  }))

  const socialLinks: SocialLinkView[] = (footer.socialLinks || []).map((link, index) => ({
    id: link.id || `social-${index}`,
    platform: link.platform,
    url: link.url,
    label: link.label || link.platform,
  }))

  const legalLinks = (footer.legalLinks || [])
    .map((link, index) => toNavChild(link, locale, index))
    .filter((link): link is NavChildView => Boolean(link))

  return {
    locale,
    siteName: siteSettings.siteName || 'TMCS',
    tagline: siteSettings.tagline ?? null,
    description: siteSettings.description ?? null,
    siteUrl: siteSettings.siteUrl || getServerURL(),
    navigation: navItems,
    footer: {
      text: footer.text ?? null,
      groups: footerGroups,
      socialLinks,
      legalLinks,
      copyright: footer.copyright ?? null,
    },
    robotsIndex: siteSettings.robots?.indexSite !== false,
    defaultSocialImage: toMediaView(siteSettings.defaultSocialImage),
    seo: {
      metaTitle: siteSettings.seo?.metaTitle ?? null,
      metaDescription: siteSettings.seo?.metaDescription ?? siteSettings.description ?? null,
      ogImage:
        toMediaView(siteSettings.seo?.ogImage) || toMediaView(siteSettings.defaultSocialImage),
    },
  }
}

export async function getHomepage(locale: LocaleCode): Promise<HeroView> {
  const payload = await getPayloadClient()
  const homepage = await payload.findGlobal({
    slug: 'homepage',
    locale,
    depth: 1,
    overrideAccess: false,
  })

  return {
    heading: homepage.heroHeading || '',
    subheading: homepage.heroSubheading ?? null,
    profileSummary: homepage.profileSummary ?? null,
    image: toMediaView(homepage.heroImage),
  }
}

function toPostCard(post: Post, _locale: LocaleCode): PostCardView {
  const categories = (post.categories || []).filter(isCategory).map((category) => ({
    id: category.id,
    title: category.title,
    slug: category.slug,
  }))

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    // Detail routes are deferred; cards render without links until then.
    href: null,
    excerpt: post.excerpt ?? null,
    publishedAt: post.publishedAt ?? null,
    readingTime: post.readingTime ?? null,
    authorName: isAuthor(post.author) ? post.author.displayName : null,
    categories,
    image: toMediaView(post.featuredImage),
  }
}

export async function getPostsPage(locale: LocaleCode, page = 1): Promise<PostsPageView> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'posts',
    locale,
    where: {
      _status: {
        equals: 'published',
      },
    },
    sort: '-publishedAt',
    limit: POSTS_PAGE_SIZE,
    page: safePage,
    depth: 1,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      publishedAt: true,
      readingTime: true,
      author: true,
      categories: true,
    },
  })

  return {
    docs: result.docs.map((post) => toPostCard(post as Post, locale)),
    page: result.page || safePage,
    nextPage: result.nextPage ?? null,
    hasNextPage: Boolean(result.hasNextPage),
  }
}
