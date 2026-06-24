import { render, screen } from '@testing-library/preact'
import { App } from './app'
import { TranslationProvider } from './i18n'

test('renders the localized title and start button for the active locale', () => {
  render(
    <TranslationProvider locale="de">
      <App />
    </TranslationProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Hautkrebs-Vorsorge' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Hautkrebs-Check starten' })).toBeInTheDocument()
})
