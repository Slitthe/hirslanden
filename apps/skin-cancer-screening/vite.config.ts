import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// @preact/preset-vite auto-aliases react/react-dom -> preact/compat, so the DS's
// React-API source resolves to Preact at the app boundary. The "source" condition
// makes @hirslanden/ds resolve to its .ts source (live HMR, no DS build needed).
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve: {
    conditions: ['source', 'module', 'browser', 'development|production'],
  },
})
