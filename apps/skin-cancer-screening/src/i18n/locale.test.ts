import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { extractTokens, generateTypesSource } from '@root/scripts/gen-i18n.mjs';
import { flatten } from '@root/src/i18n/flatten';
import de from '@root/src/locale/de.json';
import en from '@root/src/locale/en.json';
import fr from '@root/src/locale/fr.json';

const flats = { de: flatten(de), en: flatten(en), fr: flatten(fr) };
const enKeys = Object.keys(flats.en).sort();

test('every locale defines exactly the same keys', () => {
  expect(Object.keys(flats.de).sort()).toEqual(enKeys);
  expect(Object.keys(flats.fr).sort()).toEqual(enKeys);
});

test('every locale uses the same interpolation tokens for each key', () => {
  for (const key of enKeys) {
    const expected = extractTokens(flats.en[key] ?? '').sort();
    expect(extractTokens(flats.de[key] ?? '').sort(), `de mismatch for "${key}"`).toEqual(expected);
    expect(extractTokens(flats.fr[key] ?? '').sort(), `fr mismatch for "${key}"`).toEqual(expected);
  }
});

test('generated.ts is up to date with en.json', () => {
  // Tests run with the package dir as cwd (turbo / pnpm --filter exec).
  const path = resolve(process.cwd(), 'src/i18n/generated.ts');
  const committed = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const fresh = generateTypesSource(en).replace(/\r\n/g, '\n');
  expect(committed, 'generated.ts is stale — run `pnpm gen:i18n`').toBe(fresh);
});
