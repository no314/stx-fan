// Verifies the bundled contract sources against the PRD's hardcoded structure-hash
// literals, and that the hash is invariant under reformatting.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
globalThis.window = {};
// contract-sources.js and structure-hash.js are plain scripts that assign to window.
new Function(readFileSync(join(root, "src/vendor/contract-sources.js"), "utf8"))();
new Function(readFileSync(join(root, "src/vendor/structure-hash.js"), "utf8"))();
const { structureHash } = window.ZTSHash;
const C = window.ZTS_CONTRACTS;

const EXPECTED = {
  pinned:  "10fa8f7bfc6e41213b82682310aa0c7479214a87fd92d378892a74ffbe2b4357",
  max500:  "ce374c861cca311f06822a053c8cd675c515ac6f40044b3495d73ae10a349f32",
  testnet: "75c4f191cdce1372b0869cb4b068232c740288f769edf9b60a2416059ada9183",
};

let fail = 0;
for (const key of Object.keys(EXPECTED)) {
  const h = await structureHash(C[key]);
  const reformatted = C[key].replace(/\n/g, "\n    ").replace(/ \(/g, "   (");
  const h2 = await structureHash(reformatted);
  const ok = h === EXPECTED[key] && h2 === EXPECTED[key];
  if (!ok) fail++;
  console.log(`${key}: ${h === EXPECTED[key] ? "hash matches" : "HASH MISMATCH " + h} / ${h2 === EXPECTED[key] ? "stable under reformatting" : "REFORMAT CHANGED HASH"}`);
}
process.exit(fail ? 1 : 0);
