# Turborepo Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the single-package `@hirslanden/ds` repo into a pnpm + Turborepo monorepo with the design system as `packages/ds` and a new Preact consumer app `apps/skin-cancer-screening` that renders one DS `Button`.

**Architecture:** The existing design system moves verbatim into `packages/ds` (authoring unchanged — React-API source that runs under `preact/compat`). The repo root becomes a non-package workspace shell (pnpm workspaces + Turbo). The consumer app is a Preact app (`@preact/preset-vite`) that consumes the DS **live from source** via a custom `"source"` export condition, so DS edits hot-reload with no rebuild. Tailwind v4, Vitest, and a Storybook instance are added to the app.

**Tech Stack:** pnpm workspaces, Turborepo 2.x, TypeScript 6, Vite 8, Vitest 4, Preact 10 (`@preact/preset-vite`), Tailwind v4 (`@tailwindcss/vite`), Storybook 10 (`@storybook/react-vite` + `preact/compat`), Biome, lefthook.

## Global Constraints

- **Both packages:** TypeScript (`strict`, `verbatimModuleSyntax: true`, `moduleResolution: bundler`), Vitest, Preact runtime.
- **Consumer app only:** Tailwind v4, Storybook.
- **Design system is NOT rewritten** — it stays authored against the React API and is consumed through `preact/compat`.
- **Code style (Biome):** single quotes, no semicolons, 2-space indent, line width 100 (JS/TS). CSS uses double quotes. Every new/edited file must pass `biome check .`.
- **DS package name stays `@hirslanden/ds`.** Consumer app package name is `@hirslanden/skin-cancer-screening`.
- **Live-source consumption:** the app never depends on `packages/ds/dist`; it resolves the DS `"source"` export condition (bundler via `resolve.conditions`, tsc via `customConditions`).
- **No Claude git operations.** Claude performs NO `git add/commit/push/branch/mv`. "Checkpoint" steps are *suggested* commit points the **user** runs. File moves use the filesystem (`mv`), not `git mv`; git will detect the renames when the user stages.
- **Shell:** commands are written for git-bash (the Bash tool, always available). PowerShell equivalents: `mv`→`Move-Item`, `rm -rf`→`Remove-Item -Recurse -Force`, `mkdir -p`→`New-Item -ItemType Directory -Force`.

## Prerequisites (verify once before Task 1)

- [ ] **pnpm installed:** Run `pnpm -v` → expect `>= 9.0.0`. If missing: `npm i -g pnpm`.
- [ ] **Node version:** Run `node -v` → expect `>= 20.19` or `>= 22.12` (Vite 8 requirement).

## File Structure

**Created at root:** `pnpm-workspace.yaml`, new `package.json` (monorepo shell), `turbo.json`, `tsconfig.base.json`. **Edited at root:** `.gitignore`. **Stay at root unchanged:** `biome.json`, `lefthook.yml`, `CONTRIBUTING.md`, `docs/`, `.claude/`.

**Moved root → `packages/ds/` (verbatim):** `src/`, `tests/`, `scripts/`, `.storybook/`, `.attw.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.build.json`, `README.md`. **Moved + edited:** `package.json` (add `source` exports), `tsconfig.json` (extend base). **Deleted (regenerated):** `node_modules/`, `dist/`, `storybook-static/`, `package-lock.json`.

