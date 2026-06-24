# Turborepo conversion — design

**Date:** 2026-06-24
**Status:** Approved (design); plan to follow

## Goal

Convert the single-package `@hirslanden/ds` repository into a Turborepo monorepo:

1. The existing design system becomes its own workspace package (`packages/ds`), unchanged in authoring.
2. A new first consumer app (`apps/skin-cancer-screening`) is scaffolded: a Preact app that consumes the design system as a workspace dependency.

Scope is **barebones scaffolding** — the consumer app needs one working entry point that renders a single `Button` from the design library. No product features.

## Confirmed decisions

| Decision | Choice |
|---|---|
| Package manager / workspaces | **pnpm workspaces** (migrate from npm) |
| Consumer app name | **skin-cancer-screening** → `apps/skin-cancer-screening`, package `@hirslanden/skin-cancer-screening` |
| How the app consumes the DS | **Live source** via a custom `"source"` export condition (no `dist/` needed by the app) |
| Storybook in the app | **`@storybook/react-vite` + `preact/compat` alias** (reuse the DS's framework) |
| Shared tooling | Hoist `biome.json`, `lefthook.yml`, and a new `tsconfig.base.json` to the repo root |
| Storybook instances | Two — the DS keeps its existing React Storybook; the app gets its own |
| DS authoring | **Unchanged** — stays React-API authored / `preact/compat`-compatible; not rewritten to native Preact |
| Git operations | None performed by Claude — user handles all commits/moves |

## Requirements (both apps)

- TypeScript
- Vitest
- Preact (DS is React-API authored but runs under `preact/compat`; the app is a Preact app)
- Consumer app additionally: Tailwind v4, Storybook

## Current state (baseline)

- `@hirslanden/ds` lives at the repo **root**. Authored against the React API (`forwardRef`/`ButtonHTMLAttributes` from `react`, `jsx: react-jsx`), built/tested under `preact/compat`.
- Vite **lib build** → `dist/` with per-component entries, `preserveModules`, externalizing `react`/`react-dom`/`@floating-ui`. `package.json#exports` map per-component subpaths to `dist`.
- Vitest 4 with **two projects** (`react` and `compat`). Storybook 10 via `@storybook/react-vite`. Biome, lefthook, publint/attw, TypeScript 6, Vite 8.
- The most recent commit removed an `examples/preact-app/` smoke test (Preact via `@preact/preset-vite`, `react`→`preact/compat` auto-alias, linked with `file:../..`). That is the proven template this app formalizes.

## Target layout

```
hirslanden-ds/                          ← monorepo root (no longer a package)
├─ pnpm-workspace.yaml                  packages: ["apps/*", "packages/*"]
├─ package.json                         private root; turbo + shared dev-tooling; scripts → turbo
├─ turbo.json                           tasks: dev, build, test, typecheck, lint, storybook, build-storybook
├─ tsconfig.base.json                   shared compilerOptions (extracted from today's tsconfig.json)
├─ biome.json                           moved up from the DS root → monorepo-wide
├─ lefthook.yml                         moved up from the DS root
├─ .gitignore                           updated for monorepo (node_modules, dist, .turbo, storybook-static)
├─ packages/
│  └─ ds/                               ← everything currently at root, moved verbatim
│     ├─ package.json                   @hirslanden/ds + a "source" export condition added
│     ├─ src/  tests/  scripts/  .storybook/
│     ├─ vite.config.ts  vitest.config.ts
│     └─ tsconfig.json  tsconfig.build.json   (extend ../../tsconfig.base.json)
└─ apps/
   └─ skin-cancer-screening/            ← new Preact consumer
      ├─ package.json                   @hirslanden/skin-cancer-screening; "@hirslanden/ds": "workspace:*"
      ├─ index.html
      ├─ vite.config.ts                 preact() + tailwindcss(); resolve.conditions includes "source"
      ├─ vitest.config.ts               @preact/preset-vite + jsdom + setup
      ├─ tsconfig.json                  extends base; jsxImportSource preact; react→preact/compat paths
      ├─ .storybook/
      │  ├─ main.ts                     @storybook/react-vite + viteFinal aliasing react→preact/compat
      │  └─ preview.ts(x)
      └─ src/
         ├─ main.tsx                    renders <Button> from @hirslanden/ds into #app
         ├─ app.tsx                     minimal App component
         ├─ index.css                   @import "tailwindcss"; + DS tokens
         ├─ app.test.tsx                vitest smoke test (Button renders)
         └─ Example.stories.tsx         one barebones story
```

## Key mechanisms

### Live-source consumption (`source` condition)

Each `exports` entry in `packages/ds/package.json` gains a `"source"` key pointing at the TS source; `"types"`/`"import"` keep pointing at `dist` so real publishing is unaffected.

```jsonc
"exports": {
  ".":                   { "source": "./src/index.ts",                   "types": "./dist/index.d.ts", "import": "./dist/index.js" },
  "./button":            { "source": "./src/components/Button/index.ts",  "types": "...",               "import": "..." },
  "./styles/tokens.css": { "source": "./src/styles/tokens.css",          "default": "./dist/styles/tokens.css" }
}
```

The app resolves the `source` condition in **both dev and build**:

```ts
// apps/skin-cancer-screening/vite.config.ts
resolve: { conditions: ['source', 'module', 'browser', 'development|production'] }
```

Result: the app bundles the DS's TypeScript directly — instant HMR on DS edits, and the app **never depends on `dist/`** (no `^build` edge in Turbo for the app). `@preact/preset-vite` auto-aliases `react`/`react-dom` → `preact/compat`, so the DS's React-API source resolves to Preact at the app boundary.

The exports `source` condition is also applied to `vitest.config.ts` (`resolve.conditions`) so tests consume source identically.

### Tailwind v4

`@tailwindcss/vite` plugin + `@import "tailwindcss";` in `src/index.css` (CSS-first, no `tailwind.config.js`). Coexists with the DS tokens (`@hirslanden/ds/styles/tokens.css`) and CSS Modules.

### Storybook (app)

`@storybook/react-vite` framework with a `viteFinal` hook adding `resolve.alias` `react`→`preact/compat` (+ dedupe), mirroring how the DS already maps React to Preact. One barebones story.

### Turbo task graph

- `dev` — persistent, uncached.
- `build` — `dependsOn: ["^build"]`, `outputs: ["dist/**"]`. Builds the DS publish artifact; the app build bundles DS source so it does not strictly need the DS `dist`, but the edge is harmless and keeps publish valid.
- `test`, `typecheck`, `lint` — standard, cached with appropriate inputs.
- `storybook` (persistent), `build-storybook` (`outputs: ["storybook-static/**"]`).

Root `package.json` scripts delegate: `"dev": "turbo run dev"`, `"build": "turbo run build"`, etc.

### pnpm migration

Add `pnpm-workspace.yaml`; delete root `package-lock.json`; `pnpm install` generates `pnpm-lock.yaml`. App depends on the DS via `"@hirslanden/ds": "workspace:*"`.

## Verification

- App **smoke test** (Vitest + jsdom) renders the DS `Button` and asserts it is in the document — exercises source-consumption + compat wiring end-to-end.
- DS's existing dual react/compat suite remains green, run via Turbo.
- `pnpm dev` (or `turbo run dev`) serves the app; visiting it shows a single rendered Button.
- `turbo run build`, `turbo run typecheck`, `turbo run lint` all pass across both packages.

## Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| DS barrels use `.js`-extension imports pointing at `.ts` files | Low | Vite resolves `.js`→`.ts` natively; verify during execution; fallback = import component subpaths or `allowImportingTsExtensions`. |
| pnpm unmet-`react`-peer warning on the DS | Low (cosmetic) | Satisfied virtually by the compat alias; accept warning or pin via `peerDependenciesMeta`/`.npmrc`. |
| Two Storybook instances drift in config | Low | Keep app Storybook minimal; document the compat alias. |
| Tailwind v4 utilities clashing with DS CSS Modules/tokens | Low | Distinct layers; app owns its own CSS entry; DS ships scoped modules + token vars. |

## Out of scope

- Rewriting the DS to native Preact.
- Any product/questionnaire features in the app beyond the single-Button starter.
- CI changes, publishing pipeline changes, changesets.
- Moving the DS's existing Storybook or altering its build.
