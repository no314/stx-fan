;; Mock of SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY.univ2-pool-v1_0_0-0070.
;; token0 = wstx (STX), token1 = sbtc-token. `swap` follows the deployed body.
(define-constant err-swap-preconditions (err u107))
(define-data-var paused bool false)
(define-data-var pool {symbol: (string-ascii 32), token0: principal, token1: principal, lp-token: principal, fees: principal,
    reserve0: uint, reserve1: uint, block-height: uint, burn-block-height: uint}
  {symbol: "wSTX-sBTC", token0: .wstx, token1: 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token, lp-token: .wstx, fees: .univ2-fees-v1_0_0-0070,
   reserve0: u0, reserve1: u0, block-height: u0, burn-block-height: u0})
;; Test: fund the pool and set reserves.
(define-public (mock-seed (r0 uint) (r1 uint))
  (begin
    (try! (stx-transfer? r0 tx-sender current-contract))
    (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token transfer r1 tx-sender current-contract none))
    (ok (var-set pool (merge (var-get pool) {reserve0: r0, reserve1: r1})))))
(define-public (mock-set-paused (p bool)) (begin (asserts! true (err u1)) (ok (var-set paused p))))
(define-read-only (get-pool) (ok (var-get pool)))
(define-read-only (do-get-pool) (var-get pool))
(define-public (swap (token-in principal) (token-out principal) (fees principal) (amt-in uint) (amt-out-desired uint))
  (let ((pool_ (var-get pool)) (user tx-sender)
        (t0 (get token0 pool_)) (t1 (get token1 pool_))
        (is-token0 (is-eq token-in t0))
        (r0 (get reserve0 pool_)) (r1 (get reserve1 pool_))
        (res (try! (contract-call? .univ2-fees-v1_0_0-0070 calc-fees amt-in)))
        (amt-in-adjusted (get amt-in-adjusted res))
        (amt-fee-lps (get amt-fee-lps res))
        (amt-fee-protocol (get amt-fee-protocol res))
        (amt-out (try! (if is-token0
          (contract-call? .univ2-math find-dx r1 r0 amt-in-adjusted)
          (contract-call? .univ2-math find-dx r0 r1 amt-in-adjusted))))
        (bals (if is-token0 {bal0: (+ r0 amt-in-adjusted amt-fee-lps), bal1: (- r1 amt-out)}
                            {bal0: (- r0 amt-out), bal1: (+ r1 amt-in-adjusted amt-fee-lps)})))
    (asserts! (not (var-get paused)) err-swap-preconditions)
    (asserts! (and (or (is-eq token-in t0) (is-eq token-in t1)) (or (is-eq token-out t0) (is-eq token-out t1))
                   (not (is-eq token-in token-out)) (is-eq fees (get fees pool_))
                   (> amt-in u0) (> amt-out-desired u0) (> amt-in-adjusted u0) (>= amt-out amt-out-desired))
      err-swap-preconditions)
    ;; token-in is always sbtc here (STX-in path not needed by the manager)
    (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token transfer amt-in user current-contract none))
    (try! (as-contract? ((with-stx amt-out)) (try! (stx-transfer? amt-out tx-sender user))))
    (if (> amt-fee-protocol u0)
      (begin
        (try! (as-contract? ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token "sbtc-token" amt-fee-protocol))
          (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token transfer amt-fee-protocol tx-sender .univ2-fees-v1_0_0-0070 none))))
        (try! (contract-call? .univ2-fees-v1_0_0-0070 receive is-token0 amt-fee-protocol)))
      true)
    (var-set pool (merge pool_ {reserve0: (get bal0 bals), reserve1: (get bal1 bals)}))
    (let ((event {op: "swap", user: user, amt-in: amt-in, amt-out-desired: amt-out-desired, amt-out: amt-out,
                  amt-in-adjusted: amt-in-adjusted, amt-fee-lps: amt-fee-lps, amt-fee-protocol: amt-fee-protocol}))
      (print event)
      (ok event))))
