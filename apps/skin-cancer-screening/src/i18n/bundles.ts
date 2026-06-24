import de from '../locale/de.json'
import en from '../locale/en.json'
import fr from '../locale/fr.json'
import { flatten } from './flatten'

/** Flattened message maps for every supported locale, keyed by dot-path. */
export const BUNDLES = {
  de: flatten(de),
  en: flatten(en),
  fr: flatten(fr),
} satisfies Record<string, Record<string, string>>

export type Locale = keyof typeof BUNDLES

/** Locale used as the runtime safety net when a key is missing elsewhere. */
export const FALLBACK_LOCALE: Locale = 'en'
