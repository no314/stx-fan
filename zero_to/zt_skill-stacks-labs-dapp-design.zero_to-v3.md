---
name: stacks-labs-dapp-design
description: "Design system, layout patterns, and voice for Stacks Labs standalone dApps and pages, extracted from the production Zero to Signing app and refined through Zero to Claiming, sBTC Deposit Recovery, Zero To BNS, BNS Lookup, the zero_to homepage, the tax export and the sBTC gas swap. Use whenever building, styling, restyling, or writing copy for any Stacks Labs product UI, any \"Zero to X\" guided flow, any standalone single-page dApp or step wizard (up to 8 steps, with or without a wallet), any index, lookup or explainer page, or any screen that should look like Stacks Labs work, even if the user never says \"design\". Also use when reviewing such a UI for consistency. Pair it with the static-first-architecture and stacks-dapp-architecture skills, which own deployment and wallet/chain security, and with writing-rules and writing-labs-voices from the stacks-labs-docs-writing plugin, which own the writing floor and the register; this skill owns how the app looks, lays out, and reads on a screen."
---

# Stacks Labs dApp Design

About this version: zero_to v3, merged 2026-10-19, body 2,160 words against a budget of 1,800 (down from 4,735; the overage is the foundations, surface system and voice sections kept whole plus the new non-flow section). Drew on 20260903_skill-update-handoff-zero-to-signing.md, 20260903_skill-update-handoff-zero-to-claiming.md, 20260904_skill-update-handoff-sbtc-deposit-recovery.md, 20261018_skill-update-handoff-sbtc-gas-swap.md, 20261018_skill-update-handoff-sbtc-deposit-recovery.md, 20261018_skill-update-handoff-zero-to-bns.md, 20261018_skill-update-handoff-bns-lookup.md, 20261018_skill-update-handoff-zero-to-claiming.md, 20261018_skill-update-handoff-zero-to-home.md, 20261019_skill-update-handoff-tax-export.md. Rules carry the apps they were observed in and a scope tag. Component recipes: `references/components.md`; project skeleton, PRD template and harness checks: `references/scaffold.md`; stories: `references/incidents.md`; dated facts (fonts, licences): `references/constants.md`. Hosted copies: `https://stx.fan/zero_to/zt_skill-ref-stacks-labs-dapp-design-<name>.zero_to-v3.md` (names components, scaffold, incidents, constants), the stylesheets at `https://stx.fan/zero_to/zt_skill-asset-app.zero_to-v3.css` and `zt_skill-asset-tokens.zero_to-v3.css`, and the fonts as the `zt_*.woff2` files beside them; fetch them when a pointer is followed and the local file is missing, and copy the stylesheets from there when scaffolding a new app.

Binding visual style, layout patterns and voice for Stacks Labs product UI. The core is the foundations, the surface system, the header and footer, the voice and the don'ts; every page in the family uses those. The **step rail** is one pattern built on top of them, right for a guided flow and not the canonical product. Treat all of it as decided.

## Division of labor

This skill owns look, layout and voice. Load it with `static-first-architecture` (build, dependencies, harness), `stacks-dapp-architecture` (tier, wallets, post-conditions, reads, network identity), `writing-rules` (the floor for every string, code comments included; rule numbers below refer to it), `writing-labs-voices` (End-user for stakers and holders, Operator for signer, node, pool and contract operators) and `writing-line-audit`. Product behavior comes from a one-page PRD, template in `references/scaffold.md`; do not build without one.

## Foundations [any Stacks Labs UI]

Never invent colors, type sizes, spacing, radii or shadows. Everything comes from `assets/tokens.css` and `assets/app.css`; copy both and `assets/fonts/` into the project and load tokens before app [apps: all eight]. Fonts are self-hosted; a flat layout may edit the font URLs in its copy of tokens.css and nothing else [apps: home].

- **Type**: `--font-display` (Open Sauce Sans) for headings only; `--font-body` (Instrument Sans) for body and UI; `--font-mono` (JetBrains Mono) only for numbers, hashes, principals, txids, block heights, code, commands and timestamps. Headings in chrome stay 20 to 26px. Mono contexts disable ligatures, or `https://` renders as one glyph [apps: bns, bnslookup].
- **Color**: semantic tokens only; never raw hex in components. **Spacing**: 4-pt scale, dense. **Radius**: controls 8px, cards 12px, nothing larger. **Borders carry structure, not shadows**; shadows only on floating surfaces and the primary button glow.
- **Mixed-size text aligns on baselines, not centers**; every alignment complaint in the source apps resolved to this [apps: signing, gas, bns, tax-export].
- **Brand logos are used as-is**: no borders, recolors or redraws; full brand names on labels [apps: claiming].
- Every bundled font is freely licensed; do not reintroduce a commercial face without confirming the licence covers the host (`references/constants.md`).

