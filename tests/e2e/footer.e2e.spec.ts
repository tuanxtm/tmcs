import { expect, test, type Page } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'
import wgslVitePlugin from '@vgpu/wgsl/loader-vite'
import path from 'node:path'

let server: ViteDevServer
let url: string

test.beforeAll(async () => {
  server = await createServer({
    configFile: false,
    plugins: [wgslVitePlugin()],
    resolve: {
      alias: {
        'next/cache': path.resolve('tests/fixtures/stubs/next-cache.ts'),
        'next/link': path.resolve('tests/fixtures/stubs/next-link.tsx'),
        '@': path.resolve('src'),
      },
    },
    esbuild: { jsx: 'automatic' },
    server: { host: '127.0.0.1', port: 0 },
  })
  await server.listen()
  url = `${server.resolvedUrls!.local[0]}tests/fixtures/footer.html`
})

test.afterAll(async () => {
  await server?.close()
})

async function open(page: Page, query = '') {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', { value: undefined })
  })
  await page.goto(`${url}${query}`)
  await expect(page.locator('[data-footer]')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

async function bounds(page: Page, tile: string) {
  return (await page.locator(`[data-footer-tile="${tile}"]`).boundingBox())!
}

for (const [width, height] of [
  [1024, 768],
  [1440, 900],
  [1920, 1080],
  [1280, 720],
  [2560, 1440],
]) {
  test(`desktop grid fills ${width}x${height} without overflowing`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await open(page)
    const footer = (await page.locator('[data-footer]').boundingBox())!
    const frameInset = (width >= 1024 ? 10 : 8) * 2
    expect(Math.abs(footer.height - (height - frameInset))).toBeLessThan(2)
    const previous = (await page.locator('[data-fixture-previous]').boundingBox())!
    expect(footer.y).toBeCloseTo(previous.y + previous.height, 0)
    const text = await bounds(page, 'text')
    const contact = await bounds(page, 'contact')
    const company = await bounds(page, 'company')
    const address = await bounds(page, 'address')
    const other = await bounds(page, 'other')
    const social = await bounds(page, 'social')
    const logo = await bounds(page, 'logo')
    const flame = await bounds(page, 'flame')
    expect(contact.x).toBe(text.x)
    expect(contact.height).toBeCloseTo(text.height, 0)
    expect(contact.y).toBeCloseTo(text.y + text.height, 0)
    expect(address.x).toBe(company.x)
    expect(other.x).toBeCloseTo(footer.x + (footer.width * 5) / 12, 0)
    expect(social.x).toBeCloseTo(footer.x + (footer.width * 7) / 12, 0)
    expect(logo.height).toBeCloseTo(text.height + contact.height, 0)
    expect(flame.y).toBeCloseTo(logo.y + logo.height, 0)
    const copyrightRow = (await page
      .locator('[data-footer-tile="copyright"]')
      .locator('..')
      .boundingBox())!
    expect(copyrightRow.height).toBe(
      (await page.locator('[data-fixture-header]').boundingBox())!.height,
    )
    await expect(page.locator('[data-footer-tile="logo"] [role="img"]')).toHaveAttribute(
      'aria-label',
      'TMCS',
    )
    await expect(page.getByRole('navigation', { name: 'Legal' }).locator('svg')).toHaveCount(3)
    await expect(page.getByAltText('Footer inline image')).toBeVisible()
    await expect(page.getByAltText('Footer inline image')).toHaveJSProperty('complete', true)
    await expect(page.locator('[data-footer-tile="logo"]')).toHaveAttribute('href', '/')
    await expect(page.locator('[data-footer-tile="social"] a').first()).toHaveAttribute(
      'target',
      '_blank',
    )
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.locator('[data-footer]').scrollIntoViewIfNeeded()
    await page.screenshot({ path: `/tmp/tmcs-footer-revised-${width}.png`, fullPage: true })
  })
}

