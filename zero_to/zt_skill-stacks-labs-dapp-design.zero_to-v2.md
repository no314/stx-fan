---
name: stacks-labs-dapp-design
description: "Design system, layout pattern, and voice for Stacks Labs standalone dApps, extracted from the production Zero to Signing app and refined through Zero to Claiming and sBTC Deposit Recovery. Use whenever building, styling, restyling, or writing copy for any Stacks Labs product UI, any \"Zero to X\" guided flow, any standalone single-page dApp or step wizard (up to 8 steps, with or without a wallet), or any screen that should look like Stacks Labs work, even if the user never says \"design\". Also use when reviewing such a UI for consistency. Pair it with the static-first-architecture and stacks-dapp-architecture skills, which own deployment and wallet/chain security; this skill owns how the app looks, lays out, and reads."
---

# Stacks Labs Standalone dApp Design

Binding visual style, layout pattern, and voice for standalone Stacks Labs dApps. The canonical product shape is a **single-page guided flow**: a horizontal step rail across the top, one active panel below it, explanatory copy below that. Everything here was extracted from the shipped Zero to Signing app, refined through its design review, and then re-applied to Zero to Claiming and sBTC Deposit Recovery; treat it as decided, not as a starting point for taste.

Never invent colors, type sizes, spacing, radii, or shadows. Everything comes from `assets/tokens.css` (design tokens + semantic type classes) and `assets/app.css` (component recipes). Copy both stylesheets and `assets/fonts/` into the project and load tokens.css before app.css. All fonts are self-hosted; no remote font fetches.

## Start by copying

Three finished apps carry this skill's working shape. Start by copying structure from them, not by re-deriving it from prose. Paths are relative to each app's root.

Copy by path:

- **Zero to Signing** `src/styles/` (tokens.css, app.css, fonts/) and `src/main.jsx`: the stylesheet set and the entry import order, unchanged across all three apps.
- **Zero to Signing** `src/core.jsx` / `src/steps.jsx` / `src/app.jsx` split: constants, record shape, helpers and UI atoms in core; one exported component per step in steps; shell, rail, routing, URL contract and record lifecycle in app. Zero to Claiming adds `src/chain.js` so every chain read sits behind one module.
- **Zero to Signing** `src/steps.jsx` `cycleView` and `CycleBar`: the corrected cycle progress bar. It supersedes the recipe in `references/components.md` section 13 until that file is updated (see "Chain-timing widgets").
- **Zero to Signing** `scripts/verify-app.mjs` rail-geometry checks: the baseline assertion and the tab-flush assertion, copied verbatim.
- **sBTC Deposit Recovery** `src/styles/app.css` tail: per-app additions appended in one clearly marked block below the shared recipes (no-secrets chrome, the rail blocked state, `.evid`, `.keycmp`), never edits to the recipes above the block.
- **sBTC Deposit Recovery** `src/parse.js`: the paste classifier's secret detection against the real BIP39 wordlist.
- **Zero to Claiming** `public/icons/`: brand marks used as-is.

Read for inspiration, do not generalize: each app's step semantics (six signer steps, eight claim steps, four recovery steps), the manager option table, the CSV Status step, the outcome branch taxonomy, the escalation mail builder.

## Division of labor

This skill owns look, layout, and voice. Load it together with:

- **static-first-architecture**: static build, vendored and pinned dependencies, verify the built artifact with the offline harness.
- **stacks-dapp-architecture**: security tier, wallet capability, post-conditions, network identity pinning, read gating.

Product behavior (which steps exist, which contract calls they make, state fields, acceptance criteria) comes from a per-app PRD, not from any skill. Do not start building a new flow without one; a single page suffices. `references/scaffold.md` describes the project skeleton and the per-app PRD template.

## Foundations

