# Zero to Home: PRD

Status: built 2026-10-02 from this document. Decisions are dated inline.

## Objective

A static index page at `https://stx.fan/zero_to/` that lists every zero_to app, puts the ecosystem links and the three docs searches one click away, and shows where mainnet is in the reward cycle. Looks like the apps it links to. Zero backend, zero build for the page itself, zero runtime CDN.

Skills: static-first-architecture (rung 1 pre-render plus rung 2 browser JS for the pox read), stacks-labs-dapp-design (tokens, header, cycle bar, footer, voice). stacks-dapp-architecture is not needed: the page signs nothing and holds no wallet. Tier 2 with no wallet does not apply either: the page performs no write.

## Non-goals

- No wallet connect, no network switch. Tiles link to each app on mainnet only (decided 2026-10-02).
- No React, no Vite: `index.html`, `zt_home.css` (page recipes only), `zt_home.js`, `zt_site.js`, `zt_cycle.js`, plus the shared tokens.css, app.css and fonts copied from the design skill. Only apps are subfolders of zero_to; every homepage file sits flat in the root with a `zt_` prefix (decided 2026-10-02).
- No click analytics (see "Ordering").
- No mobile layout (viewport width=1200, same as the apps).

## Glossary

app: one deployed zero_to subfolder with an `index.html`. quick link: an external ecosystem URL in the header. docs search: an input that opens a third-party docs site with a query. cycle bar: the CycleBar from Zero to Signing step 5, unchanged.

## Layout, top to bottom

1. Header (64px `.hdr`): wordmark "stx.fan" linking to the root site, page title "Zero to Home" beside it (decided 2026-09-30), quick links right, baseline-aligned.
2. Docs search row: three `.field` inputs in a 3-column grid. Enter opens the target in a new tab. No label above the input: the label is the placeholder ("Search Stacks docs: staking, sBTC, Clarity"). Mono hint under each with the destination host.
3. Cycle bar: the CycleBar alone, no kicker. The track label names the network: "Mainnet cycle #144, 39% done". No read stamp and no Refresh control; the page re-reads /v2/pox every 60 seconds (setInterval, cleared on page hide) and a reload is the manual refresh (decided 2026-09-30).
4. App tiles: 3-column grid of standout cards (`--surface-primary`, radius 12, no border). Name in display face 24px, description 14px secondary (max 2 sentences), one mono meta line ("wallet signs, mainnet and testnet" or "no wallet, no keys, mainnet").
5. Built with: kicker "Built with", three `--surface-secondary` cells naming the skills, no kicker-line caption, each linking to `skills.html#<skill-name>` (decided 2026-10-02).
6. `.site-foot`: Github Repository left, spacer, "last reviewed YYYY-MM-DD" in mono right. Nothing else.

## Quick links (verified 2026-09-30, all answer 200)

Each nav word links to its primary URL. A word with alternatives gets a Phosphor caret-down button beside it; clicking the caret opens a floating menu (surface-primary, radius 8, elevation-md) listing exactly the `more` entries (repeat the primary there under its full name so the list is complete), click-away and Escape close it. The word itself never opens the menu. Stored in `zero_to/site.json`:

```json
{ "quick": [
  { "label": "Explorer", "url": "https://explorer.hiro.so/",
    "more": [ { "label": "Hiro Explorer", "url": "https://explorer.hiro.so/" },
              { "label": "STXER Explorer", "url": "https://explorer.stxer.xyz/" } ] },
  { "label": "STX-only staking", "url": "https://app.leather.io/staking" },
  { "label": "Signers", "url": "https://explorer.hiro.so/signers?chain=mainnet" },
  { "label": "Miners", "url": "https://hub.stx.pub/" },
  { "label": "Bitcoin staking", "url": "https://staking.stacks.co/" },
  { "label": "Staking tracker", "url": "https://www.stacking-tracker.com/" },
  { "label": "Tax", "url": "https://fatstx.github.io/",
    "more": [ { "label": "fatSTX", "url": "https://fatstx.github.io/" },
              { "label": "Koinly", "url": "https://koinly.io/integrations/stacks/" },
              { "label": "CoinLedger", "url": "https://coinledger.io/integrations/stacks" },
              { "label": "Summ", "url": "https://summ.com/integrations/stacks" } ] },
  { "sep": true },
  { "label": "API status", "url": "https://status.hiro.so/" }
] }
```

