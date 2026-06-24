import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

test('associates the label with the input via a generated id', () => {
  render(<Input label="Email" />)
  const input = screen.getByLabelText('Email')
  expect(input).toBeInstanceOf(HTMLInputElement)
  expect(input.id).toBeTruthy()
})

test('uses an explicit id when provided', () => {
  render(<Input label="Name" id="custom-id" />)
  expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'custom-id')
})

test('forwards typing to onChange', async () => {
  const onChange = vi.fn()
  render(<Input label="City" onChange={onChange} />)
  await userEvent.type(screen.getByLabelText('City'), 'Zug')
  expect(onChange).toHaveBeenCalled()
})

test('forwards ref to the input element', () => {
  const ref = { current: null as HTMLInputElement | null }
  render(<Input label="Ref" ref={ref} />)
  expect(ref.current).toBeInstanceOf(HTMLInputElement)
})
