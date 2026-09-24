;; Minimal external batcher (what zc-claim-helper-v2 or the spox registry do):
;; folds over entries and contract-calls the manager once per entry. Used only
;; to measure the cost difference against the manager's own settle-many /
;; payout-many.
(define-private (settle-one (e {staker: principal, reward-cycle: uint, bond-index: (optional uint)}) (acc uint))
  (match (contract-call? .signer-manager-stx-payout settle-staker-rewards (get staker e) (get reward-cycle e) (get bond-index e))
    r (+ acc u1) c acc))
(define-private (payout-one (s principal) (acc uint))
  (match (contract-call? .signer-manager-stx-payout payout s) r (+ acc u1) c acc))
(define-public (settle-batch (entries (list 200 {staker: principal, reward-cycle: uint, bond-index: (optional uint)})))
  (ok (fold settle-one entries u0)))
(define-public (payout-batch (stakers (list 200 principal)))
  (ok (fold payout-one stakers u0)))
