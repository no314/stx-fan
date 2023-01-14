# Preamble

SIP Number: 011

Title: Standard for non-custodial Marketplace traits
https://github.com/stacksgov/sips/issues/51#issuecomment-1151670018
https://github.com/stacksgov/sips/issues/52

Authors: werner.btc (werner at stx.fan), Friedger, Mike, Jason and Jamil.

Consideration: Technical

Type: Standard

Status: draft

Created: 31 December 2022

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

To extend the functions of tokens this SIP defines two traits with smart contract functions that enable an open, decentralized marketplace for digital assets. These assets must implement the `marketplace trait` and `commission trait`. Buyers should be able to buy the assets from the owner with STX or another SIP010 compliant token.

The `marketplace trait` can be implemented as part of the asset contract (usually not recommended) or as an independent contract.

The marketplace functions have been used since the first Megapont contract was deployed to mainnet in October 2022 and have since become the pseudo standard for non-custodial listing of assets on the Stacks Blockchain. Having an this official standard ratified can help further adoption of the standard. [(1)](https://) [(2)](https://github.com/stacksgov/sips/issues/92#issuecomment-1360144565)

# Specification

Every SIP-011 compliant smart contract on the Stacks blockchain must implement these traits;
1. `marketplace-functions`, defined in the [Marketplace-Trait-and-Commision-Trait](#Marketplace-Trait-and-Commision-Trait) section,
2. `commission-functions`, defined in the [Marketplace-Trait-and-Commision-Trait](#Marketplace-Trait-and-Commision-Trait) section;

Optionally seperate out royalties, as in the reference?
3. royalties?
4. transferable trait (when not listing in uSTX but another SIP010 or SIP013 token)

### Marketplace-Trait function 1: List in token
`(list-in-token (<transferable-trait> uint uint <commission-trait>) (response bool uint))`

This function announces the listing to a global marketplace. This must return `(ok true)` on success, never `(ok false)` and it must send a list event.

The Function takes a transferable-trait, a token id or token amount to be listed and the third argument is the price it should be listed at, lastly the function takes the commission trait. 

### Marketplace-Trait function 2: Unlist in token
`(unlist-in-token (<transferable-trait> uint) (response bool uint))`

This function announces the unlisting to a global marketplace. This must return `(ok true)` on success, never `(ok false)` and it must send a delist event.

The Function takes a transferable-trait, a token id or token amount to be unlisted.

### Marketplace-Trait function 3: Buy in tokens and annonce delisting
`(buy-in-token (<transferable-trait> uint <commission-trait>) (response bool uint))`

This function buys the listed token for the selling price and delists it. 

This function takes transferable-trait and an amount of the token (selling price). Additionally the function takes a commission-trait as defined below it will dictate actions to happen after the sale (owner, artist, marketplace, etc. getting their share of the sale). 

This function must be defined with define-public, as it alters state, and must be externally callable. The function must return `(ok true)` on success.

Werner: Should this be explained here, I do not understand it: https://github.com/stacksgov/sips/issues/60#issuecomment-1050075826 . 

### Marketplace-Trait function 4: Get asset
`(get-asset () (response {fq-contract: string, asset-class: string} uint))`

The is a read only function defining the asset. 


### Commision-Trait function:
`(pay (uint uint) (response bool uint))`
Werner: (this should take an optional token trait if generalized to any token?... should there be an allowlist for token traits in that case or would this always be uSTX?)

An additional action after the marketplace sale happened. Usually a token transfer (fee) to the marketplace.

The function takes 

It is recommended to use error codes from standardized list of codes and implement the function for converting the error codes to messages function that are defined in a separate SIP.

## Marketplace-Trait-and-Commision-Trait
Adapted based on most recent discussion here by Friedger and Jamil dec 2022: https://github.com/stacksgov/sips/issues/92#issuecomment-1359529405

```
(use-trait commission-trait .commissions.trait)
(define-trait marketplace
    (
        ;; announce listing to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a list event
        ;; @param id; identifier of NFT or SFT (ignored if <token-trait> = FT)
        ;; @param amount; amount of FT or SFT (ignored if <token-trait> = NFT)
        ;; @param; token-trait
        ;; @param price: of sale in smallest denomination of the token defined by <token-trait>
        ;; @param commission: action to happen after sale
        (list-in-token (uint <token-trait> uint uint <commission-trait>) (response bool uint))

        ;; announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a delist event
        ;; @param id; identifier of NFT or SFT (ignored if <token-trait> = FT)
        ;; @param amount; amount of FT or SFT (ignored if <token-trait> = NFT) (note: you can also list FT's on a global marketplace)
        (unlist-in-token (uint uint) (response bool uint))

        ;; buy and announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; commission must match the one set during listing
        ;; must send a delist event
        ;; @param id; identifier of NFT or SFT (ignored if )
        ;; @param amount; amount of SFTs (Werner: to support buying SFT's you'd want to add two uints here too)
        ;; @param commission: action to happen after sale        
        (buy-in-token (uint uint  '<commission-trait>') (response bool uint))

        ;; read-only function defining the asset
        (get-asset () (response {fq-contract: string, asset-class: string} uint))
    )
)

(define-trait commission
    (
        ;; additional action after a sale happened, usually a fee transfer for marketplaces
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; @param id; identifier of NFT
        ;; @param; token trait
        ;; @param price: of sale in smallest denomination of the token
        (pay (uint <token-trait> uint) (response bool uint))
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

### Recommendation for using STX as SIP010 token

For the generalized interface and hence the `_in-token_`-functions (`list-in-token`, `buy-in-token` etc.) as a single function to use any token, including STX. It is recommended that the Stacks Foundation deploy the following contract as a means to allow the use of STX as a SIP010 token without the need for hold wrapped STX.

From lNow 2022: https://github.com/stacksgov/sips/issues/60#issue-1148066438

A global wrapped STX (SIP-010 compliant) FT that is not issuing a new token, but uses plain STX:

`(impl-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

(define-read-only (get-balance (owner principal))
    (ok (stx-get-balance owner))
)

(define-read-only (get-decimals)
    (ok u6)
)

(define-read-only (get-name)
    (ok "Global Wrapped STX")
)

(define-read-only (get-symbol)
    (ok "GWSTX")
)

(define-read-only (get-token-uri)
    (ok (some u"https://www.stacks.co"))
)

(define-read-only (get-total-supply)
    (ok stx-liquid-supply)
)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (try! (stx-transfer? amount sender recipient))
        (match memo to-print (print to-print) 0x)
        (ok true)
    )
)`

Werner: WSTX/Wrapped STX is already used by Arkadiko and is a different contract. GWSTX does not have a naming collision. "Global" could also be replaced by "Foundation" if the contract is indeed deployed by the Stacks Foundation. Using just "wrapped STX" may help users from the ETH ecosystem understand what it is. I am not sure how important it is to prevent naming collisions here although the prior discussion did stear to avoid it.

### Recommendations for displaying commissions

It is advised to show the user what the listing price will be on the platform used and how much of that will go to the interested parties when sold such as the seller, the artist and a marketplace.

It is recommended to marketplaces to do the following if a user lists something at 1 STX, don't send 1000000 to list-in-ustx, but rather 1000000/(1+comm) as the price argument.

Some examples of how the user would be informed as displayed in December 2022 on Gamma.io and Tradeport.xyz:

**Example 1 tradeport.xyz**
![image](https://user-images.githubusercontent.com/33360391/208997197-61111244-b597-46fd-9c08-559550a127aa.png)

**Example 2 gamma.io**
![image](https://user-images.githubusercontent.com/33360391/208997558-6dcbdef7-692f-4b41-b7eb-df429c3cfead.png)

### Recommendations for error codes

From Friedger 2022: https://github.com/stacksgov/sips/issues/60#issuecomment-1048832083

unsupported token: u500
insufficient balance: u103
not authorized to mint: u403

# Using NFTs in applications

Developers who wish to use a non-fungible token contract in an application should first be provided, or keep track of, various different non-fungible token implementations. When validating a non-fungible token contract, they should fetch the interface and/or source code for that contract. If the contract implements the trait, then the application can use this standard's contract interface for making transfers and getting other details defined in this standard.

All of the functions in this trait return the `response` type, which is a requirement of trait definitions in Clarity. However, some of these functions should be "fail-proof", in the sense that they should never return an error. These "fail-proof" functions are those that have been recommended as read-only. If a contract that implements this trait returns an error for these functions, it may be an indication of a non-compliant contract, and consumers of those contracts should proceed with caution.

## Use of Post-Conditions

The Stacks blockchain includes a feature known as "Post-Conditions" or "Constraints". By defining post-conditions, users can create transactions that include pre-defined guarantees about what might happen in that contract.

For example, when applications call the `transfer` function, they should _always_ use post conditions to specify that the new owner of the NFT is the recipient principal in the `transfer` function call.


From: https://github.com/stacksgov/sips/issues/60#issuecomment-1050196178
friedger commented on Feb 24

How do you build post conditions for these txs if they can transfer either STXs or FTs?
@LNow
Author
LNow commented on Feb 24

The same way Alex/Arkadiko/Stackswaps are doing it. Based on token address user picked on the UI. With one additional if statement.
If user choose wrapped stx -> STX post-condition, otherwise -> FT post-condition.

# Related Work

Loopbom
https://github.com/radicleart/clarity-market

Megapont Ape Club
https://explorer.stacks.co/txid/SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.megapont-ape-club-nft?chain=mainnet

# Backwards Compatibility

Not applicable

# Activation

This SIP is activated after if there are no objections within the community before Bitcoin tip #780,000. There are already 20 or more contracts that have been deployed to mainnet that have implemented this standard. 

A trait that follows this specification is available on mainnet as: `to add later`

# Alternative for consideration
Instead of unified trait to allow the use of SIP010, SIP009 and SIP013 tokens for purchase have two traits one for SIP009 and SIP010 and the other for SIP013. This would eleviate the need for a uint that is ignored when using SIP009 and SIP010 but is required for using SIP013 tokens as one would have to define both a token identifier and an amount.

## one trait for FT's and NFT's

```
(use-trait commission-trait .commissions.trait)
(define-trait marketplace
    (
        ;; announce listing to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a list event
        ;; @param id; identifier of NFT or amount of FTs
        ;; @param; token-trait
        ;; @param price: of sale in micro STX
        ;; @param commission: action to happen after sale
        (list-in-token (uint <token-trait> uint <commission-trait>) (response bool uint))

        ;; announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a delist event
        ;; @param id; identifier of NFT or amount of FTs
        (unlist-in-token (uint) (response bool uint))

        ;; buy and announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; commission must match the one set during listing
        ;; must send a delist event
        ;; @param id; identifier of NFT or amount of FTs
        ;; @param commission: action to happen after sale        
        (buy-in-token (uint  '<commission-trait>') (response bool uint))

        ;; read-only function defining the asset
        (get-asset () (response {fq-contract: string, asset-class: string} uint))
    )
)

(define-trait commission
    (
        ;; additional action after a sale happened, usually a fee transfer for marketplaces
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; @param id; identifier of NFT
        ;; @param; token trait
        ;; @param price: of sale in micro STX
        (pay (uint <token-trait> uint) (response bool uint))
    )
)
```

## one trait for SFT's
you want to support SFT on both sides? token listed, and token being payed with? I don't see the point buying with anything other then STX really.

```
(use-trait commission-trait .commissions.trait)
(define-trait marketplace
    (
        ;; announce listing to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a list event
        ;; @param id; identifier of SFT
        ;; @param amount; amount of SFT 
        ;; @param; token-trait
        ;; @param price: of sale in smallest denomination of the token defined by <token-trait>
        ;; @param commission: action to happen after sale
        (list-in-token (uint <token-trait> uint uint <commission-trait>) (response bool uint))

        ;; announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; must send a delist event
        ;; @param id; identifier of NFT or amount of FTs
        (unlist-in-token (uint) (response bool uint))

        ;; buy and announce delisting to global marketplace
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; commission must match the one set during listing
        ;; must send a delist event
        ;; @param id; identifier of SFT
        ;; @param amount; amount of SFTs (Werner: to support buying SFT's you'd want to add two uints here too)
        ;; @param commission: action to happen after sale        
        (buy-in-token (uint uint  '<commission-trait>') (response bool uint))

        ;; read-only function defining the asset
        (get-asset () (response {fq-contract: string, asset-class: string} uint))
    )
)

(define-trait commission
    (
        ;; additional action after a sale happened, usually a fee transfer for marketplaces
        ;; must return `(ok true)` on success, never `(ok false)`
        ;; @param id; identifier of NFT
        ;; Werner: (should we add support for SFT here too (so both id and amount?)
        ;; @param; token trait
        ;; @param price: of sale in smallest denomination of the token
        (pay (uint <token-trait> uint) (response bool uint))
    )
)
```

# Reference Implementations list-in-ustx

As used by gamma.io when deploying a contract via their Create flow.

`;; awesome-saus-1
;; contractType: continuous

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)
;;(impl-trait .nft-trait.nft-trait)

(define-non-fungible-token awesome-saus-1 uint)

(define-constant DEPLOYER tx-sender)

(define-constant ERR-NOT-AUTHORIZED u101)
(define-constant ERR-INVALID-USER u102)
(define-constant ERR-LISTING u103)
(define-constant ERR-WRONG-COMMISSION u104)
(define-constant ERR-NOT-FOUND u105)
(define-constant ERR-NFT-MINT u106)
(define-constant ERR-CONTRACT-LOCKED u107)
(define-constant ERR-METADATA-FROZEN u111)
(define-constant ERR-INVALID-PERCENTAGE u114)

(define-data-var last-id uint u0)
(define-data-var artist-address principal 'SP...)
(define-data-var locked bool false)
(define-data-var metadata-frozen bool false)

(define-map cids uint (string-ascii 64))

(define-public (lock-contract)
  (begin
    (asserts! (or (is-eq tx-sender (var-get artist-address)) (is-eq tx-sender DEPLOYER)) (err ERR-NOT-AUTHORIZED))
    (var-set locked true)
    (ok true)))

(define-public (set-artist-address (address principal))
  (begin
    (asserts! (or (is-eq tx-sender (var-get artist-address)) (is-eq tx-sender DEPLOYER)) (err ERR-INVALID-USER))
    (ok (var-set artist-address address))))

(define-public (burn (token-id uint))
  (begin
    (asserts! (is-owner token-id tx-sender) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-none (map-get? market token-id)) (err ERR-LISTING))
    (nft-burn? awesome-saus-1 token-id tx-sender)))

(define-public (set-token-uri (hash (string-ascii 64)) (token-id uint))
  (begin
    (asserts! (or (is-eq tx-sender (var-get artist-address)) (is-eq tx-sender DEPLOYER)) (err ERR-NOT-AUTHORIZED))
    (asserts! (not (var-get metadata-frozen)) (err ERR-METADATA-FROZEN))
    (print { notification: "token-metadata-update", payload: { token-class: "nft", token-ids: (list token-id), contract-id: (as-contract tx-sender) }})
    (map-set cids token-id hash)
    (ok true)))

(define-public (freeze-metadata)
  (begin
    (asserts! (or (is-eq tx-sender (var-get artist-address)) (is-eq tx-sender DEPLOYER)) (err ERR-NOT-AUTHORIZED))
    (var-set metadata-frozen true)
    (ok true)))

(define-private (is-owner (token-id uint) (user principal))
    (is-eq user (unwrap! (nft-get-owner? awesome-saus-1 token-id) false)))

(define-public (transfer (id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-none (map-get? market id)) (err ERR-LISTING))
    (trnsfr id sender recipient)))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? awesome-saus-1 token-id)))

