import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Isolated jsdom project for frontend client-component tests.
 *
 * The main runner in `vitest.config.mts` stays on Node because Payload +
 * Wrangler/D1 break under jsdom. Only the frontend component specs listed
 * here run in jsdom, so no Payload import can leak into this environment.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    name: 'frontend',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/frontend/**/*.int.spec.tsx'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
})
