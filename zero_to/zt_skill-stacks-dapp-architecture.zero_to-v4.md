---
name: "stacks-dapp-architecture"
description: "Choose the architecture, deployment, security posture, and wallet support for a Stacks (or similar wallet-and-chain) decentralized application: playgrounds, single-feature demos, testnet experiments, production value-moving dApps such as swaps, DEXs, lending, and token sales, and mainnet tools that sign nothing but act on real value. Use when building or deploying a dApp frontend, deciding whether it needs a backend, wiring wallet connection and contract calls, reading chain state through public APIs, pinning contract identity, choosing which wallets to support, or moving something from a demo to real value. Governs the security tier separately from the deployment cost, treats wallet SIP-030 capability as part of the security model, and enforces a hard boundary between throwaway demos and anything that moves real assets."
---

# Stacks dApp Architecture

About this version: zero_to v4, merged 2026-11-21, body 1,948 words against a budget of 1,950. Handoffs drawn on: `skills-ledger.md` and the v4 merge report. Protocol numbers and endpoint facts: `references/constants.md`; wallet observations by date: `references/wallets.md`; stories: `references/incidents.md`; copy-by-path and read techniques: `references/scaffold.md`. Hosted copies of every reference file: `https://stx.fan/zero_to/zt_skill-ref-stacks-dapp-architecture-<name>.zero_to-v4.md` (names constants, wallets, incidents, scaffold); fetch them when a pointer is followed and the local file is missing.

This skill sits beside `static-first-architecture`, which governs the static build, dependencies and the harness. It adds two independent inputs: the **security tier** and **wallet capability**. Set the tier before writing code, and open the running handoff file with `zero-to-capture` at the same moment.

## Why a dApp usually needs no backend [wallet dApp]

The wallet holds keys, signs and broadcasts; state and status come from the public node or Hiro API. So the static-first triggers for secrets, authoritative writes and server-enforced authorization do not justify a backend [apps: signing, claiming, bns, gas]. Genuine triggers: an indexer for data the public API cannot serve, a relayer or sponsor [apps: gas], off-chain order matching, private per-user data.

## Reads [chain-reading app]

Live state cannot be snapshotted; never snapshot anything a user makes a value decision against. The public API is a dependency with failure modes:

- **Rate limits are per minute and per second, and a 429 looks like CORS**: it carries no CORS headers, so treat status 0 and 429 alike, and read `x-ratelimit-limit-minute` for the key's budget [apps: claiming, tax-export, gas]. Numbers in `references/constants.md`.
- **Route reads through a gate**: a sliding window under the budget, seconds-scale backoff, one cooldown that a single 429 imposes on every pending read, the budget visible as URL parameters; one gate per host origin when hosts differ [apps: claiming, recovery, gas, tax-export].
- **Cache only definitive answers**; a cached transient failure degrades a whole session [apps: claiming, gas].
- **A failed read renders as unavailable and blocks dependent figures.** Branch by interface, never try-then-fall-back, when the fallback's answer is a legal value; 0 is a legal fee [apps: claiming, bns, bnslookup, home]. Display rules: `stacks-labs-dapp-design`, "Numbers and live data".
- **Keep a second read path** or degrade to unavailable, and say which path answered [apps: signing, recovery, bns, bnslookup, tax-export].
- **`?api=` points reads at the user's own node.** Visible at its current value, reads and explorer links only, never what the wallet signs. URL order: chain, record id, api, budget parameters. Across hosts, `?api=` overrides the commodity chain reads and the protocol-state host stays pinned, POST included [apps: claiming, recovery, gas, bns, bnslookup, tax-export]. A display-only page may pin the host [apps: home].
- **Polls of a cached upstream carry a cache-buster**, or a successful write reads as a failure [apps: recovery, gas].
- **Indexer state and event scans answer different questions.** Materialized state is current and drops history; event scans see only matched topics and never forget. Rosters and histories union both [apps: claiming, tax-export].
- **A txid identifies one attempt, not the intent.** A fee bump or a twin mines under another id; follow what survives replacement, the origin and nonce or the committed address [apps: gas, recovery].
- **Submitted is not confirmed.** A read right after a submission sees the state before it. Poll one status read per open transaction, stop when all are final, keep the last known status when a read fails, and treat a 404 right after broadcast as pending [apps: batch-tx, claiming, usdcx].
- **Outcome figures come from the chain**, the mined transaction or the API's balance change, never from the plan or quote [apps: gas, tax-export].
- **A read-only app needs no wallet bundle.** Hand-encode the few Clarity values it reads or ship only the transactions bundle [apps: recovery, tax-export, bnslookup].

## Contract families and source verification [wallet dApp]

