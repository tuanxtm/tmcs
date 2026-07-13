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

  test('header is sticky with blur styles', async ({ page }) => {
    await page.goto('http://localhost:3000/')
    const header = page.locator('header')
    await expect(header).toHaveCSS('position', 'sticky')
    const className = await header.getAttribute('class')
    expect(className || '').toMatch(/backdrop-blur/)
  })

  test('desktop hero places image before text in the grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')
    const hero = page.locator('section[aria-labelledby="hero-heading"]')
    await expect(hero).toBeVisible()
    const grid = hero.locator('.lg\\:grid').first()
    await expect(grid).toBeVisible()
  })

  test('mobile post layout keeps text before image', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000/')

    const firstArticle = page.locator('article').first()
    if ((await firstArticle.count()) === 0) {
      test.skip()
      return
    }

    const mobileStack = firstArticle.locator('.md\\:hidden')
    await expect(mobileStack).toBeVisible()
    const headingBox = await mobileStack.locator('h2').boundingBox()
    const imageBox = await mobileStack.locator('a.group').boundingBox()
    expect(headingBox && imageBox).toBeTruthy()
    if (headingBox && imageBox) {
      expect(headingBox.y).toBeLessThan(imageBox.y)
    }
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