**Created under `apps/skin-cancer-screening/`:** `package.json`, `index.html`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tests/setup.ts`, `.storybook/main.ts`, `.storybook/preview.ts`, `src/main.tsx`, `src/app.tsx`, `src/index.css`, `src/vite-env.d.ts`, `src/app.test.tsx`, `src/Example.stories.tsx`.

---

## Task 1: pnpm + Turbo workspace shell, with the DS moved into `packages/ds`

**Files:**
- Create: `pnpm-workspace.yaml`, `package.json` (root, replaces the old DS one), `turbo.json`, `tsconfig.base.json`
- Modify: `.gitignore`, `packages/ds/package.json` (move), `packages/ds/tsconfig.json` (move + rewrite)
- Move: `src/ tests/ scripts/ .storybook/ .attw.json vite.config.ts vitest.config.ts tsconfig.build.json README.md package.json tsconfig.json` → `packages/ds/`
- Delete: `node_modules/ dist/ storybook-static/ package-lock.json`

**Interfaces:**
- Produces: workspace globs `apps/*`, `packages/*`; Turbo tasks `dev|build|test|typecheck|lint|storybook|build-storybook`; root `tsconfig.base.json` (shared `compilerOptions`); the DS package at `packages/ds` named `@hirslanden/ds`.
- Consumes: nothing (first task).

- [ ] **Step 1: Create the package directories**

Run (from repo root):
```bash
mkdir -p packages/ds apps
```

- [ ] **Step 2: Move the design system into `packages/ds`**

```bash
mv src tests scripts .storybook .attw.json \
   vite.config.ts vitest.config.ts tsconfig.json tsconfig.build.json \
   package.json README.md \
   packages/ds/
```
Verify: `ls packages/ds` shows `src tests scripts .storybook vite.config.ts package.json …`, and `ls` at root no longer lists `src`/`package.json`.

> Do NOT move `biome.json`, `lefthook.yml`, `CONTRIBUTING.md`, `docs/`, or `.claude/` — they remain at root.

- [ ] **Step 3: Delete npm + build artifacts (regenerated by pnpm/turbo)**

```bash
rm -rf node_modules dist storybook-static package-lock.json packages/ds/dist packages/ds/storybook-static
```

- [ ] **Step 4: Create `pnpm-workspace.yaml`**

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 5: Create the new root `package.json` (monorepo shell)**

`package.json`:
```json
{
  "name": "hirslanden-monorepo",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "lint": "biome check .",
    "format": "biome format --write .",
    "storybook": "turbo run storybook",
    "build-storybook": "turbo run build-storybook",
    "prepare": "lefthook install"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.16",
    "lefthook": "^2.1.9",
    "turbo": "^2.5.5",
    "typescript": "^6.0.3"
  }
}
```

- [ ] **Step 6: Create `turbo.json`**

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": {},
    "typecheck": {},
    "lint": {},
    "storybook": { "cache": false, "persistent": true },
    "build-storybook": { "outputs": ["storybook-static/**"] }
  }
}
```

- [ ] **Step 7: Create `tsconfig.base.json` (extracted shared options)**

`tsconfig.base.json`:
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
    "types": ["node", "vitest/globals"]
  }
}
```

- [ ] **Step 8: Rewrite `packages/ds/tsconfig.json` to extend the base**

Replace the entire contents of `packages/ds/tsconfig.json` with:
```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src", "tests", "scripts", "vite.config.ts", "vitest.config.ts", ".storybook"]
}
```
> `packages/ds/tsconfig.build.json` is unchanged — it still `extends: "./tsconfig.json"`, which now chains to the base.

- [ ] **Step 9: Replace `.gitignore` for the monorepo**

`.gitignore`:
```
node_modules
dist
storybook-static
.turbo
*.log
*.tsbuildinfo
.DS_Store
coverage
```

- [ ] **Step 10: Install with pnpm**

Run (from repo root):
```bash
pnpm install
```
Expected: completes successfully, creates `pnpm-lock.yaml` and a workspace `node_modules`. A benign `unmet peer react`/`react-dom` warning on `@hirslanden/ds` is expected and acceptable (satisfied virtually by `preact/compat` in consumers).

- [ ] **Step 11: Verify the DS still builds and tests green through Turbo**

Run:
```bash
pnpm exec turbo run build test --filter=@hirslanden/ds
```
Expected: `build` produces `packages/ds/dist/`; `test` runs **both** the `react` and `compat` Vitest projects and all tests PASS. (Turbo prints `2 successful`.)

- [ ] **Step 12: Checkpoint (user commits)**

Suggested message: `chore: convert repo to pnpm + turbo monorepo; move design system to packages/ds`

---

## Task 2: Add the `source` export condition to the design system

Lets consumers resolve the DS to its TypeScript source. The generator script is updated first so `pnpm gen:exports` stays the source of truth (no hand-maintained drift).

**Files:**
- Modify: `packages/ds/scripts/generate-exports.mjs`, `packages/ds/package.json` (regenerated)

**Interfaces:**
- Consumes: `@hirslanden/ds` package from Task 1.
- Produces: each `exports` entry gains a `"source"` key — `"."` → `./src/index.ts`, `"./button"` → `./src/components/Button/index.ts`, `"./styles/tokens.css"` → `./src/styles/tokens.css` (with `"./styles/tokens.css"` becoming `{ "source": ..., "default": "./dist/styles/tokens.css" }`). `"types"`/`"import"` (→ `dist`) are unchanged so publishing is unaffected.

- [ ] **Step 1: Update the exports generator**

Replace the body of `packages/ds/scripts/generate-exports.mjs` that builds `exportsField` with the version below (adds the `source` condition; rest of the file — reading the dir, writing `package.json` — is unchanged):
```js
const exportsField = {
  '.': { source: './src/index.ts', types: './dist/index.d.ts', import: './dist/index.js' },
}

for (const name of components) {
  exportsField[`./${name.toLowerCase()}`] = {
    source: `./src/components/${name}/index.ts`,
    types: `./dist/components/${name}/index.d.ts`,
    import: `./dist/components/${name}/index.js`,
  }
}

exportsField['./styles/tokens.css'] = {
  source: './src/styles/tokens.css',
  default: './dist/styles/tokens.css',
}
exportsField['./package.json'] = './package.json'
```

- [ ] **Step 2: Regenerate the exports map**

Run:
```bash
pnpm --filter @hirslanden/ds gen:exports
```
Expected output: `Wrote exports for 16 component(s): Accordion, Button, …`.

- [ ] **Step 3: Verify the source condition landed**

Run:
```bash
node -e "const p=require('./packages/ds/package.json'); console.log(p.exports['./button'].source, '|', p.exports['.'].source)"
```
Expected: `./src/components/Button/index.ts | ./src/index.ts`

- [ ] **Step 4: Confirm the change is idempotent and the DS is still green**

Run:
```bash
pnpm --filter @hirslanden/ds gen:exports && pnpm exec turbo run test --filter=@hirslanden/ds
```
Expected: re-running the generator leaves `package.json` byte-identical (no diff on a second run), and all DS tests PASS.

> Note: the DS's manual `verify:pkg` (publint/attw) may warn that the `source` condition points outside the published `files` (`dist`). This is expected for the live-source pattern and is **out of scope** — `verify:pkg` is not part of the monorepo task graph or acceptance.

- [ ] **Step 5: Checkpoint (user commits)**

Suggested message: `feat(ds): add "source" export condition for live-source consumption`

---

## Task 3: Scaffold the Preact consumer app rendering one DS Button

Preact + TypeScript + Vite + Tailwind v4, consuming the DS from source. Deliverable: `pnpm --filter @hirslanden/skin-cancer-screening dev` serves a page showing one Button, the app builds, and it typechecks.

**Files:**
- Create: `apps/skin-cancer-screening/package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/app.tsx`, `src/index.css`, `src/vite-env.d.ts`

**Interfaces:**
- Consumes: `@hirslanden/ds` `"source"` condition (Task 2) — specifically `@hirslanden/ds/button` (`Button`, props `variant?: 'primary'|'secondary'`, `size?: 'md'|'lg'`) and `@hirslanden/ds/styles/tokens.css`.
- Produces: package `@hirslanden/skin-cancer-screening`; exports `App` from `./src/app` (`export function App(): JSX.Element`); Vite `resolve.conditions` including `source`; tsconfig `customConditions: ["source"]` + `react`→`preact/compat` paths (relied on by Tasks 4 and 5).

- [ ] **Step 1: Create the app `package.json`**

`apps/skin-cancer-screening/package.json`:
```json
{
  "name": "@hirslanden/skin-cancer-screening",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "storybook": "storybook dev -p 6007",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@hirslanden/ds": "workspace:*",
    "preact": "^10.29.2"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.10.5",
    "@storybook/addon-docs": "^10.4.3",
    "@storybook/react-vite": "^10.4.3",
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/preact": "^3.2.4",
    "@types/node": "^25.9.2",
    "jsdom": "^29.1.1",
    "storybook": "^10.4.3",
    "tailwindcss": "^4.0.0",
    "typescript": "^6.0.3",
    "vite": "^8.0.16",
    "vitest": "^4.1.8"
  }
}
```

- [ ] **Step 2: Install the new dependencies**

Run (from repo root):
```bash
pnpm install
```
Expected: links `@hirslanden/ds` into the app via the `workspace:*` protocol; installs Preact/Vite/Tailwind/Storybook. Completes successfully.

- [ ] **Step 3: Create `index.html`**

`apps/skin-cancer-screening/index.html`:
```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Skin Cancer Screening</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `vite.config.ts`**

`apps/skin-cancer-screening/vite.config.ts`:
```ts
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// @preact/preset-vite auto-aliases react/react-dom -> preact/compat, so the DS's
// React-API source resolves to Preact at the app boundary. The "source" condition
// makes @hirslanden/ds resolve to its .ts source (live HMR, no DS build needed).
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  resolve: {
    conditions: ['source', 'module', 'browser', 'development|production'],
  },
})
```

- [ ] **Step 5: Create the app TypeScript config**

`apps/skin-cancer-screening/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsxImportSource": "preact",
    "customConditions": ["source"],
    "paths": {
      "react": ["./node_modules/preact/compat/"],
      "react-dom": ["./node_modules/preact/compat/"],
      "react/jsx-runtime": ["./node_modules/preact/jsx-runtime"]
    }
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts", ".storybook"]
}
```
> `customConditions: ["source"]` makes `tsc` resolve `@hirslanden/ds` to its `.ts` source (matching the bundler). The `paths` map React types to `preact/compat` so the DS source's `react` type imports (`forwardRef`, `ButtonHTMLAttributes`) resolve.

- [ ] **Step 6: Create the CSS entry (Tailwind v4)**

`apps/skin-cancer-screening/src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 7: Create the ambient Vite types**

`apps/skin-cancer-screening/src/vite-env.d.ts`:
```ts
/// <reference types="vite/client" />
```
> Provides the `declare module '*.css'` ambient so the `tokens.css`/`index.css` side-effect imports typecheck.

- [ ] **Step 8: Create the App component (renders one DS Button)**

`apps/skin-cancer-screening/src/app.tsx`:
```tsx
import { Button } from '@hirslanden/ds/button'

export function App() {
  return (
    <main>
      <h1>Skin Cancer Screening</h1>
      <Button variant="primary">Hautkrebs-Check starten</Button>
    </main>
  )
}
```

- [ ] **Step 9: Create the app entry point**

`apps/skin-cancer-screening/src/main.tsx`:
```tsx
import { render } from 'preact'
import '@hirslanden/ds/styles/tokens.css'
import './index.css'
import { App } from './app'

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}
```

- [ ] **Step 10: Typecheck the app**

Run:
```bash
pnpm --filter @hirslanden/skin-cancer-screening typecheck
```
Expected: `tsc --noEmit` exits 0 (no errors).

> **Fallback if typecheck fails on DS source** (e.g., a `preact/compat`-vs-React type mismatch surfaced by checking DS `.ts` directly): switch the app to type the DS via its built `.d.ts` instead of source. Remove `"customConditions": ["source"]` from `apps/skin-cancer-screening/tsconfig.json` (so `tsc` resolves `@hirslanden/ds` via the `types` condition → `dist`, which `skipLibCheck` skips), and add `"typecheck": { "dependsOn": ["^build"] }` to `turbo.json`. Runtime/HMR still uses source via Vite's `resolve.conditions` — unaffected.

- [ ] **Step 11: Verify the app builds**

Run:
```bash
pnpm --filter @hirslanden/skin-cancer-screening build
```
Expected: Vite build succeeds, emitting `apps/skin-cancer-screening/dist/`. The bundle includes the DS Button compiled from source (no `packages/ds/dist` required).

- [ ] **Step 12: Smoke-check the dev server (manual)**

Run:
```bash
pnpm --filter @hirslanden/skin-cancer-screening dev
```
Expected: Vite prints a `Local: http://localhost:5173/` URL. Open it — the page shows the "Hautkrebs-Check starten" Button styled with DS tokens. Stop the server (Ctrl-C).

- [ ] **Step 13: Checkpoint (user commits)**

Suggested message: `feat(app): scaffold skin-cancer-screening Preact app rendering a DS Button`

---

## Task 4: Add the consumer app's Vitest smoke test

TDD: a failing test first, proving the source-consumption + `preact/compat` wiring renders a real DS Button end-to-end.

**Files:**
- Create: `apps/skin-cancer-screening/vitest.config.ts`, `apps/skin-cancer-screening/tests/setup.ts`, `apps/skin-cancer-screening/src/app.test.tsx`

**Interfaces:**
- Consumes: `App` from `./src/app` (Task 3); `@hirslanden/ds/button`.
- Produces: a passing `test` script for the app, picked up by `turbo run test`.

- [ ] **Step 1: Write the failing test**

`apps/skin-cancer-screening/src/app.test.tsx`:
```tsx
import { render, screen } from '@testing-library/preact'
import { App } from './app'

test('renders the start button from the design system', () => {
  render(<App />)
  expect(
    screen.getByRole('button', { name: 'Hautkrebs-Check starten' }),
  ).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it to confirm it fails (no config yet)**

Run:
```bash
pnpm --filter @hirslanden/skin-cancer-screening test
```
Expected: FAIL — Vitest has no jsdom env / `toBeInTheDocument` matcher / setup yet (errors like `expect(...).toBeInTheDocument is not a function` or `document is not defined`).

- [ ] **Step 3: Create the Vitest setup file**

`apps/skin-cancer-screening/tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/preact'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
```

- [ ] **Step 4: Create the Vitest config**

`apps/skin-cancer-screening/vitest.config.ts`:
```ts
import preact from '@preact/preset-vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [preact()],
  resolve: {
    conditions: ['source', 'module', 'browser', 'development|production'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.tsx'],
  },
})
```

- [ ] **Step 5: Run the test to confirm it passes**

Run:
```bash
pnpm --filter @hirslanden/skin-cancer-screening test
```
Expected: PASS — `1 passed`.

- [ ] **Step 6: Run the whole monorepo test task**

Run:
```bash
pnpm exec turbo run test
```
Expected: both packages run — DS (`react` + `compat` projects) and the app — all PASS.

- [ ] **Step 7: Checkpoint (user commits)**

Suggested message: `test(app): add Vitest smoke test asserting the DS Button renders`

---

## Task 5: Add the consumer app's Storybook (react-vite + preact/compat)

A second, app-local Storybook instance with one barebones story rendering the DS Button. Reuses `@storybook/react-vite`, aliasing `react`→`preact/compat`.

**Files:**
- Create: `apps/skin-cancer-screening/.storybook/main.ts`, `apps/skin-cancer-screening/.storybook/preview.ts`, `apps/skin-cancer-screening/src/Example.stories.tsx`

**Interfaces:**
- Consumes: `@hirslanden/ds/button`, `@hirslanden/ds/styles/tokens.css`, `./src/index.css`.
- Produces: `storybook`/`build-storybook` scripts for the app, picked up by `turbo run build-storybook`.

- [ ] **Step 1: Create the Storybook main config**

`apps/skin-cancer-screening/.storybook/main.ts`:
```ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      resolve: {
        conditions: ['source'],
        alias: {
          react: 'preact/compat',
          'react-dom': 'preact/compat',
          'react/jsx-runtime': 'preact/compat/jsx-runtime',
          'react/jsx-dev-runtime': 'preact/compat/jsx-dev-runtime',
          'react-dom/test-utils': 'preact/test-utils',
        },
        dedupe: ['preact', 'preact/hooks', 'preact/compat'],
      },
    })
  },
}

export default config
```

- [ ] **Step 2: Create the Storybook preview**

`apps/skin-cancer-screening/.storybook/preview.ts`:
```ts
import type { Preview } from '@storybook/react-vite'
import '@hirslanden/ds/styles/tokens.css'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
  },
}

export default preview
```

- [ ] **Step 3: Create the example story**

`apps/skin-cancer-screening/src/Example.stories.tsx`:
```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@hirslanden/ds/button'

const meta: Meta<typeof Button> = {
  title: 'Example/Button',
  component: Button,
  args: { children: 'Hautkrebs-Check starten' },
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
```

- [ ] **Step 4: Build Storybook to verify the setup compiles**

Run:
```bash
pnpm --filter @hirslanden/skin-cancer-screening build-storybook
```
Expected: Storybook builds successfully into `apps/skin-cancer-screening/storybook-static/` with no `react`/`preact` resolution errors.

- [ ] **Step 5: Smoke-check the Storybook dev server (manual)**

Run:
```bash
pnpm --filter @hirslanden/skin-cancer-screening storybook
```
Expected: Storybook serves on `http://localhost:6007`. The `Example/Button` story renders the DS Button (Primary + Secondary). Stop the server (Ctrl-C).

- [ ] **Step 6: Checkpoint (user commits)**

Suggested message: `feat(app): add Storybook (react-vite + preact/compat) with a Button story`

---

## Task 6: Monorepo-wide verification and root README

Final integration gate — every Turbo task green across both packages, lint clean, and a root README describing the workspace.

**Files:**
- Create: `README.md` (root)
- Verify: `turbo.json` tasks across `packages/ds` + `apps/skin-cancer-screening`

**Interfaces:**
- Consumes: everything from Tasks 1–5.
- Produces: nothing new — acceptance gate.

- [ ] **Step 1: Create a root README**

`README.md`:
```markdown
# Hirslanden monorepo

pnpm + Turborepo workspace.

- `packages/ds` — `@hirslanden/ds`, the design system component library.
- `apps/skin-cancer-screening` — Preact consumer app (Tailwind v4 + Storybook) that
  consumes the design system live from source.

## Commands

- `pnpm dev` — run all dev servers via Turbo
- `pnpm build` — build all packages
- `pnpm test` — run all test suites
- `pnpm typecheck` — typecheck all packages
- `pnpm lint` — Biome check across the workspace
- `pnpm storybook` — run Storybook dev servers
```

- [ ] **Step 2: Lint the whole workspace**

Run:
```bash
pnpm lint
```
Expected: `biome check .` reports no errors. If Biome auto-fixable issues appear, run `pnpm format` then re-run `pnpm lint`.

- [ ] **Step 3: Typecheck the whole workspace**

Run:
```bash
pnpm exec turbo run typecheck
```
Expected: both `@hirslanden/ds` and `@hirslanden/skin-cancer-screening` typecheck with 0 errors.

- [ ] **Step 4: Build everything**

Run:
```bash
pnpm exec turbo run build
```
Expected: DS emits `packages/ds/dist/`; app emits `apps/skin-cancer-screening/dist/`. Both succeed.

- [ ] **Step 5: Test everything**

Run:
```bash
pnpm exec turbo run test
```
Expected: all suites PASS (DS `react` + `compat`, app smoke test).

- [ ] **Step 6: Build all Storybooks**

Run:
```bash
pnpm exec turbo run build-storybook
```
Expected: both the DS Storybook and the app Storybook build successfully.

- [ ] **Step 7: Confirm Turbo caching works (optional sanity)**

Run `pnpm exec turbo run typecheck` a second time.
Expected: Turbo reports `FULL TURBO` / cache hits (tasks restored from cache).

- [ ] **Step 8: Checkpoint (user commits)**

Suggested message: `docs: add monorepo README; verify full turbo task graph green`

---

## Self-Review

**Spec coverage:**
- pnpm workspaces → Task 1. ✓
- App named `skin-cancer-screening` (`@hirslanden/skin-cancer-screening`) → Task 3. ✓
- Live-source consumption (`source` condition + `customConditions` + `resolve.conditions`) → Tasks 2, 3. ✓
- Storybook `@storybook/react-vite` + `preact/compat` → Task 5. ✓
- Shared tooling hoisted (`biome.json`/`lefthook.yml` stay at root, `tsconfig.base.json` created) → Task 1. ✓
- DS moved to `packages/ds`, authoring unchanged → Task 1. ✓
- Both apps: TypeScript, Vitest, Preact → DS (existing) + app Tasks 3, 4. ✓
- App: Tailwind v4 → Task 3 (Steps 6, `@tailwindcss/vite` in config). ✓
- App entry renders one DS Button → Task 3 (Steps 8–9, 12). ✓
- Two Storybook instances → DS keeps its own; app adds one (Task 5). ✓
- No Claude git operations → enforced via "Checkpoint (user commits)" framing. ✓

**Placeholder scan:** No TBD/TODO/"handle appropriately" — every code step contains full file contents and every command has expected output. ✓

**Type/name consistency:** `App` (exported from `./src/app`) used identically in `main.tsx`, `app.test.tsx`. Package names `@hirslanden/ds` / `@hirslanden/skin-cancer-screening` consistent across `workspace:*`, filters, and exports. Turbo task names (`build|dev|test|typecheck|lint|storybook|build-storybook`) match between `turbo.json`, root scripts, and app scripts. The `source` condition string is identical in the generator, `package.json` exports, Vite/Vitest `resolve.conditions`, Storybook `viteFinal`, and tsconfig `customConditions`. ✓

**Known risks (with in-plan fallbacks):**
- DS-source typecheck under `preact/compat` → fallback documented in Task 3 Step 10 (type via `dist` `.d.ts`).
- `.js`→`.ts` barrel resolution → handled natively by Vite; surfaces (if ever) in Task 3 Step 11/Task 4, same dist fallback applies.
- `verify:pkg` warning on the `source` condition → explicitly scoped out (Task 2 Step 4 note).
