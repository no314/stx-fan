---
name: stacks-dapp-architecture
description: "Choose the architecture, deployment, security posture, and wallet support for a Stacks (or similar wallet-and-chain) decentralized application: playgrounds, single-feature demos, testnet experiments, production value-moving dApps such as swaps, DEXs, lending, and token sales, and mainnet tools that sign nothing but act on real value. Use when building or deploying a dApp frontend, deciding whether it needs a backend, wiring wallet connection and contract calls, reading chain state through public APIs, pinning contract identity, choosing which wallets to support, or moving something from a demo to real value. Governs the security tier separately from the deployment cost, treats wallet SIP-030 capability as part of the security model, and enforces a hard boundary between throwaway demos and anything that moves real assets."
---

# Stacks dApp Architecture

About this version: zero_to v3, merged 2026-10-19, body 2,080 words against a budget of 1,800 (down from 5,689; the overage is the pre-merge generic sections kept intact: tiers, invariants, network identity, promotion guard). Drew on 20260903_skill-update-handoff-zero-to-signing.md, 20260903_skill-update-handoff-zero-to-claiming.md, 20260904_skill-update-handoff-sbtc-deposit-recovery.md, 20261018_skill-update-handoff-sbtc-gas-swap.md, 20261018_skill-update-handoff-sbtc-deposit-recovery.md, 20261018_skill-update-handoff-zero-to-bns.md, 20261018_skill-update-handoff-bns-lookup.md, 20261018_skill-update-handoff-zero-to-claiming.md, 20261018_skill-update-handoff-zero-to-home.md, 20261019_skill-update-handoff-tax-export.md. Rules carry the apps they were observed in and a scope tag. Protocol numbers and endpoint facts: `references/constants.md`; wallet observations by date: `references/wallets.md`; stories: `references/incidents.md`; copy-by-path and read techniques: `references/scaffold.md`. Hosted copies of every reference file: `https://stx.fan/zero_to/zt_skill-ref-stacks-dapp-architecture-<name>.zero_to-v3.md` (names constants, wallets, incidents, scaffold); fetch them when a pointer is followed and the local file is missing.

This skill governs dApps and sits beside `static-first-architecture`, which governs the static build, dependencies and the harness. A dApp frontend is still a static build; this skill adds a second, independent axis, the **security tier**, and a third input, **wallet capability**. Cheap deployment, relaxed security and "whatever wallet the user has" are three separate choices. Set the tier before writing code, and open the running handoff file with `zero-to-capture` at the same moment.

## Why a dApp usually needs no backend [wallet dApp]

The wallet holds keys, signs and broadcasts; connect plus SIP-018 signing replaces credential servers; state and transaction status come from the public node or Hiro API. The static-first triggers "secrets at request time", "authoritative writes" and "server-enforced authorization" are satisfied by the wallet and the chain and do not justify a backend [apps: signing, claiming, bns, gas]. Genuine triggers: data the public API cannot serve at the needed shape or freshness (an indexer), a relayer or sponsor service [apps: gas], off-chain order matching, private per-user data.

## Reads [chain-reading app]

Live state cannot be snapshotted; never snapshot anything a user makes a value decision against. Immutable history may ship as a static dataset, as an optimization and never as the source of truth. The public API is a dependency with failure modes:

