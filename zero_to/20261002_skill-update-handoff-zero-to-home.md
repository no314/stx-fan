# 20261002 Skill-update handoff: learnings from Zero to Home

Input for a future skill-merge session. Zero to Home is the first zero_to page that is not a step flow and holds no wallet: a static index page (quick links, docs search, cycle bar, app tiles, skills footer) plus a skills history page. Built with static-first-architecture and stacks-labs-dapp-design, zero_to v2 of each. One input among several; do not update any skill from this file alone.

## Scaffold

Copy by path (relative to `zero_to/`; every homepage file sits flat in the root with a `zt_` prefix because only apps may be subfolders):

- `zt_site.js`: a header nav rendered from JSON where a word links to its primary URL and a caret beside it opens a list of alternatives. One `more` array per entry; click-away and Escape close. The caret is Phosphor's caret-down path inline, so no icon font is loaded for one glyph.
- `zt_cycle.js` plus `zt_test-cycle.mjs`: the Zero to Signing `cycleView` as a pure module with `assertPox` validating the network response at the boundary, and the boundary-block tests (1, 3, 50, 100, 101 from the end, first block, mid-cycle) written before the widget.
- `zt_home.js` `renderCycle` and `renderUnavailable`: the corrected cycle bar in plain DOM calls, and the unavailable state for a failed read.
- `zt_serve.mjs`: a 30-line static server, the Chrome path lookup, launch flags, and the pox fixture, shared by the harness and the screenshot script.
- `zt_verify-home.mjs`: `page.clock.install()` plus `runFor` to assert the 60 second re-read without waiting; `window.open` overridden in page to assert where a search input sends the user.

Read for inspiration, do not generalize: the skills page's version catalogue (`zt_skills-data.js`), the tax and explorer link lists.

## Learnings

### Design

- [design] [example] [generalizes: any page that is not a step flow] [source: remembered]
  The skill's "canonical product shape is a single-page guided flow" has no words for an index or about page. The parts that carried over unchanged: tokens, the surface system, the 64px header with baseline-aligned titles, `.in` inputs, `.site-foot`, the voice rules, the hard don'ts. The step rail, panel, info section, state and persistence conventions did not apply. Tiles were built as the panel recipe (surface-primary, radius 12, no border, hover to surface-fifth) and read as the same family on first review. A short "off-flow page" section listing what applies would have saved re-deriving it.

- [design] [example] [generalizes: any product owner review of a draft] [source: remembered]
  Every one of the owner's first-round marks removed chrome: the three labels above the search inputs (the placeholder now carries the label), the read stamp beside the cycle bar, the app count line, the "Built with" caption line, two footer links, and the section kicker above the bar. The skill's "stamp live on-chain figures with the moment of their read" was overruled for a homepage with a one-minute auto refresh: the owner's reasoning was that a visitor reloads rather than looks for a Refresh control on a simple page. Record as a fork: stamp and explicit refresh on a step where the user acts on the figure; silent periodic re-read on a page that only displays it.

- [design] [rule] [generalizes: any menu, dropdown, or label with free text] [source: both]
  A nowrap label inside a CSS grid of `1fr` columns stretched its column: the tile grid went uneven as soon as one mono meta line could not wrap. `repeat(3, minmax(0, 1fr))` is the correct grid for cards with unbreakable content. Separately, the Tax menu's longest label ("Summ (Crypto Tax Calculator)") wrapped inside the floating menu; menu links are nowrap and the label was shortened.

- [design] [example] [generalizes: the cycle bar at any geometry] [source: artifacts]
  At 39.76 percent the cycle label's left edge coincided with the fill edge and looked like a layout decision. It is a coincidence of that percentage. The screenshot script includes the mid-cycle state so the next geometry change gets a look.

- [design] [default] [generalizes: any page with a hash anchor into async content] [source: both]
  `scrollIntoView` on `location.hash` ran before the fetched text above the target had loaded, so the target moved after the scroll. Await every first-tab load, then scroll; and give the text block a `min-height` so switching tabs does not collapse it and shift the page. Found by the harness, not by eye.

### Static-first

- [static-first] [example] [generalizes: any page with no build step] [source: remembered]
  The skill's "Start by copying" list (package.json pins, vite.config.js, src/vendor, verify-app.mjs) did not apply: the page has no build, no React, and its folder is the deployment. The parts that did apply: the ladder (rung 1 plus a rung 2 read), vendored fonts, test-first for the pure module, the offline harness against the served folder with the chain read intercepted, screenshots from a committed script, the zero-external-requests assertion. A no-build page still needs the harness; it needs none of the Vite material.

