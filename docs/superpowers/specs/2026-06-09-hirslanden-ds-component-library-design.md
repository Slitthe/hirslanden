# Hirslanden DS — Component Library Design Spec

**Date:** 2026-06-09
**Status:** Approved (decisions locked)
**Repo:** `hirslanden-ds` (greenfield)

## 1. Purpose & Goals

A TypeScript React component library, authored in React but **consumed by Preact apps via `preact/compat`** (the "react adapter"). It must satisfy five hard requirements:

1. **Preact compatible** — runs correctly in a Preact + `preact/compat` app.
2. **Lightweight** — minimal runtime and minimal dependencies.
3. **Tree-shakeable per component** — importing `Button` must pull neither `Input`'s JS nor `Input`'s CSS. Each import is standalone.
4. **TypeScript** — authored in TS, ships `.d.ts` types.
5. **Storybook** — first-class component development/docs.

### Scope & context (decided)
- **Size:** small/focused — ~5–15 components, **single theme**, minimal tooling. **Not** a monorepo; single package.
- **Consumer styling:** greenfield — free to choose.
- **Rendering:** client-only SPA — no SSR/SSG/hydration constraints.
- **Distribution:** deferred. Design is **registry-agnostic**; no publish pipeline or versioning tooling yet.

## 2. Locked Decisions

| Area | Decision | Key rationale |
|---|---|---|
| Build tool | **Vite 7 library mode** (multi-entry, `preserveModules`) | Only mature path that splits **CSS per component**; same engine as Storybook |
| Styling | **CSS Modules**, co-located per component (zero-runtime) | 0 KB runtime, framework-agnostic (safest under preact/compat), per-component splitting |
| Packaging | **ESM-only**, per-component **subpath exports** + barrel, `sideEffects: ["**/*.css"]`, React as `peerDependencies` | Makes "import Button ≠ pull Input" a *guarantee*, not best-effort |
| Preact strategy | Author **plain React 18 API**, automatic JSX runtime, **never alias inside the lib**, keep `forwardRef`, use `useId` | Library stays React-pure; consumer's bundler does `react→preact/compat` aliasing |
| Components | Custom simple primitives; **`@floating-ui/react`** for hard widgets' positioning only | Lightweight; avoids headless libs that break under preact/compat |
| Storybook | **v10**, `@storybook/react-vite`, plain React + separate compat test | SB10 is ESM-only; aliasing Preact *inside* Storybook fights Vite's optimizer |
| TypeScript | TS 6.0, `module: esnext`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, per-file `.d.ts` via `vite-plugin-dts` | Matches consumption; per-subpath types resolve |
| Testing | Vitest 4 + Testing Library 16, **two projects** (React + preact/compat alias) + `publint`/`attw` + Preact smoke app | Catches React-passes/Preact-breaks regressions |
| Lint/format | **Biome** + **Lefthook** pre-commit hook | Single fast binary; format/lint/organize-imports on staged files |
| Versioning/release | **None for now** (no Changesets, no publish) | Distribution deferred |

### Verified current versions (June 2026)
Vite 7.x · TypeScript 6.0 (7.0 still beta) · Preact **10.29.2** stable (**11 still `beta` → keep `forwardRef`**) · React peer `>=18` (latest 19.2.x) · Storybook 10.4.3 (ESM-only) · Vitest 4.1.8 · @testing-library/react 16.3.2 · vite-plugin-lib-inject-css 2.2.2 · @floating-ui/react (latest) · Biome (latest) · Lefthook (latest).

## 3. Project Structure

```
hirslanden-ds/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts            # export { Button } from './Button'
│   │   └── Input/ …                # same shape
│   ├── styles/
│   │   └── tokens.css              # :root design tokens (single theme)
│   ├── hooks/  utils/              # shared internals (only if needed)
│   └── index.ts                    # pure re-export barrel (no CSS, no side effects)
├── .storybook/{main.ts,preview.ts}
├── examples/preact-app/            # throwaway Preact+compat production smoke app
├── scripts/                        # subpath-exports generator
├── vite.config.ts                  # library build
├── vitest.config.ts                # 2 projects: react + compat
├── biome.json
├── lefthook.yml
├── tsconfig.json · tsconfig.build.json
├── package.json
└── README.md · CONTRIBUTING.md
```

