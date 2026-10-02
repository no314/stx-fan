---
name: stacks-dapp-architecture
description: "Choose the architecture, deployment, and security posture for a Stacks (or similar wallet-and-chain) decentralized application: playgrounds, single-feature demos, testnet experiments, and production value-moving dApps such as swaps, DEXs, lending, and token sales. Use when building or deploying a dApp frontend, deciding whether it needs a backend, wiring wallet connection and contract calls, or moving something from a demo to real value. Governs the security tier separately from the deployment cost, and enforces a hard boundary between throwaway demos and anything that moves real assets."
---

## Scope and relationship to static-first

This skill governs dApps. It sits alongside `prefer-static-builds`, which governs generic prototype deployment. Read both. A dApp frontend is still a static build in the ordinary case (see below), so the deployment ladder from that skill applies. What this skill adds is a **second, independent axis: security tier.** Cheap deployment and relaxed security are not the same choice, and the dangerous mistake is carrying a playground's relaxed security into something that moves real value while keeping the playground's cheap deployment.

Do not treat a dApp as "just a quick thing you show colleagues." A dApp can be that — a playground or a single-feature testnet demo — but the same code shape also underlies swaps and token sales, and the frontend, not a backend, is where much of the user-protecting security lives. Establish the tier explicitly before writing code.

## Why a dApp usually needs no backend of its own

A Stacks dApp is close to the ideal static-first case, because the concerns that normally force a server are handled by infrastructure that is neither yours nor a server you run:

- **Keys and signing: the wallet.** Leather, Xverse, and other SIP-030 wallets hold the seed and sign. The frontend talks to them over the injected provider / `@stacks/connect` (currently migrating from 7.x JWT-based Connect to 8.x SIP-030 JSON-RPC; verify which the target wallets support before depending on it). Keys never touch your frontend or any server.
- **Writes: the wallet.** `stx_callContract` / `stx_transferStx` build, the wallet signs, the wallet broadcasts. There is no write endpoint of yours to host.
- **Auth: wallet connect + signature.** Connection plus SIP-018 structured-message signing replaces credential servers. No session backend.
- **Reads: the public node / Hiro API.** Balances, contract state, and tx status come from public chain infrastructure over HTTPS. That is a public read, not your secret backend.

Consequence for the escalation logic in `prefer-static-builds`: the triggers "secrets used at request time," "authoritative writes," and "server-enforced authorization" are, for a dApp, **satisfied by the wallet and the chain and therefore do NOT justify a backend of your own.** Do not stand up a server just because a dApp signs, writes, or authenticates.

A dApp does have its own genuine backend triggers, distinct from the generic list:

- Data the public API cannot serve at the needed shape or freshness (a custom indexer + database).
- A transaction relayer or sponsored-transaction service.
- Off-chain order matching or an order book.
- Private per-user data that must not be world-readable.

Escalate only for those, and keep the exception narrow.

## Reads: what can and cannot be snapshotted

Live chain state — current balances, mempool, latest block, current pool reserves — is the "constantly changing" case and cannot be served from a static snapshot. A static SQLite/JSON snapshot is stale the moment a block lands. Read live state from the node/Hiro API.

Immutable historical or indexed data (past events, closed epochs) can be shipped as a static dataset and queried client-side per the `prefer-static-builds` data ladder. That is an optimization to avoid running your own indexer; it is never the source of truth for anything a user acts on. Never snapshot state that a user will make a value decision against.

## WASM in a dApp

Same rule as `prefer-static-builds`: do not compile the project to WASM. Use precompiled WASM libraries only where they earn it — secp256k1 signing/hashing helpers, or a local Clarity VM. Note that `clar2wasm` is primarily the node-runtime compiler; the browser-usable Clarity path is the Clarinet / Clarity-VM WASM simnet used by web IDEs and the JS test SDK. That simnet is a **playground and testing** tool (run and inspect contract calls with no network), not a per-dApp production runtime. Verify maturity before depending on it.

## Security tiers (the second axis)

Set the tier before building. The tier fixes both the financial exposure and — critically — which safeguards are allowed to be absent.

**Tier 0 — Playground / learning.** Local Clarity simnet (Clarinet WASM) or a scratch testnet contract. No real value, often no network. Purpose: learn the tech, try an idea. Deployment can be a private static build (org-only Pages is fine). Financial safeguards: not applicable, nothing is at stake.

