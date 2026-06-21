# Hirslanden Design System — Styling Parity Remediation Plan

## Summary

The DS already matches hirslanden.ch on the brand fundamentals: **Metropolis font stack** (`"Metropolis", Arial, sans-serif`), **brand azure `#0094d4`**, **body/heading text `#534c46`**, **muted greige `#938880`**, the **heading scale 42/34/22px @ 700**, and **square primary buttons** (`border-radius: 0`, `#fff` on `#0094d4`, no shadow). Parity gaps are narrow: one confirmed brand-shade token (`--hds-color-primary-hover`), one confirmed Button `.lg` padding delta, one confirmed Overline letter-spacing over-tracking, one stray Divider fallback, two RiskScale literal cleanups, plus a cluster of cross-cutting **decisions** (flat-vs-shadowed Card, sharp-vs-2px radius across the system, 14px-vs-16px body copy, optional 600 weight, an opt-in muted/hero Heading variant). App-specific widgets (OptionGroup, RiskScale, StepProgress, Accordion, Icon) and the bordered Input have no/weak live homepage reference and are out of scope for forced changes.

---

## Global token changes

All edits in `src/styles/tokens.css`. Only confirmed / decision-needed token changes are listed.

| Token | Current | Proposed | Tag | Rationale | Components affected |
|---|---|---|---|---|---|
| `--hds-color-primary-hover` (line 8) | `#007cb3` | `#0072a3` | **[Confirmed]** | Local value is a hardcoded guess (comment literally says "to verify"). Live's only darker-azure is `#0072a3`. Unify the brand hover/active azure. | Button `.primary:hover`, TextLink `.link:hover` (intended cascade — both should move together) |
| `--hds-radius-sm` (line 25) | `2px` | `0` | **[Decision]** | Live UI is uniformly sharp (radius 0 everywhere). Only flip as part of a deliberate global sharp pass. | Callout, RiskScale, StepProgress |
| `--hds-radius-md` (line 26) | `2px` | `0` | **[Decision]** | Same global-sharp decision; must move with `--hds-radius-sm` or the UI stays inconsistent. | Card, Input, OptionCard/OptionGroup |
| `--hds-shadow-card` (line 29) | `0 5px 25px -10px rgba(0,0,0,0.4)` | `none` (or delete token + its use) | **[Decision]** | Live teaser cards are measured flat (zero shadow). Token is **Card-only** (no cross-component blast radius). | Card only |
| `--hds-color-border` / `--hds-color-border-dashed` (lines 17–18) | `#e7e4e2` | `#e2dfdb` | **[Decision]** | Live's most common border is `#e2dfdb`; delta is ~5–7/channel, sub-perceptible. Only as a deliberate warm-border alignment pass. | Card, Input, Accordion, Callout, Divider, OptionCard (6 consumers) |
| `--hds-font-size-md` (line 45) | `0.875rem` (14px) | `1rem` (16px) **or keep** | **[Decision]** | 14px matches live `<body>`/chrome; 16px matches live article/teaser body copy. Single owner decision. | Text, Button, Input + inherited by List/InfoCard |
| `--hds-font-weight-semibold` (new, after line 51) | *(absent)* | `600` | **[Decision]** | Live uses 600 for lead paragraphs. Purely additive — no current consumer, zero regression. Add only when a lead/emphasis variant is specced. | none until wired |

> Do **not** edit `--hds-space-4` to fix Button padding (cascades to Accordion/Callout/List/OptionGroup) and do **not** edit `--hds-letter-spacing-wide` to "0.04em" except as a deliberate Overline/RiskScale pass (see Decisions §6).

---

## Per-component changes

### Button — `src/components/Button/Button.module.css`
- **[Confirmed]** `.lg` padding (line ~20): `padding: var(--hds-space-4, 1rem) var(--hds-space-5, 1.5rem);` → `padding: 1.125rem var(--hds-space-5, 1.5rem);` — live primary CTA is `18px 24px`; this sets 18px vertical, keeps shared 24px horizontal. **Do NOT** retokenize `--hds-space-4`.
- **[Confirmed]** `.primary:hover` fallback (line ~34): `var(--hds-color-primary-hover, #007cb3)` → `var(--hds-color-primary-hover, #0072a3)` — keep fallback in sync with the token edit above (avoids a `#007cb3` ghost if tokens fail to load).

