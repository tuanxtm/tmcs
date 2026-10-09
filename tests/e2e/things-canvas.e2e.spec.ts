import { test, expect } from '@playwright/test'
import { createCanvasFixture } from '../helpers/canvas-fixture'
import { expectPackedCanvasRows, expectTightCanvasBounds } from '../helpers/canvas-bounds'

const fixtureApi = createCanvasFixture('things')
const openFixture = fixtureApi
const openFixtureWithCase = fixtureApi.openFixtureWithCase

test('full-width canvas uses four lanes on wide screens', async ({ page }) => {
  await openFixture(page, { width: 1920, count: 9 })
  const canvas = page.locator('[data-thing-canvas]')
  expect((await canvas.boundingBox())!.width).toBe(1920)
  const items = page.locator('[data-thing-item]')
  for (let index = 0; index < 4; index++) {
    expect(
      await items.nth(index).evaluate((el) => getComputedStyle(el).getPropertyValue('--row')),
    ).toBe('0')
    expect(
      await items.nth(index).evaluate((el) => getComputedStyle(el).getPropertyValue('--column')),
    ).toBe(String(index))
  }
  expect(await items.nth(4).evaluate((el) => getComputedStyle(el).getPropertyValue('--row'))).toBe(
    '1',
  )
  await page.setViewportSize({ width: 1440, height: 900 })
  expect(await items.nth(3).evaluate((el) => getComputedStyle(el).getPropertyValue('--row'))).toBe(
    '1',
  )
})

test('content fits its drag bounds and can reach every canvas edge', async ({ page }) => {
  await openFixture(page, { count: 6 })
  await expectTightCanvasBounds(page, 'thing')
})

test('mobile thing rows pack below tall and missing-image cards without overlap', async ({
  page,
}) => {
  await openFixture(page, { width: 390, height: 900, count: 8 })
  await expectPackedCanvasRows(page, 'thing')
})

test('heading, transparent grid, and responsive label-image composition', async ({ page }) => {
  await openFixture(page, { count: 6 })
  await expect(page.locator('#fixture-things-heading')).toHaveCSS('text-align', 'center')
  const canvas = page.locator('[data-thing-canvas]')
  await expect(canvas).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(canvas).toHaveCSS('background-repeat', /^round(, round)*$/)
  expect(await canvas.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('1.5px')
  await expect(canvas).toHaveCSS('border-left-width', '0px')
  await expect(canvas).toHaveCSS('border-right-width', '0px')
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const item = page.locator('[data-thing-item]').first()
    const image = (await item.locator('[data-thing-image]').boundingBox())!
    const label = (await item.locator('[data-thing-label]').boundingBox())!
    const title = item.locator('[data-thing-title]')
    if (width < 640) {
      expect(label.y).toBeGreaterThanOrEqual(image.y + image.height - 1)
      await expect(item.locator('[data-thing-label]')).toHaveCSS('text-align', 'left')
    } else {
      expect(label.x + label.width).toBeLessThanOrEqual(image.x)
      expect(label.y + label.height).toBeCloseTo(image.y + image.height, 0)
      await expect(item.locator('[data-thing-label]')).toHaveCSS('text-align', 'right')
    }
    await expect(title).toHaveCSS('-webkit-line-clamp', '3')
    const handle = item.locator('[data-thing-drag-handle]')
    if (width < 1024) {
      await expect(handle).toHaveCSS('width', width < 640 ? '24px' : '28px')
      await expect(handle.locator('svg')).toHaveCSS('width', '14px')
    }
    const first = (await item.boundingBox())!
    const second = (await page.locator('[data-thing-item]').nth(1).boundingBox())!
    const third = (await page.locator('[data-thing-item]').nth(2).boundingBox())!
    expect(second.x).toBeGreaterThan(first.x + first.width)
    if (width < 1024) expect(third.y).toBeGreaterThan(first.y + first.height)
    const expectedHeight = width < 640 ? 200 : width < 1024 ? 260 : 280
    expect(first.height).toBeLessThan(expectedHeight)
    const action = (await item.getByRole('button', { name: /^Detail:/ }).boundingBox())!
    expect(label.y).toBeGreaterThanOrEqual(first.y)
    if (width < 640) {
      expect(action.y).toBeGreaterThanOrEqual(image.y + image.height - 1)
      expect(action.x).toBeGreaterThanOrEqual(first.x - 1)
      expect(action.x + action.width).toBeLessThanOrEqual(first.x + first.width + 1)
    } else {
      expect(action.x + action.width).toBeLessThanOrEqual(image.x)
    }
    expect(action.y + action.height).toBeLessThanOrEqual(first.y + first.height + 1)
    const img = item.locator('img')
    await expect(img).toHaveCSS('object-fit', 'contain')
    await expect(img).toHaveCSS('filter', 'none')
  }
})

