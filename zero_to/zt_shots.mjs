// Regenerates every zt_shot-*.png beside this file from the fixture: the full homepage, the
// cycle bar at each boundary state, both caret menus open, and the skills page.
import { chromium } from "playwright-core";
import { join } from "node:path";
import { serve, ROOT, LAUNCH, POX } from "./zt_serve.mjs";

const PORT = 4174, BASE = `http://127.0.0.1:${PORT}/`;
const shot = (n) => join(ROOT, "zt_shot-" + n);

const server = await serve(PORT);
const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
const fixture = { pox: { ...POX, next_cycle: { ...POX.next_cycle } }, down: false };
await page.route("https://api.hiro.so/v2/pox", (route) => {
  if (fixture.down) return route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: "{}" });
  route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(fixture.pox) });
});
const END = POX.next_cycle.reward_phase_start_block_height, START = END - POX.reward_cycle_length;
const load = async () => { await page.goto(BASE); await page.waitForSelector(".cb-track"); await page.waitForTimeout(150); };
const bar = (name) => page.locator(".cycle").screenshot({ path: shot(name) });

await load();
await page.screenshot({ path: shot("home.png"), fullPage: true });
await bar("cycle-mid.png");
for (const [cur, name] of [[END - 101, "cycle-101-from-end.png"], [END - 50, "cycle-50-from-end.png"], [END - 3, "cycle-3-from-end.png"], [END - 1, "cycle-1-from-end.png"], [START, "cycle-first-block.png"]]) {
  fixture.pox.current_burnchain_block_height = cur;
  await load();
  await bar(name);
}
fixture.down = true;
await load();
await bar("cycle-unavailable.png");
fixture.down = false;
fixture.pox.current_burnchain_block_height = POX.current_burnchain_block_height;

await load();
const chevs = await page.$$(".quick .chev");
await chevs[0].click();
await page.screenshot({ path: shot("nav-explorer-open.png"), clip: { x: 0, y: 0, width: 1200, height: 260 } });
await page.keyboard.press("Escape");
await chevs[1].click();
await page.screenshot({ path: shot("nav-tax-open.png"), clip: { x: 0, y: 0, width: 1200, height: 300 } });

await page.goto(BASE + "skills.html");
await page.waitForFunction(() => [...document.querySelectorAll(".mdblock")].every((b) => b.textContent.length > 100));
await page.screenshot({ path: shot("skills.png"), fullPage: true });

await browser.close();
server.close();
console.log("screenshots written to", ROOT);
