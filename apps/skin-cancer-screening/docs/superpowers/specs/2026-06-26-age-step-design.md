# Step 3 — "Age" — Design

**Date:** 2026-06-26
**App:** `@hirslanden/skin-cancer-screening` (`apps/skin-cancer-screening`)
**Scope:** Step 3 of a 14-step skin-cancer-risk questionnaire. Only step 3 is in
scope here; steps 1–2 and 4–14, the final report, scoring, and the wizard shell that
wires steps together (navigation, persistence) are out of scope and built later with
separate prompts. Steps are authored standalone and wired into a flow at the end.

Step 3 is the **first input-based step**. Steps 1–2 (`WarningSigns`,
`PreviousDiagnosis`) are single-select option cards that **auto-advance** on tap.
Step 3 instead collects a **free-text number (age)** and therefore needs an explicit
**Continue** button (you can't auto-advance off a half-typed number), plus a gentle
**under-18 redirect**. The shared scaffolding (frame, `StepProgress`, `Overline`,
`Heading`, optional muted `Text` description, `Back` link, controlled-only, test/story
shape) is reused unchanged; the design below is expressed as the set of intentional
deltas from steps 1–2. The full tech-stack map lives in the step 1/2 specs; a
condensed, step-3-relevant copy is repeated so this doc is self-contained.

---

## 1. Project & tech-stack map (grounding)

Findings from inspecting the app and the design system, recorded so the
implementation plan (and future per-step prompts) have a precise reference.

### Framework & tooling
- **Preact 10** app. JSX preconfigured (`jsxImportSource: "preact"`); no React
  import. Hooks from `preact/hooks`.
- `react`/`react-dom` aliased to `preact/compat` across tsconfig, Vite, Vitest, and
  Storybook, so the React-authored DS primitives "just work" — including the new
  `Input`/`Button`/`InfoCard` introduced by this step.
- **Vite** dev/build, **Vitest + @testing-library/preact** (jsdom, globals on),
  **Storybook 10** on port **6007** (`@storybook/addon-docs`, `@storybook/addon-a11y`),
  **Biome** for lint/format.
- **Path alias `@root`** → app root. Use `@root/src/...` for intra-app imports; DS
  imports stay package-scoped (`@hirslanden/ds/<subpath>`).
- DS consumed as a workspace package via the `source` export condition (DS source is
  compiled directly — no build step between packages).

### Biome / `CLAUDE.md` rules that affect authoring
- Single quotes, **semicolons always**, 2-space indent, line width 100,
  organize-imports on. `src/i18n/generated.ts` is excluded from formatting.
- Brace all control statements; **no conditional object spreads**; avoid `as`; no
  `any` (use `unknown` + guards); **prefer `enum`s over bare string comparisons**;
  JSDoc on every shared/scoped util; comments are a last resort.

### Steps are controlled-only (`CLAUDE.md`, authoritative)
A step never owns its answer state — the parent flow does. Expose a `value` prop
(optional; `undefined` = nothing entered yet) and callbacks, and drive the UI purely
from `value`. **No `defaultValue`, no component-local answer `useState`.** For step 3
the answer is the typed age, so `value` is a `number` and the input's displayed text
is derived from it (`hasAge ? String(value) : ''` — NaN-safe; see §4).

### i18n layer (`@root/src/i18n`)
- `useTranslation()` → `{ translate }`. `translate(key)` for plain keys;
  `translate(key, params)` for `{{token}}` interpolation. Params type-checked and
  required; keys must be **string literals**.
- Locales: `de`, `en`, `fr`. **`de`** is the runtime/Storybook default; **`en`** is
  the fallback and the source the typed key map is generated from.
- Keys are nested objects in `src/locale/{en,de,fr}.json`, flattened to dot-paths.
  Every locale must define the **same keys with the same tokens** (a test enforces
  this). After editing locales, run **`pnpm gen:i18n`** to rewrite
  `src/i18n/generated.ts` (committed; a test fails if stale).
- The hook runs inside `<TranslationProvider locale=…>`, provided by the app, tests,
  and Storybook (which has a **Locale** toolbar).

### Styling
- **Tailwind v4** + DS tokens. `@hirslanden/ds/styles/tokens.css` (`--hds-*`) is
  imported globally in `main.tsx` and `.storybook/preview.tsx`. `src/index.css` maps
  tokens into Tailwind via `@theme inline`, exposing token-backed utilities:
  - Colours: `bg-primary`, `text-on-primary`, `text-text`, `text-muted`,
    `text-strong`, `bg-strong`, `bg-surface-subtle`, `border-border`, `bg-track`,
    `bg-primary-soft`, `bg-bg`, …
  - **Type scale: `text-xs(12) · text-sm(13) · text-md(14, body) · text-lg(22) ·
    text-xl(34) · text-2xl(42)`.** There is **no 30px token**, by decision (carried
    from step 2).
  - Shape: `rounded-sm`/`rounded-md` (both `0` — sharp/square), `shadow-card`
    (`none` — flat).
- Generic spacing/layout uses plain Tailwind utilities. Mobile-first; layer larger
  breakpoints with `sm:`/`md:`/`lg:`.

### DS primitives used by step 3 (verified against `packages/ds` source)
Reused from steps 1–2:
- `@hirslanden/ds/stepprogress` → `StepProgress({ current, total, label? })` —
  "Step X of Y" text + bar; `role="progressbar"` with `aria-valuenow/min/max`. Pass a
  **localized `label`** (auto-label is English).
- `@hirslanden/ds/overline` → `Overline({ children, as? })` — uppercase,
  letter-spaced, muted; store natural-case copy, CSS uppercases it.
- `@hirslanden/ds/heading` → `Heading({ level: 1|2|3, muted?, className?, ... })` —
  semantic `h1/h2/h3`; level 1 defaults to 42px. We override the visual size with a
  token utility + `!` (see §3).
- `@hirslanden/ds/text` → `Text({ as?: 'p'|'span', tone?: 'default'|'muted',
  size?: 'sm'|'md', ... })` — used `tone="muted"` for the description.
- `@hirslanden/ds/textlink` → `TextLink({ href?, leadingIcon?, trailingIcon?,
  onClick?, children })` — renders `<a>` if `href`, else `<button type="button">`.
- `@hirslanden/ds/icon` → `ArrowLeftIcon` (Back). `IconBase` sets `aria-hidden` when
  no `title`, so a bare `<ArrowLeftIcon />` is decorative by default.

**New for step 3** (verified signatures + render output):
- `@hirslanden/ds/input` → `Input(props: InputHTMLAttributes<HTMLInputElement> &
  { label: string })`, `forwardRef`. Renders
  `<div.wrapper><label htmlFor={id}>{label}</label><input id={id} {...rest}/></div>`,
  pairing `label`↔`input` via `useId` (id overridable). `label` is **required and
  always visible**. `...rest` (`type`, `inputMode`, `min`, `max`, `step`, `value`,
  `onInput`, `aria-*`, `data-testid`, …) is spread onto the inner `<input>`;
  `className` and `id` are destructured separately — `className` is **merged** with
  the input's own class (`styles.input`), not overwritten. No built-in helper/error slot.
- `@hirslanden/ds/button` → `Button({ variant?: 'primary'|'secondary' = 'primary',
  size?: 'md'|'lg' = 'md', ...ButtonHTMLAttributes })`, `forwardRef`. Renders a
  `<button type={type ?? 'button'} data-variant data-size {...rest}/>`. `primary` =
  azure `#0094d4` fill / white text; `lg` = 18px bold CTA. Inherits native
  `disabled`, `onClick`, `type`. **No icon slot** (see §3).
- `@hirslanden/ds/infocard` → `InfoCard({ label: string, children, ...HTMLAttributes
  })`. Renders `<Card variant="dashed"><Overline>{label}</Overline>
  <div.body>{children}</div></Card>`. Dashed border in `--hds-color-border-dashed`
  (#e7e4e2) — calm, **not** red. `...rest` (`role`, `aria-*`, `data-testid`, …) is
  spread onto the outer card `<div>`; `className` is destructured separately and
  **merged** with the card's own class (`styles.infoCard`).
- `@hirslanden/ds/icon` → `ArrowRightIcon` — the "→" on Continue; decorative
  (`aria-hidden`) by default (no `title`).

---

## 2. What step 3 is (from the screenshot)

`C:\Users\sil\Desktop\screenshots\step-3.png`. A single questionnaire screen inside
the same thin bordered panel, top to bottom:

1. Progress: **"Step 3 of 14"** + a thin bar filled ~3/14.
2. Overline: **ABOUT YOU** (a new section label).
3. Heading (question): **"How old are you?"**
4. A muted **description**: **"Your age helps calibrate risk — skin cancer incidence
   increases with cumulative UV exposure over time."**
5. A labelled **numeric input**: label **"Age"** above a narrow box.
6. A bottom action row: **"← Back"** text link (left) and a dark **"Continue →"**
   button (right) on the **same row**.

> The orange numbered circles (a "1" by Continue, a "2" by the input) are
> **design-review annotation pins, not UI** (same convention as steps 1–2). They are
> ignored as pixels but used as the **behavioural spec**:
> - **Pin 1 (Continue):** every other question auto-advances on tap; age is the
>   exception because a free-text number needs the user to finish typing, so an
>   explicit Continue is the only reliable "done" signal.
> - **Pin 2 (under-18):** when the entered age is under 18, the Continue button is
>   **replaced by a calm, bordered message** (not a red warning) to redirect gently;
>   the card height **stays the same** so the layout doesn't jump.

### Deltas from steps 1–2 (the whole design in one table)
| # | Aspect | Steps 1–2 | Step 3 (`Age`) |
|---|--------|-----------|----------------|
| 1 | Progress | `current = 1` / `2` | **`current = 3`** |
| 2 | Overline | "Warning signs" | **"About you"** |
| 3 | Answer control | `<fieldset>` of `OptionCard`s | **single numeric `Input`** |
| 4 | Forward nav | **auto-advance** on `onChange` | **explicit `Continue`** (`onContinue`) |
| 5 | Value type | answer `enum` | **`number`** (parsed age) |
| 6 | Conditional UI | none | **under-18 `InfoCard`** replaces Continue |
| 7 | Bottom row | Back only | **Back (left) + Continue/message (right)** |
| 8 | Heading size | `text-lg!` / `text-xl!` | **token utility, `text-xl!` tentative** (§3) |
| — | Everything else | frame, progress, overline, muted description, Back, controlled-only, test/story shape | **identical pattern** |

---

## 3. Decisions (confirmed with the maintainer)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Orange numbered pins | Annotation pins — **ignore as UI**; use as behaviour spec (§2) |
| 2 | Component / i18n name | **`Age`** (folder `steps/Age`, export `Age`, keys `steps.age.*`, testid `age`) |
| 3 | Control model | **Controlled-only**, numeric: `value?: number` + `onChange?(age?)` + `onContinue?()` + `onBack?()` |
| 4 | Heading size | **Snap to an existing type-scale token** (`text-xl!` tentative; final value picked against the wireframe in the Storybook pass) — no new token, no new abstraction |
| 5 | Validation + under-18 | **Disable-until-valid**: empty/non-numeric/non-integer/out-of-range → Continue shown but **disabled**; whole-year age `18–120` → Continue **enabled**; whole-year age `0–17` → Continue **replaced** by the message. Bounds `MIN_AGE = 0`, `MAX_AGE = 120`, `ADULT_AGE = 18` (whole years) |
| 6 | Under-18 message | **DS `InfoCard`** (dashed, calm), `role="status"`; sits in the Continue slot with a reserved row height so nothing jumps |
| 7 | Continue button | **DS `Button variant="primary" size="lg"`** (azure). The wireframe's dark fill is a grayscale-mock convention; rendered as the DS brand CTA. White-on-azure ≈ **3.39:1** recorded as the **same accepted brand-contrast deviation** (§6). No dark variant added |
| 8 | Continue arrow | Inline **`ArrowRightIcon`** in the button's children (decorative). DS `Button` has no icon slot → **`TODO(ds)`** flag (a trailing-icon CTA recurs; candidate to promote) |

### Why a numeric `value` + explicit `onContinue` (still controlled-only)
The parent stays the single source of truth: `onChange(age?)` fires on every edit so
the parent owns the typed number, and the input's text is derived from `value`
(`hasAge ? String(value) : ''`, NaN-safe) — no component-local answer state. Because
age can't auto-advance, forward navigation is a separate, explicit signal:
`onContinue()` fires only when a **valid adult** age is submitted. `onChange` carries
`undefined` whenever the field is empty or not a finite number, so "nothing entered"
is unambiguous.

### Why `text-xl!` (tentative) for the heading
Same rationale as step 2: the DS brand type scale (`…lg 22 · xl 34 · 2xl 42`) has no
30px token, so each step **selects its own existing token utility** inline — reusable
with zero new abstraction:
```tsx
<Heading level={1} className="text-xl!">{translate('steps.age.question')}</Heading>
```
`text-xl!` is the working assumption (matching step 2's prominence); the exact token
(`text-lg!` / `text-xl!`) is confirmed against the wireframe during the Storybook pass.

### Why DS `primary` (azure) for Continue
Consistent with the step-2 "snap to the DS, add nothing" precedent and the team's
documented stance that the brand tokens fall below AA **by design** (identical to live
hirslanden.ch). The wireframe's dark button is treated as a grayscale mock; the
rendered CTA is the brand azure. Its white-on-azure contrast (≈ 3.39:1, the same value
as the already-accepted azure link) is folded into the accepted brand-contrast
deviation rather than triggering a new dark variant.

### Why a `<form>` wraps the input + actions
Wrapping the field and the action row in a `<form noValidate>` whose `onSubmit`
guards on validity gives **Enter-to-submit** for free (keyboard users submit without
tabbing to Continue) and a single place to gate `onContinue`. `noValidate` suppresses
native number-validation bubbles since validity is handled in code. The Continue
button is `type="submit"`; Back is a `type="button"` `TextLink`, so it never submits.

---

## 4. Component design

### Location & name
`src/components/steps/Age/` — named export `Age`.
```
src/components/steps/Age/
  index.tsx          # the Age component
  Age.types.ts       # props (no enum — the answer is a number)
  Age.test.tsx       # unit test
  Age.stories.tsx    # Storybook story
```
No `hooks/`/`utils/` folders (no reusable logic; validity is a few derived booleans
inline). One **`TODO(ds)`**: `Button` has no trailing-icon slot (see §3 #8).

### Types (`Age.types.ts`)
```ts
export interface AgeProps {
  /** Controlled age in years; `undefined` = empty field or not a valid number. */
  value?: number;
  /** Fires on every edit with the parsed age (`undefined` when cleared/invalid). */
  onChange?: (age?: number) => void;
  /** Fires when Continue is activated with a valid adult age (click / Enter). */
  onContinue?: () => void;
  /** Fires when the "Back" link is activated. */
  onBack?: () => void;
  /** 1-based position of this step. Defaults to 3. */
  current?: number;
  /** Total number of steps. Defaults to 14. */
  total?: number;
}
```

### Behaviour (`index.tsx`)
Module constants: `DEFAULT_CURRENT = 3`, `DEFAULT_TOTAL = 14`, `MIN_AGE = 0`,
`MAX_AGE = 120`, `ADULT_AGE = 18`.

Derived (no state) from the controlled `value`:
```ts
const hasAge = typeof value === 'number' && Number.isFinite(value);  // controls the input's text
const isValidAge = hasAge && Number.isInteger(value) && value >= MIN_AGE && value <= MAX_AGE;
const isAdult = isValidAge && value >= ADULT_AGE;    // whole 18–120 → Continue enabled
const isUnderage = isValidAge && value < ADULT_AGE;  // whole 0–17 → message replaces Continue
```
- **Input change** (per keystroke): read `event.currentTarget.value`; empty string →
  `onChange?.(undefined)`; otherwise `const parsed = Number(raw)` →
  `onChange?.(Number.isNaN(parsed) ? undefined : parsed)`. The handler is inlined on
  the input's change event to keep the event type inferred (no `as`). Whether the
  reliable per-keystroke prop is `onInput` (chosen) or React-compat `onChange` is
  confirmed in the Storybook pass.
- **Submit** (`<form onSubmit>`): `preventDefault()`, then `if (isAdult) {
  onContinue?.(); }` — so Enter while empty/invalid/underage is a no-op.
- **Swap**: when `isUnderage`, render the `InfoCard`; otherwise render the Continue
  `Button` with `disabled={!isAdult}`. The action row reserves a **min-height equal to
  the InfoCard's rendered height** (measured in the Storybook pass) so the swap never
  changes the card height; both states **top-align** (`items-start`) so Back stays put.

### Composition (◆ = delta vs steps 1–2)
```tsx
<section data-testid="age"
         class="mx-auto max-w-2xl border border-border bg-bg p-6 sm:p-8">
  <StepProgress current={current} total={total}                     {/* ◆ current=3 */}
    label={translate('general.progress.stepOf', { current, total })} />

  <div class="mt-6" data-testid="age-overline">
    <Overline>{translate('steps.age.overline')}</Overline>           {/* ◆ "About you" */}
  </div>

  <div class="mt-2" data-testid="age-question">
    <Heading level={1} className="text-xl!">                         {/* ◆ tentative */}
      {translate('steps.age.question')}
    </Heading>
  </div>

  <div class="mt-2" data-testid="age-description">
    <Text tone="muted">{translate('steps.age.description')}</Text>
  </div>

  <form noValidate                                                    {/* ◆ new */}
        onSubmit={(event) => { event.preventDefault(); if (isAdult) { onContinue?.(); } }}>
    <div class="mt-6" data-testid="age-field">
      <Input
        label={translate('steps.age.label')}                         {/* ◆ "Age" */}
        type="number" inputMode="numeric" min={MIN_AGE} max={MAX_AGE} step={1}
        value={hasAge ? String(value) : ''}                          {/* controlled */}
        onInput={(event) => { /* parse → onChange(age | undefined) */ }}
        data-testid="age-input" className="w-24" />                   {/* narrow; final width in visual pass */}
    </div>

    <div class="mt-8 flex items-start justify-between gap-4 /* min-h reserved to InfoCard */"
         data-testid="age-actions">
      <TextLink leadingIcon={<ArrowLeftIcon />} onClick={onBack}>
        {translate('steps.age.back')}
      </TextLink>

      {isUnderage ? (                                                 {/* ◆ swap */}
        <InfoCard label={translate('steps.age.underage.label')}
                  role="status" data-testid="age-underage" className="max-w-xs">
          {translate('steps.age.underage.body')}
        </InfoCard>
      ) : (
        <Button type="submit" variant="primary" size="lg"            {/* ◆ azure CTA */}
                disabled={!isAdult} data-testid="age-continue">
          {translate('steps.age.continue')} <ArrowRightIcon />
        </Button>
      )}
    </div>
  </form>
</section>
```
Exact vertical spacing, the heading token, the input width, and the reserved
action-row height are finalised against the screenshot during the Storybook pass (§7).

---

## 5. i18n

New namespace **`steps.age.*`** added to **all three** `src/locale/{en,de,fr}.json`,
then `pnpm gen:i18n` regenerates `src/i18n/generated.ts`. `general.progress.stepOf`
already exists (reused). **No `{{token}}` interpolation** in any new key, so all three
locales stay trivially token-compatible.

### English (source)
| Key | en |
|-----|----|
| `steps.age.overline` | About you |
| `steps.age.question` | How old are you? |
| `steps.age.description` | Your age helps calibrate risk — skin cancer incidence increases with cumulative UV exposure over time. |
| `steps.age.label` | Age |
| `steps.age.continue` | Continue |
| `steps.age.back` | Back |
| `steps.age.underage.label` | A note on age |
| `steps.age.underage.body` | This screening is designed for adults (18 or older). If you're under 18 and concerned about your skin, please talk to a parent, guardian, or doctor. |

### German (`de`) — first pass, formal "Sie"
- `overline`: "Zu Ihrer Person"
- `question`: "Wie alt sind Sie?"
- `description`: "Ihr Alter hilft, das Risiko einzuschätzen – die Häufigkeit von
  Hautkrebs steigt mit der über die Jahre angesammelten UV-Belastung."
- `label`: "Alter"
- `continue`: "Weiter"
- `back`: "Zurück"
- `underage.label`: "Hinweis zum Alter"
- `underage.body`: "Diese Vorsorge ist für Erwachsene ab 18 Jahren gedacht. Wenn Sie
  noch nicht 18 sind und sich Sorgen um Ihre Haut machen, sprechen Sie bitte mit einem
  Elternteil, einer Bezugsperson oder einer Ärztin oder einem Arzt."

### French (`fr`) — first pass
- `overline`: "À propos de vous"
- `question`: "Quel âge avez-vous ?"
- `description`: "Votre âge aide à évaluer le risque — l'incidence du cancer de la
  peau augmente avec l'exposition cumulée aux UV au fil du temps."
- `label`: "Âge"
- `continue`: "Continuer"
- `back`: "Retour"
- `underage.label`: "Une remarque sur l'âge"
- `underage.body`: "Ce dépistage est destiné aux adultes (18 ans ou plus). Si vous avez
  moins de 18 ans et que votre peau vous inquiète, parlez-en à un parent, à un adulte
  de confiance ou à un médecin."

> **Copy flagged for native-speaker review.** The de/fr strings are a first pass
> (already incorporating the verification's wording fixes: fr "évaluer le risque"
> aligned with de "einschätzen"; fr "adulte de confiance" for "guardian"; fr note
> label "Une remarque sur l'âge" so it doesn't echo the overline; de restored
> "Elternteil, einer Bezugsperson"). The under-18 message keeps the formal
> **"Sie"/"vous"** register for consistency with the rest of the tool even though it
> addresses a younger visitor — a reviewer may prefer a warmer informal register
> there. No tokens are used, so locales stay token-compatible regardless of wording.

---

## 6. Accessibility (WCAG 2.1 AA — blocker if violated)

- **Labelled input:** DS `Input` renders a visible `<label>` paired to the `<input>`
  via `useId` (`htmlFor`/`id`). `type="number"` + `inputMode="numeric"` gives the
  numeric keypad on mobile; `min`/`max`/`step` express the valid range (whole years).
- **Continue:** native `disabled` when not a valid adult, so AT announces it as
  unavailable; the `<form>` gives Enter-to-submit, guarded so empty/invalid/underage
  Enter is inert. The `ArrowRightIcon` is decorative (`aria-hidden`); the visible
  "Continue" text is the accessible name.
- **Under-18 message:** the `InfoCard` carries `role="status"` (implicit
  `aria-live="polite"`) so its appearance is announced without stealing focus. Because
  it is conditionally **mounted**, announcement-on-insert is verified in the a11y pass;
  if any target SR is unreliable, the fallback is a persistent live-region container
  whose contents toggle (kept out of the first pass for simplicity).
- **Disable-until-valid & error identification (manual SCs):** `type="number"` blocks
  most non-numeric entry; any detected-invalid input that remains (out-of-range or
  non-integer) silently keeps Continue disabled with **no error text** — matching the
  wireframe, which shows no error affordance. axe does **not** cover WCAG **3.3.1 Error
  Identification (A)** / **3.3.3 Error Suggestion (AA)**, so the axe gate below doesn't
  substantiate them; this is recorded as an accepted, documented usability trade-off
  (the under-18 case is already explained by the `InfoCard`). If the a11y pass shows
  it's warranted, the lightweight remedy is an `aria-describedby` hint on the input
  (e.g. "Enter your age in whole years").
- **No layout shift:** the reserved action-row height keeps the panel height constant
  across the Continue↔message swap (also avoids a reflow surprise for AT users).
- `StepProgress` provides a named `role="progressbar"`; the back `ArrowLeftIcon` is
  decorative with the visible "Back" text as its accessible name.
- **Keyboard order:** DOM order is input → Back → Continue (matching the visual
  left-to-right reading order); visible focus ring from the DS primitives; Enter
  submits, Space/Enter activate the buttons.
- **Accepted brand-contrast deviation (maintainer decision, carried from steps 1–2):**
  axe will still flag `color-contrast` on muted text `--hds-color-muted` #938880
  (3.45:1) and the azure `--hds-color-primary` #0094d4 (3.39:1). Step 3 adds **one
  more instance of the same azure deviation**: the Continue CTA renders white text on
  the azure fill — contrast is symmetric, so this is the **same 3.39:1** brand value,
  identical to live hirslanden.ch. (The 18px-bold `lg` button is just under the WCAG
  "large text" threshold of 14pt-bold ≈ 18.66px, so the 4.5:1 normal-text threshold
  applies and axe flags the **enabled** Continue; the disabled state is exempt.) The
  step-3 axe gate is therefore **zero AA violations except this accepted brand-contrast
  deviation**.

---

## 7. Testing & verification

### Unit (`Age.test.tsx`) — per `CLAUDE.md`
- Mock `@root/src/i18n` so `translate(key) → key`; assert on **keys**, not copy.
- Mock every DS primitive with minimal stand-ins, forwarding only what tests need:
  `StepProgress`, `Overline`, `Heading`, `Text`, `Input` (renders `{label}` + an
  `<input data-testid="age-input" value onInput>`), `Button` (renders
  `<button data-testid="age-continue" disabled type>{children}`; Continue is
  submit-driven — **no** `onClick`), `InfoCard` (renders
  `<div data-testid="age-underage" role>{label}{children}</div>`), `TextLink`
  (→ `data-testid="ds-back"`), `ArrowLeftIcon`/`ArrowRightIcon` (→ decorative `<svg>`).
- Target by `data-testid`. Cases:
  1. progress renders the localized label key and `3` / `14`;
  2. overline, question, description keys render;
  3. the input **label key** (`steps.age.label`) renders;
  4. typing a number fires `onChange(parsed)` (e.g. `'30'` → `30`);
  5. clearing the field fires `onChange(undefined)`;
  6. `value` empty/undefined → Continue is **present and disabled**, no message;
  7. `value = 30` → Continue **enabled**; activating it fires `onContinue` via the
     `<form>` submit (Continue is `type="submit"`, not wired through `onClick`);
  8. `value = 15` → `age-underage` (with `role="status"`) is shown, **no** Continue;
  9. `value = 200` (out of range) → Continue present and **disabled**, no message;
  10. clicking Back fires `onBack`;
  11. controlled — the input reflects `value` (shows `"30"`; `""` when `undefined`);
  12. submit guard — with `value = 15` (or `undefined`), `fireEvent.submit(form)` does
      **not** call `onContinue`;
  13. `value = 18.5` (non-integer) → Continue present and **disabled**, no message.

### Story (`Age.stories.tsx`)
- CSF3, `Meta`/`StoryObj` from `@storybook/react-vite`, title `Steps/Age`.
- `Default` (interactive; story owns `value` via `useState<number | undefined>`, wires
  `onChange`/`onContinue`) so the disable→enable→under-18 transitions are typeable;
  `Adult` (`value: 30`, enabled Continue); `Underage` (`value: 15`, message shown).
- Story ids: `steps-age--default`, `steps-age--adult`, `steps-age--underage`.

### Browser / visual / a11y (Playwright MCP, Storybook on :6007)
`http://localhost:6007/iframe.html?id=steps-age--default&viewMode=story&globals=locale:en`
(and `…--adult`, `…--underage`).
- Screenshot at **375×812** (mobile) and **1440×900** (desktop); must look right at
  both, mobile-first. Use this pass to **finalise** the heading token, the vertical
  spacing, the input width, and the reserved action-row height (confirm the
  Continue↔message swap causes **no** height jump).
- Inject **axe-core** and assert **zero AA violations except the accepted
  brand-contrast deviation** (§6); confirm roles/names via `browser_snapshot`
  (labelled number input, `progressbar`, `status` region); verify keyboard operability
  (Tab order input→Back→Continue, visible focus, Enter submits when valid and is inert
  otherwise).
- Reconcile against `https://www.hirslanden.ch/de/corporate/home.html` (buttons,
  inputs, headings, type/spacing/colour) so the widget doesn't look out of place — in
  particular confirm the azure `lg` CTA matches the site's primary buttons.

### Definition of done
- [ ] Folder/files per `CLAUDE.md`; named export `Age`.
- [ ] Reuses DS primitives; the missing trailing-icon slot is flagged `TODO(ds)`.
- [ ] No hardcoded user-facing strings (keys in all three locales + `pnpm gen:i18n`
      re-run; `generated.ts` updated).
- [ ] Tailwind + `--hds-*` token utilities only (token heading size; azure CTA);
      mobile-first; renders its own frame.
- [ ] Controlled-only: numeric `value` drives the input + the disable/under-18 logic;
      no component-local answer state.
- [ ] Unit tests follow conventions (keys not copy, deps mocked incl. `Input`/`Button`/
      `InfoCard`, `data-testid`).
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` green.
- [ ] Playwright/Storybook: looks right at 375×812 and 1440×900; no height jump on the
      under-18 swap; zero AA violations except the accepted brand-contrast deviation;
      not out of place vs hirslanden.ch.

---

## 8. Out of scope / assumptions
- Steps 1–2 and 4–14, the final report, scoring, and the wizard shell that wires steps
  together and owns navigation/persistence. Steps 1–2 are **not** modified.
- Where "Back"/"Continue" lead is a wiring concern; here they are rendered per the
  screenshot and exposed via `onBack`/`onContinue`.
- The under-18 threshold is **18**; valid ages are **whole years 0–120** (non-integer
  or out-of-range input keeps Continue disabled rather than showing the under-18
  message).
- German/French copy is a first-pass translation, flagged for native review; the
  under-18 message register (formal "Sie"/"vous") is flagged too.
- Recurring nav labels (`back`/`continue`) stay **per-step** to match the existing
  convention; promoting them to shared `general.buttons.*` keys is a future cross-step
  cleanup, out of scope here.
- The wireframe's dark Continue button is intentionally rendered as the DS azure
  `primary` CTA (§3 #7); the ~30px-looking H1 snaps to an existing token (§3 #4).
- Heading token, vertical spacing, input width, and reserved action-row height are
  finalised in the Storybook pass (§7).

## 9. Git
Per the maintainer's standing instruction, **nothing is committed or pushed**. This
doc and all code are left in the working tree for review. (Deviates from the
brainstorming skill's "commit the design doc" step, which the user's instruction
overrides.)
