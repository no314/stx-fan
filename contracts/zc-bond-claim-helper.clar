;; Zero to Claiming bond helper. One transaction syncs a pooled bond staker's
;; rewards and claims for up to 50 of its members.
;;
;; Pooled bond stakers (Esbee DAO lineage) are the pox-5 staker of record for a
;; bond period; their rewards arrive as a bare sBTC balance after the signer
;; manager's payout, and the pool exposes two permissionless calls:
;; sync-rewards credits that balance to the live epoch's shares, and
;; claim-rewards pays one member's pending credit to that member.
;;
;; Design rules (as zc-claim-helper):
;; - Error isolation: every inner call is matched, counted, and printed, never
;;   try!'d. A member whose pending is zero at execution fails inside the pool
;;   (its u2014) and rolls back only that call; the rest of the batch continues.
;; - The sync is optional and tolerant: with sync true the helper calls
;;   sync-rewards first and prints its outcome either way; "nothing to recognise"
;;   is a normal result when the balance was already credited, not a batch failure.
;; - The helper holds no funds. Rewards flow from the pool directly to members;
;;   nothing routes through this contract.
;; - The pool is a trait argument, so any pool with these two signatures works;
;;   no principal is baked in and one deployment serves every network.
;; - List capacity 50 per call; the app chunks larger member lists.

(define-trait bond-pool
  ((sync-rewards () (response {epoch: uint, recognized: uint, reward-index: uint} uint))
   (claim-rewards (principal) (response uint uint))))

(define-private (claim-one
    (p <bond-pool>)
    (om (optional principal)))
  (match om m
    (match (contract-call? p claim-rewards m)
      amount (begin
          (print {topic: "zc-member-ok", staker: m, amount: amount})
          {ok: u1, err: u0})
      c (begin
          (print {topic: "zc-member-err", staker: m, code: c})
          {ok: u0, err: u1}))
    {ok: u0, err: u0}))

;; Runs sync-rewards when asked; returns whether it credited anything.
(define-private (sync-first
    (p <bond-pool>)
    (sync bool))
  (if sync
    (match (contract-call? p sync-rewards)
      r (begin
          (print {topic: "zc-sync-ok", staker: (contract-of p), epoch: (get epoch r), recognized: (get recognized r)})
          true)
      c (begin
          (print {topic: "zc-sync-err", staker: (contract-of p), code: c})
          false))
    false))

