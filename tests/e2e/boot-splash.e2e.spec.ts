import { expect, test, type Page } from '@playwright/test'
import { createBootSplashFixture } from '../helpers/boot-splash-fixture'

const openFixture = createBootSplashFixture()

async function visibleGreeting(page: Page) {
  return page.locator('[data-boot-greeting]').evaluate((element) =>
    Array.from(element.querySelectorAll(':scope > span > span:first-child'))
      .filter((span) => getComputedStyle(span).opacity === '1')
      .map((span) => span.textContent)
      .join(''),
  )
}

for (const locale of ['en', 'vi']) {
  for (const width of [1440, 320]) {
    test(`${locale} greeting and logo keep animating while loading at ${width}px`, async ({
      page,
    }) => {
      const { finishLoading } = await openFixture(page, { locale, width })
      const splash = page.locator('.boot-splash')
      const greeting = page.locator('[data-boot-greeting]')
      const logo = splash.getByRole('img', { name: 'tuantm' })
      const container = splash.locator(':scope > div')
      const initialBox = await container.boundingBox()
      const textBox = await greeting.boundingBox()
      const logoBox = await logo.boundingBox()
      expect(logoBox!.x + logoBox!.width).toBeLessThan(textBox!.x)
      expect(
        Math.abs(logoBox!.y + logoBox!.height / 2 - textBox!.y - textBox!.height / 2),
      ).toBeLessThan(1)
      expect(initialBox!.x).toBeGreaterThanOrEqual(0)
      expect(initialBox!.x + initialBox!.width).toBeLessThanOrEqual(width)
      await expect(container).toHaveCSS('border-top-style', 'solid')
      await expect
        .poll(() => visibleGreeting(page))
        .toBe(locale === 'en' ? "hi 🖐️, i'm tuantm." : 'xin chào 🖐️, mình là tuấn.')
      expect(await container.boundingBox()).toEqual(initialBox)
      expect(await greeting.boundingBox()).toEqual(textBox)
      await page.waitForTimeout(1100)
      await expect(splash).toBeVisible()
      expect(await page.evaluate(() => document.readyState)).not.toBe('complete')
      const fill = logo.locator('span > span').first()
      const before = await fill.evaluate((element) => getComputedStyle(element).transform)
      await expect
        .poll(() => fill.evaluate((element) => getComputedStyle(element).transform))
        .not.toBe(before)
      finishLoading()
      await page.waitForLoadState('load')
      await expect(splash).toHaveCount(0)
      await expect(page.locator('html')).toHaveClass(/boot-ready/)
      await expect(page.locator('html')).not.toHaveClass(/boot-splash-active/)
      await expect(page.getByRole('main')).toHaveCSS('opacity', '1')
    })
  }
}

test('a splash mounted after load still finishes and reveals the page', async ({ page }) => {
  await openFixture(page, { afterLoad: true })
  await expect(page.locator('.boot-splash')).toHaveCount(0)
  await expect(page.locator('html')).toHaveClass(/boot-ready/)
})

test('reduced motion keeps the load gate and reveals content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const { finishLoading } = await openFixture(page)
  await expect.poll(() => visibleGreeting(page)).toBe("hi 🖐️, i'm tuantm.")
  const fills = page.locator('.boot-splash [role="img"] span > span')
  await expect(fills.first()).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)')
  await page.waitForTimeout(1100)
  await expect(page.locator('.boot-splash')).toBeVisible()
  finishLoading()
  await expect(page.locator('.boot-splash')).toHaveCount(0)
  await expect(page.locator('html')).toHaveClass(/boot-ready/)
})

test('typing follows elapsed animation time across a busy main thread', async ({ page }) => {
  const { finishLoading } = await openFixture(page)
  const fill = page.locator('.boot-splash [role="img"] span > span').first()
  const animationTime = await fill.evaluate((element) =>
    Number(element.getAnimations()[0].currentTime),
  )
  await page.evaluate(() => {
    const end = performance.now() + 1500
    while (performance.now() < end) {
      /* Simulate startup work. */
    }
  })
  await page.evaluate(() => new Promise(requestAnimationFrame))
  expect(await visibleGreeting(page)).toBe("hi 🖐️, i'm tuantm.")
  expect(
    await fill.evaluate((element) => Number(element.getAnimations()[0].currentTime)),
  ).toBeGreaterThan(animationTime + 1400)
  await expect(page.locator('.boot-splash')).toBeVisible()
  finishLoading()
  await expect(page.locator('.boot-splash')).toHaveCount(0)
})
