import { BUNDLES, FALLBACK_LOCALE } from '@root/src/i18n/bundles';
import { TranslationContext } from '@root/src/i18n/context';
import type { Translations } from '@root/src/i18n/generated';
import { interpolate } from '@root/src/i18n/interpolate';
import { useContext } from 'preact/hooks';

export type TranslationKey = keyof Translations;

/**
 * Required call arguments for a key: keys with no `{{tokens}}` forbid a second
 * argument; keys with tokens require a typed params object. The `[K] extends [never]`
 * tuple wrapping prevents `never` from distributing in the conditional.
 */
type ParamsArg<K extends TranslationKey> = [keyof Translations[K]] extends [never]
  ? []
  : [params: Translations[K]];

/**
 * Translates a key into the active locale's string, interpolating any `{{tokens}}`.
 *
 * Pass a string-LITERAL key. When `key` is typed as a *union* of literals (e.g. one
 * chosen via a ternary or a variable widened to a key union), TypeScript cannot
 * enforce the required-params guarantee — the params tuple collapses to `[]` across
 * the union — so a missing-params mistake would not be caught for dynamic keys.
 */
export type Translate = <K extends TranslationKey>(key: K, ...args: ParamsArg<K>) => string;

export interface Translator {
  translate: Translate;
}

/**
 * Returns the active-locale translator. Must be called within a
 * {@link TranslationProvider}. Usage: `const { translate } = useTranslation()`.
 *
 * The returned `translate` is a plain function (not a hook), so it may be called
 * conditionally, in loops, or passed around freely.
 */
export function useTranslation(): Translator {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a <TranslationProvider>');
  }
  const { messages } = context;
  const translate: Translate = (key, ...args) => {
    const template = messages[key] ?? BUNDLES[FALLBACK_LOCALE][key] ?? key;
    return interpolate(template, args[0] as Record<string, string | number> | undefined);
  };
  return { translate };
}
