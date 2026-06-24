import { flatten } from '@root/src/i18n/flatten'

test('keeps top-level string entries as-is', () => {
  expect(flatten({ ok: 'OK', cancel: 'Cancel' })).toEqual({ ok: 'OK', cancel: 'Cancel' })
})

test('joins nested keys with dots', () => {
  expect(flatten({ general: { buttons: { ok: 'OK' } } })).toEqual({
    'general.buttons.ok': 'OK',
  })
})

test('flattens a mixed-depth tree into dot-paths', () => {
  expect(
    flatten({
      app: { title: 'Title' },
      general: { buttons: { ok: 'OK', startCheck: 'Start' }, hint: 'Hi {{name}}' },
    }),
  ).toEqual({
    'app.title': 'Title',
    'general.buttons.ok': 'OK',
    'general.buttons.startCheck': 'Start',
    'general.hint': 'Hi {{name}}',
  })
})

test('returns an empty map for an empty object', () => {
  expect(flatten({})).toEqual({})
})
