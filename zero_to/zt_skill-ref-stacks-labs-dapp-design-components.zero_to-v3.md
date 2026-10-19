# Component recipes

Every class below exists in `assets/app.css`. Build screens exclusively from these; if a screen seems to need something new, first recheck whether an existing recipe covers it, then extend the app's copy of app.css in its marked tail block, tokens only, and flag the addition PROPOSAL for this file. JSX shapes are from the production apps (React; plain elements, no component library). Updated 2026-10-19 (v3 merge): section 3 gains the blocked state, section 13 is the corrected cycle bar, section 15 drops the cross-promotion link, section 17 adds copy controls.

## Contents

1. Header and shell
2. Buttons
3. Step rail and tab
4. Panel, body-wrap, footer
5. Fields and inputs
6. Key-value rows
7. Badges, status lines, check rows
8. Comparison (option) tables
9. CLI command blocks
10. Sub-stage cells
11. Prerequisites checklist
12. Modals and pickers
13. Cycle progress bar
14. Small parts: spinner, elapsed, hashline, suffix row, wallet menu, approximate duration
15. Site footer and reset
16. Wallet selector
17. Copy controls

## 1. Header and shell

64px header, bottom hairline. Display-face title plus muted sub left, baseline-aligned; network `select.netsel` and wallet control right. Wallet button: primary "Connect wallet" when disconnected; secondary showing the BNS name (mainnet, with API fallback) or the shortened address when connected, with a caret opening a floating `--elevation-md` menu (Disconnect). Page content in `.wrap` (max-width 1104px, 24px gutters). In fixture mode the network pill reads "Test data: {fixture}".

```jsx
<header className="hdr"><div className="wrap">
  <div className="titles"><h1>App Name</h1><span className="sub">subtitle</span></div>
  <div className="right">
    <select className="netsel">…</select>
    <div className="wallet-menu">…</div>
  </div>
</div></header>
```

## 2. Buttons

`.btn` plus `.btn-primary` (accent fill, black text, accent-tinted glow), `.btn-secondary` (surface-fourth plus border), `.btn-tertiary` (transparent, hover lifts). `.btn-lg` (44px) for step-primary actions; 36px default. Disabled: 45% opacity, no shadow. Primary action buttons read "Connect wallet" and trigger connect when disconnected (the `GatedBtn` pattern): the user's next required action is always the button under the cursor. A disabled-state assertion in the harness must connect first, since the gated button is enabled until an account exists.

```jsx
function GatedBtn({account,onConnect,disabled,onClick,children}){
  if(!account) return <Btn kind="primary" lg onClick={onConnect}>Connect wallet</Btn>;
  return <Btn kind="primary" lg disabled={disabled} onClick={onClick}>{children}</Btn>;
}
```

## 3. Step rail and tab

Row of `.rail-item` (mono number over tiny label; state classes `locked`, `complete`, `skipped`, `blocked`, plus `clickable`) with the active step as `.rail-tab`: a surface-primary tab (radius 12px top) merging into the panel. Complete items show a green check beside the number; skipped items strike the label; locked items are dimmed and non-interactive; blocked items are complete-weight in the tertiary tone with a minus-circle and the italic label "not needed", never clickable; completed re-enterable steps show a "read-only" pill in the tab.

**Geometry contract**: one shared text baseline. `.rail` is `display:flex; align-items:baseline`; `.rail-tab` (fixed 80px box, `align-items:baseline`, padding-top positions its line optically) contributes its number's baseline, and each `.rail-item` is a column whose first line is the number, so flexbox aligns every number and the active title on the tab number's baseline; labels hang below. The tab must remain the deepest item so it stays flush with the panel: keep each item's below-baseline extent (number descent plus gap plus label line) smaller than the tab's. The active number is `--text-primary`, weight 500, 26px mono; inactive numbers are 18px mono `--text-secondary`. Verify baseline alignment and tab flush programmatically after any rail change (assertion in `scaffold.md`).

```jsx
// active
<div className="rail-tab"><span className="num">{n}</span><span className="name">{name}</span>
  {readOnly?<span className="ro">read-only</span>:null}</div>
// inactive
<button className={`rail-item ${st}${clickable?" clickable":""}`} disabled={!clickable}>
  <span className="rail-num">{st==="complete"?<i className="ph ph-check"/>:st==="blocked"?<i className="ph ph-minus-circle"/>:null}{n}</span>
  <span className="rail-lbl">{st==="skipped"?"skipped":st==="blocked"?"not needed":short}</span>
</button>
```

When the leftmost step is active, square the panel's top-left corner (`borderTopLeftRadius:0`) so tab and panel read as one shape. Address rail items in the harness by their visible label, not by position, since blocked and active states shift indexes.

