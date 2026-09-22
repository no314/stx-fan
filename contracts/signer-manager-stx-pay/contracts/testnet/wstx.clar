;; Mock of SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx (identical).
(define-public (transfer (amt uint) (from principal) (to principal) (memo (optional (buff 34))))
  (stx-transfer? amt from to))
(define-read-only (get-name) (ok "Wrapped STX"))
(define-read-only (get-symbol) (ok "wSTX"))
(define-read-only (get-decimals) (ok u6))
(define-read-only (get-balance (of principal)) (ok (stx-get-balance of)))
(define-read-only (get-total-supply) (ok stx-liquid-supply))
(define-read-only (get-token-uri) (ok (some u"https://stacks.co")))
