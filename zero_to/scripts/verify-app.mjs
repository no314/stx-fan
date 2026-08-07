// Executes the built artifact (dist/) in headless Chromium and walks the
// automatable PRD acceptance criteria. Run `npm run build` first, then serve
// dist/ (this script starts its own server on 4173).
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { chromium } from "playwright-core";

const DIST = new URL("../dist", import.meta.url).pathname;
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".woff":"font/woff", ".woff2":"font/woff2", ".ttf":"font/ttf", ".svg":"image/svg+xml" };
const server = createServer((req, res) => {
  const path = req.url.split("?")[0];
  const file = join(DIST, path === "/" ? "index.html" : path);
  if (existsSync(file)) { res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" }); res.end(readFileSync(file)); }
  else { res.writeHead(200, { "content-type": "text/html" }); res.end(readFileSync(join(DIST, "index.html"))); }
});
await new Promise(r => server.listen(4173, r));

const exec = process.env.CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: existsSync(exec) ? exec : undefined });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", e => consoleErrors.push(String(e)));
page.on("console", m => { if (m.type() === "error") consoleErrors.push(m.text()); });
const externalRequests = [];
page.on("request", r => { if (!r.url().startsWith("http://localhost:4173")) externalRequests.push(r.url()); });

let pass = 0, fail = 0;
const check = (name, ok, extra="") => { ok ? pass++ : fail++; console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  ("+extra+")" : ""}`); };

// --- fresh load: step 0, mainnet ---
await page.goto("http://localhost:4173/");
await page.waitForSelector(".rail-tab");
check("loads; active tab is step 0 Prerequisites", await page.textContent(".rail-tab .name") === "Prerequisites");
check("rail has 6 entries", await page.locator(".rail > *").count() === 6);
check("steps 1–5 locked (not clickable)", await page.locator(".rail-item.locked").count() === 5);
check("header wallet button reads Connect wallet", (await page.textContent(".hdr .wallet-menu button")).trim() === "Connect wallet");
check("URL carries chain param", page.url().includes("chain=mainnet"));
check("info section scoped to step 0", (await page.textContent(".info-sec")).includes("never touches the signer key"));

// --- step 0 -> 1 ---
check("Continue disabled before ack", await page.locator(".panel .foot .btn-primary").isDisabled());
await page.check(".ack input");
await page.click(".panel .foot .btn-primary");
await page.waitForSelector(".opt-table");
check("step 1 active after ack+continue", await page.textContent(".rail-tab .name") === "Deploy signer-manager");
check("mainnet option table has 3 options", await page.locator(".opt-table thead th").count() === 4);
check("nothing persisted before deploy confirms", await page.evaluate(() => localStorage.length) === 0);
check("editor prefilled with pinned source", (await page.inputValue("textarea.in.code")).includes("signer manager trait"));
await page.waitForFunction(() => document.querySelector(".hashline .h")?.textContent?.length === 64, null, { timeout: 15000 });
check("structure hash computed and matches", (await page.textContent(".hashline .badge")).includes("matches expected hash"));
check("hash equals pinned literal", (await page.textContent(".hashline .h")) === "10fa8f7bfc6e41213b82682310aa0c7479214a87fd92d378892a74ffbe2b4357");

// reformat the source in the editor -> hash must stay identical
const src = await page.inputValue("textarea.in.code");
await page.fill("textarea.in.code", src.replace(/\n/g, "\n   ").replace(/ \(/g, "  ("));
await page.waitForFunction(() => document.querySelector(".hashline .badge")?.textContent?.length > 0, null, { timeout: 15000 });
check("hash stable after reformatting in editor", (await page.textContent(".hashline .badge")).includes("matches expected hash"));

// edit the source -> blocked
await page.fill("textarea.in.code", src + "\n(define-constant EXTRA u1)");
await page.waitForFunction(() => document.querySelector(".hashline .badge")?.textContent?.includes("deploy blocked"), null, { timeout: 15000 });
check("edited bundled source blocks deploy", (await page.textContent(".status.err")).includes("do not match the expected hash"));
await page.fill("textarea.in.code", src);

// suffix validation
await page.fill(".suffix-row .in", "bad suffix!!");
check("invalid suffix rejected", (await page.textContent(".status.err")).includes("Suffix must be 1–24 characters"));
await page.fill(".suffix-row .in", "");

// --- network switch: violet accent, separate state ---
await page.selectOption(".netsel", "testnet");
await page.waitForSelector(".prereq");
check("body gets net-testnet class", await page.evaluate(() => document.body.classList.contains("net-testnet")));
const accent = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue("--accent").trim());
check("accent swaps to testnet violet", accent.toLowerCase().includes("testnet") || accent.toLowerCase() === "#765bff", accent);
check("testnet resumes its own state at step 0 (mid-step switch abandons mainnet step 1 without discarding it)", await page.textContent(".rail-tab .name") === "Prerequisites");
await page.check(".ack input"); // advance testnet to step 1 to inspect its table
await page.click(".panel .foot .btn-primary");
await page.waitForSelector(".opt-table");
check("testnet table shows 2 options", await page.locator(".opt-table thead th").count() === 3);
await page.waitForFunction(() => document.querySelector(".hashline .h")?.textContent?.length === 64, null, { timeout: 15000 });
check("testnet bundled hash matches literal", (await page.textContent(".hashline .h")) === "75c4f191cdce1372b0869cb4b068232c740288f769edf9b60a2416059ada9183");
check("URL chain param now testnet", page.url().includes("chain=testnet"));

// switch back: mainnet in-memory state restored unchanged (step 1, editor state intact)
await page.selectOption(".netsel", "mainnet");
await page.waitForSelector(".opt-table");
check("mainnet state restored at step 1 after switch back", await page.textContent(".rail-tab .name") === "Deploy signer-manager");
check("mainnet table restored (3 options)", await page.locator(".opt-table thead th").count() === 4);

// --- persistence + restore: seed records, reload ---
const mkRec = (net, name, status, extra={}) => ({
  network: net, contractAddress: net === "mainnet" ? "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7" : "ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQ9H6DPR",
  contractName: name, contractOption: net === "mainnet" ? "pinned" : "testnet", contractSource: null,
  structureHash: "10fa8f7bfc6e41213b82682310aa0c7479214a87fd92d378892a74ffbe2b4357",
  deployTxid: "ab".repeat(32), authId: "123", grantJson: null, registerTxid: null, registered: false,
  adminAccounts: [], adminRotationSkipped: false, stakeTxids: [],
  stepStatus: { 0:"complete", 1:"complete", 2:"active", 3:"locked", 4:"locked", 5:"locked" }, updatedAt: "2026-08-07T00:00:00.000Z", ...extra });
const seed = recs => page.evaluate(rs => { localStorage.clear(); for (const r of rs) localStorage.setItem(`zts:${r.network}:${r.contractAddress}.${r.contractName}`, JSON.stringify(r)); }, recs);

// single record -> auto-restore at furthest step (2)
await seed([mkRec("mainnet", "signer-manager")]);
await page.goto("http://localhost:4173/?chain=mainnet");
await page.waitForSelector(".rail-tab");
check("single record auto-restores", await page.textContent(".rail-tab .name") === "Generate Signer Signature Grant");
check("read-only info shown without wallet", (await page.textContent(".status.info")).includes("read-only until a wallet reconnects"));
check("completed steps clickable, locked not", await page.locator(".rail-item.complete.clickable").count() === 2 && await page.locator(".rail-item.locked").count() === 3);
check("auth-id prefilled from record", await page.inputValue(".two .field:nth-child(2) input.in.mono") === "123");
check("CLI command is verbatim with substitutions", (await page.textContent(".cmd")).startsWith("stacks-signer generate-staking-signature --config /etc/stacks-signer/config.toml --signer-manager SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.signer-manager --auth-id 123 --json"));

// completed step 1 is read-only view
await page.click(".rail-item.complete >> nth=1");
await page.waitForSelector(".kvs");
check("completed step 1 renders read-only KV view", (await page.textContent(".rail-tab")).includes("read-only") && await page.locator("textarea.in.code").count() === 0);

// grant validation on step 2
await page.click(".rail-item.clickable >> nth=-1"); // back to step 2? use rail: last clickable is step 2 tabless
await page.waitForSelector(".cmd");
await page.fill("textarea.in", '{"signerKey":"03' + "a".repeat(64) + '","signerSignature":"' + "b".repeat(130) + '","authId":"999"}');
check("auth-id mismatch surfaced at step 2", (await page.textContent(".check-row:last-child")).includes("does not match the entered 123"));
await page.fill("textarea.in", '{"signerKey":"03' + "a".repeat(64) + '","signerSignature":"' + "b".repeat(130) + '","authId":"123"}');
check("valid grant with matching auth-id passes", (await page.textContent(".check-row:last-child")).includes("auth-id matches (123)"));
check("continue enabled on valid grant", !(await page.locator(".panel .foot .btn-primary").isDisabled()));
await page.fill("textarea.in", "not json");
check("malformed grant JSON rejected", (await page.textContent(".check-row")).includes("Not valid JSON."));

// two records -> picker
await seed([mkRec("mainnet", "signer-manager"), mkRec("mainnet", "signer-manager-two", { updatedAt: "2026-08-06T00:00:00.000Z" })]);
await page.goto("http://localhost:4173/?chain=mainnet");
await page.waitForSelector(".modal");
check("multi-record picker appears", (await page.textContent(".modal h3")) === "Resume a flow");
check("picker lists both records", await page.locator(".modal .pick button").count() === 2);
await page.click(".modal .pick button >> nth=1");
check("picking a record resumes it", page.url().includes("signer-manager-two"));

// URL id restore + unknown id -> step 0
await page.goto("http://localhost:4173/?chain=mainnet&id=SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.signer-manager");
await page.waitForSelector(".rail-tab");
check("?id= restores that record", await page.textContent(".rail-tab .name") === "Generate Signer Signature Grant");
await page.goto("http://localhost:4173/?chain=mainnet&id=SP000.nonexistent");
await page.waitForSelector(".rail-tab");
check("unknown ?id= starts at step 0", await page.textContent(".rail-tab .name") === "Prerequisites");

// reload resume at each persisted step (3, 4, 5)
for (const [n, status, expect] of [
  [3, { 0:"complete",1:"complete",2:"complete",3:"active",4:"locked",5:"locked" }, "Register-self"],
  [4, { 0:"complete",1:"complete",2:"complete",3:"complete",4:"active",5:"locked" }, "Admin rotation"],
  [5, { 0:"complete",1:"complete",2:"complete",3:"complete",4:"skipped",5:"active" }, "Stake"],
]) {
  await seed([mkRec("mainnet", "signer-manager", {}, { stepStatus: status, grantJson: '{"signerKey":"03'+"a".repeat(64)+'","signerSignature":"'+"b".repeat(130)+'"}', registered: n > 3 })]);
  await page.goto("http://localhost:4173/?chain=mainnet");
  await page.waitForSelector(".rail-tab");
  check(`reload resumes at step ${n}`, await page.textContent(".rail-tab .name") === expect);
}
check("step 5 stake button present (writable)", (await page.textContent(".panel .foot .btn-primary")).includes("Connect wallet"));
check("skipped step 4 marked in rail", await page.locator(".rail-item.skipped").count() === 1);

// step 4 re-enterable after skip
await page.click(".rail-item.skipped");
await page.waitForSelector(".cell");
check("step 4 re-enterable, 3 sub-stages", await page.locator(".cell").count() === 3);

// account switch -> resume dialog defaulting to step 4 (stub the wallet; the rotation
// sequence in the UI is: connect as A, disconnect (top right), reconnect as B)
await page.evaluate(() => { window.ZTSLib.connect = async () => ({ addresses: [{ address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7" }] }); window.ZTSLib.resolveBnsName = async () => null; window.ZTSLib.disconnect = async () => {}; });
await page.click(".hdr .wallet-menu button");
await page.waitForFunction(() => document.querySelector(".hdr .wallet-menu button")?.textContent?.includes("SP2J6"));
check("wallet connect shows short address", true);
await page.click(".hdr .wallet-menu button"); // open menu
await page.click(".wallet-menu .menu button"); // Disconnect
await page.waitForFunction(() => document.querySelector(".hdr .wallet-menu button")?.textContent?.trim() === "Connect wallet");
await page.evaluate(() => { window.ZTSLib.connect = async () => ({ addresses: [{ address: "SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H" }] }); });
await page.click(".hdr .wallet-menu button"); // reconnect as a different account
await page.waitForSelector(".modal", { timeout: 5000 }).catch(() => {});
const modalTitle = await page.textContent(".modal h3").catch(() => "");
check("account switch asks which step to resume", modalTitle === "Account switched");
if (modalTitle === "Account switched") {
  const def = await page.locator(".modal .pick button", { hasText: "default" }).textContent();
  check("resume dialog defaults to step 4", def.includes("4 — Admin rotation"));
  await page.click(".modal .pick button >> nth=0");
}

// no external requests during any of the above (no runtime source/ABI/docs fetches)
check("no runtime CDN/source fetches", externalRequests.length === 0, externalRequests.slice(0,3).join(", "));
check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0,3).join(" | "));

await browser.close();
server.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
