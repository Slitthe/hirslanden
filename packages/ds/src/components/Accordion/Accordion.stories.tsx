import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion } from './Accordion'
import { AccordionItem } from './AccordionItem'

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Faq: Story = {
  render: () => (
    <Accordion>
      <AccordionItem value="diff" title="What is the difference between melanoma and BCC / SCC?">
        Melanoma arises from pigment cells; BCC and SCC are the most common keratinocyte cancers.
      </AccordionItem>
      <AccordionItem value="after" title="What happens after this check?">
        You receive a general risk orientation and a suggested next step.
      </AccordionItem>
      <AccordionItem value="reliable" title="How reliable is this tool?">
        It is a statistical orientation, not a diagnosis.
      </AccordionItem>
    </Accordion>
  ),
}

export const SingleOpen: Story = {
  render: () => (
    <Accordion allowMultiple={false} defaultOpen={['a']}>
      <AccordionItem value="a" title="First">
        Only one panel open at a time.
      </AccordionItem>
      <AccordionItem value="b" title="Second">
        Opening this closes the first.
      </AccordionItem>
    </Accordion>
  ),
}
