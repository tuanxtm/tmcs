import { expect, test, type Page } from '@playwright/test'
import { createHeaderNavFixture } from '../helpers/header-nav-fixture'

const openHeaderNavFixture = createHeaderNavFixture()

async function ready(page: Page, path = '/') {
  await page.goto(`http://localhost:3000${path}`)
  await expect(page.locator('html')).toHaveClass(/boot-ready/)
  await expect(page.locator('.boot-splash')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
}

test('outer and inner tokens control frame, separators, grids, and cursor', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  try {
    await ready(page)
    await page.mouse.move(600, 300)
    const frame = page.locator('[data-site-frame]')
    expect(await frame.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('1.5px inset')
    expect(
      await page
        .locator('.page-blocks > header')
        .evaluate((el) => getComputedStyle(el, '::after').height),
    ).toBe('1.5px')
    await expect(page.locator('#hero [data-hero-image]').locator('xpath=..')).toHaveCSS(
      'border-bottom-width',
      '1px',
    )
    await expect(page.locator('#hero [data-hero-links]')).toHaveCSS('border-bottom-width', '1px')
    await expect(page.locator('#hero [data-hero-scroll]')).toHaveCSS('border-bottom-width', '1px')
    expect(await page.locator('#hero').evaluate((el) => getComputedStyle(el).boxShadow)).toContain(
      '-1.5px',
    )
    const cross = page.locator('[data-cursor-cross-root]')
    await expect(cross.locator(':scope > div').first()).toHaveCSS('height', '1px')
    await expect(cross.locator(':scope > div').last()).toHaveCSS('width', '1px')
    const canvases = page.locator('[data-project-canvas], [data-thing-canvas]')
    expect(await canvases.count()).toBeGreaterThan(0)
    const frameBounds = (await frame.boundingBox())!
    for (const canvas of await canvases.all()) {
      const bounds = (await canvas.boundingBox())!
      expect(bounds.x).toBeCloseTo(frameBounds.x, 0)
      expect(bounds.width).toBeCloseTo(frameBounds.width, 0)
      const shadow = await canvas.evaluate((el) => getComputedStyle(el).boxShadow)
      expect(shadow).toContain('1.5px')
      expect(shadow).toContain('-1.5px')
      await expect(canvas).toHaveCSS('border-left-width', '0px')
      expect(
        await canvas.evaluate((el) => getComputedStyle(el).getPropertyValue('--columns')),
      ).toBe('4')
    }
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--outer-line-weight', '3px')
      document.documentElement.style.setProperty('--inner-line-weight', '2px')
    })
    expect(await frame.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('3px inset')
    expect(await page.locator('#hero').evaluate((el) => getComputedStyle(el).boxShadow)).toContain(
      '-3px',
    )
    await expect(cross.locator(':scope > div').first()).toHaveCSS('height', '2px')
    await expect(page.locator('header nav > ul > li').first()).toHaveCSS('border-left-width', '2px')
    expect(await canvases.first().evaluate((el) => getComputedStyle(el).boxShadow)).toContain(
      '-3px',
    )
    expect(await canvases.first().evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
      '2px',
    )
    await page.evaluate(() => {
      document.documentElement.style.removeProperty('--outer-line-weight')
      document.documentElement.style.removeProperty('--inner-line-weight')
    })
    await canvases.first().scrollIntoViewIfNeeded()
    await page.screenshot({ path: '/tmp/tmcs-blueprint-wide-grid.png' })
  } finally {
    await context.close()
  }
})

