# Zero to Stacks Tax Export

A static page at `https://stx.fan/zero_to/tax-export/` that loads the confirmed transaction history of one or several public Stacks addresses (or of the address that holds a BNS-V2 name) from the public Hiro API and exports every token movement and fee, plus opening and closing balances with a reconciliation check, as CSV and Excel, with USD or EUR prices where a price is known. It signs nothing. Connect Wallet only reads an address.

**How it was built.** Claude with three skills (static-first-architecture, stacks-dapp-architecture, stacks-labs-dapp-design) and the one-page PRD (`PRD.md`). FatStx (MIT, Copyright (c) 2026 FatStx) is the functional reference; its price tables at the PR 77 head are reused as data. The code is new.

**Source and deploy.** This folder is the source. Only the built `dist/` goes into the `no314/stx-fan` repo, as `zero_to/tax-export/`, together with `PRD.md`, this README and `LICENSE-FatStx.txt` (already in `dist/` from `public/`).

## Commands

```
npm install                 # exact pins, lockfile committed
npm test                    # node --test: pure modules and the golden replay of the fixtures
npm run build               # dist/
npm run verify:app          # browser harness against dist/ with the fixtures (system Chrome, CHROME= to override)
npm run prices:update       # append Leather STX/BTC and Frankfurter EUR rows up to today; run before each deploy
npm run prices:import       # rebuild public/prices from a FatStx checkout at d523263 (PR 77 head)
node scripts/record.mjs <name> <address> <year|all> [USD|EUR]   # live load through the gate, saved as fixtures/<name>.json
node scripts/compare-live.mjs <fixture> <count> [txid prefix ...] # rows against the v1 transaction records
```

## Files

| File | What |
| --- | --- |
| `src/address.js` | c32check address check, mainnet only, exact round trip |
| `src/year.js` | year options and UTC bounds |
| `src/gate.js` | the read gate: 45 requests per minute, 429 cooldown, backoff 15/30/60/120 s, Retry-After when readable, five attempts |
| `src/loader.js` | the six stages; v3 index, balance changes, transfer feeds, events, lock events, token metadata, prices; resume after cancel or failure; BNS name |
| `src/rows.js` | API data to export rows: dedupe by (transaction, event), fees on the first row, reconciliation against the balance change, notes |
| `src/units.js`, `src/prices.js` | exact amounts (BigInt), decimal money, the price lookup with the 24 hour guard and EUR via the ECB rate; stSTXbtc as STX, stSTX as STX times the on-chain ratio |
| `src/paste.js` | the Several addresses paste: addresses and .btc/.stx names out of any text, key material discarded |
| `src/store.js` | the device cache of loads (IndexedDB); Clear Cache and Reset deletes it |
| `src/balances.js` | opening and closing balances per asset and the check opening + In - Out - fees = closing |
| `src/clarity.js`, `src/bns.js` | Clarity value decoder; BNS-V2 name to owner, address to primary name |
| `src/exportfmt.js`, `src/xlsxfile.js` | the 30 columns, CSV with the formula guard, Excel cells and the frozen header |
| `src/app.jsx`, `src/steps.jsx`, `src/core.jsx` | the page |
| `src/clients.js` | live gates per host, and the fixture mode (`?fixture=`, `?fail=<stage>`) |
| `src/vendor/connect.js` | the pinned `@stacks/connect` bundle of Zero to Signing, loaded only by Connect Wallet |
| `public/prices/` | price series as JSON, with `manifest.json` |
| `fixtures/` | recorded live responses: stillearly.btc 2025 USD and 2026 EUR (golden tests, harness), SP1EQGZT0WN75N5AMJH2C40N5GBJTEVY9E6ZY8EH3 all years (1,705 transactions, smoke test); not deployed |
| `test/` | node tests; `golden.test.js` replays the fixtures |
| `scripts/verify-app.mjs` | 94 browser checks; screenshots in `screenshots/` |
| `scripts/record.mjs`, `scripts/resume-live.mjs`, `scripts/compare-live.mjs`, `scripts/record-names.mjs` | live smoke test and fixture recorder, live resume of a recorded load, rows against the v1 records, BNS name lookups into a fixture |

## URL

`?address=SP...&year=2025&currency=USD&peg=aeusdc&api=https://api.hiro.so&rpm=45`. `peg` lists the pegged tokens the user chose to count at 1:1 and is absent when none is chosen. Every parameter is always visible. `rpm` above 45 is lowered to 45 for api.hiro.so. Several addresses: `address=SP1,SP2`. Loaded data is kept in IndexedDB on the device, so a refresh restores it; nothing goes to localStorage.
