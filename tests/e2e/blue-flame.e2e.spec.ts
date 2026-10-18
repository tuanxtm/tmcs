import { expect, test } from '@playwright/test'
import { createServer, type ViteDevServer } from 'vite'
import wgslVitePlugin from '@vgpu/wgsl/loader-vite'
import path from 'node:path'
import { writeFileSync } from 'node:fs'
import { readFireFrame } from '../helpers/blue-flame-readback'

let server: ViteDevServer
let url: string

test.use({
  launchOptions: {
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--enable-unsafe-webgpu',
      '--use-angle=vulkan',
      '--use-vulkan=swiftshader',
      '--use-webgpu-adapter=swiftshader',
      '--enable-features=Vulkan',
      '--disable-vulkan-surface',
    ],
  },
})

test.beforeAll(async () => {
  server = await createServer({
    configFile: false,
    plugins: [wgslVitePlugin()],
    resolve: { alias: { '@': path.resolve('src') } },
    esbuild: { jsx: 'automatic' },
    server: { host: '127.0.0.1', port: 0 },
  })
  await server.listen()
  url = `${server.resolvedUrls!.local[0]}tests/fixtures/blue-flame.html`
})

test.afterAll(async () => {
  await server?.close()
})

test('renders transparent animated fire, resizes, recolors, and remounts', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.setViewportSize({ width: 800, height: 600 })
  await page.goto(url)
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveCSS('opacity', '1')
  await expect(canvas).toHaveJSProperty('width', 800)
  await expect(canvas).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
  await expect.poll(() => readFireFrame(page)).toBeTruthy()
  const first = (await readFireFrame(page))!
  expect(first.transparent).toBeGreaterThan(0)
  expect(first.opaque).toBeGreaterThan(0)
  expect(first.bottom[2]).toBeGreaterThan(first.bottom[0])
  await expect.poll(async () => (await readFireFrame(page))!.hash).not.toBe(first.hash)
  await page.locator('.fire').evaluate((node) => {
    ;(node as HTMLElement).style.marginTop = '2000px'
  })
  await page.waitForTimeout(150)
  const paused = await page.evaluate(
    () => (window as unknown as { fireSubmissions: number }).fireSubmissions,
  )
  await page.waitForTimeout(200)
  expect(
    await page.evaluate(() => (window as unknown as { fireSubmissions: number }).fireSubmissions),
  ).toBe(paused)
  await page.locator('.fire').evaluate((node) => {
    ;(node as HTMLElement).style.marginTop = '0'
  })
  await expect
    .poll(async () =>
      page.evaluate(() => (window as unknown as { fireSubmissions: number }).fireSubmissions),
    )
    .toBeGreaterThan(paused)
  await page.setViewportSize({ width: 320, height: 600 })
  await expect(canvas).toHaveJSProperty('width', 320)
  await expect(canvas).toHaveJSProperty('height', 320)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.waitForTimeout(150)
  const blue = (await readFireFrame(page))!
  writeFileSync('/tmp/tmcs-blue-flame-accent.png', Buffer.from(blue.image.split(',')[1], 'base64'))
  await page.evaluate(() => document.documentElement.style.setProperty('--accent', '#00aaff'))
  await expect.poll(async () => (await readFireFrame(page))!.hash).not.toBe(blue.hash)
  const light = (await readFireFrame(page))!
  const shades = await page.evaluate(async (image) => {
    const bitmap = new Image()
    bitmap.src = image
    await bitmap.decode()
    const probe = document.createElement('canvas')
    probe.width = bitmap.width
    probe.height = bitmap.height
    const context = probe.getContext('2d')!
    context.drawImage(bitmap, 0, 0)
    const pixels = context.getImageData(0, 0, probe.width, probe.height).data
    const colors = new Map<string, number>()
    let opaque = 0
    let lightBlueTips = 0
    for (let i = 0; i < pixels.length; i += 4) {
      const row = Math.floor(i / 4 / probe.width)
      if (
        row < probe.height * 0.5 &&
        pixels[i + 3] > 128 &&
        pixels[i + 1] > 100 &&
        pixels[i + 2] > 170 &&
        pixels[i + 1] > pixels[i] + 30 &&
        pixels[i + 1] / pixels[i + 2] > 0.48
      ) {
        lightBlueTips++
      }
      if (row < probe.height * 0.4 || row >= probe.height * 0.8 || pixels[i + 3] !== 255) continue
      const color = `${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`
      colors.set(color, (colors.get(color) || 0) + 1)
      opaque++
    }
    return {
      count: colors.size,
      largestShare: Math.max(...colors.values()) / opaque,
      lightBlueTips,
    }
  }, blue.image)
  expect(shades.count).toBeGreaterThan(8)
  expect(shades.largestShare).toBeLessThan(0.3)
  expect(shades.lightBlueTips).toBeGreaterThan(100)
  expect(light.bottom).toEqual([166, 225, 255, 255])
  writeFileSync('/tmp/tmcs-blue-flame-light.png', Buffer.from(light.image.split(',')[1], 'base64'))
  await page.evaluate(() => document.documentElement.style.setProperty('--background', '#080d16'))
  await expect.poll(async () => (await readFireFrame(page))!.hash).not.toBe(light.hash)
  const dark = (await readFireFrame(page))!
  expect(dark.bottom.slice(0, 3)).toEqual([255, 255, 255])
  writeFileSync('/tmp/tmcs-blue-flame-dark.png', Buffer.from(dark.image.split(',')[1], 'base64'))
  await page.getByRole('button').click()
  await expect(canvas).toHaveCount(0)
  await page.getByRole('button').click()
  await expect(canvas).toHaveCSS('opacity', '1')
  expect(errors).toEqual([])
})

test('reduced motion produces a stable frame', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url)
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveCSS('opacity', '1')
  await expect.poll(() => readFireFrame(page)).toBeTruthy()
  const first = (await readFireFrame(page))!.hash
  const submissions = await page.evaluate(
    () => (window as unknown as { fireSubmissions: number }).fireSubmissions,
  )
  await page.waitForTimeout(250)
  expect((await readFireFrame(page))!.hash).toBe(first)
  expect(
    await page.evaluate(() => (window as unknown as { fireSubmissions: number }).fireSubmissions),
  ).toBe(submissions)
})

test('without WebGPU it stays transparent and does not load the renderer', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', { value: undefined })
  })
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto(url)
  await expect(page.locator('canvas')).toHaveCSS('opacity', '0')
  expect(requests.some((request) => request.includes('/blue-flame-renderer'))).toBe(false)
})
