# Zero To Batch Tx

A demo of batch sending contract calls on Stacks. One page sends two STX transfers, two sBTC transfers or two mints of a test token. Each one is its own transaction, and the wallet signs them one after the other. Live at `https://stx.fan/zero_to/batch-tx/`.

To pay many recipients there is a better tool: a send-many contract pays all of them in one transaction. [sendstx.com](https://sendstx.com) is an app for that. The queue shown here is for calls that do not share a single transaction.

**How it was built.** Claude plus three skills (static-first-architecture, stacks-dapp-architecture, stacks-labs-dapp-design), a one page PRD, and the code conventions of the Leather wallet repository. Static Vite build, no backend, the wallet signs and broadcasts.

**What it actually does.** One button opens the first signing request in the wallet. The second opens when the first has answered. A rejection does not stop the queue. The button keeps the number still to sign ("Sign 2 Transactions", then "Sign 1 Remaining"), and pressing it again sends only those. Once the wallet returns a transaction id, the page reads its status every 5 seconds and shows pending, confirmed or failed beside the id.

**Use it in your own app.** The pattern is two files with no imports beyond React. Both are in the `model/` folder here, with the queue's unit spec:

- `model/sign-queue.ts`: the queue. No React and no wallet import, so it runs in Node.
- `model/use-sign-queue.ts`: React state around it.
- `model/sign-queue.spec.ts`: its tests, for Vitest.

```tsx
const queue = useSignQueue({ items: calls, keyOf, send, isRejection });

<button disabled={queue.running || queue.remaining === 0} onClick={() => void queue.start()}>
  {queue.label}
</button>;
```

- `send(item)` makes one wallet request and resolves with the wallet's answer. The queue counts it as submitted only when the answer carries a 64-hex `txid`.
- `keyOf(item)` names exactly what the wallet would sign. A submitted transaction belongs to its key, so an edited item starts as pending.
- `queue.states[i].status` is `pending`, `signing`, `submitted`, `rejected` or `failed`.
- `queue.start()` again is the retry. Submitted items are never sent twice.
- `queue.stop()` gives up on a wallet that does not answer. A transaction id that arrives late is still recorded.

The rest of the source is not published. In the app, a batch item is either a transfer or a mint, and one function turns each kind into its SIP-030 request (`stx_transferStx`, `stx_transferSip10Ft` or `stx_callContract`). Your `send` does the same for your own calls.

**Details we like.**

- The URL is the state: network, read API, asset, request type, recipients and amounts. The page writes nothing to browser storage.
- Every wallet request is typed with the parameter types `@stacks/connect` publishes, and a test parses each one with the schemas the Leather extension decodes requests with.
- A wallet that never answers does not trap the page. Stop Waiting ends the wait, and a late answer still counts.
- A rejection is told apart from a failure the way the Leather web app does it, including the code other wallets use.
- The not-not mint, on Testnet only, is the plain contract call of the demo. The page reads the balance from the contract, because a wallet can hide a token it does not know.
- The default recipients are burn addresses: the vote addresses of SIP-033, a vote that has closed.

**Wallets, as observed on 2026-11-19.**

| Wallet | Result |
| --- | --- |
| Leather, browser extension | sBTC transfers on mainnet through `stx_transferSip10Ft` signed in sequence and confirmed. The wallet built each one as a deny-mode contract call with an exact-amount post-condition. Mints on testnet signed in sequence and confirmed. |
| Xverse, browser extension | `stx_callContract` on mainnet signed in sequence and confirmed, with the page's exact-amount post-condition on chain. `stx_transferSip10Ft` opens no request. Mints on testnet failed in the wallet with a nonce error. |

Approving the second request within a second or two can fail with a nonce conflict, because a wallet takes the next nonce from the network. Leave a few seconds, or sign the refused one again with the button.

**Not covered.** Mobile wallets, Ledger, Asigna and Fordefi were not tried. The demo sends two transactions; the queue itself takes any number, and a status poll for more than four open transactions would need a rate limit.
