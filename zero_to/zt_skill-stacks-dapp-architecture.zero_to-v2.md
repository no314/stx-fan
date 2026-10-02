---
name: stacks-dapp-architecture
description: "Choose the architecture, deployment, security posture, and wallet support for a Stacks (or similar wallet-and-chain) decentralized application: playgrounds, single-feature demos, testnet experiments, production value-moving dApps such as swaps, DEXs, lending, and token sales, and mainnet tools that sign nothing but act on real value. Use when building or deploying a dApp frontend, deciding whether it needs a backend, wiring wallet connection and contract calls, reading chain state through public APIs, pinning contract identity, choosing which wallets to support, or moving something from a demo to real value. Governs the security tier separately from the deployment cost, treats wallet SIP-030 capability as part of the security model, and enforces a hard boundary between throwaway demos and anything that moves real assets."
---

## Scope and relationship to static-first

This skill governs dApps. It sits alongside `static-first-architecture`, which governs generic prototype deployment. Read both. A dApp frontend is still a static build in the ordinary case (see below), so the deployment ladder from that skill applies, including its rule that a page which fetches its libraries from a CDN at load is *deployable-static but not self-contained*, so pin and vendor dependencies with a local fallback. What this skill adds is a **second, independent axis: security tier**, and a **third input: wallet capability.** Cheap deployment, relaxed security, and "whatever wallet the user has" are three separate choices; the dangerous mistake is carrying a playground's relaxed security (or an unverified wallet) into something that moves real value.

Do not treat a dApp as "just a quick thing you show colleagues." A dApp can be that (a playground or a single-feature testnet demo), but the same code shape also underlies swaps and token sales, and the frontend, not a backend, is where much of the user-protecting security lives. Establish the tier explicitly before writing code.

## Start by copying

Three finished Stacks Labs apps are the canonical scaffolds for this skill. Start a new app by copying structure from them, not by re-deriving it from prose. Paths are relative to each app's root.

Copy by path:

- **Zero to Signing** `src/lib.js`: the wallet and transaction bridge. Vendored bundle imports, WBIP plus legacy provider detection, the known-wallet catalog with capability gating, `callReadOnly`, and `resolveBnsName` (Hiro call-read against BNS-V2 with an api.bnsv2.com fallback). This one file gives a new app a working, safety-gated wallet layer on day one.
- **Zero to Signing** `src/vendor/`: pinned known-good `@stacks/connect` and `@stacks/transactions` bundles plus `structure-hash.js` and `contract-sources.js`. Copy the files, not the versions from npm (see `static-first-architecture`: these bundles are load-bearing for correctness).
- **Zero to Signing** `xverse.html`, `src/xverse-page.js`, `src/styles/xverse-page.css`, and the multi-entry `vite.config.js`: the pattern of shipping the rationale for a blocked wallet as a real page, styled with the same tokens, linked from the point of refusal.
- **Zero to Claiming** `src/chain.js`: one gate for every chain read (sliding-window throttle, global 429 cooldown, backoff), pinned helper contracts with structure hashes (`READ_HELPERS`, `HELPERS`), definitive-only verification caching, and chunked read-only list calls that halve on cost rejection.
- **Zero to Claiming** `src/core.jsx`: capability detection from `/v2/contracts/interface` by function signature, never by name.
- **Zero to Claiming's sibling project** `claim-helper/` (beside the app, not inside it): a stateless read-only batch contract project with simnet tests colocated in `scripts/`, testing static-principal contracts by substituting principals with local mocks.
- **sBTC Deposit Recovery** `src/clients.js`: pinned hosts as constants, per-host call spacing, retry with backoff, cache-buster on every upstream GET, automatic fallback read provider, and a fixture mode behind `?fixture=` that runs the whole app offline.

Read for inspiration, do not generalize: the six-step signer rail semantics, grant and auth-id handling, the manager option table, and the admin rotation sequence (Zero to Signing); the eight-step claim rail, dust and min-claim arithmetic, the CSV Status step, and the manager catalog (Zero to Claiming); the branch outcome taxonomy, the escalation mailto builder, the paste classifier, and the reclaim parity resolution (sBTC Deposit Recovery).