- **Type**: `--font-display` (Open Sauce Sans) for headings only; `--font-body` (Instrument Sans) for all body/UI text; `--font-mono` (JetBrains Mono) ONLY for numbers, hashes, principals, txids, block heights, code, CLI commands, timestamps. Never mono for prose. Headings in product chrome stay 20-26px.
- **Color**: warm Sand neutral scale + accent. Semantic tokens only (`--surface-*`, `--text-*`, `--border-*`); never raw hex in components.
- **Spacing**: 4-pt scale (`--space-*`). Product surfaces are dense: 4/8/12/16/24.
- **Radius**: controls `--radius-md` (8px), cards/panels `--radius-lg` (12px). Nothing larger in chrome.
- **Borders carry structure, not shadows.** Shadows only on floating surfaces (menus, modals) and the primary button glow.
- **Mixed-size text aligns on baselines, not centers.** Whenever two text sizes sit on one line (step number + title, page title + subtitle, big value + unit), align their text baselines; center or box alignment reads as uneven and will draw a correction. Every alignment complaint in the source app resolved to this rule.
- **Brand logos are used as-is**: no borders, no recolors, no redraws. When a square icon is needed from a wordmark, extract the mark's own paths untouched into a square viewBox (the emblem form), and get assets from the brand's own files. Label integrations with the brand's full name ("Asymmetric Research").
- **Licensing**: every bundled font is freely licensed (Instrument Sans and JetBrains Mono under SIL OFL, Open Sauce Sans free), so any deploy target is fine. The system originally used Matter / Matter Mono (commercial, Displaay Type Foundry, licensed to Stacks Labs); they were deliberately removed so deployments outside the Stacks Labs license are safe. Do not reintroduce Matter without confirming the license covers the host.

## Network accent swap (mandatory)

Testnet replaces the accent entirely (violet vs mainnet orange) so environment confusion is impossible. `body` defines `--accent`, `--accent-hover`, `--accent-soft`, `--accent-shadow`; `body.net-testnet` overrides all four. Every accent use (primary buttons, focus rings, links, radio/checkbox accent-color, spinners, progress fills) goes through these variables; never `--stacks-500` directly in components. Progress/meter fills use the accent at 50% opacity via `color-mix(in srgb, var(--accent) 50%, transparent)`. An app with no network switch (a Bitcoin-side tool) keeps the mainnet accent.

## Surface system (closed set)

- The shell (page, header, everything outside cards) is one continuous `--surface-tertiary` tone, separated by 1px `--border-secondary` rules. Never differentiate shell regions by fill.
- The step panel is a **standout card**: `--surface-primary`, no border, radius 12px. Any container holding form controls must be this form.
- Nested groups inside the panel (sub-stage cells, picker rows) are `--surface-secondary`, no border, radius 8px.
- Inputs sit on `--surface-fourth` with a 1px `--border-secondary` frame. Read-only inputs drop to `--surface-secondary` with `--text-secondary`.
- Cards are never white, never gradient, never left-border-accented.
- **App-specific additions are appended, never interleaved.** When an app needs a recipe the shared set lacks (an evidence grid, a key comparison block), it goes in one clearly marked block at the tail of the app's copy of app.css, built from tokens only, with a comment naming the app and the reason. The shared recipes above the block stay byte-identical so the next app can diff its copy against the skill's assets. Candidate recipes for the shared set are flagged in that comment as a PROPOSAL.

## The step-flow layout pattern

The canonical page, top to bottom: header (64px), step rail, active panel, info section. One flow per page, 2 to 8 steps, numbered from 0. Number from 0 when step 0 is a no-interaction prerequisites checklist, from 1 otherwise. The pattern scales down to 4 steps with nothing bent (sBTC Deposit Recovery: same rail geometry, same panel and footer mechanics, same info sections).

