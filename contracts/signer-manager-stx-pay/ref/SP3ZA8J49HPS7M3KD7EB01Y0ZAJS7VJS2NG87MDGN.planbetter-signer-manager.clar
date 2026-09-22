;; PlanBetter signer manager.
;;
;; A member -> BTC address registry that collects the signer's sBTC reward stream.
;; Members lock STX and are paid in native BTC off chain.

(impl-trait 'SP000000000000000000002Q6VF78.pox-5.signer-manager-trait)
(use-trait signer-manager-trait 'SP000000000000000000002Q6VF78.pox-5.signer-manager-trait)

(define-constant ERR_UNAUTHORIZED_ADMIN (err u1002))
(define-constant ERR_INVALID_CALLDATA (err u1003))
(define-constant ERR_INVALID_POX_ADDR (err u1004))
;; `validate-stake!` invoked by a principal other than pox-5.
(define-constant ERR_UNAUTHORIZED_CALLER (err u1006))
;; Attempted to withdraw more than has been collected.
(define-constant ERR_INSUFFICIENT_FEES (err u1007))
;; Nothing unaccounted-for to sweep.
(define-constant ERR_NO_REFUNDS (err u1010))
;; Staking without a BTC payout address in `signer-calldata`.
(define-constant ERR_POX_ADDR_REQUIRED (err u1012))
;; An admin tried to disable itself.
(define-constant ERR_CANNOT_DISABLE_SELF (err u1013))
;; Joining via a protocol bond. This pool is STX-only.
(define-constant ERR_BONDS_NOT_SUPPORTED (err u1014))
;; Locking less than MIN_STAKE_USTX.
(define-constant ERR_STAKE_BELOW_MINIMUM (err u1015))

;; The minimum a member may lock, in uSTX. 1000 STX.
(define-constant MIN_STAKE_USTX u1000000000)

(define-constant MAX_ADDRESS_VERSION u6)
;; Versions 0x00..0x04 have 20-byte hashbytes; above that, 32.
(define-constant MAX_ADDRESS_VERSION_BUFF_20 u4)

;; default to allowing deployer to register as a pool
(define-map admins
    principal
    bool
)
(map-set admins tx-sender true)

;; sBTC collected and not yet withdrawn.
(define-data-var earned-fees uint u0)

;; Member -> BTC payout address registry.
(define-map pox-addrs
    principal
    {
        version: (buff 1),
        hashbytes: (buff 32),
    }
)

;; Callback from a pox-5 `stake` transaction. `signer-calldata` is mandatory: a
;; member with no BTC address cannot be paid. Bond members are refused; this pool
;; is STX-only. A member must lock at least MIN_STAKE_USTX: `amount-ustx` is the
;; total lock on both paths - pox-5 passes `new-lock-amount` from `stake-update` -
;; so this is a floor on the position, not on the increment. Only `pox-addr` is
;; decoded; extra calldata keys are ignored.
(define-public (validate-stake!
        (staker principal)
        ;; #[allow(unused_binding)]
        (first-index uint)
        ;; #[allow(unused_binding)]
        (num-indexes uint)
        (amount-ustx uint)
        ;; #[allow(unused_binding)]
        (amount-sats uint)
        (is-bond bool)
        (signer-calldata (optional (buff 500)))
    )
    (begin
        (try! (authorize-pox-5))
        (asserts! (not is-bond) ERR_BONDS_NOT_SUPPORTED)
        (asserts! (>= amount-ustx MIN_STAKE_USTX) ERR_STAKE_BELOW_MINIMUM)
        (let (
                (calldata (unwrap! signer-calldata ERR_POX_ADDR_REQUIRED))
                (pox-addr (get pox-addr (unwrap!
                    (from-consensus-buff? {
                        pox-addr: {
                            version: (buff 1),
                            hashbytes: (buff 32),
                        },
                    }
                        calldata
                    )
                    ERR_INVALID_CALLDATA
                )))
            )
            (try! (check-pox-addr pox-addr))
            (map-set pox-addrs staker pox-addr)
            (print {
                topic: "validate-stake",
                staker: staker,
                pox-addr: pox-addr,
            })
            (ok true)
        )
    )
)

;; Claim rewards _as the signer manager_. Must be called before pox-5 will treat
;; this signer's rewards as available. Callable by anyone.
(define-public (claim-rewards
        (bond-periods (list 6 uint))
        (reward-cycle uint)
    )
    (let (
            (result (try! (contract-call? 'SP000000000000000000002Q6VF78.pox-5 claim-rewards
                bond-periods reward-cycle
            )))
            (total (get total-rewards result))
        )
        (var-set earned-fees (+ (var-get earned-fees) total))
        (print {
            topic: "claim-rewards",
            reward-cycle: reward-cycle,
            total-rewards: total,
        })
        (ok result)
    )
)

;; Withdraw collected rewards, for bridging and off-chain distribution.
(define-public (withdraw-fees
        (amount uint)
        (recipient principal)
    )
    (let ((fees (var-get earned-fees)))
        (try! (authorize-admin))
        (asserts! (<= amount fees) ERR_INSUFFICIENT_FEES)
        (var-set earned-fees (- fees amount))
        (print {
            topic: "withdraw-fees",
            amount: amount,
            recipient: recipient,
            remaining: (- fees amount),
        })
        (try! (as-contract?
            ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
                "sbtc-token" amount
            ))
            (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
                transfer amount tx-sender recipient none
            ))
        ))
        (ok amount)
    )
)

