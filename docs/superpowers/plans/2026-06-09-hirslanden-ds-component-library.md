# Hirslanden DS Component Library — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a lightweight, tree-shakeable TypeScript React component library (starting with `Button` + `Input`) that runs under `preact/compat` in client-only Preact SPAs.

**Architecture:** Components are authored in plain React (18 API surface), each in a self-contained folder with co-located CSS Modules. Vite library mode builds one ESM chunk per component with per-component CSS (via `vite-plugin-lib-inject-css`), exposed through per-component subpath exports so importing `Button` pulls neither `Input`'s JS nor CSS. React is a peer dependency and never bundled; the consuming Preact app aliases `react → preact/compat`. Correctness under both React and `preact/compat` is verified by a dual-project Vitest setup plus a production-build Preact smoke app.

**Tech Stack:** Vite 7 (library mode) · TypeScript 6 · CSS Modules · `vite-plugin-lib-inject-css` · `vite-plugin-dts` · Vitest 4 + Testing Library 16 · Storybook 10 (`@storybook/react-vite`) · Biome + Lefthook · `preact` 10.x (compat target) · `@floating-ui/react` (deferred to first positioned widget).

**Reference spec:** `docs/superpowers/specs/2026-06-09-hirslanden-ds-component-library-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` | Package metadata, scripts, deps, `exports` map, `sideEffects`, peerDeps |
| `tsconfig.json` | Authoring/typecheck config (`noEmit`) |
| `tsconfig.build.json` | Declaration-emit scope for `vite-plugin-dts` |
| `biome.json` | Format + lint + import-organize config |
| `lefthook.yml` | Pre-commit hook running Biome on staged files |
| `.gitignore` | Ignore `node_modules`, `dist`, Storybook output, etc. |
| `vite.config.ts` | Library build: per-component entries, externals, preserveModules, CSS split, dts |
| `vitest.config.ts` | Two test projects: `react` + `compat` (preact/compat alias) |
| `tests/setup.ts` | Testing Library + jest-dom setup, auto-cleanup |
| `src/index.ts` | Pure re-export barrel (no CSS, no side effects) |
| `src/styles/tokens.css` | `:root` design tokens (single theme) |
| `src/components/Button/*` | Button component, CSS, story, test, folder barrel |
| `src/components/Input/*` | Input component, CSS, story, test, folder barrel |
| `scripts/copy-tokens.mjs` | Copy `tokens.css` into `dist/styles/` after build |
| `scripts/generate-exports.mjs` | Regenerate the `exports` map from components on disk |
| `scripts/verify-treeshake.mjs` | Assert importing `Button` tree-shakes `Input` out |
| `.storybook/{main,preview}.ts` | Storybook config (React renderer, tokens import) |
| `examples/preact-app/*` | Production Preact + `preact/compat` smoke app |
| `README.md` | Consumer docs (aliasing, imports, tokens) |
| `CONTRIBUTING.md` | Preact-safe authoring rules |

---

## Task 1: Scaffold package + TypeScript config + build toolchain

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.build.json`
- Create: `.gitignore`
- Create: `src/index.ts`

- [ ] **Step 1: Create `.gitignore`**

```gitignore
node_modules
dist
storybook-static
*.log
.DS_Store
coverage
examples/*/dist
examples/*/node_modules
```

- [ ] **Step 2: Create `package.json` (skeleton — deps filled by install in Step 5)**

```json
{
  "name": "@hirslanden/ds",
  "version": "0.0.0",
  "description": "Hirslanden design system component library",
  "license": "UNLICENSED",
  "private": true,
  "type": "module",
  "sideEffects": [
    "**/*.css"
  ],
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./styles/tokens.css": "./dist/styles/tokens.css",
    "./package.json": "./package.json"
  },
  "scripts": {
    "build": "vite build --mode lib && node scripts/copy-tokens.mjs",
    "gen:exports": "node scripts/generate-exports.mjs",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check .",
    "format": "biome format --write .",
    "verify:pkg": "publint && attw --pack",
    "verify:treeshake": "node scripts/verify-treeshake.mjs",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "verbatimModuleSyntax": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"]
  },
  "include": ["src", "tests", "scripts", "vite.config.ts", "vitest.config.ts", ".storybook"]
}
```

- [ ] **Step 4: Create `tsconfig.build.json` (declaration-emit scope for dts)**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["src/**/*.test.tsx", "src/**/*.stories.tsx"]
}
```

