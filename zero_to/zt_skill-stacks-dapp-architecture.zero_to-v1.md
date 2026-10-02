---
name: stacks-dapp-architecture
description: "Choose the architecture, deployment, security posture, and wallet support for a Stacks (or similar wallet-and-chain) decentralized application: playgrounds, single-feature demos, testnet experiments, and production value-moving dApps such as swaps, DEXs, lending, and token sales. Use when building or deploying a dApp frontend, deciding whether it needs a backend, wiring wallet connection and contract calls, pinning contract identity, choosing which wallets to support, or moving something from a demo to real value. Governs the security tier separately from the deployment cost, treats wallet SIP-030 capability as part of the security model, and enforces a hard boundary between throwaway demos and anything that moves real assets."
---

## Scope and relationship to static-first

This skill governs dApps. It sits alongside `static-first-architecture`, which governs generic prototype deployment. Read both. A dApp frontend is still a static build in the ordinary case (see below), so the deployment ladder from that skill applies — including its rule that a page which fetches its libraries from a CDN at load is *deployable-static but not self-contained*, so pin and vendor dependencies with a local fallback. What this skill adds is a **second, independent axis: security tier**, and a **third input: wallet capability.** Cheap deployment, relaxed security, and "whatever wallet the user has" are three separate choices; the dangerous mistake is carrying a playground's relaxed security — or an unverified wallet — into something that moves real value.

Do not treat a dApp as "just a quick thing you show colleagues." A dApp can be that — a playground or a single-feature testnet demo — but the same code shape also underlies swaps and token sales, and the frontend, not a backend, is where much of the user-protecting security lives. Establish the tier explicitly before writing code.

## Why a dApp usually needs no backend of its own

A Stacks dApp is close to the ideal static-first case, because the concerns that normally force a server are handled by infrastructure that is neither yours nor a server you run:

- **Keys and signing: the wallet.** Leather, Xverse, and other SIP-030 wallets hold the seed and sign. The frontend talks to them over the injected provider / `@stacks/connect` (8.x is SIP-030 JSON-RPC; 7.x was JWT-based). Keys never touch your frontend or any server. See "Wallet capability" below — support is not uniform across wallets.
- **Writes: the wallet.** `stx_callContract` / `stx_transferStx` build, the wallet signs, the wallet broadcasts. There is no write endpoint of yours to host.
- **Auth: wallet connect + signature.** Connection plus SIP-018 structured-message signing replaces credential servers. No session backend.
- **Reads: the public node / Hiro API.** Balances, contract state, and tx status come from public chain infrastructure over HTTPS. That is a public read, not your secret backend — but it is not a *reliable* boundary; see "Reads."

Consequence for the escalation logic in `static-first-architecture`: the triggers "secrets used at request time," "authoritative writes," and "server-enforced authorization" are, for a dApp, **satisfied by the wallet and the chain and therefore do NOT justify a backend of your own.** Do not stand up a server just because a dApp signs, writes, or authenticates.

A dApp does have its own genuine backend triggers, distinct from the generic list:

- Data the public API cannot serve at the needed shape or freshness (a custom indexer + database).
- A transaction relayer or sponsored-transaction service.
- Off-chain order matching or an order book.
- Private per-user data that must not be world-readable.

Escalate only for those, and keep the exception narrow.

## Reads: what can and cannot be snapshotted, and the public API is not a solved boundary

Live chain state — current balances, mempool, latest block, current pool reserves — is the "constantly changing" case and cannot be served from a static snapshot. A static SQLite/JSON snapshot is stale the moment a block lands. Read live state from the node/Hiro API.

Immutable historical or indexed data (past events, closed epochs) can be shipped as a static dataset and queried client-side per the `static-first-architecture` data ladder. That is an optimization to avoid running your own indexer; it is never the source of truth for anything a user acts on. Never snapshot state that a user will make a value decision against.

The public API is a dependency, not a given. Design for its failure modes:

- **Rate limits and CORS.** Unauthenticated public endpoints rate-limit; a rate-limited response can arrive header-less and surface in the browser as a *CORS error* rather than a 429, which misleads debugging. Throttle your own calls, back off, and degrade gracefully rather than hammering.
- **Fallback providers.** Have a second read path (an alternate public API, or the app degrading to "couldn't load" without breaking the page) rather than a single hard dependency.
- **Let advanced users point reads at their own node.** A read-node override (e.g. a URL parameter) lets signers/operators verify on-chain data against infrastructure they trust; scope it to reads only, never to what the wallet signs. Make the override discoverable: keep the parameter visible in the URL at its current value (default or overridden) rather than only materializing it when set — an invisible override is a feature no operator finds, and the URL is the app's shareable state anyway.
- **Know when you actually need an indexer.** Endpoints that enumerate large event sets time out at scale; that is a real, narrow backend trigger (a custom indexer), not a reason to serverize the whole app.

