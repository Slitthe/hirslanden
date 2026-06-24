import type { Locale } from '@root/src/i18n/bundles'
import { TranslationProvider } from '@root/src/i18n/TranslationProvider'
import { type TranslationKey, useTranslation } from '@root/src/i18n/useTranslation'
import { render, screen } from '@testing-library/preact'
import type { ComponentChild } from 'preact'

function StartButtonLabel() {
  const { translate } = useTranslation()
  return <span>{translate('general.buttons.startCheck')}</span>
}

function InterpolatedValue() {
  const { translate } = useTranslation()
  return <span>{translate('general.someInterpolatedValue', { value: 42 })}</span>
}

function renderAt(locale: Locale, node: ComponentChild) {
  return render(<TranslationProvider locale={locale}>{node}</TranslationProvider>)
}

test('translates a key for the active locale', () => {
  renderAt('de', <StartButtonLabel />)
  expect(screen.getByText('Hautkrebs-Check starten')).toBeInTheDocument()
})

test('translates the same key differently for another locale', () => {
  renderAt('fr', <StartButtonLabel />)
  expect(screen.getByText('Démarrer le dépistage')).toBeInTheDocument()
})

test('interpolates params into the translated string', () => {
  renderAt('de', <InterpolatedValue />)
  expect(screen.getByText('Der Wert ist 42')).toBeInTheDocument()
})

test('updates the output when the locale prop changes', () => {
  const { rerender } = render(
    <TranslationProvider locale="de">
      <StartButtonLabel />
    </TranslationProvider>,
  )
  expect(screen.getByText('Hautkrebs-Check starten')).toBeInTheDocument()

  rerender(
    <TranslationProvider locale="en">
      <StartButtonLabel />
    </TranslationProvider>,
  )
  expect(screen.getByText('Start skin cancer check')).toBeInTheDocument()
})

test('exposes a translate function that handles multiple keys per component', () => {
  function TwoLabels() {
    const { translate } = useTranslation()
    return (
      <>
        <span>{translate('app.title')}</span>
        <span>{translate('general.buttons.ok')}</span>
      </>
    )
  }
  renderAt('en', <TwoLabels />)
  expect(screen.getByText('Skin Cancer Screening')).toBeInTheDocument()
  expect(screen.getByText('OK')).toBeInTheDocument()
})

test('falls back to the raw key when it is absent from the data', () => {
  function Missing() {
    const { translate } = useTranslation()
    // Cast past the type system to exercise the defensive runtime fallback.
    return <span>{translate('totally.missing.key' as TranslationKey)}</span>
  }
  renderAt('de', <Missing />)
  expect(screen.getByText('totally.missing.key')).toBeInTheDocument()
})

test('throws a clear error when used outside a provider', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  function Bare() {
    const { translate } = useTranslation()
    return <span>{translate('general.buttons.ok')}</span>
  }
  expect(() => render(<Bare />)).toThrow(/within a <TranslationProvider>/)
  spy.mockRestore()
})