- **Rail**: one entry per step, states locked / active / complete / skipped / blocked. The active step renders as a tab (`.rail-tab`) that merges seamlessly into the panel. Locked steps are not clickable; completed steps open read-only views; steps the PRD marks re-enterable stay writable after completion.
- **Blocked is a fifth state, distinct from complete and skipped.** It means the flow resolved before this step's work was needed (an analysis that terminated early). Rendered complete-weight, not locked-dim; a minus-circle where complete shows a check; italic label "not needed"; never clickable. Complete means there is something to view; skipped means something was declined; blocked means nothing was ever needed. In sBTC Deposit Recovery six of nine outcome branches end before the final step's action, so the state is load-bearing. It ships in that app's `src/styles/app.css` as a marked PROPOSAL block until the shared assets adopt it.
- **Skipped steps stay visible**, struck through in the rail, when a capability shape makes them meaningless. A terminal step everyone might need cold (a Status or lookup step) stays clickable even from a fresh locked flow (Zero to Claiming).
- **Rail geometry is load-bearing**: every step number and the active step title share one TEXT BASELINE. The rail is a baseline-aligned flex row, the tab's internal row is baseline-aligned, and each inactive item's first line is its number, so flexbox lines everything up on the tab number's baseline with the small labels hanging below. The tab keeps a fixed 80px box and, as the deepest item, stays flush with the panel it merges into; keep the inactive items' below-baseline extent (descent + gap + label) smaller than the tab's or the tab detaches. The active number is `--text-primary` at weight 500, not accent-colored.
- **Verify baseline alignment programmatically after any rail change**, and copy the assertion verbatim because it is not obvious: measure the number's text node with a `Range`, subtract `height * (300/1320)` (JetBrains Mono descent over ascent plus descent) to recover the baseline from the glyph box, and require every rail number within 2px of the active tab's. The companion check requires the tab's bottom flush with the panel top within 1px (Zero to Signing: `scripts/verify-app.mjs`).
- **Panel**: only the current step's controls exist in the DOM. `.panel` is a flex column with `min-height:380px`; the step content wraps in `.body-wrap` (flex:1, column) holding `.body` (flex:1) and `.foot`, which is what pins the footer to the panel bottom even on short read-only views. Footer: Back (tertiary, pulled left by its own padding so the label aligns with the content edge) left, primary action right, spacer between.
- **Info section**: below the panel, uppercase 12px kicker ("About this step"), 14px `--text-secondary` prose, max 72ch, scoped to the current step, doc links as external-link anchors ordered most specific first.
- **Terminal step**: carries an explicit "Next steps" section naming where the user goes after this app ends, and it appears only on that step. The harness asserts its presence there and its absence elsewhere (Zero to Signing).
- **Sub-stages** live inside the panel as `.cell` blocks with a mono ordinal; the rail reflects the parent step only.
- Desktop only unless the PRD says otherwise (`<meta name="viewport" content="width=1200">`).

Component recipes with class names and JSX shapes are in `references/components.md`; read it before building any screen. Its section 13 (cycle progress bar) is superseded by the rules below and by Zero to Signing's `src/steps.jsx`.

## Chain-timing widgets

Any progress display over a bounded chain window (a reward cycle, a lock period, a confirmation wait) follows these rules. They came out of a bar that read "100% done" for the last hundred minutes of a cycle while the gated action was still blocked.

- **A progress percentage floors, never rounds.** Hold at 99 percent until the window's last block and show 100 only on that block. `Math.round` reported 100 for roughly the last 10 blocks of a 2100-block cycle.
- **The marker sits at the true position; only the number moves.** Never clamp the marker to keep its label from clipping; at one block from the end a clamped caret pointed about 60 blocks earlier than the number beside it. Render the caret as its own element at the exact percentage, and when within 12 percent of either edge pin the number to that edge, joined back to the caret by a short leader line.
- **A blocked window has geometry, not only a label suffix.** A 1px boundary tick plus a neutral 10 percent tint over the blocked tail, layered above the accent fill, with the boundary block named in the ends row. A bar that looks identical at 95 percent (allowed) and 98 percent (blocked) is wrong.
- **Label the last block IN the window, not the first block after it.** The exclusive bound stays internal to the math; the display shows `end - 1`. A cycle starting at 150 with length 2100 ends at 2249.
- **No absolutely positioned labels near each other.** Anchoring the boundary label to its percentage overprinted the end label at mainnet geometry (the boundary sits at 95.2 percent). Put the boundary and end labels in one right-hand flex group; that is also correct at any cycle length.
- **Guard**: when the blocked window is active, the primary action opens a warning modal instead of reaching the wallet, and the submit path re-checks against a fresh read before signing. UI state can be stale; the fresh read is the actual guard.
- **The math ships with unit tests before the component exists.** The window derivation (`cycleView` or its equivalent) is a pure function; write its Node tests first at the boundary blocks (1, 3, 50, 101 from the end, plus a mid-cycle control), asserting the floored percentage, the last-block label, and the blocked flag, then write the function, then the component. Zero to Signing's four defects above would each have been one failing test; instead they passed 116 functional checks and were caught only in images. The test-first rule lives in `static-first-architecture`; this is its application here.
- **Screenshot the same boundary states** from a committed script before showing the bar to anyone. Tests prove the numbers; only images prove the geometry.

## State and persistence conventions

These conventions came out of real bugs; follow them unless the PRD contradicts.

