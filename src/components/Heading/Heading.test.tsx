import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'

test('renders the heading text at level 1', () => {
  render(<Heading level={1}>Before you start</Heading>)
  expect(screen.getByRole('heading', { name: 'Before you start', level: 1 })).toBeInTheDocument()
})

test('renders the requested heading level', () => {
  render(<Heading level={2}>Subtitle</Heading>)
  expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
})
