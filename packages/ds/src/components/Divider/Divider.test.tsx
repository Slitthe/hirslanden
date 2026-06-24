import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

test('renders a separator', () => {
  render(<Divider />);
  expect(screen.getByRole('separator')).toBeInTheDocument();
});

test('merges a custom className', () => {
  render(<Divider className="extra" />);
  expect(screen.getByRole('separator')).toHaveClass('extra');
});
