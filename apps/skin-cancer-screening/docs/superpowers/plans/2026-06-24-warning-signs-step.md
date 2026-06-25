# Warning Signs (Step 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build step 1 ("Warning signs") of the 14-step skin-cancer questionnaire as a standalone, embeddable Preact component composed from `@hirslanden/ds` primitives.

**Architecture:** A single `WarningSigns` component under `src/components/steps/WarningSigns/` renders its own bordered panel containing `StepProgress`, an `Overline`, a `Heading` (the question), three activating option cards (`OptionCard` in standalone/button mode), and a "← Back" `TextLink`. It is controlled-or-uncontrolled: it accepts `value`/`defaultValue`, emits `onChange(answer)` (the auto-advance signal) and `onBack()`. All copy flows through the i18n layer.

**Tech Stack:** Preact 10 + `preact/hooks`; `@hirslanden/ds` primitives via subpath imports; Tailwind v4 + `--hds-*` design tokens; Vitest + `@testing-library/preact`; Storybook 10 (port 6007) + `@storybook/addon-a11y`; Biome; `@root` path alias.

## Global Constraints

- **No git operations.** The maintainer reviews the working tree. Every task's final step is a **Checkpoint (do NOT commit/push/branch)** — the writing-plans "Commit" step is intentionally replaced.
- **Control model:** answers are **activating buttons** (`OptionCard` standalone), not a radio group. Activation fires `onChange` and (when wired) advances. No "Next" button.
- **i18n:** no hardcoded user-facing strings; add every key to **all three** `src/locale/{en,de,fr}.json` with identical keys and identical `{{tokens}}`; run `pnpm gen:i18n`; never hand-edit `src/i18n/generated.ts`. Always call `translate('literal.key')` with a string literal.
- **Styling:** Tailwind utilities backed by `--hds-*` tokens only (`border-border`, `bg-bg`, `rounded-sm`, `text-*`…); no raw hex/px/`var()`; mobile-first (base styles small, layer `sm:`/`md:`).
- **Biome:** single quotes, semicolons always, 2-space indent, width 100. Conventions: brace all control statements; no `any` (use `unknown` + guards); avoid `as`; prefer `enum`; no conditional object spreads.
- **Files per `CLAUDE.md`:** folder `src/components/steps/WarningSigns/`, named export `WarningSigns`, co-located `*.types.ts` / `*.test.tsx` / `*.stories.tsx`. Intra-app imports use `@root/...`; DS imports stay `@hirslanden/ds/<subpath>`.
- **A11y:** WCAG 2.1 AA is a blocker — axe scan must report **zero** AA violations.
- **All commands run from** `apps/skin-cancer-screening` (PowerShell). Reference spec: `docs/superpowers/specs/2026-06-24-warning-signs-step-design.md`.

---

## File Structure

- `src/locale/en.json` · `de.json` · `fr.json` — **Modify**: add `general.progress.stepOf` and the `steps.warningSigns.*` keys.
- `src/i18n/generated.ts` — **Regenerated** by `pnpm gen:i18n` (do not hand-edit).
- `src/components/steps/WarningSigns/WarningSigns.types.ts` — **Create**: `WarningSignsAnswer` enum + `WarningSignsProps`.
- `src/components/steps/WarningSigns/index.tsx` — **Create**: the `WarningSigns` component (named export).
- `src/components/steps/WarningSigns/WarningSigns.test.tsx` — **Create**: unit test (mocks i18n + DS primitives, targets `data-testid`).
- `src/components/steps/WarningSigns/WarningSigns.stories.tsx` — **Create**: Storybook story (`Steps/WarningSigns`).

---

## Task 1: i18n keys for step 1

**Files:**
- Modify: `src/locale/en.json`, `src/locale/de.json`, `src/locale/fr.json`
- Regenerate: `src/i18n/generated.ts` (via `pnpm gen:i18n`)
- Test: existing `src/i18n/locale.test.ts` (parity + generated-freshness guard)

