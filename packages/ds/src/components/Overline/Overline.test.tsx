import { render, screen } from '@testing-library/react';
import { Overline } from './Overline';

test('renders its children', () => {
  render(<Overline>Warning signs</Overline>);
  expect(screen.getByText('Warning signs')).toBeInTheDocument();
});

test('renders a span by default and respects the `as` prop', () => {
  const { container, rerender } = render(<Overline>x</Overline>);
  expect(container.querySelector('span')).toBeInTheDocument();
  rerender(<Overline as="p">x</Overline>);
  expect(container.querySelector('p')).toBeInTheDocument();
});