## WASM in a dApp

Same rule as `static-first-architecture`: do not compile the project to WASM. Use precompiled WASM libraries only where they earn it — secp256k1 signing/hashing helpers, a local Clarity VM, or a `clarinet format` build used for source verification (see "Verify the source"). Note that `clar2wasm` is primarily the node-runtime compiler; the browser-usable Clarity path is the Clarinet / Clarity-VM WASM simnet used by web IDEs and the JS test SDK. That simnet is a **playground and testing** tool (run and inspect contract calls with no network), not a per-dApp production runtime. Verify maturity before depending on it.

## Wallet capability is part of the security model

Wallet SIP-030 support is **not uniform**, and the gaps are exactly where the security lives. Before you support a wallet, verify — against the wallet's actual behavior, not the spec — that it implements the methods your safety model depends on. In practice this means:

- **Post-conditions on contract calls and deploys.** A wallet that ignores or rejects `postConditions` / `postConditionMode` on `stx_callContract` / `stx_deployContract` cannot enforce the primary user-fund protection. Real example: some popular wallets accept the call but drop post-conditions entirely. **A wallet that cannot enforce post-conditions is unusable for asset-moving calls — detect it and refuse, with a clear explanation, rather than silently signing without protection.** Signing unprotected to "support more wallets" is the wrong trade.
- **The connect / address path.** Wallets differ on `stx_getAddresses` vs `getAddresses` vs `wallet_connect`; a wallet may register only a Bitcoin provider for what your library treats as the Stacks connect call, causing connect to hang with no error. Confirm connect actually returns a usable Stacks address for each supported wallet.
- **Post-condition and payload types the wallet/library will serialize.** Connect libraries often whitelist only `stx`/`ft`/`nft` post-conditions; newer condition types (e.g. Stacks `staking-postcondition`, `pox-postcondition`) must be pre-serialized to wire hex or the library rejects them. Hardware wallets add another gate: a given Ledger app version may not sign certain post-condition types or certain contract-payload versions (e.g. a newer Clarity deploy). Design the flow around the real capability matrix — including a fallback path (deploy from a software wallet, then rotate admin to the hardware key) when hardware can't sign a payload yet.

Practical consequence: if the wallet-selection UI you get from a library can't represent "this wallet is not supported," build your own small selector so unsupported wallets are shown as blocked (linking to an explanation) instead of silently failing. Treat "which wallets we support, and why the others are blocked" as a documented, deliberate decision.

A selector that works in practice has three tiers, not two, and shows the full known-wallet catalog rather than only what is installed:

