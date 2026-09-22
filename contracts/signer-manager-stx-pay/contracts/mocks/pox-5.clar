;; Mock pox-5: the surface the signer manager touches, with test setters.
;; Signatures mirror SP000000000000000000002Q6VF78.pox-5 (read 2026-09-19).
(define-trait signer-manager-trait (
    (validate-stake!
        (principal uint uint uint uint bool (optional (buff 500)))
        (response bool uint)
    )
))

(define-constant ERR_NO_CLAIMABLE_REWARDS (err u1024))
(define-constant ERR_UNAUTHORIZED_SIGNER_REGISTRATION (err u1018))

(define-data-var cycle uint u100)
(define-data-var last-grant (optional {signer-key: (buff 33), signer-manager: principal, auth-id: uint}) none)
(define-map signers principal (buff 33))

;; signer-level pending rewards per (signer, cycle, bond-index)
(define-map signer-rewards {signer: principal, reward-cycle: uint, bond-index: (optional uint)} uint)
;; staker-level earned per (signer, cycle, bond-index, staker)
(define-map staker-earned {signer: principal, reward-cycle: uint, bond-index: (optional uint), staker: principal} uint)

;; ---- test setters
(define-public (mock-set-cycle (c uint)) (begin (asserts! true (err u1)) (ok (var-set cycle c))))
(define-public (mock-set-signer-rewards (signer principal) (reward-cycle uint) (bond-index (optional uint)) (amount uint))
  (begin (asserts! true (err u1)) (ok (map-set signer-rewards {signer: signer, reward-cycle: reward-cycle, bond-index: bond-index} amount))))
(define-public (mock-set-staker-earned (signer principal) (reward-cycle uint) (bond-index (optional uint)) (staker principal) (amount uint))
  (begin (asserts! true (err u1)) (ok (map-set staker-earned {signer: signer, reward-cycle: reward-cycle, bond-index: bond-index, staker: staker} amount))))
;; Drive the manager's validate-stake! callback with contract-caller = this contract.
(define-public (mock-stake (signer-manager <signer-manager-trait>) (staker principal) (amount-ustx uint) (signer-calldata (optional (buff 500))))
  (contract-call? signer-manager validate-stake! staker u0 u1 amount-ustx u0 false signer-calldata))

;; ---- real surface
(define-read-only (current-pox-reward-cycle) (var-get cycle))

(define-read-only (get-earned-staker-rewards (signer principal) (reward-cycle uint) (bond-index (optional uint)) (staker principal))
  (default-to u0 (map-get? staker-earned {signer: signer, reward-cycle: reward-cycle, bond-index: bond-index, staker: staker})))

(define-private (take-signer (signer principal) (reward-cycle uint) (bond-index (optional uint)))
  (let ((key {signer: signer, reward-cycle: reward-cycle, bond-index: bond-index})
        (earned (default-to u0 (map-get? signer-rewards key))))
    (map-set signer-rewards key u0)
    {earned: earned, rewards-per-token: u0}))

(define-private (take-bond (bond-index uint) (acc {signer: principal, total: uint, reward-cycle: uint,
    bond-rewards: (list 6 {earned: uint, bond-index: uint, rewards-per-token: uint})}))
  (let ((info (take-signer (get signer acc) (get reward-cycle acc) (some bond-index))))
    {signer: (get signer acc),
     total: (+ (get total acc) (get earned info)),
     reward-cycle: (get reward-cycle acc),
     bond-rewards: (unwrap-panic (as-max-len? (append (get bond-rewards acc) (merge info {bond-index: bond-index})) u6))}))

(define-public (claim-rewards (bond-periods (list 6 uint)) (reward-cycle uint))
  (let ((signer contract-caller)
        (stx-rewards (take-signer signer reward-cycle none))
        (bonds (fold take-bond bond-periods {signer: signer, total: u0, reward-cycle: reward-cycle, bond-rewards: (list)}))
        (total-rewards (+ (get earned stx-rewards) (get total bonds))))
    (asserts! (> total-rewards u0) ERR_NO_CLAIMABLE_REWARDS)
    (try! (as-contract? ((with-ft .sbtc-token "sbtc-token" total-rewards))
      (try! (contract-call? .sbtc-token transfer total-rewards tx-sender signer none))))
    (ok {stx-rewards: stx-rewards, bond-rewards: (get bond-rewards bonds), bond-totals: (get total bonds), total-rewards: total-rewards})))

(define-public (claim-staker-rewards-for-signer (staker principal) (reward-cycle uint) (bond-index (optional uint)))
  (let ((key {signer: contract-caller, reward-cycle: reward-cycle, bond-index: bond-index, staker: staker})
        (earned (default-to u0 (map-get? staker-earned key))))
    (asserts! true (err u1))
    (map-set staker-earned key u0)
    (print {topic: "claim-staker-rewards-for-signer", signer-manager: contract-caller, staker: staker, reward-cycle: reward-cycle, bond-index: bond-index, rewards-claimed: earned})
    (ok {earned: earned, rewards-per-token: u0})))

(define-public (grant-signer-key (signer-key (buff 33)) (signer-manager principal) (auth-id uint) (signer-sig (buff 65)))
  (begin
    (asserts! (is-eq contract-caller signer-manager) ERR_UNAUTHORIZED_SIGNER_REGISTRATION)
    (var-set last-grant (some {signer-key: signer-key, signer-manager: signer-manager, auth-id: auth-id}))
    (ok {signer-key: signer-key, signer-manager: signer-manager, auth-id: auth-id})))

(define-public (register-signer (signer-manager <signer-manager-trait>) (signer-key (buff 33)))
  (let ((signer (contract-of signer-manager)))
    (asserts! (is-eq contract-caller signer) ERR_UNAUTHORIZED_SIGNER_REGISTRATION)
    (map-set signers signer signer-key)
    (ok {signer: signer, signer-key: signer-key})))

(define-read-only (get-signer-info (signer principal)) (map-get? signers signer))
