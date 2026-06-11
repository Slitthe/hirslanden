import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from './Accordion'
import { AccordionItem } from './AccordionItem'

function renderAccordion(props: Record<string, unknown> = {}) {
  return render(
    <Accordion {...props}>
      <AccordionItem value="a" title="Question A">
        Answer A
      </AccordionItem>
      <AccordionItem value="b" title="Question B">
        Answer B
      </AccordionItem>
    </Accordion>,
  )
}

test('renders collapsed items by default', () => {
  renderAccordion()
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
})

test('expands an item when its trigger is clicked', async () => {
  renderAccordion()
  await userEvent.click(screen.getByRole('button', { name: 'Question A' }))
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  expect(screen.getByRole('region', { name: 'Question A' })).toBeVisible()
})

test('allows multiple open by default', async () => {
  renderAccordion()
  await userEvent.click(screen.getByRole('button', { name: 'Question A' }))
  await userEvent.click(screen.getByRole('button', { name: 'Question B' }))
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
  expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
})

test('collapses others when allowMultiple is false', async () => {
  renderAccordion({ allowMultiple: false })
  await userEvent.click(screen.getByRole('button', { name: 'Question A' }))
  await userEvent.click(screen.getByRole('button', { name: 'Question B' }))
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute(
    'aria-expanded',
    'true',
  )
})
