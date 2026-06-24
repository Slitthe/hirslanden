/**
 * Compile-time assertions for the i18n public API. This file is never executed
 * or bundled — it exists so `tsc --noEmit` (the `typecheck` task) fails if any
 * type-safety guarantee regresses. Every `@ts-expect-error` must mark a real error,
 * otherwise tsc reports the directive as unused and the build fails.
 *
 * Wrapped in a `use`-prefixed function so the `useTranslation` call satisfies the
 * rules of hooks; `translate` itself is a plain function.
 */
import { useTranslation } from '@root/src/i18n/useTranslation'

export function useTranslationTypeAssertions(cond: boolean) {
  const { translate } = useTranslation()

  // Valid: a key with no interpolation, no second argument.
  translate('general.buttons.ok')

  // Valid: a key with interpolation, params provided as string or number.
  translate('general.someInterpolatedValue', { value: 42 })
  translate('general.someInterpolatedValue', { value: '42' })

  // @ts-expect-error — unknown key (requirement 3a).
  translate('general.buttons.nope')

  // @ts-expect-error — interpolation params are required (requirement 3c).
  translate('general.someInterpolatedValue')

  // @ts-expect-error — wrong param name / shape (requirement 3c).
  translate('general.someInterpolatedValue', { wrong: 42 })

  // @ts-expect-error — no params expected for this key, so a second arg is rejected.
  translate('general.buttons.ok', { value: 42 })

  // KNOWN LIMITATION (documented, out of scope of the stated requirements): when the
  // key is a UNION of literals, the required-params guarantee does not hold — the
  // params tuple collapses to [] across the union, so the next line compiles with NO
  // error even though one member needs params (intentionally not asserted as an error
  // directive here). Prefer literal keys at call sites.
  const dynamicKey = cond ? 'general.buttons.ok' : 'general.someInterpolatedValue'
  translate(dynamicKey)
}