for (const locale of ['en', 'vi']) {
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [320, 568],
  ]) {
    test(`${locale} skeleton at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await ready(page, locale === 'vi' ? '/vi' : '/')
      const geometry = await page.evaluate(() => {
        return {
          header: document.querySelector('header')!.getBoundingClientRect().toJSON(),
          hero: document.querySelector('#hero')!.getBoundingClientRect().toJSON(),
          frame: document.querySelector('[data-site-frame]')!.getBoundingClientRect().toJSON(),
          image: document.querySelector('[data-hero-image]')!.getBoundingClientRect().toJSON(),
          text: document.querySelector('[data-hero-rich-text]')!.getBoundingClientRect().toJSON(),
          links: document.querySelector('[data-hero-links]')!.getBoundingClientRect().toJSON(),
          scroll: document.querySelector('[data-hero-scroll]')!.getBoundingClientRect().toJSON(),
          width: document.documentElement.scrollWidth,
          viewport: innerWidth,
        }
      })
      expect(geometry.width).toBe(geometry.viewport)
      expect(Math.abs(geometry.hero.top - geometry.header.bottom)).toBeLessThan(2)
      expect(geometry.frame.top).toBe(width < 1024 ? 8 : 10)
      await expect(page.locator('[data-hero-scroll]')).toHaveText(
        locale === 'vi' ? 'CUỘN XUỐNG' : 'SCROLL DOWN',
      )
      if (width < 1024) {
        expect(geometry.image.bottom).toBeLessThanOrEqual(geometry.text.top)
        expect(geometry.text.bottom).toBeLessThanOrEqual(geometry.links.top)
        expect(geometry.links.bottom).toBeLessThanOrEqual(geometry.scroll.top)
        await expect(page.locator('[data-hero-decoration]')).toBeHidden()
        await expect(page.locator('[data-hero-scales]')).toBeHidden()
        await page
          .getByRole('button', { name: locale === 'vi' ? 'Mở menu' : 'Open menu', exact: true })
          .click()
        const panel = await page.locator('header nav').boundingBox()
        expect(Math.abs(panel!.x - (geometry.header.x + geometry.header.width / 2))).toBeLessThan(2)
        expect(Math.abs(panel!.width - geometry.header.width / 2)).toBeLessThan(2)
        const heroAfter = await page.locator('#hero').boundingBox()
        expect(heroAfter!.y).toBe(geometry.hero.top)
        await page.keyboard.press('Escape')
        await expect(page.locator('header nav')).toBeHidden()
      } else {
        expect(geometry.image.left).toBeGreaterThan(geometry.text.left)
        await expect(page.locator('[data-hero-scales]')).toBeVisible()
        // Short content must fill the fold; long content remains unconstrained.
        await page.locator('[data-hero-rich-text]').evaluate((element) => {
          element.textContent = 'Short hero content'
        })
        const hero = await page.locator('#hero').boundingBox()
        expect(Math.abs(hero!.y + hero!.height - geometry.frame.bottom)).toBeLessThan(2)
      }
      await page.screenshot({ path: `/tmp/tmcs-blueprint-${locale}-${width}.png` })
    })
  }
}

test('fixed frame, native scroll, scroll control, and long content growth', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 1440, height: 900 })
  await ready(page)
  await expect(page.locator('html')).toHaveCSS('scrollbar-width', 'none')
  const frame = await page.locator('[data-site-frame]').boundingBox()
  await page.mouse.wheel(0, 500)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
  expect(await page.locator('[data-site-frame]').boundingBox()).toEqual(frame)
  await page.keyboard.press('Home')
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.locator('[data-hero-scroll]').click()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const target = document.querySelector('[id^="after-hero-"]')!
        return Math.abs(
          target.getBoundingClientRect().top - parseFloat(getComputedStyle(target).scrollMarginTop),
        )
      }),
    )
    .toBeLessThan(2)
  await page.evaluate(() => window.scrollTo(0, 0))
  const before = await page.locator('#hero').boundingBox()
  await page.locator('[data-hero-rich-text]').evaluate((element) => {
    element.textContent = 'Long content that must remain readable. '.repeat(150)
    ;(element as HTMLElement).style.fontSize = '48px'
  })
  const after = await page.locator('#hero').boundingBox()
  expect(after!.height).toBeGreaterThan(before!.height)
  await expect(page.locator('[data-hero-rich-text]')).not.toHaveCSS('overflow-y', 'auto')
  await page.evaluate(() => window.scrollTo(0, 500))
  const header = await page.locator('.page-blocks > header').boundingBox()
  expect(header!.y).toBeLessThan(0)
  expect(errors).toEqual([])
})

test('frame clipping, navigation order, label sizes, and rising hover fills', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await ready(page)
  const navigation = page.locator('header nav')
  await expect(navigation.locator('a').first()).toHaveText('EN/VI')
  await expect(page.locator('[data-site-frame] > *')).toHaveCount(0)
  await expect(page.locator('#hero [class*="rulers"]')).toHaveCount(0)
  const frameStyle = await page.locator('[data-site-frame]').evaluate((element) => ({
    border: getComputedStyle(element).borderTopWidth,
    shadow: getComputedStyle(element).boxShadow,
    layer: getComputedStyle(element).zIndex,
  }))
  expect(frameStyle.border).toBe('0px')
  expect(frameStyle.shadow).not.toBe('none')
  expect(Number(frameStyle.layer)).toBeGreaterThan(50)
  await page.mouse.move(600, 300)
  await expect(page.locator('[data-cursor-cross-root]')).toHaveCSS('clip-path', 'inset(11.5px)')
  await expect(page.locator('[data-cursor-popup-root]')).toHaveCSS('clip-path', 'inset(11.5px)')
  const navSize = await navigation
    .locator('a')
    .first()
    .evaluate((element) => getComputedStyle(element).fontSize)
  const scroll = page.locator('[data-hero-scroll]')
  await expect(scroll).toHaveCSS('font-size', navSize)
  for (const label of await page.locator('[data-hero-links] p').all()) {
    await expect(label).toHaveCSS('font-size', navSize)
  }
  const expected = await page.evaluate(() => {
    const probe = document.createElement('span')
    document.body.appendChild(probe)
    probe.style.color = 'var(--accent)'
    const accent = getComputedStyle(probe).color
    probe.style.color = 'var(--accent-foreground)'
    const foreground = getComputedStyle(probe).color
    probe.remove()
    return { accent, foreground }
  })
  const finalItem = navigation.locator('[data-final="true"] > div > a')
  if (await finalItem.count()) {
    await expect(finalItem).toHaveCSS('color', expected.accent)
    await expect(finalItem.locator('svg')).toHaveCSS('color', expected.accent)
  }
  await expect(scroll).toHaveCSS('color', expected.accent)
  const navLink = navigation.locator('a').first()
  const navBorder = await navLink.evaluate((element) => {
    const style = getComputedStyle(element)
    return { width: style.borderWidth, color: style.borderColor }
  })
  await expect(navLink).toHaveCSS('box-shadow', 'none')
  await navLink.hover()
  await expect(navLink).toHaveCSS('color', expected.foreground)
  await expect(navLink).toHaveCSS('box-shadow', 'none')
  await expect(navLink).toHaveCSS('border-width', navBorder.width)
  await expect(navLink).toHaveCSS('border-color', navBorder.color)
  await expect
    .poll(() => navLink.evaluate((element) => getComputedStyle(element, '::before').transform))
    .toBe('matrix(1, 0, 0, 1, 0, 0)')
  await expect
    .poll(() => navLink.evaluate((element) => getComputedStyle(element, '::before').inset))
    .toBe('0px')
  await page.mouse.move(600, 300)
  await expect(navLink).toHaveCSS('box-shadow', 'none')
  await expect(navLink).toHaveCSS('border-width', navBorder.width)
  await expect(navLink).toHaveCSS('border-color', navBorder.color)
  await scroll.hover()
  await expect(scroll).toHaveCSS('color', expected.foreground)
  await expect(scroll.locator('svg')).toHaveCSS('color', expected.foreground)
  await expect
    .poll(() => scroll.evaluate((element) => getComputedStyle(element, '::before').transform))
    .toBe('matrix(1, 0, 0, 1, 0, 0)')
  await navLink.focus()
  await expect
    .poll(() => navLink.evaluate((element) => getComputedStyle(element, '::before').transform))
    .toBe('matrix(1, 0, 0, 1, 0, 0)')
  await page.screenshot({ path: '/tmp/tmcs-blueprint-hover.png' })
  await page.mouse.move(600, 300)
  await page.evaluate(() => window.scrollTo(0, 500))
  await page.screenshot({ path: '/tmp/tmcs-blueprint-frame-scroll.png' })
})

test('translucent blueprint rules, shared grids, and matching navigation and view-all geometry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await ready(page)
  await page.mouse.move(600, 300)

  const colors = await page.evaluate(() => {
    const probe = document.createElement('span')
    document.body.appendChild(probe)
    probe.style.color = 'var(--accent)'
    const accent = getComputedStyle(probe).color
    probe.style.color = 'var(--site-rule-color)'
    const rule = getComputedStyle(probe).color
    probe.style.color = 'var(--accent-foreground)'
    const foreground = getComputedStyle(probe).color
    probe.style.color = 'var(--site-grid-line-color)'
    const gridLine = getComputedStyle(probe).color
    probe.remove()
    const frame = getComputedStyle(document.querySelector('[data-site-frame]')!).boxShadow
    const separator = getComputedStyle(document.querySelector('#hero')!).boxShadow
    const canvas = getComputedStyle(document.querySelector('[data-project-canvas]')!).boxShadow
    const grid = getComputedStyle(document.querySelector('[data-project-canvas]')!).backgroundImage
    const scales = getComputedStyle(
      document.querySelector('[data-hero-scales] > div > div')!,
    ).backgroundImage
    const canvasStyle = getComputedStyle(document.querySelector('[data-project-canvas]')!)
    const topRule = canvasStyle.borderTopWidth
    const cursorLine = getComputedStyle(
      document.querySelector('[data-cursor-cross-root] > div')!,
    ).backgroundColor
    return {
      accent,
      rule,
      foreground,
      frame,
      separator,
      canvas,
      grid,
      scales,
      topRule,
      gridLine,
      cursorLine,
    }
  })
  expect(colors.rule).toMatch(/\/\s*0\.5\)/)
  for (const structuralLine of [colors.frame, colors.separator, colors.canvas]) {
    expect(structuralLine).toMatch(/\/\s*0\.5\)/)
  }
  expect(colors.topRule).toBe('0px')
  expect(colors.canvas).toContain('-1.5px 0px 0px inset')
  expect(colors.grid).toContain('linear-gradient')
  expect(colors.grid).toMatch(/0\.1|10%/)
  expect(colors.scales).toContain('linear-gradient')
  expect(colors.scales).toMatch(/0\.1|10%/)
  expect(colors.grid).toContain(colors.gridLine)
  expect(colors.scales).toContain(colors.gridLine)
  expect(colors.cursorLine).toMatch(/0\.2|20%/)

  const scroll = page.locator('[data-hero-scroll]')
  const scrollWidth = (await scroll.boundingBox())!.width
  const headerCells = page.locator('header nav > ul > li')
  expect(await headerCells.count()).toBeGreaterThan(1)
  for (const cell of await headerCells.all()) {
    expect((await cell.boundingBox())!.width).toBeCloseTo(scrollWidth, 0)
  }

  const viewAllTiles = page.locator('[data-canvas-view-all]')
  await expect(viewAllTiles).toHaveCount(2)
  for (const [index, tile] of (await viewAllTiles.all()).entries()) {
    const tileBox = (await tile.boundingBox())!
    const headerHeight = (await page.locator('.page-blocks > header').boundingBox())!.height
    expect(tileBox.height).toBeCloseTo(headerHeight, 0)
    const scales = (await tile.locator('[data-canvas-view-all-scales]').boundingBox())!
    const link = tile.locator('[data-canvas-view-all-link]')
    const linkBox = (await link.boundingBox())!
    await link.scrollIntoViewIfNeeded()
    const tileBoundsBeforeHover = await link.boundingBox()
    const borderBeforeHover = await link.evaluate((element) => {
      const style = getComputedStyle(element)
      return { width: style.borderWidth, color: style.borderColor }
    })
    expect(scales.width / tileBox.width).toBeCloseTo(0.9, 1)
    expect(linkBox.width).toBeCloseTo(scrollWidth, 0)
    await expect(link).toHaveCSS('box-shadow', 'none')
    const href = await link.getAttribute('href')
    expect(new URL(href!, page.url()).pathname).toMatch(/\/(projects|things)$/)
    await link.hover()
    await expect(link).toHaveCSS('color', colors.foreground)
    await expect(link).toHaveCSS('box-shadow', 'none')
    await expect(link).toHaveCSS('border-width', borderBeforeHover.width)
    await expect(link).toHaveCSS('border-color', borderBeforeHover.color)
    await expect(link.locator('svg')).toHaveCSS('color', colors.foreground)
    await expect
      .poll(() => link.evaluate((element) => getComputedStyle(element, '::before').transform))
      .toBe('matrix(1, 0, 0, 1, 0, 0)')
    await expect
      .poll(() => link.evaluate((element) => getComputedStyle(element, '::before').inset))
      .toBe('0px')
    expect(await link.boundingBox()).toEqual(tileBoundsBeforeHover)
    await page.mouse.move(600, 300)
    await expect(link).toHaveCSS('box-shadow', 'none')
    await expect(link).toHaveCSS('border-width', borderBeforeHover.width)
    await expect(link).toHaveCSS('border-color', borderBeforeHover.color)
    expect(await link.boundingBox()).toEqual(tileBoundsBeforeHover)
    await link.focus()
    await expect
      .poll(() => link.evaluate((element) => getComputedStyle(element, '::before').transform))
      .toBe('matrix(1, 0, 0, 1, 0, 0)')
    expect(await link.getAttribute('href')).toBe(href)
    if (index === 0) await page.screenshot({ path: '/tmp/tmcs-blueprint-view-all-desktop.png' })
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => page.locator('[data-canvas-view-all]').count()).toBe(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
  for (const tile of await viewAllTiles.all()) {
    const tileBox = (await tile.boundingBox())!
    const headerHeight = (await page.locator('.page-blocks > header').boundingBox())!.height
    expect(tileBox.height).toBeCloseTo(headerHeight, 0)
    const scales = (await tile.locator('[data-canvas-view-all-scales]').boundingBox())!
    const link = (await tile.locator('[data-canvas-view-all-link]').boundingBox())!
    expect(scales.width / tileBox.width).toBeCloseTo(0.5, 1)
    expect(link.width / tileBox.width).toBeCloseTo(0.5, 1)
  }
  await viewAllTiles.last().scrollIntoViewIfNeeded()
  await page.screenshot({ path: '/tmp/tmcs-blueprint-view-all-mobile.png' })
})

test('desktop navigation hover keeps the pointer path into the submenu', async ({ page }) => {
  await openHeaderNavFixture(page)
  const parent = page.getByRole('link', { name: 'Work', exact: true })
  await expect(parent).toHaveAttribute('href', '/projects')
  const parentBox = (await parent.boundingBox())!
  await page.mouse.move(parentBox.x + parentBox.width / 2, parentBox.y + parentBox.height / 2)
  await expect(parent).toHaveAttribute('aria-expanded', 'true')
  const child = page.getByRole('link', { name: 'Posts' })
  await expect(child).toBeVisible()
  await child.hover()
  await expect(parent).toHaveAttribute('aria-expanded', 'true')
  const parentFill = await parent.evaluate((element) => ({
    color: getComputedStyle(element).color,
    fill: getComputedStyle(element, '::before').transform,
    corner: getComputedStyle(element.querySelector('span')!).transform,
    cornerTop: getComputedStyle(element.querySelector('span')!).top,
  }))
  await expect
    .poll(() => parent.evaluate((element) => getComputedStyle(element, '::before').transform))
    .toBe('matrix(1, 0, 0, 1, 0, 0)')
  expect(parentFill.corner).toBe('matrix(0, -1, 1, 0, 0, 0)')
  expect(parentFill.cornerTop).toBe('10px')
  await page.screenshot({ path: '/tmp/tmcs-nav-desktop-open.png' })

  await child.focus()
  await page.mouse.move(800, 500)
  await expect(parent).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(parent).toHaveAttribute('aria-expanded', 'false')
  await expect(parent).toBeFocused()
})

test('mobile navigation rows share height and the parent toggles without navigation', async ({
  page,
}) => {
  await openHeaderNavFixture(page, 320)
  const panel = page.getByRole('navigation', { name: 'Primary' })
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(panel).toBeVisible()
  const parent = page.getByRole('link', { name: 'Work', exact: true })
  await expect(parent).toHaveAttribute('href', '/projects')
  await parent.click()
  await expect(parent).toHaveAttribute('aria-expanded', 'true')
  await expect(page).toHaveURL('http://header-nav.test/')
  await expect
    .poll(() => parent.evaluate((link) => getComputedStyle(link, '::before').transform))
    .toBe('matrix(1, 0, 0, 1, 0, 0)')

  const visibleRows = panel.locator('ul > li a:visible')
  const heights = await visibleRows.evaluateAll((links) =>
    links.map((link) => Math.round(link.getBoundingClientRect().height)),
  )
  expect(heights.length).toBeGreaterThan(4)
  expect(new Set(heights)).toEqual(new Set([56]))
  const rows = panel.locator('ul > li')
  await expect(rows.last()).toHaveAttribute('data-final', 'true')
  expect(
    await rows
      .first()
      .locator('a')
      .evaluate((link) => getComputedStyle(link).boxShadow),
  ).toContain('inset')
  const longChild = page.getByRole('link', { name: 'Design workflows' })
  await expect(longChild).toBeVisible()
  expect(await longChild.evaluate((link) => link.scrollHeight <= link.clientHeight)).toBe(true)
  await page.screenshot({ path: '/tmp/tmcs-nav-mobile-open.png' })
  await page.screenshot({ path: '/tmp/tmcs-nav-mobile-320.png' })
})
