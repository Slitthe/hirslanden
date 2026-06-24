import type { ComponentChildren } from 'preact'
import { useMemo } from 'preact/hooks'
import { BUNDLES, type Locale } from './bundles'
import { TranslationContext } from './context'

export interface TranslationProviderProps {
  locale: Locale
  children?: ComponentChildren
}

export function TranslationProvider({ locale, children }: TranslationProviderProps) {
  const value = useMemo(() => ({ locale, messages: BUNDLES[locale] }), [locale])
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
