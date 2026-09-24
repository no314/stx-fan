# Route C: JingSwap (Jing v2 sBTC/STX batch auction)

Date 2026-09-20, built 2026-09-22 on Jing v2, replaced 2026-09-23 by a route on the v3 generation market (`markets-sbtc-stx-jing-v6`) in contract B after the chain showed `sbtc-stx-0-jing-v2` idle and paused since 2026-05-08. Sections 1 to 6 describe the v2 route as history; the v6 route is documented in the handoff, section 10. Design note for adding Jing as a third conversion route to `signer-manager-stx-payout`. Sections 1 to 5 are the note as written before the build. Section 6 lists where the built contract departs from it. Chain facts read from deployed source on 2026-09-20.

## 1. What Jing is on chain

Two deployed markets, same code, different STX premium:

- `SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.sbtc-stx-0-jing-v2` (0 percent premium, oracle price), 35,355 bytes, publish height 7569934, `current-cycle` u15.
- `SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.sbtc-stx-20-jing-v2` (0.20 percent STX bonus).

Jing v3 (github Rapha-btc/jing-contracts-v3: registry, per-pair markets, per-user vaults, credit lines) is "Pre-mainnet"; no mainnet addresses exist. Route C targets v2.

Mechanics, from `sbtc-stx-0-jing-v2`:

- It is a blind batch auction, not an order book. `deposit-sbtc (amount uint) (limit-price uint)` moves sBTC from `tx-sender` into the market for the current cycle. `limit-price` is mandatory (`ERR_LIMIT_REQUIRED u1017`) and is the seller's minimum clearing price in the market's price unit (see below). `deposit-stx` is the other side.
- Deposit phase lasts at least `DEPOSIT_MIN_BLOCKS u10` Stacks blocks. Anyone may then `close-deposits` (requires both sides above the minimums, `min-sbtc-deposit` u1000 sats, `min-stx-deposit` u1000000 uSTX) and `settle` (or `close-and-settle-with-refresh` with Pyth VAAs). Settlement uses Pyth BTC/USD and STX/USD (`pyth-storage-v4`), staleness 80 s, confidence ratio 1/50, and refuses if the oracle deviates more than 10 percent from a DEX reference (`get-dex-price`, XYK or DLMM pool, owner-selectable).
- Clearing price is the oracle price, `(/ (* btc-price PRICE_PRECISION) stx-price)`: STX per BTC scaled by 1e8. Observed settlements: cycle 14 `clearing-price u31390486455069` (313,904.86 STX per BTC, about 318.6 sats per STX). A seller's `limit-price` is in the same unit; the deposit rolls to the next cycle if `clearing < limit`.
- Fill is pro rata on the binding side. If total STX is worth less than total sBTC at the clearing price, sBTC sellers are filled proportionally and the unfilled sBTC rolls into the next cycle automatically (`distribute-to-sbtc-depositor` re-books `my-sbtc-unfilled` under cycle + 1). Deposits below 0.20 percent of the pool (`MIN_SHARE_BPS u20`) also roll. At most 50 depositors per side; a new larger deposit bumps the smallest one out (refunded).
- Fee `FEE_BPS u10` (0.10 percent) on the cleared amounts, to the Jing treasury. Integer dust also goes to the treasury.
- STX proceeds are pushed to the depositor inside Jing's `settle` (`stx-transfer? my-stx-received current-contract depositor`). A contract depositor receives STX without being called.
- Owner levers: `set-paused`, `set-dex-source`, `set-min-*-deposit`, `set-treasury`, `set-contract-owner`. `cancel-cycle` after 42 blocks rolls everything forward if settlement never happens. `cancel-sbtc-deposit` refunds a seller during a deposit phase.

Depth is episodic. Settlement events on market 0: cycle 10 cleared 7,539,458 sats against 26,008 STX with 103,874 STX still unfilled on the STX side (a 7.5M-sat sale at oracle price, zero impact); cycle 12 cleared 5,696,242 sats with 66,750 STX left over; cycle 14 had only 130.6 STX of bids, cleared 41,620 sats and rolled 958,036 sats. Both market contracts hold 0 STX and 0 sBTC right now (no open deposits). So Jing can absorb a whole distribution at oracle price when bids are present and absorb nothing when they are not, and nothing on chain tells the seller in advance.

## 2. Why Jing cannot be fill or fail

`convert` is fill or fail because DLMM and Velar execute inside one transaction, so the manager can check the fill before committing. Jing settles in a later transaction the manager does not control, at a price it does not control, filling a share it does not control. Three things follow:

1. The manager cannot know at deposit time whether the epoch will fill. It can only bound the price (limit) and the exposure (amount).
2. A partial fill is normal Jing behaviour, with the remainder rolled into the next Jing cycle inside Jing. The manager's epoch is then "in Jing" across several Jing cycles.
3. The manager cannot observe the fill except by reading Jing's state and its own balances after the fact.

