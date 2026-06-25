# CLAUDE.md

This app (`@hirslanden/skin-cancer-screening`) is a **Preact** app for assessing
skin cancer risks. It composes reusable primitives from `packages/ds`
(`@hirslanden/ds`).

For the initial implementation, the individual steps/questions of the assessment
are being built as separate, standalone components.

## Commands

Run these from this app directory (`apps/skin-cancer-screening`). From the repo
root, `pnpm dev` / `build` / `test` / `typecheck` / `storybook` fan out across all
packages via Turbo.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server for the app |
| `pnpm storybook` | Storybook on `http://localhost:6007` |
| `pnpm test` | Run the Vitest unit tests once |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | Biome check |
| `pnpm gen:i18n` | Regenerate `src/i18n/generated.ts` from `en.json` |
| `pnpm build` | Production build (Vite) |
| `pnpm build-storybook` | Static Storybook build |

## Implementing components

Guidelines below apply when building the standalone step/question components.

### Framework

The app is built with **Preact** (v10). Author components against Preact directly:

- Import hooks from `preact/hooks` (`useState`, `useId`, …). JSX is preconfigured
  (`jsxImportSource: "preact"`), so no React import is needed.
- Write tests with `@testing-library/preact` (see the i18n tests for examples).
- DS primitives are authored against the React 18 API surface; the app aliases
  `react`/`react-dom` to `preact/compat`, so they just work — import and use them.
  See `CONTRIBUTING.md` for the DS-side authoring rules.

### Component structure

Every component lives in its own **PascalCase** folder under `src/components/`,
with the component defined in `index.tsx` as a **named export matching the folder
name**:

```
src/components/[PascalCase]/
  index.tsx                 # the component (named export `[PascalCase]`);
                            #   component-local config/constants can live here too
  [PascalCase].types.ts     # the component's types
  [PascalCase].test.tsx     # unit test (co-located)
  [PascalCase].stories.tsx  # Storybook story (co-located)
  hooks/                    # hooks used ONLY by this component
  utils/                    # utils used ONLY by this component
```

```tsx
// src/components/RiskBadge/index.tsx
import type { RiskBadgeProps } from '@root/src/components/RiskBadge/RiskBadge.types';

export function RiskBadge({ level }: RiskBadgeProps) {
  /* ... */
}
```

- **Import** a component by its folder via the `@root` alias — `index.tsx` is the
  entry point, so `import { RiskBadge } from '@root/src/components/RiskBadge'`.
- **Types** go in `[PascalCase].types.ts`.
- **Config / constants** local to the component can stay in `index.tsx`.
- A **hook or util used by only one component** lives in that component's `hooks/`
  or `utils/` folder. Promote it to the shared location below only once a second
  consumer needs it.
- **Shared (cross-component) hooks and utils** live in `src/hooks/` and
  `src/utils/`.
- Every util — scoped or shared — gets a **JSDoc** block describing what it does,
  how to use it, and at least one example:

  ```ts
  /**
   * Maps a 0–100 risk score to a qualitative level.
   *
   * @param score - Risk score, 0–100.
   * @returns The qualitative level: `'low' | 'medium' | 'high'`.
   * @example
   * riskLevel(12); // 'low'
   * riskLevel(80); // 'high'
   */
  export function riskLevel(score: number) {
    /* ... */
  }
  ```

The Storybook (`../src/**/*.stories.tsx`) and Vitest (`src/**/*.test.{ts,tsx}`)
globs recurse into `src/`, so co-located stories and tests are picked up
automatically.

### Steps

Assessment steps/questions are components too — group them under a `steps/`
subfolder and follow the exact same structure:

```
src/components/steps/[NameOfTheStep]/
```

e.g. `src/components/steps/MoleCount/index.tsx` exporting `MoleCount`.