Adding an alternative is one line in `more`; adding a word is one object. Miners (hub.stx.pub) and Bitcoin staking (staking.stacks.co) confirmed 2026-10-02.

Tax (verified 2026-10-02): fatSTX is live (fatstx.github.io, address plus year plus currency, CSV export). Koinly's Stacks page is live (API sync by address, trades may need manual merging). CoinLedger's Stacks page is live ("How to do your Stacks Taxes"). cryptotaxcalculator.io now redirects to summ.com; its Stacks integration page sits behind a bot check I could not pass, but Summ publicly advertises full Stacks support (and Xverse links to it), so the link is kept; verify by hand in a normal browser before shipping. CoinTracker has no Stacks integration (feature request only), Awaken shows nothing for Stacks.

The old stx.fan navbar (repo history, index.html before commit dee5b82 of 2026-08-09) had dropdown groups: Dapps, DEX, NFT Markets, Stacking, STX mining, Wallets, Stats/Data, Explorers. Candidates from it if you want more later: stx.vision, stxscan.co, Ortege dashboard, status.stacks.org, stxtools.io.

## Docs search targets

| Box | Opens | Note |
| --- | --- | --- |
| Stacks docs | `https://docs.stacks.co/?q=<term>` | GitBook opens its search dialog from `?q=`. To verify in a browser before shipping. |
| Hiro API docs | `https://www.google.com/search?q=site%3Adocs.hiro.so+<term>` | Decided 2026-10-02: Google search scoped to docs.hiro.so (their docs have no search URL and the search API has no CORS). |
| Leather developer docs | `https://leather.gitbook.io/developers?q=<term>` | GitBook, same mechanism as Stacks docs. leather.io/developers is a marketing page, not docs. |

## Tiles (manual, decided 2026-10-02)

No generator, no build. The tiles are an `apps` array in `zero_to/site.json`, one object per app (`name`, `description`, `url`, `meta` such as "wallet signs, mainnet and testnet"). Adding an app is adding one object; the page renders tiles in array order. A fixture test asserts every `url` in the array resolves to an existing `zero_to/<folder>/index.html`, so a typo or a missing folder fails the check before deploy.

## Ordering

Click-ranked ordering needs somewhere to count clicks, and a static host has none. What exists:

- GitHub Pages exposes no page analytics. The repo traffic API counts repo views, not site clicks.
- A hosted counter (GoatCounter, Cloudflare Web Analytics) would work with a scheduled Action rewriting `order`, but it adds a runtime third-party script, which the design skill forbids, and a second service to operate.

Decided 2026-10-02: no click ranking and no per-visitor ordering. Array order in `site.json` is the order. The page touches no browser storage; the harness asserts `localStorage.length === 0`.

## Cycle bar

Port `cycleView` and `CycleBar` from Zero to Signing `src/steps.jsx` to plain JS, byte-equivalent math: floor never round, marker at the true position with edge pinning, prepare zone tinted with a boundary tick, last block labelled `end - 1`. Read `https://api.hiro.so/v2/pox` (CORS confirmed for stx.fan). A failed read renders "unavailable", never zeros. Unit tests at the boundary blocks (1, 3, 50, 101 from the end, plus mid-cycle) before the widget exists.

## Copy for tiles (accepted for v1, 2026-10-02)

- Zero to Signing: From nothing to a registered, staked, signing Stacks signer. Prefilled where possible, post-conditions on every transaction, and the URL is the state.
- Zero to Claiming: Claim sBTC rewards for every staker in a signer-manager pool, or only for yourself. Amounts are read from the manager before anything is signed.
- Zero to BNS: Search, register, renew, transfer, list and buy BNSv2 names. Every price, window and default is read from the deployed contract.
- sBTC to Stacks gas: Swap a little sBTC for STX gas in one signature, starting from zero STX. The sponsor is repaid inside the same transaction.
- sBTC Deposit Recovery: A confirmed BTC deposit that never minted sBTC. Paste the txid: the page proves the recipient and re-registers the deposit with the signers.