## Network accent swap [any networked UI]

Testnet replaces the accent entirely (violet against mainnet orange). `body` defines `--accent`, `--accent-hover`, `--accent-soft`, `--accent-shadow`; `body.net-testnet` overrides all four, and every accent use goes through them. Progress fills use the accent at 50 percent via `color-mix`. An app with no network switch keeps the mainnet accent [apps: signing, claiming, bns, bnslookup, gas].

## Surface system (closed set) [any Stacks Labs UI]

The shell is one continuous `--surface-tertiary` tone separated by 1px `--border-secondary` rules; never differentiate shell regions by fill. The main panel or tile is a standout card: `--surface-primary`, no border, radius 12px; any container holding form controls takes this form. Nested groups are `--surface-secondary`, radius 8px. Inputs sit on `--surface-fourth` with a 1px frame; read-only inputs drop to `--surface-secondary`. Cards are never white, gradient or left-border-accented. **App-specific recipes are appended, never interleaved**: one marked block at the tail of the app's copy of app.css, tokens only, naming the app and the reason, so the shared recipes stay byte-identical and diffable; candidates for the shared set are flagged PROPOSAL [apps: claiming, recovery, gas, bns, bnslookup, tax-export; home uses a separate stylesheet to the same effect].

## The step-flow pattern [step flow]

Header (64px), step rail, active panel, info section. One flow per page, 2 to 8 steps; number from 0 when step 0 is a no-interaction prerequisites checklist, from 1 otherwise. The pattern scales down to 4 steps unchanged [apps: recovery, tax-export] and to zero steps, keeping header, panel, info and footer [apps: bnslookup].

- **Rail states**: locked, active, complete, skipped, blocked. Locked steps are not clickable; complete steps open read-only views; re-enterable steps stay writable. Skipped means declined and stays visible struck through. Blocked means the flow resolved before this step was needed: complete-weight, a minus-circle, italic "not needed", never clickable [apps: recovery, claiming].
- **Rail geometry is load-bearing**: every step number and the active title share one text baseline; the tab keeps a fixed 80px box flush with the panel. Verify both programmatically after any rail change; the assertion is in `references/scaffold.md` [apps: signing, gas, bns, tax-export].
- **Panel**: only the current step's controls exist in the DOM; `.body-wrap` and `.body` pin the footer to the panel bottom on short views. Footer: Back (tertiary, label on the content edge) left, primary action right.
- **Info section**: uppercase 12px kicker, 14px secondary prose, max 72ch, scoped to the current step, doc links most specific first.
- **Terminal step**: a "Next steps" section on the last step only, asserted present there and absent elsewhere [apps: signing, claiming, gas, tax-export]. An outcome page that forks per branch names one action per branch instead [apps: recovery].
- Sub-stages are `.cell` blocks with a mono ordinal; the rail reflects the parent step only. Desktop only unless the PRD says otherwise (`width=1200`).

## Non-flow pages [any page]

An index, lookup, about, history or explainer page uses the foundations, the surface system, the 64px header, the site footer, the voice and the don'ts, and no rail. Minimal shape: header, one or more standout tiles or one panel, an info section where a question needs answering, footer [apps: home, bnslookup; xverse.html, history.html, skills.html]. Builder-facing content lives in one quiet footer line, not the body [apps: home]. A page that needs one icon glyph may inline its path [apps: home]. Cross-app links belong on suite pages; a single-purpose tool's footer carries its repo link and nothing promotional [apps: recovery, bns, bnslookup].

## Chain-timing widgets [window-bound action]

Any progress display over a bounded chain window follows these rules; derivation, boundary tests and the submit guard are owned by `stacks-dapp-architecture`, section "Transaction validity windows".

