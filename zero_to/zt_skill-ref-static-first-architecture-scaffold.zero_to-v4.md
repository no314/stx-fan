# Static-first scaffold and harness mechanics

Copy-by-path and the mechanics the SKILL.md body only names. The reference apps live on Werner's machine (source folders under `~/Claude/Projects/`) and as built output in `no314/stx-fan` under `zero_to/`; the source is not published, so the paths assume this machine. Updated 2026-10-19 (v3 merge).

## Copy by path

- **Zero to Signing** `package.json`: exact pins, lockfile committed. `vite.config.js`: `base: "./"` plus one `rollupOptions.input` per extra page. `src/vendor/`: vendored pinned bundles imported for side effects. `scripts/verify-app.mjs`: route interception of `/v2/pox` with a mutable fixture object, `seed()` helper for storage, wallet stub by overwriting its global. `scripts/verify-hashes.mjs`: a no-browser suite asserting pinned content hashes and their invariance under reformatting. `scripts/shot-cyclebar.mjs`, `scripts/shot-fee.mjs`: screenshot scripts at `deviceScaleFactor: 2` that parameterize one fixture field to emit a state series.
- **Zero to Claiming** `scripts/verify-app.mjs`: fulfils `api.hiro.so` from fixtures, passes same-origin through, aborts and counts everything else; allows exactly one each of three expected console errors; Chromium launched with background throttling disabled.
- **sBTC Deposit Recovery** `src/crypto.js` with `scripts/verify-crypto.mjs`: the pure module and the Node suite ported check for check from a Python reference. `src/clients.js` and `src/fixtures.js`: one gate for all reads, fixture mode behind `?fixture=`, golden fixtures with a recorded-versus-synthetic header. `src/worker.js` with `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })`. `scripts/verify-app.mjs`: counts worker spawns with `page.on("worker")`; rendered-copy audit over em dashes and a filler-adverb list that excludes `.kv` rows, `textarea` and `input`.
- **sBTC gas swap app** `src/clients.js`: one factory building the clients with an injected `fetch`; `makeFixtureFetch` answers every URL including the backend's, with real statuses. `src/fixtures.js`: per-scenario fixture objects and one fetch router. `test/amounts.test.mjs`: pure layer under `node --test`. `scripts/publish-stx-fan.sh`: build, verify, stage with `rsync -a --delete` and explicit exclusions for local-only entries. `.github/workflows/ci.yml`: screenshots uploaded `if: always()`, raised harness timeouts, failing checks as annotations; the SDK builds first because the app depends on `file:../sdk`.
- **Zero To BNS** `scripts/verify-app.mjs`: node-side fixture drift guards before the browser starts; wallet stub installed with `addInitScript` and persisted through `localStorage.__stubAccount` (so the harness removes only `bns:*` keys, never `clear()`); post-condition assertions by wire hex recomputed from the vendored bundle; a dist-wide grep for a retired product name. `src/lib.js` fixture branches mutate the fixture object on writes so confirmation-dependent UI is assertable; list ids synthesized as `20000 + index`.
- **BNS Lookup** `scripts/verify-app.mjs`: dist-level assertion that no file matching `/connect/i` shipped and every JS file is under 600,000 bytes; the em-dash walk extended to `.xml`; URL alias loop. `src/app.jsx` `runId` guard.
- **Zero to Stacks Tax Export** `src/gate.js` with `test/gate.test.js`: the gate as a pure module with injected `now`, `sleep` and `random`, tested in milliseconds on a fake clock. `src/clients.js` `makeFixtureClient`: replay keyed by URL plus body, `?fail=<stage>` injects five 503s, `?fixture=a+b` loads several, the gate runs 100 times faster than the wall clock so a real backoff is observable. `scripts/verify-app.mjs`: serves `fixtures/` beside `dist/`, reads both downloads back (CSV through the app's own parser, Excel through SheetJS), clears the IndexedDB database per scenario, simulates a deploy with `page.route("**/assets/xlsxfile-*.js", 404)` and scopes the console-clean assertion around that scenario. `scripts/record.mjs`: live smoke test and fixture recorder in one. `scripts/compare-live.mjs`: parity against a second endpoint family with separate code.
- **zero_to homepage** `zt_serve.mjs`: static server, Chrome path lookup, launch flags, recorded pox fixture shared by harness and shot script. `zt_verify-home.mjs`: `page.clock.install()` before navigation and `clock.runFor(60_500)` to assert a one-minute re-read, with 300 ms of real time after each `runFor` before counting; overrides `window.open` to assert search targets; checks every tile points at an existing folder and that `.nojekyll` exists. `zt_skills-data.js`: side-effect-free data module importable by Node.

## Harness patterns

- Keep the fixture as a mutable module-level object referenced inside the route handler, so a test rewrites one field and re-navigates without re-registering the route.
- Route-interception fixtures answer errors as 200 bodies the app treats as unusable; a fixture 404 is a real network event and pollutes the console-clean check. An injected `fetch` is free to answer 404 or 409 exactly as the API does.
- Launch headless Chromium with `--disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`, or page timers starve. Find the executable from a `CHROME` or `CHROMIUM` environment variable with a system-path fallback.
- Prove a worker ran, or did not, with `page.on("worker")`; `performance.getEntriesByType("resource")` misses the worker fetch.
- A computed color read right after a click measures the hover state; move the mouse to (0, 0) first.
- A gated primary button is enabled until an account exists; connect before asserting a disabled state.
- Record every request and fail on any non-localhost origin in fixture mode; filter the console-clean check to the exact count of expected error logs.
- Screenshot scripts run on their own ports so a harness run and a shot run never collide.
- Rebuilds leave the previous build's hashed assets in `dist/assets/`; check `dist/index.html` for the current filenames before publishing, or publish with `rsync --delete`.
- CI: raise harness timeouts for slower runners, report failing checks as workflow annotations, upload screenshots on failure too.

## Added in zero_to v4 (2026-11-21)

### Packaging a static database for remote reads (moved from the skill body)

Prune unused tables and columns. Index every interactive lookup and regenerate planner statistics. Bound expansions and result sets. Batch lookups. Materialize compact projections where wide tables cause excess page reads. Match request chunks to the database page size and verify host range-request behavior. Content-address database files and snapshot generations. Test at production scale. Gate representative scenarios on transferred bytes, request count, WASM boot and usable-content latency, on a range-capable local server with the production-sized artifact.

### TypeScript app, copy by path (batch-tx, 2026-11-18)

Paths are relative to `~/Claude/Projects/zero_to_batch_tx/zero-to-batch-tx/` on Werner's computer; the public repo holds the build and `publish/model/` only.

- `eslint.config.js`, `tsconfig.json`, the `prettier` key and the `verify` script in `package.json`: TypeScript strict with `tsc --noEmit`, `@leather.io/eslint-config`, `@leather.io/prettier-config`, kebab-case files, co-located `*.spec.ts` on Vitest, no `any`, no `as`, no `!`. `npm run verify` is the single gate: format check, lint, typecheck, unit tests, build, Playwright.
- `src/vendor/connect.d.ts`, `src/vendor/transactions.d.ts`: types for a vendored bundle, re-exported from a pinned devDependency. The registry package gives types only and is never bundled. Record the bundle's own version beside it; batch-tx did not, and its types come from `@stacks/connect` 8.2.7 and `@stacks/transactions` 7.5.0.
- `playwright.config.ts`, `tests/fixtures.ts`, `tests/batch-tx-page.ts`: `@playwright/test` with a page object whose actions own their waits, role and label locators, `vite preview` serving `dist/` as the web server, and the house rules (no external request, no console error, empty localStorage) as an auto fixture that runs after every test. A test that expects a console error lists it; a chain read is answered by a route registered in the test, which takes precedence over the catch-all.
- `tests/wallet-stub.ts`: a scripted wallet at the provider global (`window.LeatherProvider.request`), so the vendored connect request path runs.
- `contracts/not-not/not-not.spec.ts`, `vitest.config.ts`: contract tests in the same Vitest run through `@stacks/clarinet-sdk` and `initSimnet`, with plain `toEqual(Cl.ok(...))`. The SDK's Clarity matchers could not be imported; its package exports do not expose the helper path.
- `src/wallet-requests.spec.ts`: every request the app builds is parsed with the zod schemas of `@leather.io/rpc` (devDependency, never bundled), the wallet's published request schema used as a test oracle.

### Harness mechanics (usdcx, claiming, recovery)

- A loading placeholder that is itself a sentence needs a negative wait: wait for the line to stop starting with the placeholder, not for the line to exist (usdcx `scripts/verify-app.mjs`, 2026-11-05).
- Fixture state read by a mount-time effect is set before the component mounts (claiming, 2026-10-25).
- A `:text-is()` selector is written on the element that owns the text node (claiming, 2026-10-25).
- Resolve the browser from the installed Playwright, never from a path with a revision in it; everything the harness reads ships inside the folder it is packed from (claiming, 2026-11-18).
- A fixture that overrides a map spreads the rest of the map (usdcx, 2026-11-05). Strip `0x` before computing offsets into a hex string (usdcx).
- Keep two absences apart: `undefined` means the fixture predates the feature, `null` means a live read failed and is reported. Old fixtures then stay as recorded (recovery, 2026-10-26).
- The fake wallet in fixture mode records every request on `window.__walletRequests`; the harness compares the argument hex against the vendored bundle imported in Node 22 (usdcx `src/clients.js`).