Order: Signing, Claiming, BNS, gas, Deposit Recovery (assumed from the accepted mock).

## skills.html (decided 2026-10-02)

A second page in the zero_to root, modeled on `stx.fan/signer/about.html`, showing how the apps are built and the full history of each skill. Same header as the homepage (wordmark, title "Skills", quick links), same tokens and app.css, same footer.

Content, top to bottom:

1. Intro: the apps are built by Claude with three skills and a one page PRD per app; each build ends with a dated hand-off of what it learned; a merge session folds several hand-offs into the next skill version. Quote the hand-off rules briefly (only lived learnings, tag rule/default/example, state where it stops applying).
2. One card per skill, in this order: static-first-architecture, stacks-dapp-architecture, stacks-labs-dapp-design. Each card: h2, mono filetag, a tab row of versions newest first, a one paragraph revision note under the tabs that changes with the tab, and the SKILL.md text verbatim in a mono `.mdblock` (max-height with scroll), exactly as the signer about page does it.
   - static-first-architecture: zero_to v2 (current, merged 2026-09-05), zero_to v1, Revised, Original.
   - stacks-dapp-architecture: zero_to v2, zero_to v1, Revised, Original.
   - stacks-labs-dapp-design: zero_to v2, zero_to v1 (no earlier versions exist).
3. "PRD and scaffolding": the current `references/scaffold.md` verbatim, as on the signer page.
4. "How skills evolve": the merge prompt (`prompt_to_keep_upskilling.md`) verbatim, so the process is public.

Sources: Original, Revised and zero_to v1 texts are already embedded in `signer/about.html` (ids sf-original, sf-revised, sf-zero, dapp-original, dapp-revised, dapp-zero, design-zero, prd-tpl); v2 texts come from the installed skills. Every version is a markdown file in the zero_to root (for example `zt_skill-static-first-architecture.zero_to-v2.md`) and have skills.html fetch them same-origin; the texts stay diffable in git and the HTML stays small. Revision notes per version come from the signer page's NOTES object plus a new note per v2 (what the September merge added: test-first layer, offline harness, post-condition fork, no-wallet tier 2, chain-timing widget rules, key-material detection).

Not on the page: `components.md` (internal recipes), the hand-offs themselves, and the v2 assessment (kept as a separate file, not published).

## Acceptance criteria (what the harness asserts)

- Renders one tile per `apps` entry in `site.json`; every tile `url` resolves to an existing folder with an index.html.
- Zero requests to non-localhost origins in fixture mode except the pox read, which is intercepted.
- Cycle bar numbers match the fixture at each boundary state; screenshots regenerated by a committed script.
- No em dash in rendered text; nothing in localStorage.
- Every quick link and docs target answers 200 in a live smoke check (not part of the offline harness).
- skills.html: every tab loads its markdown file, the revision note changes with the tab, every version file listed in the page exists.
- Header baseline alignment and tile grid checked by screenshot review.

## Files to create

```
zero_to/
  index.html        the page
  zt_home.css       page recipes only (zt_tokens.css and zt_app.css are the shared files)
  zt_site.js        shared: load zt_site.json, header nav with caret menus, docs search
  zt_home.js        tiles, skills footer, cycle bar (60 s re-read while visible)
  zt_cycle.js       pure cycle math, tested in node
  zt_site.json      quick links (nested), search targets, apps, skills, review date
  skills.html, zt_skills.js, zt_skills-data.js   skill history page and its version catalogue
  zt_skill-*.md     every skill version as markdown, fetched by skills.html
  zt_*.woff2        fonts
  zt_test-cycle.mjs, zt_verify-home.mjs, zt_shots.mjs, zt_serve.mjs
  zt_shot-*.png     regenerated by the shot script
```
