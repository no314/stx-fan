---
name: "stacks-labs-dapp-design"
description: "Design system, layout patterns, and voice for Stacks Labs standalone dApps and pages, extracted from the production Zero to Signing app and refined through Zero to Claiming, sBTC Deposit Recovery, Zero To BNS, BNS Lookup, the zero_to homepage, the tax export and the sBTC gas swap. Use whenever building, styling, restyling, or writing copy for any Stacks Labs product UI, any \"Zero to X\" guided flow, any standalone single-page dApp or step wizard (up to 8 steps, with or without a wallet), any index, lookup or explainer page, or any screen that should look like Stacks Labs work, even if the user never says \"design\". Also use when reviewing such a UI for consistency. Pair it with the static-first-architecture and stacks-dapp-architecture skills, which own deployment and wallet/chain security, and with writing-rules and writing-labs-voices from the stacks-labs-docs-writing plugin, which own the writing floor and the register; this skill owns how the app looks, lays out, and reads on a screen."
---

# Stacks Labs dApp Design

About this version: zero_to v4, merged 2026-11-21, body 1,950 words against a budget of 1,950. Handoffs: `skills-ledger.md` and the v4 merge report. References: `components.md` (recipes), `scaffold.md` (skeleton, PRD template, harness checks), `incidents.md`, `constants.md`. Hosted copies under `https://stx.fan/zero_to/`: `zt_skill-ref-stacks-labs-dapp-design-<name>.zero_to-v4.md`, `zt_skill-asset-app.zero_to-v4.css`, `zt_skill-asset-tokens.zero_to-v4.css` and the `zt_*.woff2` fonts; fetch them when a local file is missing.

Binding visual style, layout patterns and voice for Stacks Labs product UI. The core is the foundations, the surface system, the header and footer, the voice and the don'ts; every page in the family uses those. The **step rail** is one pattern built on top of them, right for a guided flow.

## Division of labor

This skill owns look, layout and voice. Load it with `static-first-architecture` (build, dependencies, harness), `stacks-dapp-architecture` (tier, wallets, post-conditions, reads), `writing-rules` (the floor for every string; rule numbers below refer to it), `writing-labs-voices` (End-user or Operator register) and `writing-line-audit`. Product behavior comes from a one-page PRD; do not build without one.

## Foundations [any Stacks Labs UI]

Never invent colors, type sizes, spacing, radii or shadows. Everything comes from `assets/tokens.css` and `assets/app.css`; copy both and `assets/fonts/` into the project and load tokens before app [apps: all eight]. Fonts are self-hosted; a flat layout may edit the font URLs in its copy of tokens.css and nothing else [apps: home].

- **Type**: `--font-display` (Open Sauce Sans) for headings only; `--font-body` (Instrument Sans) for body and UI; `--font-mono` (JetBrains Mono) only for numbers, hashes, principals, txids, block heights, code, commands and timestamps. Headings in chrome stay 20 to 26px. Mono contexts disable ligatures, or `https://` renders as one glyph [apps: bns, bnslookup].
- **Color**: semantic tokens only; never raw hex in components. **Spacing**: 4-pt scale, dense. **Radius**: controls 8px, cards 12px, nothing larger. **Borders carry structure, not shadows**; shadows only on floating surfaces and the primary button glow.
- **Mixed-size text aligns on baselines, not centers** [apps: signing, gas, bns, tax-export].
- **Brand logos are used as-is**: no borders, recolors or redraws; full brand names on labels [apps: claiming].

## Network accent swap [any networked UI]

Testnet replaces the accent entirely (violet against mainnet orange). `body` defines `--accent`, `--accent-hover`, `--accent-soft`, `--accent-shadow`; `body.net-testnet` overrides all four, and every accent use goes through them. An app with no network switch keeps the mainnet accent [apps: signing, claiming, bns, bnslookup, gas].

## Surface system (closed set) [any Stacks Labs UI]

The shell is one continuous `--surface-tertiary` tone separated by 1px `--border-secondary` rules; never differentiate shell regions by fill. The main panel or tile is a standout card: `--surface-primary`, no border, radius 12px; any container holding form controls takes this form. Nested groups are `--surface-secondary`, radius 8px. Inputs sit on `--surface-fourth` with a 1px frame; read-only inputs drop to `--surface-secondary`. Cards are never white, gradient or left-border-accented. **App-specific recipes are appended, never interleaved**: one marked block at the tail of the app's copy of app.css, tokens only, naming the app and the reason, so the shared recipes stay byte-identical and diffable; candidates for the shared set are flagged PROPOSAL [apps: claiming, recovery, gas, bns, bnslookup, tax-export].

## The step-flow pattern [step flow]

