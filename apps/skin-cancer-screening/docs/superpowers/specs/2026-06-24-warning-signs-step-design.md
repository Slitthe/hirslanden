# Step 1 — "Warning signs" — Design

**Date:** 2026-06-24
**App:** `@hirslanden/skin-cancer-screening` (`apps/skin-cancer-screening`)
**Scope:** Step 1 of a 14-step skin-cancer-risk questionnaire. Only step 1 is in
scope here; the other steps and the final report are out of scope and built later
with separate prompts. Steps are authored standalone and wired into a flow at the
end.

---

## 1. Project & tech-stack map (grounding)

Findings from inspecting the app and the design system, recorded so the
implementation plan (and future per-step prompts) have a precise reference.

### Framework & tooling
- **Preact 10** app. JSX preconfigured (`jsxImportSource: "preact"`); no React
  import. Hooks from `preact/hooks`.
- `react`/`react-dom` are aliased to `preact/compat` across tsconfig, Vite, Vitest,
  and Storybook, so React-authored DS primitives "just work".
- **Vite** dev/build, **Vitest + @testing-library/preact** (jsdom, globals on,
  auto-cleanup via `tests/setup.ts`), **Storybook 10** on port **6007**
  (`@storybook/addon-docs`, `@storybook/addon-a11y`), **Biome** for lint/format.
- **Path alias `@root`** → app root, wired in tsconfig (`@root/*`), Vite, Vitest,
  and `.storybook/main.ts`. Use `@root/src/...` for intra-app imports; DS imports
  stay package-scoped (`@hirslanden/ds/<subpath>`).
- DS consumed as a workspace package via the `source` export condition (we compile
  DS source directly — no build step needed between packages).

### Biome rules that affect authoring
- Single quotes, **semicolons always**, 2-space indent, line width 100,
  organize-imports on. `src/i18n/generated.ts` is excluded from formatting.
- Project conventions (from `CLAUDE.md`): brace all control statements; no
  conditional object spreads; avoid `as`; no `any` (use `unknown` + guards);
  **prefer `enum`s over bare string comparisons**; JSDoc on every util.

### i18n layer (`@root/src/i18n`)
- `useTranslation()` → `{ translate }`. `translate(key)` for plain keys;
  `translate(key, params)` for keys with `{{token}}` interpolation. Params are
  type-checked and required; keys must be **string literals**.
- Locales: `de`, `en`, `fr`. **`de`** is the runtime/Storybook default; **`en`** is
  the fallback and the source the typed key map is generated from.
- Keys live as nested objects in `src/locale/{en,de,fr}.json`, flattened to
  dot-paths. Every locale must define the **same keys with the same tokens** (a
  test enforces this). After editing locales, run **`pnpm gen:i18n`** to rewrite
  `src/i18n/generated.ts` (committed; a test fails if stale).
- The hook must run inside `<TranslationProvider locale=…>`. The app, tests, and
  Storybook each provide one; Storybook has a **Locale** toolbar (`de/en/fr`).

### Styling
- **Tailwind v4** + DS **design tokens**. `@hirslanden/ds/styles/tokens.css`
  (`--hds-*` custom properties) is imported globally in `main.tsx` and
  `.storybook/preview.tsx`. `src/index.css` maps tokens into Tailwind's theme via
  `@theme inline`, exposing token-backed utilities:
  - Colours: `bg-primary`, `text-primary`, `text-text`, `text-muted`,
    `text-strong`, `bg-surface-subtle`, `border-border`, `bg-track`,
    `bg-primary-soft`, `bg-bg`, …
  - Type scale: `font-sans`, `text-xs … text-2xl` (`text-md` = 14px body base).
  - Shape: `rounded-sm`/`rounded-md` (both `0` — sharp/square brand),
    `shadow-card` (`none` — flat).
- Generic spacing/layout uses plain Tailwind utilities (default rem scale matches
  `--hds-space-*`). Mobile-first; layer larger breakpoints with `sm:`/`md:`/`lg:`.

### Component conventions (`CLAUDE.md`)
- Each component in its own PascalCase folder under `src/components/`; steps under
  `src/components/steps/<Name>/`. Files: `index.tsx` (named export matching the
  folder), `<Name>.types.ts`, `<Name>.test.tsx`, `<Name>.stories.tsx`. Scoped
  `hooks/`/`utils/` only when needed.
- Compose DS primitives wherever one fits; flag a missing-but-reusable primitive
  with a `TODO(ds)` comment (not needed for this step — see §4).

