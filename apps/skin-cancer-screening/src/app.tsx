import { Button } from '@hirslanden/ds/button'
import { useTranslation } from './i18n'

export function App() {
  const { translate } = useTranslation()
  return (
    <main>
      <h1>{translate('app.title')}</h1>
      <Button variant="primary">{translate('general.buttons.startCheck')}</Button>
    </main>
  )
}
