---
name: static-first-architecture
description: "Choose the least operationally expensive architecture for prototypes, dashboards, data explorers, reports, and read-heavy internal tools. Use when selecting an architecture or hosting model, building a prototype/dashboard, replacing an API or container, deciding whether a backend is needed at all, vendoring and pinning a static app's runtime dependencies, or setting up test-first domain modules, the offline verification harness, and fixtures for a static app. Prefer pre-rendered static assets; escalate to browser-side compute, then WASM-backed libraries, then serverless, then an always-on server, only for named, concrete requirements. Ship a self-contained artifact: vendor and pin runtime dependencies (with a local fallback if a CDN is used), and verify by executing the built artifact against fixtures, not by resolving the dependency graph."
---

# Static-First Architecture

Choose the least operationally expensive architecture that satisfies the real requirements. A static site on object storage/CDN/Pages is the default. Everything else is an escalation that must be justified by a named requirement. WASM is not an architecture: it is a compilation target used by some libraries (in-browser SQLite/DuckDB, ffmpeg, etc.). It appears in a project as a dependency pulled in at rung 3 of the ladder, never as a goal in itself. Do not instruct agents or teammates to "use WASM"; state the actual requirement (no backend, static deploy, local querying) and let wasm-backed libraries appear only where a dependency demands them.

## Start by copying

Three finished Stacks Labs apps carry the working shape of this skill. Start a new static app by copying structure from them rather than re-deriving it. Paths are relative to each app's root.

Copy by path:

- **Zero to Signing** `package.json`: exact pins, no ranges, dev and runtime alike (`"react": "18.3.1"`, `"vite": "5.4.21"`, `"playwright-core": "1.62.1"`), lockfile committed.
- **Zero to Signing** `vite.config.js`: `base: "./"` plus multiple `rollupOptions.input` entries, which is how one build ships a second standalone page.
- **Zero to Signing** `src/vendor/`: vendored, pinned runtime bundles imported for side effects or as modules; no CDN at runtime.
- **Zero to Signing** `scripts/verify-app.mjs`: the offline browser harness. Serves `dist/` on its own port, intercepts the chain read with a mutable fixture object, seeds browser state through a `seed()` helper, stubs the wallet bridge in page, records every request, counts checks.
- **Zero to Signing** `scripts/verify-hashes.mjs`: a separate fast suite with no browser that asserts pinned content hashes and their invariance under reformatting.
- **Zero to Signing** `scripts/shot-cyclebar.mjs` and `scripts/shot-fee.mjs`: committed screenshot scripts that drive the same fixture pattern as the harness at `deviceScaleFactor: 2` and parameterize the fixture so one script emits a whole state series.
- **Zero to Claiming** `scripts/verify-app.mjs`: the harness pattern at full scale. Every chain read intercepted with fixtures, wallet stubbed in page, every step state asserted and screenshotted, Chromium launched with background throttling disabled.
- **sBTC Deposit Recovery** `src/crypto.js` plus `scripts/verify-crypto.mjs`: the two-suite pattern. A pure domain module with zero DOM and zero network, and a Node suite that ports a reference implementation check for check and was written before any UI. The pure module runs identically in a Web Worker, the page, and Node.
- **sBTC Deposit Recovery** `scripts/verify-app.mjs`: the browser harness against built `dist/` that walks every fixture, screenshots every state, asserts zero external requests in fixture mode, and counts Web Worker spawns through `page.on("worker")`.
- **sBTC Deposit Recovery** `src/clients.js` and `src/fixtures.js`: one gate for all reads with a fixture mode behind `?fixture=` that ships in the production build, and golden fixtures as fixed JSON whose header says which values are recorded truth and which are synthetic.
- **sBTC Deposit Recovery** `src/worker.js` with the `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })` form in `src/app.jsx`: Vite bundles a module worker with no configuration.

Read for inspiration, do not generalize: each app's step semantics and domain arithmetic; they are covered by `stacks-dapp-architecture` and `stacks-labs-dapp-design` where they generalize at all.

## Apply the architecture ladder

Evaluate options in this order, and stop at the first rung that satisfies the requirements:

1. **Pre-render.** Build UI and bounded results into static HTML, JavaScript, JSON, CSV, Parquet, or other immutable assets at build time. This includes SPAs: a React/Preact/Vue app built with Vite is static output and belongs on this rung.
2. **Browser-side JavaScript.** Perform filtering, sorting, aggregation, visualization, and local persistence (IndexedDB) in plain JS over data shipped as static assets. Heavy pure computation goes in a Web Worker so the UI stays responsive; a module worker needs no build configuration under Vite.
3. **WASM-backed local querying.** Lazily load a wasm-based library (sql.js, wa-sqlite, DuckDB-WASM) for arbitrary local queries or compute that static snapshots and plain JS cannot answer economically. Prefer a static SQLite/DuckDB-style dataset over a hosted database for read-only prototypes. Use pre-compiled library binaries; never compile application code to WASM for this purpose.
4. **Narrow serverless.** Add a small edge/serverless endpoint only for the irreducible secret, write, authorization, or freshness boundary.
5. **Always-on server.** Introduce an API/database service only after naming the requirement that makes every previous rung insufficient.