**Interfaces:**
- Consumes: nothing.
- Produces: typed translation keys usable as string literals in Task 2 —
  `steps.warningSigns.overline`, `steps.warningSigns.question`,
  `steps.warningSigns.options.{yes,no,unsure}.{title,description}`,
  `steps.warningSigns.back` (all no-param), and
  `general.progress.stepOf` (params `{ current: string | number; total: string | number }`).

- [ ] **Step 1: Replace `src/locale/en.json` with the new content**

```json
{
  "app": {
    "title": "Skin Cancer Screening"
  },
  "general": {
    "buttons": {
      "startCheck": "Start skin cancer check",
      "ok": "OK"
    },
    "someInterpolatedValue": "The value is {{value}}",
    "progress": {
      "stepOf": "Step {{current}} of {{total}}"
    }
  },
  "steps": {
    "warningSigns": {
      "overline": "Warning signs",
      "question": "Do you have a mole or skin spot that is new, growing, changing shape or colour, bleeding, or not healing?",
      "options": {
        "yes": {
          "title": "Yes",
          "description": "I have noticed a change or unusual spot."
        },
        "no": {
          "title": "No",
          "description": "Nothing new or changing that I have noticed."
        },
        "unsure": {
          "title": "Not sure",
          "description": "I may have noticed something but I am not certain."
        }
      },
      "back": "Back"
    }
  }
}
```

> If the existing `en.json` already contains keys not shown above (e.g. extra
> `general.*`), keep them — only **add** the `general.progress` and `steps`
> branches and the matching keys to the other two locales.

- [ ] **Step 2: Replace `src/locale/de.json` with the new content**

```json
{
  "app": {
    "title": "Hautkrebs-Vorsorge"
  },
  "general": {
    "buttons": {
      "startCheck": "Hautkrebs-Check starten",
      "ok": "OK"
    },
    "someInterpolatedValue": "Der Wert ist {{value}}",
    "progress": {
      "stepOf": "Schritt {{current}} von {{total}}"
    }
  },
  "steps": {
    "warningSigns": {
      "overline": "Warnzeichen",
      "question": "Haben Sie ein Muttermal oder einen Hautfleck, das/der neu ist, wächst, Form oder Farbe ändert, blutet oder nicht abheilt?",
      "options": {
        "yes": {
          "title": "Ja",
          "description": "Mir ist eine Veränderung oder ein ungewöhnlicher Fleck aufgefallen."
        },
        "no": {
          "title": "Nein",
          "description": "Nichts Neues oder Veränderliches, das mir aufgefallen ist."
        },
        "unsure": {
          "title": "Nicht sicher",
          "description": "Mir ist vielleicht etwas aufgefallen, aber ich bin nicht sicher."
        }
      },
      "back": "Zurück"
    }
  }
}
```

- [ ] **Step 3: Replace `src/locale/fr.json` with the new content**

```json
{
  "app": {
    "title": "Dépistage du cancer de la peau"
  },
  "general": {
    "buttons": {
      "startCheck": "Démarrer le dépistage",
      "ok": "OK"
    },
    "someInterpolatedValue": "La valeur est {{value}}",
    "progress": {
      "stepOf": "Étape {{current}} sur {{total}}"
    }
  },
  "steps": {
    "warningSigns": {
      "overline": "Signes d'alerte",
      "question": "Avez-vous un grain de beauté ou une tache cutanée qui est nouveau/nouvelle, grandit, change de forme ou de couleur, saigne ou ne cicatrise pas ?",
      "options": {
        "yes": {
          "title": "Oui",
          "description": "J'ai remarqué un changement ou une tache inhabituelle."
        },
        "no": {
          "title": "Non",
          "description": "Rien de nouveau ni de changeant que j'aie remarqué."
        },
        "unsure": {
          "title": "Pas sûr·e",
          "description": "J'ai peut-être remarqué quelque chose mais je n'en suis pas certain·e."
        }
      },
      "back": "Retour"
    }
  }
}
```

