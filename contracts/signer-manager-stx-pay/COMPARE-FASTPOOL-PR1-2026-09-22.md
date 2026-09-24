# Comparison: fastpool/fastpool-pox-5 PR 1 versus signer-manager-stx-payout

Date 2026-09-22. Source read: PR "Add upgradeable sBTC-to-STX reward vault" by Rapha-btc, head `Rapha-btc:rapha/fastpool-swap-vault` at commit e18572b6947c959029b92897595e829875a5a75b. Files: `contracts/signer-manager-vault-stx-rewards.clar` (1,324 lines), `contracts/fastpool-swap-vault.clar` (767 lines), `README-audit-bounty-vaults.md`, stxer fork simulations. Chain facts checked against the Hiro API the same day.

## 1. Which Jing

The PR uses the Jing v3 generation (repo jing-contracts-v3), not `sbtc-stx-0-jing-v2`.

Pinned in the vault:

- `SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6-3` (JING_MARKET)
- `SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.swap-router-sbtc-stx-jing-v5-3` (JING_ROUTER)
- `SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.juice-swap-vault-trait` (trait, deployed, block 9021102)
- `SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.rfq-sbtc-stx-jing-v2-3.get-native-price` (deployed, block 8568790, price from miner spend)
- `SP1G48FZ4Y7JY8G2Z0N51QTCYGBQ6F4J43J77BQC0.dia-oracle` (DIA BTC/USD and STX/USD)

Deployment status on 2026-09-22: `markets-sbtc-stx-jing-v6-3` and `swap-router-sbtc-stx-jing-v5-3` return 404 from the Hiro API. The predecessors `markets-sbtc-stx-jing-v6` (block 8994224) and `swap-router-sbtc-stx-jing-v5` (block 8994229) are deployed, and the PR's stxer fork simulations ran against `markets-sbtc-stx-jing-v6`. The last commit ("target markets-sbtc-stx-jing-v6-3 and swap-router-sbtc-stx-jing-v5-3") repointed the vault at contracts that do not exist yet, so the vault as committed fails deploy analysis on mainnet until Jing publishes those two.

Jing v6 market model (from deployed source): per pair market with token-x (sBTC) and token-y (STX) sides; `deposit-token-x (amount limit-price spread update token asset)` rests a maker order at a limit; fills come from takers calling `swap` and from `settle-with-refresh` batch matching at a clearing price; price from Pyth Lazer (`verify-price-feeds`, staleness 80 s) with a signed `update (buff 8192)` supplied by the caller; FEE_BPS u10 per side, taker rebate 20 bps; 50 depositors per side with 10 protected seats, the smallest unseated order is "parked" (removed from matching, `readmit-token-x` later) when a larger one arrives; no block based cycle, `settle-with-refresh` advances the cycle. The router `swap-sbtc-for-stx` splits one amount across Jing, DLMM, XYK and Velar with per-venue minimums; `smart-swap-sbtc-for-stx` chooses the split itself.

Jing v2 (`sbtc-stx-0-jing-v2`, what signer-manager-stx-payout pins): blind batch auction, both sides deposit, settlement at the Pyth mid (pyth-storage-v4) with a DEX deviation guard, pro rata fill, remainder rolled, no taker side, no router.

## 2. Architecture