## Why a dApp usually needs no backend of its own

A Stacks dApp is close to the ideal static-first case, because the concerns that normally force a server are handled by infrastructure that is neither yours nor a server you run:

- **Keys and signing: the wallet.** Leather, Xverse, and other SIP-030 wallets hold the seed and sign. The frontend talks to them over the injected provider / `@stacks/connect` (8.x is SIP-030 JSON-RPC; 7.x was JWT-based). Keys never touch your frontend or any server. See "Wallet capability" below; support is not uniform across wallets.
- **Writes: the wallet.** `stx_callContract` / `stx_transferStx` build, the wallet signs, the wallet broadcasts. There is no write endpoint of yours to host.
- **Auth: wallet connect + signature.** Connection plus SIP-018 structured-message signing replaces credential servers. No session backend.
- **Reads: the public node / Hiro API.** Balances, contract state, and tx status come from public chain infrastructure over HTTPS. That is a public read, not your secret backend, but it is not a *reliable* boundary; see "Reads."

Consequence for the escalation logic in `static-first-architecture`: the triggers "secrets used at request time," "authoritative writes," and "server-enforced authorization" are, for a dApp, **satisfied by the wallet and the chain and therefore do NOT justify a backend of your own.** Do not stand up a server just because a dApp signs, writes, or authenticates.

A dApp does have its own genuine backend triggers, distinct from the generic list:

- Data the public API cannot serve at the needed shape or freshness (a custom indexer + database).
- A transaction relayer or sponsored-transaction service.
- Off-chain order matching or an order book.
- Private per-user data that must not be world-readable.

Escalate only for those, and keep the exception narrow. Before escalating for read volume, try the on-chain batch reader described under "Reads": it collapses hundreds of per-value reads into a handful of calls with no server.

## Reads: what can and cannot be snapshotted, and the public API is not a solved boundary

Live chain state (current balances, mempool, latest block, current pool reserves) is the "constantly changing" case and cannot be served from a static snapshot. A static SQLite/JSON snapshot is stale the moment a block lands. Read live state from the node/Hiro API.

Immutable historical or indexed data (past events, closed epochs) can be shipped as a static dataset and queried client-side per the `static-first-architecture` data ladder. That is an optimization to avoid running your own indexer; it is never the source of truth for anything a user acts on. Never snapshot state that a user will make a value decision against.

The public API is a dependency, not a given. Design for its failure modes:

- **Rate limits are per minute, and a 429 looks like CORS.** api.hiro.so budgets 50 requests per MINUTE per IP unauthenticated (500 with an API key). Not per second. Design read-heavy steps against the per-minute unit. A rate-limited response carries no CORS headers, so the browser surfaces it as a *CORS error* rather than a 429; "CORS error" in a bug report usually means rate limit. Throttle your own calls, back off, and degrade gracefully rather than hammering.
- **Route every read through one gate (default).** A sliding-window throttle set just under the public budget, retries with seconds-scale backoff, and a global cooldown that a single 429 imposes on ALL pending reads, so parallel workers stop burning retries against a window a previous page load already spent. Make throttle state and budget URL parameters for discoverability (Zero to Claiming: `src/chain.js` `apiFetch` and `gate`, `?throttle=` and `?rpm=`). Escape hatch: a node the user controls may have no limit; let the gate be switched off from the URL.
- **Never cache a transient failure as failure.** Cache only definitive answers (source fetched, hash judged). A cached failed read silently degraded Zero to Claiming for a whole session once; its `verifyOne` now caches only when the source was actually read.
- **A failed read with a valid zero renders as unavailable.** Branch by interface, never try-then-fall-back, when the fallback's answer is indistinguishable from a legal value. Real case: a pool's raw `fees-bips` var read 0 while `get-active-fee-bips` returned 450 (a matured pending fee); a wallet staking page fell back to the raw var whenever the richer read failed for ANY reason, including transient network errors, and displayed 0 percent. Block dependent figures when the read fails; 0 is a legal fee.
- **Fallback providers.** Have a second read path (an alternate public API, or the app degrading to "couldn't load" without breaking the page) rather than a single hard dependency (sBTC Deposit Recovery: `src/clients.js` falls from mempool.space to blockstream.info automatically, only when the default host is in use).
- **Let advanced users point reads at their own node.** A read-node override (a URL parameter) lets signers/operators verify on-chain data against infrastructure they trust; scope it to reads only, never to what the wallet signs. Make the override discoverable: keep the parameter visible in the URL at its current value (default or overridden) rather than only materializing it when set; an invisible override is a feature no operator finds, and the URL is the app's shareable state anyway. When reads span hosts, one `?api=` cannot override both: override the commodity chain reads and keep the protocol-state host pinned, including any write to it (sBTC Deposit Recovery: `?api=` repoints Bitcoin reads to any esplora-compatible endpoint; the Emily host stays pinned, POST included).
- **A cached upstream API can make a successful write read as a failure.** Emily kept serving the pre-registration empty response to identical GETs after a 201. Every poll of an upstream that may cache carries a cache-busting query parameter; say so in the polling copy. This cost two manual recovery sessions before it was learned.
- **Know when you actually need an indexer.** Endpoints that enumerate large event sets time out at scale; that is a real, narrow backend trigger (a custom indexer), not a reason to serverize the whole app.

