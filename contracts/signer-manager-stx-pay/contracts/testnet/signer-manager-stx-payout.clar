;; Signer-manager that supports STX payouts: based on Fastpool's Max500 with
;; claim-many functions built in (Version A.0)
;;
;; Version scheme: the letter is the build (A without Jing, B with Jing), the
;; number counts mainnet deployments. Iterations before a deployment keep the
;; number; the first deployment is A.0 or B.0, the next A.1, and so on.
;;
;; A pox-5 signer manager derived from the deployed Fastpool Max 500 lineage
;; (SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager,
;; source sha256 e80395f43dd6dd0008131ed2ba64eef11d4dde54eba1aa8e31c5e5eaa3a30608).
;; Every Max 500 public function and read-only keeps its exact signature and
;; return type. Two things are added:
;;
;;   A. STX payouts. A staker may elect STX. Their share of the pool's sBTC
;;      rewards is converted to STX on chain through pinned routes (two DEX
;;      pools; the Jing build adds a Jing route), once per conversion epoch,
;;      and paid to them in STX.
;;   B. Native batching. `settle-many` and `payout-many` process up to 200
;;      entries inside this contract, with per-entry isolation and the same
;;      print events the Zero to Claiming helper (zc-claim-helper-v2) emits.
;;
;; ------------------------------------------------------------------------
;; DESIGN DECISIONS (each one is a choice; the trade-off is stated)
;; ------------------------------------------------------------------------
;;
;; 1. Conversion happens at the pool level, once per epoch, not per payout.
;;    `settle-staker-rewards` books an STX elector's net sats into the OPEN
;;    conversion epoch. `convert` swaps that epoch's sats (all at once or in
;;    tranches) and records the realized rate. Stakers are then paid micro-STX
;;    at that epoch's blended rate, floored per staker. No admin ever sets a
;;    rate. The remainder from flooring stays in the contract, counted inside
;;    `ustx-liability`, and is never sweepable (same philosophy as Max 500's
;;    per-cycle rounding residue).
;;
;; 2. STX is a per-staker election, not a pool-wide mode. The election is a
;;    third payout kind beside Max 500's two (direct sBTC, BTC via pox-addr).
;;    `payout-configs` (BTC) is unchanged; STX electors live in
;;    `stx-elections`. `get-payout-config` therefore returns none for an STX
;;    elector; `get-payout-currency` names the kind. Calldata v3 is the
;;    consensus serialization of `{stx-payout: bool}`; v1 and v2 shapes are
;;    still accepted through the unchanged `parse-payout-calldata`.
;;
;; 3. Route selection is on chain, atomic, with a caller supplied floor.
;;    `convert` quotes both routes inside the transaction, executes the one
;;    with more STX out, and fails with ERR_SLIPPAGE when the realized rate
;;    is below `min-ustx-per-sat-x8` (micro-STX per sat, times 1e8).
;;    FILL OR FAIL: a route whose quote cannot absorb the whole tranche is
;;    not a candidate, and a swap that moves fewer sats than the tranche
;;    fails the transaction (ERR_PARTIAL_FILL) so nothing changes. If the
;;    chosen route's swap fails outright the other candidate is tried; when
;;    the last candidate fails too, its own error code is returned so the
;;    operator sees why (ERR_NO_ROUTE means no route quoted at all; a failed
;;    DLMM step prints the core's code as `convert-dlmm-step-err`).
;;    FALLBACK BOUND (audit 2026-09-24): whatever floor the caller passes,
;;    the realized output may not sit more than MAX_FALLBACK_BIPS (3 percent)
;;    under the best quote of the same transaction, and a conversion that
;;    yields zero STX is refused. A fallback route therefore cannot execute
;;    far below the route that was quoted; the operator disables the failing
;;    route to convert through the other one on purpose. Routes are PINNED
;;    CONSTANTS with an admin toggle: an admin can disable a dead or paused
;;    route but cannot add or replace a principal.
;;    WHO MAY CONVERT: admins and principals enabled through `set-converter`.
;;    The brief asked for a permissionless `convert`; that is not safe. With
;;    a caller chosen floor, anyone could move the pools, call `convert` with
;;    a floor of zero, and buy back, taking value from every STX elector with
;;    no accounting invariant broken. A permissionless `convert u1` would
;;    also freeze the open epoch at will. Gating it to the operator (who can
;;    delegate to a non-admin bot key) is the smallest change that removes
;;    both. The project brief's "the pool operator should be able to make
;;    the conversion" is satisfied. Trade-off: a new pool needs a redeploy, and
;;    in exchange the set of contracts this manager can ever move funds
;;    through is fixed at deploy time, so audits and post-condition models stay
;;    valid for the life of the contract.
;;      Route A ("HODLMM"): Bitflow DLMM pool
;;        SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15
;;        (pool id 6, bin step 15 bps, x = STX via token-stx-v-1-2, y = sBTC,
;;        fee 25 + 25 bps) through core
;;        SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA.dlmm-core-v-1-1
;;        `swap-y-for-x`. The core swaps ONE bin per call, so `convert` walks
;;        up to DLMM_MAX_BINS bins per transaction and stops when the tranche
;;        is filled. Whatever is not filled stays pending for a later call.
;;      Route B: Velar amm2 pool 0070
;;        SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-pool-v1_0_0-0070
;;        (token0 wstx, token1 sbtc-token, swap fee 0.30 percent, owner may move
;;        it up to 0.50 percent) via its own `swap`, quoted through
;;        `univ2-fees-v1_0_0-0070 calc-fees` and `univ2-math find-dx`.
;;    The name "HODLLM" in the brief does not exist on chain; Bitflow's product
;;    is HODLMM, deployed as the DLMM contracts above.
;;
;; 4. `convert` is a separate step from `claim-rewards` and from settlement,
;;    so a bad market never blocks reward pulls or settlement. Only STX
;;    electors wait on it. The operator sizes tranches (`amount-sats`) to what
;;    the pools can fill; `quote-routes` reports `dlmm-filled` for that.
;;
;; 5. Native batching. A public function returning err rolls the whole
;;    transaction back; a private function's err does not undo its writes; a
;;    contract cannot `contract-call?` itself. So every per-entry body here is
;;    check-then-write: all preconditions are read-only asserts, then the one
;;    external call that can fail (pox-5 settlement, or the asset transfer),
;;    then this contract's writes, which cannot fail. The per-entry private
;;    function returns a response that the loop matches, never try!s, and
;;    prints one `zc-*` event per entry in the helper's exact shape.
;;
;; 6. Single-entry functions are byte-compatible with Max 500 so Ledger users
;;    on Stacks app 0.26.x (which blind-signs every list argument) can run the
;;    flow one entry at a time, and so Zero to Signing, Zero to Claiming and
;;    Leather's manager validation keep detecting this lineage. Arguments are
;;    identical throughout; the one return-type change is decision 15.
;;
;; 7. Payout floor. `min-claim` (Max 500) protects a BTC elector from a third
;;    party burning their reward on L1 fees. An STX payout has no L1 fee, so no
;;    floor applies to STX; the dust rule applies only to the BTC path.
;;
;; 8. `claim-staker-rewards` for an STX elector settles and, when that staker's
;;    epoch is already converted, pays out; otherwise it returns
;;    `(ok {earned: <settled sats>, withdrawal-request: none})` without moving
;;    funds. The helper trait's return type is unchanged.
;;
;; 9. Cost of the pox-5 load. Every `contract-call?` into pox-5 charges the
;;    136 KB load of that contract. The batch path therefore calls pox-5 once
;;    per entry: `claim-staker-rewards-for-signer` both reads and zeroes the
;;    staker's pending. The local preconditions run first; the only check
;;    that depends on the pox-5 result is whether the cycle's pulled reserve
;;    covers `gross`. When it does not (rewards accrued at a distribution the
;;    signer has not pulled yet) the shortfall is booked as a cycle deficit
;;    that the next `claim-rewards` funds first, and payouts and conversions
;;    are gated pool-wide with ERR_UNFUNDED_SETTLEMENT until every deficit is
;;    funded. `claim-rewards` is permissionless and possible whenever a
;;    deficit exists (the accrual that caused it is claimable), so the gate is
;;    always clearable in one transaction. Max 500 instead rejected the settle
;;    with ERR_NO_CLAIMABLE_REWARDS; a never-pulled cycle is now refused up
;;    front with ERR_CYCLE_NOT_PULLED (u1030). `claim-staker-rewards` whose
;;    own settle opens a deficit keeps the settle and returns the settled
;;    sats (event `claim-unfunded`), like an STX elector's settle that awaits
;;    conversion; the payout follows once the deficit is pulled. The gate is
;;    pool-wide and permissionless to trip (any settle with post-pull
;;    accrual); the cost is one `claim-rewards` before the next payout batch.
;;    `claim-rewards` also keeps reserved anything pox-5 sends beyond the
;;    parts it itemizes, as Max 500 did.
;;
;; 10. Deficit gate scope. `withdraw-fees`, `sweep-fee-refunds` and
;;     `settle-accepted-withdrawal` are gated on `total-deficit == 0` as well,
;;     so fees booked on not-yet-pulled sats cannot be withdrawn out of other
;;     stakers' balance, and an accepted withdrawal's fee refund is never read
;;     against a clamped reserve. Liveness bound: a deficit exists only when
;;     pox-5 has accrued rewards the signer has not pulled, and pox-5
;;     `claim-rewards` has no timing restriction beyond `rewards-paused` and
;;     `total-rewards > 0`, so the pull that clears it is always possible in
;;     the same block unless pox-5 rewards are paused protocol-wide.
;;
;; 11. `validate-stake!` with no calldata clears the STX election as well as
;;     the BTC config (Max 500 semantics for the config). A staker who elected
;;     STX through `set-stx-payout` and later drives `stake-update` without
;;     calldata reverts to direct sBTC. Wallets should pass v3 calldata on
;;     top-ups, or the staker re-elects afterwards. The callback prints
;;     `validate-stake` with the resulting payout currency so the change is
;;     visible on chain.
;;
;; 12. No Jing route in this build. The sibling contract
;;     signer-manager-stx-payout-jing adds Jing as route C; this one
;;     converts on the two DEX routes and falls back to `abandon-epoch`.
;;     Route id u3 is reserved for it and refused here.
;;
;; 13. Re-settling. pox-5 distributes twice per 2100-block cycle, so a second
;;    settle of the same (staker, cycle, bond-index) is legitimate when new
;;    rewards accrued. A settle that finds nothing new for an entry that was
;;    already settled fails with ERR_NOTHING_TO_SETTLE (u1018), distinct from
;;    ERR_NO_CLAIMABLE_REWARDS (u1001), which is kept for never-settled zero.
;;
;; 14. Abandoning an epoch (2026-09-23, stranded path 2026-09-24).
;;     `abandon-epoch` closes the convert epoch without converting the rest.
;;     The converted part pays in STX at the blended rate; the remaining sats
;;     pay back as sBTC pro rata through the Max 500 `pending-payouts` leg (a
;;     staker with both legs is paid in two `payout` calls, sBTC first). An
;;     admin may abandon at any time. Anyone may abandon once the epoch is
;;     STRANDED: no progress for STRANDED_EPOCH_BURN_BLOCKS (4200) burn
;;     blocks, two pox-5 reward cycles. Progress is the first settlement into
;;     the epoch, each conversion tranche, and in the Jing build each order
;;     placed or re-priced; each one resets the clock, so an operator working
;;     an epoch in tranches is never overtaken. The clock is a burn height in
;;     the epoch record, compared against `burn-block-height`: no pox-5 read,
;;     no oracle. The permissionless path is non-custodial: it can only hand
;;     stakers the sBTC a non-elector receives anyway and moves nothing to
;;     the caller. In the Jing build `jing-cancel` and `jing-reconcile` open
;;     to anyone at the same moment, so an order left resting by a vanished
;;     operator comes back to the contract first. Lost admin keys therefore
;;     delay STX electors by at most two cycles instead of stranding them.
;;     `convert` stays role gated because a permissionless caller cannot be
;;     trusted with the floor and the contract reads no oracle. FastPool's
;;     PR 1 vault uses the same shape with 432 burn blocks (`emergency-
;;     recover`); the longer window here reflects that conversion is an
;;     operator decision, not a batch with a fixed schedule.
;;
;; 15. spox trait over Max 500 return values (2026-09-24). The contract
;;     `impl-trait`s the spox reward-claim-registry trait exactly as published
;;     at SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H.reward-claim-signer-manager-trait.
;;     That trait follows the pinned reference (signer-manager-stillearly) and
;;     types `settle-accepted-withdrawal` and `reclaim-failed-withdrawal` as
;;     `(response bool uint)`. Max 500 changed both to return the refunded
;;     sats, `(response uint uint)`, when it added fee-refund crediting. One
;;     function cannot satisfy both, and `impl-trait` compares signatures
;;     exactly. Decision: adopting the spox trait unchanged matters more than
;;     preserving Max 500's `(ok refund)` values, so these two functions
;;     return `(ok true)` here. Nothing else moves: logic, errors, events,
;;     `claim-refund`, `get-staker-refund` and every other public signature
;;     stay Max 500, and the refund amount is still reported in the events
;;     (`amount-sats` on reclaim, `fee-refund` on settle). The registry only
;;     tests `is-ok` on these calls, and dynamic dispatch through a trait
;;     argument does not check return types, so Max 500 itself keeps working
;;     with the registry; only the deploy-time `impl-trait` check needed this.
;;     A caller that read the uint from Max 500 reads the event or
;;     `get-staker-refund` instead.
;;
;; Verified against deployed source (2026-09-19):
;;   pox-5 `signer-manager-trait` = validate-stake! (principal uint uint uint
;;   uint bool (optional (buff 500))) -> (response bool uint).
;;   pox-5 `claim-staker-rewards-for-signer` returns
;;   (response {earned: uint, rewards-per-token: uint} uint) and zeroes the
;;   staker's pending before this contract can check anything (design 9).
;;
;; Simnet: the mainnet principals below are substituted by build/gen-sim.mjs
;; for the mock contracts; the deployed artifact is this file unchanged.

(impl-trait 'ST000000000000000000002AMW42H.pox-5.signer-manager-trait)
(use-trait signer-manager-trait 'ST000000000000000000002AMW42H.pox-5.signer-manager-trait)
;; The spox reward-claim-registry trait (stx-labs/spox, commit
;; ab8966fdc49f671c16a2d0b22bf65fdf299bb3a1, reward-claim-registry.clar lines
;; 1 to 50), deployed unchanged at this address on 2026-09-23 (block 9050280).
;; It types `settle-accepted-withdrawal` and `reclaim-failed-withdrawal` as
;; `(response bool uint)`. Max 500 returns the refunded sats there,
;; `(response uint uint)`, and `impl-trait` compares signatures exactly, so
;; those two functions return `(ok true)` in this contract (design decision
;; 15). The refund amount stays in their print events. This is the one
;; deliberate departure from the Max 500 public surface.
(impl-trait 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.reward-claim-signer-manager-trait.reward-claim-signer-manager-trait)

;; ---------------------------------------------------------------- errors
;; Max 500 codes, unchanged.
(define-constant ERR_NO_CLAIMABLE_REWARDS (err u1001))
(define-constant ERR_UNAUTHORIZED_ADMIN (err u1002))
(define-constant ERR_INVALID_CALLDATA (err u1003))
(define-constant ERR_INVALID_POX_ADDR (err u1004))
(define-constant ERR_INVALID_FEES_BIPS (err u1005))
(define-constant ERR_UNAUTHORIZED_CALLER (err u1006))
(define-constant ERR_INSUFFICIENT_FEES (err u1007))
(define-constant ERR_UNKNOWN_WITHDRAWAL_REQUEST (err u1008))
(define-constant ERR_WITHDRAWAL_NOT_REJECTED (err u1009))
(define-constant ERR_NO_REFUNDS (err u1010))
(define-constant ERR_WITHDRAWAL_NOT_ACCEPTED (err u1011))
(define-constant ERR_BELOW_DUST_LIMIT (err u1012))
(define-constant ERR_BELOW_MIN_CLAIM (err u1013))
(define-constant ERR_INVALID_MIN_CLAIM (err u1014))
(define-constant ERR_CANNOT_REMOVE_SELF (err u1015))
(define-constant ERR_NO_PENDING_PAYOUT (err u1016))
(define-constant ERR_NO_REFUND_CREDIT (err u1017))
;; New codes.
;; The (staker, cycle, bond-index) was settled before and nothing accrued since.
(define-constant ERR_NOTHING_TO_SETTLE (err u1018))
;; The staker's STX epoch has not been fully converted yet.
(define-constant ERR_CONVERSION_PENDING (err u1019))
;; No enabled route produced a quote, or every enabled route's swap failed.
(define-constant ERR_NO_ROUTE (err u1020))
;; Realized STX out is below the caller's `min-stx-out`.
(define-constant ERR_SLIPPAGE (err u1021))
;; No unconverted sats in the epoch being converted.
(define-constant ERR_NOTHING_TO_CONVERT (err u1022))
;; Route id is not 1 or 2.
(define-constant ERR_UNKNOWN_ROUTE (err u1023))
;; The contract does not hold enough STX for the payout.
(define-constant ERR_INSUFFICIENT_STX_BALANCE (err u1024))
;; The contract does not hold enough sBTC for the payout.
(define-constant ERR_INSUFFICIENT_SBTC_BALANCE (err u1025))
;; A zero amount where a positive one is required.
(define-constant ERR_INVALID_AMOUNT (err u1026))
;; The staker already has sats pending in an older epoch that is still
;; converting; settle again once `convert` has closed that epoch.
(define-constant ERR_EPOCH_STILL_CONVERTING (err u1027))
;; Nothing sweepable on the STX side.
(define-constant ERR_NO_STX_TO_SWEEP (err u1028))
;; A settlement booked sats the signer has not pulled yet (see `settle-core`);
;; call `claim-rewards` for that cycle, then retry.
(define-constant ERR_UNFUNDED_SETTLEMENT (err u1029))
;; `claim-rewards` has never pulled this (cycle, bond-index).
(define-constant ERR_CYCLE_NOT_PULLED (err u1030))
;; The route moved fewer sats than the tranche. Conversions are fill or fail:
;; the whole transaction rolls back and nothing changed.
(define-constant ERR_PARTIAL_FILL (err u1031))
;; u1032 and u1033 belong to the Jing build.
;; A non-admin may abandon the convert epoch only once it is stranded: no
;; progress for STRANDED_EPOCH_BURN_BLOCKS burn blocks (design decision 14).
(define-constant ERR_EPOCH_NOT_STRANDED (err u1034))

(define-constant MAX_FEE_BIPS u500)
(define-constant BIPS_DENOMINATOR u10000)
(define-constant FEE_ACTIVATION_DELAY_CYCLES u2)
(define-constant DUST_LIMIT u546)
;; A conversion may not realize less than this many bips under the best
;; quote of its own transaction (design decision 3, fallback bound).
(define-constant MAX_FALLBACK_BIPS u300)
;; Burn blocks without progress after which anyone may abandon the convert
;; epoch (design decision 14): two pox-5 reward cycles of 2100 burn blocks.
(define-constant STRANDED_EPOCH_BURN_BLOCKS u4200)

;; Route ids.
(define-constant ROUTE_DLMM u1)
(define-constant ROUTE_VELAR u2)
;; Bins walked per `convert` on the DLMM route; DLMM_STEPS drives both the
;; swap walk and the quote walk.
(define-constant DLMM_MAX_BINS u10)
(define-constant DLMM_STEPS (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9))
;; Mirrors of dlmm-core-v-1-1 constants used by the quote.
(define-constant DLMM_FEE_SCALE_BPS u10000)
(define-constant DLMM_PRICE_SCALE_BPS u100000000)
(define-constant DLMM_CENTER_BIN_ID 500)
(define-constant DLMM_MAX_BIN_ID 500)
;; Scale of the `convert` rate floor: micro-STX per sat times 1e8.
(define-constant RATE_SCALE u100000000)

;; ------------------------------------------------------------- Max 500 state
(define-map admins
  principal
  bool
)
(map-set admins tx-sender true)

;; Principals allowed to call `convert` besides admins (an operator bot key
;; that holds no admin power). Set with `set-converter`.
(define-map converters
  principal
  bool
)

(define-data-var fees-bips uint u0)
(define-data-var pending-fees-bips uint u0)
(define-data-var pending-fees-cycle uint u0)
(define-data-var earned-fees uint u0)

(define-map fee-bips-for-cycle
  {
    reward-cycle: uint,
    bond-index: (optional uint),
  }
  uint
)

(define-map payout-configs
  principal
  {
    pox-addr: {
      version: (buff 1),
      hashbytes: (buff 32),
    },
    max-fee: uint,
    min-claim: uint,
  }
)

(define-map withdrawal-requests
  uint
  principal
)
(define-data-var withdrawal-liability uint u0)

(define-map unclaimed-rewards-for-cycle
  {
    reward-cycle: uint,
    bond-index: (optional uint),
  }
  uint
)
(define-data-var total-unclaimed-rewards uint u0)

(define-map pending-payouts
  principal
  uint
)
(define-data-var total-pending-payouts uint u0)

;; Sats settled to stakers beyond what the cycle's pulled reserve covered
;; (accrual since the last pull). Funded first by the next `claim-rewards`.
(define-map cycle-deficits
  {
    reward-cycle: uint,
    bond-index: (optional uint),
  }
  uint
)
(define-data-var total-deficit uint u0)

(define-map staker-refunds
  principal
  uint
)
(define-data-var credited-refunds uint u0)

;; ---------------------------------------------------------------- new state
;; Stakers who elected STX. Absent or false means sBTC or BTC per
;; `payout-configs`.
(define-map stx-elections
  principal
  bool
)

;; (staker, cycle, bond-index) settled at least once by this contract. Only
;; used to pick ERR_NOTHING_TO_SETTLE over ERR_NO_CLAIMABLE_REWARDS.
(define-map settled
  {
    staker: principal,
    reward-cycle: uint,
    bond-index: (optional uint),
  }
  bool
)

;; Conversion epochs. `open-epoch` receives new STX settlements.
;; `convert-epoch` is the oldest epoch not yet fully converted. When a tranche
;; converts against the open epoch, the open epoch advances so later
;; settlements never dilute a rate that is already partly realized.
(define-data-var open-epoch uint u1)
(define-data-var convert-epoch uint u1)
(define-map epochs
  uint
  {
    sats-total: uint,
    sats-converted: uint,
    ustx-out: uint,
    sats-crystallized: uint,
    ustx-crystallized: uint,
    closed: bool,
    ;; Sats an abandoned epoch pays back as sBTC pro rata (design 14).
    sats-refund: uint,
    ;; Burn height of the last progress on this epoch: first settlement into
    ;; it, each conversion tranche, and in the Jing build each order placed
    ;; or re-priced. The stranded clock (design 14) runs from here.
    progress-burn-height: uint,
  }
)

;; Per staker: sats settled but not yet converted, tagged with their epoch.
(define-map stx-pending
  principal
  {
    sats: uint,
    epoch: uint,
  }
)
;; Per staker: micro-STX crystallized at a closed epoch's rate, awaiting
;; `payout`.
(define-map stx-owed
  principal
  uint
)

;; sBTC settled for STX electors and not yet swapped. Reserved from
;; `sweep-fee-refunds`.
(define-data-var pending-conversion-sats uint u0)
;; Micro-STX received from conversions and not yet paid out, including the
;; flooring remainder that is never paid to anyone. Reserved from `sweep-stx`.
(define-data-var ustx-liability uint u0)

;; Conversion log.
(define-data-var last-conversion-id uint u0)
(define-map conversions
  uint
  {
    epoch: uint,
    route: uint,
    sats-in: uint,
    ustx-out: uint,
    quote-dlmm: (optional uint),
    quote-velar: (optional uint),
    burn-height: uint,
    stacks-height: uint,
    caller: principal,
  }
)

;; Route toggles. Principals are constants; only the enabled flag is mutable.
(define-map routes-enabled
  uint
  bool
)
(map-set routes-enabled ROUTE_DLMM true)
(map-set routes-enabled ROUTE_VELAR true)

;; ============================================================ pox-5 callback
;; Callback from a pox-5 `stake` or `stake-update` transaction. Calldata:
;;   v3: consensus serialization of `{stx-payout: bool}` -> STX election
;;       (true) or clear everything (false).
;;   v2: `{pox-addr, max-fee, min-claim}` -> BTC payout config.
;;   v1: `{pox-addr, max-fee}` -> BTC payout config with `default-min-claim`.
;;   none: clear both the BTC config and the STX election (Max 500 behaviour).
(define-public (validate-stake!
    (staker principal)
    ;; #[allow(unused_binding)]
    (first-index uint)
    ;; #[allow(unused_binding)]
    (num-indexes uint)
    ;; #[allow(unused_binding)]
    (amount-ustx uint)
    ;; #[allow(unused_binding)]
    (amount-sats uint)
    ;; #[allow(unused_binding)]
    (is-bond bool)
    (signer-calldata (optional (buff 500)))
  )
  (begin
    (try! (authorize-pox-5))
    (match signer-calldata
      calldata
      (match (parse-stx-calldata calldata)
        stx-config (begin
          (if (get stx-payout stx-config)
            (begin
              (map-delete payout-configs staker)
              (map-set stx-elections staker true)
            )
            (begin
              (map-delete payout-configs staker)
              (map-delete stx-elections staker)
            )
          )
          true
        )
        (begin
          (try! (store-payout-config staker calldata))
          (map-delete stx-elections staker)
          true
        )
      )
      (begin
        (map-delete payout-configs staker)
        (map-delete stx-elections staker)
      )
    )
    ;; The payout kind this stake now has, so a wallet that passed no calldata
    ;; on a top-up can see the election it cleared (design decision 11).
    (print {
      topic: "validate-stake",
      staker: staker,
      currency: (get-payout-currency staker),
      is-bond: is-bond,
    })
    (ok true)
  )
)

;; ============================================== staker payout configuration
;; Max 500, unchanged. Setting a BTC config clears an STX election.
(define-public (set-payout-config
    (pox-addr {
      version: (buff 1),
      hashbytes: (buff 32),
    })
    (max-fee uint)
    (min-claim uint)
  )
  (let ((config {
      pox-addr: pox-addr,
      max-fee: max-fee,
      min-claim: min-claim,
    }))
    (asserts! (is-eq contract-caller tx-sender) ERR_UNAUTHORIZED_CALLER)
    (try! (check-payout-config config))
    (map-set payout-configs tx-sender config)
    (map-delete stx-elections tx-sender)
    (print {
      topic: "set-payout-config",
      staker: tx-sender,
      config: config,
    })
    (ok true)
  )
)

;; Max 500, extended: clears both the BTC config and the STX election.
(define-public (clear-payout-config)
  (begin
    (asserts! (is-eq contract-caller tx-sender) ERR_UNAUTHORIZED_CALLER)
    (map-delete stx-elections tx-sender)
    (print {
      topic: "clear-payout-config",
      staker: tx-sender,
    })
    (ok (map-delete payout-configs tx-sender))
  )
)

;; New. Elect (true) or drop (false) STX payouts for the caller. Electing
;; clears any BTC config. Staker only, same gate as `set-payout-config`.
(define-public (set-stx-payout (enabled bool))
  (begin
    (asserts! (is-eq contract-caller tx-sender) ERR_UNAUTHORIZED_CALLER)
    (if enabled
      (begin
        (map-delete payout-configs tx-sender)
        (map-set stx-elections tx-sender true)
      )
      (map-delete stx-elections tx-sender)
    )
    (print {
      topic: "set-stx-payout",
      staker: tx-sender,
      enabled: enabled,
    })
    (ok true)
  )
)

;; ============================================================ signer rewards
;; Max 500, unchanged.
(define-public (claim-rewards
    (bond-periods (list 6 uint))
    (reward-cycle uint)
  )
  (let (
      (active-bips (get-active-fee-bips))
      (result (try! (contract-call? 'ST000000000000000000002AMW42H.pox-5 claim-rewards
        bond-periods reward-cycle
      )))
      (stx-key {
        reward-cycle: reward-cycle,
        bond-index: none,
      })
    )
    (map-insert fee-bips-for-cycle stx-key active-bips)
    (credit-cycle-bucket stx-key (get earned (get stx-rewards result)))
    (fold snapshot-bond-rewards (get bond-rewards result) {
      reward-cycle: reward-cycle,
      bips: active-bips,
    })
    ;; pox-5 reports the stx part, the bond parts and their sum. Anything it
    ;; sent beyond the parts it itemized stays reserved (Max 500 reserved the
    ;; whole `total-rewards`); it is never sweepable.
    (let (
        (attributed (+ (get earned (get stx-rewards result)) (get bond-totals result)))
        (total (get total-rewards result))
      )
      (if (> total attributed)
        (var-set total-unclaimed-rewards (+ (var-get total-unclaimed-rewards) (- total attributed)))
        true
      )
    )
    (ok result)
  )
)

;; Max 500, unchanged.
(define-read-only (get-earned-staker-rewards
    (staker principal)
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (let (
      (earned-before-fees (contract-call? 'ST000000000000000000002AMW42H.pox-5
        get-earned-staker-rewards current-contract reward-cycle bond-index
        staker
      ))
      (fees (/ (* earned-before-fees (get-fee-bips-for-cycle reward-cycle bond-index))
        BIPS_DENOMINATOR
      ))
    )
    {
      earned: (- earned-before-fees fees),
      fees: fees,
    }
  )
)

;; Max 500 signature and return, unchanged: (response uint uint) with the
;; net sats settled. Body shared with the batch path (`settle-core`).
(define-public (settle-staker-rewards
    (staker principal)
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (settle-core staker reward-cycle bond-index)
)

;; Max 500 signature and return, unchanged:
;; (response {amount: uint, withdrawal-request: (optional uint)} uint).
;; `amount` is in the payout currency's base unit: sats for sBTC and BTC
;; payouts, micro-STX for STX payouts.
(define-public (payout (staker principal))
  (payout-core staker)
)

;; Max 500 signature and return, unchanged. See design decision 8.
(define-public (claim-staker-rewards
    (staker principal)
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (let ((settled-sats (try! (settle-core staker reward-cycle bond-index))))
    (match (payout-core staker)
      result (ok {
        earned: (get amount result),
        withdrawal-request: (get withdrawal-request result),
      })
      ;; Two outcomes keep the settle and pay later: the STX epoch is still
      ;; converting (u1019), or this settle itself opened a cycle deficit that
      ;; the next `claim-rewards` pull clears (u1029). Anything else fails
      ;; the whole call, settle included.
      code (if (or (is-eq code u1019) (is-eq code u1029))
        (begin
          (print {
            topic: (if (is-eq code u1019) "claim-awaiting-conversion" "claim-unfunded"),
            staker: staker,
            reward-cycle: reward-cycle,
            bond-index: bond-index,
            settled-sats: settled-sats,
          })
          (ok {
            earned: settled-sats,
            withdrawal-request: none,
          })
        )
        (err code)
      )
    )
  )
)

;; ================================================================ batching
;; Up to 200 settlements in one transaction. Each entry is isolated: its
;; preconditions are checked before any write, pox-5 is called once per
;; entry, and one `zc-settle-ok` or `zc-settle-err` event is printed per
;; entry in the exact shape of zc-claim-helper-v2. Permissionless.
(define-public (settle-many
    (entries (list 200 {
      staker: principal,
      reward-cycle: uint,
      bond-index: (optional uint),
    }))
  )
  (let (
      (results (map settle-entry entries))
      (result {
        topic: "settle-many",
        manager: current-contract,
        submitted: (len entries),
        ok-count: (fold + (map get-ok-count results) u0),
        err-count: (fold + (map get-err-count results) u0),
      })
    )
    (print result)
    (ok result)
  )
)

;; Up to 200 payouts in one transaction, same isolation and event shapes.
(define-public (payout-many (stakers (list 200 principal)))
  (let (
      (results (map payout-entry stakers))
      (result {
        topic: "payout-many",
        manager: current-contract,
        submitted: (len stakers),
        ok-count: (fold + (map get-ok-count results) u0),
        err-count: (fold + (map get-err-count results) u0),
      })
    )
    (print result)
    (ok result)
  )
)

(define-private (settle-entry (e {
  staker: principal,
  reward-cycle: uint,
  bond-index: (optional uint),
}))
  (match (settle-core (get staker e) (get reward-cycle e) (get bond-index e))
    r (begin
      (print {
        topic: "zc-settle-ok",
        staker: (get staker e),
        reward-cycle: (get reward-cycle e),
        settled: r,
      })
      {
        ok: u1,
        err: u0,
      }
    )
    c (begin
      (print {
        topic: "zc-settle-err",
        staker: (get staker e),
        reward-cycle: (get reward-cycle e),
        code: c,
      })
      {
        ok: u0,
        err: u1,
      }
    )
  )
)

(define-private (payout-entry (staker principal))
  (match (payout-core staker)
    r (begin
      (print {
        topic: "zc-payout-ok",
        staker: staker,
        amount: (get amount r),
        withdrawal-request: (get withdrawal-request r),
      })
      {
        ok: u1,
        err: u0,
      }
    )
    c (begin
      (print {
        topic: "zc-payout-err",
        staker: staker,
        code: c,
      })
      {
        ok: u0,
        err: u1,
      }
    )
  )
)

(define-private (get-ok-count (r {
  ok: uint,
  err: uint,
}))
  (get ok r)
)

(define-private (get-err-count (r {
  ok: uint,
  err: uint,
}))
  (get err r)
)

;; ============================================================ settle core
;; Check-then-write settlement of one (staker, cycle, bond-index).
;;
;; Order matters for batch isolation:
;;   1. `earned` is computed through the read-only path. pox-5's
;;      `settle-staker-rewards` computes exactly `get-earned-staker-rewards`
;;      for the same inputs in the same transaction, so this equals what the
;;      pox-5 call below will return.
;;   2. Every assert runs before the pox-5 call. If one fails, nothing has
;;      been written anywhere.
;;   3. pox-5 `claim-staker-rewards-for-signer` (zeroes the staker's pending
;;      there). If it errs, pox-5 rolled back its own writes.
;;   4. This contract's writes, which cannot fail.
(define-private (settle-core
    (staker principal)
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (let (
      (key {
        staker: staker,
        reward-cycle: reward-cycle,
        bond-index: bond-index,
      })
      (bucket-key {
        reward-cycle: reward-cycle,
        bond-index: bond-index,
      })
      (bucket (default-to u0 (map-get? unclaimed-rewards-for-cycle bucket-key)))
      (is-stx (is-stx-elector staker))
      (existing (map-get? stx-pending staker))
    )
    ;; -- local preconditions, no pox-5 load
    ;; The fee snapshot exists exactly when `claim-rewards` has pulled this
    ;; (cycle, bond-index) at least once.
    (asserts! (is-some (map-get? fee-bips-for-cycle bucket-key))
      ERR_CYCLE_NOT_PULLED
    )
    ;; An STX elector with sats in an older epoch that is still converting
    ;; cannot be settled into a new epoch until the old one closes (or is
    ;; crystallizable, which `crystallize` handles below).
    (asserts! (or (not is-stx) (stx-pending-mergeable existing))
      ERR_EPOCH_STILL_CONVERTING
    )
    ;; -- the one external call: pox-5 zeroes the staker's pending there and
    ;; returns what it was. A zero result zeroed nothing, so refusing after it
    ;; loses nothing.
    (let (
        (info (try! (contract-call? 'ST000000000000000000002AMW42H.pox-5
          claim-staker-rewards-for-signer staker reward-cycle bond-index
        )))
        (gross (get earned info))
        (fees (/ (* gross (get-fee-bips-for-cycle reward-cycle bond-index))
          BIPS_DENOMINATOR
        ))
        (earned (- gross fees))
        ;; The part of `gross` this cycle's pulled reserve covers. Anything
        ;; above it accrued at a distribution the signer has not pulled yet;
        ;; it is booked as a deficit that the next `claim-rewards` funds
        ;; first. Until every deficit is funded, payouts and conversions are
        ;; gated (ERR_UNFUNDED_SETTLEMENT), so no staker can be paid with
        ;; another staker's sBTC.
        (covered (if (< bucket gross) bucket gross))
        (short (- gross covered))
      )
      (asserts! (> earned u0)
        (if (default-to false (map-get? settled key))
          ERR_NOTHING_TO_SETTLE
          ERR_NO_CLAIMABLE_REWARDS
        ))
      ;; -- writes
      (map-set settled key true)
      (var-set earned-fees (+ (var-get earned-fees) fees))
      (map-set unclaimed-rewards-for-cycle bucket-key (- bucket covered))
      (var-set total-unclaimed-rewards (- (var-get total-unclaimed-rewards) covered))
      (if (> short u0)
        (begin
          (map-set cycle-deficits bucket-key
            (+ (default-to u0 (map-get? cycle-deficits bucket-key)) short)
          )
          (var-set total-deficit (+ (var-get total-deficit) short))
        )
        true
      )
      (if is-stx
        (book-stx-settlement staker earned)
        (begin
          (map-set pending-payouts staker (+ (get-pending-payout staker) earned))
          (var-set total-pending-payouts (+ (var-get total-pending-payouts) earned))
        )
      )
      (print {
        topic: "settle-staker-rewards",
        staker: staker,
        reward-cycle: reward-cycle,
        bond-index: bond-index,
        earned: earned,
        fees: fees,
        pending-payout: (if is-stx
          (get-stx-pending-sats staker)
          (get-pending-payout staker)
        ),
      })
      (ok earned)
    )
  )
)

;; Book an STX elector's net sats into the open epoch. Crystallizes an older
;; closed epoch first. Caller has already asserted `stx-pending-mergeable`.
(define-private (book-stx-settlement
    (staker principal)
    (sats uint)
  )
  (let (
      (epoch (var-get open-epoch))
      (e (get-epoch-or-empty epoch))
    )
    (crystallize staker)
    (map-set stx-pending staker {
      sats: (+ (get-stx-pending-sats staker) sats),
      epoch: epoch,
    })
    (map-set epochs epoch (merge e {
      sats-total: (+ (get sats-total e) sats),
      ;; The first settlement into an epoch starts its stranded clock.
      progress-burn-height: (if (is-eq (get sats-total e) u0)
        burn-block-height
        (get progress-burn-height e)
      ),
    }))
    (var-set pending-conversion-sats (+ (var-get pending-conversion-sats) sats))
    true
  )
)

;; True when a new settlement can be merged for this staker: no pending entry,
;; an entry in the open epoch, or an entry in a closed epoch (crystallizable).
(define-private (stx-pending-mergeable (existing (optional {
  sats: uint,
  epoch: uint,
})))
  (match existing
    p (or
      (is-eq (get epoch p) (var-get open-epoch))
      (get closed (get-epoch-or-empty (get epoch p)))
    )
    true
  )
)

;; Move a staker's sats from a CLOSED epoch into `stx-owed` at that epoch's
;; realized rate, floored. No-op when the staker has no pending entry or the
;; entry's epoch is not closed.
;; Move a staker's sats from a CLOSED epoch into `stx-owed` at that epoch's
;; realized rate, floored, and any abandoned share back into `pending-payouts`
;; as sBTC, floored. No-op when the staker has no pending entry or the entry's
;; epoch is not closed. Both flooring remainders stay in the liabilities.
(define-private (crystallize (staker principal))
  (match (map-get? stx-pending staker)
    p (let ((e (get-epoch-or-empty (get epoch p))))
      (if (and (get closed e) (> (get sats-total e) u0))
        (let (
            (ustx (/ (* (get sats p) (get ustx-out e)) (get sats-total e)))
            (sats-back (/ (* (get sats p) (get sats-refund e)) (get sats-total e)))
          )
          (map-delete stx-pending staker)
          (map-set stx-owed staker (+ (get-stx-owed staker) ustx))
          (if (> sats-back u0)
            (begin
              (map-set pending-payouts staker (+ (get-pending-payout staker) sats-back))
              (var-set total-pending-payouts (+ (var-get total-pending-payouts) sats-back))
              (var-set pending-conversion-sats (- (var-get pending-conversion-sats) sats-back))
            )
            true
          )
          (map-set epochs (get epoch p) (merge e {
            sats-crystallized: (+ (get sats-crystallized e) (get sats p)),
            ustx-crystallized: (+ (get ustx-crystallized e) ustx),
          }))
          (print {
            topic: "crystallize",
            staker: staker,
            epoch: (get epoch p),
            sats: (get sats p),
            ustx: ustx,
            sats-back: sats-back,
          })
          true
        )
        false
      )
    )
    false
  )
)

;; ============================================================ payout core
;; Check-then-transfer-then-write payout of everything a staker has settled.
;; sBTC and BTC pending (Max 500 semantics) is paid first; when there is
;; none, crystallized STX is paid. `amount` is sats for the first two kinds
;; and micro-STX for STX.
(define-private (payout-core (staker principal))
  (let ((sats (begin
      ;; An abandoned epoch's sBTC leg lands in `pending-payouts` here.
      (crystallize staker)
      (get-pending-payout staker)
    )))
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (if (> sats u0)
      (match (payout-sats staker sats)
        r (ok r)
        ;; The sats leg refuses before any write (floor, dust, balance). If
        ;; the staker also has claimable STX, pay that instead of failing.
        code (if (> (get-stx-claimable staker) u0)
          (payout-stx staker)
          (err code)
        )
      )
      (payout-stx staker)
    )
  )
)

(define-private (payout-sats
    (staker principal)
    (amount uint)
  )
  (let (
      (config (get-payout-config staker))
      (balance (unwrap-panic (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        get-balance current-contract
      )))
    )
    ;; -- preconditions
    (asserts!
      (or
        (is-eq tx-sender staker)
        (match config
          l1-info (>= amount (get min-claim l1-info))
          true
        )
      )
      ERR_BELOW_MIN_CLAIM
    )
    (asserts! (>= balance amount) ERR_INSUFFICIENT_SBTC_BALANCE)
    (match config
      l1-info (asserts! (> amount (+ (get max-fee l1-info) DUST_LIMIT))
        ERR_BELOW_DUST_LIMIT
      )
      true
    )
    ;; -- the transfer (or L1 withdrawal request); nothing written yet
    (let ((withdrawal-request (try! (as-contract?
        ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
          "sbtc-token" amount
        ))
        (match config
          l1-info (let (
              (max-fee (get max-fee l1-info))
              (withdrawal-amount (- amount max-fee))
              (request-id (try! (contract-call?
                'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-withdrawal
                initiate-withdrawal-request withdrawal-amount
                (get pox-addr l1-info) max-fee
              )))
            )
            (print {
              topic: "payout",
              amount-sats: amount,
              l1-withdrawal: (some (merge l1-info {
                withdrawal-request: request-id,
                amount: withdrawal-amount,
              })),
              staker: staker,
            })
            (some request-id)
          )
          (begin
            (print {
              topic: "payout",
              amount-sats: amount,
              l1-withdrawal: none,
              staker: staker,
            })
            (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
              transfer amount tx-sender staker none
            ))
            none
          )
        )))))
      ;; -- writes
      (map-delete pending-payouts staker)
      (var-set total-pending-payouts (- (var-get total-pending-payouts) amount))
      (match withdrawal-request
        request-id (begin
          (map-set withdrawal-requests request-id staker)
          (var-set withdrawal-liability (+ (var-get withdrawal-liability) amount))
        )
        true
      )
      (ok {
        amount: amount,
        withdrawal-request: withdrawal-request,
      })
    )
  )
)

(define-private (payout-stx (staker principal))
  (let (
      (amount (get-stx-claimable staker))
      (pending (map-get? stx-pending staker))
    )
    ;; -- preconditions (read-only; `get-stx-claimable` is what `crystallize`
    ;; will move)
    (asserts! (> amount u0)
      (if (is-some pending)
        ERR_CONVERSION_PENDING
        ERR_NO_PENDING_PAYOUT
      ))
    (asserts! (>= (stx-get-balance current-contract) amount)
      ERR_INSUFFICIENT_STX_BALANCE
    )
    ;; -- the transfer
    (try! (as-contract?
      ((with-stx amount))
      (try! (stx-transfer? amount tx-sender staker))
    ))
    ;; -- writes
    (crystallize staker)
    (map-delete stx-owed staker)
    (var-set ustx-liability (- (var-get ustx-liability) amount))
    (print {
      topic: "payout-stx",
      amount-ustx: amount,
      staker: staker,
    })
    (ok {
      amount: amount,
      withdrawal-request: none,
    })
  )
)

;; ========================================================= abandon epoch
;; Close the convert epoch without converting the rest (design 14). What was
;; converted pays out in STX at the blended rate; the remaining sats pay back
;; as sBTC pro rata through the Max 500 `pending-payouts` leg. An admin may
;; call it at any time; anyone may call it once the epoch is stranded, that
;; is STRANDED_EPOCH_BURN_BLOCKS burn blocks after its last progress
;; (`authorize-admin-or-stranded`). Refused when nothing is pending, and in
;; the Jing build while a Jing order is open (`jing-cancel` first, which is
;; also open to anyone once the epoch is stranded). Abandoning can only give
;; stakers the sBTC they would have received without an election, so the
;; permissionless path moves nothing to the caller.
(define-public (abandon-epoch)
  (let (
      (epoch (var-get convert-epoch))
      (e (get-epoch-or-empty epoch))
      (remaining (- (get sats-total e) (get sats-converted e)))
    )
    (try! (authorize-admin-or-stranded))
    (asserts! (> remaining u0) ERR_NOTHING_TO_CONVERT)
    (if (is-eq epoch (var-get open-epoch))
      (var-set open-epoch (+ epoch u1))
      true
    )
    (map-set epochs epoch (merge e {
      closed: true,
      sats-refund: remaining,
    }))
    (var-set convert-epoch (+ epoch u1))
    (print {
      topic: "abandon-epoch",
      epoch: epoch,
      sats-total: (get sats-total e),
      sats-converted: (get sats-converted e),
      ustx-out: (get ustx-out e),
      sats-refund: remaining,
      by-admin: (is-ok (authorize-admin)),
    })
    (ok {
      epoch: epoch,
      sats-converted: (get sats-converted e),
      ustx-out: (get ustx-out e),
      sats-refund: remaining,
    })
  )
)

;; ============================================================== conversion
;; Convert up to `amount-sats` of the oldest unconverted epoch into STX.
;; Permissionless. `min-stx-out` is the caller's floor for the realized
;; output of THIS tranche. Quotes both routes, executes the better one, falls
;; back to the other if the swap fails. Records the conversion and closes the
;; epoch when its last sat is converted.
;; Convert up to `amount-sats` of the oldest unconverted epoch into STX.
;; Callable by an admin or an enabled converter (see `set-converter`).
;; FILL OR FAIL: the tranche is swapped in full or the transaction fails
;; (ERR_PARTIAL_FILL); a route whose quote cannot fill the whole tranche is
;; not a candidate. `min-ustx-per-sat-x8` is the caller's floor rate in
;; micro-STX per sat scaled by RATE_SCALE (1e8). Quotes both routes inside the
;; transaction, executes the one with more STX out, falls back to the other
;; route only if the first swap fails outright (nothing moved). Records the
;; conversion and closes the epoch when its last sat is converted. A tranche
;; smaller than the epoch is the operator's choice; stakers never see it: a
;; staker is paid once, at the epoch's blended rate, after the epoch closes.
(define-public (convert
    (amount-sats uint)
    (min-ustx-per-sat-x8 uint)
  )
  (let (
      (epoch (var-get convert-epoch))
      (e (get-epoch-or-empty epoch))
      (remaining (- (get sats-total e) (get sats-converted e)))
      (amount (if (< amount-sats remaining) amount-sats remaining))
      (quote-a (quote-dlmm-raw amount))
      (quote-b (quote-velar amount))
      (out-a (match quote-a q (get out q) u0))
      (filled-a (match quote-a q (get filled q) u0))
      (out-b (default-to u0 quote-b))
      ;; DLMM is a candidate only when its walk fills the whole tranche.
      (a-full (and (> filled-a u0) (is-eq filled-a amount)))
      (a-better (and a-full (>= out-a out-b)))
      (best-quote (if a-better out-a out-b))
    )
    (try! (authorize-converter))
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (asserts! (> remaining u0) ERR_NOTHING_TO_CONVERT)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (or a-full (is-some quote-b)) ERR_NO_ROUTE)
    ;; Freeze the epoch: settlements from here on go to the next one.
    (if (is-eq epoch (var-get open-epoch))
      (var-set open-epoch (+ epoch u1))
      true
    )
    (let (
        (first (if a-better ROUTE_DLMM ROUTE_VELAR))
        ;; The fallback route must also be able to fill the tranche.
        (second (if a-better
          (if (is-some quote-b) ROUTE_VELAR ROUTE_DLMM)
          (if a-full ROUTE_DLMM ROUTE_VELAR)
        ))
        (result (match (execute-route first amount)
          r1 (ok r1)
          c1 (if (is-eq second first)
            (err c1)
            (match (execute-route second amount)
              r2 (ok r2)
              c2 (err c2)
            )
          )
        ))
        (swap (try! result))
        (sats-in (get sats-in swap))
        (ustx-out (get ustx-out swap))
        (route (get route swap))
        (id (+ (var-get last-conversion-id) u1))
        (converted (+ (get sats-converted e) sats-in))
        (closed (is-eq converted (get sats-total e)))
      )
      (asserts! (> sats-in u0) ERR_NO_ROUTE)
      ;; Fill or fail.
      (asserts! (is-eq sats-in amount) ERR_PARTIAL_FILL)
      ;; A conversion that yields nothing is refused whatever the floor.
      (asserts! (> ustx-out u0) ERR_SLIPPAGE)
      ;; Rate floor: ustx-out / sats-in >= min / RATE_SCALE.
      (asserts! (>= (* ustx-out RATE_SCALE) (* min-ustx-per-sat-x8 sats-in)) ERR_SLIPPAGE)
      ;; Fallback bound: the realized output may not sit more than
      ;; MAX_FALLBACK_BIPS under the best quote of this transaction, so a
      ;; fallback route cannot quietly execute far below the route that was
      ;; quoted, whatever floor the caller passed.
      (asserts! (>= (* ustx-out BIPS_DENOMINATOR) (* best-quote (- BIPS_DENOMINATOR MAX_FALLBACK_BIPS)))
        ERR_SLIPPAGE
      )
      (map-set epochs epoch (merge e {
        sats-converted: converted,
        ustx-out: (+ (get ustx-out e) ustx-out),
        closed: closed,
        progress-burn-height: burn-block-height,
      }))
      (if closed
        (var-set convert-epoch (+ epoch u1))
        true
      )
      (var-set pending-conversion-sats (- (var-get pending-conversion-sats) sats-in))
      (var-set ustx-liability (+ (var-get ustx-liability) ustx-out))
      (var-set last-conversion-id id)
      (map-set conversions id {
        epoch: epoch,
        route: route,
        sats-in: sats-in,
        ustx-out: ustx-out,
        quote-dlmm: (if a-full (some out-a) none),
        quote-velar: quote-b,
        burn-height: burn-block-height,
        stacks-height: stacks-block-height,
        caller: tx-sender,
      })
      (print {
        topic: "convert",
        conversion-id: id,
        epoch: epoch,
        route: route,
        sats-in: sats-in,
        ustx-out: ustx-out,
        quote-dlmm: (if a-full (some out-a) none),
        quote-dlmm-filled: filled-a,
        quote-velar: quote-b,
        epoch-closed: closed,
        epoch-sats-total: (get sats-total e),
        epoch-sats-converted: converted,
      })
      (ok {
        conversion-id: id,
        epoch: epoch,
        route: route,
        sats-in: sats-in,
        ustx-out: ustx-out,
        epoch-closed: closed,
      })
    )
  )
)

(define-private (execute-route
    (route uint)
    (amount uint)
  )
  (let (
      (sbtc-before (unwrap-panic (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        get-balance current-contract
      )))
      (stx-before (stx-get-balance current-contract))
    )
    (asserts! (route-enabled route) ERR_NO_ROUTE)
    (if (is-eq route ROUTE_DLMM)
      (swap-dlmm amount)
      (try! (swap-velar amount))
    )
    (let (
        (sbtc-after (unwrap-panic (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
          get-balance current-contract
        )))
        (stx-after (stx-get-balance current-contract))
        (sats-in (- sbtc-before sbtc-after))
      )
      ;; A route that moved nothing is treated as failed so `convert` can
      ;; fall through to the other one. No state changed in that case.
      (asserts! (> sats-in u0) ERR_NO_ROUTE)
      ;; `sats-in` cannot exceed `amount`: every allowance is scoped to the
      ;; tranche. `convert` asserts equality as a public error, which rolls
      ;; the whole transaction back; nothing is asserted here after funds
      ;; have moved.
      (ok {
        route: route,
        sats-in: sats-in,
        ustx-out: (- stx-after stx-before),
      })
    )
  )
)

;; ---------------------------------------------------------- route A: DLMM
;; Walk up to DLMM_MAX_BINS bins. Each `swap-y-for-x` fills at most the
;; active bin and advances it when the bin's STX is exhausted.
(define-private (swap-dlmm (amount uint))
  (let ((final (fold dlmm-step DLMM_STEPS {
      remaining: amount,
      done: false,
    })))
    (- amount (get remaining final))
  )
)

(define-private (dlmm-step
    ;; #[allow(unused_binding)]
    (i uint)
    (state {
      remaining: uint,
      done: bool,
    })
  )
  (if (or (get done state) (is-eq (get remaining state) u0))
    state
    (let (
        (pool (unwrap-panic (contract-call?
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-stx-sbtc-v-1-bps-15
          get-pool-for-swap false
        )))
        (bin (get active-bin-id pool))
        (remaining (get remaining state))
      )
      (match (dlmm-swap-once bin remaining)
        r {
          remaining: (- remaining (get in r)),
          ;; An empty active bin returns in = 0 and advances the bin; the
          ;; next step reads the new active bin. The step list bounds this.
          done: false,
        }
        c (begin
          ;; The core's reason is otherwise lost behind ERR_NO_ROUTE.
          (print {
            topic: "convert-dlmm-step-err",
            bin: bin,
            remaining: remaining,
            code: c,
          })
          {
            remaining: remaining,
            done: true,
          }
        )
      )
    )
  )
)

;; One core swap against the active bin, with the sBTC allowance scoped to
;; this call. Returns the core's `{in, out}` or its error code.
(define-private (dlmm-swap-once
    (bin int)
    (y-amount uint)
  )
  (as-contract?
    ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
      "sbtc-token" y-amount
    ))
    (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1
      swap-y-for-x
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-stx-sbtc-v-1-bps-15
      'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token-stx-v-1-2
      'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
      bin y-amount
    ))
  )
)