- Namespace all flow state per network; no value ever crosses a network boundary. localStorage keys: `<app-prefix>:<network>:<record-id>`. Mirror the active record and network as `?id=` and `?chain=` URL params so reloads and shared links resume correctly.
- The read-API node is part of the URL contract too: an `?api=` parameter, always visible at its current value (default or overridden), ordered chain, then id when a record exists, then api, then any read-budget parameters (`?throttle=`, `?rpm=`). Per network, session only, reads and explorer links only, never what the wallet signs. An override that only appears when set is a feature nobody finds. When reads span two hosts, `?api=` overrides the commodity chain reads and the protocol-state host stays pinned; say which in the info copy.
- Persist nothing before the flow's first on-chain anchor (e.g. deploy confirmation); keep pre-anchor state in memory per network for the session, and say so in one sentence of copy on the step where it matters ("reloading before confirmation starts over"). The harness asserts `localStorage.length === 0` at that point.
- **The zero-persistence case.** When the flow has no on-chain anchor and no wallet session, and every input is public and every result recomputes in under a second from the URL, browser storage is banned outright and the URL is the whole state (sBTC Deposit Recovery: `?txid`, `?stx`, `?api`, all always visible). The site footer's Reset control survives with reduced scope: clear the URL, reload.
- On load: URL id wins; else a single existing record auto-restores; multiple records open a picker; none starts at the first step. Resume at the furthest reached step.
- Wallet disconnect keeps records and makes the flow read-only. Reconnecting as a different account asks which step to resume (remember the last connected account across disconnects, or the dialog is unreachable).

## Inputs that could receive key material

Any free-text input that could receive a paste (a support message, a transaction description) detects key material and discards it without echoing it back. Detection uses the real BIP39 wordlist and demands a run: 8 or more CONSECUTIVE wordlist words (punctuation does not break a run, a non-wordlist word does), or a letters-only token of 24 or more characters that fully segments into 8 or more wordlist words. WIF and extended-private-key patterns stay as separate regexes. A naive "any 12 short lowercase words" heuristic discarded an ordinary support message; the false-positive report came from a real user paste. Addresses never trip the concatenated check because they contain digits (sBTC Deposit Recovery: `src/parse.js`). Discard means discard: never render the paste, never store it, never send it.

## Voice and copy