## 4. Panel, body-wrap, footer

```jsx
<section className="panel">
  <div className="body-wrap">
    <div className="body">…step content…</div>
    <div className="foot">
      {onBack?<Btn kind="tertiary" onClick={onBack}><i className="ph ph-arrow-left"/>Back</Btn>:null}
      <span className="spacer"></span>
      …primary action…
    </div>
  </div>
</section>
```

`.panel` is a flex column, min-height 380px. `.body-wrap` must be flex:1 column and `.body` flex:1: that is what pins `.foot` to the panel bottom on short read-only views (a shipped bug; keep the wrapper). The tertiary Back button carries `margin-left:-16px` so its label aligns with the content edge. Read-only views of completed steps render a `.kvs` summary plus the footer, nothing editable.

## 5. Fields and inputs

`.field` label (13px medium, `--text-secondary`) over `.in` control. `.in.mono` for principals and hashes; `textarea.in` for JSON; `textarea.in.code` for contract source (pre, 12px mono). Read-only inputs use the `readOnly` attribute and get the muted recipe automatically. Two-column groups use `.two` (CSS grid, 16px gap). Ligatures are off in every mono control (shared rule). Judge an identifier field after blur or when the text reaches full length, not while typing.

## 6. Key-value rows

`.kvs` > `.kv`: sans label left, mono value right (`.v`), hairline dividers, word-break for long principals. Use for read-only step summaries and derived values. Empty value glyph is a plain hyphen.

## 7. Badges, status lines, check rows

- `.badge b-ok|b-bad|b-warn|b-pending|b-idle` for compact verdicts (hash match, registered).
- `.status err|ok|info` for inline, non-blocking messages under the content they relate to. Errors never advance a step and never block the page.
- `.check-row` with Phosphor circle icons for validation checklists.

## 8. Comparison (option) tables

`.opt-table` for choosing between bundled options: attribute column in `--text-secondary`, one column per option with a radio in the header cell, selected column tinted via `.selcol`. Render only options valid on the active network. Never present options as prose when a table can compare them.

## 9. CLI command blocks

`.cmd`: surface-fourth mono block, top-right `.copybtn` (copies the full command, briefly shows a check). Commands shown must be byte-identical to the reference docs except for substituted placeholders; bind placeholders to visible fields so the copied command needs no further edits.

## 10. Sub-stage cells

`.cell`: surface-secondary block with `h3 > span.n` mono ordinal. Use for ordered sub-sequences inside one step. The rail never reflects sub-stages.

## 11. Prerequisites checklist

`.prereq` items with `ph-circle-dashed` icons, one per requirement, followed by an `.ack` checkbox ("I have these in place.") gating the primary action. No chain calls on a prerequisites step.

## 12. Modals and pickers

40% black overlay plus solid `--surface-primary` box, `--elevation-lg`, no blur. `h3` display-face title, `.pick` for selectable rows (record picker, resume-step picker), `.row` right-aligned for actions. Modals are for: multi-record resume, account-switch resume (default highlighted with an accent outline), and hard guards (section 13). Everything else is inline.

## 13. Cycle progress bar

For flows where an action is valid only during part of a chain window (staking outside the prepare phase, registering inside a preorder window), show position explicitly and guard the action. The derivation is a pure function with Node tests before the component; the rules it encodes are in `stacks-dapp-architecture`, section "Transaction validity windows", and the geometry rules in the SKILL.md section "Chain-timing widgets".

```js
// pure, tested first: zero-to-signing src/steps.jsx cycleView, zero_to zt_cycle.js
function cycleView(pox){
  if(!pox||!pox.next_cycle||!pox.current_cycle) return null;
  const len=pox.reward_cycle_length;
  const end=pox.next_cycle.reward_phase_start_block_height;   // exclusive, internal only
  const start=end-len;
  const cur=pox.current_burnchain_block_height;
  const toGo=Math.max(0,end-cur);
  const exact=Math.max(0,Math.min(100,(cur-start)/len*100));
  const pct=cur>=end-1?100:Math.min(99,Math.floor(exact));    // floor, never round
  const prepStart=pox.next_cycle.prepare_phase_start_block_height;
  const prepPct=Math.max(0,Math.min(100,(prepStart-start)/len*100));
  return { start, end, cur, toGo, exact, pct, prepStart, prepPct, cycleId:pox.current_cycle.id, prepare:cur>=prepStart };
}
```

