import { BUNDLES, type Locale } from '@root/src/i18n/bundles'
import { TranslationContext } from '@root/src/i18n/context'
import type { ComponentChildren } from 'preact'
import { useMemo } from 'preact/hooks'

export interface TranslationProviderProps {
  locale: Locale
  children?: ComponentChildren
}

export function TranslationProvider({ locale, children }: TranslationProviderProps) {
  const value = useMemo(() => ({ locale, messages: BUNDLES[locale] }), [locale])
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