**Convention:** every component is a self-contained folder whose `.tsx` imports its own `.module.css`. Co-location is what makes per-component CSS isolation fall out naturally. Each folder's `index.ts` re-exports; the root `src/index.ts` is a **pure** re-export barrel.

## 4. Component Architecture

- **Simple primitives custom** (Button, Input, Badge, etc.) — styled native elements, tiny, no deps.
- **Hard widgets** (Popover/Tooltip/Select/Menu, when added) — custom behavior + **`@floating-ui/react`** for positioning only.
- **Initial set: `Button` + `Input`** — proves the full pipeline end-to-end (`Input` exercises `useId` a11y wiring and validates the "import Button ≠ pull Input CSS" requirement). Grow from there.

## 5. Build Pipeline (`vite.config.ts`)

- `build.lib.entry` = **one entry per component** (glob `src/components/*/index.ts` + root `index.ts`).
- `build.lib.formats: ['es']` → **ESM only**.
- **`build.cssCodeSplit: true`** — CRITICAL override; lib mode defaults this to `false`, which merges all CSS into one file and breaks requirement #3.
- `rollupOptions.output.preserveModules: true`, `preserveModulesRoot: 'src'`.
- `vite-plugin-lib-inject-css` — each component chunk imports only its own CSS.
- `vite-plugin-dts` (per-file, **not** bundled, `entryRoot: 'src'`) — matching `.d.ts` per subpath.
- `rollupOptions.external`: `react`, `react-dom`, `react/jsx-runtime`, `@floating-ui/react` (kept as a normal `dependency`, externalized so the consumer dedupes it).

## 6. Packaging Contract (`package.json`)

```jsonc
{
  "type": "module",
  "sideEffects": ["**/*.css"],
  "files": ["dist"],
  "exports": {
    ".":        { "types": "./dist/index.d.ts",                   "import": "./dist/index.js" },
    "./button": { "types": "./dist/components/Button/index.d.ts", "import": "./dist/components/Button/index.js" },
    "./input":  { "types": "./dist/components/Input/index.d.ts",  "import": "./dist/components/Input/index.js" },
    "./styles/tokens.css": "./dist/styles/tokens.css",
    "./package.json": "./package.json"
  },
  "peerDependencies": { "react": ">=18", "react-dom": ">=18" },
  "dependencies":     { "@floating-ui/react": "^…" }
}
```

- Subpath exports generated by a small build script (`scripts/`) so adding a component doesn't require hand-editing the map.
- `publint` + `attw` in CI guard the exports/types contract.

### How per-component isolation actually works (corrected mental model)
Per-component CSS isolation is achieved by **ordinary JS tree-shaking**: if a consumer imports only `Button` (ideally via the `lib/button` subpath), `Input`'s module never enters the graph, so its `import './Input.css'` never executes. The `sideEffects: ["**/*.css"]` field does **not** "drop Input's CSS" — it **protects** the CSS of components that *are* used from being over-pruned. Caveats verified during research:
- **`cssCodeSplit` must be `true`** (lib-mode default is `false`).
- **Subpath exports are the ironclad guarantee** — the barrel-plus-`sideEffects` path depends on the consumer's tree-shaker, and **esbuild deliberately ignores `sideEffects` for CSS**. Rollup (Vite prod build) and webpack honor it; shipping subpaths removes the dependency on tree-shaker quality entirely.

## 7. Theming

`src/styles/tokens.css` defines `:root { --hds-… }` for the single theme. Consumers import `@hirslanden/ds/styles/tokens.css` **once** at app root. Component CSS uses `var(--hds-…, <fallback>)` with sensible fallbacks so a standalone-imported component never renders unstyled if tokens aren't loaded.

## 8. Preact-Safe Authoring Rules (CONTRIBUTING + lint where possible)