- [ ] **Step 5: Install the build/runtime toolchain**

Run:
```bash
npm install -D vite@^7 @vitejs/plugin-react vite-plugin-dts vite-plugin-lib-inject-css \
  typescript@^6 react react-dom @types/react @types/react-dom @types/node
```
Expected: dependencies install; `package.json` gains a `devDependencies` block. `react`/`react-dom` are dev-only here (for building/testing/Storybook); they stay declared as `peerDependencies` for consumers.

- [ ] **Step 6: Create the (initially empty) barrel `src/index.ts`**

```ts
// Public API barrel — pure re-exports only. No CSS, no side effects.
export {}
```

- [ ] **Step 7: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0 with no output (nothing to type-check yet).

- [ ] **Step 8: Commit**

```bash
git add .gitignore package.json package-lock.json tsconfig.json tsconfig.build.json src/index.ts
git commit -m "chore: scaffold package, tsconfig, and build toolchain"
```

---

## Task 2: Biome + Lefthook pre-commit hook

**Files:**
- Create: `biome.json`
- Create: `lefthook.yml`

- [ ] **Step 1: Install Biome and Lefthook**

Run: `npm install -D @biomejs/biome lefthook`
Expected: both packages added to `devDependencies`.

- [ ] **Step 2: Create `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": { "ignoreUnknown": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "useExhaustiveDependencies": "warn" }
    }
  },
  "assist": { "actions": { "source": { "organizeImports": "on" } } },
  "javascript": { "formatter": { "quoteStyle": "single", "semicolons": "asNeeded" } }
}
```

- [ ] **Step 3: Create `lefthook.yml`**

```yaml
pre-commit:
  parallel: true
  commands:
    biome:
      glob: "*.{ts,tsx,js,jsx,mjs,json,css}"
      run: npx biome check --write --no-errors-on-unmatched {staged_files}
      stage_fixed: true
```

- [ ] **Step 4: Install the git hooks**

Run: `npx lefthook install`
Expected: `lefthook: hooks installed: pre-commit` (a `.git/hooks/pre-commit` is created).

- [ ] **Step 5: Verify Biome runs clean on the repo**

Run: `npm run lint`
Expected: `Checked N files ... No fixes needed.` (exit 0). If it reports formatting diffs, run `npx biome check --write .` once and re-run.

- [ ] **Step 6: Commit (exercises the hook)**

```bash
git add biome.json lefthook.yml package.json package-lock.json
git commit -m "chore: add Biome and Lefthook pre-commit formatting"
```
Expected: the `biome` pre-commit command runs before the commit completes.

---

## Task 3: Dual-project Vitest harness (React + preact/compat)

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

- [ ] **Step 1: Install the test toolchain**

Run:
```bash
npm install -D vitest@^4 jsdom @testing-library/react@^16 @testing-library/jest-dom \
  @testing-library/user-event preact@^10
```
Expected: packages added. `preact@^10` (NOT 11 beta) is the compat target.

- [ ] **Step 2: Create `tests/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 3: Create `vitest.config.ts` (two projects, same test files)**

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const shared = {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  include: ['src/**/*.test.tsx'],
} as const

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: { name: 'react', ...shared },
      },
      {
        plugins: [react()],
        resolve: {
          alias: {
            react: 'preact/compat',
            'react-dom': 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
            'react/jsx-runtime': 'preact/jsx-runtime',
            'react/jsx-dev-runtime': 'preact/jsx-runtime',
          },
        },
        test: {
          name: 'compat',
          ...shared,
          // The react->preact/compat alias is fragile without forcing these
          // deps to be pre-bundled as ESM (otherwise: "Cannot read properties
          // of undefined (reading '__H')"). See spec §11.
          deps: {
            optimizer: {
              web: {
                include: ['@testing-library/react', '@testing-library/user-event'],
              },
            },
          },
        },
      },
    ],
  },
})
```