Header (64px), step rail, active panel, info section. One flow per page, 2 to 8 steps; number from 0 when step 0 is a no-interaction prerequisites checklist, from 1 otherwise. The pattern scales down to 4 steps [apps: recovery, tax-export] and to none [apps: bnslookup].

- **Rail states**: locked, active, complete, skipped, blocked. Locked steps are not clickable; complete steps open read-only views; re-enterable steps stay writable. Skipped means declined and stays visible struck through. Blocked means the flow resolved before this step was needed: complete-weight, a minus-circle, italic "not needed", never clickable [apps: recovery, claiming].
- **Rail geometry is load-bearing**: every step number and the active title share one text baseline; the tab keeps a fixed 80px box flush with the panel. Verify both programmatically after any rail change; the assertion is in `references/scaffold.md` [apps: signing, gas, bns, tax-export].
- **Panel and info section**: only the current step's controls exist in the DOM; the footer is pinned to the panel bottom with Back left and the primary action right; the info section is scoped to the current step. Recipes: `references/components.md`.
- **Terminal step**: a "Next steps" section on the last step only, asserted present there and absent elsewhere [apps: signing, claiming, gas, tax-export]. An outcome page that forks per branch names one action per branch instead [apps: recovery].
- Desktop only unless the PRD says otherwise (`width=1200`).

## Non-flow pages [any page]

An index, lookup, about, history or explainer page uses the foundations, the surface system, the 64px header, the site footer, the voice and the don'ts, and no rail. Minimal shape: header, one or more standout tiles or one panel, an info section where a question needs answering, footer [apps: home, bnslookup]. Builder-facing content lives in one quiet footer line, not the body; on the home page a demo app carries a Demo pill and sorts after the apps that are not demos [apps: home]. Cross-app links belong on suite pages; a single-purpose tool's footer carries its repo link and nothing promotional [apps: recovery, bns, bnslookup].

## Chain-timing widgets [window-bound action]

Any progress display over a bounded chain window follows the recipe in `references/components.md`: the percentage floors, the marker sits at the true position and is never clamped, a blocked window has geometry, and the last block in the window is labelled, never the first after it. Screenshot the boundary states from a committed script [apps: signing, home, bns]. Derivation, boundary tests and the submit guard: `stacks-dapp-architecture`, "Transaction validity windows".

## State and resume [wallet flow]

Storage keys, the URL contract and the persistence anchor are owned by `static-first-architecture` ("State without a backend") and `stacks-dapp-architecture` ("Reads", "Invariants"). On the screen: the URL id wins on load, else a single record auto-restores at its furthest step, multiple records open a picker, none starts at the first step; wallet disconnect keeps records and makes the flow read-only; reconnecting as a different account asks which step to resume, so remember the last connected account across disconnects [apps: signing, claiming, bns]. Say in one sentence where reloading loses work, on the step where it matters. Fixture mode is visible in chrome, a pill or banner [apps: tax-export, bns, bnslookup].

## Inputs that could receive key material [any paste input]

Any free-text input that could receive a paste detects key material and discards it without echoing it back. Detection demands a run on the real BIP39 wordlist: 8 or more consecutive wordlist words, or a letters-only token of 24 or more characters that segments into 8 or more; WIF and extended keys are separate patterns [apps: recovery, tax-export]. Discard means never render, store or send.

## Voice and copy [any Stacks Labs UI]

The floor is `writing-rules` and the register is `writing-labs-voices`. Read every string by its element first (rule 29): buttons, headers, badges, status words and tooltips are table cells; the prose on a screen is the subtitle, status lines, info section and explainer pages.

- **Step subtitle**: at most three sentences on what the step does to the reader's money or position. **Info section**: one paragraph per role, one topic, six sentences at most, then doc links.
- **One imperative per string, placed last**; the buttons are the procedure. **Title Case** for buttons and page titles with minor words lower, sentence case elsewhere, lowercase token and contract names; the verb names what the user does [apps: signing, claiming, gas, bns].
- **Modals**: condition, command, consequence (rule 4), only for actions that would fail or lose funds. **Errors**: inline `.status err` under the content, naming what failed; never frame an unresolved outcome as unrecoverable.
- **Mechanism and diagnostics sit in a closed disclosure** for end users, open for operators: which path ran, which revision verified, the contract principal, the latest block, the last read error. A restatement of the reader's own selection folds closed. Plain words at the control, mode names only in the info section [apps: claiming, gas, recovery, bns].
- **Glossary**: one word per domain object across copy, code, state fields, CSV headers and sibling apps; define a term in its first string per step, under twelve words; a Clarity name appears in mono once per step beside the UI word. When end-user copy renames a term, write the mapping once at the top of the constants module [apps: claiming, gas, bnslookup, bns, recovery].
- **Chain facts**: every number about chain limits is unverified until checked against the chain, PRD numbers included; say what happens and when as two facts; every wait gets a number from primary docs beside the escalation threshold; state both sides of an asymmetry; for additive mechanisms state mechanism and number [apps: signing, recovery, bns]. Verified facts: `writing-stacks-protocol-facts`.