;; Read-only estimate of STX out for `amount` sats on the DLMM route, walking
;; the same bins the swap would, with the core's integer arithmetic. `none`
;; when the route is disabled, the pool is disabled in the core, or no bin
;; could be priced.
;; Read-only estimate for `amount` sats on the DLMM route: STX out and the
;; sats the walk could fill within DLMM_MAX_BINS, using the core's integer
;; arithmetic. `none` when the route is disabled, the pool is disabled in the
;; core, a read fails, or no bin could be priced.
;; Read-only estimate for `amount` sats on the DLMM route: STX out and the
;; sats the walk could fill within DLMM_MAX_BINS, using the core's integer
;; arithmetic. `none` when the route is disabled, the pool is disabled in the
;; core, or no bin could be priced.
(define-read-only (quote-dlmm-raw (amount uint))
  (if (or (not (route-enabled ROUTE_DLMM)) (is-eq amount u0))
    none
    ;; The pool's and core's read-onlys below always return `ok` (their err
    ;; type is indeterminate, so `match` is not allowed on them); unwrap-panic
    ;; cannot fire.
    (let (
        (pool (unwrap-panic (contract-call?
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-stx-sbtc-v-1-bps-15
          get-pool-for-swap false
        )))
        ;; dlmm-core-v-1-1 `get-pool-by-id` returns (ok (optional pool)).
        (status (match (unwrap-panic (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1
            get-pool-by-id (get pool-id pool)
          ))
          p (get status p)
          false
        ))
        ;; The core zeroes every fee for an exempt caller; mirror it so the
        ;; quote and the walk agree if this contract is ever exempted.
        (exempt (unwrap-panic (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1
          get-swap-fee-exemption-by-id current-contract (get pool-id pool)
        )))
        (fee (if exempt
          u0
          (+ (get protocol-fee pool) (get provider-fee pool) (get variable-fee pool))
        ))
        (final (fold dlmm-quote-step DLMM_STEPS {
          bin: (get active-bin-id pool),
          remaining: amount,
          out: u0,
          priced: false,
          done: (or (not status) (>= fee DLMM_FEE_SCALE_BPS)),
          fee: fee,
          bin-step: (get bin-step pool),
          initial-price: (get initial-price pool),
        }))
      )
      (if (get priced final)
        (some {
          out: (get out final),
          filled: (- amount (get remaining final)),
        })
        none
      )
    )
  )
)

