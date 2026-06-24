import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const shared = {
  globals: true,
  environment: 'jsdom' as const,
  setupFiles: ['./tests/setup.ts'],
  include: ['src/**/*.test.tsx'],
};

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: { name: 'react', ...shared },
      },
      {
        plugins: [react({ jsxImportSource: 'preact/compat' })],
        resolve: {
          dedupe: ['preact', 'preact/hooks', 'preact/compat'],
          alias: {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
            'react/jsx-runtime': 'preact/compat/jsx-runtime',
            'react/jsx-dev-runtime': 'preact/compat/jsx-dev-runtime',
          },
        },
        test: {
          name: 'compat',
          ...shared,
          // Force @testing-library/* to be pre-bundled with the preact/compat aliases
          // so that react-dom/client resolves to preact/compat inside the bundle.
          deps: {
            optimizer: {
              client: {
                enabled: true,
                include: [
                  'preact',
                  'preact/hooks',
                  'preact/compat',
                  'preact/test-utils',
                  '@testing-library/react',
                  '@testing-library/user-event',
                ],
                exclude: ['preact', 'preact/hooks', 'preact/compat'],
                rolldownOptions: {
                  resolve: {
                    alias: {
                      react: 'preact/compat',
                      'react-dom': 'preact/compat',
                      'react-dom/test-utils': 'preact/test-utils',
                      'react/jsx-runtime': 'preact/compat/jsx-runtime',
                      'react/jsx-dev-runtime': 'preact/compat/jsx-dev-runtime',
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
});
