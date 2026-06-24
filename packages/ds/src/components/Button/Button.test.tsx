import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

test('renders children inside a button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
});

test('reflects the variant via data-variant', () => {
  render(<Button variant="secondary">Cancel</Button>);
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute(
    'data-variant',
    'secondary',
  );
});

test('reflects the size via data-size', () => {
  render(<Button size="lg">Big</Button>);
  expect(screen.getByRole('button', { name: 'Big' })).toHaveAttribute('data-size', 'lg');
});

test('defaults size to "md"', () => {
  render(<Button>Default</Button>);
  expect(screen.getByRole('button', { name: 'Default' })).toHaveAttribute('data-size', 'md');
});

test('calls onClick when clicked', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Go</Button>);
  await userEvent.click(screen.getByRole('button', { name: 'Go' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('forwards ref to the underlying button element', () => {
  const ref = { current: null as HTMLButtonElement | null };
  render(<Button ref={ref}>x</Button>);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});

test('defaults type to "button"', () => {
  render(<Button>Save</Button>);
  expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
});
