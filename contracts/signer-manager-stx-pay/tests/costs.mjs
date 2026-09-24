// Batch cost table: settle-many / payout-many at 25, 50, 100, 200 entries, the
// single-entry functions, and convert. Simnet costs (Clarity cost functions are
// the same as mainnet; the read-length of pox-5 differs because the mock is
// smaller than the real 136 KB contract, see the note printed at the end).
import { Cl, makeRandomPrivKey, getAddressFromPrivateKey } from "@stacks/transactions";
import { boot, check, isOk, okVal, MANAGER_ID, MANAGER } from "./harness.mjs";
const t = await boot();
const { w, call, m, mro, P, fundRewards, seedDlmm, seedVelar, simnet } = t;
const w5 = w(5);
seedDlmm(); seedVelar();
m("set-converter", [P(w5), Cl.bool(true)]);
const stakers = Array.from({ length: 200 }, () => getAddressFromPrivateKey(makeRandomPrivKey(), "testnet"));
const rows = [];
function costRow(label, n, r) {
  const c = r.costs.total;
  rows.push({ label, n, reads: c.readCount, readLen: c.readLength, writes: c.writeCount, writeLen: c.writeLength, runtime: c.runtime });
}
const LIMIT40 = { readCount: 30000, readLength: 200_000_000, writeCount: 15000, writeLength: 15_000_000, runtime: 5_000_000_000 };
let cycle = 200;
for (const n of [1, 25, 50, 100, 200]) {
  cycle++;
  const batch = stakers.slice(0, n);
  fundRewards(cycle, 10_000 * n, batch.map((s) => [s, 10_000]));
  const pull = m("claim-rewards", [Cl.list([]), Cl.uint(cycle)], w5);
  if (n === 1) costRow("claim-rewards (pull)", 1, pull);
  const entries = batch.map((s) => Cl.tuple({ staker: P(s), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() }));
  if (n === 1) {
    const r = m("settle-staker-rewards", [P(batch[0]), Cl.uint(cycle), Cl.none()], w5); check("single settle", isOk(r)); costRow("settle-staker-rewards (single)", 1, r);
    const p = m("payout", [P(batch[0])], w5); check("single payout", isOk(p)); costRow("payout (single, sBTC)", 1, p);
  } else {
    const r = m("settle-many", [Cl.list(entries)], w5); check(`settle-many ${n}`, isOk(r) && Cl.prettyPrint(r.result).includes(`ok-count: u${n}`), Cl.prettyPrint(r.result)); costRow("settle-many", n, r);
    const p = m("payout-many", [Cl.list(batch.map(P))], w5); check(`payout-many ${n}`, isOk(p) && Cl.prettyPrint(p.result).includes(`ok-count: u${n}`), Cl.prettyPrint(p.result)); costRow("payout-many (sBTC)", n, p);
  }
}
// STX electors: settle-many + convert + payout-many at 50
{
  cycle++;
  const batch = stakers.slice(0, 50);
  for (const s of batch) m("set-stx-payout", [Cl.bool(true)], s);
  fundRewards(cycle, 10_000 * 50, batch.map((s) => [s, 10_000]));
  m("claim-rewards", [Cl.list([]), Cl.uint(cycle)], w5);
  const entries = batch.map((s) => Cl.tuple({ staker: P(s), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() }));
  const r = m("settle-many", [Cl.list(entries)], w5); check("settle-many stx 50", isOk(r) && Cl.prettyPrint(r.result).includes("ok-count: u50"), Cl.prettyPrint(r.result)); costRow("settle-many (STX electors)", 50, r);
  const c = m("convert", [Cl.uint(500_000), Cl.uint(1)], w5); check("convert 500k", isOk(c), Cl.prettyPrint(c.result)); costRow(`convert (route ${okVal(c).value.route.value}, 500,000 sats)`, 1, c);
  const p = m("payout-many", [Cl.list(batch.map(P))], w5); check("payout-many stx 50", isOk(p) && Cl.prettyPrint(p.result).includes("ok-count: u50"), Cl.prettyPrint(p.result)); costRow("payout-many (STX)", 50, p);
  const q = mro("quote-routes", [Cl.uint(7_500_000)]); costRow("quote-routes (read-only, 7.5M sats)", 1, q);
}
// Jing route (contract B only): maker deposit, settlement, reconcile, cancel, taker swap
if (MANAGER.endsWith("-jing")) {
  cycle++;
  const batch = stakers.slice(0, 10);
  fundRewards(cycle, 100_000 * 10, batch.map((s) => [s, 100_000]));
  m("claim-rewards", [Cl.list([]), Cl.uint(cycle)], w5);
  m("settle-many", [Cl.list(batch.map((s) => Cl.tuple({ staker: P(s), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() })))], w5);
  const rem = BigInt(okVal(mro("get-pending-conversion", []))["convert-epoch-remaining"].value);
  const PRICE = 31_390_486_455_069n; const UPD = Cl.bufferFromHex("00"); const JING = "markets-sbtc-stx-jing-v6";
  const d = m("jing-deposit", [Cl.uint(rem / 2n), Cl.uint(PRICE + 1n), UPD], w5); check("jing-deposit", isOk(d), Cl.prettyPrint(d.result)); costRow("jing-deposit (maker)", 1, d);
  call(JING, "mock-buy", [Cl.uint(1_000_000_000n)]); call(JING, "mock-set-price", [Cl.uint(PRICE + 2n)]); call(JING, "mock-settle", []);
  const r1 = m("jing-reconcile", [], w5); check("jing-reconcile", isOk(r1), Cl.prettyPrint(r1.result)); costRow("jing-reconcile (partial fill)", 1, r1);
  const c = m("jing-cancel", [], w5); check("jing-cancel", isOk(c), Cl.prettyPrint(c.result)); costRow("jing-cancel", 1, c);
  call(JING, "mock-buy", [Cl.uint(50_000_000_000n)]);
  const sw = m("jing-swap", [Cl.uint(100_000), Cl.uint(1), Cl.uint(1), UPD], w5); check("jing-swap", isOk(sw), Cl.prettyPrint(sw.result)); costRow("jing-swap (taker, 100,000 sats)", 1, sw);
  const js = mro("get-jing-state", []); costRow("get-jing-state (read-only)", 1, js);
}
// abandon a partly converted epoch, then a two-leg payout for one staker
{
  cycle++;
  const batch = stakers.slice(0, 10);
  fundRewards(cycle, 100_000 * 10, batch.map((s) => [s, 100_000]));
  m("claim-rewards", [Cl.list([]), Cl.uint(cycle)], w5);
  m("settle-many", [Cl.list(batch.map((s) => Cl.tuple({ staker: P(s), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() })))], w5);
  const c = m("convert", [Cl.uint(300_000), Cl.uint(1)], w5); check("convert 300k of the epoch", isOk(c), Cl.prettyPrint(c.result));
  const a = m("abandon-epoch", []); check("abandon-epoch", isOk(a), Cl.prettyPrint(a.result)); costRow("abandon-epoch", 1, a);
  const p1 = m("payout", [P(batch[0])], w5); check("payout leg 1 (sBTC back)", isOk(p1), Cl.prettyPrint(p1.result)); costRow("payout (abandoned epoch, sBTC leg)", 1, p1);
  const p2 = m("payout", [P(batch[0])], w5); check("payout leg 2 (STX)", isOk(p2), Cl.prettyPrint(p2.result)); costRow("payout (abandoned epoch, STX leg)", 1, p2);
}
// print table
const pct = (v, lim) => (100 * v / lim).toFixed(2) + "%";
console.log("\n| function | entries | reads | read bytes | writes | write bytes | runtime | per entry reads | per entry read bytes | per entry writes | reads % of 4.0 tenure | read bytes % |");
console.log("|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const r of rows) {
  const per = (x) => r.n > 1 ? (x / r.n).toFixed(1) : String(x);
  console.log(`| ${r.label} | ${r.n} | ${r.reads} | ${r.readLen} | ${r.writes} | ${r.writeLen} | ${r.runtime} | ${per(r.reads)} | ${per(r.readLen)} | ${per(r.writes)} | ${pct(r.reads, LIMIT40.readCount)} | ${pct(r.readLen, LIMIT40.readLength)} |`);
}
console.log("\nsimnet reported limit table:", JSON.stringify(t.simnet.callReadOnlyFn(MANAGER_ID.split(".")[1], "get-open-epoch", [], w5).costs?.limit));
console.log("\nmock pox-5 source bytes:", simnet.getContractSource("pox-5").length, "; mainnet pox-5 source bytes: 136051 (read 2026-09-19). Each entry loads pox-5 once, so add roughly (136051 - mock) bytes per entry to read bytes for a mainnet estimate.");
console.log("manager source bytes (sim):", simnet.getContractSource(MANAGER).length);
