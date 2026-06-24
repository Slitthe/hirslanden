import { render, screen } from '@testing-library/react'
import { Callout } from './Callout'

test('renders its content', () => {
  render(<Callout>Both tracks are in the low range.</Callout>)
  expect(screen.getByText('Both tracks are in the low range.')).toBeInTheDocument()
})

test('defaults to the accent variant', () => {
  render(<Callout>message</Callout>)
  expect(screen.getByText('message').closest('[data-variant]')).toHaveAttribute(
    'data-variant',
    'accent',
  )
})

test('renders an action when provided', () => {
  render(<Callout action={<button type="button">ABCDE guide</button>}>Check your moles</Callout>)
  expect(screen.getByRole('button', { name: 'ABCDE guide' })).toBeInTheDocument()
})
