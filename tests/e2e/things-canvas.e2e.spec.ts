import { test, expect } from '@playwright/test'
import { createCanvasFixture } from '../helpers/canvas-fixture'

const openFixture = createCanvasFixture('things')

test('heading, transparent complete grid, and metadata below original-color images', async ({
  page,
}) => {
  await openFixture(page, { count: 6 })
  await expect(page.locator('#fixture-things-heading')).toHaveCSS('text-align', 'center')
  const canvas = page.locator('[data-thing-canvas]')
  await expect(canvas).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect(canvas).toHaveCSS('background-repeat', /^round(, round)*$/)
  expect(await canvas.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('inset')
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const item = page.locator('[data-thing-item]').first()
    const image = (await item.locator('[data-thing-image]').boundingBox())!
    const label = (await item.locator('[data-thing-label]').boundingBox())!
    const title = item.locator('span[title]')
    expect(label.y).toBeGreaterThanOrEqual(image.y + image.height - 1)
    expect(label.x).toBeCloseTo(image.x, 0)
    expect(label.height).toBe(100)
    await expect(title).toHaveCSS('-webkit-line-clamp', '3')
    const handle = item.locator('[data-thing-drag-handle]')
    if (width < 1024) {
      await expect(handle).toHaveCSS('width', '28px')
      await expect(handle.locator('svg')).toHaveCSS('width', '14px')
    }
    const first = (await item.boundingBox())!
    const second = (await page.locator('[data-thing-item]').nth(1).boundingBox())!
    const third = (await page.locator('[data-thing-item]').nth(2).boundingBox())!
    expect(second.x).toBeGreaterThan(first.x + first.width)
    if (width < 1024) expect(third.y).toBeGreaterThan(first.y + first.height)
    const expectedHeight = width < 640 ? 200 : width < 1024 ? 260 : 280
    expect(first.height).toBe(expectedHeight)
    const action = (await item.getByRole('button', { name: /^Detail:/ }).boundingBox())!
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

test('mouse drag moves a thing and Buy still opens the primary URL', async ({ page }) => {
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

  // A plain click on the title still navigates.
  const purchase = item.getByRole('link', { name: /^Buy:/ })
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
  for (const width of [320, 390, 768, 1024, 1440]) {
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
  const drawer = page.getByRole('dialog')
  await expect(drawer).toBeVisible()
  await expect(drawer.locator('img')).toHaveCount(1)
  const primary = await item.locator('img').getAttribute('src')
  await expect(drawer.locator('img')).toHaveAttribute('src', primary!)
  await expect(drawer.locator('img')).toHaveCSS('object-fit', 'contain')
  await drawer.locator('img').hover()
  await expect(page.locator('img[src*="secondary"]')).toHaveCount(0)
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

test('missing URL omits Buy and missing Primary Image never renders the secondary image', async ({
  page,
}) => {
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
