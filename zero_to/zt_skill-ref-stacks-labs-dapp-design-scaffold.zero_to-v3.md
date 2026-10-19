# Project scaffold and per-app PRD

How to stand up a new Stacks Labs page or step-flow app. This file is the mechanical recipe; the decisions (why static, which tier, which wallets) belong to `static-first-architecture` and `stacks-dapp-architecture`. Updated 2026-10-19 (v3 merge).

## Start by copying

The reference apps live on Werner's machine and as built output in the public repo `no314/stx-fan` under `zero_to/`; the source folders are not published, so these paths assume this machine. Paths are relative to each app's root.

- **Zero to Signing** (`Projects/static_skill_update/hand-offs/zero-to-signing`, September 2026 snapshot): `src/styles/` and `src/main.jsx` (stylesheet set and import order), the `core.jsx` / `steps.jsx` / `app.jsx` split, `src/lib.js` (wallet bridge), `src/vendor/`, `scripts/verify-app.mjs` (rail geometry checks), `scripts/verify-hashes.mjs`, `xverse.html` (blocked-wallet page as a second Vite entry).
- **Zero to Claiming** (`Projects/zero_to_claimed_rewards/zero-to-claiming`): `src/chain.js` (read gate, chunked reader, pinned helpers), `src/core.jsx` `detectShape`, `scripts/copy-inventory.mjs`, `public/icons/`.
- **sBTC Deposit Recovery** (`Projects/zero_to_sbtc_deposit_recovery`): `src/crypto.js` with `scripts/verify-crypto.mjs` (pure module and ported reference suite), `src/clients.js` and `src/fixtures.js` (fixture mode in the client layer), `src/worker.js`, `src/parse.js` (secret detection), `src/bns.js` (hand-encoded Clarity read), `src/core.jsx` `summaryText`.
- **Zero To BNS** (`Projects/zero_to_bns`): `src/lib.js` (every write with its post-condition comment, `bnsRequest` stub boundary), `src/core.jsx` (`NETWORKS`, `windowView`, `migrateFlow`, `fmtApproxDuration`), `scripts/verify-app.mjs` (post-condition assertions by wire hex), `history.html` (static cited page as a third entry).
- **BNS Lookup** (`Projects/zero_to_bns_lookup`): the no-rail page shape, `tokenFromUrl` and `writeUrl` alias layer, `public/opensearch.xml`.
- **Zero to Stacks Tax Export** (`Projects/zero_to_tax_export`): `src/gate.js` with `test/gate.test.js` (gate as a pure module with injected clock), `src/loader.js` (staged resumable loader), `src/store.js` (IndexedDB device cache), `src/clarity.js`, `src/exportfmt.js`, `scripts/record.mjs` (live smoke test and fixture recorder).
- **sBTC gas swap** (`Projects/sponsored-sbtc-stx-swap/sbtc-gas-swap/app`): `src/clients.js` with `makeFixtureFetch` (injected fetch), `src/amounts.js` with `test/amounts.test.mjs`, `core.jsx` `How` disclosure, `scripts/publish-stx-fan.sh`.
- **zero_to homepage** (`stx-fan/zero_to/zt_*`): `zt_cycle.js` with `zt_test-cycle.mjs`, `zt_serve.mjs`, `zt_verify-home.mjs`, `zt_shots.mjs`, `zt_site.js` (nav from JSON, DOM calls only).

Read for inspiration, do not generalize: each app's step semantics, manager catalogs, outcome taxonomies, fee tiers, namespace lists.

## Project layout

```
<app-name>/
├── index.html              Vite entry: <div id="root"> + /src/main.jsx, viewport width=1200
├── package.json            exact-pinned versions only (no ^ or ~), lockfile committed
├── vite.config.js          base:'./', @vitejs/plugin-react, target es2020; one rollupOptions.input per extra page
├── PRD.md                  one page, template below
├── YYYYMMDD_skill-update-handoff-<app>.md   running capture file (zero-to-capture)
├── scripts/
│   ├── verify-app.mjs      browser harness against dist/ (below)
│   ├── shot.mjs            committed screenshot pass (or shots inside the harness)
│   └── verify-hashes.mjs   only if the app pins contract identity by structure hash
├── test/                   node --test suites for the pure layer
└── src/
    ├── main.jsx            entry; import order matters (below)
    ├── app.jsx             shell: header, network switch, wallet connect/BNS, restore, modals, URL contract
    ├── core.jsx            NETWORKS, state model, persistence, UI atoms, Rail
    ├── steps.jsx           step panels + per-step info copy
    ├── lib.js | clients.js wallet/chain bridge over the vendored bundles, or the read client layer with fixture mode
    ├── fixtures.js         golden fixtures with a recorded/synthetic header
    ├── vendor/             pinned runtime bundles (only if the app signs)
    └── styles/             tokens.css, app.css, fonts/  (copied from this skill's assets/)
```

Entry import order in main.jsx: tokens.css, Phosphor icons CSS (`@phosphor-icons/web/regular`), app.css, then vendor side-effect scripts, then lib.js, then the app. Tokens before app.css because app.css consumes the tokens; vendor scripts before the app because the app reads their globals at module scope. A no-build page keeps the same files flat with a prefix (`zt_`) and edits only the font URLs in its tokens.css copy.

## Dependency strategy

Per `static-first-architecture`: everything the page loads at runtime is pinned and bundled into `dist/`; zero CDN. The Stacks wallet and transaction layer is vendored as known-good ESM bundles in `src/vendor/` when the registry versions lack required semantics; re-vendor deliberately. A read-only app ships no wallet bundle. Deploy the contents of `dist/` only.

## Network identity block

One `NETWORKS` object in core.jsx, pinned per `stacks-dapp-architecture`:

