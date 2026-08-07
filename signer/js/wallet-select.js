// Our own wallet picker. The vendored @stacks/connect modal can't show a wallet as "unsupported"
// (and clicking Xverse hangs, because it exposes only a Bitcoin provider for the Stacks getAddresses
// call). This modal lists the known providers ourselves: supported wallets get a Connect/Install
// action; Xverse is shown but marked "Not supported" and links to the explainer. A supported pick
// connects that provider directly via request({provider}) — no second (library) modal.
import { request } from "./connect.js";

// Window-path ids match the vendored default provider list. `supported:false` = shown but blocked.
const PROVIDERS = [
  { id: "LeatherProvider",                 name: "Leather",          supported: true,  install: "https://leather.io" },
  { id: "XverseProviders.BitcoinProvider", name: "Xverse",           supported: false, why: "xverse.html" },
  { id: "AsignaProvider",                  name: "Asigna Multisig",  supported: true,  install: "https://asigna.io" },
  { id: "FordefiProviders.UtxoProvider",   name: "Fordefi",          supported: true,  install: "https://www.fordefi.com/" },
];

const resolveProvider = (id) => id.split(".").reduce((a, p) => (a == null ? a : a[p]), typeof window !== "undefined" ? window : undefined);

let styled = false;
function injectStyle() {
  if (styled) return; styled = true;
  const s = document.createElement("style");
  s.textContent = `
.wsel-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.wsel-box{background:var(--surface,#161311);border:1px solid var(--border,#333);border-radius:var(--radius-lg,12px);padding:18px 20px;max-width:400px;width:100%;box-shadow:0 12px 40px rgba(0,0,0,.5);color:var(--text-primary,#eee);font-family:var(--font-body,ui-sans-serif,system-ui,sans-serif)}
.wsel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.wsel-head h3{margin:0;font-size:var(--fs-md,1.05rem);font-family:var(--font-display,inherit)}
.wsel-x{background:none;border:none;color:var(--text-secondary,#999);cursor:pointer;font-size:15px;line-height:1;padding:4px;min-height:auto}
.wsel-list{display:flex;flex-direction:column;gap:8px}
.wsel-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border:1px solid var(--border,#333);border-radius:var(--radius-md,8px);background:var(--surface-input,#1e1a18)}
.wsel-item.off{opacity:.7}
.wsel-name{font-weight:600;font-size:var(--fs-sm,.9rem)}
.wsel-right{display:flex;align-items:center;gap:10px}
.wsel-connect{padding:6px 15px;min-height:auto;border-radius:var(--radius-sm,6px);border:1px solid var(--accent,#5546ff);background:var(--accent-bg,rgba(85,70,255,.15));color:var(--accent-hi,#b9b0ff);font-weight:600;cursor:pointer;font-family:var(--font-body,inherit)}
.wsel-connect:hover{background:var(--accent,#5546ff);color:#fff}
.wsel-badge{font-size:var(--fs-xs,.72rem);color:var(--warn,#d29922);border:1px solid var(--warn,#d29922);border-radius:6px;padding:2px 8px;font-family:var(--font-mono,monospace)}
.wsel-link{color:var(--accent-hi,#8ab4ff);font-size:var(--fs-xs,.72rem);text-decoration:none;white-space:nowrap}
.wsel-link:hover{text-decoration:underline}
.wsel-foot{margin-top:12px;font-size:var(--fs-xs,.72rem);color:var(--text-secondary,#999)}`;
  document.head.appendChild(s);
}

function cancelErr() { const e = new Error("Wallet selection cancelled"); e.code = "cancel"; return e; }

// Show the picker. Resolves with a supported, installed provider id, or rejects with code "cancel".
function pickWallet() {
  injectStyle();
  return new Promise((resolve, reject) => {
    const overlay = document.createElement("div");
    overlay.className = "wsel-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    const box = document.createElement("div");
    box.className = "wsel-box";
    box.innerHTML = `<div class="wsel-head"><h3>Connect a wallet</h3><button class="wsel-x" aria-label="Close">✕</button></div><div class="wsel-list"></div><div class="wsel-foot">These apps require post-conditions on every call. Wallets that don't support them can't be used safely.</div>`;
    const list = box.querySelector(".wsel-list");
    for (const p of PROVIDERS) {
      const installed = !!resolveProvider(p.id);
      const row = document.createElement("div");
      row.className = "wsel-item" + (p.supported ? "" : " off");
      let right;
      if (!p.supported) {
        right = `<span class="wsel-badge">Not supported</span><a class="wsel-link" href="${p.why}" target="_blank" rel="noopener">Why? →</a>`;
      } else if (installed) {
        right = `<button class="wsel-connect" data-id="${p.id}">Connect</button>`;
      } else {
        right = `<a class="wsel-link" href="${p.install}" target="_blank" rel="noopener">Install ↗</a>`;
      }
      row.innerHTML = `<span class="wsel-name">${p.name}</span><span class="wsel-right">${right}</span>`;
      list.appendChild(row);
    }
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    const onKey = (e) => { if (e.key === "Escape") done(() => reject(cancelErr())); };
    function done(fn) { overlay.remove(); document.removeEventListener("keydown", onKey); fn && fn(); }
    document.addEventListener("keydown", onKey);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) done(() => reject(cancelErr())); });
    box.querySelector(".wsel-x").addEventListener("click", () => done(() => reject(cancelErr())));
    list.querySelectorAll(".wsel-connect").forEach((btn) =>
      btn.addEventListener("click", () => { const id = btn.getAttribute("data-id"); done(() => resolve(id)); })
    );
  });
}

// Show the picker, then connect the chosen provider directly (no library modal) and return its
// getAddresses response ({ addresses: [...] }). Rejects with code "cancel" if the user closes the
// picker, "notinstalled" if the provider vanished, or the wallet's own error.
export async function pickAndConnect(network) {
  const id = await pickWallet();
  const provider = resolveProvider(id);
  if (!provider) { const e = new Error("Selected wallet is not available"); e.code = "notinstalled"; throw e; }
  return await request({ provider, forceWalletSelect: false }, "getAddresses", network ? { network } : undefined);
}

export { PROVIDERS };
