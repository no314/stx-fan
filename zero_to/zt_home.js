import { initSite, el, link } from "./zt_site.js";
import { assertPox, cycleView } from "./zt_cycle.js";

const POX_URL = "https://api.hiro.so/v2/pox";
const READ_EVERY_MS = 60_000;

function renderTiles(root, apps) {
  for (const a of apps) {
    const t = link(a.url, undefined, "tile");
    t.appendChild(el("h2", null, a.name));
    t.appendChild(el("p", null, a.description));
    t.appendChild(el("div", "meta", a.meta));
    root.appendChild(t);
  }
}

// Footer line: "Built with" followed by one quiet link per skill into skills.html.
function renderBuilt(root, skills) {
  root.appendChild(el("span", "lbl", "Built with:"));
  for (const s of skills) root.appendChild(link("skills.html#" + s.id, s.label, "skill"));
}

// CycleBar from Zero to Signing, in DOM calls. The caret sits at the true position; within
// 12 percent of either edge the number pins to that edge with a leader line back to the caret.
function renderCycle(root, cv) {
  root.replaceChildren();
  const top = el("div", "cb-top");
  const num = "(" + cv.toGo + (cv.toGo === 1 ? " block" : " blocks") + " to go) " + cv.cur;
  const marker = el("span", "cb-marker" + (cv.edge ? " pin-" + cv.edge : ""));
  if (cv.edge === "right") { marker.style.right = (100 - cv.exact) + "%"; marker.append(num, el("span", "cb-lead")); }
  else if (cv.edge === "left") { marker.style.left = cv.exact + "%"; marker.append(el("span", "cb-lead"), num); }
  else { marker.style.left = cv.exact + "%"; marker.textContent = num; }
  const caret = el("span", "cb-caret");
  caret.style.left = cv.exact + "%";
  top.append(marker, caret);

  const track = el("div", "cb-track");
  const fill = el("div", "cb-fill");
  fill.style.width = cv.exact + "%";
  const prep = el("div", "cb-prep");
  prep.style.left = cv.prepPct + "%";
  track.append(fill, prep, el("span", "cb-label", "Mainnet cycle #" + cv.cycleId + ", " + cv.pct + "% done" + (cv.prepare ? " (prepare phase)" : "")));

  const ends = el("div", "cb-ends");
  const right = el("span");
  right.append(el("span", "cb-prep-mark", "prepare " + cv.prepStart), "end " + cv.lastBlock);
  ends.append(el("span", null, "Start bitcoin block " + cv.start), right);
  root.append(top, track, ends);
}

// A failed read renders as unavailable, never as zero.
function renderUnavailable(root) {
  root.replaceChildren();
  const track = el("div", "cb-track");
  track.appendChild(el("span", "cb-label", "Mainnet cycle position unavailable (could not read the chain)"));
  root.append(el("div", "cb-top"), track, el("div", "cb-ends"));
}

async function readCycle(root) {
  try {
    const r = await fetch(POX_URL);
    if (!r.ok) throw new Error("pox " + r.status);
    renderCycle(root, cycleView(assertPox(await r.json())));
  } catch (e) {
    renderUnavailable(root);
  }
}

// Re-read every minute while the tab is visible. A reload is the manual refresh.
function startCycle(root) {
  let timer = null;
  const start = () => { readCycle(root); timer = setInterval(() => readCycle(root), READ_EVERY_MS); };
  const stop = () => { clearInterval(timer); timer = null; };
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else if (!timer) start(); });
  start();
}

const site = await initSite();
renderTiles(document.getElementById("tiles"), site.apps);
renderBuilt(document.getElementById("built"), site.skills);
startCycle(document.getElementById("cycle"));
