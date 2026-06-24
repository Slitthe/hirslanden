/**
 * Recursively flattens a nested object of string leaves into a map keyed by
 * dot-separated paths, e.g. `{ general: { buttons: { ok: 'OK' } } }` becomes
 * `{ 'general.buttons.ok': 'OK' }`.
 */
export function flatten(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {}
  if (obj === null || typeof obj !== 'object') return out
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object') {
      Object.assign(out, flatten(value, path))
    } else {
      out[path] = String(value)
    }
  }
  return out
}
