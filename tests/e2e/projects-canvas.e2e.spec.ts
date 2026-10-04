import { test, expect, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

/**
 * Canvas interaction tests run against a bundled fixture served through
 * request interception, so no production test route is needed. Pagination is
 * covered separately by the mocked jsdom component tests.
 *
 * next/link and next/image stay external and are swapped for DOM-only stubs
 * through an import map, because the real modules read Next build-time env
 * flags and router internals that do not exist outside a Next bundle.
 */
const STUBBED_NEXT_MODULES = ['next/link', 'next/image'] as const

let outputDirectory: string

test.beforeAll(() => {
  outputDirectory = mkdtempSync(path.join(tmpdir(), 'tmcs-projects-canvas-'))
  execFileSync(
    'bun',
    [
      'build',
      'tests/fixtures/stubs/next-link.tsx',
      'tests/fixtures/stubs/next-image.tsx',
      '--target=browser',
      '--outdir',
      outputDirectory,
    ],
    { cwd: process.cwd() },
  )
  execFileSync(
    'bun',
    [
      'build',
      'tests/fixtures/projects-canvas.tsx',
      '--target=browser',
      ...STUBBED_NEXT_MODULES.flatMap((name) => ['--external', name]),
      '--outdir',
      outputDirectory,
    ],
    { cwd: process.cwd() },
  )
})

test.afterAll(() => {
  if (outputDirectory) rmSync(outputDirectory, { recursive: true, force: true })
})

async function openFixture(
  page: Page,
  options: { width?: number; height?: number; count?: number; reducedMotion?: boolean } = {},
) {
  const files = readdirSync(outputDirectory)
  const script = 'projects-canvas.js'
  const css = files
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(path.join(outputDirectory, file), 'utf8'))
    .join('\n')

  // next/link and next/image are external, so map them to the DOM-only stubs.
  const imports = {
    'next/link': '/next-link.js',
    'next/image': '/next-image.js',
  }

  await page.route('http://projects-canvas.test/**', async (route) => {
    const file = path.basename(new URL(route.request().url()).pathname)
    if (files.includes(file)) {
      await route.fulfill({
        body: readFileSync(path.join(outputDirectory, file)),
        contentType: 'text/javascript',
      })
    } else {
      await route.fulfill({
        contentType: 'text/html',
        body: `
        <!doctype html>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${css}
          :root {
            --background: #fbfbfb;
            --accent: #3b5bdb;
            --accent-foreground: #fff;
            --font-serif: Georgia, serif;
            --font-mono: monospace;
            --header-height: 48px;
            --destructive: #e03131;
          }
          body { margin: 0; background: var(--background); font-family: Arial; }
          header { position: sticky; top: 0; height: 48px; background: #fff; z-index: 10; }
          /* Tailwind utilities the components rely on, absent from the bundle. */
          .absolute { position: absolute; }
          .inset-0 { inset: 0; }
          .overflow-hidden { overflow: hidden; }
          .block { display: block; }
          .h-full { height: 100%; }
          .w-full { width: 100%; }
          .h-auto { height: auto; }
          .object-contain { object-fit: contain; }
          .object-bottom { object-position: bottom; }
          .object-cover { object-fit: cover; }
          .bg-transparent { background-color: transparent; }
        </style>
        <script>window.process = { env: {} };</script>
        <script type="importmap">${JSON.stringify({ imports })}</script>
        <header></header>
        <div id="fixture"></div><script type="module" src="/${script}"></script>
      `,
      })
    }
  })

  await page.setViewportSize({
    width: options.width ?? 1440,
    height: options.height ?? 900,
  })
  if (options.reducedMotion) await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('http://projects-canvas.test/')
  if (typeof options.count === 'number') {
    await page.evaluate((count) => window.renderProjectsFixture({ count }), options.count)
  }
  await expect(page.locator('[data-project-canvas]')).toBeVisible()
  await expect(page.locator('[data-project-canvas]')).toHaveAttribute(
    'data-project-canvas-ready',
    'true',
  )
}