(define-public (claim-many
    (p <bond-pool>)
    (sync bool)
    (members (list 50 principal)))
    (let (
            (synced (sync-first p sync))
            (r0 (claim-one p (element-at? members u0)))
            (r1 (claim-one p (element-at? members u1)))
            (r2 (claim-one p (element-at? members u2)))
            (r3 (claim-one p (element-at? members u3)))
            (r4 (claim-one p (element-at? members u4)))
            (r5 (claim-one p (element-at? members u5)))
            (r6 (claim-one p (element-at? members u6)))
            (r7 (claim-one p (element-at? members u7)))
            (r8 (claim-one p (element-at? members u8)))
            (r9 (claim-one p (element-at? members u9)))
            (r10 (claim-one p (element-at? members u10)))
            (r11 (claim-one p (element-at? members u11)))
            (r12 (claim-one p (element-at? members u12)))
            (r13 (claim-one p (element-at? members u13)))
            (r14 (claim-one p (element-at? members u14)))
            (r15 (claim-one p (element-at? members u15)))
            (r16 (claim-one p (element-at? members u16)))
            (r17 (claim-one p (element-at? members u17)))
            (r18 (claim-one p (element-at? members u18)))
            (r19 (claim-one p (element-at? members u19)))
            (r20 (claim-one p (element-at? members u20)))
            (r21 (claim-one p (element-at? members u21)))
            (r22 (claim-one p (element-at? members u22)))
            (r23 (claim-one p (element-at? members u23)))
            (r24 (claim-one p (element-at? members u24)))
            (r25 (claim-one p (element-at? members u25)))
            (r26 (claim-one p (element-at? members u26)))
            (r27 (claim-one p (element-at? members u27)))
            (r28 (claim-one p (element-at? members u28)))
            (r29 (claim-one p (element-at? members u29)))
            (r30 (claim-one p (element-at? members u30)))
            (r31 (claim-one p (element-at? members u31)))
            (r32 (claim-one p (element-at? members u32)))
            (r33 (claim-one p (element-at? members u33)))
            (r34 (claim-one p (element-at? members u34)))
            (r35 (claim-one p (element-at? members u35)))
            (r36 (claim-one p (element-at? members u36)))
            (r37 (claim-one p (element-at? members u37)))
            (r38 (claim-one p (element-at? members u38)))
            (r39 (claim-one p (element-at? members u39)))
            (r40 (claim-one p (element-at? members u40)))
            (r41 (claim-one p (element-at? members u41)))
            (r42 (claim-one p (element-at? members u42)))
            (r43 (claim-one p (element-at? members u43)))
            (r44 (claim-one p (element-at? members u44)))
            (r45 (claim-one p (element-at? members u45)))
            (r46 (claim-one p (element-at? members u46)))
            (r47 (claim-one p (element-at? members u47)))
            (r48 (claim-one p (element-at? members u48)))
            (r49 (claim-one p (element-at? members u49)))
        )
        (let ((result {
                topic: "bond-claim-many",
                pool: (contract-of p),
                synced: synced,
                submitted: (len members),
                ok-count: (+ (get ok r0)
                    (get ok r1)
                    (get ok r2)
                    (get ok r3)
                    (get ok r4)
                    (get ok r5)
                    (get ok r6)
                    (get ok r7)
                    (get ok r8)
                    (get ok r9)
                    (get ok r10)
                    (get ok r11)
                    (get ok r12)
                    (get ok r13)
                    (get ok r14)
                    (get ok r15)
                    (get ok r16)
                    (get ok r17)
                    (get ok r18)
                    (get ok r19)
                    (get ok r20)
                    (get ok r21)
                    (get ok r22)
                    (get ok r23)
                    (get ok r24)
                    (get ok r25)
                    (get ok r26)
                    (get ok r27)
                    (get ok r28)
                    (get ok r29)
                    (get ok r30)
                    (get ok r31)
                    (get ok r32)
                    (get ok r33)
                    (get ok r34)
                    (get ok r35)
                    (get ok r36)
                    (get ok r37)
                    (get ok r38)
                    (get ok r39)
                    (get ok r40)
                    (get ok r41)
                    (get ok r42)
                    (get ok r43)
                    (get ok r44)
                    (get ok r45)
                    (get ok r46)
                    (get ok r47)
                    (get ok r48)
                    (get ok r49)),
                err-count: (+ (get err r0)
                    (get err r1)
                    (get err r2)
                    (get err r3)
                    (get err r4)
                    (get err r5)
                    (get err r6)
                    (get err r7)
                    (get err r8)
                    (get err r9)
                    (get err r10)
                    (get err r11)
                    (get err r12)
                    (get err r13)
                    (get err r14)
                    (get err r15)
                    (get err r16)
                    (get err r17)
                    (get err r18)
                    (get err r19)
                    (get err r20)
                    (get err r21)
                    (get err r22)
                    (get err r23)
                    (get err r24)
                    (get err r25)
                    (get err r26)
                    (get err r27)
                    (get err r28)
                    (get err r29)
                    (get err r30)
                    (get err r31)
                    (get err r32)
                    (get err r33)
                    (get err r34)
                    (get err r35)
                    (get err r36)
                    (get err r37)
                    (get err r38)
                    (get err r39)
                    (get err r40)
                    (get err r41)
                    (get err r42)
                    (get err r43)
                    (get err r44)
                    (get err r45)
                    (get err r46)
                    (get err r47)
                    (get err r48)
                    (get err r49)),
            }))
            (print result)
            (ok result))))
