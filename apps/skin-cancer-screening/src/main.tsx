import { render } from 'preact'
import '@hirslanden/ds/styles/tokens.css'
import '@root/src/index.css'
import { App } from '@root/src/app'
import { TranslationProvider } from '@root/src/i18n'

const root = document.getElementById('app')
if (root) {
  render(
    <TranslationProvider locale="de">
      <App />
    </TranslationProvider>,
    root,
  )
}
