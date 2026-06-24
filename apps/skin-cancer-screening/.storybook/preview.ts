import type { Preview } from '@storybook/react-vite'
import '@hirslanden/ds/styles/tokens.css'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
}

export default preview