### Contract print events and indexer state answer different questions

Event scans see only the topics you match (a position that arrived through a different call path never emits the print you grep for) and never forget (expired positions linger). Materialized indexer state is current but drops history. Zero to Claiming's roster was silently missing about 100 of 253 live stakers until the two were unioned: indexer listing as default, event scan as the include-past pass and the fallback for nodes without the endpoint. When counts from two sources disagree, read the indexer's SQL (hirosystems/stacks-blockchain-api); the semantics are checkable. Example: Hiro `/extended/v3/staking` endpoints carry lifetime aggregates and bare principals, so per-cycle construction still needs contract reads; a feature request for lock fields was filed with the API team in September 2026, so recheck before building workarounds.

### When per-value reads exceed the budget, move the fan-out on chain (default)

A stateless read-only batch contract takes lists and returns normalized tuples, collapsing hundreds of reads into a handful. Two Clarity facts shape it: trait references are ILLEGAL in read-only functions (the analyzer treats dynamic dispatch as a writing operation), so known targets get statically bound function pairs and dynamic targets pass principals as plain arguments; and map/fold callbacks cannot close over locals, so per-entry context rides inside each list entry. The `claim-helper` project beside Zero to Claiming: `contracts/zc-read-helper-v2.clar`.

- **The node caps each read-only call** (`read_count` 100 by default), and the affordable list size depends on the TARGET contract's internal read cost, so it cannot be chosen statically. Client side: start large, halve on cost rejection down to 1, memoize the working chunk per contract and function family, and keep progress totals self-correcting so halving grows the estimate instead of the counter overtaking it. A cost rejection is HTTP 200 with `okay:false`; the console stays silent (Zero to Claiming: `src/chain.js` `readerChunks`).
- **Probe before reading (default).** If the base contract exposes a cheap "what remains" read (pox-5 `get-staker-unclaimed-rewards-for-cycle`), sweep the window with it and spend expensive per-target reads only on nonzero hits. Filter-only use is semantics-safe even when the probe's accounting differs from the target's.
- **Test static-principal contracts in simnet by substituting principals with local mocks**; deploy-time analysis validates the real bindings. Simnet cannot resolve mainnet principals (the `claim-helper` project beside Zero to Claiming: `scripts/test-read-helper-v2.mjs`).

### Contract families: the same name is not the same interface

Two deployments of "the same" contract lineage can expose different APIs, and reading the wrong one returns a plausible wrong number rather than an error. Example: one signer-manager lineage exposes a `fees-bips` var and no read-only for the current rate, so the var is the correct read; a sibling lineage adds `pending-fees-bips` / `pending-fees-cycle` and read-onlys (`get-active-fee-bips`, `get-pending-fees`) and its own comment instructs callers to use the read-only. Consequences:

