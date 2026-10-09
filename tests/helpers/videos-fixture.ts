import { test, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

let outputDirectory: string

test.beforeAll(() => {
  outputDirectory = mkdtempSync(path.join(tmpdir(), 'tmcs-videos-'))
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
      'tests/fixtures/videos-section.tsx',
      '--target=browser',
      '--external',
      'next/link',
      '--external',
      'next/image',
      '--outdir',
      outputDirectory,
    ],
    { cwd: process.cwd() },
  )
})

test.afterAll(() => {
  if (outputDirectory) rmSync(outputDirectory, { recursive: true, force: true })
})

export async function openVideosFixture(page: Page, width = 390, height = 844) {
  const files = readdirSync(outputDirectory)
  const css = files
    .filter((file) => file.endsWith('.css'))
    .map((file) => readFileSync(path.join(outputDirectory, file), 'utf8'))
    .join('\n')

  await page.setViewportSize({ width, height })
  await page.route('http://videos-fixture.test/**', async (route) => {
    const url = new URL(route.request().url())
    const file = path.basename(url.pathname)
    if (files.includes(file)) {
      await route.fulfill({
        body: readFileSync(path.join(outputDirectory, file)),
        contentType: 'text/javascript',
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
          .fixture-page { min-height: 240vh; padding-top: 60vh; }
          .relative { position: relative; }
          .absolute { position: absolute; }
          .size-4 { width: 1rem; height: 1rem; }
          .size-3\\.5 { width: .875rem; height: .875rem; }
        </style>
        <div id="fixture"></div>
        <script type="importmap">${JSON.stringify({
          imports: {
            'next/link': '/next-link.js',
            'next/image': '/next-image.js',
          },
        })}</script>
        <script type="module" src="/videos-section.js"></script>`,
    })
  })
  await page.goto('http://videos-fixture.test/')
  await page.waitForFunction(() => document.querySelector('[data-video-card]') !== null)
  await page.waitForFunction(() => document.documentElement.classList.contains('lenis'))
}
