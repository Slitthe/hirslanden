import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

test('renders the heading text at level 1', () => {
  render(<Heading level={1}>Before you start</Heading>);
  expect(screen.getByRole('heading', { name: 'Before you start', level: 1 })).toBeInTheDocument();
});

test('renders the requested heading level', () => {
  render(<Heading level={2}>Subtitle</Heading>);
  expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
});

test('applies the muted modifier class when muted is set', () => {
  render(
    <Heading level={1} muted>
      Hero title
    </Heading>,
  );
  expect(screen.getByRole('heading', { level: 1 }).className).toContain('muted');
});

test('omits the muted class by default', () => {
  render(<Heading level={1}>Plain title</Heading>);
  expect(screen.getByRole('heading', { level: 1 }).className).not.toContain('muted');
});
