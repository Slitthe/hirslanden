import { render } from 'preact'
import '@hirslanden/ds/styles/tokens.css'
import './index.css'
import { App } from './app'

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}