- The percentage floors, never rounds: 99 until the last block, 100 only on it.
- The marker sits at the true position as its own element; within 12 percent of an edge only the number pins to the edge, joined by a short leader. Never clamp the marker.
- A blocked window has geometry: a 1px boundary tick and a neutral 10 percent tint over the tail, layered above the fill, with the boundary block named.
- Label the last block in the window, never the first block after it. Boundary and end labels sit in one right-hand flex group; no absolutely positioned labels near each other.
- Screenshot the boundary states from a committed script before showing the bar to anyone [apps: signing, home, bns].

## State and resume [wallet flow]

Storage keys, the URL contract and the persistence anchor are owned by `static-first-architecture` ("State without a backend") and `stacks-dapp-architecture` ("Reads", "Invariants"). On the screen: the URL id wins on load, else a single record auto-restores at its furthest step, multiple records open a picker, none starts at the first step; wallet disconnect keeps records and makes the flow read-only; reconnecting as a different account asks which step to resume, so remember the last connected account across disconnects [apps: signing, claiming, bns]. Say in one sentence where reloading loses work, on the step where it matters. Fixture mode is visible in chrome, a pill or banner [apps: tax-export, bns, bnslookup].

## Inputs that could receive key material [any paste input]

Any free-text input that could receive a paste detects key material and discards it without echoing it back. Detection uses the real BIP39 wordlist and demands a run: 8 or more consecutive wordlist words (punctuation does not break a run, a non-wordlist word does), or a letters-only token of 24 or more characters that fully segments into 8 or more words; WIF and extended-key patterns are separate regexes. A naive "any 12 short words" heuristic discarded a real support message; addresses never trip the check because they contain digits [apps: recovery, tax-export]. Discard means never render, store or send.

## Voice and copy [any Stacks Labs UI]

The floor is `writing-rules` and the register is `writing-labs-voices`; where they and this section disagree, the floor wins. Read every string by its element first (rule 29): buttons, headers, badges, status words and tooltips are table cells, terse by design; the prose on a screen is the subtitle, status lines, info section and explainer pages.

- **Step subtitle**: at most three sentences on what the step does to the reader's money or position. **Info section**: one paragraph per role, one topic, six sentences at most, then doc links. An outcome paragraph on a verdict page is not a subtitle [apps: recovery].
- **One imperative per string, placed last**; the buttons are the procedure. **Title Case** for buttons and page titles with minor words lower, sentence case elsewhere, lowercase token and contract names; the verb names what the user does [apps: signing, claiming, gas, bns].
- **Modals**: condition, command, consequence (rule 4), only for actions that would fail or lose funds. **Errors**: inline `.status err` under the content, naming what failed; never frame an unresolved outcome as unrecoverable.
- **Mechanism and diagnostics sit in a closed disclosure** for end users, open for operators: which path ran, which revision verified, the contract principal, the latest block, the last read error. Plain words at the control, mode names only in the info section [apps: claiming, gas, recovery, bns].
- **Glossary**: one word per domain object across copy, code, state fields, CSV headers and sibling apps; define a term in its first string per step, under twelve words; a Clarity name appears in mono once per step beside the UI word. When end-user copy renames a term, write the mapping once at the top of the constants module [apps: claiming, gas, bnslookup, bns, recovery].
- **Chain facts**: every number about chain limits is unverified until checked against the chain, PRD numbers included; say what happens and when as two facts; every wait gets a number from primary docs beside the escalation threshold; state both sides of an asymmetry; for additive mechanisms state mechanism and number [apps: signing, recovery, bns]. Verified facts: `writing-stacks-protocol-facts`.

## Numbers and live data [any live figure]

- Identifiers in mono: full where the user will copy them, short and explorer-linked where they are a reference [apps: gas, signing]. One copy control per identifier row plus Copy all for lists [apps: bnslookup, recovery].
- **Stamp live on-chain figures with the read moment and the chain the figure came from**, and refresh on an explicit control [apps: bnslookup, gas, tax-export]. A display-only page may re-read silently and stop while hidden [apps: home]. The stamp is not the guard; the fresh read before signing is (`stacks-dapp-architecture`).
- A failed read renders as unavailable, never zero (`stacks-dapp-architecture`, "Reads").
- **Long reads** show the constraint beside the count ("34/49, reads capped at 45/min"), a self-correcting total, and a visible stall or cooldown countdown; a wait imposed by the node never looks like an idle page [apps: claiming, tax-export].
- **Say which source the view used and offer the other** [apps: claiming, bnslookup].
- **The price the reader pays comes first and bold**, breakdown after; copy that paraphrases a post-condition carries its exact semantics: "exactly" for `eq`, "at most" for `lte`, "at least" for `gte` [apps: bns, bnslookup, gas].
- A block height carries a faded approximate duration, at 10 minutes per block [apps: bns, bnslookup, recovery].
- The footer Reset is an anchored confirm pop, not a modal; its scope follows the persistence model [apps: signing, recovery, tax-export].

