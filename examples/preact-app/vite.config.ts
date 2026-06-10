import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

// @preact/preset-vite auto-aliases react/react-dom -> preact/compat,
// reproducing exactly how a real consumer app runs this library.
export default defineConfig({
  plugins: [preact()],
})