```jsx
function CycleBar({cv}){
  if(!cv) return null;
  const edge=cv.exact>88?"right":cv.exact<12?"left":null;   // only the number pins; the caret never moves
  const num=<>({cv.toGo} {cv.toGo===1?"block":"blocks"} to go) {cv.cur}</>;
  return <div className="cyclebar">
    <div className="cb-top">
      {edge==="right"?<span className="cb-marker pin-right" style={{right:`${100-cv.exact}%`}}>{num}<span className="cb-lead"></span></span>
      :edge==="left"?<span className="cb-marker pin-left" style={{left:`${cv.exact}%`}}><span className="cb-lead"></span>{num}</span>
      :<span className="cb-marker" style={{left:`${cv.exact}%`}}>{num}</span>}
      <span className="cb-caret" style={{left:`${cv.exact}%`}}></span>
    </div>
    <div className="cb-track">
      <div className="cb-fill" style={{width:`${cv.exact}%`}}></div>
      <div className="cb-prep" style={{left:`${cv.prepPct}%`}}></div>
      <span className="cb-label">cycle #{cv.cycleId}, {cv.pct}% done{cv.prepare?" (prepare phase)":""}</span>
    </div>
    <div className="cb-ends"><span>Start bitcoin block {cv.start}</span><span><span className="cb-prep-mark">prepare {cv.prepStart}</span>end {cv.end-1}</span></div>
  </div>;
}
```

- Fill is the network accent at 50% opacity; the blocked tail is a neutral 10% tint with a 1px boundary tick (`.cb-prep`).
- The ends row shows the last block in the window (`end - 1`); the boundary and end labels share one right-hand group.
- A failed read renders the track with "cycle position unavailable", never a zero position.
- Place the bar at the bottom of the step body, above the footer. Re-read on an interval or explicit control per the app's stamp policy.
- **Guard**: when the blocked window is active, the primary action opens a warning modal instead of reaching the wallet, and the submit path re-checks against a fresh read before signing.
- A window bar may preview before its anchoring event, labelled as conditional (candidate, Zero To BNS `WindowBar`).

## 14. Small parts

- `.spin`: 12px accent spinner for polling states, inline in a `.status info` line.
- `.elapsed`: mono elapsed-time readout beside any poll ("Checking the record every 10 seconds: 1m 20s"), with a manual "Refresh now" link.
- `.hashline`: label plus mono hash plus verdict badge, for content-identity displays.
- `.suffix-row`: fixed mono prefix cell plus input for prefix-joined names.
- `.wallet-menu .menu`: floating card, elevation-md, for the disconnect action.
- `.approx`: faded body-face duration beside a block height ("about 5 years", "soon" under an hour), computed at 10 minutes per block in the two largest sensible units; the height stays the accurate number.

## 15. Site footer and reset

`.site-foot` on every step, below the info sections: quiet links left in the inactive-step-label tone (12px, `--text-tertiary`, underline on hover), a spacer, and a small black text button right. The repo link ("Github Repository") is always present. Cross-app promotion belongs on suite pages (the zero_to homepage); a single-purpose tool carries no "other sidekicks" link. A suite page may carry one quiet line crediting the skills that built it.

The right-side control is "Reset" (or "Clear Cache and Reset" when a device cache exists): clears every saved record on all networks plus the URL state, then reloads to the first step. It never acts directly; clicking opens `.reset-pop`, a small card anchored above the button (elevation-md, click-away closes) with the confirm text and Cancel / Reset buttons. Destructive local-state actions get this anchored-popover confirm, not a full modal. For a zero-persistence app the control clears the URL and reloads.

```jsx
<div className="site-foot">
  <a href={repoUrl} target="_blank" rel="noopener">Github Repository</a>
  <span className="spacer"></span>
  <span className="reset-wrap">
    {pop?<span className="reset-pop">…confirm text + Cancel/Reset…</span>:null}
    <button className="reset-btn" onClick={()=>setPop(o=>!o)}>Reset</button>
  </span>
</div>
```

## 16. Wallet selector

A standard modal listing the full known-wallet catalog (policy in `stacks-dapp-architecture`, section "Wallet capability"). Row forms: connectable wallet = `.pick` button with "Connect" meta; blocked wallet = `.pick-blocked` div with a `b-warn` badge ("Not supported") and a "Why? ↗" link to the in-app explainer page; known-but-not-installed = `.pick-link` div with an "Install ↗" link. Below the list, one sentence: "This app requires post-conditions on every call. Wallets that don't support them can't be used safely." The explainer ships as a second static page sharing the app's tokens (a second Vite `rollupOptions.input` entry whose only script imports the stylesheets). An address-only read may list every wallet without tiers.

## 17. Copy controls

One copy control per identifier row (`.copybtn`, icon-only or labelled) plus one "Copy all" that yields one item per line; the address in a result head copies too. Swallow clipboard failures and show "Copied" as the fallback confirmation. A plain-text summary that feeds both the clipboard and a support mail keeps the two channels identical (sBTC Deposit Recovery `summaryText`).
