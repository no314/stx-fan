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
