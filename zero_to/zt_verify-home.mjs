// Offline harness: serves the folder, intercepts the one chain read with a fixture, asserts
// every state of the homepage and the skills page, and records every request so nothing
// leaves localhost except the intercepted read.
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { serve, ROOT, LAUNCH, POX } from "./zt_serve.mjs";
import { SKILLS } from "./zt_skills-data.js";

const PORT = 4173, BASE = `http://127.0.0.1:${PORT}/`;
let pass = 0, fail = 0;
const check = (name, ok, detail = "") => { if (ok) pass++; else { fail++; console.log("FAIL", name, detail); } };

const server = await serve(PORT);
const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const fixture = { pox: { ...POX, next_cycle: { ...POX.next_cycle } }, down: false };
let poxReads = 0;
const external = [];
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("request", (r) => { const u = new URL(r.url()); if (u.hostname !== "127.0.0.1") external.push(r.url()); });
await page.route("https://api.hiro.so/v2/pox", (route) => {
  poxReads++;
  if (fixture.down) return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "{}" });
  route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(fixture.pox) });
});
const site = JSON.parse(await (await fetch(BASE + "zt_site.json")).text());
const setCur = (cur) => { fixture.pox.current_burnchain_block_height = cur; };
const END = POX.next_cycle.reward_phase_start_block_height, START = END - POX.reward_cycle_length;
const label = () => page.textContent(".cb-label");

// ---- homepage, mid-cycle
await page.goto(BASE);
await page.waitForSelector(".cb-track");
check("title", (await page.title()) === "stx.fan · Zero to Home");
const quickWords = site.quick.filter((q) => !q.sep);
check("quick links rendered", (await page.$$eval(".quick .item > a", (a) => a.length)) === quickWords.length);
check("quick link hrefs", (await page.$$eval(".quick .item > a", (a) => a.map((x) => x.href))).join() === quickWords.map((q) => q.url).join());
check("one caret per entry with alternatives", (await page.$$(".quick .chev")).length === quickWords.filter((q) => q.more).length);
check("separators rendered", (await page.$$(".quick .sep")).length === site.quick.filter((q) => q.sep).length);

// caret menu: opens with exactly the alternatives, Escape closes, click-away closes
await page.click(".quick .chev");
const explorer = quickWords.find((q) => q.label === "Explorer");
check("menu lists the alternatives", (await page.$$eval(".quick .menu a", (a) => a.map((x) => x.textContent + "|" + x.href))).join() === explorer.more.map((x) => x.label + "|" + x.url).join());
await page.keyboard.press("Escape");
check("Escape closes the menu", (await page.$(".quick .menu")) === null);
await page.click(".quick .chev");
await page.click("main");
check("click-away closes the menu", (await page.$(".quick .menu")) === null);
check("the word itself is a plain link, not a menu trigger", (await page.$$eval(".quick .item > a", (a) => a.every((x) => x.target === "_blank"))));

// search boxes
check("search placeholders and hosts", (await page.$$eval(".searches input", (i) => i.map((x) => x.placeholder + "|" + x.nextElementSibling.textContent))).join() === site.search.map((s) => s.placeholder + "|" + s.host).join());
await page.evaluate(() => { window.__opened = []; window.open = (u) => window.__opened.push(u); });
for (const s of site.search) {
  await page.fill("#" + s.id, "post conditions");
  await page.press("#" + s.id, "Enter");
}
check("Enter opens each docs search", (await page.evaluate(() => window.__opened)).join() === site.search.map((s) => s.go + "post%20conditions").join());
await page.fill("#q-stacks", "   ");
await page.press("#q-stacks", "Enter");
check("empty search opens nothing", (await page.evaluate(() => window.__opened.length)) === site.search.length);

// tiles
check("one tile per app", (await page.$$(".tile")).length === site.apps.length);
check("tile names", (await page.$$eval(".tile h2", (h) => h.map((x) => x.textContent))).join() === site.apps.map((a) => a.name).join());
check("tile hrefs are relative mainnet app links", (await page.$$eval(".tile", (t) => t.map((x) => x.getAttribute("href")))).join() === site.apps.map((a) => a.url).join());
for (const a of site.apps) check("app folder exists: " + a.url, existsSync(join(ROOT, a.url, "index.html")));
check("built-with links into skills.html", (await page.$$eval(".built .skill", (t) => t.map((x) => x.getAttribute("href")))).join() === site.skills.map((s) => "skills.html#" + s.id).join());
for (const s of site.skills) check("skill id known to skills page: " + s.id, SKILLS.some((k) => k.id === s.id));
check("review date", (await page.textContent("#reviewed")) === "last reviewed " + site.reviewed);

// cycle bar, mid-cycle (39.76 percent)
check("cycle label mid", (await label()) === "Mainnet cycle #144, 39% done");
check("marker text mid", (await page.textContent(".cb-marker")) === "(1265 blocks to go) 969285");
check("ends row", (await page.textContent(".cb-ends")) === "Start bitcoin block 968450prepare 970450end 970549");
const geom = await page.evaluate(() => {
  const w = (s) => document.querySelector(s).getBoundingClientRect();
  const track = w(".cb-track"), fill = w(".cb-fill"), caret = w(".cb-caret"), prep = w(".cb-prep");
  return { fill: fill.width / track.width * 100, caret: (caret.left + caret.width / 2 - track.left) / track.width * 100, prep: (prep.left - track.left) / track.width * 100 };
});
check("fill width is the exact percentage", Math.abs(geom.fill - 39.76) < 0.3, String(geom.fill));
check("caret sits at the exact percentage", Math.abs(geom.caret - 39.76) < 0.5, String(geom.caret));
check("prepare zone starts at 95.24 percent", Math.abs(geom.prep - 95.24) < 0.3, String(geom.prep));
check("marker not pinned mid-cycle", (await page.$(".cb-marker.pin-left, .cb-marker.pin-right")) === null);

