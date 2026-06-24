import type { Meta, StoryObj } from '@storybook/react-vite'
import { StepProgress } from './StepProgress'

const meta: Meta<typeof StepProgress> = {
  title: 'Components/StepProgress',
  component: StepProgress,
  args: { current: 3, total: 14 },
}

export default meta
type Story = StoryObj<typeof StepProgress>

export const Start: Story = { args: { current: 1, total: 14 } }
export const Middle: Story = { args: { current: 8, total: 14 } }
export const CustomLabel: Story = { args: { current: 14, total: 14, label: 'Final step' } }