**Steps are controlled-only.** A step never owns its own answer state — the
parent flow does. Expose a `value` prop (optional; `undefined` = nothing selected
yet) and an `onChange` callback, and drive the UI purely from `value`. Don't add a
`defaultValue` prop or hold the answer in component-local `useState`; selection
must follow the `value` the parent passes back. This keeps the parent the single
source of truth for the assessment's answers.

```tsx
// Good — controlled-only
export function MoleCount({ value, onChange }: MoleCountProps) {
  return <OptionCard selected={value === MoleCountAnswer.Many} onClick={() => onChange?.(MoleCountAnswer.Many)} />;
}

// Avoid — internal answer state / uncontrolled fallback
const [internal, setInternal] = useState(defaultValue);
```

### Imports

Use the `@root` path alias for intra-app imports instead of relative paths.
`@root` maps to the app root, so reference modules as `@root/src/...` (and
`@root/scripts/...`) rather than `./` or `../` chains:

```tsx
// Good
import { useTranslation } from '@root/src/i18n';

// Avoid
import { useTranslation } from '../../i18n';
```

The alias is wired for every toolchain — `tsconfig.json` (`paths`), Vite,
Vitest, and Storybook — so it resolves consistently in builds, tests, and the
editor. Design-system imports stay package-scoped (`@hirslanden/ds/button`), not
`@root`.

### Design system primitives

Compose steps/questions from the primitives in `packages/ds` (`@hirslanden/ds`)
wherever one matches — don't re-implement buttons, inputs, cards, layout, etc.
locally. Import them via their subpath export:

```tsx
import { Button } from '@hirslanden/ds/button';
```

Check what's available under `packages/ds/src/components/` (or the DS Storybook)
before writing new markup. Current primitives include Accordion, Button, Callout,
Card, Divider, Heading, Icon, InfoCard, Input, List, OptionGroup, Overline,
RiskScale, StepProgress, Text, and TextLink.

If a primitive you need is **missing but would be reused across multiple parts of
the project**, don't silently inline a one-off — flag it with a comment at the
call site so it can be promoted into the design system later:

```tsx
// TODO(ds): no <RadioCard> primitive yet — reused across several steps;
// candidate to add to @hirslanden/ds.
```

A genuinely one-off piece of UI can stay local; the flag is for reusable gaps.

### Styling & design tokens

Styling is **Tailwind v4** plus the design system's **design tokens**. The DS ships
`@hirslanden/ds/styles/tokens.css` — `--hds-*` CSS custom properties (colour,
spacing, radius, typography) tuned to match hirslanden.ch — already imported at the
app entry (`main.tsx`) and in Storybook (`.storybook/preview.tsx`), so the tokens
are available globally.

The app's `src/index.css` maps those tokens into Tailwind's theme (via
`@theme inline`), so they're available as **first-class utilities** — no arbitrary
values or raw `var()` needed:

- **Colours** — one utility per `--hds-color-*` token, named after its suffix:
  `bg-primary`, `text-primary`, `text-text`, `text-muted`, `text-strong`,
  `bg-surface-subtle`, `border-border`, `bg-track`, `bg-primary-soft`, …
- **Typography** — `font-sans` (the brand family) and the brand type scale
  `text-xs … text-2xl` (`text-md` is the 14px body base).
- **Shape** — `rounded-sm` / `rounded-md` (sharp, square brand) and `shadow-card`
  (flat).

Guidelines:

- Prefer **DS primitives**, which already consume these tokens, over styling from
  scratch; for headings/body prefer the DS `Heading`/`Text` components over raw
  `text-*` utilities.
- Use the **token-backed utilities for brand values** (colour, type scale, radius)
  instead of hardcoded hex colours, px sizes, or font families.
- Use plain Tailwind utilities for generic layout/spacing — its default spacing
  scale already provides the `--hds-space-*` rem steps (e.g. `p-4` = 1rem,
  `p-6` = 1.5rem).
- To add or change a token, edit `packages/ds/src/styles/tokens.css`; to expose a
  new namespace as utilities, add it to the `@theme inline` block in `index.css`.

