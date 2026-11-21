---
name: "zero-to-merge"
description: "Run a skill-merge session for stacks-dapp-architecture, static-first-architecture and stacks-labs-dapp-design: read the capture files that zero-to-capture wrote, update the living rule ledger, apply the promotion and retirement rules, and propose each skill through the review card within its word budget. Use when asked to merge handoffs, fold in captures, simplify or re-version the zero_to skills."
---

# zero-to-merge

About this version: v2, 2026-11-22, written after the v4 merge. New since v1: a triage step before any proposal, shape classes defined here, promotion inside a scope, retirement only by builds that could have used the candidate, a cutoff by entry date, a defined word count with a budget of 1,950, proposals as checked edits, the PRD template as a merge target, reference consolidation and a publish handoff.

The merge turns capture files into skill text. It is the counterpart of `zero-to-capture`: that skill records, this one decides. It exists so the procedure does not live in one prompt on one machine.

## Inputs, read in this order

1. The current SKILL.md of each target skill. Their reference files are read from `refs/<skill>/references/` in the skill-rewrite folder, since the installed copies of the two architecture skills carry none.
2. `skills-ledger.md` in the skill-rewrite folder: the living ledger from the last merge. Never start a new one.
3. Every `*_skill-update-handoff-*.md` with an entry dated after the ledger's merge date. The cutoff is the entry date, not the file date: a long-running file is read for its newer entries only. Undated entries in such a file are read as old unless the file's own log dates them. Per app, read the most recent file; an older file is read when the newer one cites it. Entries tagged `inferred` never reach core.
4. The app sources named by the handoffs (`src/`, `scripts/`, `tests/`, `package.json`, PRD, README; never `dist/`, `node_modules/` or `screenshots/`). Where a handoff and the source disagree, the source wins and the disagreement goes in the ledger.
5. The previous merge report's residue list; nothing listed as deliberately dropped is re-encoded.

Request folder access for every missing path in one request before reading anything; stop on partial inputs. Folders the owner tells you to skip are recorded as skipped in the ledger.

## Lines a capture entry may carry

- `Owner decision YYYY-MM-DD: not for the skills`: do not merge, promote or count the entry. One ledger row lists all such entries as not encoded.
- `Origin: <repo at commit>`: counts as a second observation for that entry, unless the entry also carries a closing owner decision or the owner excluded it by name.
- `Refutes: <earlier entry>`: follow the later entry; record the pair under contradictions.
- `Observed live: no`: the entry may reach a candidate or a reference file, not core, unless a failure mode carries it.
- A handoff's "Candidates used" section: the evidence for promotion and retirement below.

## Triage before the ledger

Give the owner one set of tables before writing anything: generalisations that replace several rules, what is worth keeping with its destination, what goes to reference files only, and what is clutter. State every open question that changes the count (a new app's shape class, the budget, an origin's weight). Wait for his answers. This step settles in two messages what otherwise surfaces as rejected proposals.

## The ledger

One row per rule, default or example in any skill, plus every handoff entry not yet in a row. Columns: id, rule (one line), owning skill, apps where it is implemented or was needed (from source, verified by grep), failure mode if violated, scope tag ([any static app] [wallet dApp] [chain-reading app] [staking flow] [window-bound action] [this app family] [one app]), destination, notes. Update rows; add rows for new entries; mark retired rows retired with the date. Write the app inventory first: every app and page, its shape, chain surface, stack and handoffs. Save a dated copy at the end of the session.

**Shape classes**: wallet flow, no-wallet flow, no-rail page. An app scaffolded from another counts as the other's shape, even when it adds a wallet call; the owner confirms the class of every new app.

## Destinations

