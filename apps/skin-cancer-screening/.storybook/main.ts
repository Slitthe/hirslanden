import type { StorybookConfig } from '@storybook/react-vite'

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