for (const [width, height] of [
  [390, 844],
  [768, 1024],
]) {
  test(`mobile flow at ${width}x${height} hides decoration and retains content`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })
    await open(page, '?locale=vi')
    for (const tile of ['company', 'business', 'resources', 'address']) {
      await expect(page.locator(`[data-footer-tile="${tile}"]`)).toBeHidden()
    }
    const other = await bounds(page, 'other')
    const social = await bounds(page, 'social')
    const copyright = await bounds(page, 'copyright')
    const logo = await bounds(page, 'logo')
    const flame = await bounds(page, 'flame')
    expect(other.y).toBe(social.y)
    expect(other.x + other.width).toBeCloseTo(social.x, 0)
    expect(copyright.y).toBeCloseTo(other.y + other.height, 0)
    expect(copyright.y).toBe(logo.y)
    expect(copyright.height).toBeCloseTo(other.height, 0)
    expect(logo.height).toBeCloseTo(social.height, 0)
    expect(flame.y).toBeCloseTo(logo.y + logo.height, 0)
    const legal = (await page.getByRole('navigation').boundingBox())!
    expect(legal.y).toBeCloseTo(flame.y + flame.height, 0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await expect(page.getByRole('link', { name: 'Điều khoản và quy định' })).toHaveAttribute(
      'href',
      '/vi/dieu-khoan-va-quy-dinh',
    )
    await expect(page.getByRole('link', { name: 'Chính sách quyền riêng tư' })).toHaveAttribute(
      'href',
      '/vi/chinh-sach-quyen-rieng-tu',
    )
    await expect(
      page.getByRole('navigation', { name: 'Thông tin pháp lý' }).getByRole('link'),
    ).toHaveCount(2)
    await page.screenshot({ path: `/tmp/tmcs-footer-revised-${width}.png`, fullPage: true })
  })
}

test('legal order, empty links, themes, reduced motion, and unavailable WebGPU remain usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await open(page, '?empty&dark&long')
  const legal = page.getByRole('navigation', { name: 'Legal' }).getByRole('link')
  expect(await legal.allTextContents()).toEqual([
    'Terms & Conditions',
    'Privacy Policy',
    'Cookie Policy',
  ])
  expect(
    await legal.evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual(['/terms-and-conditions', '/privacy-policy', '/cookie-policy'])
  await expect(page.locator('[data-footer-tile="other"] a')).toHaveCount(0)
  await expect(page.locator('[data-footer-tile="social"] a')).toHaveCount(0)
  await expect(page.locator('[data-footer-tile="text"]')).toHaveCSS('overflow-y', 'auto')
  await expect(page.getByRole('textbox', { name: 'Your email' })).toBeVisible()
  await expect(page.locator('canvas')).toHaveCSS('opacity', '0')
  expect(errors).toEqual([])
})

test('email callback supports validation, keyboard submission, pending state, failure, and retry', async ({
  page,
}) => {
  await open(page)
  const form = page.getByRole('form', { name: 'CONTACT ME' })
  const email = form.getByRole('textbox', { name: 'Your email' })
  const button = form.getByRole('button', { name: 'Request an email reply' })
  await expect(form.locator('input:visible')).toHaveCount(1)
  await expect(button).toBeDisabled()
  await email.fill('invalid')
  await expect(button).toBeDisabled()
  await email.fill('visitor@example')
  await expect(button).toBeDisabled()
  await email.fill('')
  expect(await email.evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true)
  let attempt = 0
  let finish!: () => void
  const pending = new Promise<void>((resolve) => {
    finish = resolve
  })
  await page.route('**/api/contact', async (route) => {
    attempt++
    const body = route.request().postDataJSON()
    expect(body.intent).toBe('footer-callback')
    expect(body.email).toBe('visitor@example.com')
    expect(body.consent).toBe(true)
    expect(body.name).toBeUndefined()
    expect(body.message).toBeUndefined()
    if (attempt === 1) {
      await pending
      await route.fulfill({ status: 500, json: { ok: false } })
    } else {
      await route.fulfill({ json: { ok: true } })
    }
  })
  await email.fill('visitor@example.com')
  await expect(button).toBeEnabled()
  await email.press('Enter')
  await expect(button).toBeDisabled()
  await expect(form.getByRole('status')).toHaveText('Sending…')
  finish()
  await expect(form.getByRole('status')).toHaveText('Couldn’t send that. Please try again.')
  await expect(email).toHaveValue('visitor@example.com')
  await button.click()
  await expect(form.getByRole('status')).toHaveText('Email received. I’ll be in touch.')
  await expect(button).toBeDisabled()
  expect(attempt).toBe(2)
})