test('heading, grid lines, and image-left name-right composition', async ({ page }) => {
  await openFixture(page)

  const heading = page.locator('#fixture-projects-heading')
  await expect(heading).toBeVisible()
  await expect(heading).toHaveCSS('text-align', 'center')
  expect(
    (await heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) * 1,
  ).toBeGreaterThan(36)

  const canvas = page.locator('[data-project-canvas]')
  const backgroundImage = await canvas.evaluate((el) => getComputedStyle(el).backgroundImage)
  expect(backgroundImage).toContain('linear-gradient')

  // Names sit to the right of their image on desktop, tablet, and mobile.
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 })
    const item = page.locator('[data-project-item]').first()
    const image = item.locator('[data-project-image]').first()
    const title = item.locator('a[title], span[title]').last()
    const imageBox = await image.boundingBox()
    const titleBox = await title.boundingBox()
    expect(imageBox).not.toBeNull()
    expect(titleBox).not.toBeNull()
    expect(titleBox!.x).toBeGreaterThanOrEqual(imageBox!.x + imageBox!.width - 1)
  }
})

test('project images render with object-fit contain and no cropping', async ({ page }) => {
  await openFixture(page)

  const img = page.locator('[data-project-item] img').first()
  await expect(img).toBeVisible()
  await expect(img).toHaveCSS('object-fit', 'contain')
})

test('plain image clicks navigate without starting movement mode', async ({ page }) => {
  await openFixture(page)
  await page.locator('[data-project-drag-surface]').first().click()
  await page.waitForURL(/fixture-project-1/)
})

test('compact controls, bottom-aligned labels, and complete transparent grid', async ({ page }) => {
  await openFixture(page, { count: 6 })
  const canvas = page.locator('[data-project-canvas]')
  await expect(canvas).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  expect(await canvas.evaluate((el) => getComputedStyle(el).boxShadow)).toContain('inset')
  await expect(
    page.getByText('drag to move projects, use the handle for touch and keyboard'),
  ).toHaveCount(0)

  const item = page.locator('[data-project-item]').first()
  const handle = item.locator('[data-project-drag-handle]')
  await expect(handle).toHaveCSS('clip-path', 'inset(50%)')
  const image = (await item.locator('[data-project-image]').boundingBox())!
  const title = (await item.locator('a[title]').boundingBox())!
  expect(title.y + title.height).toBeCloseTo(image.y + image.height, 0)

  const description = page.getByText('Drag any project to rearrange the workshop wall.')
  const reset = page.getByRole('button', { name: 'Reset project layout' })
  expect((await reset.boundingBox())!.y).toBeLessThan((await canvas.boundingBox())!.y)
  expect(
    Math.abs((await reset.boundingBox())!.y - (await description.boundingBox())!.y),
  ).toBeLessThan(12)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(handle).toHaveCSS('width', '28px')
  const first = (await item.boundingBox())!
  const second = (await page.locator('[data-project-item]').nth(1).boundingBox())!
  const third = (await page.locator('[data-project-item]').nth(2).boundingBox())!
  expect(second.x).toBeGreaterThan(first.x + first.width)
  expect(Math.abs(first.y - second.y)).toBeLessThan(80)
  expect(third.y).toBeGreaterThan(first.y + first.height)
  const handleBox = (await handle.boundingBox())!
  const number = (await item
    .locator('span')
    .filter({ hasText: /^01\.$/ })
    .boundingBox())!
  expect(handleBox.y + handleBox.height).toBeLessThanOrEqual(number.y)
})

test('appending projects preserves visitor placement', async ({ page }) => {
  await openFixture(page, { count: 3 })
  const item = page.locator('[data-project-item]').first()
  const image = (await item.locator('[data-project-drag-surface]').boundingBox())!
  await page.mouse.move(image.x + 10, image.y + 10)
  await page.mouse.down()
  await page.mouse.move(image.x + 130, image.y + 70, { steps: 8 })
  await page.mouse.up()
  const before = (await item.boundingBox())!
  await page.evaluate(() => window.renderProjectsFixture({ count: 25 }))
  await expect(page.locator('[data-project-item]')).toHaveCount(25)
  const after = (await item.boundingBox())!
  expect(after.x).toBeCloseTo(before.x, 0)
  expect(after.y).toBeCloseTo(before.y, 0)
})

