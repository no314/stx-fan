;; Structural conformance check against the spox reward-claim-registry trait
;; (stx-labs/spox contracts/contracts/reward-claim-registry.clar at commit
;; ab8966fdc49f671c16a2d0b22bf65fdf299bb3a1, lines 1 to 50), published at
;; SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H.reward-claim-signer-manager-trait.
;; The trait text is copied verbatim, response bool uint on the two
;; withdrawal functions included. Passing the manager as <sm> exercises the
;; runtime trait check on every function signature; the managers also
;; impl-trait the published contract, which is the strict deploy-time check.
(define-trait reward-claim-signer-manager-trait (
    (claim-staker-rewards
        (principal uint (optional uint))
        (response {
            earned: uint,
            withdrawal-request: (optional uint),
        } uint)
    )
    (claim-rewards
        ((list 6 uint) uint)
        (
            response             {
            stx-rewards: {
                earned: uint,
                rewards-per-token: uint,
            },
            bond-rewards: (list 6 {
                earned: uint,
                bond-index: uint,
                rewards-per-token: uint,
            }),
            bond-totals: uint,
            total-rewards: uint,
        }
            uint
        )
    )
    (settle-accepted-withdrawal
        (uint)
        (response bool uint)
    )
    (reclaim-failed-withdrawal
        (uint)
        (response bool uint)
    )
))

(define-public (conforms (sm <reward-claim-signer-manager-trait>))
  (ok (contract-of sm)))

(define-public (pull (sm <reward-claim-signer-manager-trait>) (reward-cycle uint))
  (contract-call? sm claim-rewards (list) reward-cycle))

(define-public (claim (sm <reward-claim-signer-manager-trait>) (staker principal) (reward-cycle uint))
  (contract-call? sm claim-staker-rewards staker reward-cycle none))

(define-public (settle-via-trait (sm <reward-claim-signer-manager-trait>) (id uint))
  (contract-call? sm settle-accepted-withdrawal id))
(define-public (reclaim-via-trait (sm <reward-claim-signer-manager-trait>) (id uint))
  (contract-call? sm reclaim-failed-withdrawal id))
