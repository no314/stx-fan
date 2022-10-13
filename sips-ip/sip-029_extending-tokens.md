# Preamble

SIP Number: 029

Title: Standard Trait Definition for extending tokens
https://github.com/stacksgov/sips/issues/51#issuecomment-1151670018
https://github.com/stacksgov/sips/issues/52

Author: werner.btc (werner at stx.fan) with help from ? ;-)

Consideration: Technical

Type: Standard

Status: draft

Created: 12 October 2022

License: CC0-1.0

Sign-off: Jude Nelson <jude@stacks.org>, Technical Steering Committee Chair

# Abstract

This standard provides additional functions to digital assets (i.e. tokens) so that they can be made availble to buy from the owners public address. This in effect enables an open, decentralized marketplace for digital assets. 

# License and Copyright

This SIP is made available under the terms of the Creative Commons CC0 1.0 Universal license, available at https://creativecommons.org/publicdomain/zero/1.0/
This SIP’s copyright is held by the Stacks Open Internet Foundation.

# Introduction

Tokens are digital assets registered on a blockchain through a smart contract. A non-fungible token (NFT) is a token that is globally unique and can be identified through its unique identifier.

In blockchains with smart contracts, including the Stacks blockchain, developers and users can use smart contracts to register and interact with (non-)fungible tokens.

To extend the functions of tokens this SIP defines a set of traits with smart contract functions that enable an open, decentralized marketplace for digital assets. These assets must implement the `operable trait` and `marketplace trait`. Owners of operable assets should be able to list and unlist their token. Buyers should be able to buy the assets from the owner.

The `marketplace trait` can be implemented as part of the asset contract (usually not recommended) or as an independent contract.

Werner: add something about the transferable-trait functions and how they complement the rest.

# Specification

