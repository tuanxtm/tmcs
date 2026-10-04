import { defineConfig } from '@playwright/test'
import config from './playwright.config'

export default defineConfig({
  ...config,
  testMatch: 'rich-text-baseline.e2e.spec.ts',
  webServer: undefined,
})