;; STX out for `amount` sats on the DLMM route (for the sats it can fill).
(define-read-only (quote-dlmm (amount uint))
  (match (quote-dlmm-raw amount)
    q (some (get out q))
    none
  )
)

(define-private (dlmm-quote-step
    ;; #[allow(unused_binding)]
    (i uint)
    (state {
      bin: int,
      remaining: uint,
      out: uint,
      priced: bool,
      done: bool,
      fee: uint,
      bin-step: uint,
      initial-price: uint,
    })
  )
  (if (or (get done state) (is-eq (get remaining state) u0))
    state
    (let (
        (bin (get bin state))
        (unsigned (to-uint (+ bin DLMM_CENTER_BIN_ID)))
        ;; `get-bin-balances` always returns ok (default-to over the map).
        (balances (unwrap-panic (contract-call?
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-stx-sbtc-v-1-bps-15
          get-bin-balances unsigned
        )))
        (x (get x-balance balances))
        (y (get y-balance balances))
        (price-result (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1
          get-bin-price (get initial-price state) (get bin-step state) bin
        ))
      )
      (match price-result
        price (let (
            (fee (get fee state))
            (empty (and (is-eq x u0) (is-eq y u0)))
            (max-y (/ (+ (* x price) (- DLMM_PRICE_SCALE_BPS u1)) DLMM_PRICE_SCALE_BPS))
            (max-y-fees (if (> fee u0)
              (/ (* max-y DLMM_FEE_SCALE_BPS) (- DLMM_FEE_SCALE_BPS fee))
              max-y
            ))
            (use-y (if (>= (get remaining state) max-y-fees)
              max-y-fees
              (get remaining state)
            ))
            (fees-total (/ (* use-y fee) DLMM_FEE_SCALE_BPS))
            (dy (- use-y fees-total))
            (dx-before-cap (/ (* dy DLMM_PRICE_SCALE_BPS) price))
            (dx (if (> dx-before-cap x) x dx-before-cap))
            (x-after (- x dx))
            (advance (and (or (is-eq x-after u0) empty) (< bin DLMM_MAX_BIN_ID)))
          )
          (merge state {
            bin: (if advance (+ bin 1) bin),
            remaining: (if empty (get remaining state) (- (get remaining state) use-y)),
            out: (if empty (get out state) (+ (get out state) dx)),
            priced: true,
            ;; Stop when the bin cannot advance and is empty, exhausted or
            ;; cannot fill, else loop.
            done: (and (not advance) (or empty (is-eq use-y u0) (is-eq x-after u0))),
          })
        )
        code (merge state { done: true })
      )
    )
  )
)