- **Rate limits are per minute and per second, and a 429 looks like CORS.** The response carries no CORS headers, so the browser reports a network error; treat status 0 and 429 alike. The key's plan sets the budget: read the `x-ratelimit-limit-minute` header [apps: claiming, tax-export, gas]. Numbers in `references/constants.md`.
- **Route reads through a gate**: a sliding window under the budget, seconds-scale backoff, one cooldown that a single 429 imposes on every pending read, the budget visible as URL parameters; one gate per host origin when hosts differ [apps: claiming, recovery, gas, tax-export]. A node the user controls may switch the gate off.
- **Cache only definitive answers**; a cached transient failure degrades a whole session [apps: claiming, gas].
- **A failed read renders as unavailable and blocks dependent figures.** Branch by interface, never try-then-fall-back, when the fallback's answer is a legal value; 0 is a legal fee [apps: claiming, bns, bnslookup, home]. Display rules: `stacks-labs-dapp-design`, "Numbers and live data".
- **Keep a second read path** or degrade to unavailable, and say which path answered [apps: signing, recovery, bns, bnslookup, tax-export].
- **`?api=` points reads at the user's own node.** Visible at its current value, reads and explorer links only, never what the wallet signs. URL order: chain, record id, api, budget parameters. Across hosts, `?api=` overrides the commodity chain reads and the protocol-state host stays pinned, POST included [apps: claiming, recovery, gas, bns, bnslookup, tax-export]. A display-only page may pin the host [apps: home].
- **Polls of a cached upstream carry a cache-buster**, or a successful write reads as a failure [apps: recovery, gas].
- **Indexer state and event scans answer different questions.** Materialized state is current and drops history; event scans see only matched topics and never forget. Rosters and histories union both; a lock another address sent is in neither the member's events nor the v3 principal index alone [apps: claiming, tax-export]. Enumerating large event sets is the narrow indexer trigger.
- **A txid identifies one attempt, not the intent.** A fee bump or a twin mines under another id; follow what survives replacement, the origin and nonce or the committed address [apps: gas, recovery].
- **Outcome figures come from the chain**, the mined transaction or the API's balance change, never from the plan or quote [apps: gas, tax-export].
- **A read-only app needs no wallet bundle.** Hand-encode the few Clarity values it reads or ship only the transactions bundle [apps: recovery, tax-export, bnslookup].

## Contract families and source verification [wallet dApp]

Two deployments of the same lineage can expose different APIs, and reading the wrong one returns a plausible wrong number. Detect capability from the deployed interface by **signature**, never by name, and never against your own fixtures; read every parameter, cap and delay from the specific deployed source; asserts inside function bodies are invisible to signature detection and stay catalog data with a source note [apps: signing, claiming].

Pin contract identity by principal **and** verified source; the deployed text wins over the repository [apps: signing, claiming, gas, bns]. A raw hash changes with whitespace and a light canonical hash with formatter spacing; a structure hash over the token stream is formatting-independent, and Clarity's `contract-hash?` is a different algorithm (`references/constants.md`). Assert hash invariance under mechanical reformatting, not only equality [apps: signing, gas]. Pin helpers by principal and structure hash, verify the live source newest-first before offering a path, ship revisions as new contracts and never repoint; verify any "same contract as" claim by hashing both live sources [apps: claiming, gas]. Test static-principal contracts in simnet by substituting principals and keywords with mocks, and prove the variant differs in exactly those tokens [apps: claiming, gas]. Do not compile the project to WASM; the Clarity simnet is a test tool, not a runtime.

## Wallet capability is part of the security model [wallet dApp]

Wallet SIP-030 support is not uniform, and the gaps are where the security lives. Verify, against the wallet's behavior or its published request schema and not a compatibility table, that it enforces the post-conditions your safety depends on; a wallet that drops them is refused for asset-moving calls, with the reason shown [apps: signing, claiming, gas, bns]. Verified is per platform: an extension and its mobile app can differ [apps: gas]. Confirm connect returns a usable Stacks address, and validate a 64-hex txid from every response before treating a call as submitted; a sponsored call returns signed hex and no txid, so validate the hex and treat the sponsor's later txid as an attempt [apps: signing, claiming, bns; gas]. Pre-serialize post-condition types the library lacks to wire hex; hardware wallets gate payload types by app version [apps: signing, bns]. Observations per wallet, platform and date: `references/wallets.md`.

