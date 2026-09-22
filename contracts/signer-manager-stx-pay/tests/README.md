# Tests

vitest's forks pool cannot start in the sandbox this was built in, so the suites are plain node
scripts on top of `@stacks/clarinet-sdk` (simnet, Clarity 6, epoch 4.0). No Clarinet binary is needed.

    npm install --legacy-peer-deps --no-audit --no-fund
    node build/gen-sim.mjs            # regenerate contracts/sim from the mainnet source
    node tests/check.mjs              # type check every contract (mocks + manager)
    node tests/invariants.test.mjs    # 172 checks: invariants, batches, routes, admin, deficits
    node tests/routes.mjs             # 24 checks: multi-bin DLMM walk, quote == realized, fill or fail, fallback
    node tests/jing.mjs               # 140 checks: Jing route C against the seller-side Jing v2 mock
    node tests/costs.mjs              # cost table (settle-many / payout-many at 25/50/100/200, convert, jing-*)

The manager under test is `contracts/sim/signer-manager-stx-payout.clar`, generated from
`contracts/signer-manager-stx-payout.clar` by substituting the eight mainnet addresses with the
simnet deployer. Nothing else differs. The mocks in `contracts/mocks/` keep the deployed names and
signatures (pox-5, sbtc-token, sbtc-withdrawal, sbtc-registry, dlmm-core-v-1-1,
dlmm-pool-stx-sbtc-v-1-bps-15, token-stx-v-1-2, univ2-pool-v1_0_0-0070, univ2-fees-v1_0_0-0070,
univ2-math, wstx, sbtc-stx-0-jing-v2); the DLMM core mock reproduces the deployed `swap-y-for-x` arithmetic with a
linear bin-price factor instead of the on-chain factor table. The Jing mock reproduces the seller
side of `sbtc-stx-0-jing-v2` (deposit, cancel, set-limit, small-share filter at close, limit filter
at settle, pro-rata distribution with STX push and rollover) and adds test controls `mock-buy`,
`mock-settle (price)`, `mock-bump`, `mock-cancel-cycle`, `mock-set-paused`.
