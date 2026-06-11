# Questionnaire UI Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 14 reusable, accessible UI components (plus 2 paired sub-components) to `@hirslanden/ds`, derived from the skin-cancer questionnaire screenshots, following the library's existing conventions exactly.

**Architecture:** Each component is a self-contained folder (`Name.tsx` + co-located `Name.module.css` + `Name.test.tsx` + `Name.stories.tsx` + `index.ts`), authored against the React 18 API and verified under both React and `preact/compat`. A few components compose internally (`InfoCard`→`Card`+`Overline`; `Accordion`/`TextLink`→`Icon`; `OptionCard`←context←`OptionGroup`). Tokens are extended in `src/styles/tokens.css`; every component reads them as `var(--hds-…, fallback)` so it renders standalone. Subpath exports are regenerated with `npm run gen:exports`.

**Tech Stack:** React 18 API (TS 6) · CSS Modules · `useId`/`forwardRef` · Vitest 4 dual-project (react + preact/compat) + Testing Library 16 · Storybook 10 · Vite 7 library build.

**Reference spec:** `docs/superpowers/specs/2026-06-10-questionnaire-ui-components-design.md`

---

## ⛔ HARD RULE — NO GIT OPERATIONS

**Do NOT run `git add`, `git commit`, `git push`, `git branch`, `git checkout`, or any other git command at any point while executing this plan. All version control is handled by the user.** This plan contains no commit steps by design. After each task, simply leave the working tree as-is and report status.

---

## Authoring rules (inherited — must follow)

- React **18 API only**; automatic JSX runtime; **no `defaultProps`** (use default params).
- Use **`forwardRef`** where a ref to the root element is meaningful (interactive components); typography leaves may omit it.
- Use **`useId`** for all accessibility ids. Never module-level counters.
- The library **never** imports `preact`.
- `verbatimModuleSyntax` is on → **type-only imports must use `import type`**.
- Barrel + folder imports use the **`.js` suffix** (e.g. `'./components/Card/index.js'`), matching the existing `src/index.ts`.
- Biome style: single quotes, semicolons as-needed (omit). Run `npm run lint` / `npm run format` if formatting drifts.
- Every component's tests must pass in **both** the `react` and `compat` Vitest projects.

## Per-component recipe (applies to every component task)

Each component task follows the same shape. The steps are spelled out in full per task (no "same as above"):

1. Write the failing test → 2. Run it, confirm it fails → 3. Create the CSS module → 4. Create the `.tsx` → 5. Create the folder `index.ts` → 6. Append exports to `src/index.ts` → 7. `npm run gen:exports` → 8. `npm run typecheck` → 9. `npx vitest run <test file>` (both projects green) → 10. Create the story.

**No commit step.** (See HARD RULE above.)

---

## File Structure

| File | Responsibility |
|---|---|
| `src/styles/tokens.css` | **Modify** — extend with the new design tokens |
| `src/components/Icon/*` | Named SVG icon set (no CSS module) |
| `src/components/Overline/*` | Uppercase section label |
| `src/components/Heading/*` | `h1`/`h2`/`h3` titles |
| `src/components/Text/*` | Body / muted / small text (covers Disclaimer usage) |
| `src/components/Divider/*` | Styled `<hr>` |
| `src/components/List/*` | Bulleted `<ul>` |
| `src/components/Card/*` | Base bordered surface (solid/dashed) |
| `src/components/InfoCard/*` | Dashed titled card (uses Card + Overline) |
| `src/components/Callout/*` | Emphasis box (accent/subtle, optional action) |
| `src/components/TextLink/*` | Underlined link/action (uses Icon optionally) |
| `src/components/StepProgress/*` | Step label + progress bar |
| `src/components/RiskScale/*` | Segmented labeled risk meter |
| `src/components/OptionGroup/*` | `OptionGroup` + `OptionCard` + selection context |
| `src/components/Accordion/*` | `Accordion` + `AccordionItem` + open-state context |
| `src/index.ts` | **Modify** — append re-exports for each component |
| `examples/preact-app/src/main.tsx` | **Modify** — render new components in the smoke app |

---

## Task 1: Extend design tokens

**Files:**
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Replace `src/styles/tokens.css` with the extended token set**

```css
:root {
  /* color */
  --hds-color-primary: #0b6bcb;
  --hds-color-on-primary: #ffffff;
  --hds-color-border: #c7ccd1;
  --hds-color-text: #1a1d20;
  --hds-color-bg: #ffffff;
  --hds-color-muted: #6b7280;
  --hds-color-strong: #1a1a1a;
  --hds-color-track: #e5e7eb;
  --hds-color-surface-subtle: #f5f5f5;
  --hds-color-border-dashed: #c7ccd1;
  --hds-color-accent-bar: #1a1a1a;

  /* radius */
  --hds-radius-sm: 4px;
  --hds-radius-md: 6px;

  /* spacing */
  --hds-space-1: 0.25rem;
  --hds-space-2: 0.5rem;
  --hds-space-3: 0.75rem;
  --hds-space-4: 1rem;
  --hds-space-5: 1.5rem;
  --hds-space-6: 2rem;

  /* typography */
  --hds-font-size-xs: 0.75rem;
  --hds-font-size-sm: 0.875rem;
  --hds-font-size-md: 1rem;
  --hds-font-size-lg: 1.25rem;
  --hds-font-size-xl: 1.75rem;
  --hds-font-size-2xl: 2.25rem;
  --hds-font-weight-regular: 400;
  --hds-font-weight-medium: 500;
  --hds-font-weight-bold: 700;
  --hds-letter-spacing-wide: 0.08em;
  --hds-line-height-tight: 1.2;
  --hds-line-height-normal: 1.6;
}
```

- [ ] **Step 2: Verify the build still copies tokens**

Run: `npm run build`
Expected: Vite builds, then `Copied src/styles/tokens.css -> dist/styles/tokens.css`. (No components changed yet; this confirms the token file is still valid CSS.)

---

## Task 2: Icon

**Files:**
- Test: `src/components/Icon/Icon.test.tsx`
- Create: `src/components/Icon/Icon.tsx`
- Create: `src/components/Icon/index.ts`
- Create: `src/components/Icon/Icon.stories.tsx`
- Modify: `src/index.ts`

> Icon has **no CSS module** — it is sized via props and colored via `currentColor`.

- [ ] **Step 1: Write the failing test** — `src/components/Icon/Icon.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { Icon } from './Icon'

test('renders an svg', () => {
  const { container } = render(<Icon name="plus" />)
  expect(container.querySelector('svg')).toBeInTheDocument()
})

test('is decorative by default (aria-hidden)', () => {
  const { container } = render(<Icon name="plus" />)
  expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
})

test('exposes an accessible name when a title is provided', () => {
  render(<Icon name="arrow-left" title="Back" />)
  expect(screen.getByRole('img', { name: 'Back' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Icon/Icon.test.tsx`
Expected: FAIL in both projects — `Failed to resolve import "./Icon"`.

- [ ] **Step 3: Create `src/components/Icon/Icon.tsx`**

```tsx
import type { SVGProps } from 'react'

export type IconName = 'plus' | 'minus' | 'arrow-left' | 'arrow-right' | 'arrow-down'

const PATHS: Record<IconName, string> = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  'arrow-left': 'M19 12H5M12 19l-7-7 7-7',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  'arrow-down': 'M12 5v14M5 12l7 7 7-7',
}

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number | string
  title?: string
}

export function Icon({ name, size = '1em', title, ...rest }: IconProps) {
  const labelled = title != null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? title : undefined}
      aria-hidden={labelled ? undefined : true}
      {...rest}
    >
      {labelled ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  )
}
```

- [ ] **Step 4: Create `src/components/Icon/index.ts`**

```ts
export { Icon } from './Icon.js'
export type { IconName, IconProps } from './Icon.js'
```

- [ ] **Step 5: Append to `src/index.ts`**

```ts
export { Icon } from './components/Icon/index.js'
export type { IconName, IconProps } from './components/Icon/index.js'
```