// boundary states
const states = [
  [END - 101, "Mainnet cycle #144, 95% done", "pin-right", false],
  [END - 100, "Mainnet cycle #144, 95% done (prepare phase)", "pin-right", true],
  [END - 50, "Mainnet cycle #144, 97% done (prepare phase)", "pin-right", true],
  [END - 3, "Mainnet cycle #144, 99% done (prepare phase)", "pin-right", true],
  [END - 1, "Mainnet cycle #144, 100% done (prepare phase)", "pin-right", true],
  [START, "Mainnet cycle #144, 0% done", "pin-left", false],
];
for (const [cur, expect, pin] of states) {
  setCur(cur);
  await page.reload();
  await page.waitForSelector(".cb-track");
  check("label at " + (END - cur) + " from end", (await label()) === expect, await label());
  check("marker pinned " + pin + " at " + (END - cur) + " from end", (await page.$(".cb-marker." + pin)) !== null);
  check("leader line present when pinned", (await page.$(".cb-marker .cb-lead")) !== null);
}
setCur(END - 1);
await page.reload();
await page.waitForSelector(".cb-track");
check("one block to go reads singular", (await page.textContent(".cb-marker")).startsWith("(1 block to go)"));
const caretEnd = await page.evaluate(() => { const t = document.querySelector(".cb-track").getBoundingClientRect(); const c = document.querySelector(".cb-caret").getBoundingClientRect(); return (c.left + c.width / 2 - t.left) / t.width * 100; });
check("caret at the true position one block from the end", caretEnd > 99.5, String(caretEnd));

// failed read renders as unavailable, never zero
setCur(POX.current_burnchain_block_height);
fixture.down = true;
await page.reload();
await page.waitForSelector(".cb-track");
check("failed read renders unavailable", (await label()).includes("unavailable"));
check("no fill on a failed read", (await page.$(".cb-fill")) === null);
check("no zero on a failed read", !(await label()).includes("0%"));
fixture.down = false;

// re-read every 60 seconds while visible
poxReads = 0;
await page.clock.install();
await page.reload();
await page.waitForSelector(".cb-fill");
await page.clock.runFor(60_500);
await page.waitForTimeout(300);
check("re-reads after a minute", poxReads >= 2, String(poxReads));
await page.clock.runFor(60_000);
await page.waitForTimeout(300);
check("keeps re-reading every minute", poxReads >= 3, String(poxReads));

// house rules
check("nothing in localStorage", (await page.evaluate(() => localStorage.length)) === 0);
check("no em dash on the homepage", !(await page.evaluate(() => document.body.innerText)).includes("—"));
check("no console errors on the homepage", consoleErrors.length === 0, consoleErrors.join(" | "));
check("no external requests except the intercepted pox read", external.every((u) => u === "https://api.hiro.so/v2/pox"), external.filter((u) => u !== "https://api.hiro.so/v2/pox").join(" "));

// ---- skills page
await page.goto(BASE + "skills.html#stacks-dapp-architecture");
await page.waitForSelector(".skill-card .mdblock");
await page.waitForFunction(() => [...document.querySelectorAll(".mdblock")].every((b) => b.textContent.length > 100));
check("skills title", (await page.title()).endsWith("Skills"));
check("anchor scrolled the target card into view", (await page.evaluate(() => document.getElementById("stacks-dapp-architecture").getBoundingClientRect().top)) < 120);

check("one card per entry", (await page.$$(".skill-card")).length === SKILLS.length);
check("card ids match the footer anchors", (await page.$$eval(".skill-card", (c) => c.map((x) => x.id))).join() === SKILLS.map((s) => s.id).join());
check("newest version active by default", (await page.$$eval(".skill-card .tab.active", (t) => t.map((x) => x.textContent))).join() === SKILLS.map((s) => s.versions[0].label).join());
for (const s of SKILLS) for (const v of s.versions) {
  const r = await fetch(BASE + v.file);
  check("version file served: " + v.file, r.ok && (await r.text()).length > 500);
}
const card = SKILLS[0];
const before = await page.textContent("#" + card.id + " .revtag");
await page.click(`#${card.id} .tab:nth-child(${card.versions.length})`);
await page.waitForFunction((id) => document.querySelector("#" + id + " .tab.active").textContent === "Original", card.id);
await page.waitForFunction((id) => document.querySelector("#" + id + " .mdblock").textContent.length > 100, card.id);
check("tab changes the revision note", (await page.textContent("#" + card.id + " .revtag")) !== before);
check("tab loads that version verbatim", (await page.textContent("#" + card.id + " .mdblock")).includes("name: static-first-architecture"));
check("no em dash outside the quoted documents", !(await page.evaluate(() => { const c = document.body.cloneNode(true); c.querySelectorAll(".mdblock").forEach((b) => b.remove()); return c.innerText; })).includes("—"));
check("no console errors on the skills page", consoleErrors.length === 0, consoleErrors.join(" | "));
check("skills page nothing in localStorage", (await page.evaluate(() => localStorage.length)) === 0);
check("still no external requests", external.every((u) => u === "https://api.hiro.so/v2/pox"));

await browser.close();
server.close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
