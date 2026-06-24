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