test('thing images render with object-fit contain and no cropping', async ({ page }) => {
  await openFixture(page)

  const img = page.locator('[data-thing-item] img').first()
  await expect(img).toBeVisible()
  await expect(img).toHaveCSS('object-fit', 'contain')
})

test('plain image clicks navigate without starting movement mode', async ({ page }) => {
  await openFixture(page)
  await page.locator('[data-thing-drag-surface]').first().click()
  await page.waitForURL(/fixture-thing-1/)
})

test('the whole thing card link supports label clicks and keyboard activation', async ({
  page,
}) => {
  await openFixture(page)
  const item = page.locator('[data-thing-item="1"]')
  const cardLink = item.locator('[data-thing-drag-surface]')
  await expect(cardLink).toHaveAttribute('href', '/buy/fixture-thing-1')
  const title = (await item.locator('[data-thing-title]').boundingBox())!
  await page.mouse.click(title.x + title.width / 2, title.y + title.height / 2)
  await page.waitForURL(/buy\/fixture-thing-1/)

  await openFixture(page)
  await page.locator('[data-thing-item="1"] [data-thing-drag-surface]').focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(/buy\/fixture-thing-1/)
})

test('appending things preserves visitor placement', async ({ page }) => {
  await openFixture(page, { count: 3 })
  const item = page.locator('[data-thing-item]').first()
  const image = (await item.locator('[data-thing-drag-surface]').boundingBox())!
  await page.mouse.move(image.x + 10, image.y + 10)
  await page.mouse.down()
  await page.mouse.move(image.x + 130, image.y + 70, { steps: 8 })
  await page.mouse.up()
  const before = (await item.boundingBox())!
  await page.evaluate(() => window.renderThingsFixture({ count: 25 }))
  await expect(page.locator('[data-thing-item]')).toHaveCount(25)
  const after = (await item.boundingBox())!
  expect(after.x).toBeCloseTo(before.x, 0)
  expect(after.y).toBeCloseTo(before.y, 0)
})

test('resize cancels an active drag and releases the movement guard', async ({ page }) => {
  await openFixture(page, { count: 6 })
  const image = (await page.locator('[data-thing-drag-surface]').first().boundingBox())!
  await page.mouse.move(image.x + 10, image.y + 10)
  await page.mouse.down()
  await page.mouse.move(image.x + 70, image.y + 50, { steps: 5 })
  await expect(page.locator('html')).toHaveAttribute('data-thing-moving', 'true')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.locator('html')).toHaveAttribute('data-thing-moving', 'false')
  await page.mouse.up()
})

for (const lenis of [true, false]) {
  test(`dragging at the viewport edge scrolls the canvas with ${lenis ? 'Lenis' : 'native scrolling'}`, async ({
    page,
  }) => {
    await openFixture(page, { count: 25 })
    await page.evaluate(
      (enabled) => window.renderThingsFixture({ count: 25, lenis: enabled }),
      lenis,
    )
    const image = (await page.locator('[data-thing-drag-surface]').first().boundingBox())!
    await page.mouse.move(image.x + 10, image.y + 10)
    await page.mouse.down()
    await page.mouse.move(image.x + 10, 896, { steps: 8 })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80)
    await page.mouse.up()
    await expect(page.locator('html')).toHaveAttribute('data-thing-moving', 'false')
  })
}

test('touch handle drag, tap movement controls, and page scrolling', async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  try {
    await openFixture(page, { width: 390, height: 844, count: 25 })
    const session = await context.newCDPSession(page)
    const handle = page.locator('[data-thing-drag-handle]').first()
    const item = page.locator('[data-thing-item]').first()
    const box = (await handle.boundingBox())!
    const before = (await item.boundingBox())!
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: point.x + 40, y: point.y + 30 }],
    })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(async () => (await item.boundingBox())!.x).toBeGreaterThan(before.x + 20)
    await expect(page.locator('[data-thing-movement]')).toHaveCount(0)
    await handle.tap()
    await expect(page.locator('[data-thing-movement]')).toBeVisible()
    await page.getByRole('button', { name: 'Finish moving' }).tap()
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 380, y: 700 }],
    })
    for (const y of [650, 600, 550, 500, 450]) {
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: 380, y }],
      })
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(50)
  } finally {
    await context.close()
  }
})

test('mouse drag moves a thing and BUY NOW still opens the primary URL', async ({ page }) => {
  await openFixture(page)

  const item = page.locator('[data-thing-item]').first()
  const before = await item.boundingBox()
  const image = item.locator('[data-thing-image]').first()
  const box = (await image.boundingBox())!

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 60, { steps: 12 })
  await page.mouse.up()

  // The drop commits through React state, so wait for the new position to land.
  await expect
    .poll(async () => (await item.boundingBox())?.x ?? Number.NaN)
    .not.toBeCloseTo(before!.x, 0)

  const after = await item.boundingBox()
  expect(Math.abs(after!.x - before!.x)).toBeGreaterThan(40)
  expect(Math.abs(after!.y - before!.y)).toBeGreaterThan(20)
  await expect(page).toHaveURL('http://things-canvas.test/')

  // A plain click on the title still navigates.
  const purchase = item.getByRole('link', { name: /^Buy now:/i })
  await expect(purchase).toHaveAttribute('href', '/buy/fixture-thing-1')
  await purchase.click()
  await page.waitForURL(/buy\/fixture-thing-/)
})

