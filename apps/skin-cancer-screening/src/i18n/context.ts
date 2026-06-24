import type { Locale } from '@root/src/i18n/bundles';
import { createContext } from 'preact';

export interface TranslationContextValue {
  locale: Locale;
  /** Flattened message map (dot-path -> string) for the active locale. */
  messages: Record<string, string>;
}

export const TranslationContext = createContext<TranslationContextValue | null>(null);
