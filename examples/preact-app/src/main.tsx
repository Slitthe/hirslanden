import { Accordion, AccordionItem } from '@hirslanden/ds/accordion'
import { Button } from '@hirslanden/ds/button'
import { Callout } from '@hirslanden/ds/callout'
import { Heading } from '@hirslanden/ds/heading'
import { OptionCard, OptionGroup } from '@hirslanden/ds/optiongroup'
import { Overline } from '@hirslanden/ds/overline'
import { StepProgress } from '@hirslanden/ds/stepprogress'
import { Text } from '@hirslanden/ds/text'
import '@hirslanden/ds/styles/tokens.css'
import { render } from 'preact'

function App() {
  return (
    <main>
      <StepProgress current={1} total={14} />
      <Overline>Warning signs</Overline>
      <Heading level={1}>Do you have a mole that is changing?</Heading>
      <OptionGroup label="Warning signs" defaultValue="no">
        <OptionCard value="yes" title="Yes" description="I have noticed a change." />
        <OptionCard value="no" title="No" description="Nothing new that I have noticed." />
        <OptionCard value="unsure" title="Not sure" />
      </OptionGroup>
      <Callout>Routine skin awareness is sufficient at this stage.</Callout>
      <Accordion>
        <AccordionItem value="x" title="How reliable is this tool?">
          <Text>It is a statistical orientation, not a diagnosis.</Text>
        </AccordionItem>
      </Accordion>
      <Button variant="primary">Continue</Button>
    </main>
  )
}

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}
