// The comment-free deploy variants (contracts/deploy) must analyse cleanly and
// expose exactly the same interface as their commented sources. Uses the
// simnet principal substitution of build/gen-sim.mjs in memory.
import { initSimnet } from "@stacks/clarinet-sdk";
import { readFileSync } from "node:fs";
const DEP = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const addrs = ["SP000000000000000000002Q6VF78", "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4", "SP1PFR4V08H1RAZXREBGFFQ59WB739XM8VVGTFSEA", "SM1FKXGNZJWSTWDWXQZJNF7B5TV5ZB235JTCXYXKD", "SM1793C4R5PZ4NS4VQ4WMP7SKKYVH8JZEWSZ9HCCR", "SP20X3DC5R091J8B6YPQT638J8NR1W83KN6TN5BJY", "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1", "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22", "SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H"];
const sim = (s) => addrs.reduce((o, a) => o.split("'" + a + ".").join("'" + DEP + "."), s);
const simnet = await initSimnet("./Clarinet.toml", true, { trackCosts: true, trackCoverage: false });
const ifaces = simnet.getContractsInterfaces();
let fail = 0;
for (const name of ["signer-manager-stx-payout", "signer-manager-stx-payout-jing"]) {
  const stripped = sim(readFileSync(`contracts/deploy/${name}.clar`, "utf8"));
  const r = simnet.deployContract(`${name}-stripped`, stripped, { clarityVersion: 6 }, DEP);
  const ok = r.result.type === "ok" || String(r.result?.type) === "7" || JSON.stringify(r.result).includes("true");
  const a = ifaces.get(`${DEP}.${name}`), b = simnet.getContractsInterfaces().get(`${DEP}.${name}-stripped`);
  const same = JSON.stringify(a.functions) === JSON.stringify(b.functions) && JSON.stringify(a.variables) === JSON.stringify(b.variables) && JSON.stringify(a.maps) === JSON.stringify(b.maps);
  console.log(`${same ? "PASS" : "FAIL"} ${name}: stripped deploy analysed, ${b.functions.length} functions, interface ${same ? "identical" : "DIFFERS"} (source ${stripped.length} bytes, load read length ${r.costs?.total?.readLength ?? "n/a"})`);
  if (!same) fail++;
}
process.exit(fail ? 1 : 0);
