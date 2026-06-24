import { build } from 'esbuild';

const INPUT_MARKER = '__HDS_INPUT_MARKER__';

// Plugin that intercepts all .css imports and returns empty modules,
// so the bundle builds without needing real CSS processing or an outdir.
const emptyCssPlugin = {
  name: 'empty-css',
  setup(build) {
    build.onResolve({ filter: /\.css$/ }, (args) => ({
      path: args.path,
      namespace: 'empty-css',
    }));
    build.onLoad({ filter: /.*/, namespace: 'empty-css' }, () => ({
      contents: '',
      loader: 'js',
    }));
  },
};

// Bundle a consumer that imports ONLY Button from the built barrel, with
// tree-shaking on. If Input were pulled in, its marker would appear.
const result = await build({
  stdin: {
    contents: "export { Button } from './dist/index.js'",
    resolveDir: process.cwd(),
    loader: 'js',
  },
  bundle: true,
  format: 'esm',
  treeShaking: true,
  minify: true,
  write: false,
  plugins: [emptyCssPlugin],
  external: ['react', 'react-dom', 'react/jsx-runtime'],
});

const code = result.outputFiles[0].text;

if (code.includes(INPUT_MARKER)) {
  console.error('❌ Tree-shaking FAILED: Input is present when importing only Button.');
  process.exit(1);
}

console.log('✅ Tree-shaking OK: importing Button does not pull Input.');