## Numbers and live data [any live figure]

- Identifiers in mono and always in full: every address, txid and hash, the wallet button included; an explorer link never replaces the value [apps: batch-tx, gas]. One copy control per identifier row plus Copy all for lists [apps: bnslookup, recovery].
- **Stamp live on-chain figures with the read moment and the chain the figure came from**, and refresh on an explicit control [apps: bnslookup, gas, tax-export]. A display-only page may re-read silently and stop while hidden [apps: home].
- **Submitted is not confirmed.** A transaction id is shown with its stage: pending, confirmed, or failed with the reason. A step that depends on it re-reads on confirmation. Green means completed only. The record of what was submitted is never removed; the outcome goes beside it [apps: batch-tx, claiming, gas].
- **Sign queues count the plan once**, in the unit the wallet will show; the sign button carries the number still to sign; a button that leaves the step stays disabled while a request is in flight [apps: claiming, batch-tx].
- A failed read renders as unavailable, never zero (`stacks-dapp-architecture`, "Reads").
- **Long reads** show the constraint beside the count, a self-correcting total, and a visible stall or cooldown countdown; a wait imposed by the node never looks like an idle page, and a progress count is a real count [apps: claiming, tax-export, recovery].
- **Say which source the view used and offer the other** [apps: claiming, bnslookup].
- **The price the reader pays comes first and bold**, breakdown after; copy that paraphrases a post-condition carries its exact semantics: "exactly" for `eq`, "at most" for `lte`, "at least" for `gte` [apps: bns, bnslookup, gas].
- A block height carries a faded approximate duration, at 10 minutes per block [apps: bns, bnslookup, recovery].
- The footer Reset is an anchored confirm pop, not a modal; its scope follows the persistence model [apps: signing, recovery, tax-export].

## Iconography and hard don'ts

Phosphor regular only, self-hosted. No gradients, emoji, backdrop blur, hero imagery, generic blue accents, new colors or type scales, shadows on resting cards, mono for prose, runtime CDN dependencies, or edits to the shared recipes outside the marked block. Writing bans: `writing-rules`.

## Building a new flow or page

0. Open or create the running handoff file with `zero-to-capture` before any code.
1. Get or write the one-page PRD; verify every protocol number against a primary source.
2. Fix the tier and network identities; decide the readers per role before the first string.
3. Write the pure domain layer test-first before any screen.
4. Scaffold from `references/scaffold.md` with this skill's assets; build screens from `references/components.md` only, new recipes in the marked block.
5. Verify the built artifact with the harness; generate the copy inventory and run `writing-line-audit` over its prose rows [apps: claiming, usdcx].
6. Run a visual pass from a committed script: every step in every state, against the optical checklist in `references/scaffold.md`.

## Candidates (one app, under review)

Each entry names the app and path, the date, and the condition that promotes it (a second app of a different shape needs it) or retires it (two further builds do not).

- Back skips a blocked step and lands on the nearest step with something to view. recovery `src/app.jsx` lines 409 to 412, 2026-10-09; usdcx `src/app.jsx` `backTarget` (same shape).
- Outcome first, evidence one click away with the byte-for-byte comparison intact, for diagnostic flows whose last step is a verdict. recovery `src/app.jsx` `analyze`, 2026-10-09; usdcx copies the pipeline (same shape).
- Consider that a network switch disconnects an account from the other network and says why in one line that names the full address. batch-tx `src/app.tsx` `switchNetwork`, 2026-11-19.
- Consider explaining a variant that changes who signs, not what happened, at the field that selects it, with possessives switched off. claiming `src/steps.jsx` `SignerLine`, 2026-10-20.
- Consider one function for a figure shown on two steps, and check the wording against the case where the second figure is larger. claiming `src/chain.js` `planTotals`, 2026-10-25.
- Consider listing by what the reader started, not by storage key. claiming `src/app.jsx` `walksFolded`, 2026-10-29.
- Consider naming both directions of a two-way bridge with the asset pair everywhere ("USDC > USDCx (deposit)"). usdcx `src/parse.js`, 2026-11-06.
- Long mono values: label above value, break anywhere, capped box. recovery (a 1,102 character script), usdcx `.evid.three`, 2026-11-05; recipe PROPOSAL in `references/components.md`.

Retired 2026-11-21 under the two-further-builds rule: fourteen v3 candidates, kept as retired rows in the ledger. Promoted to core: the copy inventory and the record of what was submitted. Open: the color for a transaction that was mined and aborted, to check with the designer.