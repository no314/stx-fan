;; Signer-manager that supports STX payouts: based on Fastpool's Max500 with
;; claim-many functions built in and an additional swap route compared to A.0
;; through Jing Swap (Version B.0)
;; Fully commented source and design notes: https://github.com/no314/stx-fan/blob/main/contracts/signer-manager-stx-pay/contracts/signer-manager-stx-payout-jing.clar
(impl-trait 'SP000000000000000000002Q6VF78.pox-5.signer-manager-trait)
(use-trait signer-manager-trait 'SP000000000000000000002Q6VF78.pox-5.signer-manager-trait)
(impl-trait 'SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H.reward-claim-signer-manager-trait.reward-claim-signer-manager-trait)
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
(define-constant ERR_NOTHING_TO_SETTLE (err u1018))
(define-constant ERR_CONVERSION_PENDING (err u1019))
(define-constant ERR_NO_ROUTE (err u1020))
(define-constant ERR_SLIPPAGE (err u1021))
(define-constant ERR_NOTHING_TO_CONVERT (err u1022))
(define-constant ERR_UNKNOWN_ROUTE (err u1023))
(define-constant ERR_INSUFFICIENT_STX_BALANCE (err u1024))
(define-constant ERR_INSUFFICIENT_SBTC_BALANCE (err u1025))
(define-constant ERR_INVALID_AMOUNT (err u1026))
(define-constant ERR_EPOCH_STILL_CONVERTING (err u1027))
(define-constant ERR_NO_STX_TO_SWEEP (err u1028))
(define-constant ERR_UNFUNDED_SETTLEMENT (err u1029))
(define-constant ERR_CYCLE_NOT_PULLED (err u1030))
(define-constant ERR_PARTIAL_FILL (err u1031))
(define-constant ERR_JING_ORDER_OPEN (err u1032))
(define-constant ERR_NO_JING_ORDER (err u1033))
(define-constant ERR_EPOCH_NOT_STRANDED (err u1034))
(define-constant MAX_FEE_BIPS u500)
(define-constant BIPS_DENOMINATOR u10000)
(define-constant FEE_ACTIVATION_DELAY_CYCLES u2)
(define-constant DUST_LIMIT u546)
(define-constant MAX_FALLBACK_BIPS u300)
(define-constant STRANDED_EPOCH_BURN_BLOCKS u4200)
(define-constant ROUTE_DLMM u1)
(define-constant ROUTE_VELAR u2)
(define-constant ROUTE_JING u3)
(define-constant DLMM_MAX_BINS u10)
(define-constant DLMM_STEPS (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9))
(define-constant DLMM_FEE_SCALE_BPS u10000)
(define-constant DLMM_PRICE_SCALE_BPS u100000000)
(define-constant DLMM_CENTER_BIN_ID 500)
(define-constant DLMM_MAX_BIN_ID 500)
(define-constant RATE_SCALE u100000000)
(define-map admins
  principal
  bool
)
(map-set admins tx-sender true)
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
(define-map stx-elections
  principal
  bool
)
(define-map settled
  {
    staker: principal,
    reward-cycle: uint,
    bond-index: (optional uint),
  }
  bool
)
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
    sats-refund: uint,
    progress-burn-height: uint,
  }
)
(define-map stx-pending
  principal
  {
    sats: uint,
    epoch: uint,
  }
)
(define-map stx-owed
  principal
  uint
)
(define-data-var pending-conversion-sats uint u0)
(define-data-var ustx-liability uint u0)
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
(define-map routes-enabled
  uint
  bool
)
(map-set routes-enabled ROUTE_DLMM true)
(map-set routes-enabled ROUTE_VELAR true)
(map-set routes-enabled ROUTE_JING true)
(define-data-var jing-order (optional {
  epoch: uint,
  deposited: uint,
  limit: uint,
}) none)
(define-data-var sats-in-jing uint u0)
(define-public (validate-stake!
    (staker principal)
    (first-index uint)
    (num-indexes uint)
    (amount-ustx uint)
    (amount-sats uint)
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
    (print {
      topic: "validate-stake",
      staker: staker,
      currency: (get-payout-currency staker),
      is-bond: is-bond,
    })
    (ok true)
  )
)
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
(define-public (claim-rewards
    (bond-periods (list 6 uint))
    (reward-cycle uint)
  )
  (let (
      (active-bips (get-active-fee-bips))
      (result (try! (contract-call? 'SP000000000000000000002Q6VF78.pox-5 claim-rewards
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
(define-read-only (get-earned-staker-rewards
    (staker principal)
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (let (
      (earned-before-fees (contract-call? 'SP000000000000000000002Q6VF78.pox-5
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
(define-public (settle-staker-rewards
    (staker principal)
    (reward-cycle uint)
    (bond-index (optional uint))
  )
  (settle-core staker reward-cycle bond-index)
)
(define-public (payout (staker principal))
  (payout-core staker)
)
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
    (asserts! (is-some (map-get? fee-bips-for-cycle bucket-key))
      ERR_CYCLE_NOT_PULLED
    )
    (asserts! (or (not is-stx) (stx-pending-mergeable existing))
      ERR_EPOCH_STILL_CONVERTING
    )
    (let (
        (info (try! (contract-call? 'SP000000000000000000002Q6VF78.pox-5
          claim-staker-rewards-for-signer staker reward-cycle bond-index
        )))
        (gross (get earned info))
        (fees (/ (* gross (get-fee-bips-for-cycle reward-cycle bond-index))
          BIPS_DENOMINATOR
        ))
        (earned (- gross fees))
        (covered (if (< bucket gross) bucket gross))
        (short (- gross covered))
      )
      (asserts! (> earned u0)
        (if (default-to false (map-get? settled key))
          ERR_NOTHING_TO_SETTLE
          ERR_NO_CLAIMABLE_REWARDS
        ))
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
      progress-burn-height: (if (is-eq (get sats-total e) u0)
        burn-block-height
        (get progress-burn-height e)
      ),
    }))
    (var-set pending-conversion-sats (+ (var-get pending-conversion-sats) sats))
    true
  )
)
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
(define-private (payout-core (staker principal))
  (let ((sats (begin
      (crystallize staker)
      (get-pending-payout staker)
    )))
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (if (> sats u0)
      (match (payout-sats staker sats)
        r (ok r)
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
      (balance (unwrap-panic (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
        get-balance current-contract
      )))
    )
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
    (let ((withdrawal-request (try! (as-contract?
        ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          "sbtc-token" amount
        ))
        (match config
          l1-info (let (
              (max-fee (get max-fee l1-info))
              (withdrawal-amount (- amount max-fee))
              (request-id (try! (contract-call?
                'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-withdrawal
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
            (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
              transfer amount tx-sender staker none
            ))
            none
          )
        )))))
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
    (asserts! (> amount u0)
      (if (is-some pending)
        ERR_CONVERSION_PENDING
        ERR_NO_PENDING_PAYOUT
      ))
    (asserts! (>= (stx-get-balance current-contract) amount)
      ERR_INSUFFICIENT_STX_BALANCE
    )
    (try! (as-contract?
      ((with-stx amount))
      (try! (stx-transfer? amount tx-sender staker))
    ))
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
(define-public (abandon-epoch)
  (let (
      (epoch (var-get convert-epoch))
      (e (get-epoch-or-empty epoch))
      (remaining (- (get sats-total e) (get sats-converted e)))
    )
    (try! (authorize-admin-or-stranded))
    (asserts! (is-none (var-get jing-order)) ERR_JING_ORDER_OPEN)
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
      (a-full (and (> filled-a u0) (is-eq filled-a amount)))
      (a-better (and a-full (>= out-a out-b)))
      (best-quote (if a-better out-a out-b))
    )
    (try! (authorize-converter))
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (asserts! (is-none (var-get jing-order)) ERR_JING_ORDER_OPEN)
    (asserts! (> remaining u0) ERR_NOTHING_TO_CONVERT)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (or a-full (is-some quote-b)) ERR_NO_ROUTE)
    (if (is-eq epoch (var-get open-epoch))
      (var-set open-epoch (+ epoch u1))
      true
    )
    (let (
        (first (if a-better ROUTE_DLMM ROUTE_VELAR))
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
      (asserts! (is-eq sats-in amount) ERR_PARTIAL_FILL)
      (asserts! (> ustx-out u0) ERR_SLIPPAGE)
      (asserts! (>= (* ustx-out RATE_SCALE) (* min-ustx-per-sat-x8 sats-in)) ERR_SLIPPAGE)
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
      (sbtc-before (unwrap-panic (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
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
        (sbtc-after (unwrap-panic (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          get-balance current-contract
        )))
        (stx-after (stx-get-balance current-contract))
        (sats-in (- sbtc-before sbtc-after))
      )
      (asserts! (> sats-in u0) ERR_NO_ROUTE)
      (ok {
        route: route,
        sats-in: sats-in,
        ustx-out: (- stx-after stx-before),
      })
    )
  )
)
(define-private (swap-dlmm (amount uint))
  (let ((final (fold dlmm-step DLMM_STEPS {
      remaining: amount,
      done: false,
    })))
    (- amount (get remaining final))
  )
)
(define-private (dlmm-step
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
          'SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15
          get-pool-for-swap false
        )))
        (bin (get active-bin-id pool))
        (remaining (get remaining state))
      )
      (match (dlmm-swap-once bin remaining)
        r {
          remaining: (- remaining (get in r)),
          done: false,
        }
        c (begin
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
(define-private (dlmm-swap-once
    (bin int)
    (y-amount uint)
  )
  (as-contract?
    ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
      "sbtc-token" y-amount
    ))
    (try! (contract-call? 'SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA.dlmm-core-v-1-1
      swap-y-for-x
      'SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15
      'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2
      'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
      bin y-amount
    ))
  )
)
(define-read-only (quote-dlmm-raw (amount uint))
  (if (or (not (route-enabled ROUTE_DLMM)) (is-eq amount u0))
    none
    (let (
        (pool (unwrap-panic (contract-call?
          'SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15
          get-pool-for-swap false
        )))
        (status (match (unwrap-panic (contract-call? 'SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA.dlmm-core-v-1-1
            get-pool-by-id (get pool-id pool)
          ))
          p (get status p)
          false
        ))
        (exempt (unwrap-panic (contract-call? 'SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA.dlmm-core-v-1-1
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
(define-read-only (quote-dlmm (amount uint))
  (match (quote-dlmm-raw amount)
    q (some (get out q))
    none
  )
)
(define-private (dlmm-quote-step
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
        (balances (unwrap-panic (contract-call?
          'SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15
          get-bin-balances unsigned
        )))
        (x (get x-balance balances))
        (y (get y-balance balances))
        (price-result (contract-call? 'SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA.dlmm-core-v-1-1
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
            done: (and (not advance) (or empty (is-eq use-y u0) (is-eq x-after u0))),
          })
        )
        code (merge state { done: true })
      )
    )
  )
)
(define-private (swap-velar (amount uint))
  (let ((quoted (unwrap! (quote-velar-raw amount) ERR_NO_ROUTE)))
    (as-contract?
      ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
        "sbtc-token" amount
      ))
      (let ((event (try! (contract-call? 'SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-pool-v1_0_0-0070
          swap
          'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
          'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx
          'SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-fees-v1_0_0-0070
          amount quoted
        ))))
        (get amt-out event)
      )
    )
  )
)
(define-read-only (quote-velar (amount uint))
  (if (or (not (route-enabled ROUTE_VELAR)) (is-eq amount u0))
    none
    (quote-velar-raw amount)
  )
)
(define-read-only (quote-velar-raw (amount uint))
  (let ((pool (unwrap-panic (contract-call? 'SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-pool-v1_0_0-0070
      get-pool
    ))))
    (match (contract-call? 'SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-fees-v1_0_0-0070
        calc-fees amount
      )
      f (match (contract-call? 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-math
          find-dx (get reserve0 pool) (get reserve1 pool) (get amt-in-adjusted f)
        )
        dx (if (> dx u0) (some dx) none)
        code none
      )
      code none
    )
  )
)
(define-constant JING_ERR_OFFSET u2000)
(define-private (jing-call-deposit
    (amount uint)
    (limit uint)
    (update (buff 8192))
  )
  (as-contract?
    ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token" amount))
    (try! (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
      deposit-token-x amount limit none update
      'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
    ))
  )
)
(define-private (jing-call-cancel)
  (as-contract?
    ()
    (try! (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
      cancel-token-x-deposit 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
    ))
  )
)
(define-private (jing-call-set-limit
    (limit uint)
    (update (buff 8192))
  )
  (as-contract?
    ()
    (try! (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
      set-token-x-limit limit none update
    ))
  )
)
(define-private (jing-call-swap
    (amount uint)
    (limit uint)
    (update (buff 8192))
  )
  (as-contract?
    ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token" amount))
    (try! (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
      swap amount limit update
      'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
      'SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR.token-stx-v-1-2 "wstx"
      true
    ))
  )
)
(define-private (remap-uint (r (response uint uint)))
  (match r
    v (ok v)
    code (err (+ JING_ERR_OFFSET code))
  )
)
(define-private (remap-bool (r (response bool uint)))
  (match r
    v (ok v)
    code (err (+ JING_ERR_OFFSET code))
  )
)
(define-private (remap-swap (r (response {
  token-x-received: uint,
  token-y-rolled: uint,
  token-y-received: uint,
  token-x-rolled: uint,
  rebate-refunded: uint,
} uint)))
  (match r
    v (ok v)
    code (err (+ JING_ERR_OFFSET code))
  )
)
(define-read-only (jing-current-cycle)
  (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
    get-current-cycle
  )
)
(define-read-only (jing-holding)
  (+
    (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
      get-token-x-deposit (jing-current-cycle) current-contract
    )
    (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
      get-token-x-parked current-contract
    )
  )
)
(define-read-only (sbtc-balance-here)
  (unwrap-panic (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
    get-balance current-contract
  ))
)
(define-private (implied-price
    (ustx uint)
    (sats uint)
  )
  (if (> sats u0)
    (/ (* ustx u10000000000) sats)
    u0
  )
)
(define-public (jing-deposit
    (amount-sats uint)
    (limit uint)
    (update (buff 8192))
  )
  (let (
      (epoch (var-get convert-epoch))
      (e (get-epoch-or-empty epoch))
      (remaining (- (get sats-total e) (get sats-converted e)))
      (amount (if (< amount-sats remaining) amount-sats remaining))
    )
    (try! (authorize-converter))
    (asserts! (route-enabled ROUTE_JING) ERR_NO_ROUTE)
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (asserts! (is-none (var-get jing-order)) ERR_JING_ORDER_OPEN)
    (asserts! (> remaining u0) ERR_NOTHING_TO_CONVERT)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> limit u0) ERR_INVALID_AMOUNT)
    (if (is-eq epoch (var-get open-epoch))
      (var-set open-epoch (+ epoch u1))
      true
    )
    (try! (remap-uint (jing-call-deposit amount limit update)))
    (map-set epochs epoch (merge e { progress-burn-height: burn-block-height }))
    (var-set jing-order (some {
      epoch: epoch,
      deposited: amount,
      limit: limit,
    }))
    (var-set sats-in-jing (+ (var-get sats-in-jing) amount))
    (print {
      topic: "jing-deposit",
      epoch: epoch,
      amount-sats: amount,
      limit: limit,
      jing-cycle: (jing-current-cycle),
    })
    (ok {
      epoch: epoch,
      amount-sats: amount,
    })
  )
)
(define-public (jing-reconcile)
  (begin
    (try! (authorize-converter-or-stranded))
    (jing-reconcile-core "reconcile")
  )
)
(define-private (jing-reconcile-core (reason (string-ascii 9)))
  (let (
      (order (unwrap! (var-get jing-order) ERR_NO_JING_ORDER))
      (deposited (get deposited order))
      (holding (jing-holding))
      (gone (- deposited (if (< holding deposited) holding deposited)))
      (excess (unattributed-balance))
      (refunded (if (< excess gone) excess gone))
      (filled (- gone refunded))
      (ustx (if (> filled u0) (unattributed-stx-balance) u0))
      (price (implied-price ustx filled))
      (left (if (< holding deposited) holding deposited))
    )
    (jing-book-fill (get epoch order) filled ustx price)
    (var-set sats-in-jing (- (var-get sats-in-jing) gone))
    (var-set jing-order (if (> left u0)
      (some (merge order { deposited: left }))
      none
    ))
    (print {
      topic: "jing-reconcile",
      epoch: (get epoch order),
      jing-cycle: (jing-current-cycle),
      filled-sats: filled,
      stx-received: ustx,
      refunded-sats: refunded,
      remainder-sats: left,
      jing-price: price,
      order-open: (> left u0),
      reason: reason,
    })
    (ok {
      jing-cycle: (jing-current-cycle),
      filled-sats: filled,
      stx-received: ustx,
      refunded-sats: refunded,
      remainder-sats: left,
      order-open: (> left u0),
      reason: reason,
    })
  )
)
(define-public (jing-set-limit
    (limit uint)
    (update (buff 8192))
  )
  (let ((order (unwrap! (var-get jing-order) ERR_NO_JING_ORDER)))
    (try! (authorize-converter))
    (asserts! (> limit u0) ERR_INVALID_AMOUNT)
    (try! (remap-bool (jing-call-set-limit limit update)))
    (map-set epochs (get epoch order) (merge (get-epoch-or-empty (get epoch order)) { progress-burn-height: burn-block-height }))
    (var-set jing-order (some (merge order { limit: limit })))
    (print {
      topic: "jing-set-limit",
      epoch: (get epoch order),
      limit: limit,
    })
    (ok limit)
  )
)
(define-public (jing-cancel)
  (begin
    (try! (authorize-converter-or-stranded))
    (unwrap! (var-get jing-order) ERR_NO_JING_ORDER)
    (try! (remap-uint (jing-call-cancel)))
    (jing-reconcile-core "cancel")
  )
)
(define-public (jing-swap
    (amount-sats uint)
    (limit uint)
    (min-ustx-per-sat-x8 uint)
    (update (buff 8192))
  )
  (let (
      (epoch (var-get convert-epoch))
      (e (get-epoch-or-empty epoch))
      (remaining (- (get sats-total e) (get sats-converted e)))
      (amount (if (< amount-sats remaining) amount-sats remaining))
      (sats-before (sbtc-balance-here))
      (ustx-before (stx-get-balance current-contract))
    )
    (try! (authorize-converter))
    (asserts! (route-enabled ROUTE_JING) ERR_NO_ROUTE)
    (asserts! (is-eq (var-get total-deficit) u0) ERR_UNFUNDED_SETTLEMENT)
    (asserts! (is-none (var-get jing-order)) ERR_JING_ORDER_OPEN)
    (asserts! (> remaining u0) ERR_NOTHING_TO_CONVERT)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (> limit u0) ERR_INVALID_AMOUNT)
    (if (is-eq epoch (var-get open-epoch))
      (var-set open-epoch (+ epoch u1))
      true
    )
    (let (
        (result (try! (remap-swap (jing-call-swap amount limit update))))
        (sats-in (- sats-before (sbtc-balance-here)))
        (ustx-out (- (stx-get-balance current-contract) ustx-before))
      )
      (asserts! (> sats-in u0) ERR_NO_ROUTE)
      (asserts! (> ustx-out u0) ERR_SLIPPAGE)
      (asserts! (>= (* ustx-out RATE_SCALE) (* min-ustx-per-sat-x8 sats-in)) ERR_SLIPPAGE)
      (jing-book-fill epoch sats-in ustx-out (implied-price ustx-out sats-in))
      (print {
        topic: "jing-swap",
        epoch: epoch,
        requested-sats: amount,
        sats-in: sats-in,
        ustx-out: ustx-out,
        limit: limit,
        jing-cycle: (jing-current-cycle),
      })
      (ok {
        epoch: epoch,
        sats-in: sats-in,
        ustx-out: ustx-out,
      })
    )
  )
)
(define-private (jing-book-fill
    (epoch uint)
    (filled uint)
    (ustx-out uint)
    (price uint)
  )
  (if (is-eq filled u0)
    true
    (let (
        (e (get-epoch-or-empty epoch))
        (converted (+ (get sats-converted e) filled))
        (closed (is-eq converted (get sats-total e)))
        (id (+ (var-get last-conversion-id) u1))
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
      (var-set pending-conversion-sats (- (var-get pending-conversion-sats) filled))
      (var-set ustx-liability (+ (var-get ustx-liability) ustx-out))
      (var-set last-conversion-id id)
      (map-set conversions id {
        epoch: epoch,
        route: ROUTE_JING,
        sats-in: filled,
        ustx-out: ustx-out,
        quote-dlmm: none,
        quote-velar: none,
        burn-height: burn-block-height,
        stacks-height: stacks-block-height,
        caller: tx-sender,
      })
      (print {
        topic: "convert",
        conversion-id: id,
        epoch: epoch,
        route: ROUTE_JING,
        sats-in: filled,
        ustx-out: ustx-out,
        quote-dlmm: none,
        quote-dlmm-filled: u0,
        quote-velar: none,
        jing-price: price,
        epoch-closed: closed,
        epoch-sats-total: (get sats-total e),
        epoch-sats-converted: converted,
      })
      true
    )
  )
)
(define-public (reclaim-failed-withdrawal (request-id uint))
  (let (
      (staker (unwrap! (map-get? withdrawal-requests request-id)
        ERR_UNKNOWN_WITHDRAWAL_REQUEST
      ))
      (request (unwrap!
        (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-registry
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
      ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
        refund
      ))
      (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
        transfer refund tx-sender staker none
      ))
    ))
    (ok true)
  )
)
(define-public (settle-accepted-withdrawal (request-id uint))
  (let (
      (staker (unwrap! (map-get? withdrawal-requests request-id)
        ERR_UNKNOWN_WITHDRAWAL_REQUEST
      ))
      (request (unwrap!
        (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-registry
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
      ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
        refund
      ))
      (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
        transfer refund tx-sender staker none
      ))
    ))
    (ok refund)
  )
)
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
      ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
        amount
      ))
      (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
        transfer amount tx-sender recipient none
      ))
    ))
    (ok amount)
  )
)
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
      ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token "sbtc-token"
        sweepable
      ))
      (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
        transfer sweepable tx-sender recipient none
      ))
    ))
    (ok sweepable)
  )
)
(define-public (sweep-stx (recipient principal))
  (let ((sweepable (unattributed-stx-balance)))
    (try! (authorize-admin))
    (asserts! (is-none (var-get jing-order)) ERR_JING_ORDER_OPEN)
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
(define-public (set-route-enabled
    (route uint)
    (enabled bool)
  )
  (begin
    (try! (authorize-admin))
    (asserts! (or (is-eq route ROUTE_DLMM) (is-eq route ROUTE_VELAR)
        (is-eq route ROUTE_JING)
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
(define-public (register-self
    (signer-manager <signer-manager-trait>)
    (signer-key (buff 33))
    (auth-id uint)
    (signer-sig (buff 65))
  )
  (begin
    (try! (authorize-admin))
    (try! (contract-call? 'SP000000000000000000002Q6VF78.pox-5 grant-signer-key
      signer-key current-contract auth-id signer-sig
    ))
    (contract-call? 'SP000000000000000000002Q6VF78.pox-5 register-signer
      signer-manager signer-key
    )
  )
)
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
(define-private (authorize-admin-or-stranded)
  (ok (asserts! (or (is-ok (authorize-admin)) (is-convert-epoch-stranded))
    ERR_EPOCH_NOT_STRANDED
  ))
)
(define-private (authorize-converter-or-stranded)
  (ok (asserts! (or (is-ok (authorize-converter)) (is-convert-epoch-stranded))
    ERR_EPOCH_NOT_STRANDED
  ))
)
(define-private (authorize-pox-5)
  (ok (asserts! (is-eq contract-caller 'SP000000000000000000002Q6VF78.pox-5)
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
(define-read-only (is-admin (caller principal))
  (default-to false (map-get? admins caller))
)
(define-read-only (current-cycle)
  (contract-call? 'SP000000000000000000002Q6VF78.pox-5 current-pox-reward-cycle)
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
(define-read-only (unattributed-balance)
  (let (
      (balance (unwrap-panic (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
        get-balance current-contract
      )))
      (reserved-all (+ (var-get earned-fees) (var-get withdrawal-liability)
        (var-get total-unclaimed-rewards) (var-get credited-refunds)
        (var-get total-pending-payouts) (var-get pending-conversion-sats)
      ))
      (reserved (- reserved-all (var-get sats-in-jing)))
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
      (is-ok (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-withdrawal
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
(define-read-only (parse-stx-calldata (calldata (buff 500)))
  (from-consensus-buff? { stx-payout: bool } calldata)
)
(define-read-only (is-converter (who principal))
  (default-to false (map-get? converters who))
)
(define-read-only (is-stx-elector (staker principal))
  (default-to false (map-get? stx-elections staker))
)
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
(define-read-only (get-jing-order)
  (var-get jing-order)
)
(define-read-only (get-sats-in-jing)
  (var-get sats-in-jing)
)
(define-read-only (get-jing-state)
  (let ((cycle (jing-current-cycle)))
    {
      enabled: (route-enabled ROUTE_JING),
      market: 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6,
      jing-cycle: cycle,
      totals: (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
        get-cycle-totals cycle
      ),
      min-deposits: (contract-call? 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6
        get-min-deposits
      ),
      holding: (jing-holding),
      order: (var-get jing-order),
      sats-in-jing: (var-get sats-in-jing),
    }
  )
)
(define-read-only (get-routes)
  {
    dlmm: {
      id: ROUTE_DLMM,
      enabled: (route-enabled ROUTE_DLMM),
      core: 'SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA.dlmm-core-v-1-1,
      pool: 'SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD.dlmm-pool-stx-sbtc-v-1-bps-15,
      max-bins: DLMM_MAX_BINS,
    },
    velar: {
      id: ROUTE_VELAR,
      enabled: (route-enabled ROUTE_VELAR),
      pool: 'SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-pool-v1_0_0-0070,
      fees: 'SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-fees-v1_0_0-0070,
    },
    jing: {
      id: ROUTE_JING,
      enabled: (route-enabled ROUTE_JING),
      market: 'SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6,
    },
  }
)
(define-read-only (quote-routes (amount uint))
  (let ((a (quote-dlmm-raw amount)))
    {
      dlmm: (match a q (some (get out q)) none),
      dlmm-filled: (match a q (get filled q) u0),
      velar: (quote-velar amount),
    }
  )
)
