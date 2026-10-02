---
name: stacks-labs-dapp-design
description: Design system, layout pattern, and voice for Stacks Labs standalone dApps, extracted from the production Zero to Signing app. Use whenever building, styling, restyling, or writing copy for any Stacks Labs product UI, any "Zero to X" guided flow, any standalone single-page dApp or step wizard (up to 8 steps), or any screen that should look like Stacks Labs work, even if the user never says "design". Also use when reviewing such a UI for consistency. Pair it with the static-first-architecture and stacks-dapp-architecture skills, which own deployment and wallet/chain security; this skill owns how the app looks, lays out, and reads.
---

# Stacks Labs Standalone dApp Design

Binding visual style, layout pattern, and voice for standalone Stacks Labs dApps. The canonical product shape is a **single-page guided flow**: a horizontal step rail across the top, one active panel below it, explanatory copy below that. Everything here was extracted from the shipped Zero to Signing app and refined through its design review; treat it as decided, not as a starting point for taste.

Never invent colors, type sizes, spacing, radii, or shadows. Everything comes from `assets/tokens.css` (design tokens + semantic type classes) and `assets/app.css` (component recipes). Copy both stylesheets and `assets/fonts/` into the project and load tokens.css before app.css. All fonts are self-hosted; no remote font fetches.

## Division of labor

This skill owns look, layout, and voice. Load it together with:

- **static-first-architecture**: static build, vendored and pinned dependencies, verify the built artifact.
- **stacks-dapp-architecture**: security tier, wallet capability, post-conditions, network identity pinning.

Product behavior (which steps exist, which contract calls they make, state fields, acceptance criteria) comes from a per-app PRD, not from any skill. Do not start building a new flow without one; a single page suffices. `references/scaffold.md` describes the project skeleton and the per-app PRD template.

## Foundations

- **Type**: `--font-display` (Open Sauce Sans) for headings only; `--font-body` (Instrument Sans) for all body/UI text; `--font-mono` (JetBrains Mono) ONLY for numbers, hashes, principals, txids, block heights, code, CLI commands, timestamps. Never mono for prose. Headings in product chrome stay 20-26px.
- **Color**: warm Sand neutral scale + accent. Semantic tokens only (`--surface-*`, `--text-*`, `--border-*`); never raw hex in components.
- **Spacing**: 4-pt scale (`--space-*`). Product surfaces are dense: 4/8/12/16/24.
- **Radius**: controls `--radius-md` (8px), cards/panels `--radius-lg` (12px). Nothing larger in chrome.
- **Borders carry structure, not shadows.** Shadows only on floating surfaces (menus, modals) and the primary button glow.
- **Mixed-size text aligns on baselines, not centers.** Whenever two text sizes sit on one line (step number + title, page title + subtitle, big value + unit), align their text baselines; center or box alignment reads as uneven and will draw a correction. Every alignment complaint in the source app resolved to this rule.
- **Licensing**: every bundled font is freely licensed (Instrument Sans and JetBrains Mono under SIL OFL, Open Sauce Sans free), so any deploy target is fine. The system originally used Matter / Matter Mono (commercial, Displaay Type Foundry, licensed to Stacks Labs); they were deliberately removed so deployments outside the Stacks Labs license are safe. Do not reintroduce Matter without confirming the license covers the host.

## Network accent swap (mandatory)

Testnet replaces the accent entirely (violet vs mainnet orange) so environment confusion is impossible. `body` defines `--accent`, `--accent-hover`, `--accent-soft`, `--accent-shadow`; `body.net-testnet` overrides all four. Every accent use (primary buttons, focus rings, links, radio/checkbox accent-color, spinners, progress fills) goes through these variables; never `--stacks-500` directly in components. Progress/meter fills use the accent at 50% opacity via `color-mix(in srgb, var(--accent) 50%, transparent)`.

## Surface system (closed set)

- The shell (page, header, everything outside cards) is one continuous `--surface-tertiary` tone, separated by 1px `--border-secondary` rules. Never differentiate shell regions by fill.
- The step panel is a **standout card**: `--surface-primary`, no border, radius 12px. Any container holding form controls must be this form.
- Nested groups inside the panel (sub-stage cells, picker rows) are `--surface-secondary`, no border, radius 8px.
- Inputs sit on `--surface-fourth` with a 1px `--border-secondary` frame. Read-only inputs drop to `--surface-secondary` with `--text-secondary`.
- Cards are never white, never gradient, never left-border-accented.

## The step-flow layout pattern

The canonical page, top to bottom: header (64px), step rail, active panel, info section. One flow per page, 2 to 8 steps, numbered from 0. Number from 0 when step 0 is a no-interaction prerequisites checklist, from 1 otherwise.

