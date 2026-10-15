# PRD: Zero to Stacks Tax Export (zero_to/tax-export)

One page, nothing to sign. Paste a public Stacks address or take it from a
connected wallet, load its full transaction
history from the public Hiro API, review it, and export every token movement and
fee as CSV and Excel, with USD or EUR prices where a price is known. Written
2026-10-14. It replaces FatStx as the primary "Tax" link once it is live, and it
reuses FatStx (MIT) as the functional reference, including the price fixes of
FatStx PR 77.

Skills: static-first-architecture (rung 1 static build plus rung 2 browser JS; no
backend, no key), stacks-dapp-architecture (Tier 2: mainnet data that people act
on, read gate, pinned hosts; the wallet supplies an address and nothing else), stacks-labs-dapp-design (tokens,
step rail, voice).

## 1. Objective and non-goals

A Stacks holder, typically a staker, gets an independent record of every
transaction that changed their balances: token, quantity, timestamp, fees,
counterparties, and a fiat price where one is known. The record is complete or
it says that it is not.

Non-goals:

- No tax classification. The export never says "income", "gain", "disposal" or
  "taxable". It records movements; a person or tax software classifies them.
- No cost basis, no gains, no portfolio view (FatStx made the same choice).
- No signing and no wallet request other than reading addresses.
- No testnet. Mainnet only, mainnet accent.
- No pending (mempool) transactions.
- No analytics or tracking (FatStx loads Google Analytics; this app does not).
- No mobile layout (viewport width=1200, same as the other apps).

## 2. Glossary

Use these terms exactly, in UI copy, export headers, code and state.

| Term | Meaning |
|---|---|
| address | the Stacks principal the user entered (standard `SP`/`SM` or a contract principal) |
| transaction | one confirmed Stacks transaction that involves the address |
| movement | one asset change for the address inside a transaction: one STX, FT or NFT event leg (transfer, mint, burn) or one STX lock |
| row | one line in the export: one movement, or one fee-only line when a transaction has no movement |
| fee | the transaction fee in STX |
| fee payer | the sponsor of a sponsored transaction, otherwise the sender |
| token | STX, a SIP-010 fungible token, or an NFT |
| asset identifier | `stx` for STX, otherwise `ADDRESS.contract::asset` |
| price | the price of one token unit in the selected currency |
| value | amount multiplied by price |
| request | one HTTP call to a read host |
| stage | one step of the loading work (section 5) |
| complete / incomplete | whether every request of every stage succeeded |

## 3. Flow

Four steps, numbered from 1. All steps are re-enterable after Load finishes.

1. **Address.** Inputs: address, year, currency. The address comes from the
   input field or from "Connect Wallet" (section 10a); both paths fill the same
   field. The field also takes a BNS-V2 name (`stillearly.btc`): half a second
   after typing stops, the page reads the owner with BNS-V2 `get-bns-info`
   (api.bnsv2.com `/names/{name}` as the fallback) and shows "stillearly.btc
   belongs to SP..."; the export is for that address and the About sheet names
   the name (decided 2026-10-15). An unregistered name gives "No address holds
   the name ... Check the name." The URL keeps what was typed. The address must pass a
   c32check checksum and the mainnet prefix check; errors are inline. Year:
   dropdown, as in FatStx, from 2019 to the current year, default the previous
   year; one calendar year in UTC, 1 January 00:00:00 to 31 December 23:59:59.
   The last option is "All years". Custom date ranges are not in v1 (decided
   2026-10-14). Currency: dropdown, USD (default) or EUR. Primary action
   "Load Transactions". A link in the URL fills the inputs but does not start
   loading: loading costs minutes of the shared API budget.
2. **Load.** The stage list (section 5) with live counts, a reader line naming
   the read host and the request limit, "Cancel" while running, "Retry Failed
   Requests" after a failure or cancel. The step completes when every stage is
   done, or when the user cancels or a stage stops with failures; then the
   primary action is "Review" or "Review Incomplete Results".
3. **Review.** Summary: transactions, rows, tokens, rows with and without a
   price, failed transactions, sponsored transactions, rows with a note that
   needs attention. Per-token table: asset identifier, symbol, total in, total
   out, net, price available yes/no. A view filter "Show only tokens with a
   price" (default off; view only, never applied to the export). The first 200
   rows render; the export holds all of them. Coverage limits (section 9) appear
   here as a short list.
4. **Export.** "Download CSV" and "Download Excel". The file name and an inline
   status say complete or incomplete. Info section explains each column. "Next
   steps": tax software that imports CSV, or an accountant; link to the other
   tools in the Tax menu.

Incomplete results stay exportable. Every incomplete export carries the label in
the file name, in an "Export status" column on every row, and on the Excel
"About" sheet.

## 4. Reads