- [ ] **Step 4: Regenerate the typed key map**

Run: `pnpm gen:i18n`
Expected: rewrites `src/i18n/generated.ts`; the new keys (incl. `general.progress.stepOf` with `current`/`total` params) appear in the generated `Translations` interface.

- [ ] **Step 5: Verify locale parity + generated freshness**

Run: `pnpm test src/i18n/locale.test.ts`
Expected: PASS (all locales share keys + tokens; `generated.ts` is up to date).

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: PASS (no errors).

- [ ] **Step 7: Checkpoint (do NOT commit)** — leave the locale + generated changes in the working tree.

---

## Task 2: `WarningSigns` component (TDD)

**Files:**
- Create: `src/components/steps/WarningSigns/WarningSigns.types.ts`
- Create: `src/components/steps/WarningSigns/index.tsx`
- Test: `src/components/steps/WarningSigns/WarningSigns.test.tsx`

**Interfaces:**
- Consumes: the i18n keys from Task 1; DS primitives `StepProgress`
  (`@hirslanden/ds/stepprogress`), `Overline` (`@hirslanden/ds/overline`),
  `Heading` (`@hirslanden/ds/heading`), `OptionCard` (`@hirslanden/ds/optiongroup`),
  `TextLink` (`@hirslanden/ds/textlink`), `Icon` (`@hirslanden/ds/icon`);
  `useTranslation` from `@root/src/i18n`.