### TextLink — `src/components/TextLink/TextLink.module.css`
- **[Confirmed]** `.link:hover` fallback (line ~17): `var(--hds-color-primary-hover, #007cb3)` → `var(--hds-color-primary-hover, #0072a3)` — sync fallback with the token edit.
- *(font-size: inherit is intentional — see Decisions §7; no change.)*

### Overline — `src/components/Overline/Overline.module.css`
- **[Confirmed]** letter-spacing (line ~6): `letter-spacing: var(--hds-letter-spacing-wide);` → `letter-spacing: 0.4px;` — local `0.08em` (~0.96px) is ~2.4× live's `0.4px` eyebrow tracking; the most visible Overline defect. Use the per-component literal (do NOT lower the shared `--hds-letter-spacing-wide` token unless RiskScale is retuned in the same pass — see Decisions §6). Font-size 12px vs 11px is within 1px tolerance — **no change**.

### Divider — `src/components/Divider/Divider.module.css`
- **[Confirmed]** border fallback (line 3): `border-top: 1px solid var(--hds-color-border, #c7ccd1);` → `border-top: 1px solid var(--hds-color-border, #e7e4e2);` — stray cool-grey fallback contradicts the warm border token; all other consumers use `#e7e4e2`. Dormant value only (token resolves), so cosmetic/consistency.

### RiskScale — `src/components/RiskScale/RiskScale.module.css`
- **[Confirmed]** `.scale` gap (line ~28) and `.labels` gap (line ~44): `gap: 4px;` → `gap: var(--hds-space-1, 0.25rem);` — pixel-identical tokenization cleanup (`--hds-space-1` = 4px). No visual change.
- *(`.segment { height: 28px }` left as-is — no token maps to 28px; see Out of scope.)*

### Heading — `src/components/Heading/Heading.module.css`
- **[Decision]** *Optional opt-in variant* — add `.muted { color: var(--hds-color-muted, #938880); }` and expose via prop/className. Live hero H1 renders `#938880`, but the **base default `#534c46` must NOT change** (it exactly matches live h2/h3). Consumes the existing token (zero cross-component impact). See Decisions §5.

**No change needed:** Card (all edits are token/decision-level — see Decisions §2–4), List (no font-size of its own — body-size routes to token decision §1), InfoCard (composes `<Card variant="dashed">` + `<Overline>`; its 2px radius and label tracking are inherited and resolved via the Card-radius §3 and Overline fixes), StepProgress (radius routes to §3), Text (color/family/line-height already exact; size routes to §1), Accordion, OptionGroup/OptionCard, Icon.

---

## Decisions needed

1. **Body copy default size — `--hds-font-size-md` 14px vs 16px** *(affects Text, List, InfoCard, Button, Input)*
   - Trade-off: live `<body>`/chrome is 14px; live article/teaser body copy is 16px.
   - **Option A:** Keep `0.875rem` (14px) — deliberate compact DS; matches chrome/nav/quicklinks.
   - **Option B:** Bump to `1rem` (16px) at the token — matches article body copy; cascades to Button label + Input text simultaneously.
   - **Recommended: A** (keep 14px). The widget's text is supplemental UI chrome, closest to the live 14px quicklink. Revisit only if it must render article-grade body copy. Never patch per-component — resolve once at the token.

2. **Card shadow — live teasers are flat** *(`--hds-shadow-card`, Card-only)*
   - Trade-off: live homepage teasers measured zero shadow; a DS Card is a more general primitive than a teaser, and the `dashed` variant already sets `box-shadow: none` (the solid shadow may be an intentional differentiator).
   - **Option A:** Flatten — set `--hds-shadow-card: none` (or remove the `box-shadow` line in `Card.module.css:5` and delete the now-dead token).
   - **Option B:** Keep the soft elevation as a deliberate DS surface treatment.
   - **Recommended: A** (flatten) to mirror live teasers; it is the single most visible Card deviation and carries zero cross-component impact.

