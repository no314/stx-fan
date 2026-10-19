# Protocol and endpoint constants (dated)

Each value carries the date it was last verified and the source named in the app that pins it. Recheck when stale. `writing-stacks-protocol-facts` is the primary owner of protocol facts; this file holds what the apps pin.

## Hiro API

- Public budget: 50 requests per minute per IP unauthenticated (header check 2026-10-14); also 20 requests per second (seen live 2026-10-15). A deliberate burst on 2026-10-15 had 37 of 70 requests answered 429.
- With an API key the published figure is 500 per minute; a credited key observed on 2026-09-30 carried `x-ratelimit-limit-minute: 50` and `x-ratelimit-limit-second: 20`, so the key's plan sets the budget. A bogus key returns 403.
- A 429 carries `Retry-After` and the ratelimit headers but no `access-control-allow-origin`, so the browser reports a network error; normal responses expose only `X-API-Version` to browsers (checked 2026-10-14 and 2026-10-15).
- Gate values in use: 45 per minute over a 61-second window (a 60-second window let 46 requests into one server-side minute), 100 ms minimum gap, backoff 15, 30, 60, 120 seconds plus up to 1 second jitter, five attempts (tax export, 2026-10-15); Zero to Claiming `THROTTLE_RPM` 45.
- API version 9.6.0 (2026-10-14): every v1 and v2 address endpoint is deprecated; the v3 `/extended/v3/principals/{p}/...` family replaces them with keyset cursors. Transactions index `limit=50`; balance-changes 20 tx_ids per request, `limit=50`, paged; transfer feeds `limit=50` maximum (`limit=100` answers HTTP 400); transaction events `limit=100` (anything above answers 400, verified 2026-09-10); transactions batch 20 ids. Cursor forms `{height}:0:0` for the index and `{height}:0:0:0` for the feeds; `{height}:2147483647:2147483647` answers HTTP 500. The index cursor `{height}:0:0` widens to the whole block unless the address has a transaction at index 0 of that block.
- `/extended/v1/address/{p}/balances?until_block=` includes locked STX in `stx.balance`; `/v2/accounts` reports only the unlocked part (checked 2026-10-15). No v3 equivalent with a height.
- `/extended/v1/tx/events?address={p}&type=stx_lock` is deprecated with no v3 replacement; still required to find locks another address sent.
- `/v2/contracts/call-read/...?tip={index_block_hash}` reads state at a past block (checked back to January 2024); a contract absent at that block answers 200 with `okay:false` and `NoSuchContract`.
- Metadata API: 404 for an unknown token, 422 "Metadata could not be parsed or it does not conform to SIP-016" for broken metadata; both are answers (2026-10-15).
- `/v1/names/<fqn>` still answers for a BNSv2 name with the correct owner but `expire_block: 0` and an empty zonefile; do not use it for anything (Zero To BNS PRD, 2026-10).
- `/extended/v3/staking` endpoints carry lifetime aggregates and bare principals; per-cycle construction still needs contract reads (September 2026).

## stacks-node and Clarity

- `read_only_call_limit` defaults: `read_count` 100, runtime 1e9. A cost rejection is HTTP 200 with `okay:false`.
- Tenure budget since epoch 4.0 (burn height 960,230), stacks-core 4.0.1 `BLOCK_LIMIT_MAINNET_40`: 30,000 reads, 200,000,000 bytes read length, 15,000 writes; a miner on the default configuration lets each block take 25 percent of what is left (`DEFAULT_TENURE_COST_LIMIT_PER_BLOCK_PERCENTAGE`); mempool heuristic 20 percent (`TX_BLOCK_LIMIT_PROPORTION_HEURISTIC`).
- Trait references are illegal in read-only functions; `map` and `fold` callbacks cannot close over locals; a public function returning `err` rolls back the whole transaction, so per-entry error isolation needs a `contract-call?` boundary per entry.
- STX post-conditions cover burns: stacks-core sums `amount_transferred` and `amount_burned` (`stackslib/src/chainstate/stacks/db/transactions.rs`). A contract burning its own escrow surfaces under deny mode as "Fungible asset ... BURNED::BURNED was moved by ... but not checked".
- Simnet cannot set `tx-sponsor?` (always `none`), cannot run `is-standard` on mainnet principals, and cannot resolve mainnet principals.
- Clarity's `contract-hash?` is SHA-512/256 over the deployed source bytes. The apps' structure hash: strip `;;` comments, tokenize on `(`, `)`, `{`, `}` and whitespace, join with U+0001, SHA-256. Draft SIP-043 pins the canonical form as `clarinet format` output hashed with SHA-512/256.
- Mempool chaining limit 25 transactions per account (`MAXIMUM_MEMPOOL_TX_CHAINING`); admission floor 1 uSTX per byte (`MINIMUM_TX_FEE_RATE_PER_BYTE`).

## pox-5 and cycles