**Tier 1 — Single-feature testnet demo.** One flow, on testnet, faucet tokens, shown to colleagues. No real value. Deployment: private static build. Financial safeguards: still not applicable.

**Tier 2 — Single-feature mainnet demo.** Real network, real (if small) value, limited scope. The moment real value is involved, full user-protecting safeguards apply regardless of how small the feature looks. There is no "it's only a demo" discount once mainnet assets can move.

**Tier 3 — Production value-moving dApp (swap, DEX, lending, sale, treasury).** Real value, adversarial environment, multiple users. Maximum posture, plus contract-level concerns (audit, oracle trust, front-running/MEV, governance) that are out of scope for a frontend but must be named and owned by someone.

### The invariants that never relax

These are structural, not financial. They cost nothing on testnet and they are the habits that get carried forward. Apply them at **every** tier, including playgrounds, so that a promoted demo is not born insecure:

- **Post-conditions on every asset-moving call, in Deny mode, with explicit amounts.** Post-conditions are declared in your frontend and enforced at the protocol level; the wallet shows them to the user. They are the primary defense against a malicious or buggy contract moving more than intended. Allow mode and missing post-conditions are the default failure and must not appear even in a testnet toy.
- **Never trust client-side validation for correctness.** Frontend checks are UX, not security. The contract and the post-conditions are the enforcement.
- **Pin and verify contract identity.** Hardcode the exact contract principal you intend to call; verify the deployed contract is the one you think it is. A fake or swapped contract address is a live attack, not a testnet-only concern.
- **Scope token approvals/allowances tightly.** Prefer exact amounts over unlimited approvals.
- **Keys stay in the wallet.** Never handle a seed or private key in frontend code or config, not even a throwaway one, because the pattern propagates.

### What scales with the tier

- **Financial safeguards** (slippage bounds tuned to pool depth, sanity checks on displayed prices, confirmation friction, rate limits): irrelevant at Tier 0–1, mandatory from Tier 2 up.
- **Slippage tolerance** for any swap is a frontend-set parameter and a top cause of real-world losses when misconfigured — too loose invites sandwich/front-running, too tight wastes fees on failed txs. Owned by the frontend at Tier 2+.
- **Front-running / MEV awareness:** mempool visibility means a value-moving swap's intent is public before it lands. This is largely a contract/UX concern; name it and assign it at Tier 3.
- **Frontend integrity and anti-phishing:** for a public Tier 3 dApp the frontend must be publicly reachable, so "org-only access control" is not a security control here — interface phishing (fake URLs mimicking the real dApp) is a leading incident category. Integrity and authenticity of the served frontend matter more than restricting who can load it.

## The playground-to-production guard

The core risk: someone builds a Tier 0/1 demo, it works, and it silently becomes a Tier 3 dApp while keeping the demo's relaxed security and cheap deployment. Prevent it structurally.

- **Mainnet + real value forces Tier 2+ automatically.** There is no path where a mainnet asset can move under playground rules. If the target is mainnet, apply Tier 2 safeguards from the first line of code.
- **The invariants above are enforced even at Tier 0**, so a promoted demo starts from correct patterns rather than teaching post-condition-free, allow-mode, or unpinned-contract habits that then ship to mainnet.
- **Crossing from Tier 1 to Tier 2+ is an explicit promotion, not a config flip.** Require, and surface to the user, a checklist: switch network to mainnet deliberately; confirm post-conditions are Deny mode with explicit amounts on every asset call; verify pinned contract identity on mainnet; add slippage bounds and price sanity checks; remove every testnet shortcut (faucet assumptions, disabled checks, hardcoded values); and for Tier 3, confirm the contract has been audited and that oracle, front-running, and governance risks have an owner. Do not let a demo reach real users by quietly repointing an RPC URL.
- **State the tier in the output.** When building or deploying, say which tier this is and which safeguards are consequently active or deferred, so the boundary is visible rather than assumed.

Be conservative about the tier. When unsure whether something is a demo or the seed of a production dApp, treat it as the higher tier. The cost of over-securing a playground is a few unnecessary post-conditions. The cost of under-securing a swap is user funds.