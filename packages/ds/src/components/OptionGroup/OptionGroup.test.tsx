import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptionCard } from './OptionCard'
import { OptionGroup } from './OptionGroup'

function renderGroup(props: Record<string, unknown> = {}) {
  return render(
    <OptionGroup label="Answer" {...props}>
      <OptionCard value="yes" title="Yes" description="I have noticed a change." />
      <OptionCard value="no" title="No" description="Nothing new that I have noticed." />
      <OptionCard value="unsure" title="Not sure" />
    </OptionGroup>,
  )
}

test('renders a radiogroup with radio options', () => {
  renderGroup()
  expect(screen.getByRole('radiogroup', { name: 'Answer' })).toBeInTheDocument()
  expect(screen.getAllByRole('radio')).toHaveLength(3)
})

test('selecting an option marks it checked (uncontrolled)', async () => {
  renderGroup()
  await userEvent.click(screen.getByRole('radio', { name: /Yes/ }))
  expect(screen.getByRole('radio', { name: /Yes/ })).toHaveAttribute('aria-checked', 'true')
})

test('arrow keys move selection through the group', async () => {
  renderGroup()
  const yes = screen.getByRole('radio', { name: /Yes/ })
  yes.focus()
  await userEvent.click(yes)
  await userEvent.keyboard('{ArrowDown}')
  expect(screen.getByRole('radio', { name: /Nothing new/ })).toHaveAttribute('aria-checked', 'true')
})

test('calls onChange in controlled mode', async () => {
  const onChange = vi.fn()
  render(
    <OptionGroup label="A" value="yes" onChange={onChange}>
      <OptionCard value="yes" title="Yes" />
      <OptionCard value="no" title="No" />
    </OptionGroup>,
  )
  await userEvent.click(screen.getByRole('radio', { name: 'No' }))
  expect(onChange).toHaveBeenCalledWith('no')
})

test('standalone OptionCard reflects selected via aria-pressed', () => {
  render(<OptionCard value="x" title="Solo" selected />)
  expect(screen.getByRole('button', { name: 'Solo' })).toHaveAttribute('aria-pressed', 'true')
})
