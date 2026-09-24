# Mainnet fork simulation (stxer)

`fork-stxer.mjs` deploys the exact mainnet source on a stxer fork of mainnet at the current tip and drives it against the real pox-5, sBTC, Bitflow DLMM, Velar and Jing v6 contracts. Nothing is broadcast, no key is needed. It is the step the simnet suites cannot do: the DLMM route passes trait typed arguments to the real `SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA.dlmm-core-v-1-1`, and every quote runs against real bins and reserves.

    npm install                               # stxer 0.12.0 is in package.json
    node simulations/fork-stxer.mjs           # deploy against real callees, guards, real quotes
    node simulations/fork-stxer.mjs --lifecycle
                                              # seeded rewards, real pull, settle-many, sBTC payout,
                                              # convert 25,000 sats on the best real route, Jing v6
                                              # deposit and cancel, convert the rest, STX payout,
                                              # replay refused, liabilities back to zero

Results go to `simulations/results/<contract>-{guards,lifecycle}.json` with the stxer URL of each run. Default contract is A (`signer-manager-stx-payout`); `CONTRACT=signer-manager-stx-payout-jing` runs contract B and adds the Jing steps.

Environment: `STACKS_API_URL` (default `https://api.hiro.so`) and `STXER_API_URL` (default `https://api.stxer.xyz`). `FORK_DEPLOYER` overrides the deployer used inside the fork (any funded mainnet address; the fork pays its fees).

Trait precondition. Both managers `impl-trait` `SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H.reward-claim-signer-manager-trait`, live since block 9050280. The runner checks Hiro for that contract; if it is absent (fork before that block, or a re-pointed trait) the fork deploys it first, under that exact address, and the deploy check label says so.

Run 2026-09-24 (guards, A, block 9053249, simulation `156114293fd68865df9a23b91594849e`): 1/13. The manager deploy failed with `use of undeclared trait <reward-claim-signer-manager-trait>` because A then pointed at an undeployed corrected trait (`-v2`, since withdrawn: A and B now implement the published trait, design decision 15); every later check failed on `NoSuchContract`. Rerun pending.

Run 2026-09-24, second (guards, A with design decisions 14 and 15, block 9053554, simulation `8e59f9b06d59dfda3ba72c1f1f73c672`): 12/13. Deploy `(ok true)` against the live trait; `get-routes` pinned to the real principals; `quote-routes u100000` on real pools: DLMM `(some u272438530)` with `dlmm-filled u100000`, Velar `(some u273528604)`; `get-pending-conversion` empty with `stranded false`; the four permission and two nothing-pending checks returned their codes. The single FAIL was the runner's own predicate on `quote-dlmm-raw`, which expected a response and got the read-only's optional `(some (tuple (filled u100000) (out u272438530)))`; predicate corrected the same day. The lifecycle profile did not run (the guards command failed first).

Run 2026-09-24, third (A, block 9053565). Guards 13/13, simulation `303a64baa3b7dee7d9280a1081082e74`. Lifecycle 36/36 on-chain steps, simulation `99e973ce2085298dc01d9390c63a7a14`: fork-only funding of the real pox-5 and the reward fixture accepted; Bob elected STX through v3 calldata, Alice stayed on sBTC; the real pox-5 `claim-rewards` pull returned `earned u100000` (the fixture worked first time, no adjustment needed); `settle-many` settled both; Alice paid 25,000 sats; Bob refused before conversion (u1019); quote for 25,000 sats DLMM `u68191055`, Velar `u68477507`; `convert` took route 2 (Velar) at `ustx-out u68477507`, exactly the quote; the remaining 50,000 sats converted on Velar for `u136815724`, epoch 1 closed at `ustx-out u205293231`; Bob paid `u205293231` micro-STX, replay refused (u1016); STX liability `u0`; sBTC `unattributed-balance u0`. The runner then crashed in its derived checks (`field` did not parse `(dlmm (some uN))`, so the best quote was undefined); parser fixed the same day, and the three derived checks evaluate to pass on the printed values: tranche 1 realized 68,477,507 against best quote 68,477,507, Alice delta 25,000 sats, Bob delta 205,293,231 equals the epoch output. The report JSON for that lifecycle run was not written because of the crash.

Run 2026-09-24, fourth (A, lifecycle, block 9053602, simulation `3aa0db3ecc36833828bd62703b829ee6`): 39/39, the 36 on-chain steps plus the three derived checks. Quotes had moved with the market (100,000 sats: DLMM `u270075189`, Velar `u272444418`; 25,000 sats: DLMM `u67576003`, Velar `u68180221`); `convert` again took Velar at exactly the quoted `u68180221`, the remaining 50,000 sats for `u136222057`, epoch output `u204402278`, Bob paid `u204402278`. Report written to `simulations/results/signer-manager-stx-payout-lifecycle.json`. This is the run of record for A.0 at structure hash `6b605581cdbf5c07aa584b75d6bad6ae7653e13f80210dbdc765ab88938d31bf`.

Not yet exercised on the fork: the DLMM swap itself (Velar quoted higher in every tranche so far). To force it, the mainnet dry run disables route 2 for one tranche; or add a fork step `set-route-enabled u2 false` before a conversion. Contract B has not been run on the fork.

Status 2026-09-23: written. Expect one round of adjustment on the pox-5 fixture in the lifecycle profile: it seeds `staker-unclaimed-rewards-for-cycle` directly; if the real `claim-staker-rewards-for-signer` returns `earned u0`, seed `staker-rewards-per-token-settled-for-cycle` to `u0` instead and let pox-5 compute earned from shares. The map names and key shapes were read from the deployed pox-5 source that day.

For contract B the Jing steps need a signed Pyth Lazer update in `LAZER_UPDATE_HEX` (FastPool fetches one from Jing's public backend in `jing-contracts-v3/simulations/_lazer.js`); without it, and while `markets-sbtc-stx-jing-v6` is paused, the Jing steps accept the market's own refusal codes and only prove that the calls reach the real market with the right argument shapes.

Pattern taken from fastpool/fastpool-pox-5 PR 1 `simulations/_pool-vault-stxer.mjs` (Rapha-btc), reduced to one contract and without the Pyth Lazer update, which our contract does not take.
