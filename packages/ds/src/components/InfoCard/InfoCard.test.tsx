import { render, screen } from '@testing-library/react';
import { InfoCard } from './InfoCard';

test('renders the label and body', () => {
  render(<InfoCard label="Private">Runs entirely in your browser.</InfoCard>);
  expect(screen.getByText('Private')).toBeInTheDocument();
  expect(screen.getByText('Runs entirely in your browser.')).toBeInTheDocument();
});

test('uses a dashed card surface', () => {
  const { container } = render(<InfoCard label="L">body</InfoCard>);
  expect(container.querySelector('[data-variant="dashed"]')).toBeInTheDocument();
});
