import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      resolve: {
        conditions: ['source'],
        alias: {
          '@root': rootDir,
          react: 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/compat/jsx-runtime',
          'react/jsx-dev-runtime': 'preact/compat/jsx-dev-runtime',
          'react-dom/test-utils': 'preact/test-utils',
        },
        dedupe: ['preact', 'preact/hooks', 'preact/compat'],
      },
    })
  },
}

export default config
