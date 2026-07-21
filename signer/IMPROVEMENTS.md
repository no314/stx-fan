# Deferred app improvements (from testnet dry-run)

Running list of changes to make later, captured during the walkthrough. Not yet implemented unless marked done.

## Done
- **Deploy dApp (03): Ledger-compatible deploy.** Explicit `clarityVersion: 6` serializes as a `0x06` VersionedSmartContract payload, which the Ledger Stacks app rejects ("ledger has rejected the payload"); software wallets sign it fine. Fix shipped: added an "omit the clarity version" checkbox (on by default) → deploys as legacy `0x01`; at epoch 4.0 the node assigns Clarity 6 anyway. Uncheck to force `0x06`. Also added a raw-vs-canonical hash note.

## To do
- **Offline key dApp (02): derive public key from a private key.** Add an input to paste an existing private key and show its compressed public key (+ ST/SP address). Two uses: (a) sanity-check a keypair, (b) recover the public key when only the private key remains (keyfile lost). Keep it in the same offline/air-gapped guardrails.
- **Deploy dApp (03): pin pox-5-testnet reference hashes.** Currently only mainnet has fixed hashes; testnet is "compare to your render manifest." Add the testnet reference. Caveat learned in testing: the value observed (canonical `3512163c9685e8d127322744655926d7e04d42afe5be13523637d7dc1ac478d8`) is the repo's **devnet** artifact, which embeds the **devnet** sBTC principal (`ST1PQHQK…`), not the live pox5-testnet sBTC (`SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1`). So the devnet artifact is only a rough reference; the true pox5-testnet source must come from `sidekick manager render` against the live network. Consider adding an "embedded sBTC principal" check alongside the existing pox-5 principal check.
  - Observed during test: raw `959b1d49b3dcb5782c3f9030f2d95c5b5cb99f359e401e093eaed21b4ac2f240` (GitHub copy-button text, whitespace-shifted) vs devnet raw `ca97d964…`; canonical matched (`3512163c…`). Confirms raw is fragile, canonical is the reliable comparator.

## Clarified (no change needed)
- **Contract hash is network-independent.** The SHA-256 is of the contract source text only; it does not depend on the chain/testnet ID. Same source bytes → same hash on any network. Source differs between networks only because the embedded `pox-5` boot principal and sBTC deployer differ.

## Issues log (fill in as testing continues)
- _(add symptom → cause → fix as they come up)_
