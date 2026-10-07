import { test, expect, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const STUBBED_NEXT_MODULES = ['next/link', 'next/image'] as const

export type OpenFixtureFn = (
  page: Page,
  options?: { width?: number; height?: number; count?: number; reducedMotion?: boolean },
) => Promise<void>

export type CanvasFixtureApi = OpenFixtureFn & {
  openFixtureWithCase: (
    page: Page,
    fixtureOptions?: Record<string, unknown>,
    viewport?: { width?: number; height?: number; reducedMotion?: boolean },
  ) => Promise<void>
}

export function createCanvasFixture(kind: 'projects' | 'things'): CanvasFixtureApi {
  let outputDirectory: string

  test.beforeAll(() => {
    outputDirectory = mkdtempSync(path.join(tmpdir(), 'tmcs-canvas-'))
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
        `tests/fixtures/${kind}-canvas.tsx`,
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
    const script = `${kind}-canvas.js`
    const css = files
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(path.join(outputDirectory, file), 'utf8'))
      .join('\n')

    // next/link and next/image are external, so map them to the DOM-only stubs.
    const imports = {
      'next/link': '/next-link.js',
      'next/image': '/next-image.js',
    }

    await page.route(`http://${kind}-canvas.test/**`, async (route) => {
      const url = new URL(route.request().url())
      const file = path.basename(url.pathname)
      // Fail the broken-image fixture path with a 404 so <Image onError> fires.
      if (kind === 'things' && url.pathname === '/broken-fixture-image.png') {
        await route.fulfill({ status: 404, contentType: 'text/plain', body: 'not found' })
        return
      }
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
            --outer-line-weight: 1.5px;
            --inner-line-weight: 1px;
            --background: #fbfbfb;
            --accent: #3b5bdb;
            --secondary: oklch(0.4567 0 0);
            --accent-foreground: #fff;
            --font-serif: Georgia, serif;
            --font-mono: monospace;
            --header-height: 48px;
            --destructive: #e03131;
          }
          body { margin: 0; background: var(--background); font-family: Arial; }
          header { position: sticky; top: 0; height: 48px; background: #fff; z-index: 10; }
          /* Tailwind utilities the components rely on, absent from the bundle. */
          .relative { position: relative; }
          .absolute { position: absolute; }
          .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
          [data-slot="drawer-overlay"] { position: fixed; inset: 0; z-index: 50; background: #0008; }
          [data-slot="drawer-viewport"] { position: fixed; inset: 0; z-index: 50; pointer-events: none; }
          [data-slot="drawer-content"] { display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto; height: 100%; }
          ${
            kind === 'things'
              ? `
            /* Things fixture: real shared site tokens so CSS modules resolve to the
               same baseline geometry as the production app. The local
               thing-detail.module.css owns the popup height/gutter/split. */
            :root {
              --site-frame-inset: 8px;
              --site-frame-top: 8px;
              --site-frame-right: 8px;
              --site-frame-bottom: 8px;
              --site-frame-left: 8px;
              --site-header-height: 56px;
              --site-cell-padding: 12px;
              --site-rule-color: color-mix(in oklch, var(--accent) 50%, transparent);
              --site-grid-line-color: color-mix(in oklch, var(--accent) 10%, transparent);
              --site-nav-font-size: 0.875rem;
            }
            @media (min-width: 1024px) {
              :root {
                --site-frame-inset: 10px;
                --site-frame-top: 10px;
                --site-frame-right: 10px;
                --site-frame-bottom: 10px;
                --site-frame-left: 10px;
                --site-header-height: 64px;
                --site-cell-padding: 16px;
                --site-nav-font-size: 0.6875rem;
              }
            }
            @media (min-width: 1440px) {
              :root { --site-nav-font-size: 0.8125rem; }
            }
            [data-slot="drawer-popup"] { position: fixed; inset-inline: 0; bottom: 0; width: 100%; background: var(--background); pointer-events: auto; }
            .site-cell-hover { position: relative; isolation: isolate; overflow: hidden; transition: color 260ms ease; }
            .site-cell-hover::before { position: absolute; z-index: -1; inset: 0; background: var(--accent); content: ''; transform: scaleY(0); transform-origin: bottom; transition: transform 260ms ease; pointer-events: none; }
            .site-cell-hover:is(:hover, :focus-visible):not(:disabled) { color: var(--accent-foreground); }
            .site-cell-hover:is(:hover, :focus-visible):not(:disabled)::before { transform: scaleY(1); }
            `
              : `
            [data-slot="drawer-popup"] { position: fixed; inset-inline: 0; bottom: 0; height: 60vh; background: white; pointer-events: auto; }
            [data-slot="drawer-content"] > .grid { height: 100%; display: grid; grid-template-columns: 1fr 1fr; }
            [data-slot="drawer-close"] { position: absolute; right: 12px; top: 12px; z-index: 1; }
            `
          }
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

    await page.goto(`http://${kind}-canvas.test/`)
    if (typeof options.count === 'number') {
      await page.evaluate(
        ({ count, kind }) =>
          (window as unknown as Record<string, (options: { count: number }) => void>)[
            kind === 'things' ? 'renderThingsFixture' : 'renderProjectsFixture'
          ]({ count }),
        { count: options.count, kind },
      )
    }
    await expect(
      page.locator(`[data-${kind === 'projects' ? 'project' : 'thing'}-canvas]`),
    ).toBeVisible()
    await expect(
      page.locator(`[data-${kind === 'projects' ? 'project' : 'thing'}-canvas]`),
    ).toHaveAttribute(`data-${kind === 'projects' ? 'project' : 'thing'}-canvas-ready`, 'true')
  }

  async function openFixtureWithCase(
    page: Page,
    fixtureOptions: Record<string, unknown> = {},
    viewport: { width?: number; height?: number; reducedMotion?: boolean } = {},
  ) {
    await openFixture(page, {
      ...viewport,
      count: typeof fixtureOptions.count === 'number' ? (fixtureOptions.count as number) : 25,
    })
    if (Object.keys(fixtureOptions).length > 0) {
      await page.evaluate(
        ({ options, kind }) =>
          (window as unknown as Record<string, (options: unknown) => void>)[
            kind === 'things' ? 'renderThingsFixture' : 'renderProjectsFixture'
          ](options),
        { options: fixtureOptions, kind },
      )
      await expect(
        page.locator(`[data-${kind === 'projects' ? 'project' : 'thing'}-canvas]`),
      ).toHaveAttribute(`data-${kind === 'projects' ? 'project' : 'thing'}-canvas-ready`, 'true')
    }
  }

  return Object.assign(openFixture, { openFixtureWithCase })
}
