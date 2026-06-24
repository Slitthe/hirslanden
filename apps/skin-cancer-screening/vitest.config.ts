import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import preact from '@preact/preset-vite'
import { defineConfig } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [preact()],
  resolve: {
    // "@root" -> the app root, so imports read `@root/src/...` and `@root/scripts/...`.
    alias: {
      '@root': rootDir,
    },
    conditions: ['source', 'module', 'browser', 'development|production'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Inline the renderer so it resolves `preact`/`preact/hooks` through the same
    // Vite resolver as app code; otherwise the externalized copy is a second preact
    // instance and hooks lose their `currentComponent` wiring.
    server: { deps: { inline: ['@testing-library/preact'] } },
  },
})
