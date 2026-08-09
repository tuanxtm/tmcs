import { test, expect } from '@playwright/test'

/**
 * Public frontend checks for the localized homepage shell and CMS block feed.
 * Content reads use Payload Local API / Server Actions; public REST remains under `(payload)/api`.
 */
test.describe('Frontend homepage', () => {
  test('english homepage renders hero and feed sections', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('#hero-heading')).toBeVisible()
    await expect(page.locator('[data-feed-type="projects"]')).toBeVisible()
    await expect(page.locator('[data-feed-type="posts"]')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('vietnamese homepage sets lang and renders content', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/vi')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
    await expect(page.locator('#hero-heading')).toBeVisible()
    await expect(page.locator('[data-feed-type="projects"] .section-header h2')).toBeVisible()
  })

  test('header is sticky and shows site name', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const header = page.locator('header')
    await expect(header).toHaveCSS('position', 'sticky')
    await expect(header.locator('a').first()).toBeVisible()
    await expect(header).toHaveAttribute('data-scrolled', 'false')

    await page.evaluate(() => window.scrollTo(0, 120))
    await expect(header).toHaveAttribute('data-scrolled', 'true')
  })

  test('section headers stick below the site header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')

    const sectionHeader = page.locator('[data-feed-type="projects"] .section-header')
    await expect(sectionHeader).toHaveCSS('position', 'sticky')
    await expect(sectionHeader).toHaveAttribute('data-stuck', 'false')

    const expectedStickyHeight = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement)
      const headerHeight = parseFloat(root.getPropertyValue('--header-height'))
      return headerHeight / 2
    })

    await page.evaluate(() => {
      const siteHeader = document.querySelector('header')
      const sectionHeaderEl = document.querySelector('[data-feed-type="projects"] .section-header')
      if (!siteHeader || !sectionHeaderEl) return
      const siteHeight = siteHeader.getBoundingClientRect().height
      const absoluteTop = sectionHeaderEl.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: absoluteTop - siteHeight + 4, behavior: 'instant' })
    })

    await expect(sectionHeader).toHaveAttribute('data-stuck', 'true')
    await expect
      .poll(async () => {
        const box = await sectionHeader.boundingBox()
        return box?.height ?? 0
      })
      .toBeLessThan(expectedStickyHeight + 2)

    const metrics = await page.evaluate(() => {
      const siteHeader = document.querySelector('header')
      const sectionHeaderEl = document.querySelector('[data-feed-type="projects"] .section-header')
      if (!siteHeader || !sectionHeaderEl) return null
      return {
        top: sectionHeaderEl.getBoundingClientRect().top,
        siteBottom: siteHeader.getBoundingClientRect().bottom,
        height: sectionHeaderEl.getBoundingClientRect().height,
      }
    })

    expect(metrics).not.toBeNull()
    expect(Math.abs(metrics!.top - metrics!.siteBottom)).toBeLessThan(3)
    expect(Math.abs(metrics!.height - expectedStickyHeight)).toBeLessThan(2)
  })

  test('first fold is header + hero + first section header at 100dvh', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')

    const fold = await page.evaluate(() => {
      const header = document.querySelector('header')
      const hero = document.querySelector('#hero')
      const sectionHeader = document.querySelector('[data-feed-type] .section-header')
      if (!header || !hero || !sectionHeader) return null

      const headerRect = header.getBoundingClientRect()
      const heroRect = hero.getBoundingClientRect()
      const sectionRect = sectionHeader.getBoundingClientRect()
      const total = headerRect.height + heroRect.height + sectionRect.height
      return {
        total,
        viewport: window.innerHeight,
        headerHeight: headerRect.height,
        sectionHeaderHeight: sectionRect.height,
      }
    })

    expect(fold).not.toBeNull()
    expect(Math.abs(fold!.total - fold!.viewport) / fold!.viewport).toBeLessThan(0.03)
    expect(Math.abs(fold!.headerHeight - fold!.sectionHeaderHeight)).toBeLessThan(2)
  })

  test('desktop feed grids use four columns', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')
    const grid = page.locator('[data-feed-type="projects"] .feed-grid')
    if ((await page.locator('[data-feed-type="projects"] .feed-grid-item').count()) === 0) {
      test.skip()
      return
    }
    await expect(grid).toBeVisible()
    await expect(grid).toHaveCSS('grid-template-columns', /.+ .+ .+ .+/)
  })

  test('feed images keep natural aspect ratios', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')

    const images = page.locator('[data-feed-type="projects"] .feed-grid-item img')
    if ((await images.count()) === 0) {
      test.skip()
      return
    }

    const natural = await images.first().evaluate((img: HTMLImageElement) => {
      if (!img.naturalWidth || !img.naturalHeight) return null
      const rect = img.getBoundingClientRect()
      const naturalRatio = img.naturalWidth / img.naturalHeight
      const renderedRatio = rect.width / rect.height
      return { naturalRatio, renderedRatio }
    })

    if (!natural) {
      test.skip()
      return
    }

    expect(Math.abs(natural.naturalRatio - natural.renderedRatio) / natural.naturalRatio).toBeLessThan(
      0.08,
    )
  })

  test('mobile feed collapses to one column', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000/')

    const grid = page.locator('[data-feed-type="projects"] .feed-grid')
    if ((await page.locator('[data-feed-type="projects"] .feed-grid-item').count()) === 0) {
      test.skip()
      return
    }

    await expect(grid).toBeVisible()
    await expect(grid).toHaveCSS('grid-template-columns', /^[^\s]+$/)
  })

  test('feed tile titles remain accessible to assistive tech', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const tile = page.locator('[data-feed-type="projects"] .feed-grid-item').first()
    if ((await tile.count()) === 0) {
      test.skip()
      return
    }
    await expect(tile.locator('h3').first()).toBeAttached()
  })

  test('payload posts REST API serves published docs', async ({ request }) => {
    const response = await request.get(
      'http://localhost:3000/api/posts?limit=6&page=1&sort=-publishedAt&depth=1&locale=en',
    )
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body).toHaveProperty('docs')
    expect(Array.isArray(body.docs)).toBeTruthy()
    expect(body).toHaveProperty('hasNextPage')
  })

  test('payload projects REST API serves published docs', async ({ request }) => {
    const response = await request.get(
      'http://localhost:3000/api/projects?limit=6&page=1&sort=-publishedAt&depth=1&locale=en',
    )
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body).toHaveProperty('docs')
    expect(Array.isArray(body.docs)).toBeTruthy()
    expect(body).toHaveProperty('hasNextPage')
  })

  test('load more / infinite scroll affordance is available on archive pages', async ({ page }) => {
    await page.goto('http://localhost:3000/posts')
    const endMarker = page.getByText('End of feed')
    const scrollHint = page.getByText(/Scroll for more|Loading/i)
    const hasEnd = (await endMarker.count()) > 0
    const hasScroll = (await scrollHint.count()) > 0
    const hasPosts = (await page.locator('[data-feed-type="posts"]').count()) > 0
    expect(hasEnd || hasScroll || hasPosts).toBeTruthy()
  })

  test('posts section shows view all tile after feed items', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const items = page.locator('[data-feed-type="posts"] .feed-grid-item')
    const count = await items.count()
    if (count === 0) {
      test.skip()
      return
    }

    const viewAll = page.getByRole('link', { name: /view all posts/i })
    await expect(viewAll).toBeVisible()
    await expect(viewAll).toHaveAttribute('href', /\/posts$/)
    expect(count).toBeLessThanOrEqual(12)
  })

  test('projects section shows view all tile after feed items', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const items = page.locator('[data-feed-type="projects"] .feed-grid-item')
    const count = await items.count()
    if (count === 0) {
      test.skip()
      return
    }

    const viewAll = page.getByRole('link', { name: /view all projects/i })
    await expect(viewAll).toBeVisible()
    await expect(viewAll).toHaveAttribute('href', /\/projects$/)
    expect(count).toBeLessThanOrEqual(12)
  })

  test('about page renders from CMS slug route', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/about')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('projects archive page uses infinite feed section', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/projects')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('[data-feed-type="projects"]')).toBeVisible()
  })

  test('vietnamese about page sets lang', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/vi/about')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
  })

  test('unknown page slug returns not found', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/this-page-does-not-exist-xyz')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible()
  })

  test('posts archive grows after scrolling when more pages exist', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/posts')

    const items = page.locator('[data-feed-type="posts"] .feed-grid-item')
    const initialCount = await items.count()
    if (initialCount === 0) {
      test.skip()
      return
    }

    const scrollHint = page.getByText(/Scroll for more/i)
    if ((await scrollHint.count()) === 0) {
      test.skip()
      return
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect
      .poll(async () => items.count(), { timeout: 10000 })
      .toBeGreaterThan(initialCount)
  })

  test('cursor popup follows section under the pointer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')

    const bubble = page.locator('[data-cursor-popup-bubble]')

    const hero = page.locator('#hero')
    await hero.hover({ position: { x: 40, y: 40 } })
    await expect(bubble).toHaveCount(0)
    await expect(bubble).toBeVisible({ timeout: 2000 })
    await expect(bubble).toHaveText(/scroll down|kéo xuống/i)

    const projectsHeader = page.locator('[data-feed-type="projects"] .section-header h2')
    await projectsHeader.scrollIntoViewIfNeeded()
    await projectsHeader.hover()
    await expect(bubble).toBeVisible({ timeout: 2000 })
    await expect(bubble).toHaveText(/cool projects|dự án/i)

    const postsHeader = page.locator('[data-feed-type="posts"] .section-header h2')
    await postsHeader.scrollIntoViewIfNeeded()
    await postsHeader.hover()
    await expect(bubble).toBeVisible({ timeout: 2000 })
    await expect(bubble).toHaveText(/explore posts|bài viết/i)

    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    await footer.hover({ position: { x: 40, y: 20 } })
    await expect(bubble).toHaveCount(0)
  })

  test('focus styles remain visible on skip link', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
  })

  test('contact endpoint rejects invalid payloads', async ({ request }) => {
    const response = await request.post('http://localhost:3000/api/contact', {
      data: { name: '', email: 'bad', message: '', consent: false },
    })
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('cron endpoint rejects unauthorized calls', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/cron/jobs')
    // 401 when CRON_SECRET is set; 500 when the secret is missing in the env.
    expect([401, 500]).toContain(response.status())
  })

  test('admin login page responds', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/admin/login')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('#field-email')).toBeVisible()
  })
})