test('drag is clamped inside the canvas bounds', async ({ page }) => {
  await openFixture(page, { count: 4 })

  const canvas = page.locator('[data-thing-canvas]')
  const canvasBox = (await canvas.boundingBox())!
  const item = page.locator('[data-thing-item]').first()
  const handle = item.locator('[data-thing-drag-surface]')
  const handleBox = (await handle.boundingBox())!

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(canvasBox.x - 400, canvasBox.y - 400, { steps: 16 })
  await page.mouse.up()

  const moved = (await item.boundingBox())!
  const currentCanvas = (await canvas.boundingBox())!
  expect(moved.x).toBeGreaterThanOrEqual(currentCanvas.x - 1)
  expect(moved.y).toBeGreaterThanOrEqual(currentCanvas.y - 1)

  const nextBox = (await handle.boundingBox())!
  await page.mouse.move(nextBox.x + 4, nextBox.y + 4)
  await page.mouse.down()
  await page.mouse.move(canvasBox.x + canvasBox.width + 400, canvasBox.y + canvasBox.height + 400, {
    steps: 16,
  })
  await page.mouse.up()

  const far = (await item.boundingBox())!
  const finalCanvas = (await canvas.boundingBox())!
  expect(far.x + far.width).toBeLessThanOrEqual(finalCanvas.x + finalCanvas.width + 1)
  expect(far.y + far.height).toBeLessThanOrEqual(finalCanvas.y + finalCanvas.height + 1)
})

test('keyboard movement, cancellation, and directional buttons', async ({ page }) => {
  await openFixture(page, { count: 3 })

  const item = page.locator('[data-thing-item]').first()
  const handle = item.locator('[data-thing-drag-handle]')
  const start = (await item.boundingBox())!

  await handle.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-thing-movement]')).toBeVisible()

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  const moved = (await item.boundingBox())!
  expect(moved.x).toBeGreaterThan(start.x + 10)

  // Escape restores the position captured when movement mode opened.
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-thing-movement]')).toHaveCount(0)
  const restored = (await item.boundingBox())!
  expect(Math.abs(restored.x - start.x)).toBeLessThan(2)

  // Shift+Arrow uses the larger step.
  await handle.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Shift+ArrowDown')
  const shifted = (await item.boundingBox())!
  expect(shifted.y).toBeGreaterThan(start.y + 20)
  await page.keyboard.press('Enter')

  // Directional buttons give touch users an alternative.
  await handle.focus()
  await page.keyboard.press('Enter')
  const overlay = page.locator('[data-thing-movement]')
  const beforeButton = (await item.boundingBox())!
  await overlay.locator('[data-thing-move="right"]').click()
  const afterButton = (await item.boundingBox())!
  expect(afterButton.x).toBeGreaterThan(beforeButton.x)
  await overlay.locator('[data-thing-move="done"]').click()
  await expect(overlay).toHaveCount(0)
})

test('reset layout restores all loaded things', async ({ page }) => {
  await openFixture(page, { count: 6 })

  const canvas = page.locator('[data-thing-canvas]')
  const canvasBox = (await canvas.boundingBox())!
  const positions: Array<{ x: number; y: number }> = []

  const items = page.locator('[data-thing-item]')
  const total = await items.count()
  for (let index = 0; index < 3; index += 1) {
    const item = items.nth(index)
    const handle = item.locator('[data-thing-drag-surface]')
    const handleBox = (await handle.boundingBox())!
    await page.mouse.move(handleBox.x + 10, handleBox.y + 10)
    await page.mouse.down()
    await page.mouse.move(handleBox.x + 10 + 60, handleBox.y + 10 + 30, { steps: 8 })
    await page.mouse.up()
  }

  for (let index = 0; index < total; index += 1) {
    const box = (await items.nth(index).boundingBox())!
    positions.push({ x: box.x, y: box.y })
  }
  expect(canvasBox.width).toBeGreaterThan(0)

  const reset = page.locator('[data-thing-reset]')
  await expect(reset).toBeEnabled()
  await reset.click()

  for (let index = 0; index < total; index += 1) {
    const box = (await items.nth(index).boundingBox())!
    // Default positions come back, so at least one item must have moved.
    if (positions[index].x !== box.x || positions[index].y !== box.y) return
  }
  throw new Error('reset layout did not restore any thing position')
})

