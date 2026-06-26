# Step 2 — "Previous diagnosis" — Design

**Date:** 2026-06-25
**App:** `@hirslanden/skin-cancer-screening` (`apps/skin-cancer-screening`)
**Scope:** Step 2 of a 14-step skin-cancer-risk questionnaire. Only step 2 is in
scope here; steps 1 and 3–14, the final report, scoring, and the wizard shell that
wires steps together are out of scope and built later with separate prompts. Steps
are authored standalone and wired into a flow at the end.

This step deliberately **mirrors step 1 (`WarningSigns`)**; the design is expressed
mostly as the small set of intentional deltas from step 1. The full tech-stack map
lives in `2026-06-24-warning-signs-step-design.md` §1 — a condensed, step-2-relevant
copy is repeated below so this doc is self-contained.

---

## 1. Project & tech-stack map (grounding)

Findings from inspecting the app and the design system, recorded so the
implementation plan (and future per-step prompts) have a precise reference.

### Framework & tooling
- **Preact 10** app. JSX preconfigured (`jsxImportSource: "preact"`); no React
  import. Hooks from `preact/hooks`.
- `react`/`react-dom` aliased to `preact/compat` across tsconfig, Vite, Vitest, and
  Storybook, so React-authored DS primitives "just work".
- **Vite** dev/build, **Vitest + @testing-library/preact** (jsdom, globals on),
  **Storybook 10** on port **6007** (`@storybook/addon-docs`, `@storybook/addon-a11y`),
  **Biome** for lint/format.
- **Path alias `@root`** → app root (tsconfig `@root/*`, Vite, Vitest,
  `.storybook/main.ts`). Use `@root/src/...` for intra-app imports; DS imports stay
  package-scoped (`@hirslanden/ds/<subpath>`).
- DS consumed as a workspace package via the `source` export condition (DS source is
  compiled directly — no build step between packages).

### Biome / `CLAUDE.md` rules that affect authoring
- Single quotes, **semicolons always**, 2-space indent, line width 100,
  organize-imports on. `src/i18n/generated.ts` is excluded from formatting.
- Brace all control statements; no conditional object spreads; avoid `as`; no `any`
  (use `unknown` + guards); **prefer `enum`s over bare string comparisons**; JSDoc on
  every shared/scoped util; comments are a last resort.

### Steps are controlled-only (`CLAUDE.md`, authoritative)
A step never owns its answer state — the parent flow does. Expose a `value` prop
(optional; `undefined` = nothing selected) and an `onChange` callback, and drive the
UI purely from `value`. **No `defaultValue`, no component-local answer `useState`.**
> The step-1 *spec* still describes an older controlled/uncontrolled pattern with
> `defaultValue` + internal state; the shipped step-1 *code* is controlled-only.
> Step 2 follows the shipped code + this rule.

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
  - Colours: `bg-primary`, `text-primary`, `text-text`, `text-muted`, `text-strong`,
    `bg-surface-subtle`, `border-border`, `bg-track`, `bg-primary-soft`, `bg-bg`, …
  - **Type scale (unchanged): `text-xs(12) · text-sm(13) · text-md(14, body) ·
    text-lg(22) · text-xl(34) · text-2xl(42)`.** There is **no 30px token**, by
    decision (see §3).
  - Shape: `rounded-sm`/`rounded-md` (both `0` — sharp/square), `shadow-card`
    (`none` — flat).
- Generic spacing/layout uses plain Tailwind utilities. Mobile-first; layer larger
  breakpoints with `sm:`/`md:`/`lg:`.

### DS primitives used by step 2 (verified APIs)
- `@hirslanden/ds/stepprogress` → `StepProgress({ current, total, label? })` —
  "Step X of Y" text + bar; `role="progressbar"` with `aria-label` +
  `aria-valuenow/min/max/valuetext`. Pass a **localized `label`** (auto-label is
  English).
- `@hirslanden/ds/overline` → `Overline({ children, as? })` — uppercase,
  letter-spaced, muted; store natural-case copy and let CSS uppercase it.
- `@hirslanden/ds/heading` → `Heading({ level: 1|2|3, muted?, className?, ... })` —
  semantic `h1/h2/h3`; level 1 defaults to 42px. We override the visual size with a
  token utility + `!` (see §3).