- [static-first] [rule] [generalizes: any harness with a console-clean assertion] [source: both]
  The skill already says fixtures that answer errors should answer 200 bodies the app treats as unsupported. Confirmed again: a 500 fixture for the failed-read state logged "Failed to load resource" and failed the console-clean check. The failure fixture now answers 200 with `{}`, which `assertPox` rejects, and the app renders unavailable.

- [static-first] [default] [generalizes: any periodic re-read] [source: both]
  Playwright's `page.clock.install()` before navigation plus `clock.runFor(60500)` asserts a one-minute interval in milliseconds of wall time. The fetch the timer triggers is still async: a short real wait after `runFor` is needed before counting requests, or the count reads one short.

- [static-first] [example] [generalizes: Node ESM harnesses importing page modules] [source: both]
  A page module with top-level `await initSite()` cannot be imported by a Node test for its data. The version catalogue moved to a side-effect-free `zt_skills-data.js` that both the page and the harness import. Keep data modules free of DOM calls from the start.

- [static-first] [example] [generalizes: any GitHub Pages site served from a branch] [source: remembered]
  "New subfolder appears automatically" needs a generator at deploy time, which on a branch-deployed Pages site means either an Actions deploy workflow (a Pages settings change) or committing generated output. The owner chose neither: a hand-edited `apps` array in `zt_site.json` with a harness check that every entry's folder exists. For a list that changes a few times a year, the generator is more machinery than the edit it saves.

### Architecture (feeds stacks-dapp-architecture only as context)

- [dapp] [example] [generalizes: read-only pages] [source: remembered]
  A page that reads one public endpoint and signs nothing is below the no-wallet tier 2: there is no write to gate and no key to refuse. The only obligations that applied were pin the read host, validate the response shape at the boundary, and render a failed read as unavailable. The skill could say so in one line so a builder does not search it for applicable rules.

- [dapp] [example] [generalizes: any third-party docs or API a static page links or calls] [source: artifacts]
  Not every documentation site can be searched by URL. GitBook sites open their search dialog from `?q=` (verified in a browser for docs.stacks.co and leather.gitbook.io). docs.hiro.so has no search URL and its JSON search endpoint sends no CORS header, so a static page cannot call it; the owner chose a site-scoped Google search. Check the mechanism per site before promising a search box.

## Verified constants (recheck only if stale)

- api.hiro.so `/v2/pox` answers `access-control-allow-origin` for the stx.fan origin (checked 2026-09-30). Live read 2026-10-02: cycle 144, start 968450, prepare 970450, last block 970549, 2100 block cycle with a 100 block prepare phase.
- GitBook `?q=<term>` opens the search dialog with results on docs.stacks.co and leather.gitbook.io/developers (checked in a browser 2026-10-02).
- docs.hiro.so `/api/search?query=` returns JSON with no CORS header; `/search?q=` is 404 (checked 2026-09-30).
- cryptotaxcalculator.io redirects to summ.com (2026-10-02); summ.com sits behind a bot check that headless and in-app browsers do not pass.
- Stacks tax integrations live on 2026-10-02: fatstx.github.io, koinly.io/integrations/stacks, coinledger.io/integrations/stacks. CoinTracker has only a feature request for Stacks.

## Mistakes and dead ends

- The first commit put the skill texts in `zero_to/skills/` and support files in `assets/`, `scripts/` and `screenshots/`. The owner wants only apps as subfolders of zero_to, so an app folder is never confused with page machinery. Everything moved flat into the root with a `zt_` prefix before the push. Ask about folder conventions before the first commit of a page that lives inside a directory of apps.

- A first mock put a folder path in each tile's meta line. It wrapped at three different widths across five tiles and was dropped; the URL bar shows the folder anyway.
- The first harness run failed the anchor-scroll check because the test clicked a tab on a card above the target before measuring; the check moved before the clicks, and the page got the min-height fix above.
- An early draft listed "Explorer" as both the word and the first menu entry; the owner wanted the menu to list exactly the alternatives, with the primary repeated under its full name ("Hiro Explorer").

## Process

- The owner reviewed by annotating a screenshot (strike-throughs and red labels) rather than by text. Applying marks from an image and re-shooting took one round per batch of marks and produced no misreadings. Keep a screenshot script from the first mock, not from the first build.
- Research for link rows (which dashboards, which tax tools, which docs can be searched) took longer than the page. Verify every external URL with a real browser once; curl alone passed a bot-check page as "200".
- Order that worked: skill texts and assets copied first, then the pure module with its tests, then the page, then the harness, then screenshots, then the live smoke test, then README, PRD and this file.
