;; Mock of SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-math (find-dx identical).
(define-constant err-dx (err u800))
(define-read-only (find-dx (x uint) (y uint) (dy uint))
  (let ((dx (/ (* dy x) (+ y dy))) (k (* x y)) (a (- x dx)) (b (+ y dy)))
    (asserts! (>= (* a b) k) err-dx)
    (ok dx)))