Two deployments of the same lineage can expose different APIs, and reading the wrong one returns a plausible wrong number. Detect capability from the deployed interface by **signature**, never by name, and never against your own fixtures; read every parameter, cap and delay from the specific deployed source; asserts inside function bodies are invisible to signature detection and stay catalog data with a source note [apps: signing, claiming].

Pin contract identity by principal **and** verified source; the deployed text wins over the repository [apps: signing, claiming, gas, bns]. Verify with a structure hash over the token stream, which survives reformatting, and assert that invariance, not only equality; Clarity's `contract-hash?` is a different algorithm (`references/constants.md`) [apps: signing, gas]. Pin helpers by principal and structure hash, verify the live source newest-first before offering a path, ship revisions as new contracts and never repoint; verify any "same contract as" claim by hashing both live sources [apps: claiming, gas]. Simnet testing of static-principal contracts: `references/scaffold.md`.

## Wallet capability is part of the security model [wallet dApp]

Wallet SIP-030 support is not uniform, and the gaps are where the security lives. Verify, against the wallet's behavior or its published request schema and not a compatibility table, that it enforces the post-conditions your safety depends on; a wallet that drops them is refused for asset-moving calls, with the reason shown [apps: signing, claiming, gas, bns]. Verified is per platform: an extension and its mobile app can differ [apps: gas]. Confirm connect returns a usable Stacks address, and validate a 64-hex txid from every response before treating a call as submitted; a sponsored call returns signed hex and no txid, so validate the hex and treat the sponsor's later txid as an attempt [apps: signing, claiming, bns; gas]. Observations per wallet, platform and date: `references/wallets.md`.