;; --------------------------------------------------------- route B: Velar
(define-private (swap-velar (amount uint))
  (let ((quoted (unwrap! (quote-velar-raw amount) ERR_NO_ROUTE)))
    (as-contract?
      ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        "sbtc-token" amount
      ))
      (let ((event (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-pool-v1_0_0-0070
          swap
          'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.wstx
          'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-fees-v1_0_0-0070
          amount quoted
        ))))
        (get amt-out event)
      )
    )
  )
)

;; Read-only quote for `amount` sats on the Velar route: reserves from the
;; pool, fee split from the fees contract, constant product from univ2-math.
(define-read-only (quote-velar (amount uint))
  (if (or (not (route-enabled ROUTE_VELAR)) (is-eq amount u0))
    none
    (quote-velar-raw amount)
  )
)

(define-read-only (quote-velar-raw (amount uint))
  ;; `get-pool` always returns ok; `calc-fees` and `find-dx` carry err types.
  (let ((pool (unwrap-panic (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-pool-v1_0_0-0070
      get-pool
    ))))
    (match (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-fees-v1_0_0-0070
        calc-fees amount
      )
      f (match (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-math
          find-dx (get reserve0 pool) (get reserve1 pool) (get amt-in-adjusted f)
        )
        dx (if (> dx u0) (some dx) none)
        code none
      )
      code none
    )
  )
)

