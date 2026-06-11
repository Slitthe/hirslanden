import { render, screen } from '@testing-library/react'
import { Card } from './Card'

test('renders children inside a div by default', () => {
  render(<Card>content</Card>)
  expect(screen.getByText('content').tagName).toBe('DIV')
})

test('reflects variant and padding via data attributes', () => {
  render(
    <Card variant="dashed" padding="sm">
      x
    </Card>,
  )
  const el = screen.getByText('x')
  expect(el).toHaveAttribute('data-variant', 'dashed')
  expect(el).toHaveAttribute('data-padding', 'sm')
})

test('can render as a different element', () => {
  render(<Card as="section">x</Card>)
  expect(screen.getByText('x').tagName).toBe('SECTION')
})
