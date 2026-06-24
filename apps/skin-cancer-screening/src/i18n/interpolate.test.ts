import { interpolate } from './interpolate'

test('returns the template unchanged when no params are given', () => {
  expect(interpolate('Hello {{name}}')).toBe('Hello {{name}}')
})

test('replaces a single token', () => {
  expect(interpolate('Hello {{name}}', { name: 'Bob' })).toBe('Hello Bob')
})

test('replaces multiple distinct tokens', () => {
  expect(interpolate('{{greeting}}, {{name}}!', { greeting: 'Hi', name: 'Sam' })).toBe('Hi, Sam!')
})

test('stringifies numeric values', () => {
  expect(interpolate('The value is {{value}}', { value: 42 })).toBe('The value is 42')
})

test('tolerates whitespace inside the braces', () => {
  expect(interpolate('Hi {{ name }}', { name: 'Bob' })).toBe('Hi Bob')
})

test('leaves tokens without a matching param intact', () => {
  expect(interpolate('{{a}} and {{b}}', { a: 'x' })).toBe('x and {{b}}')
})

test('does not substitute inherited Object.prototype members', () => {
  expect(interpolate('a {{toString}} b', { a: 'x' })).toBe('a {{toString}} b')
  expect(interpolate('{{constructor}}', {})).toBe('{{constructor}}')
})
