---
name: zero-to-merge
description: "Run a skill-merge session for stacks-dapp-architecture, static-first-architecture and stacks-labs-dapp-design: read the capture files that zero-to-capture wrote, update the living rule ledger, apply the promotion and retirement rules, and propose each skill through the review card, one at a time, within its word budget. Use when asked to merge handoffs, fold in captures, simplify or re-version the zero_to skills, or when a build has finished and its capture file is ready. Never edits a skill file on disk; proposes complete SKILL.md replacements and writes reference files for Werner to apply."
---

# zero-to-merge

The merge turns capture files into skill text. It is the counterpart of `zero-to-capture`: that skill records, this one decides. It exists so the procedure does not live in one prompt on one machine.

## Inputs, read in this order

1. The current SKILL.md of each target skill and its `references/` files. Read them first, with fresh eyes.
2. `skills-ledger.md` in the skill-rewrite folder: the living ledger from the last merge. Never start a new one.
3. Every `*_skill-update-handoff-*.md` newer than the ledger's merge date. Per app, read the most recent file only; an older file is read when the newer one cites it. Entries tagged `inferred` never reach core.
4. The app sources named by the handoffs (`src/`, `scripts/`, `test/`, `package.json`, PRD, README; never `dist/`, `node_modules/` or `screenshots/`). Where a handoff and the source disagree, the source wins and the disagreement goes in the ledger.
5. The previous merge report's residue list; nothing listed as deliberately dropped is re-encoded.

Request folder access for every missing path in one request before reading anything; stop on partial inputs.

## The ledger

One row per rule, default or example in any skill, plus every handoff entry not yet in a row. Columns: id, rule (one line), owning skill, apps where it is implemented or was needed (from source, verified by grep), failure mode if violated, scope tag ([any static app] [wallet dApp] [chain-reading app] [staking flow] [window-bound action] [this app family] [one app]), destination, notes. Update rows; add rows for new entries; mark retired rows retired with the date. Write an app inventory section first: every app and page, its shape (wallet flow, no-wallet flow, no-rail page, other), chain surface, stack and handoffs. Save a dated copy at the end of the session.

## Destinations

- **core**: implemented or needed in two or more apps of different shape, or one app plus a failure mode that loses funds, signs wrong, or misleads a value decision. Written as a normative rule with `[apps: ...]` and a scope tag. Two sibling apps scaffolded from each other count as one shape.
- **candidate**: one app, no such failure mode, plausibly general. Goes in the skill's "Candidates (one app, under review)" section as one or two sentences with app, path, date; voice "consider", never "(default)". Promotion: a second app of a different shape needs it. Retirement: two further builds do not; retire at the merge that sees the second such build.
- **reference**: protocol numbers, dated wallet observations, incident stories, copy-by-path, harness mechanics. Files are `references/constants.md`, `references/wallets.md`, `references/incidents.md`, `references/scaffold.md` under the owner; the design skill also owns `references/components.md` and `assets/`. Every entry dated.
- **drop**: contradicted by current source, superseded, or duplicated under another owner.
- **moved**: one owner per rule. Owners: writing bans and voice floor, `writing-rules`; URL contract and `?api=`, `stacks-dapp-architecture` "Reads"; window derivation, boundary tests and submit guard, `stacks-dapp-architecture` "Transaction validity windows"; window geometry, the design skill; harness, fixtures and test-first, `static-first-architecture`; storage model, `static-first-architecture` "State without a backend"; persistence anchor, `stacks-dapp-architecture` "Invariants". Other skills point by skill and section name in one sentence and never restate.

When two handoffs disagree, encode the fork condition, never a winner. A skill may not describe its own asset as wrong: fix the asset in the edit list and delete the footnote.

## Budgets

Each SKILL.md body (everything after the frontmatter and before the candidates section) has a budget of 1,800 words; the candidates section 400. The "About this version" line under the title states version, merge date, body count against budget, and the handoff filenames drawn on. A rule added over budget needs a rule removed, merged or moved to a reference file in the same proposal. Generic pre-merge sections stay; their examples and tables move to references. An overage that remains is stated in the About line with the sections responsible.

## Procedure

1. Read inputs in the order above; build the inventory; update the ledger and write it before any proposal.
2. Propose one skill at a time, complete SKILL.md each, in the order static-first-architecture, stacks-dapp-architecture, stacks-labs-dapp-design, through the review card. Wait for the decision. On rejection with feedback, revise and re-propose that skill only.
3. Write every reference and asset file in full to the rewrite folder under `refs/<skill>/...` and list them as numbered edits; the proposal flow replaces SKILL.md only.
4. Deliver the merge report: the reference edit list, the drop list with a reason per row, the candidate counts and the promotion and retirement conditions, the inventory, word counts before and after, and open items.
5. Save the dated ledger copy and write a short session summary to the project.

## Constraints

No em dashes anywhere, including examples and the ledger. No invented learnings: every core rule cites two app paths or one path plus a named failure mode; every candidate cites one path and a date. Never write a partial address, hash or identifier; the complete value or none. Never touch the app folders, the repo or any worktree. The three skills, zero-to-capture and this skill are proposed through the review card; nothing is edited on disk.
