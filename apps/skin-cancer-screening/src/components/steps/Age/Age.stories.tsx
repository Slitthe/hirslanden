import { Age } from '@root/src/components/steps/Age';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'preact/hooks';

const meta: Meta<typeof Age> = {
  title: 'Steps/Age',
  component: Age,
};

export default meta;

type Story = StoryObj<typeof Age>;

/** Interactive: the component is controlled, so the story owns the age value. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<number | undefined>(undefined);
    return <Age value={value} onChange={(age) => setValue(age)} onContinue={() => {}} />;
  },
};

/** A valid adult age — Continue is enabled. */
export const Adult: Story = {
  args: {
    value: 30,
  },
};

/** An age under 18 — Continue is replaced by the calm redirect message. */
export const Underage: Story = {
  args: {
    value: 15,
  },
};