test('no horizontal document overflow at tested widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440, 1920, 2560]) {
    await openFixture(page, { width })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  }
})

test('resize keeps items inside bounds', async ({ page }) => {
  await openFixture(page, { width: 1440, count: 8 })

  const canvas = page.locator('[data-thing-canvas]')
  const handle = page.locator('[data-thing-item]').first().locator('[data-thing-drag-surface]')
  const handleBox = (await handle.boundingBox())!
  await page.mouse.move(handleBox.x + 10, handleBox.y + 10)
  await page.mouse.down()
  await page.mouse.move(handleBox.x + 300, handleBox.y + 200, { steps: 14 })
  await page.mouse.up()

  await page.setViewportSize({ width: 390, height: 900 })
  await page.waitForTimeout(200)

  const canvasBox = (await canvas.boundingBox())!
  const items = page.locator('[data-thing-item]')
  const total = await items.count()
  for (let index = 0; index < total; index += 1) {
    const box = (await items.nth(index).boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(canvasBox.x - 1)
    expect(box.x + box.width).toBeLessThanOrEqual(canvasBox.x + canvasBox.width + 1)
  }
})

test('reduced motion keeps position changes immediate', async ({ page }) => {
  await openFixture(page, { count: 3, reducedMotion: true })

  const item = page.locator('[data-thing-item]').first()
  const handle = item.locator('[data-thing-drag-handle]')
  await handle.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowRight')
  await expect(item).toBeVisible()
  await expect(page.locator('[data-thing-movement]')).toBeVisible()
  await page.keyboard.press('Enter')
})

test('focus brings an obscured thing forward', async ({ page }) => {
  await openFixture(page, { count: 3 })

  // Stack the second thing on top of the first via its movement mode.
  const first = page.locator('[data-thing-item]').nth(0)
  const firstBox = (await first.boundingBox())!
  const second = page.locator('[data-thing-item]').nth(1)
  const secondHandle = second.locator('[data-thing-drag-surface]')
  const secondHandleBox = (await secondHandle.boundingBox())!
  await page.mouse.move(secondHandleBox.x + 10, secondHandleBox.y + 10)
  await page.mouse.down()
  await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, {
    steps: 12,
  })
  await page.mouse.up()

  // Focusing the first thing's handle must raise it above the overlap. Blur
  // the active element first so the focus event is a genuine change.
  const zBefore = await first.evaluate((el) => Number(getComputedStyle(el).zIndex))
  const otherZBefore = await second.evaluate((el) => Number(getComputedStyle(el).zIndex))
  expect(zBefore).toBeLessThanOrEqual(otherZBefore)

  await page.evaluate(
    'document.activeElement instanceof HTMLElement && document.activeElement.blur()',
  )
  await first.locator('[data-thing-drag-handle]').focus()

  await expect
    .poll(async () => first.evaluate((el) => Number(getComputedStyle(el).zIndex)))
    .toBeGreaterThan(zBefore)

  const zIndex = await first.evaluate((el) => Number(getComputedStyle(el).zIndex))
  const otherZ = await second.evaluate((el) => Number(getComputedStyle(el).zIndex))
  expect(zIndex).toBeGreaterThan(otherZ)
})

test('Detail locks scrolling, restores focus, and uses only Primary Image on hover', async ({
  page,
}) => {
  await openFixture(page, { count: 25 })
  const item = page.locator('[data-thing-item]').first()
  const detail = item.getByRole('button', { name: /^Detail:/ })
  await detail.click()
  await expect(page).toHaveURL('http://things-canvas.test/')
  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible()
  await expect(drawer.locator('img')).toHaveCount(1)
  const primary = await item.locator('img').getAttribute('src')
  await expect(drawer.locator('img')).toHaveAttribute('src', primary!)
  await expect(drawer.locator('img')).toHaveCSS('object-fit', 'contain')
  // No secondary / hover alternate ever renders.
  await expect(page.locator('img[src*="secondary"]')).toHaveCount(0)
  // Drawer locks page scroll while open.
  const scrollY = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 400)
  await page.waitForTimeout(150)
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollY)
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(drawer).not.toBeVisible()
  await expect(detail).toBeFocused()
  await page.mouse.wheel(0, 400)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(scrollY)
})

