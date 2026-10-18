import { test, expect, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { retireFrontendFixture, writeFrontendStyles } from './frontend-styles'

export function createBootSplashFixture() {
  let outputDirectory: string
  test.beforeAll(async () => {
    outputDirectory = mkdtempSync(path.join(tmpdir(), 'tmcs-boot-splash-'))
    await writeFrontendStyles(outputDirectory)
    execFileSync(
      'bun',
      ['build', 'tests/fixtures/boot-splash.tsx', '--target=browser', '--outdir', outputDirectory],
      { cwd: process.cwd() },
    )
  })
  test.afterAll(() => {
    if (outputDirectory) retireFrontendFixture(outputDirectory)
  })

  return async function openBootSplashFixture(
    page: Page,
    { locale = 'en', width = 1440, afterLoad = false } = {},
  ) {
    let finishLoading!: () => void
    const loading = new Promise<void>((resolve) => {
      finishLoading = resolve
    })
    const files = readdirSync(outputDirectory)
    const css = files
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(path.join(outputDirectory, file), 'utf8'))
      .join('\n')
    await page.route('http://boot-splash.test/**', async (route) => {
      const file = path.basename(new URL(route.request().url()).pathname)
      if (file === 'pending.svg') {
        await loading
        await route.fulfill({
          contentType: 'image/svg+xml',
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
        })
      } else if (files.includes(file)) {
        await route.fulfill({
          contentType: 'text/javascript',
          body: readFileSync(path.join(outputDirectory, file)),
        })
      } else {
        await route.fulfill({
          contentType: 'text/html',
          body: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
            <style>${css}</style></head><body><div id="fixture"></div>
            ${afterLoad ? '' : '<img src="/pending.svg" alt="" hidden>'}
            <script type="module" src="/boot-splash.js"></script></body></html>`,
        })
      }
    })
    await page.setViewportSize({ width, height: 844 })
    await page.goto(`http://boot-splash.test/?locale=${locale}${afterLoad ? '&afterLoad' : ''}`, {
      waitUntil: 'domcontentloaded',
    })
    await expect(page.locator('.boot-splash')).toBeVisible()
    return { finishLoading }
  }
}
