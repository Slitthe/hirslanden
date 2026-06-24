import { createContext } from 'preact'
import type { Locale } from './bundles'

export interface TranslationContextValue {
  locale: Locale
  /** Flattened message map (dot-path -> string) for the active locale. */
  messages: Record<string, string>
}

export const TranslationContext = createContext<TranslationContextValue | null>(null)