- [ ] **Step 6: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Icon/Icon.test.tsx
```
Expected: exports regenerated (now includes `./icon`); typecheck exits 0; all 3 tests pass in **both** projects (6 passed).

- [ ] **Step 7: Create `src/components/Icon/Icon.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from './Icon'

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  args: { name: 'plus', size: 24 },
}

export default meta
type Story = StoryObj<typeof Icon>

export const Plus: Story = { args: { name: 'plus' } }
export const Minus: Story = { args: { name: 'minus' } }
export const ArrowLeft: Story = { args: { name: 'arrow-left' } }
export const ArrowRight: Story = { args: { name: 'arrow-right' } }
export const ArrowDown: Story = { args: { name: 'arrow-down' } }
```

---

## Task 3: Overline

**Files:**
- Test: `src/components/Overline/Overline.test.tsx`
- Create: `src/components/Overline/Overline.module.css`
- Create: `src/components/Overline/Overline.tsx`
- Create: `src/components/Overline/index.ts`
- Create: `src/components/Overline/Overline.stories.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test** — `src/components/Overline/Overline.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { Overline } from './Overline'

test('renders its children', () => {
  render(<Overline>Warning signs</Overline>)
  expect(screen.getByText('Warning signs')).toBeInTheDocument()
})

test('renders a span by default and respects the `as` prop', () => {
  const { container, rerender } = render(<Overline>x</Overline>)
  expect(container.querySelector('span')).toBeInTheDocument()
  rerender(<Overline as="p">x</Overline>)
  expect(container.querySelector('p')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Overline/Overline.test.tsx`
Expected: FAIL — `Failed to resolve import "./Overline"`.

- [ ] **Step 3: Create `src/components/Overline/Overline.module.css`**

```css
.overline {
  display: block;
  font-size: var(--hds-font-size-xs, 0.75rem);
  font-weight: var(--hds-font-weight-medium, 500);
  letter-spacing: var(--hds-letter-spacing-wide, 0.08em);
  text-transform: uppercase;
  color: var(--hds-color-muted, #6b7280);
  line-height: var(--hds-line-height-tight, 1.2);
}
```

- [ ] **Step 4: Create `src/components/Overline/Overline.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './Overline.module.css'

export interface OverlineProps extends HTMLAttributes<HTMLElement> {
  as?: 'span' | 'p' | 'div'
}

export function Overline({ as: Tag = 'span', className, ...rest }: OverlineProps) {
  return <Tag className={[styles.overline, className].filter(Boolean).join(' ')} {...rest} />
}
```

- [ ] **Step 5: Create `src/components/Overline/index.ts`**

```ts
export { Overline } from './Overline.js'
export type { OverlineProps } from './Overline.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { Overline } from './components/Overline/index.js'
export type { OverlineProps } from './components/Overline/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Overline/Overline.test.tsx
```
Expected: `./overline` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/Overline/Overline.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Overline } from './Overline'

const meta: Meta<typeof Overline> = {
  title: 'Components/Overline',
  component: Overline,
  args: { children: 'Your results' },
}

export default meta
type Story = StoryObj<typeof Overline>

export const Default: Story = {}
```

---

## Task 4: Heading

**Files:**
- Test: `src/components/Heading/Heading.test.tsx`
- Create: `src/components/Heading/Heading.module.css`
- Create: `src/components/Heading/Heading.tsx`
- Create: `src/components/Heading/index.ts`
- Create: `src/components/Heading/Heading.stories.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test** — `src/components/Heading/Heading.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'

test('renders the heading text at level 1', () => {
  render(<Heading level={1}>Before you start</Heading>)
  expect(screen.getByRole('heading', { name: 'Before you start', level: 1 })).toBeInTheDocument()
})

test('renders the requested heading level', () => {
  render(<Heading level={2}>Subtitle</Heading>)
  expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Heading/Heading.test.tsx`
Expected: FAIL — `Failed to resolve import "./Heading"`.

- [ ] **Step 3: Create `src/components/Heading/Heading.module.css`**

```css
.heading {
  margin: 0;
  font-weight: var(--hds-font-weight-bold, 700);
  line-height: var(--hds-line-height-tight, 1.2);
  color: var(--hds-color-strong, #1a1a1a);
}

.level1 {
  font-size: var(--hds-font-size-2xl, 2.25rem);
}

.level2 {
  font-size: var(--hds-font-size-xl, 1.75rem);
}

.level3 {
  font-size: var(--hds-font-size-lg, 1.25rem);
}
```

- [ ] **Step 4: Create `src/components/Heading/Heading.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './Heading.module.css'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3
}

export function Heading({ level, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3'
  const classes = [styles.heading, styles[`level${level}`], className].filter(Boolean).join(' ')
  return <Tag className={classes} {...rest} />
}
```

- [ ] **Step 5: Create `src/components/Heading/index.ts`**

```ts
export { Heading } from './Heading.js'
export type { HeadingProps } from './Heading.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { Heading } from './components/Heading/index.js'
export type { HeadingProps } from './components/Heading/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Heading/Heading.test.tsx
```
Expected: `./heading` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/Heading/Heading.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading } from './Heading'

const meta: Meta<typeof Heading> = {
  title: 'Components/Heading',
  component: Heading,
  args: { level: 1, children: 'How old are you?' },
}

export default meta
type Story = StoryObj<typeof Heading>

export const Level1: Story = { args: { level: 1 } }
export const Level2: Story = { args: { level: 2 } }
export const Level3: Story = { args: { level: 3 } }
```

---

## Task 5: Text

**Files:**
- Test: `src/components/Text/Text.test.tsx`
- Create: `src/components/Text/Text.module.css`
- Create: `src/components/Text/Text.tsx`
- Create: `src/components/Text/index.ts`
- Create: `src/components/Text/Text.stories.tsx`
- Modify: `src/index.ts`

> **Disclaimer/fine-print is `Text size="sm" tone="muted"`** — no separate component.

- [ ] **Step 1: Write the failing test** — `src/components/Text/Text.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

test('renders body text in a paragraph by default', () => {
  const { container } = render(<Text>Hello</Text>)
  expect(container.querySelector('p')).toHaveTextContent('Hello')
})

test('reflects tone and size via data attributes', () => {
  render(
    <Text tone="muted" size="sm">
      Fine print
    </Text>,
  )
  const el = screen.getByText('Fine print')
  expect(el).toHaveAttribute('data-tone', 'muted')
  expect(el).toHaveAttribute('data-size', 'sm')
})