- **core**: one of three routes. (a) Implemented or needed in two apps of different shape class. (b) One app plus a failure mode that loses funds, signs wrong, or misleads a value decision. (c) For a rule whose scope tag confines it to one shape class, such as a signing queue, two apps of that class that were not scaffolded from each other. Written as a normative rule with `[apps: ...]` and a scope tag; route (b) names the failure in the rule.
- **candidate**: one app, no such failure mode, plausibly general. Goes in the skill's "Candidates (one app, under review)" section as one or two sentences with app, path, date; voice "consider", never "(default)". **Promotion**: a later build needs it by route (a) or (c). **Retirement**: two further builds that could have used it did not. A build could have used a candidate when its shape class and scope tag fit; a build that lists the candidate under "Candidates used" as considered and not fitting counts, a build of another shape does not. Retire at the merge that sees the second such build. A retired row is revived as a candidate when a later capture uses it.
- **reference**: protocol numbers, dated wallet observations, incident stories, copy-by-path, harness mechanics. Files are `references/constants.md`, `references/wallets.md`, `references/incidents.md`, `references/scaffold.md` under the owner; the design skill also owns `references/components.md`, the PRD template in its `references/scaffold.md`, and `assets/`. Every entry dated.
- **drop**: contradicted by current source, superseded, or duplicated under another owner.
- **moved**: one owner per rule. Owners: writing bans and voice floor, `writing-rules`; URL contract and `?api=`, `stacks-dapp-architecture` "Reads"; window derivation, boundary tests and submit guard, `stacks-dapp-architecture` "Transaction validity windows"; sequential signing, `stacks-dapp-architecture`; window geometry, the design skill; harness, fixtures and test-first, `static-first-architecture`; storage model, `static-first-architecture` "State without a backend"; persistence anchor, `stacks-dapp-architecture` "Invariants". Other skills point by skill and section name in one sentence and never restate.

When two handoffs disagree, encode the fork condition, never a winner. A skill may not describe its own asset as wrong: fix the asset in the edit list and delete the footnote. Prefer one rule that replaces several over a new rule beside them.

## Budgets and the count

Each SKILL.md body has a budget of 1,950 words, app names kept on every rule; the candidates section 400. The body is everything from the end of the frontmatter to the candidates heading, counted by whitespace-separated words with a script, never by eye. The "About this version" line states version, merge date and the body count against the budget. The handoffs drawn on are listed in the ledger and the merge report, not in the About line. A rule added over budget needs a rule removed, merged, or its detail moved to a reference file in the same proposal, with a pointer left in the body where the detail matters; say in the proposal summary what moved. An overage that remains is stated in the About line with the sections responsible.

## Procedure

1. Read inputs in the order above. Give the triage tables and wait.
2. Build the inventory, verify the apps column by grep in the four source folders, update the ledger and write it before any proposal.
3. Propose one skill at a time in the order static-first-architecture, stacks-dapp-architecture, stacks-labs-dapp-design, through the review card. Send the changes as edits. Before proposing, apply the same edits to the installed text with a script that checks each old string occurs once, counts the body and scans for em dashes. Wait for the decision. On rejection with feedback, revise and re-propose that skill only.
4. Write reference changes into `refs/<skill>/references/` as a section "Added in zero_to vN (date)". When a file carries three such sections, fold them into the file's own sections at that merge and keep the dates on the entries.
5. Update the PRD template when captures show a PRD field was missing, wrong or stale.
6. Deliver the merge report to the rewrite folder and the project: inputs, owner decisions, word counts before and after, the rule table with ledger ids, the candidate table (kept, new, promoted, retired), the drop list with a reason per row, what moved to reference files, the reference edit list, and open items.
7. Prepare `skills-vN/` (the SKILL.md texts), `hosted-vN/` (every file under its `zt_` name with the new version suffix) and a publish handoff for the coding agent. A published version is never overwritten. The installed skills name hosted URLs that exist only after that publish; say so to the owner when the merge ends.
8. Save the dated ledger copy. When a skill is approved after the report was written, update the status line in the report, the ledger and the handoff.

`zero-to-capture` and this skill are versioned on their own (v1, v2) and revised when a merge shows the procedure itself fell short; propose them through the review card after the three skills.

## Constraints

No em dashes anywhere, including examples and the ledger. No invented learnings: every core rule cites two app paths, or one path plus a named failure mode, or one path plus a named origin; every candidate cites one path and a date. Never write a partial address, hash or identifier; the complete value or none. Never touch the app folders, the repo or any worktree. The skills are proposed through the review card; nothing is edited in the installed copies on disk.
