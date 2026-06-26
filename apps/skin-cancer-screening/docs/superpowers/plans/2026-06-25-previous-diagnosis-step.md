# Step 2 — "Previous diagnosis" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build step 2 of the skin-cancer questionnaire — a standalone, controlled-only `PreviousDiagnosis` component ("Have you previously been diagnosed with any form of skin cancer?") with Yes/No option cards, mirroring the shipped step-1 `WarningSigns`.

**Architecture:** A single Preact component under `src/components/steps/PreviousDiagnosis/` composed from `@hirslanden/ds` primitives (`StepProgress`, `Overline`, `Heading`, `Text`, `OptionCard`, `TextLink`, `ArrowLeftIcon`). It renders its own bordered frame, is purely controlled (`value` + `onChange`/`onBack`), and routes all copy through the i18n layer. Four deltas from step 1: progress `current=2`, heading `text-xl!` (34px), a new muted description paragraph, and two options instead of three.

**Tech Stack:** Preact 10, `@hirslanden/ds` (React-authored, consumed via `preact/compat`), Tailwind v4 + `--hds-*` tokens, Vitest + `@testing-library/preact`, Storybook 10 (port 6007), Biome, typed i18n (`pnpm gen:i18n`).

## Global Constraints

Every task implicitly includes these (values copied verbatim from the spec / `CLAUDE.md`):

- **NO GIT.** Do not `git add`/`commit`/`push`/branch. Each task ends with a **Checkpoint** that runs verification and leaves changes in the working tree for the maintainer.
- **Run all commands from `apps/skin-cancer-screening`.**
- **Controlled-only:** no `defaultValue`, no component-local answer `useState`. Drive selection purely from `value`.
- **Component structure:** own PascalCase folder `src/components/steps/PreviousDiagnosis/`; files `index.tsx` (named export `PreviousDiagnosis` matching the folder), `PreviousDiagnosis.types.ts`, `PreviousDiagnosis.test.tsx`, `PreviousDiagnosis.stories.tsx`.
- **Imports:** intra-app via `@root/src/...`; DS via package subpaths `@hirslanden/ds/<subpath>`. No relative `../` chains.
- **Styling:** Tailwind + `--hds-*` token utilities only. Heading size = `text-xl!` (existing 34px token). No new tokens, no arbitrary values, no hardcoded brand hex/px. Mobile-first. DS type scale stays 22/34/42.
- **Coding style:** semicolons always; single quotes; brace all control statements; no conditional object spreads; no `as`; no `any`; **prefer `enum`s**; comments are a last resort; JSDoc only on shared/scoped utils (none here).
- **i18n:** no hardcoded user-facing strings — every string via `translate('steps.previousDiagnosis.…')` with **string-literal** keys. Keys added to **all three** `src/locale/{en,de,fr}.json` with identical key trees and identical `{{token}}` sets (none used here), then `pnpm gen:i18n` re-run (a test fails if `src/i18n/generated.ts` is stale).
- **Tests:** mock the i18n layer (`translate(key) => key`) and every DS primitive; assert on **keys**, not copy; target by `data-testid`.
- **a11y gate (WCAG 2.1 AA):** zero AA violations **except** the accepted brand-contrast deviation carried from step 1 (muted text `#938880` 3.45:1, azure link `#0094d4` 3.39:1 — official brand values, kept as-is).
- **Spec:** `docs/superpowers/specs/2026-06-25-previous-diagnosis-step-design.md`.

---

### Task 1: i18n — add `steps.previousDiagnosis.*` keys + regenerate

**Files:**
- Modify: `src/locale/en.json` (add a `previousDiagnosis` sibling under `steps`)
- Modify: `src/locale/de.json` (same)
- Modify: `src/locale/fr.json` (same)
- Regenerate: `src/i18n/generated.ts` (via `pnpm gen:i18n`)

