import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

test('renders an svg', () => {
  const { container } = render(<Icon name="plus" />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})

test('is decorative by default (aria-hidden)', () => {
  const { container } = render(<Icon name="plus" />)
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

test('exposes an accessible name when a title is provided', () => {
  render(<Icon name="arrow-left" title="Back" />)
  expect(screen.getByRole('img', { name: 'Back' })).toBeInTheDocument()
})
