import { test, expect } from '@playwright/test'
import { openPostsCarouselFixture } from '../helpers/posts-carousel-fixture'

test.describe('Posts carousel browser checks', () => {
  test('renders natural mixed image shapes and a centered Projects-style heading', async ({
    page,
  }) => {
    for (const width of [390, 1024, 1440]) {
      await openPostsCarouselFixture(page, { width, height: 900 })
      const heading = page.locator('#fixture-posts-heading')
      await expect(heading).toBeVisible()
      await expect(heading).toHaveCSS('text-align', 'center')

      // The reserved viewport must have non-zero height and not overflow the
      // document horizontally at any of the supported widths.
      const metrics = await page.evaluate(() => {
        const section = document.querySelector('[data-feed-type="posts"]') as HTMLElement | null
        const viewport = section?.querySelector('div[class*="viewport"]') as HTMLElement | null
        const canvas = viewport?.querySelector('canvas') as HTMLCanvasElement | null
        return {
          docWidth: document.documentElement.scrollWidth,
          windowWidth: window.innerWidth,
          viewportHeight: viewport?.getBoundingClientRect().height ?? 0,
          viewportWidth: viewport?.getBoundingClientRect().width ?? 0,
          canvasWidth: canvas?.width ?? 0,
          canvasHeight: canvas?.height ?? 0,
        }
      })
      expect(metrics.docWidth).toBeLessThanOrEqual(metrics.windowWidth)
      expect(metrics.viewportHeight).toBeGreaterThan(0)
      expect(metrics.viewportWidth).toBeGreaterThan(0)
      expect(metrics.canvasWidth).toBeGreaterThan(0)
      expect(metrics.canvasHeight).toBeGreaterThan(0)
    }
  })

  test('keyboard navigation updates the inline caption and its active post link', async ({
    page,
  }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900 })
    const viewport = page.locator('[role="region"][aria-roledescription="carousel"]').first()
    await viewport.focus()
    const firstLink = page.getByRole('link', { name: 'Open post: Portrait Post' })
    await expect(firstLink).toHaveAttribute('href', '/posts/portrait')
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('link', { name: 'Open post: Square Post' })).toHaveAttribute(
      'href',
      '/posts/square',
    )
    await expect(page.locator('[data-flex-carousel-counter]')).toBeVisible()
  })

  test('renders one inline caption with native date and link semantics', async ({ page }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900 })
    const caption = page.locator('[data-flex-carousel-caption]')
    await expect(caption).toBeVisible()
    const title = caption.getByText('Portrait Post')
    await expect(title).toBeVisible()
    await expect(caption.locator('time')).toHaveAttribute('datetime', '2026-01-02T00:00:00.000Z')
    const link = page.getByRole('link', { name: 'Open post: Portrait Post' })
    await expect(link).toBeVisible()
    const titleFont = await title.evaluate((element) => getComputedStyle(element).fontFamily)
    const timeFont = await caption
      .locator('time')
      .evaluate((element) => getComputedStyle(element).fontFamily)
    const linkFont = await link.evaluate((element) => getComputedStyle(element).fontFamily)
    const counter = page.locator('[data-flex-carousel-counter]')
    await expect(counter).toBeVisible()
    const counterFont = await counter.evaluate((element) => getComputedStyle(element).fontFamily)
    expect(titleFont).toMatch(/Georgia|serif/i)
    expect(timeFont).toMatch(/monospace/i)
    expect(linkFont).toMatch(/monospace/i)
    expect(counterFont).toMatch(/monospace/i)
    await expect(link).toHaveCSS('color', 'rgb(59, 91, 219)')
    await expect(link).toHaveCSS('text-decoration-line', 'none')
    await link.hover()
    await expect(link).toHaveCSS('text-decoration-line', 'underline')
    await expect(page.locator('a[aria-label="Open post: Portrait Post"]')).toHaveCount(1)
  })

  test('vertical wheel over the carousel scrolls the page without changing the active post', async ({
    page,
  }) => {
    await openPostsCarouselFixture(page, { width: 390, height: 844 })
    const viewport = page.locator('[role="region"][aria-roledescription="carousel"]').first()
    await viewport.scrollIntoViewIfNeeded()
    const before = await page.evaluate(() => window.scrollY)
    const activeCaption = page.locator('[data-flex-carousel-caption]')
    const activeTitle = await activeCaption.getByText('Portrait Post').innerText()
    const activeHref = await activeCaption.getByRole('link').getAttribute('href')
    const box = await viewport.boundingBox()
    expect(box).not.toBeNull()
    if (!box) return
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, 240)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 20)
    await expect(activeCaption.getByText(activeTitle)).toBeVisible()
    await expect(activeCaption.getByRole('link')).toHaveAttribute('href', activeHref!)
  })

  test('horizontal and shift wheel input do not change the active carousel item', async ({
    page,
  }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900 })
    const viewport = page.locator('[role="region"][aria-roledescription="carousel"]').first()
    await viewport.scrollIntoViewIfNeeded()
    const caption = page.locator('[data-flex-carousel-caption]')
    const activeTitle = await caption.getByText('Portrait Post').innerText()
    const activeHref = await caption.getByRole('link').getAttribute('href')
    const results = await page.evaluate(() => {
      const region = document.querySelector('[role="region"][aria-roledescription="carousel"]')!
      const dispatch = (deltaX: number, deltaY: number, shiftKey: boolean) => {
        const event = new WheelEvent('wheel', { cancelable: true, deltaX, deltaY, shiftKey })
        region.dispatchEvent(event)
        return event.defaultPrevented
      }
      return [dispatch(200, 0, false), dispatch(0, 200, true)]
    })
    await page.waitForTimeout(300)
    expect(results).toEqual([false, false])
    await expect(caption.getByText(activeTitle)).toBeVisible()
    await expect(caption.getByRole('link')).toHaveAttribute('href', activeHref!)
  })

  test('Enter on the inline post link performs native navigation', async ({ page }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900 })
    const link = page.getByRole('link', { name: 'Open post: Portrait Post' })
    await link.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/posts\/portrait$/)
  })

  test('clicking the inline post link performs native navigation', async ({ page }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900 })
    await page.getByRole('link', { name: 'Open post: Portrait Post' }).click()
    await expect(page).toHaveURL(/\/posts\/portrait$/)
  })

  test('contains the carousel heading and link at mobile and desktop sizes', async ({ page }) => {
    for (const width of [390, 1440]) {
      await openPostsCarouselFixture(page, { width, height: 900 })
      const heading = page.locator('#fixture-posts-heading')
      await expect(heading).toBeVisible()
      const link = page.getByRole('link', { name: /^Open post:/ }).first()
      await expect(link).toBeVisible()
      const caption = page.locator('[data-flex-carousel-caption]')
      if (width === 390) {
        const region = page.locator('[role="region"][aria-roledescription="carousel"]').first()
        await region.focus()
        await page.keyboard.press('End')
        await expect(caption).toContainText('No link post')
        await page.keyboard.press('ArrowLeft')
        await expect(caption).toContainText('A very long post title')
      }
      const activeLink = page.getByRole('link', {
        name: 'Open post: A very long post title that should not break the layout even on mobile devices',
      })
      if (width === 390) await expect(activeLink).toBeVisible()
      const activeCaption = width === 390 ? caption : page.locator('[data-flex-carousel-caption]')
      const activeTitle =
        width === 390
          ? activeCaption.getByText(
              'A very long post title that should not break the layout even on mobile devices',
            )
          : activeCaption.getByText('Portrait Post')
      const activeTime = activeCaption.locator('time')
      const activePostLink = activeCaption.getByRole('link', { name: /^Open post:/ })
      await expect(activeTime).toBeVisible()
      await expect(activePostLink).toBeVisible()
      await expect(activeCaption.getByRole('link', { name: /^Open post:/ })).toHaveCount(1)
      const [regionBox, captionBox, titleBox, timeBox, linkRowBox] = await Promise.all([
        page.locator('[role="region"][aria-roledescription="carousel"]').first().boundingBox(),
        activeCaption.boundingBox(),
        activeTitle.boundingBox(),
        activeTime.boundingBox(),
        activePostLink.boundingBox(),
      ])
      expect(regionBox).not.toBeNull()
      expect(captionBox).not.toBeNull()
      expect(titleBox).not.toBeNull()
      expect(timeBox).not.toBeNull()
      expect(linkRowBox).not.toBeNull()
      if (regionBox && captionBox && titleBox && timeBox && linkRowBox) {
        expect(captionBox.x).toBeGreaterThanOrEqual(regionBox.x - 1)
        expect(captionBox.x + captionBox.width).toBeLessThanOrEqual(
          regionBox.x + regionBox.width + 1,
        )
        expect(titleBox.x).toBeGreaterThanOrEqual(regionBox.x - 1)
        expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(regionBox.x + regionBox.width + 1)
        expect(
          Math.abs(timeBox.y + timeBox.height / 2 - linkRowBox.y - linkRowBox.height / 2),
        ).toBeLessThanOrEqual(2)
        expect(linkRowBox.x).toBeGreaterThan(timeBox.x + timeBox.width)
        for (const box of [titleBox, timeBox, linkRowBox]) {
          expect(box.y + box.height).toBeLessThanOrEqual(regionBox.y + regionBox.height + 1)
        }
      }
      const linkBox = await link.boundingBox()
      expect(linkBox).not.toBeNull()
      if (linkBox) {
        expect(linkBox.width).toBeGreaterThan(0)
        // The inline native link remains a usable touch target.
        expect(linkBox.height).toBeGreaterThanOrEqual(12)
      }
    }
  })

  test('retains usable navigation after a failed texture (broken image src)', async ({ page }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900, case: 'broken' })
    // The carousel still mounts and renders the active post link in its caption.
    const link = page.getByRole('link', { name: /^Open post:/ }).first()
    await expect(link).toBeVisible()
    const docsCount = await page.evaluate(() => {
      return document.querySelectorAll('canvas').length
    })
    expect(docsCount).toBeGreaterThan(0)
  })

  test('shows no carousel and no demo items when docs are empty', async ({ page }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900, case: 'empty' })
    // No carousel viewport and no canvas should be mounted.
    const viewports = await page.locator('[role="region"][aria-roledescription="carousel"]').count()
    expect(viewports).toBe(0)
    const canvases = await page.locator('canvas').count()
    expect(canvases).toBe(0)
  })

  test('uses a neutral raster fallback when every post has no image', async ({ page }) => {
    await openPostsCarouselFixture(page, { width: 1280, height: 900, case: 'missing' })
    // Carousel still mounts with 6 items (one per post).
    const viewports = await page.locator('[role="region"][aria-roledescription="carousel"]').count()
    expect(viewports).toBe(1)
    // Open post link is present because the first post has a public href.
    await expect(page.getByRole('link', { name: /^Open post:/ }).first()).toBeVisible()
  })

  test('reduced-motion still allows navigation', async ({ page }) => {
    await openPostsCarouselFixture(page, {
      width: 1280,
      height: 900,
      reducedMotion: true,
    })
    // Page should still mount and the active link should still be present.
    await expect(page.getByRole('link', { name: /^Open post:/ }).first()).toBeVisible()
  })

  test('does not throw runtime/hydration errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await openPostsCarouselFixture(page, { width: 1280, height: 900 })
    await page.waitForTimeout(300)
    expect(errors.filter((msg) => !msg.includes('Failed to load resource'))).toEqual([])
  })
})