| | PR 1 (FastPool) | signer-manager-stx-payout |
|---|---|---|
| Contracts | Two: signer manager plus a swap vault behind `swap-vault-trait`; vault replaceable by admin after a 4,032 burn block notice (`propose-swap-vault`, `confirm-swap-vault`) with idle checks | One immutable contract; routes are constants, only enabled flags are mutable |
| Payout currency | STX for every staker, no election; bonds and pox-addr calldata refused in `validate-stake!`; sBTC paid only when a batch times out | Per staker election (v3 calldata or `set-stx-payout`); Max 500 sBTC path, bonds and BTC configs kept byte compatible |
| Staker accounting | Local share mirror written from `validate-stake!`, pinned per cycle against pox-5 `get-signer-pending-staked-ustx-per-cycle`; never calls `claim-staker-rewards-for-signer`; `repair-mirror-many` for unstake drift | Max 500 path: pox-5 `claim-staker-rewards-for-signer` per staker, one pox-5 load per entry; cycle deficits gate |
| Conversion unit | One reward cycle at a time (`vault-cycle` busy flag); whole net pot funded to the vault | Conversion epochs spanning cycles; operator sized tranches |
| Venues | Jing v6 book (rest at limit for `window-blocks`, default 288 burn blocks) then Jing smart router (Jing + DLMM + XYK + Velar) in chunks of `max-chunk-sats` (default 5,000,000) with a 1 block cooldown | DLMM and Velar direct, fill or fail with on chain quotes; Jing v2 auction as slow route |
| Price protection | Pyth Lazer mid from Jing `refresh-mid`, DIA band (default 10 percent), slippage 100 bps, leeway 500 bps for the resting ask; no-Pyth fallback to DIA (10 percent slippage) or native price (50 percent) | Caller floor `min-ustx-per-sat-x8`; quotes computed on chain; Jing v2 settles at Pyth inside Jing |
| Who triggers | `claim-rewards`, `pin-shares`, `fund-swap-vault`, `close-batch`, `router-swap`, `jing-place`, `jing-reclaim` permissionless; splits, take, refloor, config admin only | `convert`, `jing-*` admin or converter; settle and payout as Max 500 |
| Stuck batch | `emergency-recover` after 432 burn blocks returns sBTC and STX to the manager; unsold sBTC paid pro rata as sBTC | Operator `jing-cancel` and instant `convert`; admin `jing-resolve` after a missed reconcile; no timer |
| Batching | `distribute-rewards-many (list 300)`, zero pox-5 calls, zero stakers skipped | `settle-many`, `payout-many` (200), per entry isolation, zc event shapes |
| Fees | Taken in sBTC when the vault is funded; rate pinned at first claim | Max 500 fee model per settle |
| Oracle dependency per tx | Every swap needs a signed Lazer update buffer from an off chain source | None |
| Verification | stxer mainnet fork simulations against real Jing v6, router and AMMs (82 checks), audit bounty with published verdicts | Simnet against mocks (359 checks), two adversarial reviews; no mainnet fork run |

## 3. Similarities

- Both implement `SP000000000000000000002Q6VF78.pox-5.signer-manager-trait`, Clarity 6, `as-contract?` with explicit allowances.
- Both keep explicit liability counters so admin sweeps cannot reach staker funds (`unswapped-sats`, `unpaid-stx` versus the Max 500 reserve plus `pending-conversion-sats`, `sats-in-jing`, `ustx-liability`).
- Both strand floor division remainders inside the liability rather than letting an admin sweep them.
- Both treat Jing as a venue that may fill partially and later, keep the remainder in Jing, and provide a cancel path back to instant venues.
- Both derive the Jing remainder from Jing's own records, not only from balances (theirs `get-token-x-deposit` plus `get-token-x-parked`; ours the settlement tuple plus the next cycle's deposit record).
- Both pin the fee rate per cycle at the first claim.
- Both are permissionless on `claim-rewards`.
- Both print one event per action with a fixed topic.

## 4. What is worth taking from the PR

1. stxer mainnet fork simulations. They deploy the exact source against real pox-5, sBTC, Jing and AMM state and pass signed Lazer updates from the public Jing backend. This is the missing verification step for signer-manager-stx-payout (the handoff lists "mainnet dry run" as not done). The runner is `simulations/_pool-vault-stxer.mjs`; it needs `stxer` and a Hiro API reachable from the runner.
2. Time based escape hatch. The PR guarantees stakers a payout (in sBTC) after 432 burn blocks even if the operator disappears. signer-manager-stx-payout has no timer: a converting epoch waits for the converter. A `convert-deadline` after which any caller may cancel the Jing order and pay the epoch's remaining sats as sBTC would close that gap without a second contract.
3. Permissionless router fallback after a window. Same idea, different venue: after the window anyone can push chunks through the instant routes at a bounded price.
4. Jing v6 as a taker venue. When `markets-sbtc-stx-jing-v6-3` and `swap-router-sbtc-stx-jing-v5-3` are deployed, the router gives one call that splits across all four venues with per venue minimums. That replaces the DLMM bin walk and the Velar math mirror. It costs a signed Lazer update per transaction and a dependency on Jing's router contract.

## 5. What not to take

1. Upgradeable vault. The 4,032 block notice is a reasonable design, but it is the opposite of the immutability decision taken for this project on 2026-09-20 (Jing v3 means a redeploy and a deliberate restake). A trait pointer that an admin can move is a new trust assumption for stakers.
2. STX only. Refusing bonds and pox-addr calldata drops the Max 500 surface. The project brief requires it byte compatible.
3. Share mirror instead of pox-5 settlement. It is cheaper per staker but it forks the accounting away from pox-5: the pox-5 per staker ledger is never zeroed, and a mirror mismatch blocks a cycle until `repair-mirror-many` is run for the right stackers. The Max 500 path pays the pox-5 load per entry and stays in sync by construction.
4. Pinning undeployed contracts. The PR cannot be deployed to mainnet as committed.
5. Native price fallback (`rfq-sbtc-stx-jing-v2-3.get-native-price`, derived from miner spend) with a 50 percent slippage floor. That floor lets a swap clear at half the mid when both Pyth and DIA are unavailable.
