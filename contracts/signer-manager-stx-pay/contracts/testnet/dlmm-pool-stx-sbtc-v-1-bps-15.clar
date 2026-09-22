;; Mock of the Bitflow DLMM STX/sBTC pool (read-only shapes and the two
;; core-only writers the swap path uses). x = STX (token-stx-v-1-2), y = sBTC.
(define-constant ERR_NOT_AUTHORIZED (err u3001))
(define-constant ERR_INVALID_TOKEN (err u3004))
(define-constant ERR_INVALID_PRINCIPAL (err u3003))
(define-constant ERR_INVALID_AMOUNT (err u3002))

(define-data-var active-bin-id int 0)
(define-data-var bin-step uint u15)
(define-data-var initial-price uint u37270) ;; sats per uSTX scaled 1e8 (372.7 sats per STX at bin 0)
(define-data-var fees {protocol-fee: uint, provider-fee: uint, variable-fee: uint} {protocol-fee: u25, provider-fee: u25, variable-fee: u0})
(define-map balances-at-bin uint {x-balance: uint, y-balance: uint, bin-shares: uint})

;; ---- test setters
(define-public (mock-set-active-bin (id int)) (begin (asserts! true (err u1)) (ok (var-set active-bin-id id))))
(define-public (mock-set-initial-price (p uint)) (begin (asserts! true (err u1)) (ok (var-set initial-price p))))
(define-public (mock-set-fees (protocol uint) (provider uint) (variable uint))
  (begin (asserts! true (err u1)) (ok (var-set fees {protocol-fee: protocol, provider-fee: provider, variable-fee: variable}))))
;; Set a bin's balances and fund the pool contract so it can pay out.
(define-public (mock-set-bin (id uint) (x uint) (y uint))
  (begin
    (map-set balances-at-bin id {x-balance: x, y-balance: y, bin-shares: u1})
    (if (> x u0) (try! (stx-transfer? x tx-sender current-contract)) true)
    (if (> y u0) (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token transfer y tx-sender current-contract none)) true)
    (ok true)))

;; ---- real surface
(define-read-only (get-pool-for-swap (is-x-for-y bool))
  (ok {
    pool-id: u6, pool-name: "STX-sBTC-LP",
    core-address: .dlmm-core-v-1-1, fee-address: current-contract,
    x-token: .token-stx-v-1-2, y-token: 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token,
    bin-step: (var-get bin-step), initial-price: (var-get initial-price),
    active-bin-id: (var-get active-bin-id),
    protocol-fee: (get protocol-fee (var-get fees)),
    provider-fee: (get provider-fee (var-get fees)),
    variable-fee: (get variable-fee (var-get fees))}))

(define-read-only (get-bin-balances (id uint))
  (ok (default-to {x-balance: u0, y-balance: u0, bin-shares: u0} (map-get? balances-at-bin id))))

(define-read-only (get-active-bin-id) (ok (var-get active-bin-id)))

(define-public (pool-transfer (token principal) (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq contract-caller .dlmm-core-v-1-1) ERR_NOT_AUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (if (is-eq token .token-stx-v-1-2)
      (as-contract? ((with-stx amount)) (try! (stx-transfer? amount tx-sender recipient)))
      (begin
        (asserts! (is-eq token 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token) ERR_INVALID_TOKEN)
        (as-contract? ((with-ft 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token "sbtc-token" amount))
          (try! (contract-call? 'SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.sbtc-token transfer amount tx-sender recipient none)))))))

(define-public (update-bin-balances (bin-id uint) (x-balance uint) (y-balance uint))
  (begin
    (asserts! (is-eq contract-caller .dlmm-core-v-1-1) ERR_NOT_AUTHORIZED)
    (ok (map-set balances-at-bin bin-id (merge (unwrap-panic (get-bin-balances bin-id)) {x-balance: x-balance, y-balance: y-balance})))))

(define-public (set-active-bin-id (id int))
  (begin
    (asserts! (is-eq contract-caller .dlmm-core-v-1-1) ERR_NOT_AUTHORIZED)
    (ok (var-set active-bin-id id))))