The selector shows the full catalog in three tiers: **verified** (enforcement observed on a real deny-mode call), **offered untested** (listed as capable; the first real transaction is approved only after the wallet's own screen shows the conditions), **blocked** (inert, linked to the reason). Pin the provider id before `connect()` and match installed wallets by id pattern [apps: signing, claiming, bns, gas]. An address-only read may offer every wallet [apps: tax-export]. Ship the blocked-wallet rationale as a page in the app, or as a handoff to the wallet team [apps: signing, claiming, bns; gas].

## Security tiers (the second axis)

**Tier 0** playground: simnet or scratch testnet, no value. **Tier 1** single-feature testnet demo. **Tier 2** anything on mainnet acting on real value, however small; there is no "only a demo" discount. **Tier 3** production value-moving dApp (swap, DEX, lending, sale, treasury): adversarial, multi-user, plus contract-level concerns (audit, oracles, MEV, governance) that a frontend names and assigns [apps: gas].

**Tier 2 exists with no wallet** [chain-reading app]. When the app signs nothing, post-conditions, slippage and wallet capability are inapplicable and the obligations become: pin the API endpoints (overridable for reads only), gate any write behind a cryptographic proof, discard pasted key material without echoing it, ship no wallet control where none belongs, asserted in the harness [apps: recovery, bnslookup, tax-export]. A page that only displays public chain data sits outside the tiers; it still pins its host, validates the response at the boundary and renders a failed read as unavailable [apps: home].

### Invariants that never relax

Apply at every tier, so a promoted demo is not born insecure.

- **Post-conditions mirror the real asset flow.** Deny mode covers every principal in the transaction, so name every movement under deny: the originator's exact amount or protocol condition (`staking-postcondition` with `eq` for a pox-5 stake), another principal's transfer with a condition on that principal, an empty list when nothing moves. Originator mode with zero conditions only where a movement cannot be named, such as a contract burning its own escrow [apps: signing, claiming, bns, gas]. The condition code follows the counterparty's fill semantics: `lte` for a pool that fills partially, since `eq` aborts a valid fill [apps: gas]. Refuse to sign against a counterparty whose arithmetic you cannot price [apps: bns]. Allow mode never appears. A missing condition leaves funds unprotected; a mismatched one aborts a correct call.
- **A call that stores a standing authorization and moves nothing is unguarded by post-conditions**; the copy says so [apps: bns].
- **Client validation is UX, not security.** The contract and the conditions enforce. Every claim about what a call does derives from the verified source; wrong copy misleads a value decision as surely as a missing guard.
- **Scope approvals tightly**; exact amounts over unlimited allowances.
- **Keys stay in the wallet.** No seed or key in frontend code or config, not even a throwaway. Free-text inputs detect pasted key material and discard it; rules in `stacks-labs-dapp-design`, "Inputs that could receive key material" [apps: recovery, tax-export].
- **The persistence anchor is the first on-chain event whose loss would strand funds**, not the final step; nothing persists before it [apps: signing, bns]. UI conventions: `stacks-labs-dapp-design`, "State and resume".

### What scales with the tier

Financial safeguards (slippage bounds tuned to pool depth, price sanity checks, confirmation friction) are irrelevant at tiers 0 and 1 and mandatory from tier 2. Slippage is a frontend parameter and a top cause of losses. MEV is a contract and UX concern named at tier 3. A public tier 3 frontend must be reachable, so access control is not a security control; integrity and authenticity of the served frontend are.

## Network identity [wallet dApp]

Pin per network the name the wallet expects, the chain id, the boot principals and the read API; target the primary testnet and mainnet. A testnet reset keeps the chain id and wipes chainstate, third-party contracts included, so redeploy and re-derive but do not re-key [apps: bns]. A different network changes the chain id, and anything signed offline (a SIP-018 grant) bakes it in; pass the network explicitly on connect. Inherited constants are not pinned constants: re-verify every identifier against the live primary networks before the first signing test. A network block ported from a retired custom testnet made wallets sign with its chain id while the UI showed the right network [apps: signing, claiming, bns]. When preflighting, distinguish wrong network (different boot principal) from not yet activated (same principal, older contract) [apps: signing].

## Transaction validity windows [window-bound action]

Post-conditions govern what may move; windows govern when. For every window-bound action: show the chain position (geometry in `stacks-labs-dapp-design`, "Chain-timing widgets"); derive both ends from the exact comparison operators in deployed source, since the off-by-one lives in strict versus inclusive, and keep the exclusive bound internal (a cycle starting at 150 with length 2100 ends at 2249); re-fetch inside the submit handler every value the call or its condition depends on, position and price alike, and refuse to hand the wallet a doomed transaction; block with an explanation before signing [apps: signing, bns, home; claiming]. The derivation is a pure function with Node tests before the component, at blocks 1, 3, 50, 100 and 101 from the window's end, the first block, the first blocked block and a mid-window control.

## The playground-to-production guard

Mainnet plus real value forces tier 2 from the first line of code; the invariants hold at tier 0 so a promoted demo starts correct. Crossing to tier 2 is an explicit checklist, not a config flip: switch network and chain id everywhere, offline signers included; confirm each call's mode and conditions match who moves what; verify the pinned source on mainnet with a formatting-robust hash; confirm every supported wallet enforces the conditions on each platform; add slippage and price sanity; vendor and pin the served bundles; remove every testnet shortcut; run live build-test-fix rounds after the harness is green; for tier 3, confirm the audit and name owners for oracle, MEV and governance risk. State the tier to the builder; end users need testnet versus mainnet and safety cues. When unsure, treat it as the higher tier.

## Candidates (one app, under review)

Each entry names the app and path, the date, and the condition that promotes it (a second app of a different shape needs it) or retires it (two further builds do not).

- Never fall back from a batched read path to a per-item path on a transient refusal; wait the refusal out. claiming `src/chain.js` lines 410 to 424, 2026-10-02.
- Move read fan-out on chain with a stateless read-only batch contract when per-value reads exceed the budget; chunk and halve on cost rejection. claiming `claim-helper/`, `src/chain.js` lines 410 to 470, 2026-09-10. Mechanics in `references/scaffold.md`.
- A probe is only a probe if it includes accrual since the last snapshot; `get-staker-unclaimed-rewards-for-cycle` under-reported. claiming `claim-helper/contracts/zc-read-helper-v3.clar`, 2026-09-10.
- Lookup-and-verify beats search; a failed search lists its attempts and never names a culprit. recovery `src/app.jsx`, 2026-08-29.
- Error-code namespaces collide across contracts; pick a disjoint range before writing constants. gas `docs/contract.md` line 197, 2026-09.
- Show a backend's own message verbatim beneath the explanation. gas `app/src/steps.jsx`, 2026-09-30.
- An endpoint not verified live ships as an optional lookup with a fallback and a visible "unavailable". recovery `src/clients.js` lines 119 to 121, 2026-10-09.
- Address-only wallet read: `getAddresses` only, cache options off, storage cleaned afterwards. tax-export `src/app.jsx` lines 248 to 270, 2026-10-15.
- c32 decoding maps O to 0 and I and L to 1; require an exact round trip before accepting an address. tax-export `src/address.js`, 2026-10-14.
- Identify tokens by asset identifier, never by symbol. tax-export `src/rows.js`, 2026-10-15.
- Cells chosen by third parties get a formula guard in exports; amounts stay text. tax-export `src/exportfmt.js`, 2026-10-15.
- Read past state with `?tip=`; a formula from today's source is pinned per era by block height. tax-export `src/loader.js` lines 356 to 382, 2026-10-15.
- Fix a closing block before the first read of a period. tax-export `src/loader.js` lines 109 to 133, 2026-10-15.
- Read the unlocked balance before offering a signing button. bns `src/lib.js` lines 235 to 244, 2026-10-18.
- Per-item authorization keyed on `contract-caller` cannot be batched; use a signing queue. bns `src/steps.jsx` `runQueue`, 2026-10-18.
- A failed prerequisite holds its dependants in the sign queue. claiming `src/steps.jsx` lines 1172 to 1180, 2026-09-10.
- Error isolation across a list needs a contract-call boundary per entry. claiming `claim-helper/contracts/zc-claim-helper-v2.clar`, 2026-08-11.
- A persistent header statement that the app never asks for a seed phrase, for apps that take pasted material and perform a write on a stuck user's behalf. recovery `src/app.jsx`, 2026-08-16. Removed from bnslookup, gas and tax-export by owner decision.