- **Detect capabilities from the deployed interface by SIGNATURE, never by function name**, and never compare against your own simplified fixtures: a harness fixture once masqueraded as ground truth and produced a wrong "different revision" conclusion. Verify against the chain, not against your mocks (Zero to Claiming: `src/core.jsx` shape detection).
- **Read the asymmetry, do not assume it.** On one lineage only a fee INCREASE waits two cycles; a decrease applies immediately. Caps differ in operator as well as value (`< u10000` versus `<= u500`), so a naive shared "max" constant is wrong twice over. Every such parameter is read from the deployed source of the specific contract, and the UI copy states both sides.

### Lookup-and-verify beats search

Whenever any record exists that carries the full derivation inputs, look it up and verify it; search only as a last resort. In sBTC Deposit Recovery a fee-bumped deposit was unsolvable by grid search because the live signer key was in no grid or sample; the stale registry record carried both scripts including that key. Sampling is not enumeration. When a search fails it must list what it attempted rather than name a culprit: a grid search over several unknowns cannot report which unknown missed. Example of a registry going stale under a commitment that survives: a Bitcoin fee bump changes the txid but not the deposit address, so any registry keyed by txid goes stale under RBF while the commitment holds; derive the address from the record's scripts, find the surviving transaction by address lookup, derive the output index by scriptpubkey match (never carry it over), and re-register the confirmed txid.

## WASM in a dApp

Same rule as `static-first-architecture`: do not compile the project to WASM. Use precompiled WASM libraries only where they earn it: secp256k1 signing/hashing helpers, a local Clarity VM, or a `clarinet format` build used for source verification (see "Verify the source"). Note that `clar2wasm` is primarily the node-runtime compiler; the browser-usable Clarity path is the Clarinet / Clarity-VM WASM simnet used by web IDEs and the JS test SDK. That simnet is a **playground and testing** tool (run and inspect contract calls with no network), not a per-dApp production runtime. Verify maturity before depending on it.

## Wallet capability is part of the security model

Wallet SIP-030 support is **not uniform**, and the gaps are exactly where the security lives. Before you support a wallet, verify, against the wallet's actual behavior and not the spec, that it implements the methods your safety model depends on. In practice this means:

- **Post-conditions on contract calls and deploys.** A wallet that ignores or rejects `postConditions` / `postConditionMode` on `stx_callContract` / `stx_deployContract` cannot enforce the primary user-fund protection. Real example: some popular wallets accept the call but drop post-conditions entirely. **A wallet that cannot enforce post-conditions is unusable for asset-moving calls; detect it and refuse, with a clear explanation, rather than silently signing without protection.** Signing unprotected to "support more wallets" is the wrong trade.
- **The connect / address path.** Wallets differ on `stx_getAddresses` vs `getAddresses` vs `wallet_connect`; a wallet may register only a Bitcoin provider for what your library treats as the Stacks connect call, causing connect to hang with no error. Confirm connect actually returns a usable Stacks address for each supported wallet, and validate a usable txid (`/^[0-9a-f]{64}$/i`) from every wallet response before treating a call as submitted.
- **Post-condition and payload types the wallet/library will serialize.** Connect libraries often whitelist only `stx`/`ft`/`nft` post-conditions; newer condition types (e.g. Stacks `staking-postcondition`, `pox-postcondition`) must be pre-serialized to wire hex or the library rejects them. Hardware wallets add another gate: a given Ledger app version may not sign certain post-condition types or certain contract-payload versions (e.g. a newer Clarity deploy). Design the flow around the real capability matrix, including a fallback path (deploy from a software wallet, then rotate admin to the hardware key) when hardware can't sign a payload yet.

Practical consequence: if the wallet-selection UI you get from a library can't represent "this wallet is not supported," build your own small selector so unsupported wallets are shown as blocked (linking to an explanation) instead of silently failing. Treat "which wallets we support, and why the others are blocked" as a documented, deliberate decision.

A selector that works in practice has three tiers, not two, and shows the full known-wallet catalog rather than only what is installed:

