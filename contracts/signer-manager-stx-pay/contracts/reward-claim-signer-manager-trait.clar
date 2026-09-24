;; reward-claim-signer-manager-trait
;;
;; Standalone copy of the trait the spox reward-claim-registry dispatches on
;; (stx-labs/spox, contracts/contracts/reward-claim-registry.clar, commit
;; ab8966fdc49f671c16a2d0b22bf65fdf299bb3a1, lines 1 to 50), verbatim apart
;; from this header. A signer manager that `impl-trait`s this contract is
;; checked at deploy time against the four functions the registry calls.
;; Conformance in Clarity is structural, so the registry works with any
;; manager that has these functions whether or not it names this trait;
;; naming it makes the check explicit and gives one principal to point at.
;; Deployed unchanged at
;; SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H.reward-claim-signer-manager-trait
;; on 2026-09-23 (block 9050280, tx
;; 0x11d2d90f4240f5c9677ce3186117f831a13b5c8ed0edfd43622e9bd3d957f520).
;; The two withdrawal functions are typed `(response bool uint)` as in the
;; pinned reference signer-manager-stillearly. Max 500 returns the refund
;; uint there, so a Max 500 derived manager that `impl-trait`s this contract
;; returns `(ok true)` from those two functions (design decision 15 in the
;; managers). The registry itself only tests `is-ok`.
(define-trait reward-claim-signer-manager-trait (
    ;; Claim a staker's rewards for a reward cycle. Returns the net
    ;; `earned` credited to the staker and, when the payout was routed to
    ;; an L1 sBTC withdrawal, the `withdrawal-request`.
    (claim-staker-rewards
        (principal uint (optional uint))
        (response {
            earned: uint,
            withdrawal-request: (optional uint),
        } uint)
    )
    ;; Pull the signer's rewards for a reward cycle from pox-5 into the
    ;; signer-manager so per-staker claims can be paid. Must run once per
    ;; (signer, reward-cycle, scope) before claim-staker-rewards will pay;
    ;; the reward-claim-registry calls it itself when pox-5 shows that
    ;; rewards are due. The return mirrors pox-5's claim-rewards and is
    ;; unused by the registry, but the type must match for trait
    ;; conformance.
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
    ;; Settle an accepted L1 withdrawal by its sbtc-registry request-id.
    (settle-accepted-withdrawal
        (uint)
        (response bool uint)
    )
    ;; Reclaim a rejected L1 withdrawal back to the staker who earned it.
    (reclaim-failed-withdrawal
        (uint)
        (response bool uint)
    )
))