```js
const NETWORKS = {
  mainnet:{ key:"mainnet", label:"Mainnet", api:"https://api.hiro.so",         stxPrefix:/^S[PM]/, connectValue:"mainnet", chainParam:"mainnet" },
  testnet:{ key:"testnet", label:"Testnet", api:"https://api.testnet.hiro.so", stxPrefix:/^S[TN]/, connectValue:"testnet", chainParam:"testnet" },
};
```

`connectValue` must name the primary public network; a retired experimental name here makes wallets sign with the wrong chain id. Never reintroduce retired identifiers from an older app.

## State and persistence skeleton

- One flow-state record per (network, anchor identity), all fields defined in the PRD, with a `migrate` function that defaults every field added since the first release.
- `stepStatus` map: step to locked | active | complete | skipped | blocked drives the rail, resume and read-only logic; `furthestStep()` derives the resume target.
- localStorage under `<prefix>:<network>:<id>` only after the anchor event confirms (the first on-chain event whose loss would strand funds); URL mirrors `?chain=` then `?id=` then `?api=` then budget parameters; in-memory per-network state covers pre-anchor steps and network switches mid-step.
- Zero-persistence apps keep the URL as the whole state; apps whose result takes minutes use an IndexedDB device cache keyed by inputs and read host (`static-first-architecture`, "State without a backend").
- Remember the last connected account across wallet disconnects so reconnecting as a different account can raise the resume-step dialog.

## Verification harness

`scripts/verify-app.mjs`: serve `dist/` on a local port, drive headless Chromium (playwright-core, executablePath to a system Chromium, launched with `--disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding`), assert and count. Deterministic chain data comes from the app's own fixture mode (`?fixture=`) or from route interception for a single-read page; wallet behavior from stubbing the bridge at the request boundary so post-condition hex can be compared against the same vendored bundle in Node. Build before every run. Every app keeps checking:

- fresh load renders the first step; locked steps not clickable; URL carries the chain param in the canonical order
- nothing in storage before the anchor confirms (or ever, for zero-persistence apps)
- per-network isolation: switch mid-step and back restores state unchanged; accent class swaps
- restore matrix: single record auto-resumes at the furthest step; multiple records open the picker; `?id=` wins; unknown id starts fresh
- read-only completed steps render summaries, footer pinned to the panel bottom, Back label aligned to the content edge
- rail geometry: every rail number's text baseline within 2px of the active tab number's; the tab bottom flush with the panel top within 1px; active number in text color
- validation and error copy for each PRD error case; post-condition mode and conditions by wire hex for every signing call
- chain-timing guards via fixtures for both phases and every boundary block
- no em dash and no banned filler in rendered app-authored copy (data rows and inputs excluded)
- no runtime requests except localhost in fixture mode; zero CDN fetches; no wallet bundle where none belongs
- zero console errors beyond the exact count of expected error logs
- the "Next steps" section present on the terminal step and absent elsewhere

The baseline assertion, copied verbatim because it is not obvious:

```js
check("rail numbers share the tab number's baseline", await page.evaluate(() => {
  const base = el => {
    const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
    const r = document.createRange(); r.selectNodeContents(tn || el);
    const rect = r.getBoundingClientRect();
    return rect.bottom - rect.height * (300 / 1320); // JetBrains Mono descent/(ascent+descent)
  };
  const tab = base(document.querySelector(".rail-tab .num"));
  return [...document.querySelectorAll(".rail-item .rail-num")].every(e => Math.abs(base(e) - tab) <= 2);
}));
check("tab stays flush with the panel", await page.evaluate(() => {
  const tab = document.querySelector(".rail-tab").getBoundingClientRect();
  const panel = document.querySelector(".panel").getBoundingClientRect();
  return Math.abs(tab.bottom - panel.top) <= 1;
}));
```

Address rail items by visible label. Move the mouse away before reading a computed resting color. Clear the device database before each scenario when one exists. Screenshots of every step state and every boundary state come from a committed script at `deviceScaleFactor: 2`.

## Per-app PRD template

One page. This is the layer no skill can supply.

```
# <App name>
Objective: <who> goes from <nothing> to <end state>.
Non-goals: <explicitly excluded actions; link-outs instead>
Readers: <End-user, Operator, or both; which steps each role sees>
Glossary: <canonical term per domain object; used verbatim in copy, code, state; end-user renames mapped once in the constants module>
Network: <mainnet/testnet behavior, per-network state rule>
Tier: <0 to 3 per stacks-dapp-architecture, with the reason>
Flow: steps 0..N (max 8) or "no rail", for each: purpose, inputs, chain call or off-app action,
  post-condition mode and conditions with the deployed-source fact behind each,
  completion condition, skippable / re-enterable / blocked conditions
State: record fields, persistence anchor (the first event whose loss strands funds), resume rules, device cache if any
Reads: hosts, which the ?api= override repoints, which stay pinned, budget per host
Errors: the enumerated cases the UI must handle inline
Copy rules: claims sourced from these docs: <links>; every protocol number with its primary source
Acceptance criteria: the checklist the verification harness asserts, numbered so check names can cite them
  ... (last criterion) The running handoff file YYYYMMDD_skill-update-handoff-<app>.md exists in the app root
  and carries every learning of the build (zero-to-capture).
```

## Wallet call conventions

All signing through the SIP-030 request path. Name every movement under deny mode with the exact condition, pre-serialized to wire hex if the library lacks the type; originator mode only where a movement cannot be named (a contract burn). GatedBtn everywhere: disconnected users see "Connect wallet" as the primary action. Validate a 64-hex txid from every wallet response before treating a call as submitted; for a sponsored call validate the returned hex instead. Re-read every value a call or its condition depends on inside the submit handler.
