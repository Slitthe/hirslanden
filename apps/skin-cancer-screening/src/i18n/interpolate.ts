const TOKEN = /\{\{\s*(\w+)\s*\}\}/g

/**
 * Replaces `{{name}}` placeholders in `template` with the matching value from
 * `params`. Tokens without a matching param are left untouched.
 */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(TOKEN, (match, name: string) =>
    // Own-property check only: `name in params` would match inherited
    // Object.prototype members (toString, constructor, ...) and leak them.
    Object.hasOwn(params, name) ? String(params[name]) : match,
  )
}
