# Static-first constants and hosting facts (dated)

Recheck when stale. App-specific pins live in each app's `package.json`.

- Exact pins shared across the family on 2026-10-18: react 18.3.1, react-dom 18.3.1, vite 5.4.21, @vitejs/plugin-react 4.3.4, playwright-core 1.62.1, @phosphor-icons/web 2.1.2, @fontsource/jetbrains-mono 5.2.8, @scure/bip39 2.3.0, @noble/curves 1.9.7, @noble/hashes 1.8.0, @scure/base 1.2.6, c32check 2.0.0, decimal.js-light 2.5.1. Node 22 and clarinet 3.23.2 in the gas swap CI.
- `@scure/bip39` 2.3.0 exposes wordlists only as `./wordlists/english.js`, with the extension; the extensionless subpath fails at resolve time.
- SheetJS Community Edition 0.20.3 is pinned as a tarball URL from the SheetJS CDN because the npm registry copy stops at 0.18.5; the Community Edition has no frozen-pane option, patched into the zip through `XLSX.CFB` (tax export, 2026-10-15).
- `@phosphor-icons/web/regular` imported through its CSS emits svg, woff, ttf and woff2 (about 4.1 MB) into dist; browsers fetch only the woff2 (observed 2026-10-18).
- A Vite module worker needs no configuration: `new Worker(new URL("./worker.js", import.meta.url), { type: "module" })`.
- GitHub Pages runs Jekyll unless `.nojekyll` exists at the repo root; Jekyll converts markdown with YAML front matter to HTML and stops serving the `.md` (found live 2026-10-03). Private GitHub Pages publishing requires GitHub Enterprise Cloud; on other plans the site is publicly reachable.
- GitHub Pages exposes no page analytics; ranking by usage needs a third-party script or a service.
- Third-party doc search handoff from a static page (checked 2026-09-30): GitBook sites open their search dialog from `?q=<term>` (docs.stacks.co, leather.gitbook.io/developers); docs.hiro.so `/search?q=` answers 404 and `/api/search?query=` returns JSON without a CORS header, so a site-scoped Google search is the fallback.
- Cloudflare Workers Free plan CPU limit 10 ms per request; KV eventually consistent (up to about 60 seconds stale); Durable Objects with SQLite storage on the free plan. From the gas swap docs, 2026-09, no primary link recorded.
- The Next.js image-optimization advisory GHSA-2xp9-vwfh-vxw4 (CVSS 9.5, affected `>= 10.0.0 < 15.5.24` and `< 16.3.3`) requires a running image endpoint; a dist of static files cannot have one. Zero to Signing's 113-package lockfile held no `next` and no `sharp` (checked 2026-09-03).
- Harness ports in use across the family: 4173 (signing, gas, home verify), 4174 (home shots), 4180 and 4181 (signing shots), 4318 (tax export), 4517 and 4519 (bns), 4523 and 4524 (bns lookup).
