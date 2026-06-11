import { render, screen } from '@testing-library/react'
import { RiskScale } from './RiskScale'

const segments = ['Low', 'Slightly', 'Elevated', 'Significant']

test('renders the title', () => {
  render(<RiskScale title="Melanoma" value="Low" segments={segments} activeIndex={0} />)
  expect(screen.getByText('Melanoma')).toBeInTheDocument()
})

test('exposes an accessible label combining title and value', () => {
  render(<RiskScale title="Melanoma" value="Low" segments={segments} activeIndex={0} />)
  expect(screen.getByRole('img', { name: 'Melanoma: Low' })).toBeInTheDocument()
})

test('marks exactly the active segment', () => {
  const { container } = render(
    <RiskScale title="BCC / SCC" value="Elevated" segments={segments} activeIndex={2} />,
  )
  expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(1)
})

test('renders every segment label', () => {
  const { container } = render(
    <RiskScale title="Melanoma" value="Low" segments={segments} activeIndex={0} />,
  )
  const labels = container.querySelectorAll('[data-segment-label]')
  expect(labels).toHaveLength(4)
  expect(labels[3]).toHaveTextContent('Significant')
})
