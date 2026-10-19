---
name: static-first-architecture
description: "Choose the least operationally expensive architecture for prototypes, dashboards, data explorers, reports, and read-heavy internal tools. Use when selecting an architecture or hosting model, building a prototype/dashboard, replacing an API or container, deciding whether a backend is needed at all, vendoring and pinning a static app's runtime dependencies, or setting up test-first domain modules, the offline verification harness, and fixtures for a static app. Prefer pre-rendered static assets; escalate to browser-side compute, then WASM-backed libraries, then serverless, then an always-on server, only for named, concrete requirements. Ship a self-contained artifact: vendor and pin runtime dependencies (with a local fallback if a CDN is used), and verify by executing the built artifact against fixtures, not by resolving the dependency graph."
---

# Static-First Architecture

About this version: zero_to v3, merged 2026-10-19, body 1,950 words against a budget of 1,800 (the overage is the retained generic WASM packaging list and the ten harness rules, each confirmed by two or more apps). Drew on 20260903_skill-update-handoff-zero-to-signing.md, 20260903_skill-update-handoff-zero-to-claiming.md, 20260904_skill-update-handoff-sbtc-deposit-recovery.md, 20261018_skill-update-handoff-sbtc-gas-swap.md, 20261018_skill-update-handoff-sbtc-deposit-recovery.md, 20261018_skill-update-handoff-zero-to-bns.md, 20261018_skill-update-handoff-bns-lookup.md, 20261018_skill-update-handoff-zero-to-claiming.md, 20261018_skill-update-handoff-zero-to-home.md, 20261019_skill-update-handoff-tax-export.md. Rules carry the apps they were observed in and a scope tag. Stories: `references/incidents.md`; facts: `references/constants.md`; copy-by-path and harness mechanics: `references/scaffold.md`. Hosted copies of every reference file: `https://stx.fan/zero_to/zt_skill-ref-static-first-architecture-<name>.zero_to-v3.md` (names incidents, constants, scaffold); fetch them when a pointer is followed and the local file is missing.

Choose the least operationally expensive architecture that satisfies the real requirements. A static site on object storage, a CDN or Pages is the default; everything else is an escalation justified by a named requirement. WASM is not an architecture but a compilation target some libraries use (in-browser SQLite or DuckDB, ffmpeg); it enters a project as a dependency at rung 3, never as a goal. State the requirement and let wasm-backed libraries appear only where a dependency demands them.

## The architecture ladder [any static app]

Evaluate in this order and stop at the first rung that satisfies the requirements.

1. **Pre-render.** Build UI and bounded results into static HTML, JavaScript, JSON, CSV or Parquet at build time. A Vite-built SPA is static output and belongs here.
2. **Browser-side JavaScript.** Filter, sort, aggregate, visualize and persist locally over data shipped as static assets. Heavy pure computation goes in a Web Worker (no Vite configuration needed).
3. **WASM-backed local querying.** Lazily load a wasm library (sql.js, wa-sqlite, DuckDB-WASM) for local queries that snapshots and plain JS cannot answer economically. Prefer a static database file over a hosted database for read-only prototypes. Precompiled binaries only.
4. **Narrow serverless.** One small endpoint for the irreducible secret, write, authorization or freshness boundary.
5. **Always-on server.** Only after naming the requirement every earlier rung fails.

Inspect the repository before asking anyone to choose a host; make the static-first choice and explain any escalation. Ask first only when data sensitivity is unclear and rungs 1 to 3 would ship the dataset to every visitor. Rung 1 removes whole vulnerability classes: a dist of static files cannot have the server-side endpoint an advisory needs [apps: signing].

## Dependencies are part of the artifact [any static app]

A page that imports libraries from a CDN at load is deploy-static but not self-contained; a broken upstream publish takes it down with nothing wrong in your code.

- **Vendor and pin what you ship**: exact versions including transitive ones, no carets or tildes, lockfile committed, dev and runtime alike. A tree of around a hundred packages is auditable by hand [apps: signing, claiming, recovery, gas, bns, bnslookup, tax-export]. A throwaway contracts or tooling project may float; say so.
- **Vendoring can be load-bearing for correctness.** When registry versions lack semantics the app needs, the vendored bundle is the only working copy. Write the reason at the import site and assert the capability in a test, so "update to latest" cannot silently remove it [apps: signing, claiming, bns] [wallet dApp].
- **CDN only with a pinned local fallback**; prefer the local copy and re-vendor deliberately.
- **Version or content-address every bundle** so a deploy cannot mix stale and fresh copies; a `?v=` bump on a shared asset is enough. WASM libraries follow the same rule. A version the registry lacks is pinned as a versioned tarball URL with lockfile integrity [apps: tax-export].

## State without a backend [any static app]

The URL is the session. Put user-selectable state (filters, dataset, network, read-endpoint override, a throttle) in the query, every parameter visible at its current value; a parameter that only appears when set is a feature nobody finds. Never put secrets or personal data in the URL [apps: signing, claiming, recovery, gas, bns, bnslookup, tax-export]. Parameter order and the `?api=` contract belong to `stacks-dapp-architecture`, section "Reads".

