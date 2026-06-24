import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextLink } from './TextLink';

test('renders a button when no href is given', () => {
  render(<TextLink>Back</TextLink>);
  expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
});

test('renders an anchor when href is given', () => {
  render(<TextLink href="/help">Help</TextLink>);
  expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help');
});

test('calls onClick when activated as a button', async () => {
  const onClick = vi.fn();
  render(<TextLink onClick={onClick}>Back</TextLink>);
  await userEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('renders a leading icon alongside the label', () => {
  render(<TextLink leadingIcon={<span data-testid="ic" />}>Back</TextLink>);
  expect(screen.getByTestId('ic')).toBeInTheDocument();
});