test('can render as a span', () => {
  const { container } = render(<Text as="span">inline</Text>)
  expect(container.querySelector('span')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Text/Text.test.tsx`
Expected: FAIL — `Failed to resolve import "./Text"`.

- [ ] **Step 3: Create `src/components/Text/Text.module.css`**

```css
.text {
  margin: 0;
  font-size: var(--hds-font-size-md, 1rem);
  line-height: var(--hds-line-height-normal, 1.6);
  color: var(--hds-color-text, #1a1d20);
}

.text[data-size='sm'] {
  font-size: var(--hds-font-size-sm, 0.875rem);
}

.text[data-tone='muted'] {
  color: var(--hds-color-muted, #6b7280);
}
```

- [ ] **Step 4: Create `src/components/Text/Text.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './Text.module.css'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span'
  tone?: 'default' | 'muted'
  size?: 'sm' | 'md'
}

export function Text({ as: Tag = 'p', tone = 'default', size = 'md', className, ...rest }: TextProps) {
  return (
    <Tag
      data-tone={tone}
      data-size={size}
      className={[styles.text, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
```

- [ ] **Step 5: Create `src/components/Text/index.ts`**

```ts
export { Text } from './Text.js'
export type { TextProps } from './Text.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { Text } from './components/Text/index.js'
export type { TextProps } from './components/Text/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Text/Text.test.tsx
```
Expected: `./text` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/Text/Text.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './Text'

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  args: { children: 'This check gives you a general orientation about your risk.' },
}

export default meta
type Story = StoryObj<typeof Text>

export const Body: Story = {}
export const Muted: Story = { args: { tone: 'muted' } }
export const Disclaimer: Story = {
  args: {
    size: 'sm',
    tone: 'muted',
    children: 'This tool does not replace a medical diagnosis or physical examination.',
  },
}
```

---

## Task 6: Divider

**Files:**
- Test: `src/components/Divider/Divider.test.tsx`
- Create: `src/components/Divider/Divider.module.css`
- Create: `src/components/Divider/Divider.tsx`
- Create: `src/components/Divider/index.ts`
- Create: `src/components/Divider/Divider.stories.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test** — `src/components/Divider/Divider.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { Divider } from './Divider'

test('renders a separator', () => {
  render(<Divider />)
  expect(screen.getByRole('separator')).toBeInTheDocument()
})

test('merges a custom className', () => {
  render(<Divider className="extra" />)
  expect(screen.getByRole('separator')).toHaveClass('extra')
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Divider/Divider.test.tsx`
Expected: FAIL — `Failed to resolve import "./Divider"`.

- [ ] **Step 3: Create `src/components/Divider/Divider.module.css`**

```css
.divider {
  border: 0;
  border-top: 1px solid var(--hds-color-border, #c7ccd1);
  margin: var(--hds-space-5, 1.5rem) 0;
}
```

- [ ] **Step 4: Create `src/components/Divider/Divider.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './Divider.module.css'

export type DividerProps = HTMLAttributes<HTMLHRElement>

export function Divider({ className, ...rest }: DividerProps) {
  return <hr className={[styles.divider, className].filter(Boolean).join(' ')} {...rest} />
}
```

- [ ] **Step 5: Create `src/components/Divider/index.ts`**

```ts
export { Divider } from './Divider.js'
export type { DividerProps } from './Divider.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { Divider } from './components/Divider/index.js'
export type { DividerProps } from './components/Divider/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Divider/Divider.test.tsx
```
Expected: `./divider` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/Divider/Divider.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Divider } from './Divider'

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
}

export default meta
type Story = StoryObj<typeof Divider>

export const Default: Story = {}
```

---

## Task 7: List

**Files:**
- Test: `src/components/List/List.test.tsx`
- Create: `src/components/List/List.module.css`
- Create: `src/components/List/List.tsx`
- Create: `src/components/List/index.ts`
- Create: `src/components/List/List.stories.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test** — `src/components/List/List.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { List } from './List'

test('renders a list with its items', () => {
  render(
    <List>
      <li>Limited mole count</li>
      <li>No atypical moles reported</li>
    </List>,
  )
  expect(screen.getByRole('list')).toBeInTheDocument()
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/List/List.test.tsx`
Expected: FAIL — `Failed to resolve import "./List"`.

- [ ] **Step 3: Create `src/components/List/List.module.css`**

```css
.list {
  margin: 0;
  padding-left: var(--hds-space-4, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--hds-space-2, 0.5rem);
  color: var(--hds-color-text, #1a1d20);
  line-height: var(--hds-line-height-normal, 1.6);
}
```

- [ ] **Step 4: Create `src/components/List/List.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './List.module.css'

export type ListProps = HTMLAttributes<HTMLUListElement>

export function List({ className, ...rest }: ListProps) {
  return <ul className={[styles.list, className].filter(Boolean).join(' ')} {...rest} />
}
```

- [ ] **Step 5: Create `src/components/List/index.ts`**

```ts
export { List } from './List.js'
export type { ListProps } from './List.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { List } from './components/List/index.js'
export type { ListProps } from './components/List/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/List/List.test.tsx
```
Expected: `./list` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/List/List.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { List } from './List'

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
}

export default meta
type Story = StoryObj<typeof List>

export const Default: Story = {
  render: () => (
    <List>
      <li>Limited mole count</li>
      <li>No atypical moles reported</li>
      <li>No family history of melanoma</li>
    </List>
  ),
}
```

---

## Task 8: Card

**Files:**
- Test: `src/components/Card/Card.test.tsx`
- Create: `src/components/Card/Card.module.css`
- Create: `src/components/Card/Card.tsx`
- Create: `src/components/Card/index.ts`
- Create: `src/components/Card/Card.stories.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test** — `src/components/Card/Card.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

test('renders children inside a div by default', () => {
  render(<Card>content</Card>)
  expect(screen.getByText('content').tagName).toBe('DIV')
})

test('reflects variant and padding via data attributes', () => {
  render(
    <Card variant="dashed" padding="sm">
      x
    </Card>,
  )
  const el = screen.getByText('x')
  expect(el).toHaveAttribute('data-variant', 'dashed')
  expect(el).toHaveAttribute('data-padding', 'sm')
})

test('can render as a different element', () => {
  render(<Card as="section">x</Card>)
  expect(screen.getByText('x').tagName).toBe('SECTION')
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Card/Card.test.tsx`
Expected: FAIL — `Failed to resolve import "./Card"`.

- [ ] **Step 3: Create `src/components/Card/Card.module.css`**

```css
.card {
  background: var(--hds-color-bg, #ffffff);
  border: 1px solid var(--hds-color-border, #c7ccd1);
  border-radius: var(--hds-radius-md, 6px);
  color: var(--hds-color-text, #1a1d20);
}

.card[data-variant='dashed'] {
  border-style: dashed;
  border-color: var(--hds-color-border-dashed, #c7ccd1);
}

.card[data-padding='none'] {
  padding: 0;
}

.card[data-padding='sm'] {
  padding: var(--hds-space-3, 0.75rem);
}

.card[data-padding='md'] {
  padding: var(--hds-space-5, 1.5rem);
}
```

- [ ] **Step 4: Create `src/components/Card/Card.tsx`**

```tsx
import type { ElementType, HTMLAttributes } from 'react'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: 'solid' | 'dashed'
  padding?: 'none' | 'sm' | 'md'
}

export function Card({ as: Tag = 'div', variant = 'solid', padding = 'md', className, ...rest }: CardProps) {
  return (
    <Tag
      data-variant={variant}
      data-padding={padding}
      className={[styles.card, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
```

- [ ] **Step 5: Create `src/components/Card/index.ts`**

```ts
export { Card } from './Card.js'
export type { CardProps } from './Card.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { Card } from './components/Card/index.js'
export type { CardProps } from './components/Card/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Card/Card.test.tsx
```
Expected: `./card` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/Card/Card.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: { children: 'Card content' },
}

export default meta
type Story = StoryObj<typeof Card>

export const Solid: Story = { args: { variant: 'solid' } }
export const Dashed: Story = { args: { variant: 'dashed' } }
```

---

## Task 9: InfoCard

**Files:**
- Test: `src/components/InfoCard/InfoCard.test.tsx`
- Create: `src/components/InfoCard/InfoCard.module.css`
- Create: `src/components/InfoCard/InfoCard.tsx`
- Create: `src/components/InfoCard/index.ts`
- Create: `src/components/InfoCard/InfoCard.stories.tsx`
- Modify: `src/index.ts`

> Builds on `Card` (`variant="dashed"`) + `Overline`. Importing InfoCard intentionally pulls Card and Overline (they are used).

- [ ] **Step 1: Write the failing test** — `src/components/InfoCard/InfoCard.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { InfoCard } from './InfoCard'

test('renders the label and body', () => {
  render(<InfoCard label="Private">Runs entirely in your browser.</InfoCard>)
  expect(screen.getByText('Private')).toBeInTheDocument()
  expect(screen.getByText('Runs entirely in your browser.')).toBeInTheDocument()
})

test('uses a dashed card surface', () => {
  const { container } = render(<InfoCard label="L">body</InfoCard>)
  expect(container.querySelector('[data-variant="dashed"]')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/InfoCard/InfoCard.test.tsx`
Expected: FAIL — `Failed to resolve import "./InfoCard"`.

- [ ] **Step 3: Create `src/components/InfoCard/InfoCard.module.css`**

```css
.infoCard {
  display: flex;
  flex-direction: column;
  gap: var(--hds-space-2, 0.5rem);
}

.body {
  color: var(--hds-color-text, #1a1d20);
  line-height: var(--hds-line-height-normal, 1.6);
}
```

- [ ] **Step 4: Create `src/components/InfoCard/InfoCard.tsx`**

```tsx
import type { HTMLAttributes, ReactNode } from 'react'
import { Card } from '../Card/index.js'
import { Overline } from '../Overline/index.js'
import styles from './InfoCard.module.css'

export interface InfoCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  children: ReactNode
}

export function InfoCard({ label, children, className, ...rest }: InfoCardProps) {
  return (
    <Card
      variant="dashed"
      className={[styles.infoCard, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <Overline>{label}</Overline>
      <div className={styles.body}>{children}</div>
    </Card>
  )
}
```

- [ ] **Step 5: Create `src/components/InfoCard/index.ts`**

```ts
export { InfoCard } from './InfoCard.js'
export type { InfoCardProps } from './InfoCard.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { InfoCard } from './components/InfoCard/index.js'
export type { InfoCardProps } from './components/InfoCard/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/InfoCard/InfoCard.test.tsx
```
Expected: `./infocard` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/InfoCard/InfoCard.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { InfoCard } from './InfoCard'

const meta: Meta<typeof InfoCard> = {
  title: 'Components/InfoCard',
  component: InfoCard,
  args: { label: 'Private', children: 'Runs entirely in your browser. No answers stored or transmitted.' },
}

export default meta
type Story = StoryObj<typeof InfoCard>

export const Default: Story = {}
```

---

## Task 10: Callout

**Files:**
- Test: `src/components/Callout/Callout.test.tsx`
- Create: `src/components/Callout/Callout.module.css`
- Create: `src/components/Callout/Callout.tsx`
- Create: `src/components/Callout/index.ts`
- Create: `src/components/Callout/Callout.stories.tsx`
- Modify: `src/index.ts`

> Implementation refinement vs spec: `Callout` is its **own root element** (not `Card`-based). The `accent` variant uses a subtle background + left accent bar (no full border) and the `subtle` variant uses a dashed border, neither of which maps cleanly onto `Card`'s always-bordered surface. Public API (variant + action slot) is unchanged.

- [ ] **Step 1: Write the failing test** — `src/components/Callout/Callout.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { Callout } from './Callout'

test('renders its content', () => {
  render(<Callout>Both tracks are in the low range.</Callout>)
  expect(screen.getByText('Both tracks are in the low range.')).toBeInTheDocument()
})

test('defaults to the accent variant', () => {
  render(<Callout>message</Callout>)
  expect(screen.getByText('message').closest('[data-variant]')).toHaveAttribute('data-variant', 'accent')
})

test('renders an action when provided', () => {
  render(<Callout action={<button type="button">ABCDE guide</button>}>Check your moles</Callout>)
  expect(screen.getByRole('button', { name: 'ABCDE guide' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Callout/Callout.test.tsx`
Expected: FAIL — `Failed to resolve import "./Callout"`.

- [ ] **Step 3: Create `src/components/Callout/Callout.module.css`**

```css
.callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--hds-space-4, 1rem);
  padding: var(--hds-space-4, 1rem);
  border-radius: var(--hds-radius-sm, 4px);
}

.callout[data-variant='accent'] {
  background: var(--hds-color-surface-subtle, #f5f5f5);
  border-left: 4px solid var(--hds-color-accent-bar, #1a1a1a);
}

.callout[data-variant='subtle'] {
  background: transparent;
  border: 1px dashed var(--hds-color-border-dashed, #c7ccd1);
}

.content {
  color: var(--hds-color-text, #1a1d20);
  line-height: var(--hds-line-height-normal, 1.6);
}

.action {
  flex-shrink: 0;
}
```

- [ ] **Step 4: Create `src/components/Callout/Callout.tsx`**

```tsx
import type { HTMLAttributes, ReactNode } from 'react'
import styles from './Callout.module.css'

export interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'accent' | 'subtle'
  action?: ReactNode
  children: ReactNode
}

export function Callout({ variant = 'accent', action, children, className, ...rest }: CalloutProps) {
  return (
    <div
      data-variant={variant}
      className={[styles.callout, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className={styles.content}>{children}</div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/Callout/index.ts`**

```ts
export { Callout } from './Callout.js'
export type { CalloutProps } from './Callout.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { Callout } from './components/Callout/index.js'
export type { CalloutProps } from './components/Callout/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Callout/Callout.test.tsx
```
Expected: `./callout` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/Callout/Callout.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Callout } from './Callout'

const meta: Meta<typeof Callout> = {
  title: 'Components/Callout',
  component: Callout,
  args: { children: 'Both tracks are in the low range. Routine skin awareness is sufficient.' },
}

export default meta
type Story = StoryObj<typeof Callout>

export const Accent: Story = { args: { variant: 'accent' } }
export const Subtle: Story = { args: { variant: 'subtle' } }
export const WithAction: Story = {
  args: {
    variant: 'subtle',
    children: 'Want to check your moles? Use the ABCDE guide further down this page.',
    action: <button type="button">ABCDE guide</button>,
  },
}
```

---

## Task 11: TextLink

**Files:**
- Test: `src/components/TextLink/TextLink.test.tsx`
- Create: `src/components/TextLink/TextLink.module.css`
- Create: `src/components/TextLink/TextLink.tsx`
- Create: `src/components/TextLink/index.ts`
- Create: `src/components/TextLink/TextLink.stories.tsx`
- Modify: `src/index.ts`

> Renders `<a>` when `href` is given, otherwise `<button type="button">` (Back / Start over are actions, not URLs).

- [ ] **Step 1: Write the failing test** — `src/components/TextLink/TextLink.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextLink } from './TextLink'

test('renders a button when no href is given', () => {
  render(<TextLink>Back</TextLink>)
  expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
})

test('renders an anchor when href is given', () => {
  render(<TextLink href="/help">Help</TextLink>)
  expect(screen.getByRole('link', { name: 'Help' })).toHaveAttribute('href', '/help')
})

test('calls onClick when activated as a button', async () => {
  const onClick = vi.fn()
  render(<TextLink onClick={onClick}>Back</TextLink>)
  await userEvent.click(screen.getByRole('button', { name: 'Back' }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

test('renders a leading icon alongside the label', () => {
  render(<TextLink leadingIcon={<span data-testid="ic" />}>Back</TextLink>)
  expect(screen.getByTestId('ic')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/TextLink/TextLink.test.tsx`
Expected: FAIL — `Failed to resolve import "./TextLink"`.

- [ ] **Step 3: Create `src/components/TextLink/TextLink.module.css`**

```css
.link {
  display: inline-flex;
  align-items: center;
  gap: var(--hds-space-1, 0.25rem);
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: var(--hds-color-strong, #1a1a1a);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.link:hover {
  color: var(--hds-color-muted, #6b7280);
}

.link:focus-visible {
  outline: 2px solid var(--hds-color-strong, #1a1a1a);
  outline-offset: 2px;
}

.icon {
  display: inline-flex;
}
```

- [ ] **Step 4: Create `src/components/TextLink/TextLink.tsx`**

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { forwardRef } from 'react'
import styles from './TextLink.module.css'

interface BaseProps {
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  children: ReactNode
}

export type TextLinkProps = BaseProps &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps>)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps>)
  )

export const TextLink = forwardRef<HTMLAnchorElement | HTMLButtonElement, TextLinkProps>(
  function TextLink({ leadingIcon, trailingIcon, children, className, ...rest }, ref) {
    const classes = [styles.link, className].filter(Boolean).join(' ')
    const inner = (
      <>
        {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
        <span>{children}</span>
        {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
      </>
    )

    if (typeof (rest as { href?: string }).href === 'string') {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          className={classes}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {inner}
        </a>
      )
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        className={classes}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {inner}
      </button>
    )
  },
)
```

- [ ] **Step 5: Create `src/components/TextLink/index.ts`**

```ts
export { TextLink } from './TextLink.js'
export type { TextLinkProps } from './TextLink.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { TextLink } from './components/TextLink/index.js'
export type { TextLinkProps } from './components/TextLink/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/TextLink/TextLink.test.tsx
```
Expected: `./textlink` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/TextLink/TextLink.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Icon } from '../Icon/Icon'
import { TextLink } from './TextLink'

const meta: Meta<typeof TextLink> = {
  title: 'Components/TextLink',
  component: TextLink,
  args: { children: 'Back' },
}

export default meta
type Story = StoryObj<typeof TextLink>

export const BackAction: Story = {
  args: { leadingIcon: <Icon name="arrow-left" />, children: 'Back' },
}
export const StartOver: Story = { args: { children: 'Start over' } }
export const AsLink: Story = { args: { href: '#', children: 'Learn more' } }
```

---

## Task 12: StepProgress

**Files:**
- Test: `src/components/StepProgress/StepProgress.test.tsx`
- Create: `src/components/StepProgress/StepProgress.module.css`
- Create: `src/components/StepProgress/StepProgress.tsx`
- Create: `src/components/StepProgress/index.ts`
- Create: `src/components/StepProgress/StepProgress.stories.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test** — `src/components/StepProgress/StepProgress.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { StepProgress } from './StepProgress'

test('renders a default label from current/total', () => {
  render(<StepProgress current={1} total={14} />)
  expect(screen.getByText('Step 1 of 14')).toBeInTheDocument()
})

test('exposes progressbar semantics', () => {
  render(<StepProgress current={3} total={14} />)
  const bar = screen.getByRole('progressbar')
  expect(bar).toHaveAttribute('aria-valuenow', '3')
  expect(bar).toHaveAttribute('aria-valuemin', '0')
  expect(bar).toHaveAttribute('aria-valuemax', '14')
})

test('accepts a custom label', () => {
  render(<StepProgress current={2} total={14} label="Halfway there" />)
  expect(screen.getByText('Halfway there')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/StepProgress/StepProgress.test.tsx`
Expected: FAIL — `Failed to resolve import "./StepProgress"`.

- [ ] **Step 3: Create `src/components/StepProgress/StepProgress.module.css`**

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--hds-space-2, 0.5rem);
}

.label {
  font-size: var(--hds-font-size-sm, 0.875rem);
  color: var(--hds-color-muted, #6b7280);
}

.track {
  height: 3px;
  background: var(--hds-color-track, #e5e7eb);
  border-radius: var(--hds-radius-sm, 4px);
  overflow: hidden;
}

.fill {
  height: 100%;
  background: var(--hds-color-strong, #1a1a1a);
}
```

- [ ] **Step 4: Create `src/components/StepProgress/StepProgress.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './StepProgress.module.css'

export interface StepProgressProps extends HTMLAttributes<HTMLDivElement> {
  current: number
  total: number
  label?: string
}

export function StepProgress({ current, total, label, className, ...rest }: StepProgressProps) {
  const text = label ?? `Step ${current} of ${total}`
  const pct = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.label}>{text}</div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={text}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/StepProgress/index.ts`**

```ts
export { StepProgress } from './StepProgress.js'
export type { StepProgressProps } from './StepProgress.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { StepProgress } from './components/StepProgress/index.js'
export type { StepProgressProps } from './components/StepProgress/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/StepProgress/StepProgress.test.tsx
```
Expected: `./stepprogress` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/StepProgress/StepProgress.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { StepProgress } from './StepProgress'

const meta: Meta<typeof StepProgress> = {
  title: 'Components/StepProgress',
  component: StepProgress,
  args: { current: 3, total: 14 },
}

export default meta
type Story = StoryObj<typeof StepProgress>

export const Start: Story = { args: { current: 1, total: 14 } }
export const Middle: Story = { args: { current: 8, total: 14 } }
export const CustomLabel: Story = { args: { current: 14, total: 14, label: 'Final step' } }
```

---

## Task 13: RiskScale

**Files:**
- Test: `src/components/RiskScale/RiskScale.test.tsx`
- Create: `src/components/RiskScale/RiskScale.module.css`
- Create: `src/components/RiskScale/RiskScale.tsx`
- Create: `src/components/RiskScale/index.ts`
- Create: `src/components/RiskScale/RiskScale.stories.tsx`
- Modify: `src/index.ts`

- [ ] **Step 1: Write the failing test** — `src/components/RiskScale/RiskScale.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { RiskScale } from './RiskScale'

const segments = ['Low', 'Slightly', 'Elevated', 'Significant']

test('renders the title', () => {
  render(<RiskScale title="Melanoma" value="Low" segments={segments} activeIndex={0} />)
  expect(screen.getByText('Melanoma')).toBeInTheDocument()
})

test('exposes an accessible label combining title and value', () => {
  render(<RiskScale title="Melanoma" value="Low" segments={segments} activeIndex={0} />)
  expect(screen.getByRole('img', { name: 'Melanoma: Low' })).toBeInTheDocument()
})

test('marks exactly the active segment', () => {
  const { container } = render(
    <RiskScale title="BCC / SCC" value="Elevated" segments={segments} activeIndex={2} />,
  )
  expect(container.querySelectorAll('[data-active="true"]')).toHaveLength(1)
})

test('renders every segment label', () => {
  const { container } = render(
    <RiskScale title="Melanoma" value="Low" segments={segments} activeIndex={0} />,
  )
  const labels = container.querySelectorAll('[data-segment-label]')
  expect(labels).toHaveLength(4)
  expect(labels[3]).toHaveTextContent('Significant')
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/RiskScale/RiskScale.test.tsx`
Expected: FAIL — `Failed to resolve import "./RiskScale"`.

- [ ] **Step 3: Create `src/components/RiskScale/RiskScale.module.css`**

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--hds-space-2, 0.5rem);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.title {
  font-size: var(--hds-font-size-xs, 0.75rem);
  letter-spacing: var(--hds-letter-spacing-wide, 0.08em);
  text-transform: uppercase;
  color: var(--hds-color-muted, #6b7280);
}

.value {
  font-weight: var(--hds-font-weight-bold, 700);
  color: var(--hds-color-strong, #1a1a1a);
}

.scale {
  display: flex;
  gap: 4px;
}

.segment {
  flex: 1;
  height: 28px;
  background: var(--hds-color-track, #e5e7eb);
  border-radius: var(--hds-radius-sm, 4px);
}

.segment[data-active='true'] {
  background: var(--hds-color-strong, #1a1a1a);
}

.labels {
  display: flex;
  gap: 4px;
}

.segmentLabel {
  flex: 1;
  font-size: var(--hds-font-size-xs, 0.75rem);
  color: var(--hds-color-muted, #6b7280);
  text-align: center;
}
```

- [ ] **Step 4: Create `src/components/RiskScale/RiskScale.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import styles from './RiskScale.module.css'

export interface RiskScaleProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  value: string
  segments: string[]
  activeIndex: number
}

export function RiskScale({ title, value, segments, activeIndex, className, ...rest }: RiskScaleProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')} {...rest}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <div className={styles.scale} role="img" aria-label={`${title}: ${value}`}>
        {segments.map((segment, index) => (
          <div
            key={segment}
            className={styles.segment}
            data-active={index === activeIndex ? 'true' : undefined}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {segments.map((segment) => (
          <span key={segment} className={styles.segmentLabel} data-segment-label="">
            {segment}
          </span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/components/RiskScale/index.ts`**

```ts
export { RiskScale } from './RiskScale.js'
export type { RiskScaleProps } from './RiskScale.js'
```

- [ ] **Step 6: Append to `src/index.ts`**

```ts
export { RiskScale } from './components/RiskScale/index.js'
export type { RiskScaleProps } from './components/RiskScale/index.js'
```

- [ ] **Step 7: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/RiskScale/RiskScale.test.tsx
```
Expected: `./riskscale` export added; typecheck 0; tests pass in both projects.

- [ ] **Step 8: Create `src/components/RiskScale/RiskScale.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RiskScale } from './RiskScale'

const meta: Meta<typeof RiskScale> = {
  title: 'Components/RiskScale',
  component: RiskScale,
  args: {
    title: 'Melanoma',
    value: 'Low',
    segments: ['Low', 'Slightly', 'Elevated', 'Significant'],
    activeIndex: 0,
  },
}

export default meta
type Story = StoryObj<typeof RiskScale>

export const Low: Story = {}
export const Elevated: Story = { args: { title: 'BCC / SCC', value: 'Elevated', activeIndex: 2 } }
```

---

## Task 14: OptionGroup + OptionCard

**Files:**
- Create: `src/components/OptionGroup/context.ts`
- Create: `src/components/OptionGroup/OptionGroup.module.css`
- Create: `src/components/OptionGroup/OptionGroup.tsx`
- Create: `src/components/OptionGroup/OptionCard.module.css`
- Create: `src/components/OptionGroup/OptionCard.tsx`
- Create: `src/components/OptionGroup/index.ts`
- Test: `src/components/OptionGroup/OptionGroup.test.tsx`
- Create: `src/components/OptionGroup/OptionGroup.stories.tsx`
- Modify: `src/index.ts`

> Single-select radio-group pattern. `OptionGroup` owns selection (controlled via `value`/`onChange` or uncontrolled via `defaultValue`), provides ARIA `radiogroup` semantics, roving tabindex, and arrow-key navigation. `OptionCard` reads selection from context when inside a group; standalone it falls back to a `selected` prop with toggle (`aria-pressed`) semantics.

- [ ] **Step 1: Write the failing test** — `src/components/OptionGroup/OptionGroup.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OptionCard } from './OptionCard'
import { OptionGroup } from './OptionGroup'

function renderGroup(props: Record<string, unknown> = {}) {
  return render(
    <OptionGroup label="Answer" {...props}>
      <OptionCard value="yes" title="Yes" description="I have noticed a change." />
      <OptionCard value="no" title="No" description="Nothing new that I have noticed." />
      <OptionCard value="unsure" title="Not sure" />
    </OptionGroup>,
  )
}

test('renders a radiogroup with radio options', () => {
  renderGroup()
  expect(screen.getByRole('radiogroup', { name: 'Answer' })).toBeInTheDocument()
  expect(screen.getAllByRole('radio')).toHaveLength(3)
})

test('selecting an option marks it checked (uncontrolled)', async () => {
  renderGroup()
  await userEvent.click(screen.getByRole('radio', { name: /Yes/ }))
  expect(screen.getByRole('radio', { name: /Yes/ })).toHaveAttribute('aria-checked', 'true')
})

test('arrow keys move selection through the group', async () => {
  renderGroup()
  const yes = screen.getByRole('radio', { name: /Yes/ })
  yes.focus()
  await userEvent.click(yes)
  await userEvent.keyboard('{ArrowDown}')
  expect(screen.getByRole('radio', { name: /Nothing new/ })).toHaveAttribute('aria-checked', 'true')
})

test('calls onChange in controlled mode', async () => {
  const onChange = vi.fn()
  render(
    <OptionGroup label="A" value="yes" onChange={onChange}>
      <OptionCard value="yes" title="Yes" />
      <OptionCard value="no" title="No" />
    </OptionGroup>,
  )
  await userEvent.click(screen.getByRole('radio', { name: 'No' }))
  expect(onChange).toHaveBeenCalledWith('no')
})

test('standalone OptionCard reflects selected via aria-pressed', () => {
  render(<OptionCard value="x" title="Solo" selected />)
  expect(screen.getByRole('button', { name: 'Solo' })).toHaveAttribute('aria-pressed', 'true')
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/OptionGroup/OptionGroup.test.tsx`
Expected: FAIL — `Failed to resolve import "./OptionCard"` / `"./OptionGroup"`.

- [ ] **Step 3: Create `src/components/OptionGroup/context.ts`**

```ts
import { createContext, useContext } from 'react'

export interface OptionGroupContextValue {
  /** Currently selected value, if any. */
  value: string | undefined
  /** Value that should be in the tab order (roving tabindex target). */
  rovingValue: string | undefined
  /** Select a value. */
  select: (value: string) => void
}

export const OptionGroupContext = createContext<OptionGroupContextValue | null>(null)

export function useOptionGroup(): OptionGroupContextValue | null {
  return useContext(OptionGroupContext)
}
```

- [ ] **Step 4: Create `src/components/OptionGroup/OptionGroup.module.css`**

```css
.group {
  display: flex;
  flex-direction: column;
  gap: var(--hds-space-3, 0.75rem);
}
```

- [ ] **Step 5: Create `src/components/OptionGroup/OptionGroup.tsx`**

```tsx
import type { HTMLAttributes, KeyboardEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OptionGroupContext } from './context.js'
import styles from './OptionGroup.module.css'

export interface OptionGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  label?: string
}

const NAV_KEYS = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End']

export function OptionGroup({
  value: controlled,
  defaultValue,
  onChange,
  label,
  className,
  children,
  ...rest
}: OptionGroupProps) {
  const isControlled = controlled !== undefined
  const [uncontrolled, setUncontrolled] = useState<string | undefined>(defaultValue)
  const value = isControlled ? controlled : uncontrolled
  const [rovingValue, setRovingValue] = useState<string | undefined>(defaultValue)
  const groupRef = useRef<HTMLDivElement>(null)

  const select = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  // Roving tabindex target: the selected value, or (when nothing is selected)
  // the first enabled radio in DOM order.
  useEffect(() => {
    if (value !== undefined) {
      setRovingValue(value)
      return
    }
    const first = groupRef.current?.querySelector<HTMLElement>('[role="radio"]:not([disabled])')
    setRovingValue(first?.dataset.value)
  }, [value])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (!NAV_KEYS.includes(event.key)) return
    const group = groupRef.current
    if (!group) return
    const radios = Array.from(
      group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])'),
    )
    if (radios.length === 0) return
    const currentIndex = radios.indexOf(document.activeElement as HTMLButtonElement)
    let nextIndex = currentIndex
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % radios.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex <= 0 ? radios.length - 1 : currentIndex - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = radios.length - 1
        break
    }
    event.preventDefault()
    const next = radios[nextIndex]
    next?.focus()
    next?.click()
  }, [])

  const contextValue = useMemo(
    () => ({ value, rovingValue, select }),
    [value, rovingValue, select],
  )

  return (
    <OptionGroupContext.Provider value={contextValue}>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={label}
        className={[styles.group, className].filter(Boolean).join(' ')}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </div>
    </OptionGroupContext.Provider>
  )
}
```

- [ ] **Step 6: Create `src/components/OptionGroup/OptionCard.module.css`**

```css
.card {
  display: flex;
  align-items: center;
  gap: var(--hds-space-4, 1rem);
  width: 100%;
  text-align: left;
  padding: var(--hds-space-4, 1rem);
  background: var(--hds-color-bg, #ffffff);
  border: 1px solid var(--hds-color-border, #c7ccd1);
  border-radius: var(--hds-radius-md, 6px);
  font: inherit;
  color: var(--hds-color-text, #1a1d20);
  cursor: pointer;
}

.card:hover {
  border-color: var(--hds-color-strong, #1a1a1a);
}

.card:focus-visible {
  outline: 2px solid var(--hds-color-strong, #1a1a1a);
  outline-offset: 2px;
}

.card[data-selected='true'] {
  border-color: var(--hds-color-strong, #1a1a1a);
  box-shadow: inset 0 0 0 1px var(--hds-color-strong, #1a1a1a);
}

.card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.media {
  flex-shrink: 0;
  display: inline-flex;
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--hds-space-1, 0.25rem);
}

.title {
  font-weight: var(--hds-font-weight-bold, 700);
  color: var(--hds-color-strong, #1a1a1a);
}

.description {
  font-size: var(--hds-font-size-sm, 0.875rem);
  color: var(--hds-color-muted, #6b7280);
}
```

- [ ] **Step 7: Create `src/components/OptionGroup/OptionCard.tsx`**

```tsx
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { forwardRef } from 'react'
import { useOptionGroup } from './context.js'
import styles from './OptionCard.module.css'

export interface OptionCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'title'> {
  value: string
  title: ReactNode
  description?: ReactNode
  media?: ReactNode
  selected?: boolean
}

export const OptionCard = forwardRef<HTMLButtonElement, OptionCardProps>(function OptionCard(
  { value, title, description, media, selected: selectedProp, disabled, className, onClick, ...rest },
  ref,
) {
  const group = useOptionGroup()
  const inGroup = group !== null
  const selected = inGroup ? group.value === value : Boolean(selectedProp)
  const tabIndex = inGroup ? (group.rovingValue === value ? 0 : -1) : undefined

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (!event.defaultPrevented && inGroup && !disabled) {
      group.select(value)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      role={inGroup ? 'radio' : undefined}
      aria-checked={inGroup ? selected : undefined}
      aria-pressed={inGroup ? undefined : selected}
      data-value={value}
      data-selected={selected ? 'true' : undefined}
      disabled={disabled}
      tabIndex={tabIndex}
      className={[styles.card, className].filter(Boolean).join(' ')}
      onClick={handleClick}
      {...rest}
    >
      {media ? <span className={styles.media}>{media}</span> : null}
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {description ? <span className={styles.description}>{description}</span> : null}
      </span>
    </button>
  )
})
```

- [ ] **Step 8: Create `src/components/OptionGroup/index.ts`**

```ts
export { OptionCard } from './OptionCard.js'
export type { OptionCardProps } from './OptionCard.js'
export { OptionGroup } from './OptionGroup.js'
export type { OptionGroupProps } from './OptionGroup.js'
```

- [ ] **Step 9: Append to `src/index.ts`**

```ts
export { OptionCard } from './components/OptionGroup/index.js'
export type { OptionCardProps } from './components/OptionGroup/index.js'
export { OptionGroup } from './components/OptionGroup/index.js'
export type { OptionGroupProps } from './components/OptionGroup/index.js'
```

- [ ] **Step 10: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/OptionGroup/OptionGroup.test.tsx
```
Expected: `./optiongroup` export added; typecheck 0; all 5 tests pass in **both** projects (10 passed). This confirms context, roving tabindex, and arrow-key nav work under `preact/compat`.

- [ ] **Step 11: Create `src/components/OptionGroup/OptionGroup.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { OptionCard } from './OptionCard'
import { OptionGroup } from './OptionGroup'

const meta: Meta<typeof OptionGroup> = {
  title: 'Components/OptionGroup',
  component: OptionGroup,
  args: { label: 'Do you have a mole that is changing?' },
}

export default meta
type Story = StoryObj<typeof OptionGroup>

export const WithDescriptions: Story = {
  render: (args) => (
    <OptionGroup {...args} defaultValue="yes">
      <OptionCard value="yes" title="Yes" description="I have noticed a change or unusual spot." />
      <OptionCard value="no" title="No" description="Nothing new or changing that I have noticed." />
      <OptionCard value="unsure" title="Not sure" description="I may have noticed something but I am not certain." />
    </OptionGroup>
  ),
}

export const TitleOnly: Story = {
  render: (args) => (
    <OptionGroup {...args} label="What is your biological sex?">
      <OptionCard value="male" title="Male" />
      <OptionCard value="female" title="Female" />
    </OptionGroup>
  ),
}

export const WithMedia: Story = {
  render: (args) => (
    <OptionGroup {...args} label="How many moles do you have?">
      <OptionCard value="few" title="Very few" description="0 – 10 moles" media={<span aria-hidden>🔬</span>} />
      <OptionCard value="some" title="Some" description="11 – 25 moles" media={<span aria-hidden>🔬</span>} />
      <OptionCard value="many" title="Many" description="26 – 50 moles" media={<span aria-hidden>🔬</span>} />
    </OptionGroup>
  ),
}
```

---

## Task 15: Accordion + AccordionItem

**Files:**
- Create: `src/components/Accordion/context.ts`
- Create: `src/components/Accordion/Accordion.module.css`
- Create: `src/components/Accordion/Accordion.tsx`
- Create: `src/components/Accordion/AccordionItem.module.css`
- Create: `src/components/Accordion/AccordionItem.tsx`
- Create: `src/components/Accordion/index.ts`
- Test: `src/components/Accordion/Accordion.test.tsx`
- Create: `src/components/Accordion/Accordion.stories.tsx`
- Modify: `src/index.ts`

> `Accordion` owns open-state (controlled via `value`/`onChange` or uncontrolled via `defaultOpen`). `allowMultiple` (default `true`) toggles whether opening one closes the others. `AccordionItem` headers are real `<button aria-expanded aria-controls>`; panels are labelled regions toggled via `hidden`. Uses `Icon` for the `+`/`−` indicator.

- [ ] **Step 1: Write the failing test** — `src/components/Accordion/Accordion.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Accordion } from './Accordion'
import { AccordionItem } from './AccordionItem'

function renderAccordion(props: Record<string, unknown> = {}) {
  return render(
    <Accordion {...props}>
      <AccordionItem value="a" title="Question A">
        Answer A
      </AccordionItem>
      <AccordionItem value="b" title="Question B">
        Answer B
      </AccordionItem>
    </Accordion>,
  )
}

test('renders collapsed items by default', () => {
  renderAccordion()
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute('aria-expanded', 'false')
})

test('expands an item when its trigger is clicked', async () => {
  renderAccordion()
  await userEvent.click(screen.getByRole('button', { name: 'Question A' }))
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('region', { name: 'Question A' })).toBeVisible()
})

test('allows multiple open by default', async () => {
  renderAccordion()
  await userEvent.click(screen.getByRole('button', { name: 'Question A' }))
  await userEvent.click(screen.getByRole('button', { name: 'Question B' }))
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute('aria-expanded', 'true')
})

test('collapses others when allowMultiple is false', async () => {
  renderAccordion({ allowMultiple: false })
  await userEvent.click(screen.getByRole('button', { name: 'Question A' }))
  await userEvent.click(screen.getByRole('button', { name: 'Question B' }))
  expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute('aria-expanded', 'true')
})
```

- [ ] **Step 2: Run it, confirm failure**

Run: `npx vitest run src/components/Accordion/Accordion.test.tsx`
Expected: FAIL — `Failed to resolve import "./Accordion"` / `"./AccordionItem"`.

- [ ] **Step 3: Create `src/components/Accordion/context.ts`**

```ts
import { createContext, useContext } from 'react'

export interface AccordionContextValue {
  openItems: string[]
  toggle: (value: string) => void
}

export const AccordionContext = createContext<AccordionContextValue | null>(null)

export function useAccordion(): AccordionContextValue {
  const ctx = useContext(AccordionContext)
  if (!ctx) {
    throw new Error('AccordionItem must be used within an Accordion')
  }
  return ctx
}
```

- [ ] **Step 4: Create `src/components/Accordion/Accordion.module.css`**

```css
.accordion {
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 5: Create `src/components/Accordion/Accordion.tsx`**

```tsx
import type { HTMLAttributes } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { AccordionContext } from './context.js'
import styles from './Accordion.module.css'

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  allowMultiple?: boolean
  defaultOpen?: string[]
  value?: string[]
  onChange?: (openItems: string[]) => void
}

export function Accordion({
  allowMultiple = true,
  defaultOpen = [],
  value: controlled,
  onChange,
  className,
  children,
  ...rest
}: AccordionProps) {
  const isControlled = controlled !== undefined
  const [uncontrolled, setUncontrolled] = useState<string[]>(defaultOpen)
  const openItems = isControlled ? controlled : uncontrolled

  const toggle = useCallback(
    (itemValue: string) => {
      const isOpen = openItems.includes(itemValue)
      let next: string[]
      if (isOpen) {
        next = openItems.filter((v) => v !== itemValue)
      } else {
        next = allowMultiple ? [...openItems, itemValue] : [itemValue]
      }
      if (!isControlled) setUncontrolled(next)
      onChange?.(next)
    },
    [openItems, allowMultiple, isControlled, onChange],
  )

  const contextValue = useMemo(() => ({ openItems, toggle }), [openItems, toggle])

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={[styles.accordion, className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}
```

- [ ] **Step 6: Create `src/components/Accordion/AccordionItem.module.css`**

```css
.item {
  border-bottom: 1px solid var(--hds-color-border, #c7ccd1);
}

.heading {
  margin: 0;
}

.trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--hds-space-4, 1rem);
  width: 100%;
  padding: var(--hds-space-4, 1rem) 0;
  background: none;
  border: 0;
  font: inherit;
  text-align: left;
  cursor: pointer;
  color: var(--hds-color-strong, #1a1a1a);
}

.trigger:focus-visible {
  outline: 2px solid var(--hds-color-strong, #1a1a1a);
  outline-offset: 2px;
}

.title {
  font-weight: var(--hds-font-weight-medium, 500);
}

.panelInner {
  padding-bottom: var(--hds-space-4, 1rem);
  color: var(--hds-color-text, #1a1d20);
  line-height: var(--hds-line-height-normal, 1.6);
}
```

- [ ] **Step 7: Create `src/components/Accordion/AccordionItem.tsx`**

```tsx
import type { ReactNode } from 'react'
import { useId } from 'react'
import { Icon } from '../Icon/index.js'
import { useAccordion } from './context.js'
import styles from './AccordionItem.module.css'

export interface AccordionItemProps {
  value: string
  title: ReactNode
  children: ReactNode
  disabled?: boolean
}

export function AccordionItem({ value, title, children, disabled }: AccordionItemProps) {
  const { openItems, toggle } = useAccordion()
  const open = openItems.includes(value)
  const headingId = useId()
  const panelId = useId()

  return (
    <div className={styles.item}>
      <h3 className={styles.heading}>
        <button
          type="button"
          id={headingId}
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => toggle(value)}
        >
          <span className={styles.title}>{title}</span>
          <Icon name={open ? 'minus' : 'plus'} />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        className={styles.panel}
        hidden={!open}
      >
        <div className={styles.panelInner}>{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Create `src/components/Accordion/index.ts`**

```ts
export { Accordion } from './Accordion.js'
export type { AccordionProps } from './Accordion.js'
export { AccordionItem } from './AccordionItem.js'
export type { AccordionItemProps } from './AccordionItem.js'
```

- [ ] **Step 9: Append to `src/index.ts`**

```ts
export { Accordion } from './components/Accordion/index.js'
export type { AccordionProps } from './components/Accordion/index.js'
export { AccordionItem } from './components/Accordion/index.js'
export type { AccordionItemProps } from './components/Accordion/index.js'
```

- [ ] **Step 10: Regenerate exports, typecheck, run the test**

Run:
```bash
npm run gen:exports && npm run typecheck && npx vitest run src/components/Accordion/Accordion.test.tsx
```
Expected: `./accordion` export added; typecheck 0; all 4 tests pass in **both** projects (8 passed).

- [ ] **Step 11: Create `src/components/Accordion/Accordion.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion } from './Accordion'
import { AccordionItem } from './AccordionItem'

const meta: Meta<typeof Accordion> = {
  title: 'Components/Accordion',
  component: Accordion,
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Faq: Story = {
  render: () => (
    <Accordion>
      <AccordionItem value="diff" title="What is the difference between melanoma and BCC / SCC?">
        Melanoma arises from pigment cells; BCC and SCC are the most common keratinocyte cancers.
      </AccordionItem>
      <AccordionItem value="after" title="What happens after this check?">
        You receive a general risk orientation and a suggested next step.
      </AccordionItem>
      <AccordionItem value="reliable" title="How reliable is this tool?">
        It is a statistical orientation, not a diagnosis.
      </AccordionItem>
    </Accordion>
  ),
}

export const SingleOpen: Story = {
  render: () => (
    <Accordion allowMultiple={false} defaultOpen={['a']}>
      <AccordionItem value="a" title="First">
        Only one panel open at a time.
      </AccordionItem>
      <AccordionItem value="b" title="Second">
        Opening this closes the first.
      </AccordionItem>
    </Accordion>
  ),
}
```

---

## Task 16: Smoke app + full verification

**Files:**
- Modify: `examples/preact-app/src/main.tsx`

- [ ] **Step 1: Replace `examples/preact-app/src/main.tsx` to exercise the new components under `preact/compat`**

```tsx
import { Accordion } from '@hirslanden/ds/accordion'
import { AccordionItem } from '@hirslanden/ds/accordion'
import { Button } from '@hirslanden/ds/button'
import { Callout } from '@hirslanden/ds/callout'
import { Heading } from '@hirslanden/ds/heading'
import { OptionCard } from '@hirslanden/ds/optiongroup'
import { OptionGroup } from '@hirslanden/ds/optiongroup'
import { Overline } from '@hirslanden/ds/overline'
import { StepProgress } from '@hirslanden/ds/stepprogress'
import { Text } from '@hirslanden/ds/text'
import '@hirslanden/ds/styles/tokens.css'
import { render } from 'preact'

function App() {
  return (
    <main>
      <StepProgress current={1} total={14} />
      <Overline>Warning signs</Overline>
      <Heading level={1}>Do you have a mole that is changing?</Heading>
      <OptionGroup label="Warning signs" defaultValue="no">
        <OptionCard value="yes" title="Yes" description="I have noticed a change." />
        <OptionCard value="no" title="No" description="Nothing new that I have noticed." />
        <OptionCard value="unsure" title="Not sure" />
      </OptionGroup>
      <Callout>Routine skin awareness is sufficient at this stage.</Callout>
      <Accordion>
        <AccordionItem value="x" title="How reliable is this tool?">
          <Text>It is a statistical orientation, not a diagnosis.</Text>
        </AccordionItem>
      </Accordion>
      <Button variant="primary">Continue</Button>
    </main>
  )
}

const root = document.getElementById('app')
if (root) {
  render(<App />, root)
}
```

- [ ] **Step 2: Build the library, then build the smoke app under preact/compat**

Run:
```bash
npm run build
npm --prefix examples/preact-app install
npm --prefix examples/preact-app run build
```
Expected: the library builds (ESM + per-component CSS + tokens copy), then the Preact example builds successfully, resolving every new subpath (`/accordion`, `/callout`, `/heading`, `/optiongroup`, `/overline`, `/stepprogress`, `/text`) through `preact/compat`. A failure here is a real compat/packaging regression.

- [ ] **Step 3: Run the full verification suite**

Run:
```bash
npm run typecheck
npm test
npm run build
npm run verify:treeshake
npm run verify:pkg
npm run build-storybook
```
Expected, in order:
- `typecheck` — exits 0.
- `npm test` — every component's tests pass in **both** `react` and `compat` projects.
- `build` — ESM build with one CSS asset per styled component under `dist/assets/`.
- `verify:treeshake` — `✅ Tree-shaking OK: importing Button does not pull Input.` (the existing guard still holds; the new components don't leak into the Button import).
- `verify:pkg` — `publint` reports no problems and `attw --pack` reports correct types/exports for all new subpaths.
- `build-storybook` — builds to `storybook-static/`, exit 0, with a story present for every new component.

- [ ] **Step 4: Report completion**

Summarize which components were added and the verification results. **Do not commit or push** — hand the working tree to the user for review and version control.

---

## Self-Review (completed during planning)

- **Spec coverage:** All 14 components in spec §4 have tasks (Tasks 2–15). Tokens (§5) → Task 1. Build order (§6) → Tasks 1→15 order. Verification (§7) → Task 16. A11y notes (§8) are encoded in each component's test (radiogroup/radio + arrow keys, progressbar aria, region/button accordion, RiskScale `img` label, TextLink real `<a>`/`<button>`). Out-of-scope items (§9: Disclaimer, Badge, multi-select) are correctly omitted.
- **Placeholder scan:** No TBD/TODO; every code step contains complete, runnable code.
- **Type consistency:** Context types (`OptionGroupContextValue`, `AccordionContextValue`), prop names (`value`/`defaultValue`/`onChange`, `allowMultiple`/`defaultOpen`, `activeIndex`, `current`/`total`), and exported names match across tasks, folder `index.ts` files, and the root barrel. Paired components (`OptionGroup`/`OptionCard`, `Accordion`/`AccordionItem`) share one folder → one subpath, matching `generate-exports.mjs`.
- **Deviation flagged:** `Callout` is standalone rather than `Card`-based (Task 10 note) — public API unchanged from spec.