3. **Uniform sharp radius 0 vs keep 2px** *(`--hds-radius-sm` + `--hds-radius-md`)*
   - Trade-off: live UI is uniformly sharp (0px on buttons/cards/tags/inputs); local is 2px. The token block comment already claims "sharp / square to match live" while defining 2px (self-contradictory).
   - **Option A:** Global flatten — set **both** `--hds-radius-sm: 0` and `--hds-radius-md: 0` (cascades to Callout/RiskScale/StepProgress via sm; Card/Input/OptionCard via md; Button already 0 and unaffected). All-or-nothing at the token tier.
   - **Option B:** Keep 2px as a softer-than-live brand choice.
   - **Recommended: A** (global flatten, both tokens together). Do **not** change only `md` (leaves Callout/RiskScale/StepProgress rounded) and do **not** do per-component overrides (de-syncs the system). If only one component is in scope, point it at `var(--hds-radius-none, 0)` locally instead.

4. **Card border on the default variant** *(`Card.module.css:3`, Card-local)*
   - Trade-off: live teasers are borderless; but a borderless + shadowless + sharp Card looks like a bare `<div>`.
   - **Option A:** Remove the default `.card` border; reserve borders for an explicit bordered/dashed variant. **Hazard:** the `[data-variant=dashed]` selector (lines ~10–12) only overrides `border-style`/`border-color` and relies on the base border — give it a full `border: 1px dashed …` shorthand so the dashed card still renders.
   - **Option B:** Keep the 1px border as the DS surface affordance.
   - **Recommended: A** if Card is meant to mirror flat teasers; **B** if it is a general elevated surface. Do **not** change the border **color** token (`#e7e4e2` vs `#e2dfdb` is within tolerance).

5. **Opt-in muted/hero Heading variant** *(`Heading.module.css`, additive)*
   - Trade-off: live hero H1 is `#938880`; base h1/h2/h3 are `#534c46`.
   - **Option A:** Add `.muted { color: var(--hds-color-muted, #938880); }` opt-in modifier; keep the default `#534c46`.
   - **Option B:** Do nothing until a hero title is actually needed.
   - **Recommended: A** — low-risk, non-breaking, consumes the existing token; the widget plausibly renders a hero/title. Never change the base default to greige.

6. **Overline/eyebrow tracking at the token level** *(`--hds-letter-spacing-wide`, shared Overline + RiskScale)*
   - Trade-off: local `0.08em` is ~2.4× live eyebrow `~0.036em`. The per-component Overline fix above corrects Overline only; RiskScale `.title` keeps `0.08em`.
   - **Option A:** Lower the shared token to `0.04em` so Overline **and** RiskScale `.title` align together (then the Overline per-component literal in Per-component changes is unnecessary — re-verify RiskScale).
   - **Option B:** Per-component Overline literal `0.4px` only (recommended in Per-component changes); leaves RiskScale `.title` over-tracked.
   - **Recommended: A** if you want the whole eyebrow pattern corrected (cleaner, both move together); **B** if scope is Overline-only. Don't override RiskScale `.title` locally.

7. **TextLink standalone font-size** *(`TextLink.module.css:10`, no token edit)*
   - Trade-off: live links are 14px in chrome, 16px in content; local `inherit` already satisfies both.
   - **Option A:** Keep `font-size: inherit` — tracks surrounding copy.
   - **Option B:** Set an explicit content-link size for standalone links (must be a **TextLink-local** value, never `--hds-font-size-md`, which would corrupt Text/Button/Input).
   - **Recommended: A** (keep inherit).

8. **Add `--hds-font-weight-semibold: 600`** *(additive token)*
   - Trade-off: live uses 600 for lead paragraphs; the DS scale has no 600.
   - **Option A:** Add the token now (purely additive, zero current consumers, no regression); wire into Text only when a lead/emphasis variant is specced.
   - **Option B:** Defer until a 600 variant is actually requested.
   - **Recommended: B** (defer) — adding it changes zero rendered output today; add when the variant exists. Either way, make **no** change to `Text.module.css`.

---

## Not comparable / out of scope

These have **no** (or only a weak) live homepage reference — judged on internal consistency only; do not force visual changes. **Low confidence** on any live-driven edit here.