- **Verified**: wallets whose post-condition enforcement you have actually observed (connect and sign a real deny-mode call and see the conditions rendered). These get a Connect action.
- **Offered untested**: wallets the connect library's compatibility table lists as supporting `postConditions` but that you have not verified (e.g. multisig or institutional wallets). Offer them so operators can try, and say in code and docs that the first real transaction must be approved only after checking the wallet's own signing screen displays the post-conditions. Deny mode is a parameter the wallet must honor when it builds the transaction; an ignoring wallet strips the protection silently.
- **Blocked**: wallets known to drop post-conditions. Shown, inert, with a "why" link. Ship the explanation as a page inside the app (styled with the app's own design system) rather than an external link that can rot; it doubles as the public statement of the policy.

Known-but-not-installed wallets get install links, so the selector is also the answer to "which wallets can I even use." Mechanically, pin the chosen provider id before calling `connect()` (the library persists a selected-provider id) so the library's own modal never re-offers a blocked wallet, and detect installed wallets from the provider registry (`wbip_providers` plus legacy globals), matching by id pattern rather than exact string since ids vary by wallet version.

## Security tiers (the second axis)

Set the tier before building. The tier fixes both the financial exposure and — critically — which safeguards are allowed to be absent.

**Tier 0 — Playground / learning.** Local Clarity simnet (Clarinet WASM) or a scratch testnet contract. No real value, often no network. Purpose: learn the tech, try an idea. Deployment can be a private static build (org-only Pages is fine). Financial safeguards: not applicable, nothing is at stake.

**Tier 1 — Single-feature testnet demo.** One flow, on testnet, faucet tokens, shown to colleagues. No real value. Deployment: private static build. Financial safeguards: still not applicable.

**Tier 2 — Single-feature mainnet demo.** Real network, real (if small) value, limited scope. The moment real value is involved, full user-protecting safeguards apply regardless of how small the feature looks. There is no "it's only a demo" discount once mainnet assets can move.

**Tier 3 — Production value-moving dApp (swap, DEX, lending, sale, treasury).** Real value, adversarial environment, multiple users. Maximum posture, plus contract-level concerns (audit, oracle trust, front-running/MEV, governance) that are out of scope for a frontend but must be named and owned by someone.

### The invariants that never relax

These are structural, not financial. They cost nothing on testnet and they are the habits that get carried forward. Apply them at **every** tier, including playgrounds, so that a promoted demo is not born insecure:

- **Post-conditions that mirror the real asset flow, in Deny mode.** Always Deny mode. The *conditions* must match what the call actually does: an **explicit-amount** condition for a transfer out; the **correct protocol-specific condition** for a call that performs a protocol action but moves nothing to another principal (on Stacks pox-5, a `pox-postcondition` with `will-perform` for actions like unstake / stake-update); and **zero conditions** under Deny for a call that moves no assets to another principal at all (a deploy, a config/admin call, or a lock-in-place like `stake` — a spurious "amount sent" post-condition there fails with `SentEq 0`). Wrong here in either direction: a missing condition leaves funds unprotected; a mismatched condition aborts a correct call. Allow mode and missing-where-needed post-conditions are the default failure and must not appear even in a testnet toy. Verify the wallet and the library actually support and serialize the condition type you use (see "Wallet capability").
- **Never trust client-side validation for correctness.** Frontend checks are UX, not security. The contract and the post-conditions are the enforcement. Likewise, any user-facing claim about what a call does (what locks, when funds unlock, fee units, irreversibility) must be derived from the *verified contract source*, not assumed — wrong copy misleads a value decision as surely as a missing guard.
- **Pin and verify contract identity — the source, not just the address.** Hardcode the exact contract principal, and verify the deployed *source* matches the reviewed reference. Address-pinning alone is insufficient. See "Verify the source."
- **Scope token approvals/allowances tightly.** Prefer exact amounts over unlimited approvals.
- **Keys stay in the wallet.** Never handle a seed or private key in frontend code or config, not even a throwaway one, because the pattern propagates.

### Verify the source, robustly

Verifying a contract means comparing its source to a reviewed reference. Naive hashing misleads:

- A **raw byte hash** changes with any whitespace, newline, or line-ending difference.
- A **light canonical hash** (strip comments, collapse whitespace runs) still changes when a formatter (e.g. `clarinet format`) adjusts spacing *around* delimiters — so a formatted-but-identical contract reads as "unverified."
- A **structure/token hash** (tokenize the source; drop all whitespace, comments, and separators; hash the token stream) is formatting-independent and is the reliable "same code" check. It ignores comment text by design.
- Clarity's own `contract-hash?` is **`SHA-512/256` over the deployed source bytes** — a *different algorithm and normalization* than an app's `SHA-256`, so it will never equal your SHA-256 values; don't compare across them. The emerging ecosystem convention (draft SIP-043) pins the canonical form as `clarinet format` output hashed with `SHA-512/256`, which is what matches `contract-hash?`.

Offer a formatting-robust comparison (structure hash, or the SIP-043 convention if you can run `clarinet format`), and treat the pinned reference as an immutable, commit-addressed source, not a moving branch.

### What scales with the tier

- **Financial safeguards** (slippage bounds tuned to pool depth, sanity checks on displayed prices, confirmation friction, rate limits): irrelevant at Tier 0–1, mandatory from Tier 2 up.
- **Slippage tolerance** for any swap is a frontend-set parameter and a top cause of real-world losses when misconfigured — too loose invites sandwich/front-running, too tight wastes fees on failed txs. Owned by the frontend at Tier 2+.
- **Front-running / MEV awareness:** mempool visibility means a value-moving swap's intent is public before it lands. This is largely a contract/UX concern; name it and assign it at Tier 3.
- **Frontend integrity and anti-phishing:** for a public Tier 3 dApp the frontend must be publicly reachable, so "org-only access control" is not a security control here — interface phishing (fake URLs mimicking the real dApp) is a leading incident category. Integrity and authenticity of the served frontend matter more than restricting who can load it.

## Network identity: pin it, and prefer the primary testnet

Pin, per network, the **network name** the wallet expects, the **chain-id**, the **boot/system-contract principals**, and the **read API**. By default target two networks: the **primary public testnet** and **mainnet**. Custom/experimental testnets exist — usually spun up around consensus-breaking upgrades — and purely local networks (regtest/mocknet) exist for solo development, but neither invites sharing code with others, so prefer the primary testnet: it resets the least often.

**Testnets are volatile — expect resets, but understand what a reset changes.** A reset of the primary testnet keeps the **same chain-id and network identity**; what it wipes is chainstate — contracts you deployed, grants/signatures you produced, balances. So never rely on anything you built there before a reset: redeploy and re-derive, but you do not need to re-key the network.

**A *different* network is what changes the chain-id** — mainnet vs testnet, or a custom/experimental testnet vs the primary one. That is where chain-id mismatches bite. Anything that signs **offline** — a SIP-018 structured message such as a signer/authorization grant — bakes the domain **chain-id** into the signature, so using the wrong one (for example a retired custom network's) makes signatures silently fail to verify on the target network. Do not default the network silently: pass it explicitly on connect (some wallets otherwise fall back to mainnet when the active account differs).

When you preflight the live network, distinguish a genuine *wrong network* (different boot principal, e.g. SP- vs ST-prefixed) from a protocol *not yet activated* (same boot principal, node still reports the older contract) — they need different messages and different user actions.

**Inherited constants are not pinned constants.** The dangerous chain-id mismatch rarely comes from a choice you made; it comes from a network block carried over from a prototype, a reference implementation, or an older app that once targeted a custom testnet. "Keep identical call semantics" does not mean "keep the network identifiers." Whenever code is ported, re-verify every network identifier against the live primary networks before the first signing test: the network name passed to the wallet, the chain-id it implies, the read-API host, and the boot principals. A real failure mode: a ported `connectValue` naming a retired experimental testnet made wallets with a leftover profile sign every transaction with that network's chain-id (0x80000005), and the primary testnet node rejected them all with a SignatureValidation mismatch — while the wallet UI showed the correct network throughout.

## Transaction validity windows

Post-conditions govern what a call may move; validity windows govern *when* an otherwise-correct call is allowed to land. Some protocol actions fail during defined block ranges regardless of arguments — on Stacks pox-5, staking and stake-update transactions broadcast during a cycle's prepare phase fail. For every transaction the app can send, know its blocked windows and design for them:

- **Show position explicitly.** If an action is window-bound, render where the chain currently is (a cycle progress bar with current block, window boundaries, and a marker for the blocked phase), not just an error after the fact.
- **Guard the submit path on a fresh read.** UI state is stale by definition; re-fetch the chain position inside the submit handler and refuse to hand the wallet a doomed transaction. Cached "not in the window" from thirty seconds ago is not a guard.
- **Block with an explanation, not a failure.** A warning ("not possible during the prepare phase; wait for the next cycle") before signing beats a rejected transaction after fees and confusion.

## The playground-to-production guard

The core risk: someone builds a Tier 0/1 demo, it works, and it silently becomes a Tier 3 dApp while keeping the demo's relaxed security and cheap deployment. Prevent it structurally.

- **Mainnet + real value forces Tier 2+ automatically.** There is no path where a mainnet asset can move under playground rules. If the target is mainnet, apply Tier 2 safeguards from the first line of code.
- **The invariants above are enforced even at Tier 0**, so a promoted demo starts from correct patterns rather than teaching post-condition-free, allow-mode, unpinned-contract, or unverified-wallet habits that then ship to mainnet.
- **Crossing from Tier 1 to Tier 2+ is an explicit promotion, not a config flip.** Require, and surface to the user, a checklist: switch network to mainnet deliberately (and update chain-id everywhere, including offline signers); confirm post-conditions are Deny mode with conditions that match each call's real asset flow; verify the pinned contract *source* on mainnet with a formatting-robust hash; confirm every supported wallet actually enforces those post-conditions; add slippage bounds and price sanity checks; vendor and pin the exact dependency bundles served; remove every testnet shortcut (faucet assumptions, disabled checks, hardcoded values, allow-mode fallbacks); and for Tier 3, confirm the contract has been audited and that oracle, front-running, and governance risks have an owner. Do not let a demo reach real users by quietly repointing an RPC URL.
- **State the tier in the output** — to the builder and the promotion checklist. Do not necessarily stamp the internal tier taxonomy onto the end-user UI; end users need "testnet vs mainnet" and clear safety cues, not your internal tier labels.

Be conservative about the tier. When unsure whether something is a demo or the seed of a production dApp, treat it as the higher tier. The cost of over-securing a playground is a few unnecessary post-conditions. The cost of under-securing a swap is user funds.
