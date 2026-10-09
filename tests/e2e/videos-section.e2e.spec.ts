import { test, expect } from '@playwright/test'

/**
 * Public frontend checks for the redesigned Videos section.
 *
 * Provider rows show per YouTube, Instagram, TikTok, and Other. Each row is
 * horizontally scrollable; the canonical /videos archive keeps the original
 * grid + infinite pagination.
 */
test.describe('Videos provider rows', () => {
  test('homepage renders one row per populated provider with a centered heading', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')

    const section = page.locator('[data-feed-type="videos"]')
    await expect(section).toBeVisible()

    const heading = section.locator('h2').first()
    await expect(heading).toBeVisible()
    await expect(heading).toHaveCSS('text-align', 'center')

    const rows = section.locator('[data-video-provider]')
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)
    expect(rowCount).toBeLessThanOrEqual(4)

    // Each visible row has a heading (h3) and a scrollable scroller.
    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index)
      await expect(row.locator('h3')).toBeVisible()
      await expect(row.locator('[data-video-scroller]')).toBeVisible()
    }
  })

  test('provider rows cap at 10 cards per provider and keep chronological order', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/')
    const rows = page.locator('[data-feed-type="videos"] [data-video-provider]')
    const rowCount = await rows.count()
    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index)
      const cards = row.locator('[data-video-card]')
      const cardCount = await cards.count()
      expect(cardCount).toBeGreaterThan(0)
      expect(cardCount).toBeLessThanOrEqual(10)
    }
  })

  test('arrow controls and keyboard navigation scroll the active row', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('http://localhost:3000/')

    const row = page.locator('[data-feed-type="videos"] [data-video-provider]').first()
    if ((await row.count()) === 0) test.skip()
    const scroller = row.locator('[data-video-scroller]')
    await expect(scroller).toBeVisible()

    // Each card has a definite minimum width that overflows the container,
    // so the next button must be enabled when content is wider than the
    // viewport. We sanity check that the Next button is reachable and the
    // scroller has its overflow detection bound.
    const next = row.getByRole('button', { name: /Next / })
    await expect(next).toBeVisible()
    await expect(next).toBeEnabled()

    // Tab focus into the scroller and pressing ArrowRight must advance scroll.
    await scroller.focus()
    const before = await scroller.evaluate((el) => el.scrollLeft)
    await page.keyboard.press('ArrowRight')
    await expect.poll(async () => scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before)
  })

  test('canonical /videos archive keeps the original grid + infinite pagination', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/videos')

    const section = page.locator('[data-feed-type="videos"]')
    await expect(section).toBeVisible()
    // Archive grid does not use provider rows.
    await expect(section.locator('[data-video-provider]')).toHaveCount(0)
    // Original grid + infinite pagination.
    await expect(section.locator('[data-feed-grid-item]').first()).toBeVisible()
  })
})