## Iconography and hard don'ts

Phosphor regular only, self-hosted. No gradients, emoji, backdrop blur, hero imagery, generic blue accents, new colors or type scales, shadows on resting cards, mono for prose, runtime CDN dependencies, mobile layout unless the PRD asks, clamped markers, rounded-up percentages, or edits to the shared recipes outside the marked block. Writing bans: `writing-rules`.

## Building a new flow or page

0. Open or create the running handoff file with `zero-to-capture` before any code.
1. Get or write the one-page PRD (steps, chain calls, state, glossary, acceptance criteria, golden fixtures); verify every protocol number against a primary source.
2. Load `static-first-architecture` and `stacks-dapp-architecture`; fix the tier and network identities; decide the readers per role before the first string.
3. Write the pure domain layer test-first, window math included, before any screen.
4. Scaffold from `references/scaffold.md` with this skill's assets and the entry import order.
5. Build screens from `references/components.md` only; new recipes go in the marked block.
6. Verify the built artifact with the harness; generate the copy inventory and run `writing-line-audit` over its prose rows.
7. Run a visual pass from a committed script: every step in every state plus every boundary state of any chain-timing widget, against an optical checklist (shared baselines, footer pinned, tab flush, no overlapping labels, spacing rhythm). Functional assertions do not see design.

## Candidates (one app, under review)

Each entry names the app and path, the date, and the condition that promotes it (a second app of a different shape needs it) or retires it (two further builds do not).

- A sixth rail state "open": skip-ahead from a fresh flow, demoted to locked once the guided path starts. bns `src/core.jsx` `freshFlow`, 2026-10-18.
- Back skips a blocked step and lands on the nearest step with something to view. recovery `src/app.jsx` lines 409 to 412, 2026-10-09.
- Role-impossible steps are hidden; shape-disabled steps stay visible as not applicable; a cold-entry terminal step stays clickable. claiming `src/core.jsx` lines 218 to 220, v34 live 2026-10-19.
- A branch view outside the rail (buying) owns the URL while open and returns to the flow on close. bns `src/app.jsx` `openBuy`, 2026-10-18.
- A second accent for a mode, scoped on one container, the same on both networks. bns `src/styles/app.css` `.buy-scope`, 2026-10-18.
- A window bar may preview before its anchoring event, labelled as conditional. bns `src/core.jsx` `WindowBar`, 2026-10-18.
- Outcome first, evidence one click away with the byte-for-byte comparison intact, for diagnostic flows whose last step is a verdict. recovery `src/app.jsx` `analyze`, 2026-10-09.
- A zero is a plain zero; dust and floor warnings attach only to blocked positive amounts, with the arithmetic inline. claiming `src/steps.jsx`, 2026-09.
- Bind a quoted editable number to its field so the copy adapts live. signing `src/steps.jsx`, 2026-09-03.
- A copy pass is accepted by regenerating the copy inventory from source, flags keyed to writing-rules numbers. claiming `scripts/copy-inventory.mjs`, 2026-10-17.
- Never remove the user's record of what they submitted; add the outcome beside it ("Replaced by fee", "Also pending"). gas `app/src/amounts.js` line 159, 2026-10-09.
- Two side-by-side ledgers, one per currency, for a multi-leg terminal step. gas `app/src/styles/app.css` PROPOSAL block, 2026-09.
- Row lists select with a radio at the far left; the whole row is the target. bns `src/steps.jsx`, 2026-10-18.
- A header search into a sibling app is a plain GET form opening a new tab. bns `src/app.jsx` lines 251 to 259, 2026-10-18.
- Judge an identifier field after blur or full length, not while typing. tax-export `src/steps.jsx` lines 54 to 66, 2026-10-15.
- Fiat rounds on screen; the export stays exact. tax-export `src/units.js`, 2026-10-15.
- Unknown tokens are never called spam; a missing price is the only signal. tax-export `src/steps.jsx`, 2026-10-15.
- Dense data table and stage list with meter recipes. tax-export `src/styles/app.css` lines 162 to 212 PROPOSAL, 2026-10-15.
