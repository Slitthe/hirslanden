import { render, screen } from '@testing-library/react';
import { List } from './List';

test('renders a list with its items', () => {
  render(
    <List>
      <li>Limited mole count</li>
      <li>No atypical moles reported</li>
    </List>,
  );
  expect(screen.getByRole('list')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});
