import { render, screen } from '@testing-library/preact'
import { App } from './app'

test('renders the start button from the design system', () => {
  render(<App />)
  expect(screen.getByRole('button', { name: 'Hautkrebs-Check starten' })).toBeInTheDocument()
})
