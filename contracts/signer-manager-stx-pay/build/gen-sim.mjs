// Generate the simnet variant of the manager: same source, mainnet principals
// swapped for the simnet deployer's mock contracts of the same names.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const DEPLOYER = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const NAMES = ["signer-manager-stx-payout", "signer-manager-stx-payout-jing"];
const addrs = [
  "SP000000000000000000002Q6VF78",
  "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4",
  "SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA",
  "SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD",
  "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR",
  "SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY",
  "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1",
  "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22",
  "SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H",
];
mkdirSync("contracts/sim", { recursive: true });
for (const name of NAMES) {
  let out = readFileSync(`contracts/${name}.clar`, "utf8");
  for (const a of addrs) out = out.split("'" + a + ".").join("'" + DEPLOYER + ".");
  const leftover = out.match(/'S[PM][A-Z0-9]{20,}\./g);
  if (leftover) throw new Error("unsubstituted principals: " + leftover.join(","));
  writeFileSync(`contracts/sim/${name}.clar`, out);
  console.log(`wrote contracts/sim/${name}.clar`, out.length, "bytes");
}
