;; Zero to Claiming batch reader (testnet). Collapses step 3's per-staker
;; enrichment reads into a handful of read-only calls: the public Hiro node
;; budgets 50 requests per minute per IP, and a 150-staker roster needs about
;; 2,100 individual reads without this contract.
;;
;; Design rules:
;; - Clarity rejects trait references in read-only functions (dynamic dispatch
;;   counts as a writing operation to the analyzer), so every known manager
;;   gets its own statically bound pair of functions. Bring-your-own managers
;;   fall back to the app's one-read-per-value path.
;; - This contract holds no state and no funds; every function is a read-only
;;   passthrough that normalizes each manager lineage's answers into one shape.
;;   The reference lineage keys BTC payouts on get-pox-addr and has no pending
;;   balance or min-claim; the settle-and-payout lineage (Max 500) keys them on
;;   get-payout-config and get-pending-payout. btc, max-fee, min-claim, pending
;;   come out the same way for both.
;; - bond-index is always none, per the app's V1 scope (STX-only leg).
;; - List capacity 40 per call; the app starts smaller and halves the chunk
;;   when a call trips the node's read-only cost budget (default read_count 100).
;; - A new manager deployment needs a new revision of this contract; the app
;;   pins this contract by principal and structure hash and falls back to the
;;   slow path on any mismatch.

(define-constant NONE-UINT (if true none (some u0)))

;; ---- hiro-1: ST1B38CGQRPXEMRH7B66VXTS22DQTNMSW4YJJ7QK1.signer-manager ----
(define-private (earned-one-hiro-1 (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'ST1B38CGQRPXEMRH7B66VXTS22DQTNMSW4YJJ7QK1.signer-manager get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-hiro-1 (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-hiro-1 entries))
(define-private (config-one-hiro-1 (s principal))
  (let ((p (contract-call? 'ST1B38CGQRPXEMRH7B66VXTS22DQTNMSW4YJJ7QK1.signer-manager get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-hiro-1 (stakers (list 40 principal)))
  (map config-one-hiro-1 stakers))

;; ---- hiro-2: ST31XHNM0GZ2K978FPP4QA3STNQ73Z8C9G9MJEPK2.signer-manager ----
(define-private (earned-one-hiro-2 (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'ST31XHNM0GZ2K978FPP4QA3STNQ73Z8C9G9MJEPK2.signer-manager get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-hiro-2 (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-hiro-2 entries))
(define-private (config-one-hiro-2 (s principal))
  (let ((p (contract-call? 'ST31XHNM0GZ2K978FPP4QA3STNQ73Z8C9G9MJEPK2.signer-manager get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-hiro-2 (stakers (list 40 principal)))
  (map config-one-hiro-2 stakers))

;; ---- stxfan: ST2BM6AQSMQ04CX8KDE62QBFVZTDZ2ZX80G22E500.signer-manager-3 ----
(define-private (earned-one-stxfan (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'ST2BM6AQSMQ04CX8KDE62QBFVZTDZ2ZX80G22E500.signer-manager-3 get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-stxfan (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-stxfan entries))
(define-private (config-one-stxfan (s principal))
  (let ((p (contract-call? 'ST2BM6AQSMQ04CX8KDE62QBFVZTDZ2ZX80G22E500.signer-manager-3 get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-stxfan (stakers (list 40 principal)))
  (map config-one-stxfan stakers))
