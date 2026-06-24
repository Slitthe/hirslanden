import { render } from 'preact'
import '@hirslanden/ds/styles/tokens.css'
import './index.css'
import { App } from './app'
import { TranslationProvider } from './i18n'

const root = document.getElementById('app')
if (root) {
  render(
    <TranslationProvider locale="de">
      <App />
    </TranslationProvider>,
    root,
  )
}