Do not ask the user to choose a hosting provider before inspecting the repository and requirements. Make the static-first choice by default and explain any escalation. Exception: if the sensitivity of the data is unclear and rungs 1 to 3 would ship the dataset to every visitor, ask before deploying.

**Rung 1 removes whole vulnerability classes rather than patching them.** When a critical server-side advisory landed (a framework image-optimization RCE, CVSS 9.5, whose precondition is a running image endpoint), answering "are we exposed" for a rung-1 app took one enumeration of its 113 locked packages: no such framework, no image library, and no server to hand an image to. A dist of static files cannot have the endpoint. This is the concrete payoff of rung 1 and the argument for it.

## Dependencies are part of the artifact

A static site is only as robust as what it loads at runtime. A single-file page that imports its libraries from a CDN is *deploy-static* but not *self-contained* and not offline: it is hostage to that CDN's live resolution, and a broken upstream publish or an outage takes it down with nothing wrong in your code or your host.

- **Vendor and pin what you ship.** Treat runtime libraries like any other built asset: vendor them into the deployment and pin **exact versions, including transitive ones, not just top-level.** Floating version ranges resolve to whatever the registry serves at load time, which is exactly how a broken upstream release becomes your outage. (A real case: a CDN floated a transitive dependency to a just-published, broken version and every page that imported the top-level library failed at load.)
- **Exact pins with no ranges, dev and runtime alike (default).** No carets or tildes in `package.json`, lockfile committed. A tree of around a hundred packages is small enough to audit by hand and should be. Escape hatch: none for shipped runtime code; a throwaway contracts or tooling project may float, but say so.
- **Vendoring can be load-bearing for correctness, not just hygiene.** When the published registry versions of a library lack semantics the app requires, the vendored bundle is the only working copy. Real case: the registry `@stacks/connect` and `@stacks/transactions` could not serialize the pox-5 `staking-postcondition` type, so Zero to Signing's `src/vendor/` bundles are the only copies that can send the post-condition; an app that "updates to the latest npm version" silently loses the ability. Write the reason at the import site (Zero to Signing: the comment at the top of `src/lib.js`) and assert the capability in a test, so the constraint outlives the person who knew it.
- **CDN-primary + local fallback, if you use a CDN at all.** Prefer a pinned local copy. If you load from a CDN for convenience or freshness, fall back to the vendored copy on any failure. Note that chasing "latest" is itself the risk vector (a bad publish is *reachable*, not merely an outage), so a pinned known-good version is safer than latest, and you re-vendor deliberately when you choose to upgrade.
- **Content-address or version the bundles.** Same rule as packaged datasets: version deployed assets so a deploy can't mix stale and fresh copies, and so a shared stylesheet or script isn't served stale from cache (a `?v=` query bump on a shared asset is enough).
- **WASM libraries are just vendored dependencies here.** The same pin-and-vendor rule applies; nothing about the format is special.
- **Exports maps bite at resolve time.** Some packages expose subpaths only with the extension (`@scure/bip39` 2.3.0 exposes wordlists as `./wordlists/english.js`; the extensionless subpath fails). Import exactly what the exports map names.

## State without a backend

For a backendless app, the URL is the session substitute. Put user-selectable state (filters, the selected dataset, a network or read-endpoint override, a throttle setting) in the URL query so a refresh preserves it and links are shareable. Keep every parameter visible at its current value, default or overridden; a parameter that only appears when set is a feature nobody finds. Never put secrets or personal data in the URL.

The zero-persistence case is legitimate: when every input is public and every result recomputes in under a second from the URL, the URL is the whole state and browser storage is banned outright (sBTC Deposit Recovery: `?txid`, `?stx`, `?api`, always visible; the harness asserts `localStorage.length === 0` throughout).

## Separate the data tiers

For dashboards with both hot and arbitrary reads, use three tiers:

- **Snapshot hot paths:** precompute initial pages and common reports as versioned JSON. Do not boot WASM for these views.
- **Static bounded datasets:** ship complete, reasonably sized tables and implement sort/filter/page operations locally in JS.
- **WASM long tail:** query a packaged database only for arbitrary drill-downs that cannot be enumerated safely at build time.

Avoid using WASM for answers that can be precomputed cheaply. Lazy-load it on the first genuine tail query, not at page load.

