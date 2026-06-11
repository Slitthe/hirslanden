import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'plus', size: 24 },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Plus: Story = { args: { name: 'plus' } }
export const Minus: Story = { args: { name: 'minus' } }
export const ArrowLeft: Story = { args: { name: 'arrow-left' } }
export const ArrowRight: Story = { args: { name: 'arrow-right' } }
export const ArrowDown: Story = { args: { name: 'arrow-down' } }
