// Generate the deploy variants without comments: contracts/deploy/<name>.clar.
// Every `;;` comment is removed. Two comments are put back at the top: the
// title (version) line and one pointer to the fully commented source in the
// repository. The structure hash ignores comments, so a stripped file verifies
// against the same hash as its commented source. Run after gen-nojing.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const REPO = "https://github.com/no314/stx-fan/blob/main/contracts/signer-manager-stx-pay/contracts";
const TITLES = {
  "signer-manager-stx-payout": [
    "Signer-manager that supports STX payouts: based on Fastpool's Max500 with",
    "claim-many functions built in (Version A.0)",
  ],
  "signer-manager-stx-payout-jing": [
    "Signer-manager that supports STX payouts: based on Fastpool's Max500 with",
    "claim-many functions built in and an additional swap route compared to A.0",
    "through Jing Swap (Version B.0)",
  ],
};
mkdirSync("contracts/deploy", { recursive: true });
for (const [name, title] of Object.entries(TITLES)) {
  const src = readFileSync(`contracts/${name}.clar`, "utf8");
  if (/"[^"\n]*;;[^"\n]*"/.test(src)) throw new Error(`${name}: a string literal contains ;; and the stripper would cut it`);
  const body = src
    .split("\n")
    .map((l) => l.replace(/\s*;;.*$/, ""))
    .filter((l) => l.trim().length)
    .join("\n");
  const head = [...title.map((t) => `;; ${t}`), `;; Fully commented source and design notes: ${REPO}/${name}.clar`].join("\n");
  const out = head + "\n" + body + "\n";
  writeFileSync(`contracts/deploy/${name}.clar`, out);
  console.log(`wrote contracts/deploy/${name}.clar ${out.length} bytes (from ${src.length})`);
}