- **Rail**: one entry per step, states locked / active / complete / skipped. The active step renders as a tab (`.rail-tab`) that merges seamlessly into the panel. Locked steps are not clickable; completed steps open read-only views; steps the PRD marks re-enterable stay writable after completion.
- **Rail geometry is load-bearing**: every step number and the active step title share one TEXT BASELINE. The rail is a baseline-aligned flex row, the tab's internal row is baseline-aligned, and each inactive item's first line is its number, so flexbox lines everything up on the tab number's baseline with the small labels hanging below. The tab keeps a fixed 80px box and, as the deepest item, stays flush with the panel it merges into; keep the inactive items' below-baseline extent (descent + gap + label) smaller than the tab's or the tab detaches. Verify baseline alignment programmatically after any rail change. The active number is `--text-primary` at weight 500, not accent-colored.
- **Panel**: only the current step's controls exist in the DOM. `.panel` is a flex column with `min-height:380px`; the step content wraps in `.body-wrap` (flex:1, column) holding `.body` (flex:1) and `.foot`, which is what pins the footer to the panel bottom even on short read-only views. Footer: Back (tertiary, pulled left by its own padding so the label aligns with the content edge) left, primary action right, spacer between.
- **Info section**: below the panel, uppercase 12px kicker ("About this step"), 14px `--text-secondary` prose, max 72ch, scoped to the current step, doc links as external-link anchors.
- **Sub-stages** live inside the panel as `.cell` blocks with a mono ordinal; the rail reflects the parent step only.
- Desktop only unless the PRD says otherwise (`<meta name="viewport" content="width=1200">`).

Component recipes with class names and JSX shapes are in `references/components.md`; read it before building any screen. It includes the chain-timing widgets (cycle progress bar, prepare-phase guard) that recur in staking-adjacent flows.

## State and persistence conventions

These conventions came out of real bugs; follow them unless the PRD contradicts.

- Namespace all flow state per network; no value ever crosses a network boundary. localStorage keys: `<app-prefix>:<network>:<record-id>`. Mirror the active record and network as `?id=` and `?chain=` URL params so reloads and shared links resume correctly.
- The read-API node is part of the URL contract too: an `?api=` parameter, always visible at its current value (default or overridden), ordered chain, then id when a record exists, then api. Per network, session only, reads and explorer links only, never what the wallet signs. An override that only appears when set is a feature nobody finds.
- Persist nothing before the flow's first on-chain anchor (e.g. deploy confirmation); keep pre-anchor state in memory per network for the session, and say so in one sentence of copy on the step where it matters.
- On load: URL id wins; else a single existing record auto-restores; multiple records open a picker; none starts at the first step. Resume at the furthest reached step.
- Wallet disconnect keeps records and makes the flow read-only. Reconnecting as a different account asks which step to resume (remember the last connected account across disconnects, or the dialog is unreachable).

## Voice and copy

- Pragmatic, observational, impersonal, declarative. No exclamation marks, no persuasion, no filler.
- **No em dashes anywhere**: not in UI text, not in code comments. Use a colon, comma, or parentheses instead, and a plain hyphen as the empty-value glyph. This is house style; verify it mechanically (the scaffold's check asserts the rendered UI contains none).
- Max 3 sentences of explanation per step; deeper reading goes in the info section as doc links.
- Every claim about chain behavior (what locks, when funds unlock, when earning starts, fee units, irreversibility) must come from the PRD or linked docs, and must be precise about timing: "the lock takes effect once this transaction is confirmed on chain; the STX starts earning when the next reward cycle starts" is correct where "takes effect the next cycle" was not. Invented parameters, limits, or CLI flags are defects.
- Title Case for buttons and page titles; sentence case elsewhere. Lowercase token/contract names.
- Numbers, amounts, hashes, principals, txids always in mono; amounts show both units where conversion happens; txids shortened `0x1a2b…` and linked to the explorer.
- Define an app glossary in the PRD (the canonical term for each domain object) and use it exactly, in UI copy, code identifiers, and state fields alike. No synonyms.
- When copy quotes a number the user can edit (a default cycle count, an amount), bind the copy to the field so it adapts live rather than stating a stale constant.
- Errors: inline `.status err` under the content they relate to, specific and actionable, never blocking dialogs. Blocking modals are reserved for actions that would fail or lose funds if allowed to proceed (e.g. staking during the prepare phase).

## Iconography

Phosphor Icons (regular weight) only, self-hosted or bundled, never CDN-loaded at runtime. No emoji, no Unicode glyphs as icons, no hand-drawn SVG icons.

## Hard don'ts

No gradients, no emoji, no em dashes, no backdrop blur, no hero illustrations or stock imagery, no dark-blue generic accents, no new colors or type scales, no shadows on resting cards, no mono for prose, no runtime CDN dependencies, no mobile layout unless the PRD asks.

## Building a new flow

1. Get or write the one-page PRD (steps, chain calls, state fields, glossary, acceptance criteria). Template in `references/scaffold.md`.
2. Load static-first-architecture and stacks-dapp-architecture; fix the security tier and network identities before writing code.
3. Scaffold per `references/scaffold.md` (Vite static build, pinned deps, this skill's assets, entry import order).
4. Build screens from `references/components.md` recipes only.
5. Verify the built artifact in a real browser: the scaffold reference describes the reusable check harness (state restore, network isolation, rail geometry, footer pinning, no em dashes, no runtime CDN fetches).
6. Run a visual pass before showing anyone: screenshot every step in every state (active, read-only, skipped, error, empty) and inspect the images against an optical checklist: shared baselines wherever text sizes mix, footer pinned to the panel bottom on short views, Back label on the content edge, tab flush with the panel, spacing rhythm. Functional assertions do not see design; in the source app the harness passed 80+ checks while every layout defect was caught by a human looking at screenshots. Deliver the screenshots with the build.