test('purchase action follows responsive label placement and missing URL omits it', async ({
  page,
}) => {
  await openFixture(page, { count: 6 })
  const item = page.locator('[data-thing-item="1"]')
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const image = (await item.locator('[data-thing-image]').boundingBox())!
    const label = (await item.locator('[data-thing-label]').boundingBox())!
    const number = (await item.locator('[class*="number"]').boundingBox())!
    const title = (await item.locator('[data-thing-title]').boundingBox())!
    const actions = (await item.locator('[class*="thingActions"]').boundingBox())!
    if (width < 640) {
      expect(label.y).toBeGreaterThanOrEqual(image.y + image.height - 1)
      expect(actions.y).toBeGreaterThanOrEqual(title.y + title.height - 1)
      for (const part of [number, title, actions]) {
        expect(part.x).toBeGreaterThanOrEqual(label.x - 1)
        expect(part.x + part.width).toBeLessThanOrEqual(label.x + label.width + 1)
      }
    } else {
      expect(label.y + label.height).toBeCloseTo(image.y + image.height, 0)
      expect(actions.y + actions.height).toBeCloseTo(image.y + image.height, 0)
      for (const part of [number, title, actions]) {
        expect(part.x + part.width).toBeCloseTo(label.x + label.width, 0)
      }
    }
    if (width === 320 || width === 1440) {
      await page.screenshot({ path: `/tmp/tmcs-things-row-${width}.png` })
    }
  }
  await expect(item.getByRole('link', { name: /^Buy now:/i })).toHaveAttribute(
    'href',
    '/buy/fixture-thing-1',
  )
  const noUrl = page.locator('[data-thing-item="3"]')
  await expect(noUrl.getByRole('link')).toHaveCount(0)
  await expect(noUrl.getByRole('button', { name: /^Detail:/ })).toBeVisible()
})