;; =========================================================== withdrawals
;; Max 500 logic unchanged. Return is `(ok true)` instead of Max 500's
;; `(ok refund)`: adopting the spox trait unchanged was judged more important
;; than preserving that return value (design decision 15). `amount-sats` in
;; the event carries the refund.
(define-public (reclaim-failed-withdrawal (request-id uint))
  (let (
      (staker (unwrap! (map-get? withdrawal-requests request-id)
        ERR_UNKNOWN_WITHDRAWAL_REQUEST
      ))
      (request (unwrap!
        (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-registry
          get-withdrawal-request request-id
        )
        ERR_UNKNOWN_WITHDRAWAL_REQUEST
      ))
      (refund (+ (get amount request) (get max-fee request)))
    )
    (asserts! (is-eq (get status request) (some false))
      ERR_WITHDRAWAL_NOT_REJECTED
    )
    (map-delete withdrawal-requests request-id)
    (var-set withdrawal-liability (- (var-get withdrawal-liability) refund))
    (print {
      topic: "reclaim-failed-withdrawal",
      request-id: request-id,
      staker: staker,
      amount-sats: refund,
    })
    (try! (as-contract?
      ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token "sbtc-token"
        refund
      ))
      (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        transfer refund tx-sender staker none
      ))
    ))
    (ok true)
  )
)