- Pragmatic, observational, impersonal, declarative. No exclamation marks, no persuasion, no filler.
- **No em dashes anywhere**: not in UI text, not in code comments. Use a colon, comma, or parentheses instead, and a plain hyphen as the empty-value glyph. This is house style; verify it mechanically. The rendered-UI assertion is the one that matters (the harness asserts the rendered text contains none); a repo-wide grep is advisory and needs two carve-outs: the shared tokens.css ships em dashes in its own comments (shared asset, not edited per app), and the harness itself contains the literal it scans for.
- Max 3 sentences of explanation per step; deeper reading goes in the info section as doc links.
- **Every number about chain limits is unverified until checked against the chain**, including numbers a PRD states. A PRD said 48 was the maximum consecutive cycles; the chain says 96. Every limit in a PRD carries a source link, and the shipped copy quotes the verified value (Zero to Signing validates 1 to 96, labels the field "Cycles 1-96", prefills 48).
- Every claim about chain behavior (what locks, when funds unlock, when earning starts, fee units, irreversibility) must come from the PRD or linked docs, and must be precise about timing. **Say what happens and when as two separate facts**: "the lock takes effect once this transaction is confirmed on chain; the STX starts earning when the next reward cycle starts" is correct where "takes effect the next cycle" was not. Invented parameters, limits, or CLI flags are defects.
- **Every duration a user waits on gets a number from primary docs**, placed near any escalation threshold so the gap between normal and abnormal is visible: "within one or two Bitcoin blocks: about 10 to 30 minutes" beside "pending more than roughly 24 hours: escalate." Vague cadence copy ("a sweep cycle or two") fails this rule.
- **Read the asymmetry, state both sides.** When a parameter behaves differently by direction (a fee increase waits two cycles, a decrease applies immediately), the copy states both.
- Title Case for buttons and page titles; sentence case elsewhere. Lowercase token/contract names.
- Numbers, amounts, hashes, principals, txids always in mono; amounts show both units where conversion happens; txids shortened `0x1a2b…` and linked to the explorer.
- **Stamp live on-chain figures with the moment of their read** (local time and burn block) and refresh only on an explicit control (default). Chain data goes stale in blocks and can change with no transaction at all (a pool fee moved from 0 to 4.5 percent at a cycle boundary). The stamp is not the guard: the guard against acting on stale data is a fresh read immediately before broadcasting that blocks with old and new values shown. Values already frozen on chain for a settled period do not need the stamp; only live values do.
- **A failed read renders as unavailable, never as zero.** Zero is a legal value for most figures; block dependent figures until the read succeeds.
- Define an app glossary in the PRD (the canonical term for each domain object) and use it exactly, in UI copy, code identifiers, and state fields alike. No synonyms.
- When copy quotes a number the user can edit (a default cycle count, an amount), bind the copy to the field so it adapts live rather than stating a stale constant.
- **Progress lines state the constraint, not just the count** (default): "batch read 34/49 (reads capped at 45/min, about 2 min left)" with an honest self-correcting total. A counter that overtakes its total (25/8) destroys trust in one glance.
- **A zero is a plain zero** (default). Dust and floor warnings attach only to positive amounts that are actually blocked; an empty row wearing a scary message reads as a bug. Show the blocking arithmetic inline on the row ("earned 3,545 - max-fee 3,000 = 545, under the 546 sat dust floor").
- **Say which source the view used and offer the other** (default) whenever data can come from more than one place: "Roster from the staking API: 253 current stakers" plus an "Include Past Stakers" action. Silent source switching plus a support question is how trust dies. The same goes for which code path ran (batch reader, fallback, and the exact fallback reason) in a one-line reader line above the data.
- **Show the work before the conclusion** when asking a user to trust a claim about their money: derived value and on-chain value adjacent in full mono, one badge stating "exact match, byte for byte", then the recovered parameters as key-value rows, then the raw material. A no-match view lists every lookup attempted as numbered rows and explicitly refuses to name which parameter missed (sBTC Deposit Recovery proof step).
- **Anti-phishing chrome** for any app that holds no key: a persistent header statement, not dismissible, that the app never asks for a seed phrase and never connects a wallet. The harness asserts the statement and the absence of wallet controls.
- Errors: inline `.status err` under the content they relate to, specific and actionable, never blocking dialogs. Blocking modals are reserved for actions that would fail or lose funds if allowed to proceed (e.g. staking during the prepare phase). Never frame an unresolved outcome as unrecoverable; name the human who should look.

## Iconography

Phosphor Icons (regular weight) only, self-hosted or bundled, never CDN-loaded at runtime. No emoji, no Unicode glyphs as icons, no hand-drawn SVG icons. Third-party brand marks are the one exception and follow the brand-logo rule above.

## Hard don'ts

No gradients, no emoji, no em dashes, no backdrop blur, no hero illustrations or stock imagery, no dark-blue generic accents, no new colors or type scales, no shadows on resting cards, no mono for prose, no runtime CDN dependencies, no mobile layout unless the PRD asks, no clamped markers on progress tracks, no rounded-up percentages, no edits to the shared recipes outside the app's marked block.

## Building a new flow

1. Get or write the one-page PRD (steps, chain calls, state fields, glossary, acceptance criteria, golden fixtures). Template in `references/scaffold.md`. Verify every protocol number in it against a primary source before it reaches copy.
2. Load static-first-architecture and stacks-dapp-architecture; fix the security tier and network identities before writing code.
3. Write the pure domain layer test-first per static-first-architecture (every calculation, parser, classifier, and window derivation the PRD implies) before any screen.
4. Scaffold by copying from the apps named under "Start by copying" (Vite static build, pinned deps, this skill's assets, entry import order).
5. Build screens from `references/components.md` recipes only, with the section 13 correction above. New recipes go in the app's marked block.
6. Verify the built artifact in a real browser: the scaffold reference describes the reusable check harness (state restore, network isolation, rail geometry, footer pinning, no em dashes, no runtime CDN fetches). Functional checks make design review possible; they do not perform it.
7. Run a visual pass before showing anyone: screenshot every step in every state (active, read-only, skipped, blocked, error, empty) plus every boundary state of any chain-timing widget, from a committed script, and inspect the images against an optical checklist: shared baselines wherever text sizes mix, footer pinned to the panel bottom on short views, Back label on the content edge, tab flush with the panel, no overlapping labels, spacing rhythm. Functional assertions do not see design; in the source app the harness passed 80+ checks while every layout defect was caught by a human looking at screenshots. Deliver the screenshots with the build, and keep the script so a UI change re-shoots them.