Persistence forks on recompute cost. When every input is public and the result recomputes in under a second, browser storage is banned and the URL is the whole state; the harness asserts storage stays empty [apps: recovery, bnslookup, home]. When a result costs minutes of a shared API budget, keep a device cache in IndexedDB keyed by the inputs and the read host, and give the footer a control that clears it [apps: tax-export]. Where a flow persists, the anchor that permits the first write is owned by `stacks-dapp-architecture`, section "Invariants".

A restartable async loader carries a run id and checks it after every await [apps: claiming, bnslookup]. Sibling apps talk through URL contracts, not shared code [apps: bns, bnslookup, tax-export].

## Data tiers and remote WASM reads [any static app]

Three tiers for dashboards with hot and arbitrary reads: precomputed snapshots for initial pages and common reports (no WASM boot), complete bounded tables shipped static with sort, filter and paging in JS, and a packaged database queried only for drill-downs that cannot be enumerated at build time, lazy-loaded on the first tail query [apps: tax-export, tier 1 price tables].

Querying a static database over HTTP: prune unused tables and columns; index every interactive lookup and regenerate planner statistics; bound expansions and result sets; batch lookups; materialize compact projections where wide tables cause excess page reads; match request chunks to the database page size and verify host range-request behavior; content-address database files and snapshot generations; test at production scale. Measure actual bodies and range `GET`s, never a `HEAD` response's advertised length.

## Escalate only for concrete constraints [any static app]

Use server-side infrastructure only when one of these is real: secrets at request time; authoritative writes, transactions, server-enforced authorization or multi-user coordination; data that must not be downloadable by every authorized visitor; freshness that rebuilds or a narrow serverless refresh cannot meet; a working set too large for target devices or economical ranged reads; long-running, memory-heavy, browser-unsupported or must-be-trusted compute; realtime push or collaborative state. A write endpoint does not pull reads, filtering, rendering or analytics onto the server. For wallet-and-chain apps several triggers are satisfied by the wallet and the chain; see `stacks-dapp-architecture`, section "Why a dApp usually needs no backend".

## Protect security boundaries [any static app]

Every shipped asset, WASM binary and packaged database is downloadable by every visitor who can load the page; WASM gives no confidentiality over JavaScript. Never embed secrets in a client bundle. Platform access control (private Pages, authenticated CDN) is acceptable only when downloading the complete dataset is acceptable for each authorized viewer, and only after verifying the platform enforces it (private GitHub Pages needs Enterprise Cloud). Per-viewer row or field restriction needs rung 4 or 5.

## Test-first for the pure domain layer [any static app]

Verification has three layers; only the first is test-driven.

1. **Pure domain modules get failing tests before code.** List every pure function the PRD implies: calculations, parsers, classifiers, derivations from fixture or chain data, throttle and chunking logic, every read-path decision. Each gets a Node test whose failing case is written first. The module imports no DOM and no network, so it runs unchanged in Node, the page and a worker. Every recorded arithmetic defect in this family lived here [apps: recovery, gas, home, tax-export; signing and claiming found theirs in screenshots]. Inject the clock into anything timer- or date-dependent, or the replay rots by date [apps: home, tax-export]. Boundary blocks for chain windows: `stacks-dapp-architecture`, "Transaction validity windows".
2. **The browser harness is test-after and incident-driven**, asserting acceptance criteria against the built artifact as a regression suite.
3. **Design and chain verification are not testable by you**: screenshots read by a person, hash pins, live smoke tests. A green suite is not done.

Runner default: `node --test`, built in, no dependency, `--watch` for the red-green loop [apps: home, tax-export, gas]; a hand-rolled `check(name, ok)` counter stays acceptable where a project already uses it [apps: recovery]. Parity-test the pure layer against an independent implementation: a ported reference script, arithmetic re-derived from deployed source, or a second endpoint family recomputed with separate code [apps: recovery, gas, tax-export]. Order that paid off: pure modules and tests, worker, flow against fixtures, clients, harness, screenshots, live smoke [apps: recovery, tax-export, home].

## The offline harness is the center of gravity [any static app]

Verify the assembled app against the built `dist/`, offline, with fixtures: serve it, answer every read from fixtures, stub any wallet bridge in page, assert and screenshot every state. Build before you verify; the harness is only as current as the last build [apps: all eight].

