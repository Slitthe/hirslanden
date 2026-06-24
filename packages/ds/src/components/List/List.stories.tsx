import type { Meta, StoryObj } from '@storybook/react-vite';
import { List } from './List';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
};

export default meta;
type Story = StoryObj<typeof List>;

export const Default: Story = {
  render: () => (
    <List>
      <li>Limited mole count</li>
      <li>No atypical moles reported</li>
      <li>No family history of melanoma</li>
    </List>
  ),
};
