import { test, expect } from '@playwright/test'
import { openPostsCarouselFixture } from '../helpers/posts-carousel-fixture'

test.describe('Posts carousel browser checks', () => {
  test('renders mixed image shapes and the Posts header grid', async ({
    page,
  }) => {
    for (const width of [390, 1024, 1440]) {
      await openPostsCarouselFixture(page, { width, height: 900 })
      const heading = page.locator('#fixture-posts-heading')
      await expect(heading).toBeVisible()
      await expect(heading).toHaveCSS('text-align', 'center')
      await expect(page.locator('[data-posts-header]')).toBeVisible()
      await expect(page.getByText('Latest writing from the studio')).toHaveCSS('text-align', 'left')

      const headerLayout = await page.evaluate(() => {
        const section = document.querySelector('[data-feed-type="posts"]')!.getBoundingClientRect()
        const previous = document.querySelector('.page-blocks > div')!.getBoundingClientRect()
        const header = document.querySelector('[data-posts-header]')!.getBoundingClientRect()
        const heading = document.querySelector('#fixture-posts-heading')!.getBoundingClientRect()
        const headingText = document.querySelector('#fixture-posts-heading span')!.getBoundingClientRect()
        const description = document.querySelector('[data-posts-header] p')!.getBoundingClientRect()
        const viewport = document.querySelector('#fixture-posts div[class*="viewport"]')!.getBoundingClientRect()
        const shadow = getComputedStyle(document.querySelector('[data-posts-header]')!).boxShadow
        return {
          sectionX: section.x,
          sectionWidth: section.width,
          previousBottom: previous.bottom,
          sectionTop: section.top,
          headerX: header.x,
          headerWidth: header.width,
          headerTop: header.y,
          headerBottom: header.bottom,
          viewportTop: viewport.top,
          headingTextCenterX: headingText.x + headingText.width / 2,
          headingTextCenterY: headingText.y + headingText.height / 2,
          shadow,
          centerX: header.x + header.width / 2,
          centerY: header.y + header.height / 2,
          headingCenterX: heading.x + heading.width / 2,
          headingCenterY: heading.y + heading.height / 2,
          descriptionX: description.x,
          descriptionY: description.y,
          descriptionHeight: description.height,
          descriptionCenterY: description.y + description.height / 2,
        }
      })
      expect(headerLayout.headerX).toBeCloseTo(headerLayout.sectionX, 0)
      expect(headerLayout.headerWidth).toBeCloseTo(headerLayout.sectionWidth, 0)
      expect(Math.abs(headerLayout.sectionTop - headerLayout.previousBottom)).toBeLessThanOrEqual(1)
      expect(Math.abs(headerLayout.headerBottom - headerLayout.viewportTop)).toBeLessThanOrEqual(1)
      expect(headerLayout.shadow).toContain('-1.5px')
      expect(Math.abs(headerLayout.headingTextCenterX - headerLayout.headingCenterX)).toBeLessThanOrEqual(1)
      expect(Math.abs(headerLayout.headingTextCenterY - headerLayout.headingCenterY)).toBeLessThanOrEqual(1)
      expect(headerLayout.headingCenterX).toBeLessThan(headerLayout.centerX)
      expect(Math.abs(headerLayout.headingCenterY - headerLayout.centerY)).toBeLessThanOrEqual(1)
      expect(headerLayout.descriptionX).toBeGreaterThanOrEqual(headerLayout.centerX - 1)
      expect(headerLayout.descriptionY - headerLayout.headerTop).toBeGreaterThan(
        headerLayout.descriptionHeight * 1.9,
      )
      expect(headerLayout.descriptionCenterY).toBeGreaterThan(headerLayout.centerY)

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
      const bottomRule = await page
        .locator('#fixture-posts div[class*="viewport"]')
        .evaluate((viewport) => getComputedStyle(viewport).boxShadow)
      expect(bottomRule).toContain('inset')
      expect(bottomRule).toContain('-1.5px')
      const stageTopGap = await page.evaluate(() => {
        const viewport = document.querySelector('#fixture-posts div[class*="viewport"]')!.getBoundingClientRect()
        const stage = document.querySelector('[data-flex-carousel-stage]')!.getBoundingClientRect()
        return stage.top - viewport.top
      })
      expect(stageTopGap).toBeCloseTo(64, 0)
    }
  })

  test('keeps focused images clear of captions for each image shape', async ({ page }) => {
    for (const width of [390, 1440]) {
      await openPostsCarouselFixture(page, { width, height: 900 })
      const carousel = page.locator('[role="region"][aria-roledescription="carousel"]').first()
      const caption = page.locator('[data-flex-carousel-caption]')

      for (const [index, title] of ['Portrait Post', 'Square Post', 'Landscape Post'].entries()) {
        if (index > 0) await page.keyboard.press('ArrowRight')
        await expect(caption).toContainText(title)
        await carousel.focus()
        await page.keyboard.press('Enter')
        await page.waitForTimeout(1000)
        await expect(caption.locator('time')).toBeVisible()
        await expect(page.locator('[data-flex-carousel-counter]')).toBeVisible()

        const geometry = await page.evaluate((imageAspect) => {
          const stage = document.querySelector('[data-flex-carousel-stage]')!.getBoundingClientRect()
          const cardHeight = stage.height * 0.5
          const focusScale = Math.max(1, Math.min(1.3, (stage.height * 0.84) / cardHeight, (stage.width * 0.92) / (cardHeight * imageAspect)))
          return {
            stage: document.querySelector('[data-flex-carousel-stage]')?.getBoundingClientRect().toJSON() ?? null,
            canvas: document.querySelector('[data-flex-carousel-stage] canvas')?.getBoundingClientRect().toJSON() ?? null,
            focusedImageBottom: stage.top + stage.height / 2 + (cardHeight * focusScale) / 2,
            caption: document.querySelector('[data-flex-carousel-caption]')?.getBoundingClientRect().toJSON() ?? null,
            title: document.querySelector('[data-flex-carousel-caption] > span.flex')?.getBoundingClientRect().toJSON() ?? null,
            metadata: document.querySelector('[data-flex-carousel-metadata]')?.getBoundingClientRect().toJSON() ?? null,
            date: document.querySelector('[data-flex-carousel-caption] time')?.getBoundingClientRect().toJSON() ?? null,
            counter: document.querySelector('[data-flex-carousel-counter]')?.getBoundingClientRect().toJSON() ?? null,
          }
        }, [2 / 3, 1, 2][index])
        expect(geometry.stage).not.toBeNull()
        expect(geometry.canvas).not.toBeNull()
        expect(geometry.caption).not.toBeNull()
        expect(geometry.title).not.toBeNull()
        expect(geometry.metadata).not.toBeNull()
        expect(geometry.date).not.toBeNull()
        expect(geometry.counter).not.toBeNull()
        if (
          geometry.stage && geometry.canvas && geometry.caption && geometry.title &&
          geometry.metadata && geometry.date && geometry.counter
        ) {
          expect(geometry.canvas.bottom).toBeLessThanOrEqual(geometry.stage.bottom + 1)
          expect(geometry.focusedImageBottom).toBeLessThanOrEqual(geometry.title.top + 1)
          expect(geometry.title.bottom).toBeLessThanOrEqual(geometry.metadata.top + 1)
          expect(geometry.date.bottom).toBeLessThanOrEqual(geometry.counter.top + 1)
          expect(geometry.counter.bottom).toBeLessThanOrEqual(geometry.caption.bottom + 1)
        }

        if (width === 390 && index === 0) {
        }

        await page.keyboard.press('Escape')
        await expect(caption.locator('time')).toBeVisible()
        await expect(page.locator('[data-flex-carousel-counter]')).toBeVisible()
        if (width === 390 && index === 0) {
        }
      }
    }
  })

  test('keeps a long focused title below the image at mobile, tablet, and desktop widths', async ({ page }) => {
    for (const width of [390, 1024, 1440]) {
      await openPostsCarouselFixture(page, { width, height: 900 })
      const carousel = page.locator('[role="region"][aria-roledescription="carousel"]').first()
      await carousel.focus()
      for (let index = 0; index < 5; index += 1) await page.keyboard.press('ArrowRight')
      const caption = page.locator('[data-flex-carousel-caption]')
      await expect(caption).toContainText('A very long post title')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      const boxes = await page.evaluate(() => {
        const stage = document.querySelector('[data-flex-carousel-stage]')!.getBoundingClientRect()
        const title = document.querySelector('[data-flex-carousel-caption] > span.flex')!.getBoundingClientRect()
        const cardHeight = stage.height * 0.5
        const focusScale = Math.max(1, Math.min(1.3, (stage.height * 0.84) / cardHeight, (stage.width * 0.92) / (cardHeight * 2)))
        return { focusedImageBottom: stage.top + stage.height / 2 + cardHeight * focusScale / 2, titleTop: title.top }
      })
      expect(boxes.titleTop).toBeGreaterThanOrEqual(boxes.focusedImageBottom)
      await page.keyboard.press('Escape')
      await expect(caption).toContainText('A very long post title')
      await expect(caption.locator('time')).toBeVisible()
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

  test('clicking the centered card focuses it and Escape closes focus', async ({ page }) => {
    await openPostsCarouselFixture(page, { width: 390, height: 900 })
    const stage = await page.locator('[data-flex-carousel-stage]').boundingBox()
    expect(stage).not.toBeNull()
    if (!stage) return
    await page.mouse.move(stage.x + stage.width / 2, stage.y + stage.height / 2)
    const carousel = page.locator('[role="region"][aria-roledescription="carousel"]').first()
    await expect(carousel).toHaveAttribute('data-hover', 'open')
    await page.mouse.click(stage.x + stage.width / 2, stage.y + stage.height / 2)
    await expect(carousel).toHaveAttribute('data-hover', 'close')
    await page.keyboard.press('Escape')
    await expect(carousel).toHaveAttribute('data-hover', 'open')
  })

  test('keeps post metadata mounted and in place while titles and dates change', async ({ page }) => {
    for (const width of [390, 1280]) {
      await openPostsCarouselFixture(page, { width, height: 900 })
      const carousel = page.locator('[role="region"][aria-roledescription="carousel"]').first()
      const metadata = page.locator('[data-flex-carousel-caption] time').locator('..')
      await expect(metadata).toBeVisible()
      await metadata.evaluate((element) => {
        const state = window as Window & {
          postsMetadata?: Element
          postsTime?: Element
          postsLink?: Element
        }
        state.postsMetadata = element
        state.postsTime = element.querySelector('time') ?? undefined
        state.postsLink = element.querySelector('a') ?? undefined
      })

      const initial = await metadata.evaluate((element) => {
        const time = element.querySelector('time')
        const digits = time?.querySelectorAll('span[style*="translateY"]')
        const link = element.querySelector('a')
        const box = element.getBoundingClientRect()
        const carouselBox = element
          .closest('[role="region"][aria-roledescription="carousel"]')!
          .getBoundingClientRect()
        return {
          digitTransforms: Array.from(digits ?? [], (digit) => (digit as HTMLElement).style.transform),
          dateLabel: time?.getAttribute('aria-label'),
          digitHidden: time?.querySelector('[aria-hidden="true"]')?.getAttribute('aria-hidden'),
          dateTransition: digits?.[0] ? getComputedStyle(digits[0]).transitionDuration : null,
          linkHref: link?.getAttribute('href'),
          y: box.y - carouselBox.y,
          height: box.height,
        }
      })
      expect(initial.linkHref).toBe('/posts/portrait')

      await carousel.focus()
      await page.keyboard.press('ArrowRight')
      await expect(page.getByRole('link', { name: 'Open post: Square Post' })).toBeVisible()
      expect(
        await page
          .locator('[data-flex-carousel-caption] time')
          .locator('..')
          .evaluate((element) => {
            const state = window as Window & {
              postsMetadata?: Element
              postsTime?: Element
              postsLink?: Element
            }
            return (
              state.postsMetadata === element &&
              state.postsTime === element.querySelector('time') &&
              state.postsLink === element.querySelector('a')
            )
          }),
      ).toBe(true)

      await page.keyboard.press('End')
      await page.keyboard.press('ArrowLeft')
      await expect(page.getByRole('link', { name: /^Open post: A very long post title/ })).toBeVisible()

      const active = await page
        .locator('[data-flex-carousel-caption] time')
        .locator('..')
        .evaluate((element) => {
          const time = element.querySelector('time')
          const digits = time?.querySelectorAll('span[style*="translateY"]')
          const box = element.getBoundingClientRect()
          const carouselBox = element
            .closest('[role="region"][aria-roledescription="carousel"]')!
            .getBoundingClientRect()
          let ancestor: HTMLElement | null = element as HTMLElement
          let hasTitleEntranceAnimation = false
          while (ancestor && !ancestor.hasAttribute('data-flex-carousel-caption')) {
            if (getComputedStyle(ancestor).animationName.includes('flex-carousel-title')) {
              hasTitleEntranceAnimation = true
              break
            }
            ancestor = ancestor.parentElement
          }
          return {
            digitTransforms: Array.from(digits ?? [], (digit) => (digit as HTMLElement).style.transform),
            dateLabel: time?.getAttribute('aria-label'),
            digitHidden: time?.querySelector('[aria-hidden="true"]')?.getAttribute('aria-hidden'),
            dateTransition: digits?.[0] ? getComputedStyle(digits[0]).transitionDuration : null,
            linkHref: element.querySelector('a')?.getAttribute('href'),
            hasTitleEntranceAnimation,
            y: box.y - carouselBox.y,
            height: box.height,
          }
        })

      expect(
        await page
          .locator('[data-flex-carousel-caption] time')
          .locator('..')
          .evaluate((element) => {
            const state = window as Window & { postsMetadata?: Element; postsTime?: Element }
            return state.postsMetadata === element && state.postsTime === element.querySelector('time')
          }),
      ).toBe(true)
      expect(active.hasTitleEntranceAnimation).toBe(false)
      expect(initial.digitTransforms.length).toBeGreaterThan(0)
      expect(active.digitTransforms).not.toEqual(initial.digitTransforms)
      expect(active.dateTransition).toBe('0.6s')
      expect(active.dateLabel).toBe('01/07/26')
      expect(initial.dateLabel).toBe('01/02/26')
      expect(active.digitHidden).toBe('true')
      expect(active.linkHref).toBe('/posts/long')
      expect(active.y).toBeCloseTo(initial.y, 0)
      expect(active.height).toBeCloseTo(initial.height, 0)
    }
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
      const horizontal = new WheelEvent('wheel', { cancelable: true, deltaX: 200 })
      const shifted = new WheelEvent('wheel', { cancelable: true, deltaY: 200, shiftKey: true })
      region.dispatchEvent(horizontal)
      region.dispatchEvent(shifted)
      return [horizontal.defaultPrevented, shifted.defaultPrevented]
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
    await expect(page.locator('[data-posts-header]')).toBeVisible()
    await expect(page.getByText('Latest writing from the studio')).toBeVisible()
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
    const dateDigit = page.locator('time span[style*="translateY"]').first()
    await expect(dateDigit).toHaveCSS('transition-property', 'none')
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