### Relevant DS primitives (verified APIs)
- `@hirslanden/ds/stepprogress` → `StepProgress({ current, total, label? })` —
  renders "Step X of Y" text + a bar; `role="progressbar"` with
  `aria-valuenow/min/max/valuetext`. Auto-label is English → pass a localized
  `label`.
- `@hirslanden/ds/optiongroup` → `OptionGroup` (radiogroup) **and** `OptionCard`.
  `OptionCard({ value, title, description?, media?, selected? })` extends button
  attributes. **Standalone** (outside `OptionGroup`) it renders a `<button>` with
  `aria-pressed` reflecting `selected`, and passes through `onClick` — exactly the
  control we want (see §3). Selected card gets a border + `bg-primary-soft` wash;
  hover → primary border; focus-visible → 2px outline.
- `@hirslanden/ds/overline` → `Overline({ as? })` — uppercase, letter-spaced,
  muted; we store natural-case copy and let it transform.
- `@hirslanden/ds/heading` → `Heading({ level: 1|2|3, muted? })` — semantic
  `h1/h2/h3`; level 1 = 42px (matches the screenshot's large question).
- `@hirslanden/ds/textlink` → `TextLink({ href?, leadingIcon?, trailingIcon?,
  children })` — renders `<a>` if `href`, else `<button type="button">`; primary
  colour, underline on hover, focus-visible outline.
- `@hirslanden/ds/icon` → `Icon({ name, size?, title? })`; `name: 'arrow-left' |
  'arrow-right' | 'arrow-down' | 'plus' | 'minus'`. Decorative when no `title`
  (`aria-hidden`).
- (`Text`, `Card`, `Button`, etc. exist but aren't needed for step 1.)

---

## 2. What step 1 is (from the screenshot)

A single questionnaire screen, top to bottom:
1. Progress: **"Step 1 of 14"** + a thin bar filled ~1/14.
2. Overline: **WARNING SIGNS**.
3. Heading (question): **"Do you have a mole or skin spot that is new, growing,
   changing shape or colour, bleeding, or not healing?"**
4. Three selectable cards (bold title + muted description):
   - **Yes** — "I have noticed a change or unusual spot."
   - **No** — "Nothing new or changing that I have noticed."
   - **Not sure** — "I may have noticed something but I am not certain."
5. A **"← Back"** text link.

The whole thing sits inside a thin bordered panel.

> The orange numbered circles (3, 2, 1) overlapping the bar and the first two cards
> are **design-review annotation pins, not UI** — confirmed with the maintainer.
> They are ignored.

---

## 3. Decisions (confirmed with the maintainer)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Orange numbered badges | Annotation pins — ignore |
| 2 | Forward navigation | **Auto-advance on select**; no "Next" button |
| 3 | Outer bordered panel | **The Step 1 component renders its own frame** |
| 4 | Data/navigation exposure | **Controlled + uncontrolled + callbacks** |
| 5 | Control model for the answers | **Activating option cards (buttons)** |

### Why "activating option cards (buttons)" rather than a radio group
Auto-advance with no Next button collides with radio-group keyboard semantics:
- A `<button>` that navigates on activation is **expected** behaviour → no WCAG
  2.1 **3.2.2 (On Input)** "change-on-input" violation, unlike a radio whose
  *selection* triggers a context change.
- Radio arrow-key roving both **moves and selects**, so under auto-advance a
  keyboard user would advance on every arrow press. With buttons, **Tab** moves and
  **Enter/Space/click** activates — exploring never accidentally advances.
- We still reuse the DS `OptionCard` (standalone) for identical styling, and the
  previously chosen answer is re-highlighted via `selected` when the user returns.

---

## 4. Component design

### Location & name
`src/components/steps/WarningSigns/` — named export `WarningSigns`. (Name taken
from the "Warning signs" category/overline.)

```
src/components/steps/WarningSigns/
  index.tsx                  # the WarningSigns component
  WarningSigns.types.ts      # enum + props
  WarningSigns.test.tsx      # unit test
  WarningSigns.stories.tsx   # Storybook story
```

No `hooks/` or `utils/` folders are needed (no reusable logic beyond the
component). No missing DS primitive → **no `TODO(ds)`**.

### Types (`WarningSigns.types.ts`)
```ts
export enum WarningSignsAnswer {
  Yes = 'yes',
  No = 'no',
  Unsure = 'unsure',
}

export interface WarningSignsProps {
  /** Controlled selected answer. */
  value?: WarningSignsAnswer;
  /** Initial answer when uncontrolled. */
  defaultValue?: WarningSignsAnswer;
  /** Fires when an answer is chosen — this is the auto-advance signal. */
  onChange?: (answer: WarningSignsAnswer) => void;
  /** Fires when the "Back" link is activated. */
  onBack?: () => void;
  /** Step position, for the progress indicator. Defaults: 1 of 14. */
  current?: number;
  total?: number;
}
```

### Behaviour (`index.tsx`)
- Standard **controlled/uncontrolled** pattern: internal `useState` seeded from
  `defaultValue`; when `value` is provided it wins. On card activation: update
  internal state (uncontrolled) and call `onChange(answer)`. The parent reacts to
  `onChange` by advancing (auto-advance); in isolation (Storybook/tests) the card
  simply highlights.
- `current` defaults to `1`, `total` to `14` (module constants), overridable.
- The selected answer is reflected on each `OptionCard` via `selected={value ===
  WarningSignsAnswer.X}`.

### Composition
```
<section> (the bordered frame: border-border, rounded-sm, bg-bg, padding, max-w-2xl, mobile-first)
  <StepProgress current total label={translate('general.progress.stepOf', { current, total })} />
  <Overline>{translate('steps.warningSigns.overline')}</Overline>
  <Heading level={1} id={questionId}>{translate('steps.warningSigns.question')}</Heading>
  <div role="group" aria-labelledby={questionId}>   // the three cards
    <OptionCard value="yes"    title=… description=… selected=… onClick=… />
    <OptionCard value="no"     title=… description=… selected=… onClick=… />
    <OptionCard value="unsure" title=… description=… selected=… onClick=… />
  </div>
  <TextLink leadingIcon={<Icon name="arrow-left" />} onClick={onBack}>
    {translate('steps.warningSigns.back')}
  </TextLink>
</section>
```
- `questionId` via `useId()` ties the options group to the question for AT.
- `data-testid`s on the frame, progress, overline, question, each option, and the
  back link, for the unit test.

---

## 5. i18n

Add to **all three** `src/locale/*.json` (then run `pnpm gen:i18n`). Natural-case
strings (the `Overline` uppercases visually).

| Key | en |
|-----|----|
| `steps.warningSigns.overline` | Warning signs |
| `steps.warningSigns.question` | Do you have a mole or skin spot that is new, growing, changing shape or colour, bleeding, or not healing? |
| `steps.warningSigns.options.yes.title` | Yes |
| `steps.warningSigns.options.yes.description` | I have noticed a change or unusual spot. |
| `steps.warningSigns.options.no.title` | No |
| `steps.warningSigns.options.no.description` | Nothing new or changing that I have noticed. |
| `steps.warningSigns.options.unsure.title` | Not sure |
| `steps.warningSigns.options.unsure.description` | I may have noticed something but I am not certain. |
| `steps.warningSigns.back` | Back |
| `general.progress.stepOf` | Step {{current}} of {{total}} |

German / French (`de` / `fr`):
- `overline`: "Warnzeichen" / "Signes d'alerte"
- `question`: "Haben Sie ein Muttermal oder einen Hautfleck, das/der neu ist,
  wächst, Form oder Farbe ändert, blutet oder nicht abheilt?" / "Avez-vous un grain
  de beauté ou une tache cutanée qui est nouveau/nouvelle, grandit, change de forme
  ou de couleur, saigne ou ne cicatrise pas ?"
- `options.yes.title`: "Ja" / "Oui"; `.description`: "Mir ist eine Veränderung oder
  ein ungewöhnlicher Fleck aufgefallen." / "J'ai remarqué un changement ou une tache
  inhabituelle."
- `options.no.title`: "Nein" / "Non"; `.description`: "Nichts Neues oder
  Veränderliches, das mir aufgefallen ist." / "Rien de nouveau ni de changeant que
  j'aie remarqué."
- `options.unsure.title`: "Nicht sicher" / "Pas sûr·e"; `.description`: "Mir ist
  vielleicht etwas aufgefallen, aber ich bin nicht sicher." / "J'ai peut-être
  remarqué quelque chose mais je n'en suis pas certain·e."
- `back`: "Zurück" / "Retour"
- `general.progress.stepOf`: "Schritt {{current}} von {{total}}" / "Étape
  {{current}} sur {{total}}"

(The German/French copy above is a first pass; the maintainer can refine wording.
Tokens `{{current}}`/`{{total}}` must match across all three locales.)

---

## 6. Accessibility (WCAG 2.1 AA — blocker if violated)

- Question `Heading` carries an `id`; the options `div` uses
  `role="group" aria-labelledby={questionId}` so AT announces the question as the
  group's label.
- Answers are `<button>`s (via standalone `OptionCard`): Tab/Shift+Tab order,
  visible focus, Enter/Space activation — all from the DS primitive.
- Auto-advance is triggered by button activation (an actuator), so **3.2.2 (On
  Input)** is satisfied; "Back" makes the flow reversible.
- `StepProgress` provides `role="progressbar"`; the back `Icon` is decorative
  (`aria-hidden`) with the visible "Back" text as the accessible name.
- Verified by an axe-core scan asserting **zero** AA violations, plus a manual
  keyboard pass and contrast check.

---

## 7. Testing

Unit (`WarningSigns.test.tsx`), per `CLAUDE.md`:
- Mock `@root/src/i18n` so `translate(key) → key`; assert on **keys**, not copy.
- Mock the DS primitives (minimal stand-ins forwarding only what the test needs —
  e.g. `OptionCard` → a `<button>` that calls `onClick`).
- Target by `data-testid`.
- Cases: renders progress/overline/question keys and all three option keys;
  clicking an option calls `onChange(WarningSignsAnswer.X)`; clicking Back calls
  `onBack`; `value` highlights the matching card (selected state forwarded).

Story (`WarningSigns.stories.tsx`):
- CSF3, `Meta`/`StoryObj` from `@storybook/react-vite`, title `Steps/WarningSigns`.
- `Default` (interactive; `onChange`/`onBack` as Storybook actions) and a
  `Preselected` story (`value` set) to show the returning-user highlight.
- Story id for the iframe: `steps-warningsigns--default`.

---

## 8. Verification (definition of done)

- [ ] Folder/files per `CLAUDE.md`; named export `WarningSigns`.
- [ ] Reuses DS primitives; no hardcoded user-facing strings (keys in all three
      locales + `pnpm gen:i18n` re-run).
- [ ] Tailwind + `--hds-*` token utilities only; mobile-first; renders its own
      frame.
- [ ] Unit tests follow conventions (keys not copy, deps mocked, `data-testid`).
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` green.
- [ ] Playwright/Storybook check: looks right at 375×812 and 1440×900, **zero**
      WCAG 2.1 AA violations (axe), not out of place against hirslanden.ch.

## 9. Out of scope / assumptions
- Steps 2–14, the final report, scoring, and the wizard shell that wires steps
  together and owns navigation/persistence.
- "Back" on the real first step (where it leads, or whether it's hidden) is a
  wiring concern; here it is rendered per the screenshot and exposed via `onBack`.
- German/French copy is a first-pass translation, open to refinement.

## 10. Git
Per maintainer preference, **nothing is committed or pushed**. This doc and all
code are left in the working tree for review. (Deviates from the brainstorming
skill's "commit the design doc" step, which the user's standing instruction
overrides.)

## 11. Accessibility decision (resolved 2026-06-24, post-implementation)

Outcome of the browser axe-core AA scan and the maintainer's resolution:

- **FIXED in the DS** (maintainer-approved, since the app surfaced them):
  - `StepProgress` rendered `role="progressbar"` with no accessible name
    (`aria-progressbar-name`) — added `aria-label` (the localized "Step 1 of 14").
  - `Overline` had a union-tag spread type error that broke the app `tsc` once the
    app imported it — fixed by rendering through an `ElementType` (mirrors `Card`).
- **ACCEPTED brand deviation** (maintainer decision — keep exact brand colours):
  the remaining axe `color-contrast` findings are inherent to the official
  Hirslanden brand tokens — muted text `--hds-color-muted` #938880 (3.45:1) and
  the azure link `--hds-color-primary` #0094d4 (3.39:1), both below the 4.5:1 AA
  threshold for normal text. The live hirslanden.ch uses the **identical** values
  (verified: hero text `rgb(147,136,128)`, "Cookie Policy" link `rgb(0,148,212)`).
  To stay pixel-true to the brand, the tokens are kept as-is and the contrast
  shortfall is recorded as an accepted, documented brand-level deviation — not a
  component defect. Revisit if/when the brand palette is updated for AA.

Net a11y state: **zero AA violations except the accepted brand-contrast
deviation**; full keyboard operability (Tab order Yes→No→Not sure→Back, visible
2px focus ring, Enter/Space activation); correct roles/names (progressbar named,
`h1` question, options `group` named via an sr-only `<legend>`, each option a
named button). This amends the §8 "zero AA violations" gate accordingly.
