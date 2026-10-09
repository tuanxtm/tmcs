import { expect, test, type Page } from '@playwright/test'

async function openReadyPage(page: Page, locale: 'en' | 'vi', width: number) {
  await page.setViewportSize({ width, height: 844 })
  await page.goto(locale === 'vi' ? 'http://localhost:3000/vi' : 'http://localhost:3000/')
  await expect(page.locator('html')).toHaveClass(/boot-ready/)
  await expect(page.locator('.boot-splash')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
}

for (const viewport of [
  { label: 'mobile', width: 390 },
  { label: 'desktop', width: 1440 },
]) {
  test(`${viewport.label} back-to-top fits localized labels and responds to hover, focus, and scroll`, async ({
    page,
  }) => {
    const widths: Record<'en' | 'vi', number> = { en: 0, vi: 0 }

    for (const locale of ['en', 'vi'] as const) {
      await openReadyPage(page, locale, viewport.width)
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await page.mouse.move(0, 0)
      const accessibleName = locale === 'vi' ? 'VỀ ĐẦU TRANG' : 'BACK TO TOP'
      const button = page.getByRole('button', { name: accessibleName })
      const retainedButton = page.locator(`button[aria-label="${accessibleName}"]`)

      await expect(button).toHaveCount(0)
      await expect(retainedButton).toHaveAttribute('aria-hidden', 'true')
      await expect(retainedButton).toHaveAttribute('inert', '')
      expect(
        await retainedButton.evaluate((element) => ({
          opacity: getComputedStyle(element).opacity,
          visibility: getComputedStyle(element).visibility,
        })),
      ).toEqual({ opacity: '0', visibility: 'hidden' })
      await page.evaluate(() => window.scrollTo(0, 420))
      await expect(button).toBeVisible()
      await page.waitForTimeout(90)
      const entering = await retainedButton.evaluate((element) => ({
        opacity: Number.parseFloat(getComputedStyle(element).opacity),
        clipPath: getComputedStyle(element).clipPath,
      }))
      expect(entering.opacity).toBeGreaterThan(0)
      expect(entering.opacity).toBeLessThan(1)
      expect(entering.clipPath).not.toMatch(/inset\(100%/)
      expect(entering.clipPath).not.toBe('inset(0px)')
      await page.waitForTimeout(220)
      await expect(retainedButton).toHaveAttribute('aria-hidden', 'false')
      await expect(retainedButton).not.toHaveAttribute('inert', '')
      expect(
        await retainedButton.evaluate((element) => ({
          opacity: getComputedStyle(element).opacity,
          visibility: getComputedStyle(element).visibility,
          clipPath: getComputedStyle(element).clipPath,
        })),
      ).toEqual({ opacity: '1', visibility: 'visible', clipPath: 'inset(0px)' })
      await expect(button).toHaveText(locale === 'vi' ? /VỀ\s*ĐẦU\s*TRANG/ : /BACK\s*TO\s*TOP/)
      await expect(button).not.toHaveAttribute('aria-hidden', 'true')
      expect(await button.evaluate((element) => element.closest('[aria-hidden="true"]'))).toBeNull()

      const metrics = await button.evaluate((element) => {
        const style = getComputedStyle(element)
        const root = getComputedStyle(document.documentElement)
        const rect = element.getBoundingClientRect()
        const frame = document.querySelector('[data-site-frame]')!.getBoundingClientRect()
        const label = element.querySelector('span[aria-hidden="true"]')!.getBoundingClientRect()
        const arrow = element.querySelector('svg')!.getBoundingClientRect()
        const probe = document.createElement('span')
        probe.style.cssText =
          'position:fixed;visibility:hidden;color:var(--accent);background:var(--background)'
        document.body.appendChild(probe)
        const palette = getComputedStyle(probe)
        const accent = palette.color
        const background = palette.backgroundColor
        probe.remove()
        return {
          width: rect.width,
          position: style.position,
          fontSize: style.fontSize,
          paddingLeft: Number.parseFloat(style.paddingLeft),
          paddingRight: Number.parseFloat(style.paddingRight),
          borderLeft: Number.parseFloat(style.borderLeftWidth),
          borderRight: Number.parseFloat(style.borderRightWidth),
          labelWidth: label.width,
          labelRight: label.right,
          arrowWidth: arrow.width,
          arrowHeight: arrow.height,
          arrowRight: arrow.right,
          backdropFilter: style.backdropFilter,
          backgroundColor: style.backgroundColor,
          color: style.color,
          accent,
          background,
          rightGap: window.innerWidth - rect.right,
          bottomGap: window.innerHeight - rect.bottom,
          frameRight: window.innerWidth - frame.right,
          frameBottom: window.innerHeight - frame.bottom,
          outerLine: Number.parseFloat(root.getPropertyValue('--outer-line-weight')),
          transitionProperty: style.transitionProperty,
          transitionDuration: style.transitionDuration,
        }
      })

      expect(metrics.position).toBe('fixed')
      expect(metrics.fontSize).toBe('10px')
      expect(metrics.backdropFilter).not.toBe('none')
      expect(metrics.backgroundColor).toMatch(/\/\s*0\.2\)/)
      expect(metrics.color).toBe(metrics.accent)
      expect(metrics.width).toBeCloseTo(
        metrics.labelWidth +
          metrics.paddingLeft +
          metrics.paddingRight +
          metrics.borderLeft +
          metrics.borderRight,
        1,
      )
      expect(metrics.arrowWidth).toBe(8)
      expect(metrics.arrowHeight).toBe(16)
      expect(Math.abs(metrics.arrowRight - metrics.labelRight)).toBeLessThan(0.5)
      expect(metrics.rightGap).toBeCloseTo(metrics.frameRight + metrics.outerLine, 1)
      expect(metrics.bottomGap).toBeCloseTo(metrics.frameBottom + metrics.outerLine, 1)
      expect(metrics.transitionProperty).toContain('background-color')
      expect(metrics.transitionProperty).toContain('color')
      expect(Number.parseFloat(metrics.transitionDuration)).toBeGreaterThan(0)
      widths[locale] = metrics.width

      const initialPalette = { background: metrics.backgroundColor, color: metrics.color }
      await button.hover()
      await page.waitForTimeout(90)
      const midHover = await button.evaluate((element) => ({
        background: getComputedStyle(element).backgroundColor,
        color: getComputedStyle(element).color,
      }))
      expect(midHover.background).not.toBe(initialPalette.background)
      expect(midHover.background).not.toBe(metrics.accent)
      expect(midHover.color).not.toBe(initialPalette.color)
      expect(midHover.color).not.toBe(metrics.background)

      await page.waitForTimeout(220)
      await expect
        .poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor))
        .toBe(metrics.accent)
      await expect
        .poll(() => button.evaluate((element) => getComputedStyle(element).color))
        .toBe(metrics.background)

      await page.mouse.move(0, 0)
      const footer = page.locator('.page-blocks > footer')
      await footer.scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          footer.evaluate((element) => {
            const rect = element.getBoundingClientRect()
            return rect.top < window.innerHeight && rect.bottom > 0
          }),
        )
        .toBe(true)
      await expect(retainedButton).toHaveAttribute('aria-hidden', 'true')
      await expect(retainedButton).toHaveAttribute('inert', '')
      await expect(retainedButton).toHaveAttribute('data-visible', 'false')
      await page.waitForTimeout(90)
      const exiting = await retainedButton.evaluate((element) => ({
        opacity: Number.parseFloat(getComputedStyle(element).opacity),
        visibility: getComputedStyle(element).visibility,
        clipPath: getComputedStyle(element).clipPath,
      }))
      expect(exiting.opacity).toBeGreaterThan(0)
      expect(exiting.opacity).toBeLessThan(1)
      expect(exiting.visibility).toBe('visible')
      await page.waitForTimeout(220)
      await expect
        .poll(() => retainedButton.evaluate((element) => getComputedStyle(element).opacity))
        .toBe('0')
      await expect
        .poll(() => retainedButton.evaluate((element) => getComputedStyle(element).visibility))
        .toBe('hidden')
      expect(
        await retainedButton.evaluate((element) => getComputedStyle(element).clipPath),
      ).toMatch(/inset\(100%/)
      await expect(button).toHaveCount(0)
      await footer.evaluate((element) => {
        const rect = element.getBoundingClientRect()
        window.scrollTo(0, Math.max(420, window.scrollY + rect.top - window.innerHeight - 100))
      })
      await expect.poll(() => retainedButton.getAttribute('data-visible')).toBe('true')
      await expect(button).toBeVisible()
      await page.waitForTimeout(90)
      const reenteringOpacity = Number.parseFloat(
        await retainedButton.evaluate((element) => getComputedStyle(element).opacity),
      )
      expect(reenteringOpacity).toBeGreaterThan(0)
      expect(reenteringOpacity).toBeLessThan(1)
      await page.waitForTimeout(280)
      await expect
        .poll(() => retainedButton.evaluate((element) => getComputedStyle(element).opacity))
        .toBe('1')

      await page.mouse.move(0, 0)
      await expect
        .poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor))
        .toBe(initialPalette.background)
      await expect
        .poll(() => button.evaluate((element) => getComputedStyle(element).color))
        .toBe(initialPalette.color)

      await button.evaluate((buttonElement) => {
        const sentinel = document.createElement('button')
        sentinel.type = 'button'
        sentinel.textContent = 'Focus sentinel'
        sentinel.style.cssText = 'position:fixed;left:-100px;top:-100px'
        buttonElement.parentElement?.insertBefore(sentinel, buttonElement)
        sentinel.focus()
      })
      await page.keyboard.press('Tab')
      await expect(button).toBeFocused()
      expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
      await page.waitForTimeout(280)
      await expect
        .poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor))
        .toBe(metrics.accent)
      await expect
        .poll(() => button.evaluate((element) => getComputedStyle(element).color))
        .toBe(metrics.background)
      await button.evaluate((element) => element.previousElementSibling?.remove())

      await page.emulateMedia({ reducedMotion: 'reduce' })
      const reducedDurations = await button.evaluate((element) =>
        getComputedStyle(element)
          .transitionDuration.split(',')
          .map((duration) => Number.parseFloat(duration)),
      )
      expect(reducedDurations.every((duration) => duration <= 0.001)).toBe(true)
      await button.click()
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(1)
      await expect(button).toHaveCount(0)
    }

    expect(widths.vi).toBeGreaterThan(widths.en)
  })
}
