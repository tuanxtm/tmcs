import { expect, type Page } from '@playwright/test'

export async function expectTightCanvasBounds(page: Page, kind: 'project' | 'thing') {
  const canvas = page.locator(`[data-${kind}-canvas]`)
  const items = page.locator(`[data-${kind}-item]`)

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const frame = (await canvas.boundingBox())!
    const columns = width >= 1024 ? 3 : 2
    const padding = width >= 640 ? 24 : 16
    const laneWidth = (frame.width - padding * 2) / columns
    for (const [index, item] of (await items.all()).entries()) {
      const bounds = (await item.boundingBox())!
      const laneCenter = frame.x + padding + ((index % columns) + 0.5) * laneWidth
      expect(Math.abs(bounds.x + bounds.width / 2 - laneCenter)).toBeLessThanOrEqual(24)
      const image = (await item.locator(`[data-${kind}-drag-surface]`).boundingBox())!
      const label = (await item.locator(`[data-${kind}-drag-handle]`).locator('..').boundingBox())!
      expect(bounds.x).toBeCloseTo(Math.min(image.x, label.x), 0)
      expect(bounds.y).toBeCloseTo(Math.min(image.y, label.y), 0)
      expect(bounds.x + bounds.width).toBeCloseTo(
        Math.max(image.x + image.width, label.x + label.width),
        0,
      )
      expect(bounds.y + bounds.height).toBeCloseTo(
        Math.max(image.y + image.height, label.y + label.height),
        0,
      )
    }
  }

  const item = items.first()
  const surface = item.locator(`[data-${kind}-drag-surface]`)
  const padding = await canvas.evaluate((el) =>
    parseFloat(getComputedStyle(el).getPropertyValue('--padding')),
  )
  for (const corner of ['start', 'end']) {
    const image = (await surface.boundingBox())!
    const frame = (await canvas.boundingBox())!
    await page.mouse.move(image.x + 4, image.y + 4)
    await page.mouse.down()
    await page.mouse.move(
      corner === 'start' ? frame.x - 400 : frame.x + frame.width + 400,
      corner === 'start' ? frame.y - 400 : frame.y + frame.height + 400,
      { steps: 8 },
    )
    await page.mouse.up()
    const bounds = (await item.boundingBox())!
    const current = (await canvas.boundingBox())!
    if (corner === 'start') {
      expect(bounds.x - current.x).toBeCloseTo(padding, 0)
      expect(bounds.y - current.y).toBeCloseTo(padding, 0)
    } else {
      expect(current.x + current.width - bounds.x - bounds.width).toBeCloseTo(padding, 0)
      expect(current.y + current.height - bounds.y - bounds.height).toBeCloseTo(padding, 0)
    }
  }

  await page.setViewportSize({ width: 320, height: 900 })
  await expect
    .poll(async () => {
      const bounds = (await item.boundingBox())!
      const frame = (await canvas.boundingBox())!
      return (
        bounds.x + bounds.width <= frame.x + frame.width + 1 &&
        bounds.y + bounds.height <= frame.y + frame.height + 1
      )
    })
    .toBe(true)
}