### Accessibility (WCAG 2.1 AA)

All components must meet **WCAG 2.1 Level AA**. In practice: use semantic HTML and
correct ARIA roles/attributes; label every control and pair `htmlFor`/`id` via
`useId` (see `CONTRIBUTING.md`); keep full keyboard operability with a visible
focus indicator; and ensure text contrast and target sizes meet AA. Prefer DS
primitives, which already bake this in, over hand-rolled markup.

### Responsive (mobile-first)

Implement layouts **mobile-first**: style for the smallest viewport first, then
layer on larger breakpoints with Tailwind's min-width prefixes (`sm:`, `md:`,
`lg:`, …). Avoid desktop-first styles that you then override downward.

### Translations (i18n)

All user-facing text must go through the translation layer in `src/i18n`. Never
hardcode display strings in a component.

Supported locales: `de`, `en`, `fr`. `de` is the runtime/Storybook default; `en`
is the fallback locale **and** the canonical source the typed key map is
generated from.

#### Using translations in a component

Use the `useTranslation` hook from `@root/src/i18n`:

```tsx
import { useTranslation } from '@root/src/i18n';

export function MoleStep() {
  const { translate } = useTranslation();
  return (
    <section>
      <h2>{translate('steps.mole.title')}</h2>
      <p>{translate('steps.mole.intro', { count: 3 })}</p>
    </section>
  );
}
```

- `translate(key)` for plain keys; `translate(key, params)` for keys containing
  `{{token}}` interpolation. Params are type-checked and required.
- Always pass a **string-literal key**. A key passed as a variable/union loses
  the required-params type guarantee (see `src/i18n/types.assert.ts`).
- The hook must run inside a `<TranslationProvider>`. The app, the tests, and
  Storybook all provide one (see below), so components themselves don't render it.

#### Adding a key and its translations

1. Add the key to **all three** locale files in `src/locale/`: `en.json`,
   `de.json`, `fr.json`. Keys are nested objects flattened to a dot-path
   (`steps.mole.title`). Interpolated values use `{{token}}`, e.g.
   `"You have {{count}} moles"`.
2. Every locale must define the **same keys** with the **same tokens** — a test
   enforces this, so don't add a key to only one file.
3. Regenerate the typed key map (driven by `en.json`):

   ```
   pnpm gen:i18n
   ```

   This rewrites the auto-generated `src/i18n/generated.ts`. Never edit that file
   by hand; commit it — a test fails if it is stale.

#### Storybook

The provider is already wired globally in `.storybook/preview.tsx`: every story
is wrapped in `<TranslationProvider>`, and a **Locale** toolbar (globe icon)
switches between `de`/`en`/`fr` live. A story for a step component therefore
needs no i18n setup — just render the component and use the toolbar to check each
locale. (Only touch `preview.tsx` if you add a new locale, in which case extend
`globalTypes.locale.toolbar.items`.)

Run Storybook with `pnpm storybook`.

#### Tests

The i18n layer's own tests assert real translated strings, so they wrap the
subject in a real provider at a fixed locale:

```tsx
import { render, screen } from '@testing-library/preact';
import { TranslationProvider } from '@root/src/i18n';

render(
  <TranslationProvider locale="de">
    <MoleStep />
  </TranslationProvider>,
);
```

