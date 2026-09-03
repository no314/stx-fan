;; Zero to Claiming batch reader, revision 2 (mainnet). Everything revision 1
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
  (match (contract-call? 'SP000000000000000000002Q6VF78.pox-5 get-staker-info s)
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
   unclaimed: (contract-call? 'SP000000000000000000002Q6VF78.pox-5 get-staker-unclaimed-rewards-for-cycle
     (get signer e) (get cycle e) none (get staker e))})
(define-read-only (unclaimed (entries (list 40 {signer: principal, staker: principal, cycle: uint})))
  (map unclaimed-one entries))

;; ---- fastpool-1: SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.fastpool-1-signer-manager ----
(define-private (earned-one-fastpool-1 (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.fastpool-1-signer-manager get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-fastpool-1 (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-fastpool-1 entries))
(define-private (config-one-fastpool-1 (s principal))
  (let ((p (contract-call? 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.fastpool-1-signer-manager get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-fastpool-1 (stakers (list 40 principal)))
  (map config-one-fastpool-1 stakers))

;; ---- senseinode: SP20XZGWBWSMRE94WDJ6YJ1EKPJ55RGRGK4JDJHNK.signer-manager-pox5 ----
(define-private (earned-one-senseinode (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'SP20XZGWBWSMRE94WDJ6YJ1EKPJ55RGRGK4JDJHNK.signer-manager-pox5 get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-senseinode (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-senseinode entries))
(define-private (config-one-senseinode (s principal))
  (let ((p (contract-call? 'SP20XZGWBWSMRE94WDJ6YJ1EKPJ55RGRGK4JDJHNK.signer-manager-pox5 get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-senseinode (stakers (list 40 principal)))
  (map config-one-senseinode stakers))

;; ---- max500: SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager ----
(define-private (earned-one-max500 (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-max500 (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-max500 entries))
(define-private (config-one-max500 (s principal))
  (let ((p (contract-call? 'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager get-payout-config s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: (match p t (some (get min-claim t)) none),
     pending: (contract-call? 'SPMPMA1V6P430M8C91QS1G9XJ95S59JS1TZFZ4Q4.fastpool-max500-signer-manager get-pending-payout s)}))
(define-read-only (config-max500 (stakers (list 40 principal)))
  (map config-one-max500 stakers))

;; ---- asymmetric: SPZACCJ8XPZ14P7K7NGFMT1BWQYF2JA9DFA2ZR8A.signer-manager ----
(define-private (earned-one-asymmetric (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'SPZACCJ8XPZ14P7K7NGFMT1BWQYF2JA9DFA2ZR8A.signer-manager get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-asymmetric (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-asymmetric entries))
(define-private (config-one-asymmetric (s principal))
  (let ((p (contract-call? 'SPZACCJ8XPZ14P7K7NGFMT1BWQYF2JA9DFA2ZR8A.signer-manager get-payout-config s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: (match p t (some (get min-claim t)) none),
     pending: (contract-call? 'SPZACCJ8XPZ14P7K7NGFMT1BWQYF2JA9DFA2ZR8A.signer-manager get-pending-payout s)}))
(define-read-only (config-asymmetric (stakers (list 40 principal)))
  (map config-one-asymmetric stakers))

;; ---- xverse-1: SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-1 ----
(define-private (earned-one-xverse-1 (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-1 get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-xverse-1 (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-xverse-1 entries))
(define-private (config-one-xverse-1 (s principal))
  (let ((p (contract-call? 'SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-1 get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-xverse-1 (stakers (list 40 principal)))
  (map config-one-xverse-1 stakers))

;; ---- xverse-2: SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-2 ----
(define-private (earned-one-xverse-2 (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-2 get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-xverse-2 (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-xverse-2 entries))
(define-private (config-one-xverse-2 (s principal))
  (let ((p (contract-call? 'SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-2 get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-xverse-2 (stakers (list 40 principal)))
  (map config-one-xverse-2 stakers))

;; ---- xverse-3: SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-3 ----
(define-private (earned-one-xverse-3 (e {staker: principal, cycle: uint}))
  (let ((r (contract-call? 'SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-3 get-earned-staker-rewards (get staker e) (get cycle e) none)))
    {staker: (get staker e), cycle: (get cycle e), earned: (get earned r), fees: (get fees r)}))
(define-read-only (earned-xverse-3 (entries (list 40 {staker: principal, cycle: uint})))
  (map earned-one-xverse-3 entries))
(define-private (config-one-xverse-3 (s principal))
  (let ((p (contract-call? 'SP8HK160YD5GHXP69VGA0TC7AQJ1X4CDW3XVERSE.xverse-signer-manager-3 get-pox-addr s)))
    {staker: s, btc: (is-some p),
     max-fee: (match p t (some (get max-fee t)) none),
     min-claim: NONE-UINT, pending: u0}))
(define-read-only (config-xverse-3 (stakers (list 40 principal)))
  (map config-one-xverse-3 stakers))
