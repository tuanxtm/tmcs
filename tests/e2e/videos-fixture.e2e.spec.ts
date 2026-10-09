import { test, expect } from '@playwright/test'
import { openVideosFixture } from '../helpers/videos-fixture'

async function touchPoint(page: import('@playwright/test').Page) {
  const image = page.locator('[data-video-card]').first().locator('img').first()
  await image.evaluate((node) => {
    node.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })
  })
  const box = await image.boundingBox()
  expect(box).not.toBeNull()
  if (!box) throw new Error('Fixture thumbnail has no box')

  const point = { x: Math.round(box.x + box.width * 0.9), y: Math.round(box.y + box.height / 2) }
  const target = await page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y)
    const chain: Array<{ tag: string; className: string | null; touchAction: string }> = []
    let current = element
    while (current && chain.length < 6) {
      chain.push({
        tag: current.tagName,
        className: current.getAttribute('class'),
        touchAction: getComputedStyle(current).touchAction,
      })
      current = current.parentElement
    }
    return {
      inViewport: x >= 0 && x < innerWidth && y >= 0 && y < innerHeight,
      inVideoCard: Boolean(element?.closest('[data-video-card]')),
      chain,
    }
  }, point)
  expect(target.inViewport, JSON.stringify(target.chain)).toBe(true)
  expect(target.inVideoCard, JSON.stringify(target.chain)).toBe(true)
  return point
}

async function dispatchSwipe(
  page: import('@playwright/test').Page,
  point: { x: number; y: number },
  deltaX: number,
  deltaY: number,
) {
  const session = await page.context().newCDPSession(page)
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...point, id: 1 }],
  })
  for (let step = 1; step <= 10; step += 1) {
    await session.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        {
          x: point.x + (deltaX * step) / 10,
          y: point.y + (deltaY * step) / 10,
          id: 1,
        },
      ],
    })
    await page.waitForTimeout(16)
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
}

test.describe('Videos section isolated fixture', () => {
  test('uses the responsive gutter, growing desktop cards, serif titles, and requested colors', async ({
    page,
  }) => {
    await openVideosFixture(page, 1440, 900)
    const section = page.locator('[data-feed-type="videos"]')
    const scroller = section.locator('[data-video-scroller]').first()
    const metricsAt1440 = await page.evaluate(() => {
      const section = document.querySelector('[data-feed-type="videos"]')!
      const scroller = section.querySelector('[data-video-scroller]')!
      const card = section.querySelector('[data-video-card]')!
      const heading = section.querySelector('h2')!
      const provider = section.querySelector('h3')!
      const arrow = section.querySelector('[aria-label^="Next"]')!
      const title = card.querySelector('h4')!
      return {
        gutter: scroller.getBoundingClientRect().left - section.getBoundingClientRect().left,
        cardWidth: card.getBoundingClientRect().width,
        headingColor: getComputedStyle(heading).color,
        providerColor: getComputedStyle(provider).color,
        arrowColor: getComputedStyle(arrow).color,
        titleFont: getComputedStyle(title).fontFamily,
        titleColor: getComputedStyle(title).color,
        dateColor: getComputedStyle(card.querySelector('time')!).color,
        titleTransform: getComputedStyle(title).textTransform,
        titleText: title.textContent,
      }
    })
    expect(metricsAt1440.gutter).toBe(16)
    expect(metricsAt1440.headingColor).toBe('rgb(86, 86, 86)')
    expect(metricsAt1440.providerColor).toBe('rgb(59, 91, 219)')
    expect(metricsAt1440.arrowColor).toBe('rgb(59, 91, 219)')
    expect(metricsAt1440.titleFont.toLowerCase()).toContain('georgia')
    expect(metricsAt1440.titleColor).toBe('rgb(86, 86, 86)')
    expect(metricsAt1440.dateColor).toBe('rgb(86, 86, 86)')
    expect(metricsAt1440.titleTransform).toBe('none')
    expect(metricsAt1440.titleText).toBe('Preserved Title Case')

    for (const width of [1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 1080 })
      await expect
        .poll(() => scroller.evaluate((element) => element.getBoundingClientRect().left))
        .toBe(16)
      const strip = await page.evaluate(() => {
        const scroller = document.querySelector('[data-video-scroller]')!
        const list = scroller.querySelector('ul')!
        const cards = Array.from(list.querySelectorAll<HTMLElement>(':scope > [data-video-card]'))
        const viewport = scroller.getBoundingClientRect()
        const firstWidth = cards[0].getBoundingClientRect().width
        const firstLeft = cards[0].getBoundingClientRect().left
        const fifthRect = cards[4].getBoundingClientRect()
        const visibleFifth = Math.max(
          0,
          Math.min(fifthRect.right, viewport.right) - Math.max(fifthRect.left, viewport.left),
        )
        const fullyVisibleCount = cards.filter((item) => {
          const rect = item.getBoundingClientRect()
          return rect.left >= viewport.left - 1 && rect.right <= viewport.right + 1
        }).length
        return {
          cardWidth: firstWidth,
          containerWidth: scroller.clientWidth,
          fullCards: fullyVisibleCount,
          fifthFraction: visibleFifth / fifthRect.width,
          firstOffset: firstLeft - viewport.left,
        }
      })
      expect(strip.cardWidth).toBeCloseTo(((strip.containerWidth - 80) * 3) / 13, 0)
      expect(strip.fullCards).toBe(4)
      expect(strip.fifthFraction).toBeCloseTo(1 / 3, 2)
      expect(strip.firstOffset).toBeGreaterThanOrEqual(0)
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await expect
      .poll(() => scroller.evaluate((element) => element.getBoundingClientRect().left))
      .toBe(12)
  })

  test('vertical thumbnail drags scroll the Lenis page', async ({ page }) => {
    await openVideosFixture(page)
    await expect(page.locator('html')).toHaveClass(/lenis/)
    const point = await touchPoint(page)
    const before = await page.evaluate(() => window.scrollY)
    await dispatchSwipe(page, point, 0, -180)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 20)
  })

  test('horizontal thumbnail swipes scroll the row and tapping still starts playback', async ({
    page,
  }) => {
    await openVideosFixture(page)
    const scroller = page.locator('[data-video-scroller]').first()
    const point = await touchPoint(page)
    const before = await scroller.evaluate((element) => element.scrollLeft)
    await dispatchSwipe(page, point, -240, 0)
    await expect
      .poll(() => scroller.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(before + 20)
    await expect(scroller.locator('iframe')).toHaveCount(0)

    const playButton = page.locator('[data-video-card]').first().locator('button').first()
    await playButton.evaluate((node) => {
      node.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' })
    })
    await playButton.click()
    await expect(scroller.locator('iframe')).toHaveCount(1)
  })

  test('previous Lenis containment rule reproduced the vertical gesture trap', async ({ page }) => {
    await openVideosFixture(page)
    await page.addStyleTag({
      content:
        '.lenis [data-lenis-prevent-horizontal] { overscroll-behavior: contain !important; }',
    })
    const point = await touchPoint(page)
    const before = await page.evaluate(() => window.scrollY)
    await dispatchSwipe(page, point, 0, -180)
    await page.waitForTimeout(250)
    expect(await page.evaluate(() => window.scrollY)).toBe(before)
  })
})