**Interfaces:**
- Consumes: existing `general.progress.stepOf` (`{ current, total }`) — reused, not redefined.
- Produces: translation keys consumable as string literals via `translate(...)`:
  - `steps.previousDiagnosis.overline`
  - `steps.previousDiagnosis.question`
  - `steps.previousDiagnosis.description`
  - `steps.previousDiagnosis.options.yes.title`
  - `steps.previousDiagnosis.options.yes.description`
  - `steps.previousDiagnosis.options.no.title`
  - `steps.previousDiagnosis.options.no.description`
  - `steps.previousDiagnosis.back`
  - None use `{{token}}` interpolation.

- [ ] **Step 1: Add the `previousDiagnosis` block to `src/locale/en.json`**

It is a new sibling of `warningSigns` inside the `"steps"` object. Add a comma after the existing `warningSigns` closing brace, then insert:

```json
    "previousDiagnosis": {
      "overline": "Warning signs",
      "question": "Have you previously been diagnosed with any form of skin cancer?",
      "description": "Includes melanoma, basal cell carcinoma (BCC), squamous cell carcinoma (SCC), or any precancerous skin lesion removed by a doctor.",
      "options": {
        "yes": {
          "title": "Yes",
          "description": "I've been diagnosed with skin cancer or had a precancerous lesion removed."
        },
        "no": {
          "title": "No",
          "description": "I haven't been diagnosed with any form of skin cancer."
        }
      },
      "back": "Back"
    }
```

- [ ] **Step 2: Add the `previousDiagnosis` block to `src/locale/de.json`** (same structure, German copy — first pass, formal "Sie")

```json
    "previousDiagnosis": {
      "overline": "Warnzeichen",
      "question": "Wurde bei Ihnen jemals eine Form von Hautkrebs diagnostiziert?",
      "description": "Dazu zählen Melanom, Basalzellkarzinom (BCC), Plattenepithelkarzinom (SCC) oder eine von einer Ärztin oder einem Arzt entfernte Hautkrebsvorstufe.",
      "options": {
        "yes": {
          "title": "Ja",
          "description": "Bei mir wurde Hautkrebs diagnostiziert oder eine Krebsvorstufe entfernt."
        },
        "no": {
          "title": "Nein",
          "description": "Bei mir wurde noch nie eine Form von Hautkrebs diagnostiziert."
        }
      },
      "back": "Zurück"
    }
```

- [ ] **Step 3: Add the `previousDiagnosis` block to `src/locale/fr.json`** (same structure, French copy — first pass)

```json
    "previousDiagnosis": {
      "overline": "Signes d'alerte",
      "question": "Un cancer de la peau, quelle qu'en soit la forme, vous a-t-il déjà été diagnostiqué ?",
      "description": "Cela inclut le mélanome, le carcinome basocellulaire (CBC), le carcinome épidermoïde (CE) ou toute lésion cutanée précancéreuse retirée par un médecin.",
      "options": {
        "yes": {
          "title": "Oui",
          "description": "On m'a diagnostiqué un cancer de la peau ou retiré une lésion précancéreuse."
        },
        "no": {
          "title": "Non",
          "description": "Aucune forme de cancer de la peau ne m'a été diagnostiquée."
        }
      },
      "back": "Retour"
    }
```

- [ ] **Step 4: Regenerate the typed key map**

Run: `pnpm gen:i18n`
Expected: `src/i18n/generated.ts` now includes the eight new `'steps.previousDiagnosis.*'` keys, each typed `Record<never, never>` (no params).

- [ ] **Step 5: Verify locale parity + codegen freshness**

Run: `pnpm test -- src/i18n/locale.test.ts`
Expected: PASS — all three locales share the same keys/tokens, and `generated.ts` is up to date (the staleness guard passes).

Run: `pnpm typecheck`
Expected: PASS — no type errors.

> If `locale.test.ts` fails on key parity, a locale is missing a key or has a stray `{{token}}`; if it fails on staleness, re-run `pnpm gen:i18n`. If JSON fails to parse, check the comma you added after `warningSigns`.

- [ ] **Step 6: Checkpoint (no git)**

