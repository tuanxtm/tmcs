import { test, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
import tailwindcss from '@tailwindcss/postcss'

let outputDirectory: string

test.beforeAll(async () => {
  outputDirectory = mkdtempSync(path.join(tmpdir(), 'tmcs-posts-carousel-'))
  execFileSync(
    'bun',
    [
      'build',
      'tests/fixtures/posts-carousel.tsx',
      'tests/fixtures/stubs/next-link.tsx',
      'tests/fixtures/stubs/next-image.tsx',
      '--target=browser',
      '--external',
      'next/link',
      '--external',
      'next/image',
      '--splitting',
      '--outdir',
      outputDirectory,
    ],
    { cwd: process.cwd() },
  )
  const stylesPath = path.resolve('tests/fixtures/posts-carousel-tailwind.css')
  const tailwindEntry = "@import 'tailwindcss';\n@source '../../src';"
  const tailwindCss = await postcss([tailwindcss({ base: process.cwd() })]).process(tailwindEntry, {
    from: stylesPath,
  })
  const generatedCssPath = path.join(outputDirectory, 'posts-carousel-tailwind.css')
  writeFileSync(generatedCssPath, tailwindCss.css)
})

test.afterAll(() => {
  if (outputDirectory) rmSync(outputDirectory, { recursive: true, force: true })
})

type PostsCase = 'mixed' | 'empty' | 'missing' | 'broken'

export type OpenPostsCarouselOptions = {
  width?: number
  height?: number
  case?: PostsCase
  reducedMotion?: boolean
}

export async function openPostsCarouselFixture(page: Page, options: OpenPostsCarouselOptions = {}) {
  const width = options.width ?? 1280
  const height = options.height ?? 900
  const caseId: PostsCase = options.case ?? 'mixed'

  const files = readdirSync(outputDirectory, { recursive: true }).map(String)
  const css = files
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(path.join(outputDirectory, file), 'utf8'))
    .join('\n')

  await page.setViewportSize({ width, height })

  if (options.reducedMotion) {
    await page.emulateMedia({ reducedMotion: 'reduce' })
  }

  await page.route('http://posts-carousel-fixture.test/**', async (route) => {
    const url = new URL(route.request().url())
    const file = decodeURIComponent(url.pathname.slice(1))
    if (files.includes(file) && file.endsWith('.js')) {
      await route.fulfill({
        body: readFileSync(path.join(outputDirectory, file)),
        contentType: 'text/javascript; charset=utf-8',
      })
      return
    }
    await route.fulfill({
      contentType: 'text/html',
      body: `<!doctype html>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${css}
          :root {
            --background: #fbfbfb;
            --accent: #3b5bdb;
            --secondary: #565656;
            --foreground: #222;
            --muted-foreground: #777;
            --primary: #3b5bdb;
            --ring: #3b5bdb;
            --accent-foreground: #fff;
            --font-serif: Georgia, serif;
            --font-mono: monospace;
            --site-cell-padding: 12px;
            --header-height: 48px;
          }
          @media (min-width: 1024px) { :root { --site-cell-padding: 16px; } }
          *, *::before, *::after { box-sizing: border-box; }
          html, body { margin: 0; min-height: 100%; background: var(--background); }
          body { color: var(--foreground); font-family: Arial, sans-serif; }
          .fixture-page { min-height: 240vh; padding-top: 30vh; }
          .canvas-section { color: var(--secondary); background: transparent; }
          .canvas-frame { container-type: inline-size; width: 100%; margin-inline: auto; }
          .canvas-heading {
            margin: 0;
            color: var(--secondary);
            font-family: var(--font-serif);
            font-size: clamp(2.25rem, 6vw, 6rem);
            font-weight: 300;
            line-height: 1.05;
            text-align: center;
          }
        </style>
        <div id="fixture"></div>
        <script type="importmap">${JSON.stringify({
          imports: {
            'next/link': '/stubs/next-link.js',
            'next/image': '/stubs/next-image.js',
          },
        })}</script>
        <script type="module" src="/posts-carousel.js?case=${caseId}"></script>`,
    })
  })
  await page.goto(`http://posts-carousel-fixture.test/?case=${caseId}`)
  await page.waitForFunction(
    (target) => document.querySelector(target) !== null,
    '[data-feed-type="posts"]',
  )
  if (caseId !== 'empty') {
    await page.waitForFunction(() => document.documentElement.classList.contains('lenis'))
    await page.waitForFunction(() => document.querySelector('canvas') !== null, undefined, {
      timeout: 15_000,
    })
  }
}
