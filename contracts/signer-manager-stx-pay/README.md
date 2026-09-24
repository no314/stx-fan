# signer-manager-stx-payout

PoX-5 signer manager derived from Fastpool Max 500 with STX payouts (per-staker election; on-chain
fill-or-fail conversion through Bitflow DLMM or Velar, plus a slow Jing v2 batch-auction route) and
native batching (`settle-many`, `payout-many`).

- `contracts/signer-manager-stx-payout.clar`  contract A.0, no Jing route, deployable now (GENERATED from B by `node build/gen-nojing.mjs`)
- `contracts/deploy/`                         the files to deploy: A.0 and B.0 without comments (`node build/gen-stripped.mjs`), same structure hashes
- `contracts/reward-claim-signer-manager-trait.clar` the spox reward-claim-registry trait, verbatim, as deployed at `SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H.reward-claim-signer-manager-trait`; A and B `impl-trait` it and return `(ok true)` from the two withdrawal functions (design decision 15)
- `contracts/signer-manager-stx-payout-jing.clar` contract B.0, source of truth with the Jing route C on `markets-sbtc-stx-jing-v6` (`;; @jing` markers mark what A drops)
- `contracts/mocks/`                          simnet stand-ins with the deployed names and signatures
- `contracts/sim/`                            generated: mainnet source with simnet principals (`node build/gen-sim.mjs`)
- `contracts/testnet/`                        generated: testnet set (`node build/gen-testnet.mjs ST...`)
- `tests/`                                    node-script test suites and cost bench (see tests/README.md)
- `simulations/`                              stxer mainnet fork runner (written 2026-09-23, not yet run)
- `NOTE-fork-simulation-as-skill-2026-09-23.md` fork simulation as a standing practice, draft skill text
- `COMPARE-FASTPOOL-PR1-2026-09-22.md`        comparison with fastpool/fastpool-pox-5 PR 1
- `AUDIT-2026-09-24-contract-A.md`            security audit of A (aibtc framework, stxer guidance) and the fixes
- `scripts/testnet-batch-bench.mjs`           inclusion-latency bench for a deployed testnet manager
- `HANDOFF-2026-09-19.md`                     contradictions, verified facts, cost table, sizing, pool depth

- `JING-ROUTE-SPEC-2026-09-20.md`              third route (Jing v2 batch auction): facts, design note, and the built departures

Structure hashes (2026-09-24, same for the commented and the deploy file): A.0 `6b605581cdbf5c07aa584b75d6bad6ae7653e13f80210dbdc765ab88938d31bf`, B.0 `745738e5df627d654773d0c12e874e280f5f48266290f3c0fed749d15c010230`

Versions: the letter is the build (A without Jing, B with Jing), the number counts mainnet deployments. Iterations before a deployment keep the number; after the first deployment the next is A.1 or B.1.

Run everything: `node build/gen-nojing.mjs && node build/gen-stripped.mjs && node build/gen-sim.mjs && node tests/check.mjs && node tests/stripped.mjs`, then for A `node tests/invariants.test.mjs && node tests/routes.mjs && node tests/abandon.mjs && node tests/traits.mjs && node tests/costs.mjs`, and for B the same with `MANAGER=signer-manager-stx-payout-jing` plus `MANAGER=signer-manager-stx-payout-jing node tests/jing.mjs`
