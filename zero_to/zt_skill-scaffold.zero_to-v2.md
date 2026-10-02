# Project scaffold and per-app PRD

How to stand up a new standalone step-flow dApp. This encodes the working shape of the Zero to Signing production repo; reuse it rather than re-deriving. Architecture decisions themselves (why static, security tier, wallet capability) belong to the static-first-architecture and stacks-dapp-architecture skills; this file is the mechanical recipe.

## Project layout

```
<app-name>/
├── index.html              Vite entry: <div id="root"> + /src/main.jsx, viewport width=1200
├── package.json            exact-pinned versions only (no ^ or ~), lockfile committed
├── vite.config.js          base:'./', @vitejs/plugin-react, target es2020
├── scripts/
│   ├── verify-app.mjs      browser check harness (below)
│   └── verify-hashes.mjs   only if the app pins contract identity by structure hash
└── src/
    ├── main.jsx            entry; import order matters (below)
    ├── app.jsx             shell: header, network switch, wallet connect/BNS, restore, modals
    ├── core.jsx            NETWORKS, state model, persistence, chain reads, UI atoms, Rail
    ├── steps.jsx           step panels + per-step info copy
    ├── lib.js              wallet/chain bridge over the vendored bundles
    ├── vendor/             pinned runtime bundles (see below)
    └── styles/             tokens.css, app.css, fonts/  (copied from this skill's assets/)
```

Entry import order in main.jsx: tokens.css, phosphor icons CSS (`@phosphor-icons/web/regular`), app.css, then vendor side-effect scripts (bundled data such as contract sources, then any hash/util globals), then lib.js, then the app. Tokens before app.css because app.css consumes the tokens; vendor scripts before the app because the app reads their globals at module scope.

## Dependency strategy

Per static-first-architecture: everything the page loads at runtime is pinned and bundled into `dist/`; zero CDN. React and Phosphor come from npm at exact versions. The Stacks wallet/transaction layer (`@stacks/connect`, `@stacks/transactions`) is vendored as known-good ESM bundles in `src/vendor/` when the published registry versions lack required semantics (pox-5 `staking-postcondition` serialization, notably); re-vendor deliberately, never by floating a version. Any byte-for-byte-pinned functions (a canonical hash implementation) also live in `src/vendor/`, unmodified, imported for side effects.

Deploy the **contents of dist/** only. The root index.html references /src/main.jsx and 404s on a static host; this exact mistake shipped once. Built asset paths are relative, so dist works from a subdirectory. html and hashed assets must be redeployed together.

## Network identity block

One `NETWORKS` object in core.jsx, pinned per stacks-dapp-architecture:

```js
const NETWORKS = {
  mainnet:{ key:"mainnet", label:"Mainnet", api:"https://api.hiro.so",         stxPrefix:/^S[PM]/, connectValue:"mainnet", chainParam:"mainnet" },
  testnet:{ key:"testnet", label:"Testnet", api:"https://api.testnet.hiro.so", stxPrefix:/^S[TN]/, connectValue:"testnet", chainParam:"testnet" },
};
```

`connectValue` is the network name handed to the wallet on every connect and signing request; it must name the primary public network. A custom or retired experimental network name here makes wallets sign with the wrong chain ID and every transaction fails with a SignatureValidation mismatch (this shipped once too: "pox5-testnet" leftovers). The read `api` is independent of signing and may differ from the wallet's node, but must also be the primary network's endpoint.

## State and persistence skeleton

- One flow-state record per (network, anchor identity), all fields defined in the PRD.
- `stepStatus` map: step -> locked | active | complete | skipped drives the rail, resume, and read-only logic; `furthestStep()` derives the resume target.
- localStorage under `<prefix>:<network>:<id>` only after the first on-chain anchor confirms; URL mirrors `?id=` + `?chain=`; in-memory per-network state (a ref keyed by network) covers pre-anchor steps and network switches mid-step.
- Network switch: stash current flow in the memory ref, adopt the other network's (memory, else storage, else fresh), never mix.
- Remember the last connected account across wallet disconnects so reconnecting as a different account can raise the resume-step dialog.

## Verification harness

`scripts/verify-app.mjs`: serve dist/ on a local port, drive headless Chromium (playwright-core, executablePath to a system chromium), assert and count. Deterministic chain data comes from route interception (fulfill `/v2/pox` and similar from fixtures), wallet behavior from stubbing the bridge global in-page. The harness from Zero to Signing checks, and every new app should keep checking:

- fresh load renders the first step; locked steps not clickable; URL carries the chain param
- nothing in localStorage before the anchor confirms
- per-network isolation: switch mid-step and back restores state unchanged; accent class swaps
- restore matrix: single record auto-resumes at furthest step; multiple records open the picker; `?id=` wins; unknown id starts fresh; reload resumes at each persisted step
- read-only completed steps render summaries, footer pinned to panel bottom, Back label aligned to content edge
- rail geometry: all step numbers on one center line (±2px); active number in text color
- validation and error copy for each PRD error case
- chain-timing guards (prepare phase warning) via fixtures for both phases
- no em dashes in the rendered UI
- no runtime requests except the pinned chain-read APIs; zero CDN fetches
- zero console errors

Run it against the built dist, not the dev server; confirm the exact hashed filenames deployed.

## Per-app PRD template

One page. This is the layer no skill can supply.

```
# <App name>: single-page guided flow
Objective: <who> goes from <nothing> to <end state>.
Non-goals: <explicitly excluded actions; link-outs instead>
Glossary: <canonical term per domain object; used verbatim in copy, code, state>
Network: <mainnet/testnet behavior, per-network state rule>
Flow: steps 0..N (max 8), for each: purpose, inputs, chain call or off-app action,
  completion condition, skippable / re-enterable flags
State: record fields, persistence anchor, resume rules
Errors: the enumerated cases the UI must handle inline
Copy rules: max 3 sentences per step; claims sourced from these docs: <links>
Acceptance criteria: the checklist the verification harness asserts
```

## Wallet call conventions

All signing through the SIP-030 request path with `postConditionMode:"deny"` on every call. Zero post-conditions for calls that move no assets to another principal (deploys, admin calls, register-type calls); the exact protocol-specific condition, pre-serialized to wire hex if the library lacks the type, for calls that lock or move value. GatedBtn everywhere: disconnected users see "Connect wallet" as the primary action. Validate a usable txid (`/^[0-9a-f]{64}$/i`) from every wallet response before treating a call as submitted.
