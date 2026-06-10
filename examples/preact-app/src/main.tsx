import { Button } from '@hirslanden/ds/button'
import { Input } from '@hirslanden/ds/input'
import '@hirslanden/ds/styles/tokens.css'
import { render } from 'preact'

function App() {
  return (
    <main>
      <h1>Hirslanden DS under preact/compat</h1>
      <Input label="Patient name" placeholder="Jane Doe" />
      <Button variant="primary">Submit</Button>
    </main>
  )
}

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}
