import { type Locale, TranslationProvider } from '@root/src/i18n';
import type { Preview } from '@storybook/react-vite';
import '@hirslanden/ds/styles/tokens.css';
import '@root/src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
  globalTypes: {
    locale: {
      description: 'Active translation locale',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'de', title: 'Deutsch (de)' },
          { value: 'en', title: 'English (en)' },
          { value: 'fr', title: 'Français (fr)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'de',
  },
  decorators: [
    (Story, context) => (
      <TranslationProvider locale={context.globals.locale as Locale}>
        <Story />
      </TranslationProvider>
    ),
  ],
};

export default preview;
