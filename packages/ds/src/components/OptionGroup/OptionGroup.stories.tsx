import type { Meta, StoryObj } from '@storybook/react-vite'
import { OptionCard } from './OptionCard'
import { OptionGroup } from './OptionGroup'

const meta: Meta<typeof OptionGroup> = {
  title: 'Components/OptionGroup',
  component: OptionGroup,
  args: { label: 'Do you have a mole that is changing?' },
}

export default meta
type Story = StoryObj<typeof OptionGroup>

export const WithDescriptions: Story = {
  render: (args) => (
    <OptionGroup {...args} defaultValue="yes">
      <OptionCard value="yes" title="Yes" description="I have noticed a change or unusual spot." />
      <OptionCard
        value="no"
        title="No"
        description="Nothing new or changing that I have noticed."
      />
      <OptionCard
        value="unsure"
        title="Not sure"
        description="I may have noticed something but I am not certain."
      />
    </OptionGroup>
  ),
}

export const TitleOnly: Story = {
  render: (args) => (
    <OptionGroup {...args} label="What is your biological sex?">
      <OptionCard value="male" title="Male" />
      <OptionCard value="female" title="Female" />
    </OptionGroup>
  ),
}

export const WithMedia: Story = {
  render: (args) => (
    <OptionGroup {...args} label="How many moles do you have?">
      <OptionCard
        value="few"
        title="Very few"
        description="0 – 10 moles"
        media={<span aria-hidden>🔬</span>}
      />
      <OptionCard
        value="some"
        title="Some"
        description="11 – 25 moles"
        media={<span aria-hidden>🔬</span>}
      />
      <OptionCard
        value="many"
        title="Many"
        description="26 – 50 moles"
        media={<span aria-hidden>🔬</span>}
      />
    </OptionGroup>
  ),
}