;; Max 500 logic unchanged. Return is `(ok true)` instead of Max 500's
;; `(ok refund)` for the same reason as above (design decision 15);
;; `fee-refund` in the event carries the refund and `get-staker-refund`
;; shows the credited total.
(define-public (settle-accepted-withdrawal (request-id uint))
  (let (
      (staker (unwrap! (map-get? withdrawal-requests request-id)
        ERR_UNKNOWN_WITHDRAWAL_REQUEST
      ))
      (request (unwrap!
        (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-registry
          get-withdrawal-request request-id
        )
        ERR_UNKNOWN_WITHDRAWAL_REQUEST
      ))
      (max-fee (get max-fee request))
      (liability (+ (get amount request) max-fee))
    )
    (asserts! (is-eq (get status request) (some true))
      ERR_WITHDRAWAL_NOT_ACCEPTED
    )
    ;; While a deficit is outstanding the unattributed reading is clamped to
    ;; zero and the refund would be lost to a later sweep; wait for the pull.
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (map-delete withdrawal-requests request-id)
    (var-set withdrawal-liability (- (var-get withdrawal-liability) liability))
    (let ((refund (min-uint max-fee (unattributed-balance))))
      (if (> refund u0)
        (begin
          (map-set staker-refunds staker (+ (get-staker-refund staker) refund))
          (var-set credited-refunds (+ (var-get credited-refunds) refund))
        )
        true
      )
      (print {
        topic: "settle-accepted-withdrawal",
        request-id: request-id,
        staker: staker,
        liability-released: liability,
        fee-refund: refund,
      })
      (ok true)
    )
  )
)