- [ ] **Step 4: Enable Vitest global types in `tsconfig.json`**

Now that Vitest is installed, add its globals so `test`/`expect`/`vi` are typed in test files. Change the `types` line in `tsconfig.json`:
```json
    "types": ["node", "vitest/globals"]
```

- [ ] **Step 5: Verify Vitest starts both projects (no tests yet)**

Run: `npx vitest run --passWithNoTests`
Expected: Vitest reports `No test files found` for projects `react` and `compat` and exits 0 (the `--passWithNoTests` flag is needed only here — once tests exist, plain `npm test` is used). Confirms both projects are configured and the configs parse.

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/setup.ts tsconfig.json package.json package-lock.json
git commit -m "test: add dual-project Vitest harness (react + preact/compat)"
```

---

## Task 4: Design tokens stylesheet

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Create `src/styles/tokens.css`**

```css
:root {
  /* color */
  --hds-color-primary: #0b6bcb;
  --hds-color-on-primary: #ffffff;
  --hds-color-border: #c7ccd1;
  --hds-color-text: #1a1d20;
  --hds-color-bg: #ffffff;

  /* radius */
  --hds-radius-md: 6px;

  /* spacing */
  --hds-space-1: 0.25rem;
  --hds-space-2: 0.5rem;
  --hds-space-3: 0.75rem;

  /* typography */
  --hds-font-size-md: 1rem;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat: add design tokens stylesheet"
```

---

## Task 5: Button component (TDD)

**Files:**
- Test: `src/components/Button/Button.test.tsx`
- Create: `src/components/Button/Button.tsx`
- Create: `src/components/Button/Button.module.css`
- Create: `src/components/Button/index.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test**

`src/components/Button/Button.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

test('renders children inside a button', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
})

test('reflects the variant via data-variant', () => {
  render(<Button variant="secondary">Cancel</Button>)
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-variant', 'secondary')
})

test('calls onClick when clicked', async () => {
  const onClick = vi.fn()
  render(<Button onClick={onClick}>Go</Button>)
  await userEvent.click(screen.getByRole('button', { name: 'Go' }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

test('forwards ref to the underlying button element', () => {
  const ref = { current: null as HTMLButtonElement | null }
  render(<Button ref={ref}>x</Button>)
  expect(ref.current).toBeInstanceOf(HTMLButtonElement)
})

test('defaults type to "button"', () => {
  render(<Button>Save</Button>)
  expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/Button/Button.test.tsx`
Expected: FAIL in both `react` and `compat` projects — `Failed to resolve import "./Button"` / `Button is not defined`.

- [ ] **Step 3: Create `src/components/Button/Button.module.css`**

```css
.button {
  font: inherit;
  font-size: var(--hds-font-size-md, 1rem);
  cursor: pointer;
  border-radius: var(--hds-radius-md, 6px);
  padding: var(--hds-space-2, 0.5rem) var(--hds-space-3, 0.75rem);
  border: 1px solid transparent;
  line-height: 1.2;
}

.primary {
  background: var(--hds-color-primary, #0b6bcb);
  color: var(--hds-color-on-primary, #ffffff);
}

.secondary {
  background: transparent;
  color: var(--hds-color-primary, #0b6bcb);
  border-color: var(--hds-color-primary, #0b6bcb);
}
```

- [ ] **Step 4: Create `src/components/Button/Button.tsx`**

```tsx
import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Defaults to `primary`. */
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, type = 'button', ...rest },
  ref,
) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return <button ref={ref} type={type} data-variant={variant} className={classes} {...rest} />
})
```

- [ ] **Step 5: Create `src/components/Button/index.ts`**

```ts
export { Button } from './Button'
export type { ButtonProps, ButtonVariant } from './Button'
```

- [ ] **Step 6: Update the barrel `src/index.ts`**

```ts
// Public API barrel — pure re-exports only. No CSS, no side effects.
export { Button } from './components/Button'
export type { ButtonProps, ButtonVariant } from './components/Button'
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/components/Button/Button.test.tsx`
Expected: PASS — all 5 tests pass in BOTH the `react` and `compat` projects (10 passed total).

- [ ] **Step 8: Add the CSS-module type shim (so TS resolves `*.module.css` imports)**

Create `src/css-modules.d.ts`:
```ts
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
```

- [ ] **Step 9: Verify typecheck passes**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 10: Commit**

```bash
git add src/components/Button src/index.ts src/css-modules.d.ts
git commit -m "feat: add Button component"
```

---

## Task 6: Vite library build + tokens copy + exports generator

**Files:**
- Create: `vite.config.ts`
- Create: `scripts/copy-tokens.mjs`
- Create: `scripts/generate-exports.mjs`
- Modify: `package.json` (`exports` regenerated)

- [ ] **Step 1: Create `vite.config.ts`**

```ts
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

const root = import.meta.dirname
const componentsDir = resolve(root, 'src/components')

// One entry per component folder + the root barrel.
const componentEntries = Object.fromEntries(
  readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => [`components/${d.name}/index`, resolve(componentsDir, d.name, 'index.ts')]),
)

const entries = {
  index: resolve(root, 'src/index.ts'),
  ...componentEntries,
}

// This file is also read by Storybook (which registers its OWN React plugin and
// its own build). Only contribute the library build when invoked as
// `vite build --mode lib`; otherwise return an empty config so Storybook is
// unaffected and the React plugin is not registered twice.
export default defineConfig(({ mode }) => {
  if (mode !== 'lib') {
    return {}
  }

  return {
    plugins: [
      react(),
      libInjectCss(),
      dts({
        tsconfigPath: './tsconfig.build.json',
        entryRoot: 'src',
        include: ['src'],
        exclude: ['src/**/*.test.tsx', 'src/**/*.stories.tsx'],
      }),
    ],
    build: {
      copyPublicDir: false,
      cssCodeSplit: true, // REQUIRED: lib mode defaults this to false, which merges all CSS.
      lib: {
        entry: entries,
        formats: ['es'],
      },
      rollupOptions: {
        external: [/^react($|\/)/, /^react-dom($|\/)/, /^@floating-ui\//],
        output: {
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
  }
})
```

- [ ] **Step 2: Create `scripts/copy-tokens.mjs`**

```js
import { copyFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const src = 'src/styles/tokens.css'
const dest = 'dist/styles/tokens.css'

await mkdir(dirname(dest), { recursive: true })
await copyFile(src, dest)
console.log(`Copied ${src} -> ${dest}`)
```

- [ ] **Step 3: Create `scripts/generate-exports.mjs`**

```js
import { readdir, readFile, writeFile } from 'node:fs/promises'

const componentsDir = 'src/components'
const dirents = await readdir(componentsDir, { withFileTypes: true })
const components = dirents
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

const exportsField = {
  '.': { types: './dist/index.d.ts', import: './dist/index.js' },
}

for (const name of components) {
  exportsField[`./${name.toLowerCase()}`] = {
    types: `./dist/components/${name}/index.d.ts`,
    import: `./dist/components/${name}/index.js`,
  }
}

exportsField['./styles/tokens.css'] = './dist/styles/tokens.css'
exportsField['./package.json'] = './package.json'

const pkg = JSON.parse(await readFile('package.json', 'utf8'))
pkg.exports = exportsField
await writeFile('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
console.log(`Wrote exports for ${components.length} component(s): ${components.join(', ')}`)
```

- [ ] **Step 4: Generate the exports map**

Run: `npm run gen:exports`
Expected: `Wrote exports for 1 component(s): Button`. `package.json` now has a `./button` subpath export.

- [ ] **Step 5: Build the library**

Run: `npm run build`
Expected: Vite builds successfully, then `Copied src/styles/tokens.css -> dist/styles/tokens.css`.

- [ ] **Step 6: Verify the dist structure**

Run: `find dist -type f | sort`
Expected output includes (hashes on CSS asset may vary):
```
dist/components/Button/Button.js
dist/components/Button/index.d.ts
dist/components/Button/index.js
dist/index.d.ts
dist/index.js
dist/styles/tokens.css
```
plus a Button CSS asset (e.g. `dist/assets/Button.module-<hash>.css`) imported from `dist/components/Button/Button.js`. Confirm `dist/components/Button/Button.js` contains an `import` of its own `.css` (proves `lib-inject-css` co-located the style):
Run: `grep -r "\.css" dist/components/Button/Button.js`
Expected: a line importing the Button CSS asset.

- [ ] **Step 7: Commit**

```bash
git add vite.config.ts scripts/copy-tokens.mjs scripts/generate-exports.mjs package.json
git commit -m "build: add Vite library config, tokens copy, and exports generator"
```

---

## Task 7: Input component (TDD — exercises `useId`)

**Files:**
- Test: `src/components/Input/Input.test.tsx`
- Create: `src/components/Input/Input.tsx`
- Create: `src/components/Input/Input.module.css`
- Create: `src/components/Input/index.ts`
- Modify: `src/index.ts`
- Modify: `package.json` (regenerate exports)

- [ ] **Step 1: Write the failing test**

`src/components/Input/Input.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

test('associates the label with the input via a generated id', () => {
  render(<Input label="Email" />)
  const input = screen.getByLabelText('Email')
  expect(input).toBeInstanceOf(HTMLInputElement)
  expect(input.id).toBeTruthy()
})

test('uses an explicit id when provided', () => {
  render(<Input label="Name" id="custom-id" />)
  expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'custom-id')
})

test('forwards typing to onChange', async () => {
  const onChange = vi.fn()
  render(<Input label="City" onChange={onChange} />)
  await userEvent.type(screen.getByLabelText('City'), 'Zug')
  expect(onChange).toHaveBeenCalled()
})

test('forwards ref to the input element', () => {
  const ref = { current: null as HTMLInputElement | null }
  render(<Input label="Ref" ref={ref} />)
  expect(ref.current).toBeInstanceOf(HTMLInputElement)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/Input/Input.test.tsx`
Expected: FAIL in both projects — `Failed to resolve import "./Input"`.

- [ ] **Step 3: Create `src/components/Input/Input.module.css`**

```css
.wrapper {
  display: inline-flex;
  flex-direction: column;
  gap: var(--hds-space-1, 0.25rem);
}

.label {
  font: inherit;
  color: var(--hds-color-text, #1a1d20);
}

.input {
  font: inherit;
  font-size: var(--hds-font-size-md, 1rem);
  padding: var(--hds-space-2, 0.5rem);
  border: 1px solid var(--hds-color-border, #c7ccd1);
  border-radius: var(--hds-radius-md, 6px);
  background: var(--hds-color-bg, #ffffff);
  color: var(--hds-color-text, #1a1d20);
}
```

- [ ] **Step 4: Create `src/components/Input/Input.tsx`**

```tsx
import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text, associated with the input for accessibility. */
  label: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={[styles.input, className].filter(Boolean).join(' ')}
        {...rest}
      />
    </div>
  )
})
```

- [ ] **Step 5: Create `src/components/Input/index.ts`**

```ts
export { Input } from './Input'
export type { InputProps } from './Input'
```

- [ ] **Step 6: Update the barrel `src/index.ts`**

```ts
// Public API barrel — pure re-exports only. No CSS, no side effects.
export { Button } from './components/Button'
export type { ButtonProps, ButtonVariant } from './components/Button'
export { Input } from './components/Input'
export type { InputProps } from './components/Input'
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/components/Input/Input.test.tsx`
Expected: PASS — all 4 tests pass in BOTH `react` and `compat` projects (8 passed total). This confirms `useId` works under `preact/compat`.

- [ ] **Step 8: Regenerate exports and verify the full test suite + typecheck**

Run:
```bash
npm run gen:exports && npm run typecheck && npm test
```
Expected: `Wrote exports for 2 component(s): Button, Input`; typecheck exits 0; all tests pass in both projects.

- [ ] **Step 9: Commit**

```bash
git add src/components/Input src/index.ts package.json
git commit -m "feat: add Input component with useId label association"
```

---

## Task 8: Tree-shaking isolation verification

**Files:**
- Create: `scripts/verify-treeshake.mjs`
- Modify: `src/components/Input/Input.tsx` (add a retained build marker)

- [ ] **Step 1: Add a retained build marker to Input so its presence is detectable**

In `src/components/Input/Input.tsx`, add the marker constant and render it as a data attribute so it cannot be dead-code-eliminated when Input IS included. Replace the file contents with:
```tsx
import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

/** Unique marker used by scripts/verify-treeshake.mjs to detect Input in a bundle. */
const INPUT_BUILD_MARKER = '__HDS_INPUT_MARKER__'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Visible label text, associated with the input for accessibility. */
  label: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className, ...rest },
  ref,
) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  return (
    <div className={styles.wrapper} data-hds-marker={INPUT_BUILD_MARKER}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={[styles.input, className].filter(Boolean).join(' ')}
        {...rest}
      />
    </div>
  )
})
```

- [ ] **Step 2: Install esbuild for the bundle assertion**

Run: `npm install -D esbuild`
Expected: `esbuild` added to `devDependencies`.

- [ ] **Step 3: Create `scripts/verify-treeshake.mjs`**

```js
import { build } from 'esbuild'

const INPUT_MARKER = '__HDS_INPUT_MARKER__'

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
  loader: { '.css': 'empty' },
  external: ['react', 'react-dom', 'react/jsx-runtime'],
})

const code = result.outputFiles[0].text

if (code.includes(INPUT_MARKER)) {
  console.error('❌ Tree-shaking FAILED: Input is present when importing only Button.')
  process.exit(1)
}

console.log('✅ Tree-shaking OK: importing Button does not pull Input.')
```

- [ ] **Step 4: Rebuild and run the verification**

Run:
```bash
npm run build && npm run verify:treeshake
```
Expected: build succeeds, then `✅ Tree-shaking OK: importing Button does not pull Input.`

- [ ] **Step 5: Confirm per-component CSS isolation structurally**

Run: `ls dist/assets`
Expected: separate CSS assets exist for each component (e.g. `Button.module-<hash>.css` and `Input.module-<hash>.css`). Because each component's chunk imports only its own CSS, a consumer importing `@hirslanden/ds/button` never references Input's CSS asset.

- [ ] **Step 6: Re-run the test suite (marker change shouldn't break tests)**

Run: `npm test`
Expected: all tests pass in both projects.

- [ ] **Step 7: Commit**

```bash
git add scripts/verify-treeshake.mjs src/components/Input/Input.tsx package.json package-lock.json
git commit -m "test: verify per-component tree-shaking isolation"
```

---

## Task 9: Storybook 10 setup + stories

**Files:**
- Create: `.storybook/main.ts`
- Create: `.storybook/preview.ts`
- Create: `src/components/Button/Button.stories.tsx`
- Create: `src/components/Input/Input.stories.tsx`

- [ ] **Step 1: Install Storybook 10 + addons**

Run:
```bash
npm install -D storybook @storybook/react-vite @storybook/addon-docs @storybook/addon-a11y
```
Expected: packages added to `devDependencies`.

- [ ] **Step 2: Create `.storybook/main.ts`**

```ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}

export default config
```

- [ ] **Step 3: Create `.storybook/preview.ts`**

```ts
import type { Preview } from '@storybook/react-vite'
import '../src/styles/tokens.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
}

export default preview
```

- [ ] **Step 4: Create `src/components/Button/Button.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button' },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
```

- [ ] **Step 5: Create `src/components/Input/Input.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  args: { label: 'Email', placeholder: 'you@example.com' },
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'patient@hirslanden.ch' } }
```

- [ ] **Step 6: Verify Storybook builds (non-interactive)**

Run: `npm run build-storybook`
Expected: `Storybook ... built` with output in `storybook-static/` and exit 0.

- [ ] **Step 7: Commit**

```bash
git add .storybook src/components/Button/Button.stories.tsx src/components/Input/Input.stories.tsx package.json package-lock.json
git commit -m "docs: add Storybook 10 setup and component stories"
```

> **Optional follow-up (not in this plan):** add interaction/component testing via `@storybook/addon-vitest` + `@vitest/browser` + Playwright. It pulls real browsers, so it's deferred until interaction-heavy widgets exist.

---

## Task 10: Preact production smoke app

**Files:**
- Create: `examples/preact-app/package.json`
- Create: `examples/preact-app/vite.config.ts`
- Create: `examples/preact-app/tsconfig.json`
- Create: `examples/preact-app/index.html`
- Create: `examples/preact-app/src/main.tsx`

- [ ] **Step 1: Create `examples/preact-app/package.json`**

```json
{
  "name": "preact-app-smoke",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@hirslanden/ds": "file:../..",
    "preact": "^10.29.2"
  }
}
```

(Dev deps `vite` + `@preact/preset-vite` are installed at their latest compatible versions by the command in Step 6, rather than pinned to a possibly-stale major here.)

- [ ] **Step 2: Create `examples/preact-app/vite.config.ts`**

```ts
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

// @preact/preset-vite auto-aliases react/react-dom -> preact/compat,
// reproducing exactly how a real consumer app runs this library.
export default defineConfig({
  plugins: [preact()],
})
```

- [ ] **Step 3: Create `examples/preact-app/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "skipLibCheck": true,
    "strict": true,
    "paths": {
      "react": ["../../node_modules/preact/compat"],
      "react-dom": ["../../node_modules/preact/compat"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `examples/preact-app/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hirslanden DS — Preact smoke test</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `examples/preact-app/src/main.tsx`**

```tsx
import { Button } from '@hirslanden/ds/button'
import { Input } from '@hirslanden/ds/input'
import '@hirslanden/ds/styles/tokens.css'
import { render } from 'preact'

function App() {
  return (
    <main>
      <h1>Hirslanden DS under preact/compat</h1>
      <Input label="Patient name" placeholder="Jane Doe" />
      <Button variant="primary">Submit</Button>
    </main>
  )
}

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}
```

- [ ] **Step 6: Build the library, then build the smoke app**

Run:
```bash
npm run build
npm --prefix examples/preact-app install
npm --prefix examples/preact-app install -D vite@^7 @preact/preset-vite
npm --prefix examples/preact-app run build
```
Expected: the example app builds successfully, resolving `@hirslanden/ds/button`, `@hirslanden/ds/input`, and the tokens stylesheet through `preact/compat` (`@preact/preset-vite` aliases `react`→`preact/compat`). A build failure here means a real compat/packaging regression.

- [ ] **Step 7: Commit**

```bash
git add examples/preact-app
git commit -m "test: add Preact production smoke app"
```

---

## Task 11: Package-contract checks + docs

**Files:**
- Create: `README.md`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Install package linters**

Run: `npm install -D publint @arethetypeswrong/cli`
Expected: both added to `devDependencies`.

- [ ] **Step 2: Build and run the package-contract checks**

Run: `npm run build && npm run verify:pkg`
Expected: `publint` reports no problems; `attw --pack` reports all export/types resolutions are correct (no "masquerading" or missing-types errors) for `.`, `./button`, `./input`. If `attw` flags an issue, fix the offending `exports`/types path and re-run.

- [ ] **Step 3: Create `CONTRIBUTING.md` (Preact-safe authoring rules)**

```markdown
# Contributing

## Authoring rules (must follow — keeps components working under `preact/compat`)

- Author against the **React 18 API surface only**. `preact/compat` (Preact 10.x) does
  NOT implement React 19-only `useActionState` / `use()`.
- Use the automatic JSX runtime (configured via `tsconfig` `jsx: "react-jsx"`).
- Keep **`forwardRef`** for components that accept a ref (Preact 11 / ref-as-prop is beta-only).
- Use **`useId`** for all accessibility ids (label `htmlFor`, `aria-*`). Never module-level counters.
- Do **not** use `defaultProps` on function components — use default parameters.
- Never rely on `useTransition` / `useDeferredValue` / `StrictMode` for correctness — they are
  no-ops / a Fragment under `preact/compat`.
- Never touch React internals (`__SECRET_INTERNALS…`).
- For portals (dialog/menu/tooltip), wire handlers on the portal content itself — events do not
  bubble out of portals in Preact.
- The library must **never** import `preact` / `preact/compat`. Aliasing is the consumer's job.

## Adding a component

1. Create `src/components/<Name>/` with `<Name>.tsx`, `<Name>.module.css`,
   `<Name>.test.tsx`, `<Name>.stories.tsx`, and `index.ts`.
2. Re-export it from `src/index.ts`.
3. Run `npm run gen:exports` to add its subpath export.
4. `npm test` (both `react` and `compat` projects must pass), `npm run build`,
   `npm run verify:treeshake`, `npm run verify:pkg`.
```

- [ ] **Step 4: Create `README.md` (consumer docs)**

````markdown
# @hirslanden/ds

Lightweight, tree-shakeable React component library for Hirslanden, designed to run inside
**Preact** apps via `preact/compat`.

## Install

```bash
npm install @hirslanden/ds
```

`react` and `react-dom` are peer dependencies. In a Preact app, alias them to `preact/compat`.

## Usage (Preact + Vite)

Alias React to `preact/compat` (the `@preact/preset-vite` plugin does this automatically):

```ts
// vite.config.ts
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

export default defineConfig({ plugins: [preact()] })
```

For TypeScript, point React types at Preact and enable `skipLibCheck`:

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "paths": {
      "react": ["./node_modules/preact/compat"],
      "react-dom": ["./node_modules/preact/compat"]
    }
  }
}
```

Import the design tokens once at your app root, then import components by subpath:

```tsx
import '@hirslanden/ds/styles/tokens.css'
import { Button } from '@hirslanden/ds/button'
import { Input } from '@hirslanden/ds/input'

export function Example() {
  return (
    <form>
      <Input label="Email" />
      <Button>Submit</Button>
    </form>
  )
}
```

Importing `@hirslanden/ds/button` pulls only Button's JS and CSS — never Input's.

## Develop

```bash
npm test            # unit tests under React AND preact/compat
npm run storybook   # component workbench
npm run build       # ESM library build into dist/
```
````

- [ ] **Step 5: Commit**

```bash
git add README.md CONTRIBUTING.md package.json package-lock.json
git commit -m "docs: add README, CONTRIBUTING, and package-contract checks"
```

---

## Final verification (run after all tasks)

- [ ] **Run the full pipeline**

```bash
npm run typecheck
npm test
npm run build
npm run verify:treeshake
npm run verify:pkg
npm run build-storybook
npm --prefix examples/preact-app install && npm --prefix examples/preact-app run build
```
Expected: every command exits 0. This proves: types are sound; components pass under React and `preact/compat`; the library builds ESM with per-component CSS; importing Button tree-shakes Input out; the package `exports`/types contract is valid; Storybook builds; and the library renders in a production Preact build.
