---
name: "static-first-architecture"
description: "Choose the least operationally expensive architecture for prototypes, dashboards, data explorers, reports, and read-heavy internal tools. Use when selecting an architecture or hosting model, building a prototype/dashboard, replacing an API or container, deciding whether a backend is needed at all, or vendoring and pinning a static app's runtime dependencies. Prefer pre-rendered static assets; escalate to browser-side compute, then WASM-backed libraries, then serverless, then an always-on server — only for named, concrete requirements. Ship a self-contained artifact: vendor and pin runtime dependencies (with a local fallback if a CDN is used), and verify by executing the built artifact, not by resolving the dependency graph."
---

# Static-First Architecture

Choose the least operationally expensive architecture that satisfies the real requirements. A static site on object storage/CDN/Pages is the default. Everything else is an escalation that must be justified by a named requirement. WASM is not an architecture: it is a compilation target used by some libraries (in-browser SQLite/DuckDB, ffmpeg, etc.). It appears in a project as a dependency pulled in at rung 3 of the ladder, never as a goal in itself. Do not instruct agents or teammates to "use WASM"; state the actual requirement (no backend, static deploy, local querying) and let wasm-backed libraries appear only where a dependency demands them.

## Apply the architecture ladder

Evaluate options in this order, and stop at the first rung that satisfies the requirements:

1. **Pre-render.** Build UI and bounded results into static HTML, JavaScript, JSON, CSV, Parquet, or other immutable assets at build time. This includes SPAs: a React/Preact/Vue app built with Vite is static output and belongs on this rung.
2. **Browser-side JavaScript.** Perform filtering, sorting, aggregation, visualization, and local persistence (IndexedDB) in plain JS over data shipped as static assets.
3. **WASM-backed local querying.** Lazily load a wasm-based library (sql.js, wa-sqlite, DuckDB-WASM) for arbitrary local queries or compute that static snapshots and plain JS cannot answer economically. Prefer a static SQLite/DuckDB-style dataset over a hosted database for read-only prototypes. Use pre-compiled library binaries; never compile application code to WASM for this purpose.
4. **Narrow serverless.** Add a small edge/serverless endpoint only for the irreducible secret, write, authorization, or freshness boundary.
5. **Always-on server.** Introduce an API/database service only after naming the requirement that makes every previous rung insufficient.

Do not ask the user to choose a hosting provider before inspecting the repository and requirements. Make the static-first choice by default and explain any escalation. Exception: if the sensitivity of the data is unclear and rungs 1–3 would ship the dataset to every visitor, ask before deploying.

## Dependencies are part of the artifact

A static site is only as robust as what it loads at runtime. A single-file page that imports its libraries from a CDN is *deploy-static* but not *self-contained* and not offline — it is hostage to that CDN's live resolution, and a broken upstream publish or an outage takes it down with nothing wrong in your code or your host.

- **Vendor and pin what you ship.** Treat runtime libraries like any other built asset: vendor them into the deployment and pin **exact versions, including transitive ones, not just top-level.** Floating version ranges resolve to whatever the registry serves at load time, which is exactly how a broken upstream release becomes your outage. (A real case: a CDN floated a transitive dependency to a just-published, broken version and every page that imported the top-level library failed at load.)
- **CDN-primary + local fallback, if you use a CDN at all.** Prefer a pinned local copy. If you load from a CDN for convenience or freshness, fall back to the vendored copy on any failure. Note that chasing "latest" is itself the risk vector — a bad publish is *reachable*, not merely an outage — so a pinned known-good version is safer than latest, and you re-vendor deliberately when you choose to upgrade.
- **Content-address or version the bundles.** Same rule as packaged datasets: version deployed assets so a deploy can't mix stale and fresh copies, and so a shared stylesheet or script isn't served stale from cache (a `?v=` query bump on a shared asset is enough).
- **WASM libraries are just vendored dependencies here.** The same pin-and-vendor rule applies; nothing about the format is special.

## State without a backend

For a backendless app, the URL is the session substitute. Put user-selectable state — filters, the selected dataset, a network or read-endpoint override — in the URL query so a refresh preserves it and links are shareable. Never put secrets or personal data in the URL.

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

Keep the exception narrow. A write endpoint does not imply that reads, filtering, rendering, or analytics also belong on the server.

## Protect security boundaries

Treat every shipped static asset — including any WASM binary and packaged database — as downloadable by every visitor who can load the page. WASM provides no confidentiality, obfuscation, or sandboxing benefit over JavaScript; it runs in the same browser sandbox with the same origin and network access. Never embed secrets, API keys, or credentials in any client-side bundle regardless of format.

Use platform-level access control (private Pages, authenticated CDN) only when downloading the complete deployed dataset is acceptable for each authorized viewer. Verify the platform actually enforces the access control assumed — for example, private GitHub Pages publishing requires GitHub Enterprise Cloud; on other plans the site is publicly reachable. If per-viewer restriction of rows or fields is required, keep the sensitive data behind an authenticated server boundary (rung 4 or 5).

## Implement and verify

1. Identify reads, writes, secrets, authorization, freshness, data size, and target devices.
2. State the selected rung of the architecture ladder and the evidence for any escalation.
3. Build a reproducible static artifact with its dependencies vendored and pinned, and keep deployment host-agnostic where practical.
4. **Confirm the built artifact actually runs — do not confirm only that the dependency tree resolves.** A green `install` and a resolvable graph prove nothing about runtime: load the page (or import the bundle) and assert the exact exports, symbols, and behavior you depend on. Runtime failures (a missing named export, a version-skewed API) are invisible to dependency resolution.
5. Verify correctness against the source implementation or database with parity tests.
6. Gate representative scenarios on transferred bytes, request count, WASM boot, and usable-content latency.
7. Test the exact production-sized artifact on a range-capable local server before claiming performance.

Prefer a deployable artifact over infrastructure scaffolding. Do not add Docker, a hosted database, queues, or an API process merely because they are conventional.