;; Max 500, unchanged.
(define-public (claim-refund (staker principal))
  (let ((refund (get-staker-refund staker)))
    (asserts! (> refund u0) ERR_NO_REFUND_CREDIT)
    (map-delete staker-refunds staker)
    (var-set credited-refunds (- (var-get credited-refunds) refund))
    (print {
      topic: "claim-refund",
      staker: staker,
      amount-sats: refund,
    })
    (try! (as-contract?
      ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token "sbtc-token"
        refund
      ))
      (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        transfer refund tx-sender staker none
      ))
    ))
    (ok refund)
  )
)

;; ============================================================ admin functions
;; Max 500, unchanged (last-admin guard kept).
(define-public (update-admin
    (admin principal)
    (enabled bool)
  )
  (begin
    (try! (authorize-admin))
    (asserts! (or enabled (not (is-eq admin tx-sender))) ERR_CANNOT_REMOVE_SELF)
    (map-set admins admin enabled)
    (print {
      topic: "update-admin",
      admin: admin,
      enabled: enabled,
    })
    (ok admin)
  )
)

;; Max 500, unchanged: cap MAX_FEE_BIPS inclusive, increases delayed
;; FEE_ACTIVATION_DELAY_CYCLES, decreases immediate.
(define-public (update-fees (new-fees uint))
  (let (
      (active (get-active-fee-bips))
      (cycle (current-cycle))
    )
    (try! (authorize-admin))
    (asserts! (<= new-fees MAX_FEE_BIPS) ERR_INVALID_FEES_BIPS)
    (var-set fees-bips active)
    (if (<= new-fees active)
      (begin
        (var-set fees-bips new-fees)
        (var-set pending-fees-bips new-fees)
        (var-set pending-fees-cycle cycle)
      )
      (begin
        (var-set pending-fees-bips new-fees)
        (var-set pending-fees-cycle (+ cycle FEE_ACTIVATION_DELAY_CYCLES))
      )
    )
    (print {
      topic: "update-fees",
      old-fees: active,
      new-fees: new-fees,
      activation-cycle: (var-get pending-fees-cycle),
    })
    (ok true)
  )
)

;; Max 500, unchanged.
(define-public (withdraw-fees
    (amount uint)
    (recipient principal)
  )
  (let ((fees (var-get earned-fees)))
    (try! (authorize-admin))
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (asserts! (<= amount fees) ERR_INSUFFICIENT_FEES)
    (var-set earned-fees (- fees amount))
    (try! (as-contract?
      ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token "sbtc-token"
        amount
      ))
      (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        transfer amount tx-sender recipient none
      ))
    ))
    (ok amount)
  )
)

;; Max 500, unchanged in signature. The reserve now also includes
;; `pending-conversion-sats`, so sBTC settled for STX electors and not yet
;; swapped can never be swept.
(define-public (sweep-fee-refunds (recipient principal))
  (let ((sweepable (unattributed-balance)))
    (try! (authorize-admin))
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (asserts! (> sweepable u0) ERR_NO_REFUNDS)
    (print {
      topic: "sweep-fee-refunds",
      amount-sats: sweepable,
      recipient: recipient,
    })
    (try! (as-contract?
      ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token "sbtc-token"
        sweepable
      ))
      (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        transfer sweepable tx-sender recipient none
      ))
    ))
    (ok sweepable)
  )
)

;; New. Sweep STX that belongs to nobody: the STX balance minus
;; `ustx-liability`. Conversion output, including the flooring remainder,
;; is inside the liability, so this can only ever move STX sent here by
;; mistake.
(define-public (sweep-stx (recipient principal))
  (let ((sweepable (unattributed-stx-balance)))
    (try! (authorize-admin))
    (asserts! (> sweepable u0) ERR_NO_STX_TO_SWEEP)
    (print {
      topic: "sweep-stx",
      amount-ustx: sweepable,
      recipient: recipient,
    })
    (try! (as-contract?
      ((with-stx sweepable))
      (try! (stx-transfer? sweepable tx-sender recipient))
    ))
    (ok sweepable)
  )
)

;; New. Allow or revoke a principal's right to call `convert`.
(define-public (set-converter
    (converter principal)
    (enabled bool)
  )
  (begin
    (try! (authorize-admin))
    (map-set converters converter enabled)
    (print {
      topic: "set-converter",
      converter: converter,
      enabled: enabled,
    })
    (ok true)
  )
)

;; New. Enable or disable one of the two pinned routes.
(define-public (set-route-enabled
    (route uint)
    (enabled bool)
  )
  (begin
    (try! (authorize-admin))
    (asserts! (or (is-eq route ROUTE_DLMM) (is-eq route ROUTE_VELAR)
      )
      ERR_UNKNOWN_ROUTE
    )
    (map-set routes-enabled route enabled)
    (print {
      topic: "set-route-enabled",
      route: route,
      enabled: enabled,
    })
    (ok true)
  )
)

;; Max 500, unchanged.
(define-public (register-self
    (signer-manager <signer-manager-trait>)
    (signer-key (buff 33))
    (auth-id uint)
    (signer-sig (buff 65))
  )
  (begin
    (try! (authorize-admin))
    (try! (contract-call? 'ST000000000000000000002AMW42H.pox-5 grant-signer-key
      signer-key current-contract auth-id signer-sig
    ))
    (contract-call? 'ST000000000000000000002AMW42H.pox-5 register-signer
      signer-manager signer-key
    )
  )
)

;; ============================================================ private helpers
(define-private (authorize-admin)
  (ok (asserts! (and (is-eq contract-caller tx-sender) (is-admin tx-sender))
    ERR_UNAUTHORIZED_ADMIN
  ))
)

(define-private (authorize-converter)
  (ok (asserts!
    (and
      (is-eq contract-caller tx-sender)
      (or (is-admin tx-sender) (is-converter tx-sender))
    )
    ERR_UNAUTHORIZED_ADMIN
  ))
)

;; Admin at any time, anyone once the convert epoch is stranded (design 14).
(define-private (authorize-admin-or-stranded)
  (ok (asserts! (or (is-ok (authorize-admin)) (is-convert-epoch-stranded))
    ERR_EPOCH_NOT_STRANDED
  ))
)