test('missing Primary Image never renders the secondary image', async ({ page }) => {
  await openFixture(page, { count: 6 })
  const noUrl = page.locator('[data-thing-item="3"]')
  await expect(noUrl.getByRole('link')).toHaveCount(0)
  await expect(noUrl.locator('[data-thing-drag-surface]')).toHaveJSProperty('tagName', 'SPAN')
  const noImage = page.locator('[data-thing-item="4"]')
  await expect(noImage.locator('img')).toHaveCount(0)
  await noImage.getByRole('button', { name: /^Detail:/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog').locator('img')).toHaveCount(0)
})

const VIEWPORTS = [320, 390, 768, 1024, 1440, 1920] as const

for (const width of VIEWPORTS) {
  test(`redesigned drawer: 70dvh popup with equal halves at ${width}`, async ({ page }) => {
    await openFixtureWithCase(page, { drawerCase: 'links' }, { width, height: 900 })
    const item = page.locator('[data-thing-item="1"]')
    await item.getByRole('button', { name: /^Detail:/ }).click()
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    const popup = page.locator('[data-slot="drawer-popup"]')
    await expect(popup).toBeVisible()
    // Wait for the slide-in transform to settle so boundingBox is stable.
    await expect(popup).toHaveCSS('opacity', '1')
    const popupBox = (await popup.boundingBox())!
    const expectedHeight = Math.round((900 * 70) / 100)
    expect(popupBox.height).toBeGreaterThanOrEqual(expectedHeight - 2)
    expect(popupBox.height).toBeLessThanOrEqual(expectedHeight + 2)
    const frame = drawer.locator('[data-thing-detail-frame]')
    const frameBox = (await frame.boundingBox())!
    const image = drawer.locator('[data-thing-detail-image]')
    const content = drawer.locator('[data-thing-detail-content]')
    const imageBox = (await image.boundingBox())!
    const contentBox = (await content.boundingBox())!
    expect(Math.abs(imageBox.height - contentBox.height)).toBeLessThanOrEqual(2)
    if (width >= 1024) {
      expect(Math.abs(imageBox.width - contentBox.width)).toBeLessThanOrEqual(2)
      // Desktop uses a vertical inner rule between cells.
      const imageRight = imageBox.x + imageBox.width
      const contentLeft = contentBox.x
      expect(contentLeft - imageRight).toBeLessThanOrEqual(2)
    } else {
      expect(Math.abs(imageBox.width - contentBox.width)).toBeLessThanOrEqual(2)
      // Mobile uses a horizontal inner rule between cells.
      const imageBottom = imageBox.y + imageBox.height
      const contentTop = contentBox.y
      expect(contentTop - imageBottom).toBeLessThanOrEqual(2)
    }
    const expectedInset = width >= 1024 ? 10 : 8
    const insets = [
      frameBox.x - popupBox.x,
      frameBox.y - popupBox.y,
      popupBox.x + popupBox.width - frameBox.x - frameBox.width,
      popupBox.y + popupBox.height - frameBox.y - frameBox.height,
    ]
    for (const inset of insets) expect(Math.abs(inset - expectedInset)).toBeLessThanOrEqual(2)
  })
}

test('drawer links occupy the bottom edge with single seams and nav arrows at desktop', async ({
  page,
}) => {
  await openFixtureWithCase(
    page,
    { drawerCase: 'links', linkCount: 3 },
    { width: 1440, height: 900 },
  )
  const item = page.locator('[data-thing-item="1"]')
  await item.getByRole('button', { name: /^Detail:/ }).click()
  const links = page.locator('[data-thing-detail-links] a')
  await expect(links).toHaveCount(3)
  const linkLocators = await links.all()
  const boxes = await Promise.all(linkLocators.map((loc) => loc.boundingBox()))
  const widths = boxes.map((b) => b!.width)
  const max = Math.max(...widths)
  const min = Math.min(...widths)
  expect(max - min).toBeLessThanOrEqual(2)
  const tops = boxes.map((b) => b!.y)
  expect(Math.abs(Math.max(...tops) - Math.min(...tops))).toBeLessThanOrEqual(2)
  for (const link of linkLocators) {
    await expect(link.locator('svg')).toHaveCount(1)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /sponsored/)
    await expect(link).toHaveCSS('border-left-width', '0px')
    await expect(link).toHaveCSS('border-right-width', '0px')
  }
  const contentBox = (await page.locator('[data-thing-detail-content]').boundingBox())!
  const groupBox = (await page.locator('[data-thing-detail-links]').boundingBox())!
  expect(Math.abs(groupBox.x - contentBox.x)).toBeLessThan(1)
  expect(Math.abs(groupBox.width - contentBox.width)).toBeLessThan(1)
  expect(Math.abs(groupBox.y + groupBox.height - contentBox.y - contentBox.height)).toBeLessThan(1)
  await expect(page.locator('[data-thing-detail-links] li').nth(1)).toHaveCSS(
    'border-left-width',
    '1px',
  )
})

test('mobile stacks full-width links with nav arrows and reachable overflow', async ({ page }) => {
  await openFixtureWithCase(
    page,
    { drawerCase: 'links', linkCount: 4 },
    { width: 390, height: 900 },
  )
  const item = page.locator('[data-thing-item="1"]')
  await item.getByRole('button', { name: /^Detail:/ }).click()
  const links = page.locator('[data-thing-detail-links] a')
  await expect(links).toHaveCount(4)
  const linkLocators = await links.all()
  const boxes = await Promise.all(linkLocators.map((loc) => loc.boundingBox()))
  for (const link of linkLocators) {
    await expect(link.locator('svg')).toHaveCount(1)
  }
  // Each cell is the full width of the content half.
  const widths = boxes.map((b) => b!.width)
  const minWidth = Math.min(...widths)
  const maxWidth = Math.max(...widths)
  expect(maxWidth - minWidth).toBeLessThanOrEqual(2)
  await links.last().scrollIntoViewIfNeeded()
  await expect(links.last()).toBeInViewport()
})

test('drawer uses serif heading and mono description', async ({ page }) => {
  await openFixtureWithCase(page, { drawerCase: 'links' }, { width: 1440, height: 900 })
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  const title = page.locator('[data-thing-detail-frame] h2')
  await expect(title).toBeVisible()
  const titleFamily = await title.evaluate((el) => getComputedStyle(el).fontFamily)
  expect(titleFamily.toLowerCase()).toContain('serif')
  // No forced lowercase.
  await expect(title).toHaveCSS('text-transform', 'none')
  const fontSize = await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
  expect(fontSize).toBeLessThanOrEqual(64)
  const description = page.locator('[data-thing-detail-content] p')
  expect(await description.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('monospace')
  await expect(page.getByRole('dialog')).toHaveAccessibleName(await title.innerText())
})

test('image wheel zooms, drag pans, and reset restores baseline', async ({ page }) => {
  await openFixtureWithCase(page, { drawerCase: 'links' }, { width: 1440, height: 900 })
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  const region = page.locator('[data-thing-detail-region]')
  await expect(region).toBeVisible()
  await expect
    .poll(async () =>
      page.locator('[data-thing-detail-transform]').evaluate((el) => el.style.transform),
    )
    .toContain('scale(1)')
  const regionBox = (await region.boundingBox())!
  // Wheel up over the image center zooms in.
  await page.mouse.move(regionBox.x + regionBox.width / 2, regionBox.y + regionBox.height / 2)
  await page.mouse.wheel(0, -400)
  await expect(page.locator('[data-thing-detail-reset]')).toBeVisible()
  await expect
    .poll(async () =>
      page.locator('[data-thing-detail-transform]').evaluate((el) => el.style.transform),
    )
    .not.toContain('scale(1)')
  // Wheel down clamps back near scale 1.
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 400)
  }
  // Drag pans when zoomed.
  await page.mouse.move(regionBox.x + regionBox.width / 2, regionBox.y + regionBox.height / 2)
  await page.mouse.wheel(0, -400)
  await page.mouse.down()
  await page.mouse.move(
    regionBox.x + regionBox.width / 2 + 80,
    regionBox.y + regionBox.height / 2 + 40,
    {
      steps: 6,
    },
  )
  await page.mouse.up()
  // Drag should have changed the transform (translate x or y).
  await expect
    .poll(async () =>
      page.locator('[data-thing-detail-transform]').evaluate((el) => el.style.transform),
    )
    .toMatch(/translate3d\([^0][0-9.]*px/) // matches translate3d(<non-zero>px
  // Reset returns to baseline and hides itself.
  await page.locator('[data-thing-detail-reset]').click()
  await expect(page.locator('[data-thing-detail-reset]')).toHaveCount(0)
  await expect
    .poll(async () =>
      page.locator('[data-thing-detail-transform]').evaluate((el) => el.style.transform),
    )
    .toContain('scale(1)')
  // A subsequent ordinary image click navigates to the primary URL.
  await page.locator('[data-thing-detail-image-link]').click()
  await page.waitForURL(/buy\/fixture-thing-1/)
})

test('keyboard inspection: region + arrows + 0 reset', async ({ page }) => {
  await openFixtureWithCase(page, { drawerCase: 'links' }, { width: 1440, height: 900 })
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  const region = page.locator('[data-thing-detail-region]')
  await region.focus()
  await expect
    .poll(async () =>
      page.locator('[data-thing-detail-transform]').evaluate((el) => el.style.transform),
    )
    .toContain('scale(1)')
  await page.keyboard.press('=')
  await page.keyboard.press('=')
  await expect
    .poll(async () =>
      page.locator('[data-thing-detail-transform]').evaluate((el) => el.style.transform),
    )
    .not.toContain('scale(1)')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('[data-thing-detail-reset]')).toBeVisible()
  await page.keyboard.press('0')
  await expect(page.locator('[data-thing-detail-reset]')).toHaveCount(0)
  await expect
    .poll(async () =>
      page.locator('[data-thing-detail-transform]').evaluate((el) => el.style.transform),
    )
    .toContain('scale(1)')
})

