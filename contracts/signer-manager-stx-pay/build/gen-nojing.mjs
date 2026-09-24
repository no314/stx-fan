// Generate the no-Jing mainnet contract (signer-manager-stx-payout) from the
// source of truth (signer-manager-stx-payout-jing):
//   ;; @jing-begin ... ;; @jing-end   block removed
//   <code> ;; @jing                   line removed
//   ;; @nojing <text>                 replaced by <text> (same indentation)
// Everything else is byte identical, so the two contracts differ only by the
// Jing route. Run before gen-sim / gen-testnet.
import { readFileSync, writeFileSync } from "node:fs";
const src = readFileSync("contracts/signer-manager-stx-payout-jing.clar", "utf8").split("\n");
const out = [];
let skip = false, blocks = 0;
for (const line of src) {
  const t = line.trim();
  if (t === ";; @jing-begin") { if (skip) throw new Error("nested @jing-begin"); skip = true; blocks++; continue; }
  if (t === ";; @jing-end") { if (!skip) throw new Error("@jing-end without begin"); skip = false; continue; }
  if (skip) continue;
  if (/\s;; @jing\s*$/.test(line)) continue;
  const m = line.match(/^(\s*);; @nojing ?(.*)$/);
  if (m) { out.push(m[1] + m[2]); continue; }
  out.push(line);
}
if (skip) throw new Error("unterminated @jing-begin");
const text = out.join("\n").replace(/\n{3,}/g, "\n\n");
if (/jing/i.test(text.replace(/signer-manager-stx-payout-jing/g, "").replace(/No Jing route in this build/g, "").replace(/the Jing build adds a Jing route/g, "").replace(/adds Jing as route C/g, "").replace(/in the Jing build while a Jing order is open/g, "").replace(/while a Jing order is open/g, "").replace(/reconcile or cancel it first/g, "").replace(/A without Jing, B with Jing/g, "").replace(/the Jing build/g, "").replace(/`jing-cancel`|`jing-reconcile`/g, ""))) {
  const left = text.split("\n").map((l, i) => [i + 1, l]).filter(([, l]) => /jing/i.test(l.replace(/signer-manager-stx-payout-jing|No Jing route in this build|the Jing build adds a Jing route|adds Jing as route C|in the Jing build while a Jing order is open|while a Jing order is open|reconcile or cancel it first|A without Jing, B with Jing|the Jing build|`jing-cancel`|`jing-reconcile`/g, "")));
  console.error("Jing references left in the no-Jing build:", left.slice(0, 20));
  process.exit(1);
}
writeFileSync("contracts/signer-manager-stx-payout.clar", text);
console.log(`wrote contracts/signer-manager-stx-payout.clar (${blocks} blocks removed, ${text.length} bytes, ${out.length} lines)`);
