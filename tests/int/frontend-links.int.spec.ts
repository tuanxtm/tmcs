import { describe, it, expect } from 'vitest'

import { resolveCmsLink, resolvePageHref } from '@/app/(frontend)/_lib/links'
import { pageHref } from '@/app/(frontend)/_lib/locale'

describe('Frontend public link contract', () => {
  it('resolves localized page hrefs from slugs', () => {
    expect(pageHref('en', 'posts')).toBe('/posts')
    expect(pageHref('vi', 'posts')).toBe('/vi/posts')
    expect(pageHref('en', 'about')).toBe('/about')
    expect(pageHref('vi', 'about')).toBe('/vi/about')
  })

  it('keeps external CMS links', () => {
    const resolved = resolveCmsLink(
      {
        label: 'GitHub',
        linkType: 'external',
        url: 'https://github.com/example',
        newTab: true,
      },
      'en',
    )

    expect(resolved).toEqual({
      label: 'GitHub',
      href: 'https://github.com/example',
      newTab: true,
      external: true,
    })
  })

  it('resolves internal CMS page links by localized slug', () => {
    expect(
      resolveCmsLink(
        {
          label: 'Portfolio',
          linkType: 'internal',
          page: { slug: 'portfolio' },
        },
        'en',
      ),
    ).toEqual({
      label: 'Portfolio',
      href: '/portfolio',
      newTab: false,
      external: false,
    })

    expect(
      resolveCmsLink(
        {
          label: 'Portfolio',
          linkType: 'internal',
          page: { slug: 'portfolio' },
        },
        'vi',
      ),
    ).toEqual({
      label: 'Portfolio',
      href: '/vi/portfolio',
      newTab: false,
      external: false,
    })
  })

  it('allows explicit home page slugs', () => {
    expect(
      resolveCmsLink(
        {
          label: 'Home',
          linkType: 'internal',
          page: { slug: 'home' },
        },
        'vi',
      ),
    ).toEqual({
      label: 'Home',
      href: '/vi',
      newTab: false,
      external: false,
    })
  })

  it('resolves page relationships without a label via resolvePageHref', () => {
    expect(resolvePageHref({ slug: 'posts' }, 'en')).toBe('/posts')
    expect(resolvePageHref({ slug: 'home' }, 'vi')).toBe('/vi')
    expect(resolvePageHref(null, 'en')).toBeNull()
  })
})