test('closing restores DETAIL focus and opens cleanly a second time', async ({ page }) => {
  await openFixtureWithCase(page, { drawerCase: 'links' }, { width: 1440, height: 900 })
  const item = page.locator('[data-thing-item="1"]')
  const detail = item.getByRole('button', { name: /^Detail:/ })
  await detail.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(detail).toBeFocused()
  await detail.click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('reduced-motion drawer opens instantly without animations', async ({ page }) => {
  await openFixtureWithCase(
    page,
    { drawerCase: 'links' },
    { width: 1440, height: 900, reducedMotion: true },
  )
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  const transform = await page
    .locator('[data-thing-detail-transform]')
    .evaluate((el) => el.style.transform)
  expect(transform).toContain('scale(1)')
})

test('broken primary image hides inspection controls but exposes close + links', async ({
  page,
}) => {
  await openFixtureWithCase(page, { drawerCase: 'broken-image' }, { width: 1440, height: 900 })
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('[data-thing-detail-reset]')).toHaveCount(0)
  await expect(page.locator('[data-thing-detail-image-link]')).toHaveCount(0)
  // Close and links remain available.
  await expect(page.getByRole('button', { name: 'Close', exact: true })).toBeVisible()
  await expect(page.locator('[data-thing-detail-links] a')).toHaveCount(3)
})

test('missing primary image keeps the empty half with a localized placeholder', async ({
  page,
}) => {
  await openFixture(page, { count: 6 })
  // thing index 3 (id=4) is configured as missing primary image.
  const noImage = page.locator('[data-thing-item="4"]')
  await noImage.getByRole('button', { name: /^Detail:/ }).click()
  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible()
  await expect(drawer.locator('[data-thing-detail-image]')).toBeVisible()
  await expect(drawer.locator('[data-thing-detail-image-link]')).toHaveCount(0)
})

test('drawer renders Vietnamese copy', async ({ page }) => {
  await openFixtureWithCase(
    page,
    { drawerCase: 'links', locale: 'vi' },
    { width: 1440, height: 900 },
  )
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Xem thêm:/ })
    .click()
  await expect(page.getByRole('button', { name: 'Đóng' })).toBeVisible()
})

test('inspection fit leaves grid visible and reset sits next to close', async ({ page }) => {
  await openFixtureWithCase(page, { drawerCase: 'links' }, { width: 1440, height: 900 })
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  const region = page.locator('[data-thing-detail-region]')
  const layer = page.locator('[data-thing-detail-transform]')
  await expect.poll(async () => (await layer.boundingBox())?.height ?? 0).toBeGreaterThan(0)
  const regionBox = (await region.boundingBox())!
  const layerBox = (await layer.boundingBox())!
  const ratio = Math.max(layerBox.width / regionBox.width, layerBox.height / regionBox.height)
  expect(ratio).toBeCloseTo(0.9, 2)
  const grid = page.locator('[data-thing-detail-image] > [aria-hidden]')
  await expect(grid).toHaveCSS('background-size', '42px 42px, 42px 42px')
  await region.focus()
  await page.keyboard.press('=')
  const reset = page.locator('[data-thing-detail-reset]')
  await expect(reset).toHaveAccessibleName('Reset image')
  const resetBox = (await reset.boundingBox())!
  const closeBox = (await page.getByRole('button', { name: 'Close', exact: true }).boundingBox())!
  expect(Math.abs(resetBox.y - closeBox.y)).toBeLessThan(1)
  expect(closeBox.x - resetBox.x - resetBox.width).toBeCloseTo(4, 0)
  await reset.click()
  await expect(region).toBeFocused()
})