Pinned hosts: `https://api.hiro.so` (blockchain API and token metadata API share
one quota), `https://api.leather.io` (prices after the static tables end),
`https://api.frankfurter.dev` (EUR rates after the static table ends),
`https://api.bnsv2.com` (BNS name fallback, section 10a). Every v1
and v2 address endpoint is deprecated; the app reads v3 (API v9.6.0, checked
2026-10-14).

| Data | Endpoint | Page size, paging |
|---|---|---|
| transaction index | `/extended/v3/principals/{p}/transactions` | 50, keyset cursor, newest first; a new transaction at the tip does not shift later pages |
| per-transaction balance changes for the address | `/extended/v3/principals/{p}/balance-changes?tx_id=a,b,...` | 20 transactions per request; one result per transaction and asset, so the response is paged too (`limit=50`, cursor) |
| STX legs with counterparty and memo (send-many memos decoded) | `/extended/v3/principals/{p}/transfers/stx/inbound` and `/outbound` | cursor |
| FT legs per token | `/extended/v3/principals/{p}/transfers/ft/{asset_identifier}` | cursor |
| NFT legs, and any transaction that fails reconciliation | `/extended/v3/transactions/{tx_id}/events` | 100 events, paged to `event_count` |
| STX locks (not in the v3 index when another address sent the lock, e.g. a pool operator) | `/extended/v1/tx/events?address={p}&type=stx_lock` | 100, offset (deprecated, no v3 replacement) |
| summaries of lock transactions missing from the index | `/extended/v3/transactions/batch?tx_id=...` | 20 per request |
| owner of a typed BNS-V2 name | call-read `BNS-V2::get-bns-info`, then `api.bnsv2.com/names/{name}` | one or two |
| STX per stSTX at a transaction's block | call-read with `?tip={index_block_hash}`: `reserve-v1::get-total-stx`, `ststxbtc-token` and `ststxbtc-token-v2::get-total-supply`, `ststx-token::get-total-supply` | four per stSTX transaction |
| token name, symbol, decimals | `/metadata/v1/ft/{contract_id}`; 404 (unknown) and 422 (metadata that does not parse) are answers, not failures | one per FT contract |
| decimals when the metadata has none | `/v2/contracts/interface/{addr}/{name}` then call-read `get-decimals`, only when the contract defines exactly this one fungible token | two per such token |

The index includes a transaction when the address is the sender, the fee payer
(the sponsor when sponsored), the called or deployed contract, or a party to any
STX, FT or NFT transfer, mint or burn (API source `updatePrincipalTxs`). Failed
transactions are in the index with their fee and have no events.

Year: one request to `/extended/v2/blocks/by-block-time/{unix seconds}` finds
the last block at or before 31 December 23:59:59 UTC; the index walk and the
feeds start at cursor `{height}:0:0` (the API widens it to the whole block) and
stop at the first transaction before 1 January. Newer years cost no requests.
Checked live 2026-10-14: the block at the end of 2025 is 5618157, and the
cursor `5618157:2147483647:2147483647` answers HTTP 500, so the app uses the
`:0:0` form. "All years" and the current year start at the newest transaction.
Time is the Stacks block time (`block.time_iso`), which equals the Bitcoin
block time before Nakamoto.

Request budget, as a guide for the progress copy: for N transactions about
N/50 + N/20 requests plus the feed pages and one per token. 1,000 transactions
with 10 tokens is roughly 100 to 150 requests, about 3 minutes at 45 per minute.

## 5. Read gate, progress, cancel and retry

One gate per host, copied from Zero to Claiming `src/chain.js` (`gate`,
`apiFetch`). Every Hiro request goes through it: index pages, balance changes,
feeds, events, lock events, batch lookups, metadata and retries.

- Sliding one-minute window: 45 requests per minute on `api.hiro.so` (the public
  limit is 50; header check 2026-10-14), and at least 100 ms between requests
  (Hiro also limits 20 per second; a burst on 2026-10-15 answered 37 of 70
  requests with 429). `?rpm=` lowers it; values above 45 are
  clamped for `api.hiro.so`. A different `?api=` host may use any value.
- Retry on HTTP 429, 5xx, and a network error (a 429 without CORS headers reaches
  the page as a network error). One 429 sets a cooldown that stops every pending
  request on that host.
- Wait time: `Retry-After` (seconds or HTTP date) when the browser can read it;
  otherwise 15, 30, 60, 120 seconds plus jitter. Hiro sends `Retry-After` on a
  429, but the 429 carries no `access-control-allow-origin` header (checked
  2026-10-15), so a browser sees a network error and cannot read it; normal
  responses expose only `X-API-Version`. On Hiro the fixed schedule applies; the code still reads the
  header so a node that exposes it is respected. Five attempts, then the request
  is recorded as failed.
- A failed request stops its stage. Later stages run only on data they can trust;
  the review shows which transactions are affected. "Retry Failed Requests"
  resumes from the failed request; nothing already loaded is fetched again.
- "Cancel" aborts the in-flight requests (AbortController). Results so far stay
  in memory and are labelled incomplete.

