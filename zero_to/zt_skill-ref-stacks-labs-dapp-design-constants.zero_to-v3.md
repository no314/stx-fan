# Design constants (dated)

Values the design skill depends on, with the date they were last checked. Recheck when stale.

- Fonts bundled in `assets/fonts/`: InstrumentSans-Regular.woff2, InstrumentSans-Italic.woff2 (SIL OFL), jetbrains-mono-latin-400-normal.woff2, jetbrains-mono-latin-500-normal.woff2 (SIL OFL), opensaucesans-regular.woff2, opensaucesans-medium.woff2 (free licence). Checked 2026-09-05.
- JetBrains Mono descent over ascent plus descent: 300 / 1320. Used by the baseline assertion. Checked 2026-09-03.
- Icon set: Phosphor Icons regular weight, `@phosphor-icons/web` 2.1.2, self-hosted. The CSS import emits four font formats (svg 2,996,371 bytes, woff 488,716, ttf 488,636, woff2 147,380) into dist; browsers fetch only the woff2. Observed 2026-10-18 in sBTC Deposit Recovery.
- Rail tab box: 80px; active number 26px mono weight 500; inactive numbers 18px mono; header 64px; panel min-height 380px; content max-width 1104px with 24px gutters; info section max 72ch; viewport `width=1200`.
- Marker edge threshold: the number pins to the edge within 12 percent of either end (`exact > 88` or `exact < 12`); leader line 10px.
- Mainnet cycle geometry used in screenshots: 2100 blocks, the last 100 the prepare phase, so the boundary sits at 95.2 percent. Checked 2026-09-30 against `/v2/pox`.
- Block-to-time convention for approximate durations: 10 minutes per block, 144 blocks per day. A convention, not a chain fact; copy says "about".
- Writing plugin version referenced by the copy inventory flags: `stacks-labs-docs-writing` 0.3. Checked 2026-10-17.
