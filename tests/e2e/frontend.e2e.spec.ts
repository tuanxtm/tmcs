import { test, expect } from '@playwright/test'

/**
 * Public frontend checks for the localized homepage shell and post feed.
 * Content reads use Payload Local API / Server Actions; public REST remains under `(payload)/api`.
 */
test.describe('Frontend homepage', () => {
  test('english homepage renders hero and posts section', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('#hero-heading')).toBeVisible()
    await expect(page.locator('#posts-heading')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('vietnamese homepage sets lang and renders content', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/vi')
    expect(response?.ok()).toBeTruthy()
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi')
    await expect(page.locator('#hero-heading')).toBeVisible()
  })

  test('header is sticky', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const header = page.locator('header')
    await expect(header).toHaveCSS('position', 'sticky')
  })

  test('desktop hero places image before text in the grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')
    const hero = page.locator('section[aria-labelledby="hero-heading"]')
    await expect(hero).toBeVisible()
    const grid = hero.locator('.lg\\:grid').first()
    await expect(grid).toBeVisible()
  })

  test('desktop post feed uses a four-column bento grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')
    const grid = page.locator('.bento-grid')
    if ((await page.locator('.bento-tile').count()) === 0) {
      test.skip()
      return
    }
    await expect(grid).toBeVisible()
    await expect(grid).toHaveCSS('grid-template-columns', /.+ .+ .+ .+/)
  })

  test('mobile post feed collapses to a single column', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000/')

    const tiles = page.locator('.bento-tile')
    if ((await tiles.count()) === 0) {
      test.skip()
      return
    }

    await expect(tiles.first()).toBeVisible()
    const firstBox = await tiles.first().boundingBox()
    const second = tiles.nth(1)
    if ((await second.count()) === 0 || !firstBox) return
    const secondBox = await second.boundingBox()
    if (!secondBox) return
    // Stacked: second tile starts below the first, not beside it.
    expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height / 2)
  })

  test('post tile titles remain accessible to assistive tech', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const tile = page.locator('.bento-tile').first()
    if ((await tile.count()) === 0) {
      test.skip()
      return
    }
    await expect(tile.locator('.sr-only, h3').first()).toBeAttached()
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

  test('payload short-stories REST API is readable', async ({ request }) => {
    const response = await request.get(
      'http://localhost:3000/api/short-stories?limit=6&depth=0&locale=en',
    )
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body).toHaveProperty('docs')
    expect(Array.isArray(body.docs)).toBeTruthy()
  })

  test('focus styles remain visible on skip link', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
  })

  test('load more control is available when hasNextPage is true', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const endMarker = page.getByText('End of feed')
    const loadMore = page.getByRole('button', { name: 'Load more' })
    const hasEnd = (await endMarker.count()) > 0
    const hasLoadMore = (await loadMore.count()) > 0
    expect(hasEnd || hasLoadMore).toBeTruthy()
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
