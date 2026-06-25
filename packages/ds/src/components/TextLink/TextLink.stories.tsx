import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeftIcon } from '../Icon/index.js';
import { TextLink } from './TextLink';

const meta: Meta<typeof TextLink> = {
  title: 'Components/TextLink',
  component: TextLink,
  args: { children: 'Back' },
};

export default meta;
type Story = StoryObj<typeof TextLink>;

export const BackAction: Story = {
  args: { leadingIcon: <ArrowLeftIcon />, children: 'Back' },
};
export const StartOver: Story = { args: { children: 'Start over' } };
export const AsLink: Story = { args: { href: '#', children: 'Learn more' } };
