import { render, screen } from '@testing-library/react';
import { StepProgress } from './StepProgress';

test('renders a default label from current/total', () => {
  render(<StepProgress current={1} total={14} />);
  expect(screen.getByText('Step 1 of 14')).toBeInTheDocument();
});

test('exposes progressbar semantics', () => {
  render(<StepProgress current={3} total={14} />);
  const bar = screen.getByRole('progressbar');
  expect(bar).toHaveAttribute('aria-valuenow', '3');
  expect(bar).toHaveAttribute('aria-valuemin', '0');
  expect(bar).toHaveAttribute('aria-valuemax', '14');
});

test('accepts a custom label', () => {
  render(<StepProgress current={2} total={14} label="Halfway there" />);
  expect(screen.getByText('Halfway there')).toBeInTheDocument();
});
