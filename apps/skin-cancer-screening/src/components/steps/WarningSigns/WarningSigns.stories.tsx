import { WarningSigns } from '@root/src/components/steps/WarningSigns';
import { WarningSignsAnswer } from '@root/src/components/steps/WarningSigns/WarningSigns.types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'preact/hooks';

const meta: Meta<typeof WarningSigns> = {
  title: 'Steps/WarningSigns',
  component: WarningSigns,
};

export default meta;

type Story = StoryObj<typeof WarningSigns>;

/** Interactive: the component is controlled, so the story owns the answer state. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<WarningSignsAnswer | undefined>(undefined);
    return <WarningSigns value={value} onChange={(answer) => setValue(answer)} />;
  },
};

/** Returning to the step with a previously chosen answer. */
export const Preselected: Story = {
  args: {
    value: WarningSignsAnswer.No,
  },
};
