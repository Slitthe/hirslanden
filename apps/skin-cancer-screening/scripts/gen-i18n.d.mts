/** Type surface for the i18n codegen, consumed by the test suite. */
export function extractTokens(value: string): string[]
export function flattenKeys(obj: Record<string, unknown>, prefix?: string): string[]
export function generateTypesSource(locale: Record<string, unknown>): string