## Package WASM data for remote reads

When querying a static database over HTTP:

- Prune unused tables and columns from the deployed copy.
- Add indexes for every interactive lookup and run planner statistics generation after indexing.
- Bound high-fan-out graph expansions and result sets.
- Batch lookups instead of issuing one query per rendered item.
- Materialize compact serving projections when wide or scattered source tables cause excessive page reads.
- Match remote request chunks to the database page size and verify host range-request behavior.
- Content-address database files and snapshot generations to prevent mixed or stale deployments.
- Test with production-scale data; small fixtures validate correctness, not remote-I/O performance.

Measure actual response bodies and range `GET` requests. Do not count a bodyless `HEAD` response's advertised full-file `Content-Length` as transferred bytes.

## Escalate only for concrete constraints

Use server-side infrastructure when one or more of these requirements are real:

- Secrets or privileged credentials must be used at request time.
- Authoritative writes, transactions, server-enforced authorization, or multi-user coordination are required.
- Data must not be downloadable by every authorized static-site visitor.
- Freshness cannot be met by periodic artifact rebuilds or narrow serverless refreshes.
- The working set is too large for target devices or economical ranged reads.
- Compute is long-running, memory-heavy, unsupported in browsers, or must be trusted.
- True realtime push or collaborative state is required.

Keep the exception narrow. A write endpoint does not imply that reads, filtering, rendering, or analytics also belong on the server. (For wallet-and-chain apps, several of these triggers are satisfied by the wallet and the chain; see `stacks-dapp-architecture`.)

## Protect security boundaries

Treat every shipped static asset, including any WASM binary and packaged database, as downloadable by every visitor who can load the page. WASM provides no confidentiality, obfuscation, or sandboxing benefit over JavaScript; it runs in the same browser sandbox with the same origin and network access. Never embed secrets, API keys, or credentials in any client-side bundle regardless of format.

Use platform-level access control (private Pages, authenticated CDN) only when downloading the complete deployed dataset is acceptable for each authorized viewer. Verify the platform actually enforces the access control assumed; for example, private GitHub Pages publishing requires GitHub Enterprise Cloud; on other plans the site is publicly reachable. If per-viewer restriction of rows or fields is required, keep the sensitive data behind an authenticated server boundary (rung 4 or 5).

## Test-first for the pure domain layer

Verification has three layers, and only the first is test-driven in the strict sense. Apply TDD there and nowhere else.

1. **Pure domain modules: tests before code (rule).** Before any UI exists, read the PRD and list every pure function it implies: calculations (window position, fee arithmetic, dust and floor checks), parsers and classifiers, derivations from fixture or chain data, throttle and chunking logic, and every read-path decision (what renders when a read fails). Each gets a Node test file whose failing case is written first, then the smallest module that passes it. Acceptance criteria that are pure become test names. The module imports no DOM and no network, so the same file runs in Node, the page, and a Web Worker unchanged. This is where every recorded arithmetic defect in the source builds lived: the PRD's byte slice, a rounded percentage, an off-by-one cycle end, a seed-phrase heuristic with false positives. sBTC Deposit Recovery worked this way (`src/crypto.js` with `scripts/verify-crypto.mjs` first, every later feature as function plus test before any screen) and it was the cheapest correctness asset in the project. Zero to Signing did not: its `cycleView` had no unit test and its four bugs were found by a person reading screenshots. Chain-timing math ships with tests at the boundary blocks (1, 3, 50, 101 from the window's end, plus a mid-window control) before the component exists.
2. **The browser harness: test-after, incident-driven.** It asserts acceptance criteria against the built `dist/` and grows as a regression suite. Writing it before the UI produces checks against selectors that do not exist yet. Keep it as described below.
3. **Design and chain verification: not testable by you.** Screenshots read by a person, hash pins, live smoke tests, capability detection against the deployed interface. The oracle is a human or the chain. A green suite is not done.

Runner (default): `node --test` for the pure suites. It is built into Node 18 and later, adds no dependency, gives per-test isolation and readable assertion diffs, and `node --test --watch` supplies the red-green loop. The hand-rolled `check(name, ok)` counter the source builds use is fine for the browser harness, where Playwright drives the run; for the pure layer the built-in runner is the better fit. Escape hatch: a heavier framework only when a project already carries it; a fresh dependency tree for pure-function tests is not worth the audit cost.

Order of work that paid off: pure modules and their tests, then the worker, then the step flow against fixtures, then the network clients, then the browser harness, then the screenshot pass, then live smoke tests.

## The offline harness is the center of gravity for regression

Verification of the assembled app happens against the built artifact, offline, with fixtures. The harness serves the built `dist/`, intercepts every network call with fixtures, stubs any wallet or signing bridge in page, asserts every state, and screenshots every state. Every real-world incident in the source builds (rate limit, chunk overflow, cached verification, roster union) became a permanent fixture-driven check the same day.

