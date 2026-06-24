import { render, screen } from '@testing-library/react';
import { Text } from './Text';

test('renders body text in a paragraph by default', () => {
  const { container } = render(<Text>Hello</Text>);
  expect(container.querySelector('p')).toHaveTextContent('Hello');
});

test('reflects tone and size via data attributes', () => {
  render(
    <Text tone="muted" size="sm">
      Fine print
    </Text>,
  );
  const el = screen.getByText('Fine print');
  expect(el).toHaveAttribute('data-tone', 'muted');
  expect(el).toHaveAttribute('data-size', 'sm');
});

test('can render as a span', () => {
  const { container } = render(<Text as="span">inline</Text>);
  expect(container.querySelector('span')).toBeInTheDocument();
});