(define-read-only (get-last-token-id)
  (ok (var-get last-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (some (concat "ipfs://" (unwrap-panic (map-get? cids token-id))))))

(define-read-only (get-artist-address)
  (ok (var-get artist-address)))

(define-public (claim (uris (list 25 (string-ascii 64))))
  (mint-many uris))

(define-private (mint-many (uris (list 25 (string-ascii 64))))
  (let
    (
      (token-id (+ (var-get last-id) u1))
      (art-addr (var-get artist-address))
      (id-reached (fold mint-many-iter uris token-id))
      (current-balance (get-balance tx-sender))
    )
    (asserts! (or (is-eq tx-sender DEPLOYER) (is-eq tx-sender art-addr)) (err ERR-NOT-AUTHORIZED))
    (asserts! (is-eq (var-get locked) false) (err ERR-CONTRACT-LOCKED))
    (var-set last-id (- id-reached u1))
    (map-set token-count tx-sender (+ current-balance (- id-reached token-id)))
    (ok id-reached)))

(define-private (mint-many-iter (hash (string-ascii 64)) (next-id uint))
  (begin
    (unwrap! (nft-mint? awesome-saus-1 next-id tx-sender) next-id)
    (map-set cids next-id hash)
    (+ next-id u1)))

;; NON-CUSTODIAL FUNCTIONS START
(use-trait commission-trait 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.commission-trait.commission)

(define-map token-count principal uint)
(define-map market uint {price: uint, commission: principal, royalty: uint})

(define-read-only (get-balance (account principal))
  (default-to u0
    (map-get? token-count account)))

(define-private (trnsfr (id uint) (sender principal) (recipient principal))
  (match (nft-transfer? awesome-saus-1 id sender recipient)
    success
      (let
        ((sender-balance (get-balance sender))
        (recipient-balance (get-balance recipient)))
          (map-set token-count
            sender
            (- sender-balance u1))
          (map-set token-count
            recipient
            (+ recipient-balance u1))
          (ok success))
    error (err error)))

(define-private (is-sender-owner (id uint))
  (let ((owner (unwrap! (nft-get-owner? awesome-saus-1 id) false)))
    (or (is-eq tx-sender owner) (is-eq contract-caller owner))))

(define-read-only (get-listing-in-ustx (id uint))
  (map-get? market id))

(define-public (list-in-ustx (id uint) (price uint) (comm-trait <commission-trait>))
  (let ((listing  {price: price, commission: (contract-of comm-trait), royalty: (var-get royalty-percent)}))
    (asserts! (is-sender-owner id) (err ERR-NOT-AUTHORIZED))
    (map-set market id listing)
    (print (merge listing {a: "list-in-ustx", id: id}))
    (ok true)))

(define-public (unlist-in-ustx (id uint))
  (begin
    (asserts! (is-sender-owner id) (err ERR-NOT-AUTHORIZED))
    (map-delete market id)
    (print {a: "unlist-in-ustx", id: id})
    (ok true)))

(define-public (buy-in-ustx (id uint) (comm-trait <commission-trait>))
  (let ((owner (unwrap! (nft-get-owner? awesome-saus-1 id) (err ERR-NOT-FOUND)))
      (listing (unwrap! (map-get? market id) (err ERR-LISTING)))
      (price (get price listing))
      (royalty (get royalty listing)))
    (asserts! (is-eq (contract-of comm-trait) (get commission listing)) (err ERR-WRONG-COMMISSION))
    (try! (stx-transfer? price tx-sender owner))
    (try! (pay-royalty price royalty))
    (try! (contract-call? comm-trait pay id price))
    (try! (trnsfr id owner tx-sender))
    (map-delete market id)
    (print {a: "buy-in-ustx", id: id})
    (ok true)))

(define-data-var royalty-percent uint u500)

(define-read-only (get-royalty-percent)
  (ok (var-get royalty-percent)))

(define-public (set-royalty-percent (royalty uint))
  (begin
    (asserts! (or (is-eq tx-sender (var-get artist-address)) (is-eq tx-sender DEPLOYER)) (err ERR-INVALID-USER))
    (asserts! (and (>= royalty u0) (<= royalty u1000)) (err ERR-INVALID-PERCENTAGE))
    (ok (var-set royalty-percent royalty))))

(define-private (pay-royalty (price uint) (royalty uint))
  (let (
    (royalty-amount (/ (* price royalty) u10000))
  )
  (if (and (> royalty-amount u0) (not (is-eq tx-sender (var-get artist-address))))
    (try! (stx-transfer? royalty-amount tx-sender (var-get artist-address)))
    (print false)
  )
  (ok true)))

;; NON-CUSTODIAL FUNCTIONS END

(var-set last-id u0)

(define-data-var license-uri (string-ascii 80) "https://arweave.net/zmc1WTspIhFyVY82bwfAIcIExLFH5lUcHHUN0wXg4W8/0")
(define-data-var license-name (string-ascii 40) "PUBLIC")

(define-read-only (get-license-uri)
  (ok (var-get license-uri)))
  
(define-read-only (get-license-name)
  (ok (var-get license-name)))
  
(define-public (set-license-uri (uri (string-ascii 80)))
  (begin
    (asserts! (or (is-eq tx-sender (var-get artist-address)) (is-eq tx-sender DEPLOYER)) (err ERR-NOT-AUTHORIZED))
    (ok (var-set license-uri uri))))

(define-public (set-license-name (name (string-ascii 40)))
  (begin
    (asserts! (or (is-eq tx-sender (var-get artist-address)) (is-eq tx-sender DEPLOYER)) (err ERR-NOT-AUTHORIZED))
    (ok (var-set license-name name))))`

# Reference Implementations list-in-token 



## Source code

# Sources
Marketplace function
https://github.com/stacksgov/sips/issues/51
Generalized marketplace function (list-in-token vs. list-in-ustx)
https://github.com/stacksgov/sips/issues/51#issuecomment-1151670018
implementation 1: https://github.com/radicleart/clarity-market/blob/main/projects/risidio/indige/contracts/indige.clar
implementation 2: ?
Optional send-many trait (from SIP013 semi-fungible token)
https://github.com/stacksgov/sips/pull/42/files

Examples of commission contracts
SIP010 commision: https://github.com/radicleart/clarity-market/blob/main/projects/risidio/indige/contracts/commission-sip10-nop.clar
Simple fixed fee: `?`
Auction contract: `?`

Example Wrapped stx contract (defines STX as SIP010 token)
https://github.com/radicleart/clarity-market/blob/main/projects/risidio/indige/contracts/wrapped-stx.clar