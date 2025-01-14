(define-constant TOKEN-CONTRACT 'SP3FA62NRKY41QZEXB787Y53XVSRV7N3TJ3F8GZ45.kanecomplain-stxcity)
(define-constant DEPLOYER tx-sender)

;; Utility function to get a standard principal from the contract-caller
(define-read-only (get-standard-caller)
  (let ((d (unwrap-panic (principal-destruct? contract-caller))))
    (unwrap-panic (principal-construct? (get version d) (get hash-bytes d)))
  )
)

(define-public (airdrop (recipients (list 999 principal)))
  ;; Only the deployer can initiate the airdrop
  (asserts! (is-eq DEPLOYER (get-standard-caller)) (err u401))
  ;; Fold over the recipients list and try to transfer 1 token to each recipient
  ;; from `contract-caller` (which must be the deployer or whoever initiated this airdrop).
  (fold transfer-to-recipient recipients (ok true))
)

(define-private (transfer-to-recipient (recipient principal) (acc (response bool uint)))
  ;; If previous operations failed, propagate the error
  (match acc
    ok-value
      (match (contract-call? TOKEN-CONTRACT ft-transfer? u1 contract-caller recipient)
        tx-success (ok true)
        tx-failure (err u500) ;; generic error if transfer fails (insufficient funds, etc.)
      )
    err-value (err err-value)
  )
)