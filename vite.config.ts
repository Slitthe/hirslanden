import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

const root = import.meta.dirname
const componentsDir = resolve(root, 'src/components')

// One entry per component folder + the root barrel.
const componentEntries = Object.fromEntries(
  readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => [`components/${d.name}/index`, resolve(componentsDir, d.name, 'index.ts')]),
)

const entries = {
  index: resolve(root, 'src/index.ts'),
  ...componentEntries,
}

// This file is also read by Storybook (which registers its OWN React plugin and
// its own build). Only contribute the library build when invoked as
// `vite build --mode lib`; otherwise return an empty config so Storybook is
// unaffected and the React plugin is not registered twice.
export default defineConfig(({ mode }) => {
  if (mode !== 'lib') {
    return {}
  }

  return {
    plugins: [
      react(),
      libInjectCss(),
      dts({
        tsconfigPath: './tsconfig.build.json',
        entryRoot: 'src',
        outDirs: 'dist',
        include: ['src'],
        exclude: ['src/**/*.test.tsx', 'src/**/*.stories.tsx'],
      }),
    ],
    build: {
      copyPublicDir: false,
      cssCodeSplit: true, // REQUIRED: lib mode defaults this to false, which merges all CSS.
      lib: {
        entry: entries,
        formats: ['es'],
      },
      rollupOptions: {
        external: [/^react($|\/)/, /^react-dom($|\/)/, /^@floating-ui\//],
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  }
})