- `@hirslanden/ds/text` → `Text({ as?: 'p'|'span', tone?: 'default'|'muted',
  size?: 'sm'|'md', ... })` — defaults `as="p"`, `tone="default"`, `size="md"`.
  Step 2 uses `tone="muted"` for the new description paragraph. **(New for step 2;
  step 1 had no description.)**
- `@hirslanden/ds/optiongroup` → `OptionCard({ value, title, description?, media?,
  selected?, onClick?, ... })`. **Standalone** (outside `OptionGroup`) it renders a
  `<button>` with `aria-pressed` reflecting `selected` and passes through `onClick` —
  the control we want. Selected → border + `bg-primary-soft` wash; hover → primary
  border; focus-visible → 2px outline.
- `@hirslanden/ds/textlink` → `TextLink({ href?, leadingIcon?, trailingIcon?,
  onClick?, children })` — `<a>` if `href`, else `<button type="button">`.
- `@hirslanden/ds/icon` → named icon components; step 2 uses `ArrowLeftIcon`
  (decorative, `aria-hidden`).

---

## 2. What step 2 is (from the screenshot)

`C:\Users\sil\Desktop\screenshots\step-2.png`. A single questionnaire screen inside
a thin bordered panel, top to bottom:

1. Progress: **"Step 2 of 14"** + a thin bar filled ~2/14.
2. Overline: **WARNING SIGNS** (same section label as step 1).
3. Heading (question), visibly larger than step 1's: **"Have you previously been
   diagnosed with any form of skin cancer?"**
4. A muted **description** paragraph (new — step 1 had none): **"Includes melanoma,
   basal cell carcinoma (BCC), squamous cell carcinoma (SCC), or any precancerous
   skin lesion removed by a doctor."**
5. **Two** selectable cards (bold title + muted description):
   - **Yes** — "I've been diagnosed with skin cancer or had a precancerous lesion
     removed."
   - **No** — "I haven't been diagnosed with any form of skin cancer."
6. A **"← Back"** text link.

> The orange numbered circles (a "2" near the top-right, a "1" near the first card)
> are **design-review annotation pins, not UI** — confirmed with the maintainer.
> They are ignored (same as step 1).

### Deltas from step 1 (the whole design in one table)
| # | Aspect | Step 1 (`WarningSigns`) | Step 2 (`PreviousDiagnosis`) |
|---|--------|-------------------------|------------------------------|
| 1 | Progress | `current = 1` | **`current = 2`** |
| 2 | Heading size | `text-lg!` (22px) | **`text-xl!` (34px)** |
| 3 | Description | none | **new muted `Text` paragraph** |
| 4 | Options | three (Yes/No/Unsure) | **two (Yes/No)** |
| — | Everything else | frame, overline, fieldset/legend, Back link, controlled-only, test/story shape | **identical pattern** |

---

## 3. Decisions (confirmed with the maintainer)

| # | Decision | Choice |
|---|----------|--------|
| 1 | Orange numbered badges | Annotation pins — **ignore** |
| 2 | Component / i18n name | **`PreviousDiagnosis`** (maintainer delegated the choice; mirrors "previously been diagnosed") |
| 3 | H1 = 30px in screenshot vs DS type scale | **Snap to existing `text-xl!` (34px)** — keep DS scale at 22/34/42, add **no** new token and **no** new component |
| 4 | Control model | **Controlled-only**, mirroring shipped step 1 + `CLAUDE.md` |
| 5 | Options grouping | **`<fieldset>` of standalone `OptionCard`s** (mirror shipped step 1), **not** the DS `OptionGroup` radiogroup |

### Why `text-xl!` for the heading
The screenshot's H1 reads ~30px, but the DS brand type scale (tuned to hirslanden.ch)
is `…lg 22 · xl 34 · 2xl 42` — there is no 30px token. The maintainer chose to keep
the scale untouched and snap to the nearest existing token, **`text-xl` (34px)**,
applied inline the same way step 1 applies `text-lg!`:
```tsx
<Heading level={1} className="text-xl!">{translate('steps.previousDiagnosis.question')}</Heading>
```
This keeps "different size per step" **reusable with zero new abstraction** — each
step simply selects its own existing token utility. (Accepted trade-off: rendered H1
is 34px, slightly larger than the 30px mock.)