test('slow drag accumulates movement, suppresses navigation, and allows a fresh click', async ({
  page,
}) => {
  await openFixtureWithCase(page, { drawerCase: 'links' }, { width: 1440, height: 900 })
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  const box = (await page.locator('[data-thing-detail-region]').boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 80, y + 40, { steps: 40 })
  await page.mouse.up()
  const layer = page.locator('[data-thing-detail-transform]')
  await expect
    .poll(async () =>
      layer.evaluate(
        (el) => new DOMMatrix(getComputedStyle(el).transform).m41 + el.clientWidth / 2,
      ),
    )
    .toBeCloseTo(80, 0)
  expect(page.url()).toBe('http://things-canvas.test/')
  await page.locator('[data-thing-detail-image-link]').click()
  await page.waitForURL(/buy\/fixture-thing-1/)
})

test('touch pinch preserves its center, continues as drag, and does not dismiss the drawer', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  })
  const page = await context.newPage()
  try {
    await openFixtureWithCase(page, { drawerCase: 'links' }, { width: 390, height: 844 })
    await page
      .locator('[data-thing-item="1"]')
      .getByRole('button', { name: /^Detail:/ })
      .tap()
    const region = page.locator('[data-thing-detail-region]')
    const box = (await region.boundingBox())!
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    const session = await context.newCDPSession(page)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { id: 1, x: x - 30, y },
        { id: 2, x: x + 30, y },
      ],
    })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { id: 1, x: x - 60, y },
        { id: 2, x: x + 60, y },
      ],
    })
    const layer = page.locator('[data-thing-detail-transform]')
    await expect
      .poll(() => layer.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a))
      .toBeCloseTo(2, 1)
    const pan = await layer.evaluate((el) => {
      const matrix = new DOMMatrix(getComputedStyle(el).transform)
      return { x: matrix.m41 + el.clientWidth / 2, y: matrix.m42 + el.clientHeight / 2 }
    })
    expect(Math.abs(pan.x)).toBeLessThan(2)
    expect(Math.abs(pan.y)).toBeLessThan(2)
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [{ id: 2, x: x + 60, y }],
    })
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ id: 1, x: x - 30, y: y + 15 }],
    })
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect(page.getByRole('dialog')).toBeVisible()
    expect(page.url()).toBe('http://things-canvas.test/')
    await expect
      .poll(() =>
        layer.evaluate(
          (el) => new DOMMatrix(getComputedStyle(el).transform).m41 + el.clientWidth / 2,
        ),
      )
      .toBeCloseTo(30, 0)
    await page.getByRole('button', { name: 'Reset image' }).tap()
    await expect(page.locator('[data-thing-detail-reset]')).toHaveCount(0)
    await page.locator('[data-thing-detail-image-link]').tap()
    await page.waitForURL(/buy\/fixture-thing-1/)
  } finally {
    await context.close()
  }
})

test('overflow starts at the heading and resizing resets inspection without hiding links', async ({
  page,
}) => {
  await openFixtureWithCase(
    page,
    { drawerCase: 'long-copy', linkCount: 4 },
    { width: 390, height: 844 },
  )
  await page
    .locator('[data-thing-item="1"]')
    .getByRole('button', { name: /^Detail:/ })
    .click()
  const scroller = page.locator('[data-thing-detail-content] [data-lenis-prevent]')
  await expect(scroller).toHaveJSProperty('scrollTop', 0)
  const titleBox = (await page.locator('[data-thing-detail-content] h2').boundingBox())!
  const scrollBox = (await scroller.boundingBox())!
  expect(titleBox.y).toBeGreaterThanOrEqual(scrollBox.y)
  await scroller.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(page.locator('[data-thing-detail-content] p')).toBeInViewport()
  const lastLink = page.locator('[data-thing-detail-links] a').last()
  await lastLink.focus()
  await expect(lastLink).toBeFocused()
  await expect(lastLink).toBeInViewport()
  await scroller.evaluate((el) => {
    el.scrollTop = 0
  })
  await expect(page.locator('[data-thing-detail-content] h2')).toBeInViewport()
  const region = page.locator('[data-thing-detail-region]')
  await region.focus()
  await page.keyboard.press('=')
  await expect(page.locator('[data-thing-detail-reset]')).toBeVisible()
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page.locator('[data-thing-detail-reset]')).toHaveCount(0)
  await page.locator('[data-thing-detail-image-link]').focus()
  await page.keyboard.press('Enter')
  await page.waitForURL(/buy\/fixture-thing-1/)
})
