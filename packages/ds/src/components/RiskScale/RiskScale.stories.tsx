import type { Meta, StoryObj } from '@storybook/react-vite'
import { RiskScale } from './RiskScale'

const meta: Meta<typeof RiskScale> = {
  title: 'Components/RiskScale',
  component: RiskScale,
  args: {
    title: 'Melanoma',
    value: 'Low',
    segments: ['Low', 'Slightly', 'Elevated', 'Significant'],
    activeIndex: 0,
  },
}

export default meta
type Story = StoryObj<typeof RiskScale>

export const Low: Story = {}
export const Elevated: Story = { args: { title: 'BCC / SCC', value: 'Elevated', activeIndex: 2 } }
