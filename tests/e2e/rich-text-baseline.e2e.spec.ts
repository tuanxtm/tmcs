import { test, expect, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

let outputDirectory: string

test.beforeAll(() => {
  outputDirectory = mkdtempSync(path.join(tmpdir(), 'tmcs-rich-text-'))
  execFileSync(
    'bun',
    [
      'build',
      'tests/fixtures/rich-text-baseline.tsx',
      '--target=browser',
      '--outdir',
      outputDirectory,
    ],
    { cwd: process.cwd() },
  )
})

test.afterAll(() => {
  if (outputDirectory) rmSync(outputDirectory, { recursive: true, force: true })
})

test.beforeEach(async ({ page }) => {
  const files = readdirSync(outputDirectory)
  const script = files.find((file) => file.endsWith('.js'))!
  const css = files
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(path.join(outputDirectory, file), 'utf8'))
    .join('\n')
  await page.route('http://rich-text.test/**', async (route) => {
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
        <style>${css}
          body { margin: 0; --font-sans: Arial; --font-mono: monospace; --font-bitter: Georgia; }
          #fixture { font-family: Georgia, serif; font-size: 20px; }
          @media (min-width: 768px) { #fixture { font-size: 24px; } }
          @media (min-width: 1024px) { #fixture { font-size: 48px; } }
          .test-marker { display: inline-block; width: 0; height: 0; vertical-align: baseline; }
        </style>
        <div id="fixture"></div><script type="module" src="/${script}"></script>
      `,
      })
    }
  })
  await page.goto('http://rich-text.test/')
  await expect(page.locator('#uniform p')).toHaveCount(9)
})

async function assertUniformBaselines(page: Page) {
  const geometry = await page.locator('#uniform > div').evaluate((source) => {
    const root = source.cloneNode(true) as HTMLDivElement
    root.style.width = getComputedStyle(source).width
    root.style.position = 'absolute'
    root.style.visibility = 'hidden'
    source.parentElement!.appendChild(root)
    const paragraphs = Array.from(root.querySelectorAll('p'))
    for (const paragraph of paragraphs) {
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT)
      const nodes: Text[] = []
      while (walker.nextNode()) nodes.push(walker.currentNode as Text)
      for (const node of nodes) {
        const fragment = document.createDocumentFragment()
        for (const token of node.textContent?.match(/\S+|\s+/g) ?? []) {
          if (/^\s+$/.test(token)) {
            fragment.append(token)
            continue
          }
          const word = document.createElement('span')
          word.className = 'test-word'
          word.style.whiteSpace = 'nowrap'
          const marker = document.createElement('span')
          marker.className = 'test-marker'
          word.appendChild(marker)
          word.append(token)
          fragment.append(word)
        }
        node.replaceWith(fragment)
      }
      if (!paragraph.textContent) {
        const marker = document.createElement('span')
        marker.className = 'test-marker'
        paragraph.insertBefore(marker, paragraph.firstChild)
      }
      paragraph.querySelectorAll('[data-inline-image-align]').forEach((image) => {
        const word = document.createElement('span')
        word.className = 'test-image-word'
        word.style.whiteSpace = 'nowrap'
        const marker = document.createElement('span')
        marker.className = 'test-marker'
        image.replaceWith(word)
        word.appendChild(marker)
        word.appendChild(image)
      })
    }
    const baselines = Array.from(root.querySelectorAll('.test-marker'))
      .map((marker) => marker.getBoundingClientRect().top)
      .filter((value, index, values) => !index || Math.abs(value - values[index - 1]) > 1)
    const interval = Number.parseFloat(getComputedStyle(root).lineHeight)
    const fontSize = Number.parseFloat(getComputedStyle(root).fontSize)
    const rect = root.getBoundingClientRect()
    const images = Array.from(root.querySelectorAll('img')).map((image) => {
      const imageRect = image.getBoundingClientRect()
      const paragraphRect = image.closest('p')!.getBoundingClientRect()
      return {
        top: imageRect.top,
        bottom: imageRect.bottom,
        height: imageRect.height,
        width: imageRect.width,
        paragraphTop: paragraphRect.top,
        paragraphBottom: paragraphRect.bottom,
      }
    })
    root.remove()
    return { baselines, interval, fontSize, images, top: rect.top, bottom: rect.bottom }
  })
  expect(geometry.interval / geometry.fontSize).toBeCloseTo(1.15, 2)
  expect(geometry.baselines.length).toBeGreaterThan(8)
  geometry.baselines.slice(1).forEach((value, index) => {
    expect(
      Math.abs(value - geometry.baselines[index] - geometry.interval),
      JSON.stringify(geometry),
    ).toBeLessThanOrEqual(1)
  })
  for (const image of geometry.images) {
    expect(image.top).toBeGreaterThanOrEqual(geometry.top - 1)
    expect(image.bottom).toBeLessThanOrEqual(geometry.bottom + 1)
    expect(image.width / image.height).toBeGreaterThanOrEqual(0.99)
  }
}

test('equal baselines survive all image alignments and responsive wrapping', async ({ page }) => {
  const alignments = ['baseline', 'text-bottom', 'text-top', 'middle', 'top', 'bottom']
  for (const width of [390, 800, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const align of [...alignments, 'mixed']) {
      await page.evaluate(
        (values) => window.renderRichTextFixture({ alignments: values }),
        align === 'mixed' ? alignments : [align],
      )
      await assertUniformBaselines(page)
      await expect(page.locator('#natural .payload-richtext')).toHaveCount(1)
      await expect(page.locator('#natural p').first()).toHaveClass(/overflow-hidden/)
      await expect(page.locator('#uniform .payload-richtext')).toHaveCount(0)
    }
  }
})

test('content updates, inline fonts, invalid scales and unresolved media', async ({ page }) => {
  for (const font of ['serif', 'sans', 'mono'] as const) {
    await page.evaluate(
      (value) => window.renderRichTextFixture({ font: value, scales: [0.5, 1, 1.1, 1.5, 2, 3] }),
      font,
    )
    await assertUniformBaselines(page)
  }
  await page.evaluate(() => window.renderRichTextFixture({ scales: [NaN, -1, 0, Infinity, 1, 3] }))
  await assertUniformBaselines(page)
  await page.evaluate(() => window.renderRichTextFixture({ unresolved: true }))
  await expect(page.locator('#uniform img')).toHaveCount(0)
  await expect(page.locator('#uniform > div')).toHaveCSS('line-height', '55.2px')
  await assertUniformBaselines(page)
})

test('oversized images keep their size and are contained at the content edges', async ({
  page,
}) => {
  await page.evaluate(() =>
    window.renderRichTextFixture({ edgeImages: true, scales: [3, 1, 1.5, 2, 2.5, 3] }),
  )
  await assertUniformBaselines(page)
  const edges = await page.locator('#uniform > div').evaluate((root) => {
    const style = getComputedStyle(root)
    return {
      top: Number.parseFloat(style.paddingTop),
      bottom: Number.parseFloat(style.paddingBottom),
    }
  })
  expect(edges.top).toBeGreaterThan(0)
  expect(edges.bottom).toBeGreaterThan(0)
  await expect(page.locator('#uniform img').first()).toHaveCSS('height', '144px')
})

test('multiple images, linked images and mixed fonts share the same line metrics', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page.evaluate(() => window.renderRichTextFixture({ multiple: true, font: 'sans' }))
  await expect(page.locator('#uniform img')).toHaveCount(8)
  await expect(page.locator('#uniform a img')).toHaveCount(1)
  await assertUniformBaselines(page)
  await page.setViewportSize({ width: 1280, height: 900 })
  await assertUniformBaselines(page)
})
