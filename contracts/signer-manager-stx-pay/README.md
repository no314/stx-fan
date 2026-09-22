# signer-manager-stx-payout

PoX-5 signer manager derived from Fastpool Max 500 with STX payouts (per-staker election; on-chain
fill-or-fail conversion through Bitflow DLMM or Velar, plus a slow Jing v2 batch-auction route) and
native batching (`settle-many`, `payout-many`).

- `contracts/signer-manager-stx-payout.clar`  the deployable mainnet source (design decisions in the header)
- `contracts/mocks/`                          simnet stand-ins with the deployed names and signatures
- `contracts/sim/`                            generated: mainnet source with simnet principals (`node build/gen-sim.mjs`)
- `contracts/testnet/`                        generated: testnet set (`node build/gen-testnet.mjs ST...`)
- `tests/`                                    node-script test suites and cost bench (see tests/README.md)
- `scripts/testnet-batch-bench.mjs`           inclusion-latency bench for a deployed testnet manager
- `HANDOFF-2026-09-19.md`                     contradictions, verified facts, cost table, sizing, pool depth

- `JING-ROUTE-SPEC-2026-09-20.md`              third route (Jing v2 batch auction): facts, design note, and the built departures

Structure hash (mainnet source, 2026-09-22 Jing route revision): 2a5377cf0a540ca74a7552559a84b5e050d8f10e07a8aaf0b373c0b4df01da93

Run everything: `node build/gen-sim.mjs && node tests/check.mjs && node tests/invariants.test.mjs && node tests/routes.mjs && node tests/jing.mjs && node tests/costs.mjs`