- **OptionGroup / OptionCard** (`src/components/OptionGroup/*.module.css`) — app-specific questionnaire control, `liveReference: none`. Fully token-driven, all brand values correct. Only the cross-cutting radius (Decisions §3) touches it.
- **RiskScale** (`src/components/RiskScale/RiskScale.module.css`) — app-specific; no live equivalent. Only the two confirmed literal cleanups (gap 4px → token) apply; `height: 28px` left as a legitimate component-local magic number (no token maps to it). Radius/tracking route to Decisions §3/§6.
- **StepProgress** (`src/components/StepProgress/StepProgress.module.css`) — app-specific. `track height: 3px` is a deliberate thin-bar literal (do **not** tokenize — RiskScale's 28px is unrelated). Track radius routes to Decisions §3 (local swap to `--hds-radius-none` if going sharp).
- **Accordion** (`src/components/Accordion/*.module.css`) — no accordion on the live homepage; `liveReference: none`/low confidence. Clean, token-driven, sharp. Border color delta rejected (sub-visible, weak reference).
- **Icon** (`src/components/Icon/`) — pure SVG primitive, no CSS; `currentColor` + `1em` by construction. Nothing to compare. Zero changes.
- **Input** (`src/components/Input/Input.module.css`) — the only live text field is a borderless, transparent, radius-0 overlay search box, **not** a bordered DS form input. All colors/fonts match live foundations, but there's no live geometry (padding/border-width/height/label-size) to validate against — **low confidence**. The single divergence (2px radius) routes to Decisions §3; if Input-only, prefer the local swap `border-radius: var(--hds-radius-md, 2px)` → `var(--hds-radius-none, 0)` (Input does not use `--hds-radius-sm`).

---

## Suggested execution order & verification

**Phase 1 — Confirmed token edit (do first; cascades intentionally):**
1. `src/styles/tokens.css:8` — `--hds-color-primary-hover: #007cb3` → `#0072a3`; drop the "to verify" comment.

**Phase 2 — Confirmed component edits (independent, any order):**
2. `Button.module.css` — `.lg` padding → `1.125rem var(--hds-space-5, 1.5rem)`; `.primary:hover` fallback `#007cb3` → `#0072a3`.
3. `TextLink.module.css` — `.link:hover` fallback `#007cb3` → `#0072a3`.
4. `Overline.module.css` — `letter-spacing` → `0.4px` (unless you take Decisions §6 Option A instead).
5. `Divider.module.css:3` — fallback `#c7ccd1` → `#e7e4e2`.
6. `RiskScale.module.css` — both `gap: 4px` → `var(--hds-space-1, 0.25rem)`.

**Phase 3 — Decisions (apply only after product-owner sign-off):**
7. Resolve Decisions §1–§8. If "global sharp" (§3) is approved, set **both** `--hds-radius-sm` and `--hds-radius-md` to `0` in `tokens.css` in one commit and re-verify Card/Input/OptionCard/Callout/RiskScale/StepProgress. If Card-flatten (§2) is approved, `--hds-shadow-card: none`. If body-16px (§1), `--hds-font-size-md: 1rem`. If Heading variant (§5), add `.muted`. If border alignment, `--hds-color-border`/`-dashed` → `#e2dfdb`.

**Verification after each phase:**
- Run Storybook: `npm run storybook` → open **http://localhost:6006**; visually inspect Button (hover azure now `#0072a3`, `.lg` = 18px tall CTA), TextLink hover, Overline tracking, Divider, RiskScale.
- Re-measure against live hirslanden.ch (DevTools computed styles or the Playwright snapshots in `.playwright-mcp/`): confirm hover `#0072a3`, CTA padding `18px 24px`, eyebrow letter-spacing `~0.4px`; if §3 applied, confirm radius 0 on cards/inputs/options.
- Regression gate: `npm test` and `npm run typecheck` (and update Button snapshot/visual tests for the `.lg` 18px padding if any assert on it).
- Sanity: grep that no `#007cb3` literal remains (`rg "#007cb3" src`) and that `--hds-space-4` / `--hds-letter-spacing-wide` were **not** mutated.
