# Zero to Signing

Built based on feedback from Alex Miller (add links to docs and style like Labs dapps) and Diwaker (need for better overall picture of where you are in the process) after using the stx.fan/signer dapps.

One page that takes a Stacks signer operator from nothing to a registered, staked, signing signer. As much of the complexity as possible from the prior dapps has been taken out. Where we can we make choices for the user and prefill info while still providing options to change things.

**How it was built.** Claude plus three skills: two architecture skills, one design skill, and a one page PRD. Static Vite build, no backend, the wallet signs.

**Why this is the way to prototype Stacks apps.** Everything is pinned and bundled, nothing to operate: any static host serves it, keys stay in the wallet, the chain does the rest.

**Details we like.**

- The URL is the state: network, your signer-manager contract, and the API node all live in the address bar. Reload and you are back where you were; share the link and someone else sees the same flow; swap the api parameter to read from your own node.
- Post-conditions done right from the start: every transaction is deny mode, with exactly the conditions the call needs and nothing more, even on testnet.
- BNSv2 built in: if your address has a name, the app shows it after connecting instead of the address.
- Contract identity by structure hash: the bundled sources are checked against pinned structure hashes (SIP-043 identicons next!), and reformatting the code does not change the hash.
