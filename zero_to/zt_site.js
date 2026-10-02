// Shared by index.html and skills.html: loads site.json, renders the header quick links
// (word opens the primary, caret opens the list), binds the docs search inputs, stamps the
// review date. Everything is built with DOM calls, never innerHTML from data.

const CARET_PATH = "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z";

export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function link(href, text, cls) {
  const a = el("a", cls, text);
  a.href = href;
  if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
  return a;
}

function caret() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 256 256");
  svg.setAttribute("aria-hidden", "true");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
  p.setAttribute("d", CARET_PATH);
  svg.appendChild(p);
  return svg;
}

function renderQuick(nav, quick) {
  const closeMenus = () => { for (const m of nav.querySelectorAll(".menu")) m.remove(); };
  for (const q of quick) {
    if (q.sep) { nav.appendChild(el("span", "sep")); continue; }
    const item = el("span", "item");
    item.appendChild(link(q.url, q.label));
    if (q.more) {
      const b = el("button", "chev");
      b.type = "button";
      b.setAttribute("aria-label", "More " + q.label.toLowerCase() + " links");
      b.appendChild(caret());
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = item.querySelector(".menu");
        closeMenus();
        if (open) return;
        const m = el("div", "menu");
        for (const x of q.more) m.appendChild(link(x.url, x.label));
        item.appendChild(m);
      });
      item.appendChild(b);
    }
    nav.appendChild(item);
  }
  document.addEventListener("click", closeMenus);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenus(); });
}

function bindSearch(search) {
  for (const s of search) {
    const input = document.getElementById(s.id);
    if (!input) continue;
    input.placeholder = s.placeholder;
    input.nextElementSibling.textContent = s.host;
    input.addEventListener("keydown", (e) => {
      const q = input.value.trim();
      if (e.key !== "Enter" || !q) return;
      window.open(s.go + encodeURIComponent(q), "_blank", "noopener");
    });
  }
}

export async function initSite() {
  const r = await fetch("zt_site.json");
  if (!r.ok) throw new Error("zt_site.json " + r.status);
  const site = await r.json();
  renderQuick(document.getElementById("quick"), site.quick);
  bindSearch(site.search || []);
  const rev = document.getElementById("reviewed");
  if (rev) rev.textContent = "last reviewed " + site.reviewed;
  return site;
}
