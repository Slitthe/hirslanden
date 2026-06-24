import type { Meta, StoryObj } from '@storybook/react-vite';
import { Overline } from './Overline';

const meta: Meta<typeof Overline> = {
  title: 'Components/Overline',
  component: Overline,
  args: { children: 'Your results' },
};

export default meta;
type Story = StoryObj<typeof Overline>;

export const Default: Story = {};