Leave `en.json`, `de.json`, `fr.json`, `generated.ts` modified in the working tree. Do not commit.

---

### Task 2: `PreviousDiagnosis` component (types + index + unit test, TDD)

**Files:**
- Create: `src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types.ts`
- Create: `src/components/steps/PreviousDiagnosis/PreviousDiagnosis.test.tsx`
- Create: `src/components/steps/PreviousDiagnosis/index.tsx`

**Interfaces:**
- Consumes: i18n keys from Task 1; DS primitives `@hirslanden/ds/{stepprogress,overline,heading,text,optiongroup,textlink,icon}`; `useTranslation` from `@root/src/i18n`.
- Produces:
  - `enum PreviousDiagnosisAnswer { Yes = 'yes', No = 'no' }`
  - `interface PreviousDiagnosisProps { value?: PreviousDiagnosisAnswer; onChange?: (answer: PreviousDiagnosisAnswer) => void; onBack?: () => void; current?: number; total?: number }`
  - `function PreviousDiagnosis(props: PreviousDiagnosisProps)` — named export from `index.tsx`.
  - Stable `data-testid`s: `previous-diagnosis`, `previous-diagnosis-overline`, `previous-diagnosis-question`, `previous-diagnosis-description`, `previous-diagnosis-options`.

- [ ] **Step 1: Create the types file**

`src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types.ts`:

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

- [ ] **Step 2: Write the failing unit test**

`src/components/steps/PreviousDiagnosis/PreviousDiagnosis.test.tsx`:

```tsx
import { PreviousDiagnosis } from '@root/src/components/steps/PreviousDiagnosis';
import { PreviousDiagnosisAnswer } from '@root/src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types';
import { fireEvent, render, screen } from '@testing-library/preact';
import type { ComponentChildren } from 'preact';

// translate(key) -> key, so assertions check keys, not copy.
vi.mock('@root/src/i18n', () => ({
  useTranslation: () => ({ translate: (key: string) => key }),
}));

// Minimal DS stand-ins; forward only what the tests need.
vi.mock('@hirslanden/ds/stepprogress', () => ({
  StepProgress: ({ current, total, label }: { current: number; total: number; label?: string }) => (
    <div data-testid="ds-stepprogress">{`${label}|${current}|${total}`}</div>
  ),
}));

vi.mock('@hirslanden/ds/overline', () => ({
  Overline: ({ children }: { children?: ComponentChildren }) => <span>{children}</span>,
}));

vi.mock('@hirslanden/ds/heading', () => ({
  Heading: ({ children, id }: { children?: ComponentChildren; id?: string }) => (
    <h1 id={id}>{children}</h1>
  ),
}));

vi.mock('@hirslanden/ds/text', () => ({
  Text: ({ children }: { children?: ComponentChildren }) => <p>{children}</p>,
}));

vi.mock('@hirslanden/ds/optiongroup', () => ({
  OptionCard: ({
    value,
    title,
    description,
    selected,
    onClick,
  }: {
    value: string;
    title?: ComponentChildren;
    description?: ComponentChildren;
    selected?: boolean;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid={`ds-option-${value}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span>{title}</span>
      <span>{description}</span>
    </button>
  ),
}));