- React **18 API only** — `preact/compat` (Preact 10.x) does **not** implement React 19-only `useActionState`/`use()`.
- Automatic JSX runtime (`jsx: "react-jsx"`).
- Keep **`forwardRef`** (Preact 11 / ref-as-prop is still beta-only).
- Use **`useId`** for all a11y ids (label `htmlFor`, `aria-*`).
- **No `defaultProps`** on function components — use default params.
- Never depend on `useTransition`/`useDeferredValue`/`StrictMode` for correctness (no-ops / Fragment under compat).
- No React internals (`__SECRET_INTERNALS…`).
- Wire dialog/menu/tooltip handlers on the **portal content itself** — events don't bubble out of portals in Preact.
- The library **never** imports `preact` — aliasing is strictly the consumer's job.

## 9. Consumer Docs (README)

- How the Preact app aliases `react` / `react-dom` / `react/jsx-runtime` → `preact/compat` / `preact/jsx-runtime` (via `@preactjs/preset-vite` or manual `resolve.alias`).
- TS: alias React types to `preact/compat` in *their* tsconfig `paths` + `skipLibCheck`.
- Import `tokens.css` once at app root.
- Per-component import examples (`import { Button } from '@hirslanden/ds/button'`).

## 10. Storybook (v10)

- `@storybook/react-vite`, **plain React** renderer (best docgen/HMR/test ergonomics).
- Addons installed individually (SB10 is ESM-only; no `addon-essentials`): **`addon-docs`**, **`addon-a11y`**, **`addon-vitest`** (interaction/component tests run via Vitest browser mode).
- `preview.ts` imports `tokens.css` for the canvas.
- Compat is **not** verified inside Storybook (aliasing collides with Vite `optimizeDeps`); it's verified in the dedicated Vitest compat project + the example app.

## 11. Testing

`vitest.config.ts` with **two projects** running the same `*.test.tsx`:
1. **`react`** — jsdom, normal resolution (baseline).
2. **`compat`** — `resolve.alias` `react`/`react-dom`/`react-dom/test-utils`/`react/jsx-runtime` → `preact/compat` + `preact/jsx-runtime`, with `test.deps.optimizer.web.include` for React-dependent deps (verified necessary — the alias does **not** "just work" out of the box; `__H` CJS errors otherwise).

Stack: Vitest 4 + @testing-library/react 16 + `@testing-library/jest-dom` + `@testing-library/user-event`, shared `tests/setup.ts`.

Plus:
- **Production-build smoke test** in `examples/preact-app`: a Preact + `preact/compat` app importing `@hirslanden/ds/button`, built in production mode, asserting `Input`'s JS/CSS are absent from the output bundle.
- `publint` + `attw` package-contract checks.

## 12. Tooling

- **TypeScript 6.0**: `target: ES2022`, `module: esnext`, `moduleResolution: "bundler"` (set explicitly), `jsx: "react-jsx"`, `verbatimModuleSyntax: true`, `strict: true`, `skipLibCheck: true`. Separate `tsconfig.build.json` for declaration emit scope.
- **Biome** (`biome.json`): format + lint + organize-imports, single binary.
- **Lefthook** (`lefthook.yml`) pre-commit hook formatting staged files before each commit:
  ```yaml
  pre-commit:
    commands:
      biome:
        glob: "*.{ts,tsx,js,jsx,json,css}"
        run: npx biome check --write --no-errors-on-unmatched {staged_files}
        stage_fixed: true
  ```
- **No** Changesets / publish pipeline yet (deferred with distribution).

## 13. Out of Scope (for now)

- Multi-theme / dark mode (single theme only).
- Monorepo / multiple packages.
- SSR/SSG support.
- Publish/release automation, registry config, package scope name (deferred).
- Headless dependency for complex widgets (custom + Floating UI instead).

## 14. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Forgetting `cssCodeSplit: true` silently merges all CSS | Encode in `vite.config.ts` from day one; smoke test asserts isolation |
| preact/compat alias doesn't "just work" in Vitest (`__H` errors) | `deps.optimizer.web.include` for React-dependent deps; verified pattern |
| Accidentally using React-19-only APIs / `defaultProps` on FCs | CONTRIBUTING rules + Biome lint + dual-project tests |
| Bundling React breaks consumer's compat alias | `react`/`react-dom`/`react/jsx-runtime` as peerDeps **and** `external` in build |
| Barrel-only imports over-pull in weak bundlers | Ship per-component **subpath exports** as the primary API |
| Standalone component renders unstyled without tokens | `var(--hds-…, fallback)` fallbacks in component CSS |