(define-private (authorize-pox-5)
  (ok (asserts! (is-eq contract-caller 'ST000000000000000000002AMW42H.pox-5)
    ERR_UNAUTHORIZED_CALLER
  ))
)

(define-private (store-payout-config
    (staker principal)
    (calldata (buff 500))
  )
  (let ((config (unwrap! (parse-payout-calldata calldata) ERR_INVALID_CALLDATA)))
    (try! (check-payout-config config))
    (map-set payout-configs staker config)
    (ok true)
  )
)

;; Credit a pulled amount to its cycle bucket, paying down that cycle's
;; deficit first. Only the part that reaches the bucket is unclaimed reserve.
(define-private (credit-cycle-bucket
    (key {
      reward-cycle: uint,
      bond-index: (optional uint),
    })
    (amount uint)
  )
  (let (
      (deficit (default-to u0 (map-get? cycle-deficits key)))
      (repaid (if (< amount deficit) amount deficit))
      (to-bucket (- amount repaid))
    )
    (if (> repaid u0)
      (begin
        (map-set cycle-deficits key (- deficit repaid))
        (var-set total-deficit (- (var-get total-deficit) repaid))
      )
      true
    )
    (var-set total-unclaimed-rewards (+ (var-get total-unclaimed-rewards) to-bucket))
    (map-set unclaimed-rewards-for-cycle key
      (+ (default-to u0 (map-get? unclaimed-rewards-for-cycle key)) to-bucket)
    )
  )
)

(define-private (snapshot-bond-rewards
    (bond-info {
      bond-index: uint,
      earned: uint,
      rewards-per-token: uint,
    })
    (acc {
      reward-cycle: uint,
      bips: uint,
    })
  )
  (let ((key {
      reward-cycle: (get reward-cycle acc),
      bond-index: (some (get bond-index bond-info)),
    }))
    (map-insert fee-bips-for-cycle key (get bips acc))
    (credit-cycle-bucket key (get earned bond-info))
    acc
  )
)

;; ============================================================ read-only views
;; Max 500 read-onlys, unchanged.
(define-read-only (is-admin (caller principal))
  (default-to false (map-get? admins caller))
)

(define-read-only (current-cycle)
  (contract-call? 'ST000000000000000000002AMW42H.pox-5 current-pox-reward-cycle)
)

(define-read-only (get-active-fee-bips)
  (if (>= (current-cycle) (var-get pending-fees-cycle))
    (var-get pending-fees-bips)
    (var-get fees-bips)
  )
)

(define-read-only (get-pending-fees)
  {
    pending-bips: (var-get pending-fees-bips),
    activation-cycle: (var-get pending-fees-cycle),
    active-bips: (get-active-fee-bips),
  }
)

(define-read-only (get-fee-bips-for-cycle
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (default-to u0
    (map-get? fee-bips-for-cycle {
      reward-cycle: reward-cycle,
      bond-index: bond-index,
    })
  )
)

(define-read-only (get-earned-fees)
  (var-get earned-fees)
)

(define-read-only (get-withdrawal-liability)
  (var-get withdrawal-liability)
)

(define-read-only (get-unclaimed-staker-rewards)
  (var-get total-unclaimed-rewards)
)

(define-read-only (get-total-deficit)
  (var-get total-deficit)
)

(define-read-only (get-cycle-deficit
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (default-to u0
    (map-get? cycle-deficits {
      reward-cycle: reward-cycle,
      bond-index: bond-index,
    })
  )
)

(define-read-only (get-unclaimed-rewards-for-cycle
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (default-to u0
    (map-get? unclaimed-rewards-for-cycle {
      reward-cycle: reward-cycle,
      bond-index: bond-index,
    })
  )
)

(define-read-only (get-payout-config (staker principal))
  (map-get? payout-configs staker)
)

(define-read-only (get-staker-refund (staker principal))
  (default-to u0 (map-get? staker-refunds staker))
)

(define-read-only (get-pending-payout (staker principal))
  (default-to u0 (map-get? pending-payouts staker))
)

(define-read-only (get-total-pending-payouts)
  (var-get total-pending-payouts)
)

(define-read-only (get-credited-refunds)
  (var-get credited-refunds)
)

(define-read-only (get-withdrawal-request-staker (withdrawal-request uint))
  (map-get? withdrawal-requests withdrawal-request)
)

;; sBTC held by this contract that is not spoken for. Max 500's reserve plus
;; `pending-conversion-sats`.
(define-read-only (unattributed-balance)
  (let (
      (balance (unwrap-panic (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token
        get-balance current-contract
      )))
      (reserved-all (+ (var-get earned-fees) (var-get withdrawal-liability)
        (var-get total-unclaimed-rewards) (var-get credited-refunds)
        (var-get total-pending-payouts) (var-get pending-conversion-sats)
      ))
      (reserved reserved-all)
    )
    (if (>= balance reserved)
      (- balance reserved)
      u0
    )
  )
)

(define-read-only (default-min-claim (max-fee uint))
  (+ max-fee DUST_LIMIT u1)
)

;; Max 500, unchanged: v2 then v1 shapes.
(define-read-only (parse-payout-calldata (calldata (buff 500)))
  (match (from-consensus-buff? {
    pox-addr: {
      version: (buff 1),
      hashbytes: (buff 32),
    },
    max-fee: uint,
    min-claim: uint,
  }
    calldata
  )
    config (some config)
    (match (from-consensus-buff? {
      pox-addr: {
        version: (buff 1),
        hashbytes: (buff 32),
      },
      max-fee: uint,
    }
      calldata
    )
      legacy (some (merge legacy { min-claim: (default-min-claim (get max-fee legacy)) }))
      none
    )
  )
)

;; Max 500, unchanged.
(define-read-only (check-payout-config (config {
  pox-addr: {
    version: (buff 1),
    hashbytes: (buff 32),
  },
  max-fee: uint,
  min-claim: uint,
}))
  (begin
    (asserts!
      (is-ok (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-withdrawal
        validate-recipient (get pox-addr config)
      ))
      ERR_INVALID_POX_ADDR
    )
    (asserts! (> (get min-claim config) (+ (get max-fee config) DUST_LIMIT))
      ERR_INVALID_MIN_CLAIM
    )
    (ok true)
  )
)

(define-read-only (min-uint
    (a uint)
    (b uint)
  )
  (if (< a b)
    a
    b
  )
)

;; ---------------------------------------------------------- new read-onlys
;; v3 calldata: `{stx-payout: bool}`.
(define-read-only (parse-stx-calldata (calldata (buff 500)))
  (from-consensus-buff? { stx-payout: bool } calldata)
)

(define-read-only (is-converter (who principal))
  (default-to false (map-get? converters who))
)

(define-read-only (is-stx-elector (staker principal))
  (default-to false (map-get? stx-elections staker))
)

;; "stx", "btc" or "sbtc".
(define-read-only (get-payout-currency (staker principal))
  (if (is-stx-elector staker)
    "stx"
    (if (is-some (map-get? payout-configs staker))
      "btc"
      "sbtc"
    )
  )
)

(define-read-only (get-stx-pending (staker principal))
  (map-get? stx-pending staker)
)

(define-read-only (get-stx-pending-sats (staker principal))
  (match (map-get? stx-pending staker)
    p (get sats p)
    u0
  )
)

(define-read-only (get-stx-owed (staker principal))
  (default-to u0 (map-get? stx-owed staker))
)

;; Micro-STX this staker could be paid right now: owed plus a crystallizable
;; pending entry.
(define-read-only (get-stx-claimable (staker principal))
  (+ (get-stx-owed staker)
    (match (map-get? stx-pending staker)
      p (let ((e (get-epoch-or-empty (get epoch p))))
        (if (and (get closed e) (> (get sats-total e) u0))
          (/ (* (get sats p) (get ustx-out e)) (get sats-total e))
          u0
        )
      )
      u0
    )
  )
)

(define-read-only (get-epoch (epoch uint))
  (map-get? epochs epoch)
)

(define-read-only (get-epoch-or-empty (epoch uint))
  (default-to {
    sats-total: u0,
    sats-converted: u0,
    ustx-out: u0,
    sats-crystallized: u0,
    ustx-crystallized: u0,
    closed: false,
    sats-refund: u0,
    progress-burn-height: u0,
  }
    (map-get? epochs epoch)
  )
)

(define-read-only (get-open-epoch)
  (var-get open-epoch)
)

(define-read-only (get-convert-epoch)
  (var-get convert-epoch)
)

;; Sats settled for STX electors and not yet swapped, how much of the epoch
;; currently being converted is still open, and when anyone may abandon it.
(define-read-only (get-pending-conversion)
  (let ((e (get-epoch-or-empty (var-get convert-epoch))))
    {
      pending-conversion-sats: (var-get pending-conversion-sats),
      convert-epoch: (var-get convert-epoch),
      open-epoch: (var-get open-epoch),
      convert-epoch-remaining: (- (get sats-total e) (get sats-converted e)),
      progress-burn-height: (get progress-burn-height e),
      stranded-at-burn-height: (+ (get progress-burn-height e) STRANDED_EPOCH_BURN_BLOCKS),
      stranded: (is-convert-epoch-stranded),
    }
  )
)

;; True when the convert epoch holds unconverted sats and has seen no
;; progress for STRANDED_EPOCH_BURN_BLOCKS burn blocks (design 14).
(define-read-only (is-convert-epoch-stranded)
  (let ((e (get-epoch-or-empty (var-get convert-epoch))))
    (and
      (> (get sats-total e) (get sats-converted e))
      (>= burn-block-height (+ (get progress-burn-height e) STRANDED_EPOCH_BURN_BLOCKS))
    )
  )
)

(define-read-only (get-conversion (id uint))
  (map-get? conversions id)
)

(define-read-only (get-last-conversion-id)
  (var-get last-conversion-id)
)

(define-read-only (get-ustx-liability)
  (var-get ustx-liability)
)

(define-read-only (unattributed-stx-balance)
  (let (
      (balance (stx-get-balance current-contract))
      (reserved (var-get ustx-liability))
    )
    (if (>= balance reserved)
      (- balance reserved)
      u0
    )
  )
)

(define-read-only (route-enabled (route uint))
  (default-to false (map-get? routes-enabled route))
)

(define-read-only (get-routes)
  {
    dlmm: {
      id: ROUTE_DLMM,
      enabled: (route-enabled ROUTE_DLMM),
      core: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-core-v-1-1,
      pool: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dlmm-pool-stx-sbtc-v-1-bps-15,
      max-bins: DLMM_MAX_BINS,
    },
    velar: {
      id: ROUTE_VELAR,
      enabled: (route-enabled ROUTE_VELAR),
      pool: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-pool-v1_0_0-0070,
      fees: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.univ2-fees-v1_0_0-0070,
    },
  }
)

;; Both quotes for `amount` sats, as `convert` would see them.
(define-read-only (quote-routes (amount uint))
  (let ((a (quote-dlmm-raw amount)))
    {
      dlmm: (match a q (some (get out q)) none),
      dlmm-filled: (match a q (get filled q) u0),
      velar: (quote-velar amount),
    }
  )
)