vi.mock('@hirslanden/ds/textlink', () => ({
  TextLink: ({ children, onClick }: { children?: ComponentChildren; onClick?: () => void }) => (
    <button type="button" data-testid="ds-back" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@hirslanden/ds/icon', () => ({
  ArrowLeftIcon: () => <svg data-testid="ds-icon" aria-hidden="true" />,
}));

test('renders progress with the localized label key and 2 of 14', () => {
  render(<PreviousDiagnosis />);
  const progress = screen.getByTestId('ds-stepprogress');
  expect(progress).toHaveTextContent('general.progress.stepOf');
  expect(progress).toHaveTextContent('2');
  expect(progress).toHaveTextContent('14');
});

test('renders the overline and question keys', () => {
  render(<PreviousDiagnosis />);
  expect(screen.getByTestId('previous-diagnosis-overline')).toHaveTextContent(
    'steps.previousDiagnosis.overline',
  );
  expect(screen.getByTestId('previous-diagnosis-question')).toHaveTextContent(
    'steps.previousDiagnosis.question',
  );
});

test('renders the description key', () => {
  render(<PreviousDiagnosis />);
  expect(screen.getByTestId('previous-diagnosis-description')).toHaveTextContent(
    'steps.previousDiagnosis.description',
  );
});

test('renders both option keys (title + description)', () => {
  render(<PreviousDiagnosis />);
  expect(screen.getByTestId('ds-option-yes')).toHaveTextContent(
    'steps.previousDiagnosis.options.yes.title',
  );
  expect(screen.getByTestId('ds-option-yes')).toHaveTextContent(
    'steps.previousDiagnosis.options.yes.description',
  );
  expect(screen.getByTestId('ds-option-no')).toHaveTextContent(
    'steps.previousDiagnosis.options.no.title',
  );
  expect(screen.getByTestId('ds-option-no')).toHaveTextContent(
    'steps.previousDiagnosis.options.no.description',
  );
});

test('selecting an option fires onChange with the answer enum', () => {
  const onChange = vi.fn();
  render(<PreviousDiagnosis onChange={onChange} />);
  fireEvent.click(screen.getByTestId('ds-option-no'));
  expect(onChange).toHaveBeenCalledWith(PreviousDiagnosisAnswer.No);
});

test('clicking Back fires onBack', () => {
  const onBack = vi.fn();
  render(<PreviousDiagnosis onBack={onBack} />);
  fireEvent.click(screen.getByTestId('ds-back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('reflects the controlled value as the selected card', () => {
  render(<PreviousDiagnosis value={PreviousDiagnosisAnswer.No} />);
  expect(screen.getByTestId('ds-option-no')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('ds-option-yes')).toHaveAttribute('aria-pressed', 'false');
});

test('controlled: clicking an option does not change selection on its own', () => {
  render(<PreviousDiagnosis onChange={vi.fn()} />);
  fireEvent.click(screen.getByTestId('ds-option-yes'));
  // No internal state — selection only follows the `value` prop the parent passes back.
  expect(screen.getByTestId('ds-option-yes')).toHaveAttribute('aria-pressed', 'false');
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm exec vitest run PreviousDiagnosis`
Expected: FAIL — cannot resolve `@root/src/components/steps/PreviousDiagnosis` (the `index.tsx` does not exist yet).

- [ ] **Step 4: Write the minimal implementation**

`src/components/steps/PreviousDiagnosis/index.tsx`:

```tsx
import { Heading } from '@hirslanden/ds/heading';
import { ArrowLeftIcon } from '@hirslanden/ds/icon';
import { OptionCard } from '@hirslanden/ds/optiongroup';
import { Overline } from '@hirslanden/ds/overline';
import { StepProgress } from '@hirslanden/ds/stepprogress';
import { Text } from '@hirslanden/ds/text';
import { TextLink } from '@hirslanden/ds/textlink';
import {
  PreviousDiagnosisAnswer,
  type PreviousDiagnosisProps,
} from '@root/src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types';
import { useTranslation } from '@root/src/i18n';

const DEFAULT_CURRENT = 2;
const DEFAULT_TOTAL = 14;

export function PreviousDiagnosis({
  value,
  onChange,
  onBack,
  current = DEFAULT_CURRENT,
  total = DEFAULT_TOTAL,
}: PreviousDiagnosisProps) {
  const { translate } = useTranslation();

  return (
    <section
      data-testid="previous-diagnosis"
      class="mx-auto max-w-2xl border border-border bg-bg p-6 sm:p-8"
    >
      <StepProgress
        current={current}
        total={total}
        label={translate('general.progress.stepOf', { current, total })}
      />

      <div class="mt-6" data-testid="previous-diagnosis-overline">
        <Overline>{translate('steps.previousDiagnosis.overline')}</Overline>
      </div>

      <div class="mt-2" data-testid="previous-diagnosis-question">
        <Heading level={1} className="text-xl!">
          {translate('steps.previousDiagnosis.question')}
        </Heading>
      </div>

      <div class="mt-2" data-testid="previous-diagnosis-description">
        <Text tone="muted">{translate('steps.previousDiagnosis.description')}</Text>
      </div>

      <fieldset
        data-testid="previous-diagnosis-options"
        class="mt-6 flex flex-col gap-3 border-0 p-0 m-0"
      >
        <legend class="sr-only">{translate('steps.previousDiagnosis.question')}</legend>
        <OptionCard
          value={PreviousDiagnosisAnswer.Yes}
          title={translate('steps.previousDiagnosis.options.yes.title')}
          description={translate('steps.previousDiagnosis.options.yes.description')}
          selected={value === PreviousDiagnosisAnswer.Yes}
          onClick={() => onChange?.(PreviousDiagnosisAnswer.Yes)}
        />
        <OptionCard
          value={PreviousDiagnosisAnswer.No}
          title={translate('steps.previousDiagnosis.options.no.title')}
          description={translate('steps.previousDiagnosis.options.no.description')}
          selected={value === PreviousDiagnosisAnswer.No}
          onClick={() => onChange?.(PreviousDiagnosisAnswer.No)}
        />
      </fieldset>

      <div class="mt-8">
        <TextLink leadingIcon={<ArrowLeftIcon />} onClick={onBack}>
          {translate('steps.previousDiagnosis.back')}
        </TextLink>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run PreviousDiagnosis`
Expected: PASS — all 8 tests green.

- [ ] **Step 6: Typecheck and lint**

Run: `pnpm typecheck`
Expected: PASS — the string-literal i18n keys resolve against `generated.ts` (Task 1), props/enum are consistent.

Run: `pnpm lint`
Expected: PASS — Biome clean (semicolons, single quotes, import order). If Biome reports formatting, run `pnpm exec biome check --write .` (the app has no `pnpm format` script — this is the app-level Biome autofix matching the `lint` script's `biome check .`), then re-run `pnpm lint`.

- [ ] **Step 7: Checkpoint (no git)**

Leave the three new files in the working tree. Do not commit.

---

### Task 3: Storybook story

**Files:**
- Create: `src/components/steps/PreviousDiagnosis/PreviousDiagnosis.stories.tsx`

**Interfaces:**
- Consumes: `PreviousDiagnosis` (named export) and `PreviousDiagnosisAnswer` from Task 2.
- Produces: stories `Default` (interactive, controlled by the story) and `Preselected`; iframe story id **`steps-previousdiagnosis--default`** (title `Steps/PreviousDiagnosis`).

- [ ] **Step 1: Create the story**

`src/components/steps/PreviousDiagnosis/PreviousDiagnosis.stories.tsx`:

```tsx
import { PreviousDiagnosis } from '@root/src/components/steps/PreviousDiagnosis';
import { PreviousDiagnosisAnswer } from '@root/src/components/steps/PreviousDiagnosis/PreviousDiagnosis.types';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'preact/hooks';

const meta: Meta<typeof PreviousDiagnosis> = {
  title: 'Steps/PreviousDiagnosis',
  component: PreviousDiagnosis,
};

export default meta;

type Story = StoryObj<typeof PreviousDiagnosis>;

/** Interactive: the component is controlled, so the story owns the answer state. */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<PreviousDiagnosisAnswer | undefined>(undefined);
    return <PreviousDiagnosis value={value} onChange={(answer) => setValue(answer)} />;
  },
};

/** Returning to the step with a previously chosen answer. */
export const Preselected: Story = {
  args: {
    value: PreviousDiagnosisAnswer.No,
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS — the story typechecks against the component's props.

- [ ] **Step 3: Run the full suite (final green gate before browser verification)**

Run: `pnpm test`
Expected: PASS — the entire Vitest suite is green (the new `PreviousDiagnosis` tests, the i18n parity/codegen guards from Task 1, and all pre-existing tests — nothing regressed).

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 4: Checkpoint (no git)**

Leave the story file in the working tree. Do not commit.

---

### Task 4: Browser / visual / a11y verification (Playwright MCP)

**Files:** none created — this task verifies the rendered story.

**Interfaces:**
- Consumes: story id `steps-previousdiagnosis--default` from Task 3.
- Produces: confirmation that step 2 looks right at mobile + desktop, has zero AA violations except the accepted brand-contrast deviation, is keyboard-operable, and fits hirslanden.ch.

- [ ] **Step 1: Start Storybook** (background)

Run: `pnpm storybook`
Expected: serves on `http://localhost:6007`. Wait until it is reachable.

- [ ] **Step 2: Open the story at mobile size and screenshot**

- `browser_resize` to **375×812**
- `browser_navigate` to `http://localhost:6007/iframe.html?id=steps-previousdiagnosis--default&viewMode=story&globals=locale:en`
- `browser_take_screenshot`
Expected: bordered card; "Step 2 of 14" + bar ~14%; "WARNING SIGNS" overline; the 34px question; the muted description; Yes/No cards; "← Back". No layout overflow.

- [ ] **Step 3: Screenshot at desktop size**

- `browser_resize` to **1440×900**
- `browser_take_screenshot`
Expected: same content, comfortably within `max-w-2xl`, centered.

- [ ] **Step 4: Run the axe-core AA scan**

Inject axe-core and run it via `browser_evaluate` (scan the story root; tags `wcag2a`, `wcag2aa`). Example:

```js
async () => {
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
  await new Promise((res, rej) => { s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const results = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
  return results.violations.map((v) => ({ id: v.id, nodes: v.nodes.length }));
}
```

Expected: the only violations (if any) are `color-contrast` on the muted description text and/or the "Back" link — the **accepted brand-contrast deviation** (muted `#938880` 3.45:1, azure `#0094d4` 3.39:1). **Any other AA violation (id ≠ `color-contrast`, or a `color-contrast` on a non-brand element) is a blocker** — fix before done.

- [ ] **Step 5: Confirm semantics + keyboard**

- `browser_snapshot` — verify: named `progressbar`; `h1` = the question; the options exposed as a group named by the sr-only legend; each option a named button with pressed state; "Back" a named button; the description present as body text.
- Keyboard: Tab order **Yes → No → Back**; visible focus ring on each; Enter/Space activates the focused option (story highlights it) and Back.

- [ ] **Step 6: Reconcile against the host site**

`browser_navigate` to `https://www.hirslanden.ch/de/corporate/home.html`, screenshot comparable buttons/cards/headings, and confirm step 2's type, spacing, and colour are not out of place. (If the home page lacks a comparable element, browse another Hirslanden page.)

- [ ] **Step 7: Record results + Checkpoint (no git)**

Note the screenshots and the axe result (expected: only the accepted brand-contrast finding). Report any blocker found. Do not commit — leave everything in the working tree for the maintainer.

---

## Definition of Done (whole plan)

- [ ] `src/components/steps/PreviousDiagnosis/` has `index.tsx` (named export `PreviousDiagnosis`), `PreviousDiagnosis.types.ts`, `PreviousDiagnosis.test.tsx`, `PreviousDiagnosis.stories.tsx`.
- [ ] Reuses DS primitives; no `TODO(ds)` needed.
- [ ] No hardcoded user-facing strings; keys in en/de/fr; `pnpm gen:i18n` re-run (`generated.ts` fresh).
- [ ] Tailwind + `--hds-*` utilities only; heading `text-xl!`; mobile-first; renders its own frame.
- [ ] Unit tests follow conventions (keys not copy, deps incl. `Text` mocked, `data-testid`).
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` all green.
- [ ] Playwright/Storybook: looks right at 375×812 and 1440×900; zero AA violations except the accepted brand-contrast deviation; not out of place vs hirslanden.ch.
- [ ] Nothing committed — changes left in the working tree.
