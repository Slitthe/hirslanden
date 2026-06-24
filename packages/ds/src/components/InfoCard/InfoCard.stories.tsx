import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoCard } from './InfoCard';

const meta: Meta<typeof InfoCard> = {
  title: 'Components/InfoCard',
  component: InfoCard,
  args: {
    label: 'Private',
    children: 'Runs entirely in your browser. No answers stored or transmitted.',
  },
};

export default meta;
type Story = StoryObj<typeof InfoCard>;

export const Default: Story = {};
