;; Zero to Claiming batch reader, revision 3 (testnet). Revision 2 with one
;; correction: the probe now reads pox-5's get-earned-staker-rewards instead
;; of get-staker-unclaimed-rewards-for-cycle.
;;
;; Why: pox-5 keeps a staker's per-cycle reward as two parts. The
;; staker-unclaimed-rewards-for-cycle map holds only the part snapshotted by
;; an earlier settlement (a stake-update or a partial claim); the rest lives in
;; the rewards-per-token delta since that snapshot. get-earned-staker-rewards
;; returns the sum (compute-earned-rewards: pending + shares * (rpt - rptPaid)
;; / PRECISION); the unclaimed read returns the snapshot alone, which is zero
;; for any staker never snapshotted. Revision 2's probe therefore reported
;; zero for most (staker, cycle) pairs that did hold rewards, and the app
;; skipped their earned reads. Found on mainnet against max500, 2026-09-10.
;;
;; Everything else is revision 2: lock-info from pox-5's get-staker-info, one
;; statically bound earned/config pair per known manager (Clarity rejects
;; trait references in read-only functions), the probe's entries carry their
;; manager as a plain principal so ANY manager works (bring-your-own
;; included), no state, no funds, bond-index always none, list capacity 40 per
;; call with the app halving its chunk on a cost rejection, pinned by principal
;; and structure hash with fallback to revision 2, then 1, then one read per
;; value. The probe keeps its function name (unclaimed) and result shape so the
;; app's reader code is unchanged; only its truth changed.

(define-constant NONE-UINT (if true none (some u0)))
(define-constant NONE-PRINCIPAL (if true none (some tx-sender)))

;; ---- pox-5 lock state, any staker ----
(define-private (lock-one (s principal))
  (match (contract-call? 'ST000000000000000000002AMW42H.pox-5 get-staker-info s)
    info {staker: s, staked: true,
          amount-ustx: (get amount-ustx info),
          first-cycle: (get first-reward-cycle info),
          unlock-cycle: (+ (get first-reward-cycle info) (get num-cycles info)),
          signer: (some (get signer info))}
    {staker: s, staked: false, amount-ustx: u0, first-cycle: u0, unlock-cycle: u0, signer: NONE-PRINCIPAL}))
(define-read-only (lock-info (stakers (list 40 principal)))
  (map lock-one stakers))

;; ---- pox-5 earned probe, any manager (snapshot plus accrual since it) ----
(define-private (unclaimed-one (e {signer: principal, staker: principal, cycle: uint}))
  {staker: (get staker e), cycle: (get cycle e),
   unclaimed: (contract-call? 'ST000000000000000000002AMW42H.pox-5 get-earned-staker-rewards
     (get signer e) (get cycle e) none (get staker e))})
(define-read-only (unclaimed (entries (list 40 {signer: principal, staker: principal, cycle: uint})))
  (map unclaimed-one entries))

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
