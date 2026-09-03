;; Zero to Claiming batch reader, revision 2 (testnet). Everything revision 1
;; did, plus three additions:
;; - the Asymmetric Research manager (max500 lineage, verified identical
;;   interface), mainnet only;
;; - lock-info: each staker's pox-5 lock (amount, first cycle, unlock cycle,
;;   current signer) from pox-5's own get-staker-info, so the roster can come
;;   from the staking API (which returns bare principals) and still show staked
;;   amounts and the from/to cycles;
;; - unclaimed: a cheap universal probe over pox-5's
;;   get-staker-unclaimed-rewards-for-cycle. Each entry carries its manager
;;   principal (a plain principal argument, so no trait is needed and ANY
;;   manager works, bring-your-own included). The app sweeps the cycle window
;;   with this probe first and spends the expensive per-manager earned reads
;;   only on the (staker, cycle) pairs that still hold something.
;;
;; Standing rules from revision 1: Clarity rejects trait references in
;; read-only functions, so every known manager gets statically bound function
;; pairs; this contract holds no state and no funds; bond-index is always none
;; (V1 scope); list capacity 40 per call and the app halves its chunk when a
;; call trips the node's read-only cost budget; the app pins this contract by
;; principal and structure hash and falls back to revision 1, then to
;; one-read-per-value, on any mismatch.

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

;; ---- pox-5 unclaimed probe, any manager ----
(define-private (unclaimed-one (e {signer: principal, staker: principal, cycle: uint}))
  {staker: (get staker e), cycle: (get cycle e),
   unclaimed: (contract-call? 'ST000000000000000000002AMW42H.pox-5 get-staker-unclaimed-rewards-for-cycle
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