Component tests, by contrast, mock the translation layer and assert on keys — see
[Unit testing](#unit-testing).

Run these from this app directory (`apps/skin-cancer-screening`):

- `pnpm test` — Vitest. Includes the i18n guards in `src/i18n/locale.test.ts`
  (locales share keys + tokens, and `generated.ts` is up to date).
- `pnpm typecheck` — `tsc --noEmit`. Catches unknown keys and missing/wrong
  interpolation params (incl. the assertions in `src/i18n/types.assert.ts`).
- `pnpm lint` — Biome.

After any locale change, run `pnpm gen:i18n`, then `pnpm test` and `pnpm typecheck`.

## Coding style

`pnpm lint` (Biome) handles formatting and catches some of these (e.g. `any`, and
the semicolons below); the rest are conventions to follow:

- **Comments are a last resort.** The code is the source of truth, not the
  comments — comments are redundant by default and tend to harden assumptions that
  drift from the code. Reach first for **clearer naming**, **small helper functions
  with descriptive names**, and **better file/directory organisation**; let those
  carry the meaning a comment would. Comments aren't forbidden, but only write one
  when the intent genuinely can't be expressed in code — e.g. *why* a non-obvious
  choice was made, an external constraint, or a deliberate workaround. Never narrate
  *what* the code does. (The one standing exception is the required JSDoc on
  shared/scoped utils described above — that's documentation of a public API, not an
  inline comment.)

- **End every statement with a semicolon.** Biome is configured with
  `semicolons: "always"`, so `pnpm format` enforces this across the monorepo.

- **No conditional object spreads.** Don't conditionally merge keys with
  `...(condition ? { key: value } : {})` — branch with `if`/`else` and assign
  explicitly:

  ```ts
  // Avoid
  const opts = { retries: 3, ...(verbose ? { logger: console } : {}) };

  // Prefer
  const opts: Options = { retries: 3 };
  if (verbose) {
    opts.logger = console;
  }
  ```

- **Always brace control statements**, even single-line bodies:

  ```ts
  // Avoid
  if (done) return;

  // Prefer
  if (done) {
    return;
  }
  ```

- **Avoid `as`.** Skip type assertions unless there is genuinely no alternative —
  e.g. a documented escape hatch like the `as TranslationKey` cast that exercises
  the i18n runtime fallback in `src/i18n/useTranslation.test.tsx`. Otherwise prefer
  correct types and narrowing.

- **No `any`; prefer `unknown` + type guards.** Type unvalidated input as
  `unknown` and narrow it with a guard before use:

  ```ts
  function isPoint(v: unknown): v is { x: number; y: number } {
    return typeof v === 'object' && v !== null && 'x' in v && 'y' in v;
  }
  ```

- **Prefer enums over bare string comparisons.** For a fixed set of values, define
  an `enum` and compare against its members instead of raw string literals — it's
  self-documenting, autocompletes, and is safe to rename:

  ```ts
  enum RiskLevel {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
  }

  // Prefer
  if (riskLevel === RiskLevel.High) {
    // ...
  }

  // Avoid
  if (riskLevel === 'high') {
    // ...
  }
  ```

## Unit testing

Unit tests run on Vitest + `@testing-library/preact` with globals enabled (`test`,
`expect`, and `vi` need no import; `render`/`screen` come from
`@testing-library/preact`). Co-locate each test as `[PascalCase].test.tsx`. Test
the component in isolation — its own logic and markup, not its dependencies.

- **Assert on translation keys, not literal copy.** Mock the translation layer so
  `translate(key)` returns the key, then assert the key. Tests then stay stable
  when wording changes and don't depend on locale content. The only exception is
  when the translation itself is under test (the i18n layer's own tests in
  `src/i18n/`), which use the real provider and assert real strings.

  ```tsx
  import { render, screen } from '@testing-library/preact';
  import { MoleCount } from '@root/src/components/steps/MoleCount';

  // translate(key) -> key, so assertions check keys, not copy.
  vi.mock('@root/src/i18n', () => ({
    useTranslation: () => ({ translate: (key: string) => key }),
  }));

  test('renders the step title', () => {
    render(<MoleCount />);
    expect(screen.getByTestId('mole-count-title')).toHaveTextContent('steps.mole.title');
  });
  ```

- **Mock external dependencies, including DS components.** You're testing your
  component, not `@hirslanden/ds` (which has its own tests). Mock DS primitives so a
  failure points at your component rather than the library:

  ```tsx
  import type { ComponentChildren } from 'preact';

  vi.mock('@hirslanden/ds/button', () => ({
    // Minimal stand-in; forward only what the test needs.
    Button: ({ children }: { children?: ComponentChildren }) => (
      <button data-testid="ds-button">{children}</button>
    ),
  }));
  ```

- **Target by `data-testid`.** Vastly prefer `screen.getByTestId(...)` over text-,
  role-, or class-based queries — it's resilient to copy and markup changes. Give
  the elements a test needs a stable `data-testid` in the component and query those.
  (Role/label/contrast accessibility is covered separately by the browser a11y
  checks below, so unit tests don't need role queries for that.)

## Testing components (browser, visual & a11y)

These checks complement the unit tests / `typecheck` / `lint` above. Drive each
component's Storybook story through the **Playwright MCP server** to verify how it
looks, that it's accessible, and that it fits the host site.

> The app's Storybook has `@storybook/addon-a11y` enabled (in `.storybook/main.ts`),
> so each story shows an **Accessibility** panel flagging WCAG violations as you
> browse — a fast first check that complements the axe scan below.

Start Storybook first — it serves on `http://localhost:6007`:

```
pnpm storybook
```

Open a single story in isolation and force the English locale. Find the story in
the Storybook sidebar and use its iframe URL (the `id` is the kebab-cased
title + export — e.g. a story titled `Steps/MoleCount` with a `Default` export →
`steps-molecount--default`):

```
http://localhost:6007/iframe.html?id=<story-id>&viewMode=story&globals=locale:en
```

Then, using the Playwright MCP tools (`browser_resize`, `browser_navigate`,
`browser_take_screenshot`, `browser_snapshot`, `browser_evaluate`):

1. **Mobile & desktop** — screenshot the story at a mobile viewport (e.g.
   375×812) and a desktop one (e.g. 1440×900). It must look right at both; the
   component is built mobile-first.
2. **English only** — keep `globals=locale:en`; there's no need to sweep `de`/`fr`
   for visual or a11y checks (the i18n layer's own tests already cover locale
   parity).
3. **WCAG 2.1 AA — very important.** Run an automated accessibility scan against
   the story (inject `axe-core` via `browser_evaluate` and assert **zero** AA
   violations), then confirm manually: the accessibility snapshot
   (`browser_snapshot`) shows correct roles/names, the component is fully
   keyboard-operable (Tab / Shift+Tab order, visible focus, Enter/Space
   activation), and text meets AA contrast. Treat any AA violation as a blocker.
4. **Embedding fit** — the widget gets embedded into the Hirslanden website, so it
   must not look out of place there. Open the host page
   `https://www.hirslanden.ch/de/corporate/home.html`, screenshot comparable
   elements (buttons, cards, headings, form controls — plus their typography,
   spacing, and colour), and reconcile the component against them. If that page
   has no comparable element, browse to other Hirslanden pages to find one.

## Definition of done

Before considering a component done:

- [ ] Lives in `src/components/[PascalCase]/` with `index.tsx` (named export),
      `[PascalCase].types.ts`, `[PascalCase].test.tsx`, and
      `[PascalCase].stories.tsx`.
- [ ] Reuses DS primitives where one fits; any missing-but-reusable primitive is
      flagged with a `TODO(ds)` comment.
- [ ] No hardcoded user-facing strings — all text goes through `translate(...)`
      with keys added to `en.json` / `de.json` / `fr.json` and `pnpm gen:i18n`
      re-run.
- [ ] Styled with Tailwind + `--hds-*` tokens (no hardcoded brand values), and
      mobile-first.
- [ ] Unit tests follow the conventions (keys not copy, deps mocked, `data-testid`
      targeting).
- [ ] `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- [ ] Verified in Storybook via the Playwright MCP server: looks right on mobile
      and desktop, **zero** WCAG 2.1 AA violations, and not out of place against
      hirslanden.ch.

## Git

Don't commit, push, or create branches unless explicitly asked. Leave changes in
the working tree for the maintainer to review and commit.
