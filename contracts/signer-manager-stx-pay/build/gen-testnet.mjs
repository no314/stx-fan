// Generate the testnet deployment set. The mainnet source pins mainnet DEX and
// sBTC principals that do not exist on testnet, so a testnet deploy uses:
//   pox-5          -> ST000000000000000000002AMW42H.pox-5 (real testnet boot contract)
//   sbtc-*         -> SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1.* (real testnet sBTC)
//   DEX contracts  -> the mock contracts in contracts/mocks, deployed by DEPLOYER
// Usage: node build/gen-testnet.mjs ST...deployer
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const DEPLOYER = process.argv[2];
if (!DEPLOYER || !/^ST[A-Z0-9]{28,41}$/.test(DEPLOYER)) throw new Error("pass the testnet deployer address (ST...)");
const POX5_TESTNET = "ST000000000000000000002AMW42H";
const SBTC_TESTNET = "SN3VMHXEN64ZZF71JQ5VESXDWTR301XTTXGF4J8F1";
const map = {
  "SP000000000000000000002Q6VF78": POX5_TESTNET,
  "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4": SBTC_TESTNET,
  "SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA": DEPLOYER,
  "SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD": DEPLOYER,
  "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR": DEPLOYER,
  "SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY": DEPLOYER,
  "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1": DEPLOYER,
  "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22": DEPLOYER,
};
let out = readFileSync("contracts/signer-manager-stx-payout.clar", "utf8");
for (const [a, b] of Object.entries(map)) out = out.split("'" + a + ".").join("'" + b + ".");
mkdirSync("contracts/testnet", { recursive: true });
writeFileSync("contracts/testnet/signer-manager-stx-payout.clar", out);
// mocks: point .sbtc-token at the real testnet sBTC, keep the rest relative
const mocks = ["token-stx-v-1-2", "dlmm-pool-stx-sbtc-v-1-bps-15", "dlmm-core-v-1-1", "wstx", "univ2-math", "univ2-fees-v1_0_0-0070", "univ2-pool-v1_0_0-0070", "sbtc-stx-0-jing-v2"];
for (const m of mocks) {
  let s = readFileSync(`contracts/mocks/${m}.clar`, "utf8");
  s = s.split(".sbtc-token").join(`'${SBTC_TESTNET}.sbtc-token`).split(`''${SBTC_TESTNET}`).join(`'${SBTC_TESTNET}`);
  writeFileSync(`contracts/testnet/${m}.clar`, s);
}
console.log("wrote contracts/testnet/* for deployer", DEPLOYER, "; deploy order:", mocks.join(", "), ", then signer-manager-stx-payout");
