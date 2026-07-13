import { describe, it, expect } from 'vitest'

import { isImplementedPublicPath, resolveCmsLink } from '@/app/(frontend)/_lib/links'

describe('Frontend public link contract', () => {
  it('only treats home locale roots as implemented public paths', () => {
    expect(isImplementedPublicPath('/')).toBe(true)
    expect(isImplementedPublicPath('/vi')).toBe(true)
    expect(isImplementedPublicPath('/posts/hello')).toBe(false)
    expect(isImplementedPublicPath('/vi/posts/hello')).toBe(false)
    expect(isImplementedPublicPath('/portfolio')).toBe(false)
    expect(isImplementedPublicPath('/vi/portfolio')).toBe(false)
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

  it('suppresses internal CMS page links until detail routes exist', () => {
    expect(
      resolveCmsLink(
        {
          label: 'Portfolio',
          linkType: 'internal',
          page: { slug: 'portfolio' },
        },
        'en',
      ),
    ).toBeNull()

    expect(
      resolveCmsLink(
        {
          label: 'Portfolio',
          linkType: 'internal',
          page: { slug: 'portfolio' },
        },
        'vi',
      ),
    ).toBeNull()
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
})