The selector shows the full catalog in three tiers: **verified** (enforcement observed on a real deny-mode call), **offered untested** (listed as capable; the first real transaction is approved only after the wallet's own screen shows the conditions), **blocked** (inert, linked to the reason). Resolve the chosen provider and pass it on every request with the library's storage and selector off (the vendored `connect()` opens its own selector), return a typed connect result, and classify a user rejection by code (`references/wallets.md`) [apps: batch-tx; Leather repo]. Match installed wallets by id pattern [apps: signing, claiming, bns, gas]. An address-only read may offer every wallet [apps: tax-export]. Ship the blocked-wallet rationale as a page in the app, or as a handoff to the wallet team [apps: signing, claiming, bns; gas].

## Sequential signing [wallet dApp]

Sign calls that cannot share a transaction from a queue: a pure module with no wallet import, counted in wallet requests. A failed prerequisite holds its dependants; per-item authorization keyed on `contract-caller` is queued, never batched. Status reads the plan against what was sent, since the failure that matters is the call never requested (a payout went unsent twice), and an interrupted run is found again from chain state [apps: claiming, bns, batch-tx]. Matching sent work to a plan: `static-first-architecture`, "State without a backend".

## Security tiers (the second axis)

**Tier 0** playground: simnet or scratch testnet, no value. **Tier 1** single-feature testnet demo. **Tier 2** anything on mainnet acting on real value, however small; there is no "only a demo" discount. **Tier 3** production value-moving dApp (swap, DEX, lending, sale, treasury): adversarial, multi-user, plus contract-level concerns (audit, oracles, MEV, governance) that a frontend names and assigns [apps: gas].

**Tier 2 exists with no wallet** [chain-reading app]. When the app signs nothing, post-conditions, slippage and wallet capability are inapplicable and the obligations become: pin the API endpoints (overridable for reads only), gate any write behind a cryptographic proof, discard pasted key material without echoing it, ship no wallet control where none belongs, asserted in the harness [apps: recovery, bnslookup, tax-export]. A page that only displays public chain data sits outside the tiers; it still pins its host, validates the response at the boundary and renders a failed read as unavailable [apps: home].

### Invariants that never relax

- **Post-conditions mirror the real asset flow.** Deny mode covers every principal in the transaction, so name every movement under deny: the originator's exact amount or protocol condition (`staking-postcondition` with `eq` for a pox-5 stake), another principal's transfer with a condition on that principal, an empty list when nothing moves. Originator mode with zero conditions only where a movement cannot be named, such as a contract burning its own escrow [apps: signing, claiming, bns, gas]. The condition code follows the counterparty's fill semantics: `lte` for a pool that fills partially, since `eq` aborts a valid fill [apps: gas]. Refuse to sign against a counterparty whose arithmetic you cannot price [apps: bns]. Allow mode never appears. A missing condition leaves funds unprotected; a mismatched one aborts a correct call. The SIP-030 transfer methods (`stx_transferStx`, `stx_transferSip10Ft`) take no post-conditions: the wallet builds them, the app cannot enforce one, and the copy says so [apps: batch-tx].
- **A call that stores a standing authorization and moves nothing is unguarded by post-conditions**; the copy says so [apps: bns].
- **Client validation is UX, not security.** The contract and the conditions enforce. Every claim about what a call does derives from the verified source; wrong copy misleads a value decision as surely as a missing guard.
- **Scope approvals tightly**; exact amounts over unlimited allowances.
- **Keys stay in the wallet.** No seed or key in frontend code or config, not even a throwaway. Free-text inputs detect pasted key material and discard it; rules in `stacks-labs-dapp-design`, "Inputs that could receive key material" [apps: recovery, tax-export].
- **Address inputs require an exact c32 round trip**, since decoding maps O to 0 and I and L to 1. A contract principal wins over a name pattern; upper-case only the c32 part; name a token by its full asset identifier, never its symbol [apps: tax-export, batch-tx, claiming].
- **The persistence anchor is the first on-chain event whose loss would strand funds**, not the final step; nothing persists before it [apps: signing, bns]. UI conventions: `stacks-labs-dapp-design`, "State and resume".

**What scales with the tier**: financial safeguards (slippage bounds tuned to pool depth, price sanity checks, confirmation friction) are mandatory from tier 2. A public tier 3 frontend must be reachable, so its security is the integrity of what is served, not access control.

## Network identity [wallet dApp]

Pin per network the name the wallet expects, the chain id, the boot principals and the read API; target the primary testnet and mainnet. A testnet reset keeps the chain id and wipes chainstate, third-party contracts included, so redeploy and re-derive but do not re-key [apps: bns]. A different network changes the chain id, and anything signed offline (a SIP-018 grant) bakes it in; pass the network explicitly on connect. Inherited constants are not pinned constants: re-verify every identifier against the live primary networks before the first signing test. [apps: signing, claiming, bns].

## Transaction validity windows [window-bound action]

For every window-bound action: show the chain position (geometry in `stacks-labs-dapp-design`, "Chain-timing widgets"); derive both ends from the exact comparison operators in deployed source, since the off-by-one lives in strict versus inclusive, and keep the exclusive bound internal; re-fetch inside the submit handler every value the call or its condition depends on, position and price alike, and refuse to hand the wallet a doomed transaction; block with an explanation before signing [apps: signing, bns, home; claiming]. The derivation is a pure function with Node tests before the component, at the boundary blocks listed in `references/scaffold.md`.

## The playground-to-production guard

Mainnet plus real value forces tier 2 from the first line of code; the invariants hold at tier 0 so a promoted demo starts correct. Crossing to tier 2 is an explicit checklist, not a config flip; it is in `references/scaffold.md`. When unsure, treat it as the higher tier.

## Candidates (one app, under review)

Each entry names the app and path, the date, and the condition that promotes it (a second app of a different shape needs it) or retires it (two further builds do not).

- Lookup-and-verify beats search; a failed search lists its attempts and never names a culprit. Fields a registry stores outside the committed script are proof only after the commitment is recomputed. recovery `src/app.jsx`, 2026-08-29, and `src/crypto-v2.js`, 2026-10-26; usdcx copies the pipeline (same shape).
- A persistent header statement that the app never asks for a seed phrase, for apps that take pasted material and perform a write on a stuck user's behalf. recovery `src/app.jsx`, 2026-08-16; usdcx keeps it beside Connect Wallet, 2026-11-05 (same shape). Removed from bnslookup, gas and tax-export by owner decision.
- Consider that a call with no movement to protect does not need a verified wallet, since the pinned source is the protection; and that a page whose purpose is to exercise wallets may offer every wallet and say so in the selector. usdcx `src/lib.js`, 2026-11-05; batch-tx `src/wallet.ts`, 2026-11-18.
- Consider calling a contract's own read-only validators before signing instead of re-implementing its checks. usdcx `src/app.jsx` `proveAndReadStacks`, 2026-11-05.
- Consider showing whether an off-chain service the user waits on is running, from public reads and apart from the user's own record: running, behind, cannot tell. usdcx `src/bridge.js`, 2026-11-05.
- Consider that when another party may submit the same idempotent call first, its success looks like your failure. usdcx `src/app.jsx` `onMint`, 2026-11-05 (inferred, never core).
- A per-caller exemption in a contract is evaluated against the connected wallet at plan time, never against the role the reader picked. claiming `src/core.jsx` `signsAsStaker`, 2026-10-20.

Retired 2026-11-21 under the two-further-builds rule: twelve v3 candidates, kept as retired rows in the ledger. Promoted to core: the address round trip, the asset identifier, the signing queue and the dependency hold.