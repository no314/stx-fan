import { initSite, el } from "./zt_site.js";
import { SKILLS } from "./zt_skills-data.js";

const cache = new Map();
async function loadText(file) {
  if (!cache.has(file)) {
    const r = await fetch(file);
    if (!r.ok) throw new Error(file + " " + r.status);
    cache.set(file, await r.text());
  }
  return cache.get(file);
}

function renderSkill(root, s) {
  const card = el("section", "skill-card");
  card.id = s.id;
  card.appendChild(el("h2", null, s.title));
  card.appendChild(el("p", "filetag", s.filetag));
  const tabs = el("div", "tabs");
  tabs.setAttribute("role", "tablist");
  const note = el("p", "revtag");
  const block = el("pre", "mdblock");
  const show = async (v, btn) => {
    for (const b of tabs.children) b.classList.toggle("active", b === btn);
    note.textContent = v.note;
    block.textContent = "";
    try { block.textContent = await loadText(v.file); }
    catch (e) { block.textContent = "Could not load " + v.file + " (" + e.message + ")."; }
  };
  let first;
  s.versions.forEach((v, i) => {
    const b = el("button", "tab", v.label);
    b.type = "button";
    b.setAttribute("role", "tab");
    b.addEventListener("click", () => show(v, b));
    tabs.appendChild(b);
    if (i === 0) first = show(v, b);
  });
  card.append(tabs, note, block);
  root.appendChild(card);
  return first;
}

await initSite();
const root = document.getElementById("skills");
await Promise.all(SKILLS.map((s) => renderSkill(root, s)));
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
