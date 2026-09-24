# Tests

vitest's forks pool cannot start in the sandbox this was built in, so the suites are plain node
scripts on top of `@stacks/clarinet-sdk` (simnet, Clarity 6, epoch 4.0). No Clarinet binary is needed.

    npm install --legacy-peer-deps --no-audit --no-fund
    node build/gen-nojing.mjs         # regenerate contract A from contract B (source of truth)
    node build/gen-stripped.mjs       # regenerate the comment-free deploy files in contracts/deploy
    node build/gen-sim.mjs            # regenerate contracts/sim for both contracts
    node tests/check.mjs              # type check every contract (mocks + manager)
    node tests/invariants.test.mjs    # 187 checks: invariants, batches, routes, admin, deficits, claim-unfunded, withdrawal reclaim and settle returns
    node tests/routes.mjs             # 30 checks: multi-bin DLMM walk, quote == realized, fill or fail, fallback bound, fee exemption
    MANAGER=signer-manager-stx-payout-jing node tests/jing.mjs   # 110 checks: Jing route C on the v6 market mock (contract B only)
    node tests/costs.mjs              # cost table (settle-many / payout-many at 25/50/100/200, convert, jing-*)
    node tests/abandon.mjs            # 73 checks (A) / 80 (B): abandon-epoch, stranded path after 4200 burn blocks, two-leg payout, gates, reserve
    node tests/batch-compare.mjs      # native settle-many / payout-many versus an external batcher (table)
    node tests/stripped.mjs           # the deploy files analyse and expose the same interface as the commented sources
    node tests/traits.mjs             # 9 checks: spox reward-claim-registry trait conformance and registry style calls
    node simulations/fork-stxer.mjs   # mainnet fork on stxer (see simulations/README.md; needs network)

Every suite runs against contract A by default; `MANAGER=signer-manager-stx-payout-jing node tests/<suite>` runs
it against contract B (`tests/jing.mjs` is B only). The manager under test is `contracts/sim/<name>.clar`, generated from
`contracts/<name>.clar` by substituting the eight mainnet addresses with the
simnet deployer. Nothing else differs. The mocks in `contracts/mocks/` keep the deployed names and
signatures (pox-5, sbtc-token, sbtc-withdrawal, sbtc-registry, dlmm-core-v-1-1,
dlmm-pool-stx-sbtc-v-1-bps-15, token-stx-v-1-2, univ2-pool-v1_0_0-0070, univ2-fees-v1_0_0-0070,
univ2-math, wstx, markets-sbtc-stx-jing-v6, plus external-batcher (a helper that calls the manager once per entry, for the cost comparison) and reward-claim-trait-check, a verbatim copy of the spox
`reward-claim-signer-manager-trait` with three caller functions); the DLMM core mock reproduces the deployed `swap-y-for-x` arithmetic with a
linear bin-price factor instead of the on-chain factor table. The Jing mock reproduces the maker side of `markets-sbtc-stx-jing-v6` (deposit at a limit, parking when the side is full, cancel, set-limit, pro-rata settlement with rollover and refund below the minimum, STX pushed to makers, taker `swap` with rebate and fill or fail) and adds test controls `mock-set-price`, `mock-buy`, `mock-drain-bids`, `mock-park`, `mock-settle`, `mock-set-paused`, `mock-set-min-x`.
