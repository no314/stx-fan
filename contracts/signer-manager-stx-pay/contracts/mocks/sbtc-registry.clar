;; Mock sBTC registry: withdrawal requests with a settable status.
(define-data-var last-id uint u0)
(define-map requests uint {
  amount: uint, max-fee: uint, sender: principal,
  recipient: {version: (buff 1), hashbytes: (buff 32)},
  block-height: uint, status: (optional bool)})
(define-public (create-request (amount uint) (max-fee uint) (sender principal) (recipient {version: (buff 1), hashbytes: (buff 32)}))
  (let ((id (+ (var-get last-id) u1)))
    (var-set last-id id)
    (map-set requests id {amount: amount, max-fee: max-fee, sender: sender, recipient: recipient, block-height: stacks-block-height, status: none})
    (ok id)))
(define-public (mock-set-status (id uint) (status (optional bool)))
  (begin
    (asserts! (is-some (map-get? requests id)) (err u1))
    (ok (map-set requests id (merge (unwrap-panic (map-get? requests id)) {status: status})))))
(define-read-only (get-withdrawal-request (id uint)) (map-get? requests id))
