import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowDownIcon } from './ArrowDownIcon';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { ArrowRightIcon } from './ArrowRightIcon';
import { MinusIcon } from './MinusIcon';
import { PlusIcon } from './PlusIcon';

const meta: Meta = {
  title: 'Components/Icon',
};

export default meta;
type Story = StoryObj;

export const Plus: Story = { render: () => <PlusIcon size={24} /> };
export const Minus: Story = { render: () => <MinusIcon size={24} /> };
export const ArrowLeft: Story = { render: () => <ArrowLeftIcon size={24} /> };
export const ArrowRight: Story = { render: () => <ArrowRightIcon size={24} /> };
export const ArrowDown: Story = { render: () => <ArrowDownIcon size={24} /> };

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <PlusIcon size={24} />
      <MinusIcon size={24} />
      <ArrowLeftIcon size={24} />
      <ArrowRightIcon size={24} />
      <ArrowDownIcon size={24} />
    </div>
  ),
};