- Produces (used by Task 3):
  - `enum WarningSignsAnswer { Yes = 'yes', No = 'no', Unsure = 'unsure' }`
  - `interface WarningSignsProps { value?: WarningSignsAnswer; defaultValue?: WarningSignsAnswer; onChange?: (answer: WarningSignsAnswer) => void; onBack?: () => void; current?: number; total?: number; }`
  - `function WarningSigns(props: WarningSignsProps): JSX.Element` (named export from the folder's `index.tsx`).

- [ ] **Step 1: Write the failing test**

Create `src/components/steps/WarningSigns/WarningSigns.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/preact';
import type { ComponentChildren } from 'preact';
import { WarningSigns } from '@root/src/components/steps/WarningSigns';
import { WarningSignsAnswer } from '@root/src/components/steps/WarningSigns/WarningSigns.types';

// translate(key) -> key, so assertions check keys, not copy.
vi.mock('@root/src/i18n', () => ({
  useTranslation: () => ({ translate: (key: string) => key }),
}));

// Minimal DS stand-ins; forward only what the tests need.
vi.mock('@hirslanden/ds/stepprogress', () => ({
  StepProgress: ({
    current,
    total,
    label,
  }: {
    current: number;
    total: number;
    label?: string;
  }) => <div data-testid="ds-stepprogress">{`${label}|${current}|${total}`}</div>,
}));

vi.mock('@hirslanden/ds/overline', () => ({
  Overline: ({ children }: { children?: ComponentChildren }) => <span>{children}</span>,
}));

vi.mock('@hirslanden/ds/heading', () => ({
  Heading: ({ children, id }: { children?: ComponentChildren; id?: string }) => (
    <h1 id={id}>{children}</h1>
  ),
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
  Icon: () => <svg data-testid="ds-icon" aria-hidden="true" />,
}));

test('renders progress with the localized label key and 1 of 14', () => {
  render(<WarningSigns />);
  const progress = screen.getByTestId('ds-stepprogress');
  expect(progress).toHaveTextContent('general.progress.stepOf');
  expect(progress).toHaveTextContent('1');
  expect(progress).toHaveTextContent('14');
});

test('renders the overline and question keys', () => {
  render(<WarningSigns />);
  expect(screen.getByTestId('warning-signs-overline')).toHaveTextContent(
    'steps.warningSigns.overline',
  );
  expect(screen.getByTestId('warning-signs-question')).toHaveTextContent(
    'steps.warningSigns.question',
  );
});

test('renders all three option keys (title + description)', () => {
  render(<WarningSigns />);
  expect(screen.getByTestId('ds-option-yes')).toHaveTextContent(
    'steps.warningSigns.options.yes.title',
  );
  expect(screen.getByTestId('ds-option-yes')).toHaveTextContent(
    'steps.warningSigns.options.yes.description',
  );
  expect(screen.getByTestId('ds-option-no')).toHaveTextContent(
    'steps.warningSigns.options.no.title',
  );
  expect(screen.getByTestId('ds-option-unsure')).toHaveTextContent(
    'steps.warningSigns.options.unsure.title',
  );
});

test('selecting an option fires onChange with the answer enum', () => {
  const onChange = vi.fn();
  render(<WarningSigns onChange={onChange} />);
  fireEvent.click(screen.getByTestId('ds-option-no'));
  expect(onChange).toHaveBeenCalledWith(WarningSignsAnswer.No);
});

test('clicking Back fires onBack', () => {
  const onBack = vi.fn();
  render(<WarningSigns onBack={onBack} />);
  fireEvent.click(screen.getByTestId('ds-back'));
  expect(onBack).toHaveBeenCalledTimes(1);
});

test('reflects the controlled value as the selected card', () => {
  render(<WarningSigns value={WarningSignsAnswer.Unsure} />);
  expect(screen.getByTestId('ds-option-unsure')).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByTestId('ds-option-yes')).toHaveAttribute('aria-pressed', 'false');
});

test('uncontrolled: clicking an option highlights it', () => {
  render(<WarningSigns />);
  fireEvent.click(screen.getByTestId('ds-option-yes'));
  expect(screen.getByTestId('ds-option-yes')).toHaveAttribute('aria-pressed', 'true');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/components/steps/WarningSigns/WarningSigns.test.tsx`
Expected: FAIL — cannot resolve `@root/src/components/steps/WarningSigns` / `WarningSigns.types` (modules don't exist yet).

- [ ] **Step 3: Create the types file**

Create `src/components/steps/WarningSigns/WarningSigns.types.ts`:

```ts
/** The answer to the step-1 "warning signs" question. */
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
  /** Fires when an answer is chosen — the auto-advance signal for the parent flow. */
  onChange?: (answer: WarningSignsAnswer) => void;
  /** Fires when the "Back" link is activated. */
  onBack?: () => void;
  /** 1-based position of this step. Defaults to 1. */
  current?: number;
  /** Total number of steps. Defaults to 14. */
  total?: number;
}
```

- [ ] **Step 4: Create the component**

Create `src/components/steps/WarningSigns/index.tsx`:

```tsx
import { Heading } from '@hirslanden/ds/heading';
import { Icon } from '@hirslanden/ds/icon';
import { OptionCard } from '@hirslanden/ds/optiongroup';
import { Overline } from '@hirslanden/ds/overline';
import { StepProgress } from '@hirslanden/ds/stepprogress';
import { TextLink } from '@hirslanden/ds/textlink';
import {
  type WarningSignsProps,
  WarningSignsAnswer,
} from '@root/src/components/steps/WarningSigns/WarningSigns.types';
import { useTranslation } from '@root/src/i18n';
import { useId, useState } from 'preact/hooks';

const DEFAULT_CURRENT = 1;
const DEFAULT_TOTAL = 14;

export function WarningSigns({
  value,
  defaultValue,
  onChange,
  onBack,
  current = DEFAULT_CURRENT,
  total = DEFAULT_TOTAL,
}: WarningSignsProps) {
  const { translate } = useTranslation();
  const questionId = useId();
  const [internalValue, setInternalValue] = useState<WarningSignsAnswer | undefined>(defaultValue);

  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalValue;

  function choose(answer: WarningSignsAnswer) {
    if (!isControlled) {
      setInternalValue(answer);
    }
    onChange?.(answer);
  }

  return (
    <section
      data-testid="warning-signs"
      class="mx-auto max-w-2xl border border-border bg-bg p-6 sm:p-8"
    >
      <StepProgress
        current={current}
        total={total}
        label={translate('general.progress.stepOf', { current, total })}
      />

      <div class="mt-6" data-testid="warning-signs-overline">
        <Overline>{translate('steps.warningSigns.overline')}</Overline>
      </div>

      <div class="mt-2" data-testid="warning-signs-question">
        <Heading level={1} id={questionId}>
          {translate('steps.warningSigns.question')}
        </Heading>
      </div>

      <div
        role="group"
        aria-labelledby={questionId}
        data-testid="warning-signs-options"
        class="mt-6 flex flex-col gap-3"
      >
        <OptionCard
          value={WarningSignsAnswer.Yes}
          title={translate('steps.warningSigns.options.yes.title')}
          description={translate('steps.warningSigns.options.yes.description')}
          selected={selected === WarningSignsAnswer.Yes}
          onClick={() => choose(WarningSignsAnswer.Yes)}
        />
        <OptionCard
          value={WarningSignsAnswer.No}
          title={translate('steps.warningSigns.options.no.title')}
          description={translate('steps.warningSigns.options.no.description')}
          selected={selected === WarningSignsAnswer.No}
          onClick={() => choose(WarningSignsAnswer.No)}
        />
        <OptionCard
          value={WarningSignsAnswer.Unsure}
          title={translate('steps.warningSigns.options.unsure.title')}
          description={translate('steps.warningSigns.options.unsure.description')}
          selected={selected === WarningSignsAnswer.Unsure}
          onClick={() => choose(WarningSignsAnswer.Unsure)}
        />
      </div>

      <div class="mt-8">
        <TextLink leadingIcon={<Icon name="arrow-left" />} onClick={onBack}>
          {translate('steps.warningSigns.back')}
        </TextLink>
      </div>
    </section>
  );
}
```

> Note: `class` (not `className`) on the intrinsic `section`/`div` elements is
> correct for Preact JSX. No `className` is passed to DS components, so layout never
> depends on DS className-forwarding; `data-testid`s for DS primitives are supplied
> by the test mocks, derived from props.

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm test src/components/steps/WarningSigns/WarningSigns.test.tsx`
Expected: PASS (all 7 tests green).

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck`
Expected: PASS.
Run: `pnpm lint`
Expected: PASS (no Biome errors). If Biome reports formatting, run `pnpm exec biome check --write src/components/steps/WarningSigns` and re-run.

- [ ] **Step 7: Checkpoint (do NOT commit)** — leave the new component + test in the working tree.

---

## Task 3: Storybook story

**Files:**
- Create: `src/components/steps/WarningSigns/WarningSigns.stories.tsx`

**Interfaces:**
- Consumes: `WarningSigns` (folder import) and `WarningSignsAnswer` (types) from Task 2.
- Produces: story id `steps-warningsigns--default` (and `steps-warningsigns--preselected`), used by Task 4.

- [ ] **Step 1: Create the story**

Create `src/components/steps/WarningSigns/WarningSigns.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WarningSigns } from '@root/src/components/steps/WarningSigns';
import { WarningSignsAnswer } from '@root/src/components/steps/WarningSigns/WarningSigns.types';

const meta: Meta<typeof WarningSigns> = {
  title: 'Steps/WarningSigns',
  component: WarningSigns,
};

export default meta;

type Story = StoryObj<typeof WarningSigns>;

/** Interactive (uncontrolled): clicking an option highlights it. */
export const Default: Story = {};

/** Returning to the step with a previously chosen answer (controlled). */
export const Preselected: Story = {
  args: {
    value: WarningSignsAnswer.No,
  },
};
```

> The provider + Locale toolbar are wired globally in `.storybook/preview.tsx`, so
> the story needs no i18n setup. Keeping `Default` arg-free avoids depending on a
> Storybook actions addon; the uncontrolled component is still fully interactive.

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Confirm Storybook indexes the story**

Run (background): `pnpm storybook`
Then open `http://localhost:6007/iframe.html?id=steps-warningsigns--default&viewMode=story&globals=locale:en`
Expected: the step renders (progress, overline, question, three cards, Back link); no console errors. Leave Storybook running for Task 4.

- [ ] **Step 4: Checkpoint (do NOT commit)** — leave the story in the working tree.

---

## Task 4: Browser, visual & accessibility verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: the running Storybook from Task 3 and story id `steps-warningsigns--default`.
- Produces: a pass/fail verification record (screenshots + axe results) — the Definition-of-Done gate.

Use the **Playwright MCP** tools (`browser_resize`, `browser_navigate`, `browser_take_screenshot`, `browser_snapshot`, `browser_evaluate`, `browser_press_key`). Force English: `&globals=locale:en`.

- [ ] **Step 1: Ensure Storybook is up**

Run (if not already): `pnpm storybook` (serves on `http://localhost:6007`).

- [ ] **Step 2: Mobile screenshot**

`browser_resize` to 375×812, `browser_navigate` to
`http://localhost:6007/iframe.html?id=steps-warningsigns--default&viewMode=story&globals=locale:en`,
then `browser_take_screenshot`.
Expected: single-column layout, bordered panel, readable type, comfortable card spacing; no overflow/clipping.

- [ ] **Step 3: Desktop screenshot**

`browser_resize` to 1440×900, re-screenshot.
Expected: centered, constrained-width panel; matches the reference screenshot's structure (progress → WARNING SIGNS → question → 3 cards → ← Back).

- [ ] **Step 4: Automated axe scan (zero AA violations — blocker)**

`browser_evaluate` to inject `axe-core` (from CDN) and run it filtered to `wcag2a`/`wcag2aa`, e.g.:

```js
async () => {
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  const results = await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  });
  return results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
}
```
Expected: returns `[]` (zero violations). Any violation is a blocker — fix in the component and re-run.

- [ ] **Step 5: Accessibility snapshot + keyboard pass**

`browser_snapshot` and confirm: a `progressbar`; the three options are `button`s; the options group is labelled by the question; the Back control is a button/link with an accessible name. Then keyboard-drive: `browser_press_key` Tab through controls (visible focus, correct order), and Enter/Space to activate an option and the Back link.
Expected: every control reachable and operable by keyboard with a visible focus indicator.

- [ ] **Step 6: Embedding-fit check against hirslanden.ch**

`browser_navigate` to `https://www.hirslanden.ch/de/corporate/home.html`, screenshot comparable elements (buttons, cards, headings, form controls — typography, spacing, colour), and reconcile the component against them. Note any mismatch.
Expected: the widget does not look out of place beside the host site's components.

- [ ] **Step 7: Full local gate**

Run: `pnpm lint`  → Expected: PASS
Run: `pnpm typecheck`  → Expected: PASS
Run: `pnpm test`  → Expected: PASS (includes i18n parity + the WarningSigns unit tests)

- [ ] **Step 8: Checkpoint (do NOT commit)** — leave everything in the working tree for the maintainer to review.

---

## Self-Review (author's check against the spec)

- **Spec coverage:** progress/overline/question/3-cards/back → Task 2 §composition; auto-advance via `onChange` (buttons) → Task 2; renders own frame → Task 2 `<section>`; controlled+uncontrolled+callbacks → `WarningSignsProps`; i18n keys (all 3 locales + gen) → Task 1; styling tokens/mobile-first → Task 2 classes + Global Constraints; a11y AA → Task 4 axe gate; tests (keys/mocks/testid) → Task 2 test; Playwright/axe/hirslanden.ch → Task 4. No gaps.
- **Placeholder scan:** no TBD/TODO; all code blocks complete; commands have expected output.
- **Type consistency:** `WarningSignsAnswer` (`Yes/No/Unsure` = `'yes'/'no'/'unsure'`) and `WarningSignsProps` are identical across the types file, the component, the test, and the story; `general.progress.stepOf` params (`current`,`total`) match Task 1 and the `translate(...)` call in Task 2.
