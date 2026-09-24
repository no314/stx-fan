# Note: mainnet fork simulation as a standing build practice

Date 2026-09-23. Written on request, not applied to any skill yet.

## What it is

A stxer simulation forks mainnet at the current tip, deploys the exact source under test, runs any sequence of contract calls, Eval code (including writes to other contracts' maps, fork only), block advances and reads, and returns per step results plus a browsable trace. No key, no broadcast, no testnet. The fork has the real pox-5, sBTC ledger, DEX pools, Jing markets and oracle storage at their live state.

What it catches that simnet mocks cannot: deploy analysis against the real callees (trait typed arguments, tuple shapes, `(ok (optional ...))` versus `(optional ...)` returns), arithmetic against real pool state, real error codes from real venues, real cost figures for the real contract sizes, and sequencing across burn blocks.

What it does not replace: simnet suites for invariants and edge cases (fork runs are slow, remote and rate limited), and a real broadcast on testnet or mainnet for wallet post-conditions and inclusion behaviour.

## Where it belongs

In `anthropic-skills:stacks-dapp-architecture` (or a sibling `stacks-contract-verification` skill), as the verification tier between simnet and mainnet for any contract that calls deployed contracts. Rule: a contract that pins mainnet principals is not "tested" until the exact deploy source has passed analysis and one lifecycle on a mainnet fork.

## Proposed skill text (draft, to be refined against one real run)

1. When to run: after the simnet suites pass and before the structure hash is recorded as final. Rerun on any change to a pinned principal or to a call into one.
2. Tooling: `stxer` npm package, `SimulationBuilder.new({stacksNodeAPI, apiEndpoint, skipTracing})`, `.useBlockHeight(tip).withSender(deployer)`, `addContractDeploy` with `ClarityVersion.Clarity6`, `addContractCall`, `addEvalCode` (writes allowed, fork only), `addAdvanceBlocks({bitcoin_blocks, stacks_blocks_per_bitcoin, bitcoin_interval_secs})`, `run()` then `getSimulationResult(id)`; results at `result.steps[i].Result.{Transaction,Eval,AdvanceBlocks}`.
3. Shape of a run: a plan array of `{label, kind, want}` built alongside the builder so results are checked by index; `want` as a literal string or a predicate; derived checks (deltas, ratios) computed after the run from recorded slot indices; write a JSON report with the stxer URL.
4. Fixtures: seed protocol state with Eval `map-set`/`var-set` inside the protocol contract (record the map names and key shapes from the deployed source with the date); fund contracts by transferring from a large real holder inside the fork; call protocol callbacks (like `validate-stake!`) from inside the protocol contract's Eval context so `contract-caller` is right.
5. Two profiles per contract: guards (deploy, read-onlys against real state, every authorization refusal) and lifecycle (the real happy path end to end with replay and liability checks).
6. Oracle inputs: when a venue needs a signed update (Pyth Lazer for Jing v6), fetch one from the venue's public backend at run time and pass it as a `(buff 8192)`; the freshness check stays enabled, so compress block intervals with `bitcoin_interval_secs: 1` when advancing.
7. Network: the runner needs egress to a Stacks API and to `api.stxer.xyz`; sandboxes without it write the runner and hand it over, marked NOT RUN, with the expected fixture adjustments listed.
8. Record: the stxer URL, block height, and the check table go into the handoff next to the structure hash.

## Reference implementations

- fastpool/fastpool-pox-5 PR 1, `simulations/_pool-vault-stxer.mjs` (two contracts, Lazer update, 82 checks).
- This project, `signer-manager-stx-payout/simulations/fork-stxer.mjs` (one contract, no oracle input, written 2026-09-23, not yet run).