- **Verified**: wallets whose post-condition enforcement you have actually observed (connect and sign a real deny-mode call and see the conditions rendered). These get a Connect action. At the time of the source builds, Leather was the only verified wallet.
- **Offered untested**: wallets the connect library's compatibility table lists as supporting `postConditions` but that you have not verified (e.g. multisig or institutional wallets such as Asigna and Fordefi). Offer them so operators can try, and say in code and docs that the first real transaction must be approved only after checking the wallet's own signing screen displays the post-conditions. Deny mode is a parameter the wallet must honor when it builds the transaction; an ignoring wallet strips the protection silently.
- **Blocked**: wallets known to drop post-conditions. Shown, inert, with a "why" link. Ship the explanation as a page inside the app (styled with the app's own design system) rather than an external link that can rot; it doubles as the public statement of the policy. Zero to Signing's `xverse.html` states what the app needs from a wallet, quotes the connect library's compatibility table, cites SIP-030 by section for the changes that would unblock it, and so converts "this app does not support my wallet" from a dead end into a specification.

Known-but-not-installed wallets get install links, so the selector is also the answer to "which wallets can I even use." Mechanically, pin the chosen provider id before calling `connect()` (the library persists a selected-provider id) so the library's own modal never re-offers a blocked wallet, and detect installed wallets from the provider registry (`wbip_providers` plus legacy globals), matching by id pattern rather than exact string since ids vary by wallet version (Zero to Signing: `src/lib.js` `detectWallets` and `walletCatalog`).

## Security tiers (the second axis)

Set the tier before building. The tier fixes both the financial exposure and, critically, which safeguards are allowed to be absent.

**Tier 0: Playground / learning.** Local Clarity simnet (Clarinet WASM) or a scratch testnet contract. No real value, often no network. Purpose: learn the tech, try an idea. Deployment can be a private static build (org-only Pages is fine). Financial safeguards: not applicable, nothing is at stake.

**Tier 1: Single-feature testnet demo.** One flow, on testnet, faucet tokens, shown to colleagues. No real value. Deployment: private static build. Financial safeguards: still not applicable.

**Tier 2: Single-feature mainnet demo, or any mainnet tool acting on real value.** Real network, real (if small) value, limited scope. The moment real value is involved, full user-protecting safeguards apply regardless of how small the feature looks. There is no "it's only a demo" discount once mainnet assets can move.

**Tier 3: Production value-moving dApp (swap, DEX, lending, sale, treasury).** Real value, adversarial environment, multiple users. Maximum posture, plus contract-level concerns (audit, oracle trust, front-running/MEV, governance) that are out of scope for a frontend but must be named and owned by someone.

### Tier 2 exists with no wallet at all

The tier is about real value, not about signing. When an app performs no contract call and holds no key, post-conditions, slippage, contract pinning, and wallet capability are inapplicable, and the tier's obligations become: pin the API endpoints in the build (overridable for reads only through a visible URL parameter); gate the single write, if any, behind a cryptographic proof (no reconstruction match, no submit button); discard pasted key material without echoing it; and state anti-phishing facts in persistent chrome. sBTC Deposit Recovery is the reference: it signs nothing, stores nothing, and re-registers a deposit only after reconstructing and matching the taproot output byte for byte.

**Anti-phishing by negative capability.** A public tool that stuck users reach by URL is a phishing target. Its header states permanently that the app never asks for a seed phrase and never connects a wallet, so a clone that does is self-evidently fake. Enforce it in the harness (statement present, zero wallet controls in the DOM). This complements the frontend-integrity paragraph below; it does not replace it.

### The invariants that never relax

These are structural, not financial. They cost nothing on testnet and they are the habits that get carried forward. Apply them at **every** tier, including playgrounds, so that a promoted demo is not born insecure:

- **Post-conditions that mirror the real asset flow. Deny mode is not one rule; the mode and the conditions follow who moves assets.** SIP-005 deny mode covers every principal in the transaction, not just the originator, so the correct pairing forks three ways:
  - **The originator moves or locks an asset**: deny mode with the exact condition. An explicit-amount condition for a transfer out; the correct protocol-specific condition for a protocol action (on Stacks pox-5, `staking-postcondition` with `eq` amount for `stake`; `pox-postcondition` with `will-perform` for unstake / stake-update). An ordinary STX-transfer condition on a lock-in-place is wrong and fails with `SentEq 0`; zero conditions on a lock leaves the amount unprotected. Zero to Signing: `src/steps.jsx` sends `stake` to the pox-5 contract itself with the manager as an argument and a `staking-postcondition` pre-serialized with `postConditionToHex`.
  - **No principal moves an asset**: deny mode with an EMPTY list. Deploys, admin and config calls, register-type calls. Zero to Signing's deploy, `register-self`, `update-admin`, and `update-fees` all ship `postConditionMode:"deny", postConditions:[]` and are safe because nothing moves.
  - **Another principal moves assets and the originator moves nothing**: `originator` mode with zero conditions. For a reward claim the MANAGER contract moves sBTC to the staker; deny plus an empty list aborts the manager's own transfer. Zero to Claiming: `src/steps.jsx` `ORIGINATOR` constant on every claim call. Full deny would abort every claim at the contract's own transfer, which is the kind of thing to learn from the spec and not from a support ticket.
  
  Allow mode never appears, not even in a testnet toy. Wrong in either direction is a defect: a missing condition leaves funds unprotected; a mismatched condition aborts a correct call. Verify the wallet and the library actually support and serialize the condition type and mode you use (see "Wallet capability").
- **Never trust client-side validation for correctness.** Frontend checks are UX, not security. The contract and the post-conditions are the enforcement. Likewise, any user-facing claim about what a call does (what locks, when funds unlock, fee units, irreversibility) must be derived from the *verified contract source*, not assumed; wrong copy misleads a value decision as surely as a missing guard.
- **Pin and verify contract identity: the source, not just the address.** Hardcode the exact contract principal, and verify the deployed *source* matches the reviewed reference. Address-pinning alone is insufficient. See "Verify the source."
- **Scope token approvals/allowances tightly.** Prefer exact amounts over unlimited approvals.
- **Keys stay in the wallet.** Never handle a seed or private key in frontend code or config, not even a throwaway one, because the pattern propagates. Any free-text input that could receive pasted key material detects it and discards it without echoing (detection rules in `stacks-labs-dapp-design`).

### Verify the source, robustly

Verifying a contract means comparing its source to a reviewed reference. Naive hashing misleads:

- A **raw byte hash** changes with any whitespace, newline, or line-ending difference.
- A **light canonical hash** (strip comments, collapse whitespace runs) still changes when a formatter (e.g. `clarinet format`) adjusts spacing *around* delimiters, so a formatted-but-identical contract reads as "unverified."
- A **structure/token hash** (tokenize the source; drop all whitespace, comments, and separators; hash the token stream) is formatting-independent and is the reliable "same code" check. It ignores comment text by design.
- Clarity's own `contract-hash?` is **`SHA-512/256` over the deployed source bytes**, a *different algorithm and normalization* than an app's `SHA-256`, so it will never equal your SHA-256 values; don't compare across them. The emerging ecosystem convention (draft SIP-043) pins the canonical form as `clarinet format` output hashed with `SHA-512/256`, which is what matches `contract-hash?`.

Offer a formatting-robust comparison (structure hash, or the SIP-043 convention if you can run `clarinet format`), and treat the pinned reference as an immutable, commit-addressed source, not a moving branch. Then:

- **Assert hash invariance, not just hash equality.** Recompute each bundled source's hash, mechanically reformat the source (newlines, paren spacing), recompute, and assert both equal the pinned literal. That second assertion is what makes the user-facing claim ("copy the source out, reformat it, paste it back, same hash") a tested property (Zero to Signing: `scripts/verify-hashes.mjs`, runs in node with no browser).
- **Pin deployed helpers by principal AND structure hash**, verify the LIVE source before offering the path, and fall back gracefully on mismatch. Ship revisions as new contracts verified newest-first; never repoint a pin without re-verifying (Zero to Claiming: `src/chain.js` `READ_HELPERS`).
- **Surface which path ran and why, in the UI.** A one-line reader line above the data (path, revision, probe narrowing, or the exact fallback reason) converts every "it feels slow, did it fall back?" support exchange into a screenshot.
- **Name contract files exactly as the intended on-chain name** when the deploy tool names the contract after the source file; otherwise plan a repin pass. It happened twice in Zero to Claiming.

### What scales with the tier

- **Financial safeguards** (slippage bounds tuned to pool depth, sanity checks on displayed prices, confirmation friction, rate limits): irrelevant at Tier 0 and 1, mandatory from Tier 2 up.
- **Slippage tolerance** for any swap is a frontend-set parameter and a top cause of real-world losses when misconfigured: too loose invites sandwich/front-running, too tight wastes fees on failed txs. Owned by the frontend at Tier 2+.
- **Front-running / MEV awareness:** mempool visibility means a value-moving swap's intent is public before it lands. This is largely a contract/UX concern; name it and assign it at Tier 3.
- **Frontend integrity and anti-phishing:** for a public Tier 3 dApp the frontend must be publicly reachable, so "org-only access control" is not a security control here; interface phishing (fake URLs mimicking the real dApp) is a leading incident category. Integrity and authenticity of the served frontend matter more than restricting who can load it. Add the negative-capability statement above wherever the app holds no key.

## Network identity: pin it, and prefer the primary testnet

Pin, per network, the **network name** the wallet expects, the **chain-id**, the **boot/system-contract principals**, and the **read API**. By default target two networks: the **primary public testnet** and **mainnet**. Custom/experimental testnets exist (usually spun up around consensus-breaking upgrades) and purely local networks (regtest/mocknet) exist for solo development, but neither invites sharing code with others, so prefer the primary testnet: it resets the least often.

**Testnets are volatile: expect resets, but understand what a reset changes.** A reset of the primary testnet keeps the **same chain-id and network identity**; what it wipes is chainstate: contracts you deployed, grants/signatures you produced, balances. So never rely on anything you built there before a reset: redeploy and re-derive, but you do not need to re-key the network.

**A *different* network is what changes the chain-id**: mainnet vs testnet, or a custom/experimental testnet vs the primary one. That is where chain-id mismatches bite. Anything that signs **offline** (a SIP-018 structured message such as a signer/authorization grant) bakes the domain **chain-id** into the signature, so using the wrong one (for example a retired custom network's) makes signatures silently fail to verify on the target network. Do not default the network silently: pass it explicitly on connect (some wallets otherwise fall back to mainnet when the active account differs).

When you preflight the live network, distinguish a genuine *wrong network* (different boot principal, e.g. SP- vs ST-prefixed) from a protocol *not yet activated* (same boot principal, node still reports the older contract); they need different messages and different user actions.

**Inherited constants are not pinned constants.** The dangerous chain-id mismatch rarely comes from a choice you made; it comes from a network block carried over from a prototype, a reference implementation, or an older app that once targeted a custom testnet. "Keep identical call semantics" does not mean "keep the network identifiers." Whenever code is ported, re-verify every network identifier against the live primary networks before the first signing test: the network name passed to the wallet, the chain-id it implies, the read-API host, and the boot principals. A real failure mode: a ported `connectValue` naming a retired experimental testnet made wallets with a leftover profile sign every transaction with that network's chain-id (0x80000005), and the primary testnet node rejected them all with a SignatureValidation mismatch, while the wallet UI showed the correct network throughout.

## Transaction validity windows

Post-conditions govern what a call may move; validity windows govern *when* an otherwise-correct call is allowed to land. Some protocol actions fail during defined block ranges regardless of arguments: on Stacks pox-5, staking and stake-update transactions broadcast during a cycle's prepare phase fail. For every transaction the app can send, know its blocked windows and design for them:

- **Show position explicitly.** If an action is window-bound, render where the chain currently is (a cycle progress bar with current block, window boundaries, and a marker for the blocked phase), not just an error after the fact. Display rules for that bar are in `stacks-labs-dapp-design`.
- **Derive the window from the node, and keep the exclusive bound internal.** From `/v2/pox`: `end = next_cycle.reward_phase_start_block_height`, `start = end - reward_cycle_length`, prepare when `current_burnchain_block_height >= next_cycle.prepare_phase_start_block_height`. The cycle's LAST block is `end - 1`; a cycle starting at 150 with length 2100 ends at 2249, not 2250.
- **Guard the submit path on a fresh read.** UI state is stale by definition; re-fetch the chain position inside the submit handler and refuse to hand the wallet a doomed transaction. Cached "not in the window" from thirty seconds ago is not a guard.
- **Block with an explanation, not a failure.** A warning ("not possible during the prepare phase; wait for the next cycle") before signing beats a rejected transaction after fees and confusion.

## The playground-to-production guard

The core risk: someone builds a Tier 0/1 demo, it works, and it silently becomes a Tier 3 dApp while keeping the demo's relaxed security and cheap deployment. Prevent it structurally.

- **Mainnet + real value forces Tier 2+ automatically.** There is no path where a mainnet asset can move under playground rules. If the target is mainnet, apply Tier 2 safeguards from the first line of code. This includes tools that sign nothing (see "Tier 2 exists with no wallet at all").
- **The invariants above are enforced even at Tier 0**, so a promoted demo starts from correct patterns rather than teaching post-condition-free, allow-mode, unpinned-contract, or unverified-wallet habits that then ship to mainnet.
- **Crossing from Tier 1 to Tier 2+ is an explicit promotion, not a config flip.** Require, and surface to the user, a checklist: switch network to mainnet deliberately (and update chain-id everywhere, including offline signers); confirm the post-condition mode and conditions match each call's real asset flow (who moves what); verify the pinned contract *source* on mainnet with a formatting-robust hash; confirm every supported wallet actually enforces those post-conditions; add slippage bounds and price sanity checks; vendor and pin the exact dependency bundles served; remove every testnet shortcut (faucet assumptions, disabled checks, hardcoded values, allow-mode fallbacks); run at least three build-test-fix rounds against the live network after the offline harness is green (live networks find what fixtures cannot: rate-limit units, source-fetch races, cost ceilings); and for Tier 3, confirm the contract has been audited and that oracle, front-running, and governance risks have an owner. Do not let a demo reach real users by quietly repointing an RPC URL.
- **State the tier in the output**, to the builder and the promotion checklist. Do not necessarily stamp the internal tier taxonomy onto the end-user UI; end users need "testnet vs mainnet" and clear safety cues, not your internal tier labels.

Be conservative about the tier. When unsure whether something is a demo or the seed of a production dApp, treat it as the higher tier. The cost of over-securing a playground is a few unnecessary post-conditions. The cost of under-securing a swap is user funds.

## Reference constants (verified during the source builds; recheck only if stale)

- Hiro public API: 50 requests per minute per IP unauthenticated, 500 with `x-api-key` (verified September 2026).
- stacks-node `read_only_call_limit` defaults: `read_count` 100, runtime 1e9.
- pox-5 principals: mainnet `SP000000000000000000002Q6VF78.pox-5`, testnet `ST000000000000000000002AMW42H.pox-5`. `get-staker-info` returns `amount-ustx`, `first-reward-cycle`, `num-cycles`, `signer`.
- Mainnet cycle geometry: 2100 blocks, the last 100 the prepare phase.
- pox-5 staking through a signer manager: 1 to 96 consecutive cycles maximum (a PRD once said 48; the chain says 96), signing minimum 50,000 STX.
- BNS-V2 mainnet: `SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2`; primary name read is `get-primary`, falling back to the NFT holdings endpoint plus `get-bns-from-id`, then to `https://api.bnsv2.com/names/address/{addr}/valid`.
- Empirical read-only cost datapoints: a 1-entry batch claim cost 34 reads / 337k runtime (mostly fixed overhead), 2 entries 65 reads / 580k, roughly 30 reads per entry marginal; max500-lineage earned reads cost about 20 `read_count` each inside a read-only call.
- Emily (sBTC) CORS on POST echoes the request origin rather than returning `*`; assert the echo, not a literal.