- **Port the reference implementation as the first artifact.** When a reference implementation exists (a script, a spec's worked examples), it becomes the first test file of the pure layer, ported check for check. In sBTC Deposit Recovery a 15-check Python reference became `scripts/verify-crypto.mjs` before any UI; the port caught a byte-slice bug in the PRD on first run and anchored every later change.
- **Fixtures use REAL proportions and real checksummed principals.** Invented values produced both a wrong screenshot and a wrong conclusion at different times. Never verify against your own simplified fixtures where the chain can be read instead.
- **Golden fixtures record the PRE-fix state as fixed JSON.** A backend that heals over time (records that get registered, states that resolve) makes the broken branch untestable against production later. The fixture header must say which values are recorded truth (ids, keys, heights, amounts) and which are synthetic placeholders (signatures, raw hex); derivation tests are what make synthesized fixtures safe (sBTC Deposit Recovery: `src/fixtures.js`).
- **Ship fixture mode in the production build behind a URL flag (default).** It is harmless when the data is public, and it lets the harness run acceptance criteria against the exact deployed artifact, including the assertion that the whole run makes zero external requests. Escape hatch: strip it when fixtures would carry non-public data.
- **Fixture-driven harness patterns worth copying.** Keep the fixture as a mutable module-level object referenced inside the route handler so a test rewrites one field and re-navigates to produce a new state without re-registering the route. Stub the wallet bridge by overwriting its global in page with a function returning a chosen address (Zero to Signing: `scripts/verify-app.mjs`). Fixtures that answer errors should answer 200 bodies the app treats as unsupported, because fixture 404s pollute the console-clean assertion. Launch headless Chromium with `--disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`, or page timers starve (Zero to Claiming: `scripts/verify-app.mjs`).
- **Prove a worker ran, or did not, with `page.on("worker")`.** Count spawns; assert the count grew when off-main-thread work was required and stayed flat when a cheaper path should have preempted it. `performance.getEntriesByType("resource")` misses the worker fetch entirely.
- **Mechanize house rules that decay without a test.** No runtime CDN or unexpected external fetch (record every request and filter for non-localhost origins); no em dash in the rendered UI; nothing in browser storage before the app's persistence anchor. Style rules belong to the design skill; asserting them belongs here.
- **Functional assertions do not see design.** In Zero to Signing 116 checks passed while a progress bar was wrong in four ways and a first fix overprinted two labels; every one of those defects was found by a person looking at an image. The harness's job is to make design review possible (deterministic states, seeded records, fixed fixtures), not to replace it.
- **Screenshots regenerated by a committed script are deliverables; one-off shots rot.** Any screenshot worth keeping is generated inside the harness or a committed script so UI changes re-shoot everything. Screenshots of boundary states (1, 3, 50, 101 blocks from a window's end, plus a mid-window control) settle design arguments that descriptions cannot.
- **Then smoke-test against the live network.** Real-network tests found what fixtures could not, in this order: the rate-limit unit, a source-fetch race, a cost ceiling. Budget at least three build-test-fix rounds against the live network after the harness is green, and run them from an environment that can actually reach the hosts (a sandbox that blocks a host verifies nothing about CORS or rate limits as deployed).

## Implement and verify

1. Identify reads, writes, secrets, authorization, freshness, data size, and target devices.
2. State the selected rung of the architecture ladder and the evidence for any escalation.
3. Write the pure domain layer test-first (the section above), and verify it against the source implementation or database with parity tests.
4. Build a reproducible static artifact with its dependencies vendored and pinned, and keep deployment host-agnostic where practical.
5. **Confirm the built artifact actually runs; do not confirm only that the dependency tree resolves.** A green `install` and a resolvable graph prove nothing about runtime: load the page (or import the bundle) and assert the exact exports, symbols, and behavior you depend on. Runtime failures (a missing named export, a version-skewed API) are invisible to dependency resolution.
6. Run the offline harness against `dist/`, then the screenshot pass, then the live smoke tests.
7. Gate representative scenarios on transferred bytes, request count, WASM boot, and usable-content latency.
8. Test the exact production-sized artifact on a range-capable local server before claiming performance.
9. **Deploy the contents of `dist/` only, and only the current files.** The root `index.html` references the unbuilt entry and 404s on a static host. Rebuilds leave the previous build's hashed asset filenames in `dist/assets/`; check `dist/index.html` for the current filenames before publishing, or the folder accumulates unreferenced files that look live. HTML and hashed assets ship together.

Prefer a deployable artifact over infrastructure scaffolding. Do not add Docker, a hosted database, queues, or an API process merely because they are conventional.