import { expect, test, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export function createHeaderNavFixture() {
  let outputDirectory: string
  const globalStyles = readFileSync('src/app/(frontend)/styles.css', 'utf8')
  const hoverStyles = globalStyles.match(/\.site-cell-hover \{[\s\S]*?(?=\.site-shell \{)/)?.[0]
  if (!hoverStyles) throw new Error('Could not find site-cell-hover styles')
  test.beforeAll(() => {
    outputDirectory = mkdtempSync(path.join(tmpdir(), 'tmcs-header-nav-'))
    execFileSync(
      'bun',
      [
        'build',
        'tests/fixtures/stubs/next-link.tsx',
        'tests/fixtures/stubs/next-navigation.ts',
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
        'tests/fixtures/header-nav.tsx',
        '--target=browser',
        '--external',
        'next/link',
        '--external',
        'next/navigation',
        '--outdir',
        outputDirectory,
      ],
      { cwd: process.cwd() },
    )
  })
  test.afterAll(() => {
    if (outputDirectory) rmSync(outputDirectory, { recursive: true, force: true })
  })

  return async function openHeaderNavFixture(page: Page, width = 1440) {
    const files = readdirSync(outputDirectory)
    const css = files
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(path.join(outputDirectory, file), 'utf8'))
      .join('\n')
    await page.route('http://header-nav.test/**', async (route) => {
      const file = path.basename(new URL(route.request().url()).pathname)
      if (files.includes(file)) {
        await route.fulfill({
          body: readFileSync(path.join(outputDirectory, file)),
          contentType: 'text/javascript',
        })
        return
      }
      await route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
          <style>
            :root { --inner-line-weight: 1px; --outer-line-weight: 1.5px; --site-rule-color: color-mix(in oklch, var(--accent) 50%, transparent); --site-header-height: 56px; --site-cell-padding: 12px; --site-nav-font-size: .875rem; --site-action-tile-width: 10%; --site-frame-top: 8px; --site-frame-bottom: 8px; --accent: #3b5bdb; --accent-foreground: white; --background: white; --secondary: #222; --font-mono: monospace; }
            @media (min-width: 1024px) { :root { --site-header-height: 72px; --site-cell-padding: 16px; --site-nav-font-size: .6875rem; --site-frame-top: 10px; --site-frame-bottom: 10px; } }
            @media (min-width: 1440px) { :root { --site-nav-font-size: .8125rem; } }
            *, *::before, *::after { box-sizing: border-box; }
            body { margin: var(--site-frame-top); font: 12px monospace; }
            a { color: inherit; text-decoration: none; }
            button { border: 0; background: transparent; color: inherit; font: inherit; }
            ${hoverStyles}
          </style><style>${css}</style><div id="fixture"></div>
          <script type="importmap">${JSON.stringify({ imports: { 'next/link': '/next-link.js', 'next/navigation': '/next-navigation.js' } })}</script>
          <script type="module" src="/header-nav.js"></script>`,
      })
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('http://header-nav.test/')
    if (width >= 1024) await expect(page.getByRole('link', { name: 'Work' })).toBeVisible()
    else await expect(page.getByRole('button', { name: 'Open menu' })).toBeVisible()
  }
}
