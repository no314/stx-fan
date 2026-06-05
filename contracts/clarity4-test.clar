;; clarity4-test
;; Minimal contract that only analyzes under Clarity 4.
;; `stacks-block-time` is a Clarity 4 keyword (SIP-033); deploying this
;; as Clarity 3 or lower fails node-side analysis ("unresolved variable").

(define-read-only (get-block-time)
  stacks-block-time)

(define-read-only (whoami)
  (to-ascii? tx-sender))