// Native settle-many / payout-many versus an external batcher (contracts/mocks/external-batcher.clar)
// that contract-calls the manager once per entry. Prints a markdown table.
import { Cl, makeRandomPrivKey, getAddressFromPrivateKey } from "@stacks/transactions";
import { boot, isOk, MANAGER } from "./harness.mjs";
const t = await boot(); const { w, call, m, P, fundRewards } = t; const w5 = w(5);
m("set-converter", [P(w5), Cl.bool(true)]);
const stakers = Array.from({ length: 200 }, () => getAddressFromPrivateKey(makeRandomPrivKey(), "testnet"));
const row = (label, n, r) => { const c = r.costs.total; console.log(`| ${label} | ${n} | ${c.readCount} | ${c.readLength} | ${c.writeCount} | ${c.runtime} | ${(c.readCount/n).toFixed(1)} | ${(c.readLength/n).toFixed(0)} | ${(c.runtime/n).toFixed(0)} |`); };
console.log("| path | entries | reads | read bytes (simnet) | writes | runtime | reads per entry | read bytes per entry | runtime per entry |\n|---|---|---|---|---|---|---|---|---|");
let cycle = 300;
for (const n of [50, 200]) {
  const batch = stakers.slice(0, n);
  const entries = batch.map((s) => Cl.tuple({ staker: P(s), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() }));
  fundRewards(cycle, 10_000 * n, batch.map((s) => [s, 10_000])); m("claim-rewards", [Cl.list([]), Cl.uint(cycle)], w5);
  let r = m("settle-many", [Cl.list(entries)], w5); if (!isOk(r)) throw new Error(Cl.prettyPrint(r.result)); row("native settle-many", n, r);
  r = m("payout-many", [Cl.list(batch.map(P))], w5); if (!isOk(r)) throw new Error(Cl.prettyPrint(r.result)); row("native payout-many", n, r);
  cycle++;
  const entries2 = batch.map((s) => Cl.tuple({ staker: P(s), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() }));
  fundRewards(cycle, 10_000 * n, batch.map((s) => [s, 10_000])); m("claim-rewards", [Cl.list([]), Cl.uint(cycle)], w5);
  r = call("external-batcher", "settle-batch", [Cl.list(entries2)], w5); if (!isOk(r) || !Cl.prettyPrint(r.result).includes(`u${n}`)) throw new Error(Cl.prettyPrint(r.result)); row("external settle-batch", n, r);
  r = call("external-batcher", "payout-batch", [Cl.list(batch.map(P))], w5); if (!isOk(r) || !Cl.prettyPrint(r.result).includes(`u${n}`)) throw new Error(Cl.prettyPrint(r.result)); row("external payout-batch", n, r);
  cycle++;
}
console.log("manager sim source bytes:", t.simnet.getContractSource(MANAGER).length, "; mock pox-5 bytes:", t.simnet.getContractSource("pox-5").length);
