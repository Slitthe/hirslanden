import { readdir, readFile, writeFile } from 'node:fs/promises';

const componentsDir = 'src/components';
const dirents = await readdir(componentsDir, { withFileTypes: true });
const components = dirents
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const exportsField = {
  '.': { source: './src/index.ts', types: './dist/index.d.ts', import: './dist/index.js' },
};

for (const name of components) {
  exportsField[`./${name.toLowerCase()}`] = {
    source: `./src/components/${name}/index.ts`,
    types: `./dist/components/${name}/index.d.ts`,
    import: `./dist/components/${name}/index.js`,
  };
}

exportsField['./styles/tokens.css'] = {
  source: './src/styles/tokens.css',
  default: './dist/styles/tokens.css',
};
exportsField['./package.json'] = './package.json';

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
pkg.exports = exportsField;
await writeFile('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`Wrote exports for ${components.length} component(s): ${components.join(', ')}`);