### Why a `<fieldset>` of standalone `OptionCard`s (not `OptionGroup`)
Forward navigation is **auto-advance on select** (the parent reacts to `onChange`;
there is no "Next" button). Buttons fit that better than a radio group:
- A `<button>` that advances on activation is expected behaviour → no WCAG 2.1
  **3.2.2 (On Input)** "change-on-input" violation, unlike a radio whose *selection*
  triggers a context change.
- Radio arrow-key roving both moves and selects, so under auto-advance a keyboard
  user would advance on every arrow press. With buttons, **Tab** moves and
  **Enter/Space/click** activates — exploring never accidentally advances.
- We still reuse the DS `OptionCard` (standalone) for identical styling; the
  previously chosen answer is re-highlighted via `selected` on return.

This matches the shipped step 1 exactly.

---

## 4. Component design

### Location & name
`src/components/steps/PreviousDiagnosis/` — named export `PreviousDiagnosis`.
```
src/components/steps/PreviousDiagnosis/
  index.tsx                       # the PreviousDiagnosis component
  PreviousDiagnosis.types.ts      # enum + props
  PreviousDiagnosis.test.tsx      # unit test
  PreviousDiagnosis.stories.tsx   # Storybook story
```
No `hooks/`/`utils/` folders (no reusable logic). No missing DS primitive →
**no `TODO(ds)`**.

### Types (`PreviousDiagnosis.types.ts`)
```ts
/** The answer to the step-2 "previous diagnosis" question. */
export enum PreviousDiagnosisAnswer {
  Yes = 'yes',
  No = 'no',
}

export interface PreviousDiagnosisProps {
  /** Controlled selected answer; `undefined` means no card is selected yet. */
  value?: PreviousDiagnosisAnswer;
  /** Fires when an answer is chosen — the auto-advance signal for the parent flow. */
  onChange?: (answer: PreviousDiagnosisAnswer) => void;
  /** Fires when the "Back" link is activated. */
  onBack?: () => void;
  /** 1-based position of this step. Defaults to 2. */
  current?: number;
  /** Total number of steps. Defaults to 14. */
  total?: number;
}
```

### Behaviour (`index.tsx`)
- **Controlled-only**: no internal answer state. Each `OptionCard`'s `selected` is
  `value === PreviousDiagnosisAnswer.X`; its `onClick` calls
  `onChange?.(PreviousDiagnosisAnswer.X)`. Selection follows the `value` the parent
  passes back; in isolation (Storybook/tests) the card highlights only when the
  parent updates `value`.
- Module constants `DEFAULT_CURRENT = 2`, `DEFAULT_TOTAL = 14`, overridable via props.