- **Fixture mode lives in the client layer and ships in the production build behind a URL flag**, so the harness runs acceptance criteria against the exact deployed artifact and asserts zero external requests [apps: recovery, gas, bns, bnslookup, tax-export]. Large fixture data may stay beside `dist/`, served only by the harness [apps: tax-export]. A page with a single read may intercept the route instead [apps: home, signing]. Strip fixture mode when fixtures would carry non-public data. The design skill owns how fixture mode shows in chrome.
- **Two interception styles, two error rules.** Route interception answers errors as 200 bodies the app treats as unusable, because a fixture 404 is a real network event that pollutes the console-clean check [apps: signing, claiming, home]. An injected `fetch` answers real statuses, since its responses are objects, not events [apps: gas, tax-export].
- **On-chain values in fixtures are real and checksum-valid**; an invented principal makes the app's own encoder throw. Names and personal addresses in fixture prose are visibly fake [apps: claiming, gas, tax-export; recovery].
- **Golden fixtures are recorded from live reads, record the pre-fix state, and say in their header which values are recorded and which synthetic.** Record first, assert by behavior second [apps: recovery, gas, bns, tax-export].
- **Stub a wallet at the request boundary**, not at connect, so encoding and post-condition construction run and the harness compares the wire hex against the same vendored bundle in Node [apps: bns, gas] [wallet dApp].
- **Mechanize house rules**: fail on any non-localhost request; assert nothing in storage and no wallet bundle where none belongs; walk the rendered app-authored copy for the writing bans, excluding rows and inputs that carry upstream text [apps: all eight]. The bans are owned by `writing-rules` and the design skill.
- **Functional assertions do not see design**; the harness makes design review possible, it does not perform it [apps: signing, gas, claiming]. **Screenshots come from a committed script that re-shoots every state** [apps: signing, claiming, recovery, gas, bns, bnslookup, home].
- **Never write counts in prose next to code that changes** [apps: recovery, tax-export, home].
- **Then smoke-test live** from an environment that reaches the hosts, over several build-test-fix rounds; fixtures miss rate-limit units, races and cost ceilings [apps: claiming, gas, tax-export]. Launch flags, fixture-object and stub patterns, worker counting and CI notes are in `references/scaffold.md`.

## Implement and verify

0. Open or create the running handoff file with `zero-to-capture` before any code.
1. Identify reads, writes, secrets, authorization, freshness, data size and target devices.
2. State the selected rung and the evidence for any escalation.
3. Write the pure domain layer test-first and parity-test it.
4. Build a reproducible static artifact, dependencies vendored and pinned, host-agnostic.
5. Confirm the built artifact runs: load it and assert the exports and behavior you depend on. A resolvable dependency graph proves nothing about runtime.
6. Run the harness against `dist/`, then the screenshot pass, then the live smoke tests.
7. Gate representative scenarios on transferred bytes, request count, WASM boot and usable-content latency on a range-capable local server with the production-sized artifact.
8. Deploy the contents of `dist/` only, and only the current files; the root `index.html` references the unbuilt entry, and rebuilds leave old hashed assets that look live [apps: signing, claiming, recovery, gas, tax-export]. `rsync --delete` with explicit exclusions keeps a published folder clean [apps: gas].

Prefer a deployable artifact over infrastructure scaffolding. No Docker, hosted database, queue or API process because they are conventional.

## Candidates (one app, under review)

Each entry names the app and path, the date, and the condition that promotes it (a second app of a different shape needs it) or retires it (two further builds do not).

- A dynamic `import()` of a hashed chunk needs a catch that asks the user to reload, since a deploy renames chunks an open page has not loaded yet. Consider for any lazily loaded module. tax-export `src/app.jsx` lines 22 to 25, 2026-10-15.
- Accept inbound alias parameters and normalize to the canonical one on the first URL write. bnslookup `src/app.jsx` lines 80 to 97, 2026-10-18.
- A later loader stage acts only on items whose prerequisites loaded, or one failure cascades into hundreds of reads. tax-export `src/loader.js` lines 214 to 219, 2026-10-15.
- Record the main bundle hash per release and compare it with the served page before treating a report as a defect. claiming, 2026-10-19.
- Migrate persisted record shapes with defaults on every load. bns `src/core.jsx` `migrateFlow`, 2026-10-18.
- An icon web-font import emits every format; consider inlining the one glyph a page needs. recovery dist observation, home `zt_site.js`, 2026-10-18.
- An owner correction phrased "make sure it does not return" becomes a grep over every shipped page, not only the rendered body. bns `scripts/verify-app.mjs`, 2026-10-18.
- Audit check bodies for tautologies; two checks ending in `|| true` tested nothing. recovery `scripts/verify-app.mjs` lines 290 and 313, 2026-10-18.
- Assert the exact count of expected error logs, not only the absence of unexpected ones. claiming `scripts/verify-app.mjs` lines 1738 to 1749, 2026-10-18.
- Keep data a Node harness must import in a side-effect-free module. home `zt_skills-data.js`, 2026-10-18.
- A static host cannot list folders; keep a hand-edited list and assert each target exists. home `zt_verify-home.mjs` line 71, 2026-10-18.
- Resolve co-deployed data files relative to the page, never by absolute path. gas `app/src/clients.js` lines 3 to 6, 2026-10-18.
- Rung 1 data tables plus a refresh script before deploy plus a one-request runtime fallback for dates past the table. tax-export `scripts/update-prices.mjs`, `src/loader.js` lines 306 to 321, 2026-10-15.
- Copied data from an MIT project ships its notice in the deployed folder and the credits. tax-export `public/LICENSE-FatStx.txt`, 2026-10-15.
- Device cache details: IndexedDB, save every few seconds while running, restore on identical inputs, discard on any input change. tax-export `src/store.js`, 2026-10-15.
