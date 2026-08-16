;; Zero to Claiming batch reader (mainnet). Collapses step 3's per-staker
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
