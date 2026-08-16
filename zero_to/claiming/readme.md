# Zero to Claiming

One page that takes a signer-manager operator from nothing to claimed rewards for every staker in their pool, without sending a single transaction the math predicts to fail. A staker can use the same page to claim for themselves. Follows Zero to Signing's conventions throughout.

**How it was built.** Claude plus three skills: two architecture skills, one design skill, a one page PRD, and a contracts handoff verified against deployed mainnet source. Static Vite build, no backend, the wallet signs.

**What it actually does.** Capabilities are read from the deployed manager's interface and matched on signatures, never on names: the same function name means something different across the four deployed managers, and bring-your-own contracts get the same treatment. Claimable amounts come from the manager's own reads before anything is signed, so dust-floored and min-claim-floored payouts are blocked in the table with the arithmetic shown, not discovered as reverts.

**Details we like.**

- The URL is the state: network, the manager, and the API node all live in the address bar. Reload and you are back where you were; swap the api parameter to read from your own node.
- The staker roster needs no indexer: pox-5's own events, paged newest first, name every staker of a manager. Bond positions are collected on the way and counted, visible but out of scope until the Bitcoin staking flow ships.
- Post-condition modes done right for claims: every call runs in originator mode, so nothing can leave the caller's wallet while the manager and pox-5 move the sBTC reward to the staker. Full deny with zero conditions would abort every claim at the manager's own transfer, which is exactly the kind of thing you want to learn from a spec and not from a support ticket.
- The Status step outlives the signing session: Stacks transactions are polled every 10 seconds, Bitcoin withdrawals every 5 minutes through to the L1 sweep, and the address-to-transaction CSV round-trips, so a pasted copy restores the watch list on any machine.
- V1 pulls with an empty bond-period list. The pull settles each leg independently on chain, so bond legs stay collectable later and nothing is stranded; the seam for the Bitcoin flow is designed in, not bolted on.
- Batch claiming through the zc-claim-helper contract, pinned per network by principal AND structure hash: the app verifies the live deployed source before offering the batch path, and one wallet approval then claims for up to 50 stakers with per-entry failure isolation. Any mismatch, an undeployed helper, or the uint-returning manager revision falls back to one-by-one signing. Batch results reconcile per staker from the helper's print events, withdrawal request ids included.
