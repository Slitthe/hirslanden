import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ArrowDownIcon } from './ArrowDownIcon';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { ArrowRightIcon } from './ArrowRightIcon';
import { MinusIcon } from './MinusIcon';
import { PlusIcon } from './PlusIcon';

test('renders an svg with a path', () => {
  const { container } = render(<PlusIcon />);
  expect(container.querySelector('svg')).toBeInTheDocument();
  expect(container.querySelector('path')).toBeInTheDocument();
});

test('is decorative by default (aria-hidden)', () => {
  const { container } = render(<PlusIcon />);
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
});

test('exposes an accessible name when a title is provided', () => {
  render(<ArrowLeftIcon title="Back" />);
  expect(screen.getByRole('img', { name: 'Back' })).toBeInTheDocument();
});

test('each icon draws its own distinct path', () => {
  const pathOf = (ui: ReactElement) =>
    render(ui).container.querySelector('path')?.getAttribute('d');
  const paths = [
    pathOf(<PlusIcon />),
    pathOf(<MinusIcon />),
    pathOf(<ArrowLeftIcon />),
    pathOf(<ArrowRightIcon />),
    pathOf(<ArrowDownIcon />),
  ];
  expect(paths.every(Boolean)).toBe(true);
  expect(new Set(paths).size).toBe(paths.length);
});