### Composition (mirrors shipped step 1; ◆ = delta)
```tsx
<section data-testid="previous-diagnosis"
         class="mx-auto max-w-2xl border border-border bg-bg p-6 sm:p-8">
  <StepProgress current={current} total={total}                    {/* ◆ current=2 */}
    label={translate('general.progress.stepOf', { current, total })} />

  <div class="mt-6" data-testid="previous-diagnosis-overline">
    <Overline>{translate('steps.previousDiagnosis.overline')}</Overline>
  </div>

  <div class="mt-2" data-testid="previous-diagnosis-question">
    <Heading level={1} className="text-xl!">                        {/* ◆ 34px */}
      {translate('steps.previousDiagnosis.question')}
    </Heading>
  </div>

  <div class="mt-2" data-testid="previous-diagnosis-description">   {/* ◆ new */}
    <Text tone="muted">{translate('steps.previousDiagnosis.description')}</Text>
  </div>

  <fieldset data-testid="previous-diagnosis-options"
            class="mt-6 flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="sr-only">{translate('steps.previousDiagnosis.question')}</legend>
    <OptionCard value={PreviousDiagnosisAnswer.Yes}                 {/* ◆ two only */}
      title={translate('steps.previousDiagnosis.options.yes.title')}
      description={translate('steps.previousDiagnosis.options.yes.description')}
      selected={value === PreviousDiagnosisAnswer.Yes}
      onClick={() => onChange?.(PreviousDiagnosisAnswer.Yes)} />
    <OptionCard value={PreviousDiagnosisAnswer.No}
      title={translate('steps.previousDiagnosis.options.no.title')}
      description={translate('steps.previousDiagnosis.options.no.description')}
      selected={value === PreviousDiagnosisAnswer.No}
      onClick={() => onChange?.(PreviousDiagnosisAnswer.No)} />
  </fieldset>

  <div class="mt-8">
    <TextLink leadingIcon={<ArrowLeftIcon />} onClick={onBack}>
      {translate('steps.previousDiagnosis.back')}
    </TextLink>
  </div>
</section>
```
Exact vertical spacing (`mt-2` under the question before the description vs the
options' `mt-6`) is finalised against the screenshot during the Storybook pass (§7).

---

## 5. i18n

New namespace **`steps.previousDiagnosis.*`** added to **all three**
`src/locale/{en,de,fr}.json`, then `pnpm gen:i18n` regenerates
`src/i18n/generated.ts`. `general.progress.stepOf` already exists (reused). The
overline reuses the natural-case copy "Warning signs" as its own key (step 2 stays
standalone; the value duplicates step 1's section label by design).

### English (source)
| Key | en |
|-----|----|
| `steps.previousDiagnosis.overline` | Warning signs |
| `steps.previousDiagnosis.question` | Have you previously been diagnosed with any form of skin cancer? |
| `steps.previousDiagnosis.description` | Includes melanoma, basal cell carcinoma (BCC), squamous cell carcinoma (SCC), or any precancerous skin lesion removed by a doctor. |
| `steps.previousDiagnosis.options.yes.title` | Yes |
| `steps.previousDiagnosis.options.yes.description` | I've been diagnosed with skin cancer or had a precancerous lesion removed. |
| `steps.previousDiagnosis.options.no.title` | No |
| `steps.previousDiagnosis.options.no.description` | I haven't been diagnosed with any form of skin cancer. |
| `steps.previousDiagnosis.back` | Back |

### German (`de`) — first pass, formal "Sie"
- `overline`: "Warnzeichen"
- `question`: "Wurde bei Ihnen jemals eine Form von Hautkrebs diagnostiziert?"
- `description`: "Dazu zählen Melanom, Basalzellkarzinom (BCC), Plattenepithelkarzinom
  (SCC) oder eine von einer Ärztin oder einem Arzt entfernte Hautkrebsvorstufe."
- `options.yes.title`: "Ja"; `.description`: "Bei mir wurde Hautkrebs diagnostiziert
  oder eine Krebsvorstufe entfernt."
- `options.no.title`: "Nein"; `.description`: "Bei mir wurde noch nie eine Form von
  Hautkrebs diagnostiziert."
- `back`: "Zurück"

### French (`fr`) — first pass
- `overline`: "Signes d'alerte"
- `question`: "Un cancer de la peau, quelle qu'en soit la forme, vous a-t-il déjà été
  diagnostiqué ?"
- `description`: "Cela inclut le mélanome, le carcinome basocellulaire (CBC), le
  carcinome épidermoïde (CE) ou toute lésion cutanée précancéreuse retirée par un
  médecin."
- `options.yes.title`: "Oui"; `.description`: "On m'a diagnostiqué un cancer de la
  peau ou retiré une lésion précancéreuse."
- `options.no.title`: "Non"; `.description`: "Aucune forme de cancer de la peau ne m'a
  été diagnostiquée."
- `back`: "Retour"

> **Clinical copy — flagged for native-speaker review.** The German/French medical
> terminology (melanoma / BCC / SCC equivalents) is a first pass. The English BCC/SCC
> abbreviations are kept in parentheses for recognisability; a reviewer may prefer
> localized abbreviations (e.g. fr "CBC"/"CE"). No `{{token}}` interpolation is used
> in any of these keys, so all three locales stay token-compatible.

---

## 6. Accessibility (WCAG 2.1 AA — blocker if violated)

- The options are grouped by a native `<fieldset>` + sr-only `<legend>` carrying the
  question, so AT announces the question as the group's label.
- Answers are `<button>`s (standalone `OptionCard`): Tab/Shift+Tab order, visible 2px
  focus ring, Enter/Space activation — all from the DS primitive.
- Auto-advance is triggered by button activation (an actuator), satisfying **3.2.2
  (On Input)**; "Back" makes the flow reversible.
- The new description is a plain `<p>` (DS `Text`), read in document order after the
  heading; no interactive semantics needed.
- `StepProgress` provides a named `role="progressbar"`; the back `ArrowLeftIcon` is
  decorative (`aria-hidden`) with the visible "Back" text as the accessible name.
- **Accepted brand-contrast deviation (carried from step 1, maintainer decision):**
  axe will still flag `color-contrast` on muted text `--hds-color-muted` #938880
  (3.45:1) and the azure link `--hds-color-primary` #0094d4 (3.39:1). These are the
  official Hirslanden brand values (identical on live hirslanden.ch) and are kept
  as-is — recorded as an accepted, documented brand-level deviation, **not** a
  component defect. The step-2 gate is therefore **zero AA violations except this
  accepted brand-contrast deviation**.

---

## 7. Testing & verification

### Unit (`PreviousDiagnosis.test.tsx`) — per `CLAUDE.md`
- Mock `@root/src/i18n` so `translate(key) → key`; assert on **keys**, not copy.
- Mock every DS primitive with minimal stand-ins (incl. **`@hirslanden/ds/text`** —
  new vs step 1): `StepProgress`, `Overline`, `Heading`, `Text`, `OptionCard`,
  `TextLink`, `ArrowLeftIcon`.
- Target by `data-testid`. Cases:
  1. progress renders the localized label key and `2` / `14`;
  2. overline + question keys render;
  3. **description key renders** (new);
  4. both option keys (title + description) render;
  5. clicking an option calls `onChange(PreviousDiagnosisAnswer.X)`;
  6. clicking Back calls `onBack`;
  7. controlled `value` reflects as the selected card (`aria-pressed`);
  8. controlled — clicking does **not** self-select without a `value` change.

### Story (`PreviousDiagnosis.stories.tsx`)
- CSF3, `Meta`/`StoryObj` from `@storybook/react-vite`, title
  `Steps/PreviousDiagnosis`. `Default` (interactive; story owns `value` via
  `useState`, mirroring step 1) and `Preselected` (`value: No`).
- Story id for the iframe: `steps-previousdiagnosis--default`.

### Browser / visual / a11y (Playwright MCP, Storybook on :6007)
`http://localhost:6007/iframe.html?id=steps-previousdiagnosis--default&viewMode=story&globals=locale:en`
- Screenshot at **375×812** (mobile) and **1440×900** (desktop); must look right at
  both, mobile-first.
- Inject **axe-core** and assert **zero AA violations except the accepted
  brand-contrast deviation** (§6); confirm roles/names via `browser_snapshot`; verify
  keyboard operability (Tab order Yes→No→Back, visible focus, Enter/Space) and that
  the 34px heading + muted description read correctly.
- Reconcile against `https://www.hirslanden.ch/de/corporate/home.html` (buttons,
  cards, headings, type/spacing/colour) so the widget doesn't look out of place.

### Definition of done
- [ ] Folder/files per `CLAUDE.md`; named export `PreviousDiagnosis`.
- [ ] Reuses DS primitives; no hardcoded user-facing strings (keys in all three
      locales + `pnpm gen:i18n` re-run; `generated.ts` updated).
- [ ] Tailwind + `--hds-*` token utilities only (`text-xl!` heading); mobile-first;
      renders its own frame.
- [ ] Unit tests follow conventions (keys not copy, deps mocked incl. `Text`,
      `data-testid`).
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` green.
- [ ] Playwright/Storybook: looks right at 375×812 and 1440×900; zero AA violations
      except the accepted brand-contrast deviation; not out of place vs hirslanden.ch.

---

## 8. Out of scope / assumptions
- Steps 1 and 3–14, the final report, scoring, and the wizard shell that wires steps
  together and owns navigation/persistence. Step 1 is **not** modified.
- "Back" on the real second step (where it leads) is a wiring concern; here it is
  rendered per the screenshot and exposed via `onBack`.
- German/French copy is a first-pass translation, flagged for native review.
- The screenshot's ~30px H1 is intentionally rendered at the DS `xl` token (34px)
  per the maintainer's decision (§3).

## 9. Git
Per maintainer preference, **nothing is committed or pushed**. This doc and all code
are left in the working tree for review. (Deviates from the brainstorming skill's
"commit the design doc" step, which the user's standing instruction overrides.)