- pox-5 principals: mainnet `SP000000000000000000002Q6VF78.pox-5`, testnet `ST000000000000000000002AMW42H.pox-5`. `get-staker-info` returns `amount-ustx`, `first-reward-cycle`, `num-cycles`, `signer`.
- Mainnet cycle geometry: 2100 blocks, the last 100 the prepare phase. From `/v2/pox`: `end = next_cycle.reward_phase_start_block_height`, `start = end - reward_cycle_length`, prepare when `current_burnchain_block_height >= next_cycle.prepare_phase_start_block_height`; the cycle's last block is `end - 1`. Recorded fixture 2026-09-30: `reward_cycle_length` 2100, `current_burnchain_block_height` 969285, cycle 144, `prepare_phase_start_block_height` 970450, `reward_phase_start_block_height` 970550.
- Staking through a signer manager: 1 to 96 consecutive cycles (a PRD said 48), signing minimum 50,000 STX. `FIRST_CYCLE_MAINNET` 141, overridden at runtime by `/v2/pox` `first_reward_cycle_id`.
- pox-5 attributes every successful stake, register-for-bond, stake-update and unstake to the staker as an `stx_lock` event whoever made the call (stacks-core 4.0.1 `pox-locking/src/pox_5.rs`, verified live 2026-10-11); events carry no contract id. A pooled bond staker's lock events sit on the pool principal.
- `api.hiro.so/v2/pox` answers cross-origin requests from stx.fan (checked 2026-09-30).

## BNS-V2

- Mainnet `SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2` and `SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.zonefile-resolver`; testnet `ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M.BNS-V2`, redeployed at block 170087 after the 2026-08 reset.
- Reverse lookup order: `get-primary` (returns `(err u131)` for no primary), then the NFT holdings endpoint plus `get-bns-from-id`, then `https://api.bnsv2.com/names/address/{addr}/valid`. Forward lookup: `get-owner-name(name buff 48, namespace buff 20)` through call-read, fallback `https://api.bnsv2.com/names/{name}.{ns}`. `get-bns-info` returns a seven-field tuple with the owner.
- api.bnsv2.com list endpoints page at 50 with `total` and `offset`; 97 launched namespaces on 2026-10-09. Name labels at most 48 bytes, namespaces at most 20; charset `a-z 0-9 - _`.
- `PREORDER-CLAIMABILITY-TTL u144`: `name-register` valid at created-at + 2 through + 143, `claim-preorder` strictly after + 144; `NAME-GRACE-PERIOD-DURATION u5000`. Lifetimes `.stx` 0, `.btc` 262800, `.id` 52595 (api.bnsv2.com, 2026-08-15).
- Commission contracts (fees from deployed source, 2026-09): gamma `SPNWZ5V2TPWGQGVDR6T7B6RQ4XMGZ4PXTEE0VQ0S.gamma-commission-v1` 200 bps; bns.one `SM18RN48GX7E3ED23M03BY4QD8EA2DG2R4VX4CDYJ.bns-one-commission` 500 bps; zero-fee `SP3FJQK31NMDM594YKP1640V5WESX38ENSSJ3YC6B.bns-zero-commission` (mainnet) and `ST3FJQK31NMDM594YKP1640V5WESX38ENSSY6DMBF.bns-zero-commission` (testnet) 0 bps.

## sBTC and Emily

- sBTC token `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`, 8 decimals; registry `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-registry`.
- Emily CORS on POST echoes the request origin rather than returning `*`; methods `GET, OPTIONS, POST`; headers `content-type, x-api-key`; no API key required (live preflight 2026-08-14). Endpoints verified live 2026-08-14: `GET /deposit/{txid}`, `POST /deposit`, `GET /deposit/reclaim-pubkeys/{x_only_hex}`. `GET /deposit/recipient/{recipient_raw}` unverified. Emily reads are cached upstream; `lastUpdateHeight` is a Stacks height and the record carries no registration timestamp.
- Deposits sweep in one to two Bitcoin blocks (about 10 to 30 minutes); withdrawals wait until Bitcoin block N+6 (docs.stacks.co, 2026-09-03).

## Other hosts

- Leather prices `https://api.leather.io/v1/market/prices/native/{STX|BTC}/history?period=1y`: daily snapshots for 365 days, CORS open with an `X-Client-ID` header, 403 without it (2026-10-14).
- Frankfurter `https://api.frankfurter.dev/v1/{from}..{to}?base=EUR&symbols=USD`: ECB rates per business day.
- CoinGecko keyless history covers only the last 365 days (401 before), one request per date; CoinMarketCap needs a key on every call, no CORS header, about a month of history on the free plan (2026-10-14 and 2026-10-15).
- mempool.space with blockstream.info as an esplora-compatible fallback for Bitcoin reads.
- c32 address versions: mainnet 22 (SP) and 20 (SM); testnet 26 (ST) and 21 (SN). c32 decoding maps O to 0 and I and L to 1.