test('resize cancels an active drag and releases the movement guard', async ({ page }) => {
  await openFixture(page, { count: 6 })
  const image = (await page.locator('[data-project-drag-surface]').first().boundingBox())!
  await page.mouse.move(image.x + 10, image.y + 10)
  await page.mouse.down()
  await page.mouse.move(image.x + 70, image.y + 50, { steps: 5 })
  await expect(page.locator('html')).toHaveAttribute('data-project-moving', 'true')
  await page.setViewportSize({ width: 768, height: 900 })
  await expect(page.locator('html')).toHaveAttribute('data-project-moving', 'false')
  await page.mouse.up()
})

for (const lenis of [true, false]) {
  test(`dragging at the viewport edge scrolls the canvas with ${lenis ? 'Lenis' : 'native scrolling'}`, async ({
    page,
  }) => {
    await openFixture(page, { count: 25 })
    await page.evaluate(
      (enabled) => window.renderProjectsFixture({ count: 25, lenis: enabled }),
      lenis,
    )
    const image = (await page.locator('[data-project-drag-surface]').first().boundingBox())!
    await page.mouse.move(image.x + 10, image.y + 10)
    await page.mouse.down()
    await page.mouse.move(image.x + 10, 896, { steps: 8 })
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(80)
    await page.mouse.up()
    await expect(page.locator('html')).toHaveAttribute('data-project-moving', 'false')
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
    const handle = page.locator('[data-project-drag-handle]').first()
    const item = page.locator('[data-project-item]').first()
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
    await expect(page.locator('[data-project-movement]')).toHaveCount(0)
    await handle.tap()
    await expect(page.locator('[data-project-movement]')).toBeVisible()
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

test('mouse drag moves a project and a normal click still navigates', async ({ page }) => {
  await openFixture(page)

  const item = page.locator('[data-project-item]').first()
  const before = await item.boundingBox()
  const image = item.locator('[data-project-image]').first()
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
  const title = item.locator('a[title]').first()
  await title.click()
  await page.waitForURL(/fixture-project-/)
})

test('drag is clamped inside the canvas bounds', async ({ page }) => {
  await openFixture(page, { count: 4 })

  const canvas = page.locator('[data-project-canvas]')
  const canvasBox = (await canvas.boundingBox())!
  const item = page.locator('[data-project-item]').first()
  const handle = item.locator('[data-project-drag-surface]')
  const handleBox = (await handle.boundingBox())!

  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(canvasBox.x - 400, canvasBox.y - 400, { steps: 16 })
  await page.mouse.up()

  const moved = (await item.boundingBox())!
  expect(moved.x).toBeGreaterThanOrEqual(canvasBox.x - 1)
  expect(moved.y).toBeGreaterThanOrEqual(canvasBox.y - 1)

  const nextBox = (await handle.boundingBox())!
  await page.mouse.move(nextBox.x + 4, nextBox.y + 4)
  await page.mouse.down()
  await page.mouse.move(canvasBox.x + canvasBox.width + 400, canvasBox.y + canvasBox.height + 400, {
    steps: 16,
  })
  await page.mouse.up()

  const far = (await item.boundingBox())!
  expect(far.x + far.width).toBeLessThanOrEqual(canvasBox.x + canvasBox.width + 1)
  expect(far.y + far.height).toBeLessThanOrEqual(canvasBox.y + canvasBox.height + 1)
})

test('keyboard movement, cancellation, and directional buttons', async ({ page }) => {
  await openFixture(page, { count: 3 })

  const item = page.locator('[data-project-item]').first()
  const handle = item.locator('[data-project-drag-handle]')
  const start = (await item.boundingBox())!

  await handle.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-project-movement]')).toBeVisible()

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowRight')
  const moved = (await item.boundingBox())!
  expect(moved.x).toBeGreaterThan(start.x + 10)

  // Escape restores the position captured when movement mode opened.
  await page.keyboard.press('Escape')
  await expect(page.locator('[data-project-movement]')).toHaveCount(0)
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
  const overlay = page.locator('[data-project-movement]')
  const beforeButton = (await item.boundingBox())!
  await overlay.locator('[data-project-move="right"]').click()
  const afterButton = (await item.boundingBox())!
  expect(afterButton.x).toBeGreaterThan(beforeButton.x)
  await overlay.locator('[data-project-move="done"]').click()
  await expect(overlay).toHaveCount(0)
})

test('reset layout restores all loaded projects', async ({ page }) => {
  await openFixture(page, { count: 6 })

  const canvas = page.locator('[data-project-canvas]')
  const canvasBox = (await canvas.boundingBox())!
  const positions: Array<{ x: number; y: number }> = []

  const items = page.locator('[data-project-item]')
  const total = await items.count()
  for (let index = 0; index < 3; index += 1) {
    const item = items.nth(index)
    const handle = item.locator('[data-project-drag-surface]')
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

  const reset = page.locator('[data-project-reset]')
  await expect(reset).toBeEnabled()
  await reset.click()

  for (let index = 0; index < total; index += 1) {
    const box = (await items.nth(index).boundingBox())!
    // Default positions come back, so at least one item must have moved.
    if (positions[index].x !== box.x || positions[index].y !== box.y) return
  }
  throw new Error('reset layout did not restore any project position')
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

  const canvas = page.locator('[data-project-canvas]')
  const handle = page.locator('[data-project-item]').first().locator('[data-project-drag-surface]')
  const handleBox = (await handle.boundingBox())!
  await page.mouse.move(handleBox.x + 10, handleBox.y + 10)
  await page.mouse.down()
  await page.mouse.move(handleBox.x + 300, handleBox.y + 200, { steps: 14 })
  await page.mouse.up()

  await page.setViewportSize({ width: 390, height: 900 })
  await page.waitForTimeout(200)

  const canvasBox = (await canvas.boundingBox())!
  const items = page.locator('[data-project-item]')
  const total = await items.count()
  for (let index = 0; index < total; index += 1) {
    const box = (await items.nth(index).boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(canvasBox.x - 1)
    expect(box.x + box.width).toBeLessThanOrEqual(canvasBox.x + canvasBox.width + 1)
  }
})

test('reduced motion keeps position changes immediate', async ({ page }) => {
  await openFixture(page, { count: 3, reducedMotion: true })

  const item = page.locator('[data-project-item]').first()
  const handle = item.locator('[data-project-drag-handle]')
  await handle.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowRight')
  await expect(item).toBeVisible()
  await expect(page.locator('[data-project-movement]')).toBeVisible()
  await page.keyboard.press('Enter')
})

test('focus brings an obscured project forward', async ({ page }) => {
  await openFixture(page, { count: 3 })

  // Stack the second project on top of the first via its movement mode.
  const first = page.locator('[data-project-item]').nth(0)
  const firstBox = (await first.boundingBox())!
  const second = page.locator('[data-project-item]').nth(1)
  const secondHandle = second.locator('[data-project-drag-surface]')
  const secondHandleBox = (await secondHandle.boundingBox())!
  await page.mouse.move(secondHandleBox.x + 10, secondHandleBox.y + 10)
  await page.mouse.down()
  await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2, {
    steps: 12,
  })
  await page.mouse.up()

  // Focusing the first project's handle must raise it above the overlap. Blur
  // the active element first so the focus event is a genuine change.
  const zBefore = await first.evaluate((el) => Number(getComputedStyle(el).zIndex))
  const otherZBefore = await second.evaluate((el) => Number(getComputedStyle(el).zIndex))
  expect(zBefore).toBeLessThanOrEqual(otherZBefore)

  await page.evaluate(
    'document.activeElement instanceof HTMLElement && document.activeElement.blur()',
  )
  await first.locator('[data-project-drag-handle]').focus()

  await expect
    .poll(async () => first.evaluate((el) => Number(getComputedStyle(el).zIndex)))
    .toBeGreaterThan(zBefore)

  const zIndex = await first.evaluate((el) => Number(getComputedStyle(el).zIndex))
  const otherZ = await second.evaluate((el) => Number(getComputedStyle(el).zIndex))
  expect(zIndex).toBeGreaterThan(otherZ)
})
