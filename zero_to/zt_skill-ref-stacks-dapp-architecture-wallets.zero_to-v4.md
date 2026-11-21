# Wallet observations (dated)

One row per wallet, platform and observation. The policy (three tiers, refuse wallets that drop post-conditions, verified is per platform) is in SKILL.md; this table is the evidence and ages visibly. Add a row for every live test; never edit a row, add a newer one.

| Wallet | Platform | Observed | Date | App | Tier at the time |
| --- | --- | --- | --- | --- | --- |
| Leather | browser extension | Honors `postConditionMode` and `postConditions` on `stx_callContract` and `stx_deployContract`; deny-mode conditions rendered on the signing screen | 2026-09-03 | Zero to Signing | verified |
| Leather | browser extension | Pre-serialized `staking-postcondition` accepted and shown | 2026-09-03 | Zero to Signing | verified |
| Leather | browser extension | `originator` mode accepted on claim calls | 2026-08-14 | Zero to Claiming | verified |
| Leather | browser extension | Sponsored call returns `{ transaction }` hex unbroadcast | 2026-09-06 | sBTC gas swap | verified |
| Leather | mobile | Sponsored call signed and broadcast by the wallet; node rejects without the sponsor signature; dapp never receives the hex. Issue leather-io/mono#2788; handoff sent to the wallet team | 2026-09 to 2026-10 | sBTC gas swap | blocked for sponsored calls until fixed |
| Leather with a Ledger account | browser extension | Signed a Clarity 3 `stx_deployContract` in deny mode with empty post-conditions | 2026-09-06 | sBTC gas swap deploy page | verified for deploys |
| Ledger Stacks app | hardware | Whether it signs a sponsored call with three post-conditions: open question, never closed | 2026-10 | sBTC gas swap | untested |
| Xverse | browser extension | `stx_callContract` schema defines `postConditionMode` as `'allow' | 'deny'` only; no `originator`; its SIP-030 comparison lists no network parameter | 2026-09-15 | Zero to Claiming | blocked |
| Xverse | browser extension | Drops post-conditions per the `@stacks/connect` compatibility table; blocked with `xverse.html` stating the two SIP-030 changes that would unblock it | 2026-09-03 | Zero to Signing, Zero To BNS | blocked |
| Xverse | browser extension | Offered for an address-only `getAddresses` read, since no transaction is signed | 2026-10-15 | tax export | offered |
| Asigna | multisig | Listed as supporting `postConditions` by the connect library; no live test recorded | 2026-09-03 | Zero to Signing, Zero To BNS, sBTC gas swap | offered untested |
| Fordefi | institutional | Listed as supporting `postConditions` by the connect library; no live test recorded | 2026-09-03 | Zero to Signing, Zero To BNS, sBTC gas swap | offered untested |

Mechanics that hold across wallets: pin the chosen provider id before `connect()` so the library's own modal never re-offers a blocked wallet; detect installed wallets from `wbip_providers` plus legacy globals, matching ids by pattern because ids vary by version; `@stacks/connect` 8.x is SIP-030 JSON-RPC, 7.x was JWT-based; some wallets fall back to mainnet when the active account differs unless the network is passed explicitly; a wallet may register only a Bitcoin provider for what the library treats as the Stacks connect call, so connect hangs with no error.

Wallet-team handoff pattern (sBTC gas swap, 2026-10): name the source lines, the reference behavior on the working platform, and the minimal changes, scoped to one small PR. The same move as a blocked-wallet page, aimed at a maintainer instead of a user.

## Added in zero_to v4 (2026-11-21)

- **Xverse, browser extension, mainnet, 2026-11-19 (batch-tx, live with Werner).** Connected through `XverseProviders.BitcoinProvider`. On `stx_callContract` its screen read "You will transfer exactly 0.00000001", and both transactions were mined with `post_condition_mode: deny` and one `sent_equal_to` condition for 1 unit of `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token` on the sender: 0xe3fbd7a098cddb076e51299ee700340357ed8f995930e343d7b885f79aa75f57 at nonce 566 and 0xd1600f9b1c3eb6f501cf400205a64cad5444fb2f956bbb891506f4722f942d00 at nonce 567. This contradicts the rows of 2026-09-03 and 2026-09-15 that list Xverse as dropping post-conditions. It covers deny mode with a fungible condition only; `originator` mode and the pox-5 condition were not tried. Both rows stand, dated; the tier of Xverse in an app is the owner's decision.
- **Leather, mainnet, 2026-11-19.** Two sBTC transfers through `stx_transferSip10Ft`: 0xedc09849d54e5efc1b20457ccea3b0ca64bbd5c5cecb55dd0e60362249a8376f was mined from SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW at nonce 684 as a deny-mode contract call with a `sent_equal_to` condition for 1 unit, built by the wallet.
- **SIP-030 transfer methods.** `stx_transferStx` and `stx_transferSip10Ft` define no post-condition parameters (stacksgov/sips `sips/sip-030/sip-030-wallet-interface.md` lines 108 to 134, read 2026-11-18). Leather reads the `asset` parameter of `stx_transferSip10Ft` as the full asset identifier (`<address>.<contract>::<asset>`) and coerces `amount` to a JavaScript number (leather-io/mono at commit 8829674b83488d6011edee415640652eb515a0a8, `apps/extension/src/app/pages/rpc-stx-transfer-sip10-ft/rpc-stx-transfer-sip10-ft.utils.ts` and `packages/rpc/src/methods/stacks/stx-transfer-sip10-ft.ts`). Other wallets were not read.
- **User rejection codes.** 4001, -31001, and -32000 when the selected wallet is not Leather; the code may sit in a nested `error.code` (same commit, `apps/web/app/utils/wallet.ts` `isUserRejectionError`). Zero to Claiming `walletErrMsg` checks only a top-level 4001 and -31001.
- **The vendored `connect()` sets `forceWalletSelect: true`** (`src/vendor/connect.js`), so an app with its own selector calls `request({forceWalletSelect:false}, "getAddresses", ...)` after `setSelectedProviderId`.
- **Published request schema as test oracle.** `@leather.io/rpc` zod schemas, as a devDependency, parse every request the app builds (batch-tx `src/wallet-requests.spec.ts`).
- **Moved from the skill body.** Pre-serialize post-condition types the library lacks to wire hex; hardware wallets gate payload types by app version (signing, bns).