So Route C is a slow route with its own two-step flow beside the instant `convert`. The staker-facing guarantee is the same as today: a staker is paid once, after their epoch closes, at the epoch's blended rate. The only new thing a staker can see is an epoch status "awaiting Jing fill".

## 3. Proposed contract surface

Operator calls (admin or converter, `authorize-converter`):

- `jing-deposit (amount-sats uint) (min-stx-per-btc-x8 uint)`: freezes the convert epoch (same as `convert`), records a `jing-order {epoch, sats-in-jing, stx-before, jing-cycle}`, and calls `deposit-sbtc amount min` inside `as-contract?` with an sBTC allowance. Refused while another Jing order is open, while `total-deficit > 0`, or when Jing's `get-cycle-phase` is not `PHASE_DEPOSIT`. The sats leave the manager's balance but stay reserved: `pending-conversion-sats` is unchanged and `sats-in-jing` is added to the reserve formula so `unattributed-balance` treats them as owed.
- `jing-reconcile`: after Jing settled (Jing `current-cycle` > the order's cycle), reads `get-sbtc-deposit (jing-current-cycle) current-contract` as the unfilled remainder still sitting in Jing, computes `filled = sats-in-jing - remainder`, and the STX received as `stx-balance - stx-before` (nothing else moves STX into the manager while an order is open; `sweep-stx` and STX payouts are gated while an order is open to keep that true). Books the fill into the epoch exactly as `convert` does (`sats-converted`, `ustx-out`, `pending-conversion-sats`, `ustx-liability`, conversion log with route u3 and the Jing settlement price). If `remainder > 0` the order stays open with `sats-in-jing = remainder` and `stx-before` reset; Jing has already rolled the remainder into its next cycle. If `remainder = 0` the order closes and, if the epoch is fully converted, the epoch closes.
- `jing-cancel`: during a Jing deposit phase, `cancel-sbtc-deposit` inside `as-contract?`, books nothing, moves the remainder back to the manager's balance and closes the order; the epoch stays partially converted and the operator finishes it with `convert` (fill or fail) on the instant routes.
- `jing-set-limit (min-stx-per-btc-x8 uint)`: `set-sbtc-limit` during a deposit phase, so a rolled remainder can be re-priced without cancelling.

Read-onlys: `get-jing-order`, `quote-jing` (returns Jing's `get-cycle-phase`, `get-cycle-totals` for the current cycle, and the manager's own deposit; there is no price quote because the price is the oracle at settlement).

Bookkeeping additions: `sats-in-jing` (uint, in the sBTC reserve), `jing-order` (optional tuple), route id `ROUTE_JING u3`, error codes u1032 onward (order open, no order, wrong Jing phase, Jing cycle not advanced, remainder not zero).

Gates while a Jing order is open: `payout-stx` and `sweep-stx` (STX balance is being used as the fill sensor), `convert` on the same epoch (one route at a time per epoch). sBTC payouts, settlements and pulls are unaffected.

## 4. Where the risk sits

- Oracle price, not pool price. Jing fills at Pyth mid with a 10 percent DEX-deviation guard and a 0.10 percent fee. For a seller that is strictly better than either pool once bids exist. The seller's protection is the limit price; the manager forwards the operator's `min-stx-per-btc-x8` unchanged.
- Counterparty timing. The manager's sBTC can sit in Jing for many Jing cycles with no fill. Stakers in that epoch wait. The operator can `jing-cancel` and convert instantly instead. Nothing forces a choice inside the contract.
- Bump-out. With 50 sellers already present, a deposit smaller than the smallest existing one is refused (`ERR_QUEUE_FULL u1013`); a larger one bumps the smallest seller, who is refunded. The manager can itself be bumped by a larger seller: Jing refunds the sBTC to the manager and deletes the deposit. `jing-reconcile` must therefore also accept "deposit gone, sBTC balance back up" as a full cancel (remainder = 0 and no STX received): it reads Jing's `get-sbtc-deposit` and the manager's sBTC balance, not only STX.
- Jing owner powers. `set-paused` blocks settlement and deposits; `cancel-cycle` (anyone, after 42 blocks) rolls deposits forward, it does not refund. A paused Jing with the manager's sBTC inside means waiting until unpause or the cancel path opens. `set-route-enabled u3 false` stops new deposits only.
- Two contracts hold the epoch's value at once. The sBTC reserve formula and the STX liability both carry the in-flight amounts, so admin sweeps cannot reach them, but the audit surface grows: `unattributed-balance` must include `sats-in-jing`, and the invariant test suite needs a Jing mock that reproduces `deposit-sbtc`, `settle` pro-rata distribution, rollover, bump-out and `cancel-sbtc-deposit`.
- Ledger and post-conditions. `jing-deposit` moves sBTC from the manager contract, and Jing later pushes STX to it; the operator's wallet needs contract-principal post-conditions or the allow mode for the deposit call. `settle` is called by whoever settles Jing, not by the operator.

## 5. Defaults the build will take

1. Target market: `sbtc-stx-0-jing-v2` only (0 percent premium). The 20 bps market pays the STX buyer a bonus funded by the seller's proceeds; the manager is the seller.
2. One open Jing order at a time, on the convert epoch only.
3. Fill detection by Jing state plus balance deltas, with STX payouts and `sweep-stx` gated while an order is open.
4. Partial fills are accepted and the remainder is left in Jing (Jing rolls it) until the operator cancels; `jing-reconcile` may be called after every Jing settlement.
5. No automatic fallback from Jing to the instant routes; the operator cancels and converts.
6. Same role gate as `convert`.
7. Estimated size: about 250 lines of contract, a 300-line Jing mock, 25 to 30 tests, one more independent review pass. Cost per `jing-deposit` and `jing-reconcile` is a handful of reads; nothing per staker.

Building this changes the mainnet structure hash and the deployed set (a Jing mock joins the testnet set; Jing v2 has no testnet deployment I could find).

## 6. Built (2026-09-22): departures from sections 3 to 5

Decision record (Werner, 2026-09-20): keep `ERR_EPOCH_STILL_CONVERTING u1027` as is; no per-staker list of pending epochs; contract stays immutable and a Jing v3 means a redeploy with deliberate restaking; v2 integration lives in the signer-manager.

1. Fill sensing is deterministic, not balance based. Section 3 proposed `stx-before` and a balance delta. The built `jing-reconcile` reads Jing's `get-settlement` and `get-cycle-totals` for the order's cycle and applies Jing's own distribution arithmetic (`paid = d * (stx-cleared - stx-fee) / total-sbtc`, `unfilled = d * (total-sbtc - sbtc-cleared) / total-sbtc`), and reads the deposit record under the next cycle as the remainder. The order tuple is `{epoch, jing-cycle, deposited, limit}`; there is no `stx-before`.
2. The STX balance is a tie-break only. A deposit that shows neither a remainder nor a whole roll is either fully filled or rolled and then bumped out. The manager treats it as filled only when its STX balance covers the liability plus Jing's expected payout. A stray STX transfer can therefore only push the outcome toward booking STX to stakers.
3. Rolls are detected from records: the clearing price under the order's limit, or the whole deposit reappearing under the next cycle (Jing's small-share filter, which runs before clearing).
4. Gates: `convert` and `sweep-stx` wait while an order is open (u1032). `payout-stx` is NOT gated (section 3 gated it); with deterministic booking the STX balance is not a sensor that needs protecting.
5. Reconcile window and escape hatch. `jing-reconcile` must run before Jing settles the cycle after the order's cycle. Cancelled Jing cycles (no settlement record) are walked, up to `JING_WALK` (8). A late reconcile fails with `ERR_JING_RECONCILE_LATE (u1037)`. The admin closes the order with `jing-resolve (filled) (refunded)`; `filled + refunded + holding` must equal `deposited`, and every micro-STX above the liability is booked to the epoch.
6. A reconcile with nothing to book (same Jing cycle, deposit still whole) is refused with `ERR_JING_NOT_SETTLED (u1035)`. A bump-out in the same cycle is booked as a refund (`reason "bumped"`). `jing-cancel` books the whole deposit as refunded, never as a fill, and requires the order to be reconciled up to Jing's current cycle (`ERR_JING_UNRECONCILED u1036`).
7. `jing-set-limit` and `jing-deposit` check Jing's phase first (`ERR_JING_NOT_DEPOSIT_PHASE u1034`). Jing's own error codes surface offset by `JING_ERR_OFFSET u2000` (Jing u1001 below minimum reads as u3001), so they never collide with the manager's codes.
8. `jing-reconcile` returns `{jing-cycle, filled-sats, stx-received, refunded-sats, remainder-sats, order-open, reason}` with `reason` one of `settled`, `rolled`, `bumped`, `cancelled`, `resolved`. The print event `jing-reconcile` carries the same fields plus `epoch` and `jing-price`. `get-jing-state` returns `{enabled, market, jing-cycle, phase, totals, order, holding, sats-in-jing}`.
9. Read-onlys built: `jing-current-cycle`, `jing-phase`, `jing-holding` (deposit record under Jing's current cycle plus the next), `get-jing-order`, `get-sats-in-jing`, `get-jing-state`. `quote-jing` from section 3 is folded into `get-jing-state`.
10. Error codes: u1032 order open, u1033 no order, u1034 not deposit phase, u1035 not settled, u1036 unreconciled, u1037 reconcile late.
11. Tests: `tests/jing.mjs`, 140 checks against the seller-side mock `contracts/mocks/sbtc-stx-0-jing-v2.clar` (deposit, full fill, partial fill and second settlement, limit roll, cancel-cycle, cancel, bump-out before and after a partial fill, STX payout of a closed epoch while an order is open, stray STX before reconcile, late reconcile then `jing-resolve`, cancel-cycle followed by settlement in one reconcile, small-share roll, route toggle, reserve invariant with sats in Jing at every step).
12. Size: about 500 contract lines including comments (section 5 estimated 250), a 190-line mock, two review passes.
