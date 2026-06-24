import { App } from '@root/src/app'
import { TranslationProvider } from '@root/src/i18n'
import { render, screen } from '@testing-library/preact'

test('renders the localized title and start button for the active locale', () => {
  render(
    <TranslationProvider locale="de">
      <App />
    </TranslationProvider>,
  )
  expect(screen.getByRole('heading', { name: 'Hautkrebs-Vorsorge' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Hautkrebs-Check starten' })).toBeInTheDocument()
})
