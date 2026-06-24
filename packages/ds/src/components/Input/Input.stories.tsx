import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: { label: 'Email', placeholder: 'you@example.com' },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'patient@hirslanden.ch' } }
