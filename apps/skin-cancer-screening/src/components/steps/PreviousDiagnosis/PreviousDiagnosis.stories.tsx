import { PreviousDiagnosis } from '@root/src/components/steps/PreviousDiagnosis';
import { PreviousDiagnosisAnswer } from '@root/src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'preact/hooks';

const meta: Meta<typeof PreviousDiagnosis> = {
  title: 'Steps/PreviousDiagnosis',
  component: PreviousDiagnosis,
};

export default meta;

type Story = StoryObj<typeof PreviousDiagnosis>;

/** Interactive: the component is controlled, so the story owns the answer state. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<PreviousDiagnosisAnswer | undefined>(undefined);
    return <PreviousDiagnosis value={value} onChange={(answer) => setValue(answer)} />;
  },
};

/** Returning to the step with a previously chosen answer. */
export const Preselected: Story = {
  args: {
    value: PreviousDiagnosisAnswer.No,
  },
};
