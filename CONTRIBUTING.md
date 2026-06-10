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
