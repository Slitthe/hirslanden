import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  args: { children: 'This check gives you a general orientation about your risk.' },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Body: Story = {};
export const Muted: Story = { args: { tone: 'muted' } };
export const Disclaimer: Story = {
  args: {
    size: 'sm',
    tone: 'muted',
    children: 'This tool does not replace a medical diagnosis or physical examination.',
  },
};