Stages, in order, each with its own line:

1. Find transactions. "Page 3. 150 transactions found." For "All years" the
   index `total` is known: "150 of 1,204 transactions".
2. Read balance changes. "340 of 1,204 transactions."
3. Read token movements (STX and FT feeds, then NFT and reconciliation events).
4. Read stacking locks.
5. Read token details. "4 of 12 tokens."
6. Read prices. "2 of 3 price series."

Counts only; a progress bar appears only when the total is known, and it floors.
The constraint line under the stage list says the limit and the time left:
"Requests are limited to 45 per minute. About 4 minutes left." During a
cooldown: "The API refused a request (limit reached). The next attempt is in
30 seconds." The loading indicator stays visible until the last stage ends.

## 6. From API data to rows

Pure module `src/rows.js`, written test-first. Inputs are the recorded API
responses; output is the row list.

- **Dedupe.** Transactions by `tx_id`; movements by `(tx_id, event_index)`, never
  by content (two identical send-many legs to one recipient are two rows).
- **One row per movement that touches the address.** Direction: `In`, `Out`,
  `Self` (sender and recipient are the address), `Locked`. Mints are `In` with no
  sender; burns are `Out` with no recipient. Movements between other parties in
  the same transaction are not rows (a swap through pools shows only the
  address's legs).
- **Reconciliation.** Per transaction and asset, the sum of the address's legs
  must equal the API balance change (for STX, after removing the fee when the
  address is the fee payer). A mismatch keeps the rows and adds a note; the
  review counts these rows.
- **Fees.** Filled on the first row of each transaction only, so any fee column
  can be summed. Columns: network fee, fee token (STX), fee payer, fee paid by
  this address (the fee when the address is the fee payer, otherwise 0).
  Sponsored: the sponsor pays; the sender's row says so in a note. A transaction
  the address only sponsored gets a fee-only row.
- **Fee-only row.** When a transaction has no movement for the address, it still
  gets one row with direction `None`: failed transactions, contract calls with no
  asset change for the address, sponsorships, stacking calls.
- **Failed transactions.** Status `Failed`, no movements (the API drops events of
  failed transactions), fee paid by the fee payer.
- **Stacking transactions.** Stake, stake-update and unstake (PoX-5),
  delegate-stx and revoke-delegate-stx (PoX-4), and pool calls are ordinary
  transactions: the address signs them and pays the fee, so they get rows like
  any other transaction. An `stx_lock` event for the address adds a row with
  direction `Locked`, the locked amount and the unlock Bitcoin height in the
  note. PoX-5 stake, stake-update and unstake all emit one (unstake states the
  new, earlier unlock height). A lock does not change the balance and is not a
  transfer. A lock that a pool operator sent for the address (PoX-4
  `delegate-stack-stx-many`) is not in the v3 index; it comes from the lock
  events read and gets a `Locked` row with fee paid 0. Only an unlock that
  happens by itself when the lock period ends has no transaction and no row.
- **Amounts.** Exact decimal strings from integer base units (BigInt), never
  floats. Decimals: 6 for STX, from the metadata API for FTs. When decimals are
  unknown (404, or the field is missing, as for some LP tokens), the amount stays
  in base units, the decimals column is empty, and a note says so. Before that,
  the contract's own `get-decimals` is read when the contract defines exactly
  this one fungible token (found live: 3 of 130 tokens of a large address had
  no usable metadata). The metadata
  API describes only the contract's SIP-010 asset; another asset in the same
  contract has unknown decimals unless pinned. Pinned: `sbtc-token::sbtc-token-locked`
  has 8 decimals (sBTC moves there when a withdrawal starts and is burned when
  it is accepted). NFTs: amount 1 and the NFT ID (`value.repr`).
- **Tokens.** Identified by asset identifier, never by symbol (three contracts
  use the symbol stSTX). Unknown and unsolicited tokens stay in the export with
  their full identifier. No token is called spam or a scam. A missing price is
  the neutral signal.

## 7. Export columns

Same columns, same order, in CSV and Excel. Times are UTC, ISO 8601 with a `Z`.

1. Address
2. BNS name (primary BNS-V2 name of the address)
3. Time (UTC)
4. Direction (`In`, `Out`, `Self`, `Locked`, `None`)
5. Amount
6. Token symbol
7. Token name
8. NFT ID
9. Value ({currency})
10. Price ({currency})
11. Price date (UTC)
12. Price source
13. Price available (`Yes`, `No`, `1:1 by user`)
14. Fee paid by this address (STX)
15. Fee value ({currency})
16. Network fee (STX)
17. Fee token
18. Fee payer
19. Memo
20. Notes
21. From
22. To
23. Transaction ID
24. Explorer link (`https://explorer.hiro.so/txid/{tx_id}?chain=mainnet`)
25. Status (`Success`, `Failed`)
26. Transaction type (`STX transfer`, `Contract call`, `Contract deploy`, `Coinbase`, `Tenure change`, `Other`)
27. Contract function (`ADDRESS.contract::function`, contract calls only)
28. Row in transaction (`1 of 3`)
29. Asset identifier
30. Amount (base units)
31. Decimals
32. Export status (`Complete`, `Incomplete`)

Order (decided 2026-10-15): who and when, what moved, its value, the fee this
address paid, then the context of the row, then the reference data.

File names: `stacks-export_{address}_{year}_{currency}.csv` and `.xlsx`,
with `_INCOMPLETE` before the extension when incomplete. Year is `2025` or
`all`.

CSV: UTF-8 with BOM, comma separated, RFC 4180 quoting. Any cell that starts
with `=`, `+`, `-`, `@`, tab or carriage return gets a leading apostrophe:
token names are chosen by token creators and must not run as formulas.

Excel: sheet "Transactions" with the columns above, header row frozen, text
cells written as text (no formulas ever). Amount, price and value are numbers
when the decimal string has 15 or fewer significant digits, otherwise text, so
Excel never rounds them silently; base units are always text. Sheet "About": address, year, timezone ("All times are UTC."), currency,
time of export, read host, complete or incomplete with the failed requests,
price sources and their date ranges, the coverage limits of section 9, and the
FatStx credit and licence notice. Library: SheetJS Community Edition 0.20.3,
vendored from the SheetJS CDN tarball (the npm registry copy stops at 0.18.5).

Notes, one sentence each, joined by a space. Only these, added only when the
data proves them:

| Condition | Note |
|---|---|
| sponsored, address is the sender | Another address paid this transaction fee. |
| address is the sponsor | This address paid the fee for a transaction from another address. |
| failed | The transaction failed. The fee was paid. No tokens moved. |
| address is not sender or fee payer (`involvement: affected`) and has a movement | This address did not send this transaction. |
| mint to the address | New tokens were created and sent to this address. |
| burn from the address | Tokens were removed from this address and destroyed. |
| lock | The STX is locked for stacking until Bitcoin block {height}. The balance did not change. |
| self | This address sent tokens to itself. |
| decimals unknown | The token decimals are not known. The amount is in base units. |
| no price | No price is available for this token on this date. |
| reconciliation mismatch | The token movements do not match the balance change. Check this transaction in the explorer. |
| incomplete stage touched this transaction | The data for this transaction is incomplete. |

## 7c. Several addresses (decided 2026-10-15)

- Step 1 has a collapsed option "Several addresses" below the address field: a
  text box for a paste of any shape (spaces, commas, lines, explorer links, an
  export). The page keeps every mainnet standard address that passes the
  checksum, without duplicates, and ignores all other text. A match followed by
  `.name` is a contract principal (for example a token) and is ignored. One line
  reports what was found and what was ignored (testnet, failed checksum,
  contract). Each found address has a remove control.
- BNS names in a paste: only `.btc` and `.stx` (other namespaces collide with
  ordinary words in pasted text; the single address field takes every namespace).
  Each name resolves like a typed name and shows "name belongs to address" with a
  checkbox "Confirmed". Loading starts only when every name is confirmed or
  removed.
- Key material: a paste with a seed phrase (8 or more consecutive BIP39 words,
  spaced or joined) or a private key (WIF, extended private key) is discarded
  whole and never shown: "The paste looked like a seed phrase or a private key.
  It was removed." (the classifier of sBTC Deposit Recovery `src/parse.js`).
- No cap. The copy recommends 20 addresses or fewer: each address costs its own
  requests at the same 45 per minute.
- One combined export. Two new first columns: "Address" and "BNS name" (the
  address's primary BNS-V2 name, read with the connect-wallet reader, empty when
  none), so a spreadsheet can sort by either. Rows of all addresses are in time
  order. A movement between two listed addresses appears once per side and gets
  the note "Between two addresses in this export." The page does not merge or
  classify these.
- Balances per address and a total per token ("All addresses"); the check runs
  per address. File names use `{n}-addresses` in place of the address; the
  About sheet lists every address with its name.
- Loading runs the addresses one after the other through the same gate. The Load
  step shows "Address 2 of 5" with the stages of the current address and the
  state of every address; Retry continues each unfinished address.

## 7a. Balances and the reconciliation check (decided 2026-10-15)

A year export also needs what the address held. Per asset, the export gives the
opening balance (state after the last block before 1 January 00:00 UTC) and the
closing balance (state after the last block at or before 31 December 23:59:59
UTC, or the newest block when loading starts, for the current year and "All
years"; transactions after that block are left out of the load so the two agree).
"All years" opens at 0.

- Source: `/extended/v1/address/{p}/balances?until_block={height}`, one request
  per date (deprecated, no v3 equivalent with a height). Its STX balance includes
  locked STX (checked 2026-10-15: 354,221.958679 STX of which 354,000 locked, where
  the node's `/v2/accounts` reports only the unlocked part); the export gives the
  total as the balance and the locked part in its own column.
- Check per asset: opening + In - Out - fees paid by this address (STX only) must
  equal the closing balance, in base units. "Matches", or "Differs by {amount}",
  or "Not checked" when the load is incomplete. A difference marks the review
  and the About sheet. NFTs are counted per collection.
- Prices and values on both dates use the same lookup as rows (stSTX ratio read at
  the opening or closing block, the user's 1:1 choices included).
- Excel: a third sheet "Balances". CSV: a second file
  `stacks-export_{address}_{year}_{currency}_balances.csv`, with the incomplete
  label like the main file. Columns: Address, BNS name, Token symbol, Token name,
  Opening time (UTC), Opening balance, Opening value, Opening price, In, Out, Fees
  paid, Closing time (UTC), Closing balance, Locked (STX), Closing value, Closing
  price, Check, Price source, Asset identifier, Decimals, Export status.

## 7b. Pegged tokens chosen by the user (decided 2026-10-15)

Tokens meant to hold 1 USD (later also 1 BTC) whose peg the app does not
assume. On the Review step, a section "Pegged tokens without a price" lists the
tokens of the list that occur in this export and have rows without a price; a
master checkbox (mixed state when some are on) and one checkbox per token. Default
off. A market price always wins; the choice only fills rows that have none. The
choice recomputes prices in memory, no reload. URL: `&peg=aeusdc,susdt,usdh`, an
explicit list, never "all"; unknown keys are ignored.

- List: aeUSDC (`SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc::aeUSDC`,
  USDC bridged by Allbridge), sUSDT
  (`SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-susdt::bridged-usdt`, USDT
  bridged to Stacks), USDh (`SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1::usdh`,
  synthetic dollar from Hermetica). Never: USDA (has traded well below 1 USD and
  has a market price table), sUSDh (earns yield, not 1:1). Bridged BTC (aBTC,
  aeWBTC, pBTC, bxlBTC) only after each bridge is confirmed redeemable.
- Rows: Price available `1:1 by user`; Price source "User choice: 1 aeUSDC = 1
  USD. Not a market price."; note "The price assumes 1:1. The user chose this."
- Review: "Rows with a price" counts market prices only; "Rows with a 1:1 price
  you chose" when above 0; status line "{n} rows use a 1:1 price that you chose.
  Check these rates before you file." Step 4 repeats the line. About sheet: "1:1
  prices chosen by the user", always present, "None" when none.

## 8. Prices

Currency dropdown on step 1, USD (default) or EUR, as in FatStx. A price also
works as a filter: tokens without a market price show "No" in "Price available".

- **Static tables (rung 1).** The FatStx tables at the PR 77 head (`d523263`)
  are converted to JSON in `public/prices/` by `scripts/import-fatstx-prices.mjs`
  and loaded on demand: STX, BTC (also used for sBTC and zsBTC, as PR 77 does,
  and for xBTC as the FatStx FAQ does), DIKO, USDA, MIA, MIAv2, NYC, NYCv2,
  ALEX, BAN, SLIME, and EUR (USD per EUR, ECB, weekdays). PR 77 extended STX and
  BTC to 2026-10-07 and EUR to 2026-10-08.
- **Lookup rule.** Use the last table row at or before the transaction time, and
  only when it is less than 24 hours older than the transaction (the PR 77 guard,
  applied to every table, so a gap in an hourly table gives no price rather than
  a stale one). EUR: last ECB rate at or before the date, at most 4 days older
  (weekends and holidays). EUR value = USD price / USD per EUR. When the EUR rate
  is missing the row has no price; it never falls back to a USD number in a EUR
  column (FatStx bug).
- **After the tables end.** STX and BTC: one request per export to
  `api.leather.io/v1/market/prices/native/{STX|BTC}/history?period=1y` (daily
  snapshots, the last 365 days, CORS open with an `X-Client-ID` header; checked
  2026-10-14). EUR: one request to Frankfurter for the date range. These replace
  the CoinGecko fallback in FatStx: keyless CoinGecko history now covers only the
  last 365 days and costs one request per date (checked 2026-10-14), so the PR 77
  CoinGecko date-padding fix is no longer needed. Other tokens: no price after
  their table ends.
- **Refresh.** `scripts/update-prices.mjs` appends the Leather daily series and
  the Frankfurter rates to the tables up to the build date; run it before each
  deploy. The About sheet states each table's date range.
- **On chain, not from FatStx (decided 2026-10-15).** stSTXbtc (`ststxbtc-token`
  and `ststxbtc-token-v2`) uses the STX price: it is backed 1:1 by STX in the
  StackingDAO reserve, which is why `data-core-v3` `get-stx-per-ststx` subtracts
  its supply. stSTX uses the STX price times STX per stSTX at the transaction's own
  block (call-read with `?tip=`), from the contract StackingDAO itself used at
  that block. StackingDAO moved its STX twice for PoX-5, so: from block 8712127
  (`migration-v3::cutover`, tx `0x4e09ab67...`) `data-stx-v2::get-stx-per-ststx`;
  from block 8668379 (`migration-v2::cutover`, tx `0xba58cbd6...`)
  `data-stx-v1::get-stx-per-ststx`; before that the formula of
  `data-core-v3::get-stx-per-ststx` ((reserve-v1 STX minus stSTXbtc supply) times
  1e6 divided by stSTX supply, integer division) from four reads, where a contract
  that did not exist yet counts as 0. Checked 2026-10-15: the old formula goes
  negative after the first cutover, so the periods matter. A ratio that is not
  positive gives no price. The price source names the ratio, the contract and the
  block. Transactions in one block share one read. sbtc-token-locked uses BTC like sBTC.
- **USDCx at 1 USD (decided 2026-10-15).** `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx::usdcx-token`
  is Circle's USDC on Stacks (launched 2025-12-18, listed in Circle's launch post),
  backed 1:1 by USDC in Circle xReserve. The price source says so and that USDC is
  taken as 1 USD. Other dollar and bridged-BTC tokens stay unpriced: their peg is
  an assumption the app does not make for the user.
- **CoinMarketCap: not used.** Its API needs a key for every call (HTTP 401
  without one), sends no CORS header, and the free plan has at most about a
  month of history (checked 2026-10-15). A key in a static page is public.
- **Later, not v1.** Leather has a 1-year daily series for its top SIP-010 tokens
  (`/v1/market/prices/sip10s/{principal}/history`). It is undocumented and has no
  history before one year, so v1 does not depend on it.

Values use decimal arithmetic (decimal.js-light 2.5.1, as FatStx). The page
shows prices and values rounded half up to 2 decimals for readability. The
export keeps them exact: the price as its source gives it, and the value as the
unrounded product of amount and price.

## 9. Coverage limits

Shown on the review step and the About sheet.

- **Stacking (PoX-4 and earlier, PoX-5).** Every stacking transaction the
  address signs (stake, stake-update, unstake, delegate, revoke) is a row with
  its fee. Locks are rows (`Locked`), including locks a pool operator sent. An
  unlock that happens by itself at the end of a lock period has no transaction
  and no row. Bitcoin rewards of PoX-4 and earlier were paid on Bitcoin and are
  not in a Stacks export.
- **Other rewards.** Reward contracts that pay sBTC to many addresses at once
  (dual stacking `distribute-rewards`, for example) show as `In` rows with the
  note "This address did not send this transaction."
- **PoX-5 rewards.** Rewards accrue as sBTC and arrive when a signer manager
  pays a claim: that payment is an ordinary `In` row of sBTC. Accrued rewards
  that are not claimed are not movements and are not in the export.
- **Liquid staking.** stSTX (StackingDAO,
  `SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token`) and similar tokens show
  as ordinary movements: a deposit is STX `Out` and stSTX `In` (mint), a
  withdrawal is a burn. The yield is in the exchange ratio and is not a movement.
  rstSTX: no contract found under that symbol on 2026-10-14; it shows like any
  other token.
- **Mint and burn.** Recorded as `In` and `Out` with a note. The export does not
  say why tokens were created or destroyed.
- **Miner rewards.** Not verified; listed as not covered until a fixture proves
  them.
- **Pending transactions.** Not included.

## 10. URL and state

The URL holds the inputs; loaded data is kept on the device (decided 2026-10-15,
replacing the first version's zero persistence, which made a refresh cost a full
load of several minutes). Each address's load is saved in IndexedDB, keyed by
address, year, currency, read host and fixture, while it runs (at most every 5
seconds) and when it ends. A refresh with the same inputs restores the loads: a
finished load opens on Review, an unfinished one on Load, where Retry continues.
Nothing goes to localStorage or sessionStorage. Review shows when the data was
loaded and which block it stops at, with "Load Again" to read it fresh. The
footer control is "Clear Cache and Reset": it deletes the saved loads on this
device and clears the URL, after a confirm. The data is public chain data.

Order, always visible at the current value:
`?address=SP...&year=2025&currency=USD&api=https://api.hiro.so&rpm=45`.
Several addresses: `address=SP1,SP2,SP3` (resolved addresses, not names).
`year` is a year (`2025`) or `all`. `?fixture=` runs
the whole app offline (section 13).

No persistent no-seed-phrase statement in the header (decided 2026-10-14, as
on BNS Lookup).

## 10a. Wallet connect (optional, decided 2026-10-14)

"Connect Wallet" beside the address field is a shortcut for people who do not
want to copy an address. Pasting stays the main path and needs no wallet.

- One request only: `getAddresses` through the vendored `@stacks/connect` bundle
  of Zero to Signing (`src/vendor/connect.js`, pinned). The app never sends a
  signing, transfer or contract-call request; the harness stubs the provider and
  asserts that `getAddresses` is the only method called.
- Every wallet the library lists may be used, Xverse included. The Xverse block
  in the signing apps is about post-conditions, and nothing here is signed.
- The app takes the Stacks address (`SP`/`SM`) from the response. A testnet
  address gives the inline error "This wallet account is on testnet. Select a
  mainnet account in the wallet." Several Stacks addresses: a radio list, first
  selected.
- The address goes into the field and the URL like a pasted one. There is no
  session: "Disconnect" is not needed, and changing account means connecting
  again. The library's own cache stays off (`enableLocalStorage: false`, to
  verify against the vendored bundle); any key it still writes is removed after
  the request, so the no-storage assertion holds.
- The button sits beside the address field on step 1 only, not in the header:
  there is no connected state to show on other steps.
- BNS name, as in the other apps: after connecting, the app shows the
  address's BNS-V2 name beside it (`stillearly.btc`). Same reader as Zero to
  Signing `src/lib.js` `resolveBnsName`: `get-primary` on
  `SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2` through Hiro call-read,
  then the BNS-V2 NFT holdings plus `get-bns-from-id`, then
  `api.bnsv2.com/names/address/{addr}/valid`. Hiro reads go through the gate.
  No name: nothing is shown. A failed read: nothing is shown and loading is not
  blocked; the name is a label, never an input. The About sheet lists the name
  when one is known.

## 11. Copy rules

App text, export headers, notes and the About sheet follow the design skill voice
and these controlled-language rules. The app and exports do not name the
standard.

- One instruction per sentence; instructions in the imperative ("Enter a Stacks
  address."). At most 20 words in an instruction, 25 in a description.
- Active voice, present tense where possible. One word for one meaning: the
  glossary terms, no synonyms (never "tx", "wallet" for address, "coin" for
  token).
- No promotional words, no "please", no exclamation marks, no em dashes.
- Errors state the problem and the action: "The address is not valid. Check the
  characters and try again." "The export is incomplete. Retry the failed
  requests."
- Explain a technical term the first time it appears, or link to it.
- No claim of formal compliance with any writing standard.

Examples: "Enter a Stacks address." "Transactions are loading." "The export is
incomplete. Retry the failed requests." "Another address paid this transaction
fee."

## 12. Licence and credit

This app is new code, not a fork: other reads (v3 API), another row model, the
Zero To design system and stack. FatStx is the functional reference. Two parts
are reused as data: the price tables (at the PR 77 head) and the token
definitions (asset identifiers, CoinGecko ids). FatStx is MIT, "Copyright (c)
2026 FatStx"; MIT allows reuse and modification on the condition that the
notice ships with substantial copied portions, and the price tables are such a
portion. So `LICENSE-FatStx.txt` ships in the deployed folder, and the About
sheet and the info section credit "FatStx, built by @eparrot and @foragerr"
with the licence. The tables were compiled by FatStx from CoinGecko, Binance,
ALEX and Arkadiko swaps, and the ECB (FatStx FAQ); the About sheet names these
sources, and Leather and Frankfurter for the later dates. The FatStx
disclaimers carry over in this app's words: not tax advice, best effort, no
affiliation.

## 13. Build, verify, deploy

- Source lives in its own project folder, `~/Claude/Projects/zero_to_tax_export`,
  like the other apps; only the built `dist/` goes into this repo (decided
  2026-10-14).
- Vite static build like Zero to Signing (exact pins, `base: "./"`, lockfile),
  React 18.3.1, the design skill's tokens.css, app.css and fonts. Runtime
  dependencies vendored: SheetJS 0.20.3, decimal.js-light 2.5.1, c32check 2.0.0.
- Pure modules first, each with `node --test` before code: address check, year
  parse, gate (window, cooldown, `Retry-After` parse, backoff schedule), cursor
  walk with year bounds, row builder, reconciliation, amount formatting, price
  lookup (24 h guard, EUR, weekend, missing rate), value math, CSV quoting and
  formula guard, file name.
- Fixtures (recorded live 2026-10-14, header says which values are recorded):
  send-many with memo `0xa5913c47...dc6f97`; send-many with two identical legs
  `0xe4288a94...6b3fbb`; sponsored `0xafa85257...ed35088` (sponsor pays 9000
  uSTX); failed with fee `0xb0164bc1...f97bb` (`abort_by_response`, 150000
  uSTX); several FT movements `0xe0e0c4ca...060363` (WELSH in, LP token burn,
  STX in); pox-5 lock `0x07b58ef2...887096`. From the history of
  `stillearly.btc` (`SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H`, 810
  transactions, scanned 2026-10-14):
  - pool operator lock missing from the index: `0x1f1f8cac...186cbd`
    (Fast Pool `pox4-fast-pool-v3::delegate-stack-stx-many`; 10 of the 36 lock events of this
    address are like this; `0xee23e387...` holds two lock events in one
    transaction);
  - PoX-5 unstake with fee and a lock event: `0xceee1e83...0e93`;
  - PoX-4 revoke-delegate-stx, fee only: `0x08503701...edff`;
  - token sent to the address by another address while it deployed the
    token contract: `0xa9f2553b...19ae` (stxanta; a transfer, not a mint);
  - STX dust from an unknown sender: `0xe55c27e0...f224` (3 uSTX; 79 such
    receipts under 1 STX from 15 senders);
  - mint by another address: `0xfb5c20a4...7f3d` (vGLD);
  - burn of this address's tokens by another address: `0x84570df9...d763`;
  - sBTC rewards to many addresses: `0x3e32b3f3...b8f4` (dual stacking);
  - sponsored by another address, address receives sBTC: `0x614645be...bae6`;
  - sBTC withdrawal accept, `sbtc-token-locked` burn: `0xef8f9e44...5f2e`.
  Synthetic: an index of more than 50 transactions to test paging, a
  balance-changes batch with more than 50 results, and 429 and 5xx sequences.
- Fixtures live in the source folder (`fixtures/`), not in `dist/`: the 2026
  recording is 9.6 MB because concentrated-liquidity transactions carry hundreds
  of events. The fixture mode ships in the build; the harness serves the
  fixture files next to `dist/` (decided 2026-10-15).
- Browser harness against `dist/` (pattern of sBTC Deposit Recovery): every step
  and stage state, cancel, retry, incomplete labels, both exports parsed back
  and compared to the golden rows, zero external requests in fixture mode, no
  em dash, no storage, no wallet request other than `getAddresses`. Committed
  screenshot script.
- Live smoke tests: the fixture addresses compared row by row against the
  explorer; a complete history of an address with more than 1,000 transactions;
  a run that hits the limit on purpose to observe a real 429.
- Deploy: the contents of `dist/` to `zero_to/tax-export/` with this PRD, a
  README and `LICENSE-FatStx.txt`. The PRD and README are copies of the ones in
  the source folder.
- After it is live: in `zero_to/zt_site.json` the "Tax" quick link points to
  `https://stx.fan/zero_to/tax-export/`; its `more` list becomes Zero to Stacks
  Tax Export (this app), fatSTX, Koinly, CoinLedger, Summ. Add an app tile "Zero to Stacks Tax Export"
  ("wallet optional, signs nothing, mainnet").

## 14. Acceptance criteria

- For every recorded load, every asset passes the balance check (opening + In -
  Out - fees = closing), and the Balances sheet and CSV say "Matches".
- Pegged tokens are listed only when they occur without a price, all off; turning
  one on marks its rows "1:1 by user", adds `peg=` to the URL and the About line;
  turning it off restores the export.

- A valid address with "All years" loads every transaction of the index; a
  year loads exactly the transactions of that UTC year and no index page after it;
  the row count per transaction matches the fixtures.
- No more than 45 Hiro requests in any 60-second window, retries included.
- A 429 stops all pending Hiro requests for the cooldown and the page says when
  the next attempt runs; five failures mark the request failed.
- Cancel and failure both produce an incomplete result with the label in the
  file name, every row and the About sheet; retry completes it without fetching
  loaded data again.
- The send-many fixture gives one row per leg, including two identical legs.
- The sponsored fixture gives fee paid 0 and the note for the sender, and a
  fee-only row with fee paid 9000 uSTX for the sponsor.
- The failed fixture gives one `Failed` row with fee paid and no movements.
- The FT fixture gives three rows (STX in, WELSH in, LP token out) and passes
  reconciliation.
- Amounts are exact for 0, 6, 8 and 18 decimals; unknown decimals give base
  units and the note.
- The pool operator lock fixture gives a `Locked` row with fee paid 0; the
  unstake fixture gives a fee and a `Locked` row; the revoke fixture gives one
  fee-only row.
- `stillearly.btc` with "All years": 810 transactions (as of 2026-10-14) plus the 10 lock-only
  transactions, every lock event a row, every failed transaction a row.
- The page shows prices and values with 2 decimals; the export has them exact.
- Sum of "Fee paid by this address" equals the sum of fees the address paid.
- EUR values use the ECB rate of the date; a missing rate gives no price.
- A token name starting with `=` exports as text in both formats.
- The Excel file opens with two sheets; the CSV parses back to the same rows.
- Zero external requests in fixture mode; nothing in browser storage; no em
  dash.
- Connect Wallet fills the field with the mainnet Stacks address; a testnet
  account gives the inline error; no method other than `getAddresses` is ever
  called.
- Typing `stillearly.btc` shows the owner SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H
  and enables loading; an unregistered name gives the inline error.
- Every stSTX row has a price whose source names the ratio and the block of
  its own transaction; stSTXbtc rows are priced as STX.
- After connecting the `stillearly.btc` owner, the name shows beside the
  address; with the Hiro reads failing, the bnsv2 fallback supplies it; with
  both failing, no name shows and loading still works.