;; Sweep sBTC that arrived without going through `claim-rewards` - which
;; `earned-fees` does not account for, so `withdraw-fees` cannot release it.
(define-public (sweep-fee-refunds (recipient principal))
    (let (
            (balance (unwrap-panic (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
                get-balance-available current-contract
            )))
            (reserved (var-get earned-fees))
            (sweepable (if (>= balance reserved)
                (- balance reserved)
                u0
            ))
        )
        (try! (authorize-admin))
        (asserts! (> sweepable u0) ERR_NO_REFUNDS)
        (print {
            topic: "sweep-fee-refunds",
            amount-sats: sweepable,
            recipient: recipient,
        })
        (try! (as-contract?
            ((with-ft 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
                "sbtc-token" sweepable
            ))
            (try! (contract-call? 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token
                transfer sweepable tx-sender recipient none
            ))
        ))
        (ok sweepable)
    )
)

;; Register this contract with a specific signer key. The grant must be unused.
(define-public (register-self
        (signer-manager <signer-manager-trait>)
        (signer-key (buff 33))
        (auth-id uint)
        (signer-sig (buff 65))
    )
    (begin
        (try! (authorize-admin))
        (try! (contract-call? 'SP000000000000000000002Q6VF78.pox-5 grant-signer-key
            signer-key current-contract auth-id signer-sig
        ))
        (contract-call? 'SP000000000000000000002Q6VF78.pox-5 register-signer
            signer-manager signer-key
        )
    )
)

;;; Admin functions

;; An admin may never disable itself, so zero admins is unreachable. Rotate by
;; adding the incoming admin, then having them remove the outgoing one.
(define-public (update-admin
        (admin principal)
        (enabled bool)
    )
    (begin
        (try! (authorize-admin))
        (asserts! (or enabled (not (is-eq admin tx-sender)))
            ERR_CANNOT_DISABLE_SELF
        )
        (print {
            topic: "update-admin",
            admin: admin,
            enabled: enabled,
        })
        (map-set admins admin enabled)
        (ok admin)
    )
)

(define-private (authorize-admin)
    (ok (asserts! (and (is-eq contract-caller tx-sender) (is-admin tx-sender))
        ERR_UNAUTHORIZED_ADMIN
    ))
)

(define-private (authorize-pox-5)
    (ok (asserts! (is-eq contract-caller 'SP000000000000000000002Q6VF78.pox-5)
        ERR_UNAUTHORIZED_CALLER
    ))
)

(define-read-only (is-admin (caller principal))
    (default-to false (map-get? admins caller))
)

(define-read-only (get-earned-fees)
    (var-get earned-fees)
)

(define-read-only (get-pox-addr (staker principal))
    (map-get? pox-addrs staker)
)

(define-read-only (check-pox-addr (pox-addr {
    version: (buff 1),
    hashbytes: (buff 32),
}))
    (let (
            (version (buff-to-uint-be (get version pox-addr)))
            (expected-len (if (<= version MAX_ADDRESS_VERSION_BUFF_20)
                u20
                u32
            ))
        )
        (ok (asserts!
            (and
                (<= version MAX_ADDRESS_VERSION)
                (is-eq (len (get hashbytes pox-addr)) expected-len)
                (is-eq (len (get version pox-addr)) u1)
            )
            ERR_INVALID_POX_ADDR
        ))
    )
)