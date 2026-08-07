# Zero to Signing

Single-page app that walks a Stacks signer operator from nothing to a registered, staked, signing signer. Spec: the `PRD.md` in the handoff folder.

## Architecture

Static build (rung 1 of the static-first ladder): `vite build` emits a self-contained `dist/` deployable on any static host. No backend — keys and signing live in the wallet (SIP-030 via `stx_deployContract`/`stx_callContract`, post-condition mode deny), chain reads go to the public Hiro API (`https://api.hiro.so` mainnet, `https://api.testnet-pox5.hiro.so` testnet). Nothing is fetched from a CDN at runtime; fonts, icons, contract sources, and all libraries are pinned and bundled.

`src/vendor/connect.js` and `src/vendor/transactions.js` are the pinned known-good `@stacks/connect` / `@stacks/transactions` bundles carried over from the prototype: they serialize the pox-5 `staking-postcondition` type, which published registry versions do not. Re-vendor deliberately, never by floating a version. `src/vendor/structure-hash.js` is the structure-hash function from old app 03, byte-for-byte; `npm run verify:hashes` checks the three bundled contract sources against the PRD's hardcoded hash literals and confirms the hash is invariant under reformatting.

## Commands

- `npm install` — install pinned build deps (exact versions, lockfile committed)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built artifact locally
- `npm run verify:hashes` — verify bundled contract sources against the PRD hash literals

## Security posture

Deploy and register-self: `postConditionMode:"deny"`, zero post-conditions (they move no assets). Stake: deny with one pre-serialized `staking-postcondition` (`eq`, locked amount). Contract identity is pinned by structure hash; a bundled source that no longer matches its hardcoded hash blocks deploy. Flow state is namespaced per network (`zts:<network>:<contractAddress>.<contractName>`), mirrored in `?id=`/`?chain=` URL params, and never crosses networks.
