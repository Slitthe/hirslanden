import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRightIcon } from '../Icon/index.js';
import { TextLink } from '../TextLink/TextLink';
import { Callout } from './Callout';

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  args: { children: 'Both tracks are in the low range. Routine skin awareness is sufficient.' },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Accent: Story = { args: { variant: 'accent' } };
export const Subtle: Story = { args: { variant: 'subtle' } };
export const WithAction: Story = {
  args: {
    variant: 'subtle',
    children: 'Want to check your moles? Use the ABCDE guide further down this page.',
    action: (
      <TextLink href="#abcde" trailingIcon={<ArrowRightIcon />}>
        ABCDE guide
      </TextLink>
    ),
  },
};