test('Vietnamese form announces network failure and successful retry', async ({ page }) => {
  await open(page, '?locale=vi')
  await page.route('**/api/contact', (route) => route.abort())
  await page.getByRole('textbox', { name: 'Email của bạn' }).fill('visitor@example.com')
  await page.getByRole('button', { name: 'Yêu cầu liên hệ qua email' }).click()
  await expect(page.getByRole('status')).toHaveText('Chưa gửi được. Bạn thử lại nhé.')
  await page.route('**/api/contact', (route) => route.fulfill({ json: { ok: true } }))
  await page.getByRole('button', { name: 'Yêu cầu liên hệ qua email' }).click()
  await expect(page.getByRole('status')).toHaveText('Đã nhận email. Mình sẽ liên hệ lại nhé.')
})

test('footer typography, aligned links, and logo match the requested treatments', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await open(page)
  const bodySizes = await page.locator('[data-footer]').evaluate((footer) => {
    const selectors = [
      '[data-footer-tile="text"] p',
      '[data-footer-tile="other"] a',
      '[data-footer-tile="social"] a',
      'form p',
      'input[type="email"]',
      '[data-footer-tile="copyright"]',
    ]
    return selectors.flatMap((selector) =>
      Array.from(
        footer.querySelectorAll(selector),
        (element) => getComputedStyle(element).fontSize,
      ),
    )
  })
  expect(new Set(bodySizes).size).toBe(1)
  const navSize = await page
    .locator('[data-fixture-nav-item]')
    .evaluate((el) => getComputedStyle(el).fontSize)
  await expect(page.locator('[data-footer-tile="other"] > p')).toHaveCSS('font-size', navSize)
  await expect(page.getByRole('navigation').getByRole('link').first()).toHaveCSS(
    'font-size',
    navSize,
  )
  await expect(page.getByRole('navigation')).toHaveCSS('text-transform', 'uppercase')
  for (const tile of ['other', 'social']) {
    const spacing = await page.locator(`[data-footer-tile="${tile}"]`).evaluate((cell) => {
      const list = cell.querySelector('ul')!
      const outer = cell.getBoundingClientRect()
      const inner = list.getBoundingClientRect()
      const style = getComputedStyle(cell)
      return {
        right: outer.right - inner.right,
        bottom: outer.bottom - inner.bottom,
        paddingRight: parseFloat(style.paddingRight),
        paddingBottom: parseFloat(style.paddingBottom),
        align: getComputedStyle(list).textAlign,
      }
    })
    expect(spacing.align).toBe('right')
    expect(spacing.right).toBeCloseTo(spacing.paddingRight, 0)
    expect(spacing.bottom).toBeCloseTo(spacing.paddingBottom, 0)
  }
  const logo = page.locator('[data-footer-tile="logo"]')
  const background = await logo.evaluate((el) => getComputedStyle(el).backgroundColor)
  await logo.hover()
  await expect(logo).toHaveCSS('background-color', background)
  expect(await logo.evaluate((el) => getComputedStyle(el, '::before').content)).toBe('none')
})

test('footer suppresses both cursor effects and restores them outside the footer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await open(page)
  await page.locator('[data-fixture-previous]').hover()
  await expect(page.locator('[data-cursor-cross-root]')).toBeVisible()
  await expect(page.locator('[data-cursor-popup-bubble]')).toHaveText('previous section')
  await page.locator('[data-footer-tile="contact"]').hover()
  await expect(page.locator('[data-cursor-cross-root]')).toBeHidden()
  await expect(page.locator('[data-cursor-popup-root]')).toBeHidden()
  await page.locator('[data-fixture-previous]').hover()
  await expect(page.locator('[data-cursor-cross-root]')).toBeVisible()
})