Every SIP-029 compliant smart contract on the Stacks blockchain must(/may?) implement these traits; 
0. `transferable-functions`, defined in the [Transferable-Trait](#Transferable-Trait) section, 
1. `operable-functions`, defined in the [Operable-Trait](#Operable-Trait) section, 
2. `marketplace-functions`, defined in the [Marketplace-Trait-&-Commision-Trait](#Marketplace-Trait & Commision-Trait) section, 
3. `commission-functions`, defined in the [Marketplace-Trait-&-Commision-Trait](#Marketplace-Trait & Commision-Trait) section,
and must meet the requirements for the following functions:

### Transferable-Trait function 1: Transfer
`(transfer (uint principal principal) (response bool uint))`

The function changes the ownership of the token for the given identifier (for non-fungible tokens) or amount (for fungible tokens) from the sender principal to the recipient principal.

This function must be defined with define-public, as it alters state, and must be externally callable.

After a successful call to transfer, the function get-owner (for NFT's) must return the recipient of the transfer call as the new owner.

For any call to transfer with an ID greater than the last token ID returned by the get-last-token-id function, the call must return an error response.

It is recommended to use error codes from standardized list of codes and implement the function for converting the error codes to messages function that are defined in a separate SIP.
Werner: should this final remark still be in here, SIP on wishlist?

### Transferable-Trait function 2: Transfer with memo
`(transfer-memo (uint principal principal (buff 34) (response bool uint))`

Transfer a token from the sender to the recipient and emit a memo. This function
follows the exact same procedure as `transfer` but emits the provided memo via
`(print memo)`. The memo event should be the final event emitted by the
contract. 

### Operable-Trait function 1: Set approved principal
`(set-approved (uint principal bool) (response bool uint))`

This function takes a unique token identifier (for non-fungible tokens) or amount (for fungible tokens) a principal and a boolean value (true or false) to approve operations for that token/those tokens by the contract. 

The function must return `(ok true)` on success.


### Operable-Trait function 2: Check approval status
`(is-approved (uint principal) (response bool uint))` 

The function takes an amount or unique token identifier together with a principal and returns if that principal is allowed to operate (e.g. transfer) the specified token or amount of tokens.

This function must never return an error response. It can be defined as read-only, i.e. `define-read-only`.

### Maretplace-Trait function 1: 
`(list-in-ustx (uint uint <commission-trait>) (response bool uint))`
Werner: I think the discussion in https://github.com/stacksgov/sips/issues/51 landed on using a more generalized interface such as: 
`(list-in-token (<transferable-trait> uint uint <commission-trait>) (response bool uint))`

Explained in plain English...

### Maretplace-Trait function 2: 
`(unlist-in-ustx (uint) (response bool uint))`
or generalized 
`(unlist-in-token (<transferable-trait> uint) (response bool uint))`

Explained in plain English...

### Maretplace-Trait function 3: buy in tokens
`(buy-in-ustx (uint <commission-trait>) (response bool uint))`
or generalized
`(buy-in-token (<transferable-trait> uint <commission-trait>) (response bool uint))`

...

### Maretplace-Trait function 4: Get asset
`(get-asset () (response {fq-contract: string, asset-class: string} uint))`

...


### Commision-Trait function:
`(pay (uint uint) (response bool uint))`
Werner: (this should take an optional token trait if generalized to any token?... should there be an allowlist for token traits in that case or would this always be uSTX?)

An additional action after the marketplace sale happened. Usually a token transfer (fee) to the marketplace.

The function takes 

It is recommended to use error codes from standardized list of codes and implement the function for converting the error codes to messages function that are defined in a separate SIP.

## Transferable-trait

```
define-trait transferable
    (
        ;; Transfer from the sender to a new principal
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; @param id-or-amount; identifier of NFT or amount of FTs
        ;; @param sender: owner of asset
        ;; @param recipient: new owner of asset after tx
        (transfer (uint principal principal) (response bool uint))

        ;; Transfer from the sender to a new principal
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must emit an event with `memo`
        ;; @param id-or-amount; identifier of NFT or amount of FTs
        ;; @param sender: owner of asset
        ;; @param recipient: new owner of asset after tx
        ;; @param memo: message attached to the transfer
        (transfer-memo (uint principal principal (buff 34) (response bool uint))
```

## Operable-Trait

```
define-trait operable
    (
        ;; set approval for an operator to handle a specified id or amount of the asset
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; @param id-or-amount; identifier of NFT or amount of FTs
        ;; @param operator: principal that wants to operate the asset
        ;; @param bool: if true operator can transfer id or up to amount
        (set-approved (uint principal bool) (response bool uint))

        ;; read-only function to return the current status of given operator
        ;; if returned `(ok true)` the operator can transfer the NFT with the given id or up to the requested amount of FT
        ;; @param id-or-amount; identifier of NFT or amount of FTs
        ;; @param operator: principal that wants to operate the asset
        ;; @param bool: if true operator can transfer id or up to amount
        (is-approved (uint principal) (response bool uint))
```

## Marketplace-Trait-&-Commision-Trait

```
(use-trait commission-trait .commissions.trait)
(define-trait marketplace
    (
        ;; announce listing to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a list event
        ;; @param id; identifier of NFT or amount of FTs
        ;; @param price: of sale in micro STX
        ;; @param commission: action to happen after sale
        (list-in-ustx (uint uint <commission-trait>) (response bool uint))

        ;; announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a delist event
        ;; @param id; identifier of NFT or amount of FTs
        (unlist-in-ustx (uint) (response bool uint))

        ;; buy and announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; commission must match the one set during listing
        ;; must send a delist event
        ;; @param id; identifier of NFT or amount of FTs
        ;; @param commission: action to happen after sale        
        (buy-in-ustx (uint  '<commission-trait>') (response bool uint))

        ;; read-only function defining the asset
        (get-asset () (response {fq-contract: string, asset-class: string} uint))
    )
)

(define-trait commission
    (
        ;; additional action after a sale happened, usually a fee transfer for marketplaces
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; @param id; identifier of NFT
        ;; @param price: of sale in micro STX
        (pay (uint uint) (response bool uint))
    )
)
```

## Security
As `commission-traits` can call any functions in the name of the tx-sender, it is important that a web app only offers commission contracts that are well understood. In particular, appropriate post-conditions have to be created.

If asset contracts want to control trades they have to restrict which operators are approved. Note, that royalties to an artist of an NFT can be part of the commission if agreed with the marketplace. They can also be implemented in the NFT directly.

## Use of native asset functions
Werner: not sure what to do here (section just a copy from sip009)


Although it is not possible to mandate in a Clarity trait, contract implementers must define at least one built-in native non-fungible [asset class](https://app.sigle.io/friedger.id/FDwT_3yuMrHDQm-Ai1OVS) that are provided as Clarity primitives. This allows clients to use Post Conditions (explained below), and takes advantages of other benefits, like native support for these asset balances and transfers through `stacks-blockchain-api`. The reference implementations included in this SIP use the native asset primitives, and provide a good boilerplate for their usage.

The native asset functions include:

- `define-non-fungible-token`
- `nft-burn?`
- `nft-get-owner?`
- `nft-mint?`
- `nft-transfer?`

The following requirements for using native asset functions are defined:
### Transfer
If the `transfer` function is called from a client without a [post-condition](https://docs.blockstack.org/understand-stacks/transactions#post-conditions) in deny mode or without any NFT condition about a changed owner, then the function call must fail with `abort_by_post_condition`.

# Using NFTs in applications

Developers who wish to use a non-fungible token contract in an application should first be provided, or keep track of, various different non-fungible token implementations. When validating a non-fungible token contract, they should fetch the interface and/or source code for that contract. If the contract implements the trait, then the application can use this standard's contract interface for making transfers and getting other details defined in this standard.

All of the functions in this trait return the `response` type, which is a requirement of trait definitions in Clarity. However, some of these functions should be "fail-proof", in the sense that they should never return an error. These "fail-proof" functions are those that have been recommended as read-only. If a contract that implements this trait returns an error for these functions, it may be an indication of a non-compliant contract, and consumers of those contracts should proceed with caution.

## Use of Post-Conditions

The Stacks blockchain includes a feature known as "Post-Conditions" or "Constraints". By defining post-conditions, users can create transactions that include pre-defined guarantees about what might happen in that contract.

For example, when applications call the `transfer` function, they should _always_ use post conditions to specify that the new owner of the NFT is the recipient principal in the `transfer` function call.

# Optional send-many specification
--> Werner: Copied from: https://github.com/stacksgov/sips/pull/42/files (semi fungible standard) based on this comment:  https://github.com/stacksgov/sips/issues/52#issuecomment-984417659 (not sure if this was the intention if any adaptations are needed?) the uint after token id may need to be an optional because it can be a semifungible here or a non-fungible token. Should this be optional or an obligatory part of this sip?

SIP029 functions can be can optionally implement the trait
`sip029-send-many-trait` to offer a built-in "send-many" features for bulk token
transfers. Adding this to the token contract itself may have runtime cost
benefits as of Stacks 2.0. The send-many trait contains 2 additional functions.

## Send-many functions

### Bulk transfers

`(transfer-many ((transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal}))) (response bool uint))`

Transfer many tokens in one contract call. Each transfer should follow the exact
same procedure as if it were an individual `transfer` call. The whole function
call should fail with an `err` response if one of the transfers fails.

### Bulk transfers with memos

`(transfer-many-memo ((transfers (list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)}))) (response bool uint))`

Transfer many tokens in one contract call and emit a memo for each. This
function follows the same procedure as `transfer-many` but will emit the memo
contained in the tuple after each transfer. The whole function call should fail
with an `err` response if one of the transfers fails.

## Send-many trait definition

A definition of the optional send-many trait is provided below.

```clarity
(define-trait sip029-transfer-many-trait
	(
		;; Transfer many tokens at once.
		(transfer-many ((list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal})) (response bool uint))
		;; Transfer many tokens at once with memos.
		(transfer-many-memo ((list 200 {token-id: uint, amount: uint, sender: principal, recipient: principal, memo: (buff 34)})) (response bool uint))
	)
)
```


# Related Work

Loopbom
https://github.com/radicleart/clarity-market

Megapont Ape Club
https://explorer.stacks.co/txid/SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-ape-club-nft?chain=mainnet

# Backwards Compatibility

Not applicable

# Activation

This SIP is activated if 5 contracts are deployed that use the same trait that follows this specification. This must happen before Bitcoin tip #780,000.

A trait that follows this specification is available on mainnet as: `to add later`

# Reference Implementations

## Source code

# Sources
Extension for asset traits (transferable and operable)
https://github.com/stacksgov/sips/issues/52
Marketplace function
https://github.com/stacksgov/sips/issues/51
Generalized marketplace function (list-in-token vs. list-in-ustx)
https://github.com/stacksgov/sips/issues/51#issuecomment-1151670018
Optional send-many trait (from SIP013 semi-fungible token)
https://github.com/stacksgov/sips/pull/42/files

Examples of commission contracts
Simple fixed fee: `?`
Auction contract: `?`