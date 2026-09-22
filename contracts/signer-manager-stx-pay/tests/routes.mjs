// Route behaviour: multi-bin DLMM walk, quote == realized, partial fill, comparison with Velar.
import { Cl } from "@stacks/transactions";
import { boot, check, eq, summary, num, isOk, errCode, okVal, events, j, MANAGER_ID, D } from "./harness.mjs";
const t = await boot();
const { w, call, m, mro, P, fundRewards, seedDlmm, seedVelar, stxBalance } = t;
const w1 = w(1), w5 = w(5);
seedDlmm(); seedVelar();
m("set-converter", [P(w5), Cl.bool(true)]);
m("set-stx-payout", [Cl.bool(true)], w1);
for (const sats of [500_000n, 2_000_000n, 7_500_000n, 20_000_000n]) {
  const cy = 100 + Number(sats % 97n);
  fundRewards(cy, Number(sats), [[w1, Number(sats)]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(cy)], w5);
  const r0 = m("settle-staker-rewards", [P(w1), Cl.uint(cy), Cl.none()], w5);
  check(`settle ${sats}`, isOk(r0), Cl.prettyPrint(r0.result));
  const qd = mro("quote-dlmm", [Cl.uint(sats)]).result, qv = mro("quote-velar", [Cl.uint(sats)]).result;
  const before = stxBalance(MANAGER_ID);
  const r = m("convert", [Cl.uint(sats), Cl.uint(1)], w5);
  check(`convert ${sats} ok`, isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  const swaps = events(r, undefined).filter((e) => e.value?.action?.value === "swap-y-for-x");
  console.log(`tranche ${sats} sats: quote dlmm ${Cl.prettyPrint(qd)} velar ${Cl.prettyPrint(qv)} -> route ${v.route.value} sats-in ${v["sats-in"].value} ustx-out ${v["ustx-out"].value} closed ${v["epoch-closed"].value} dlmm steps ${swaps.length}`);
  eq(`STX delta matches ${sats}`, stxBalance(MANAGER_ID) - before, BigInt(v["ustx-out"].value));
  if (v.route.value === "1") eq(`dlmm realized == quote for ${sats}`, BigInt(v["ustx-out"].value), num(qd));
  if (v.route.value === "2") eq(`velar realized == quote for ${sats}`, BigInt(v["ustx-out"].value), num(qv));
  // pay the staker out if closed
  if (v["epoch-closed"].value) { const p = m("payout", [P(w1)], w5); check(`payout ${sats}`, isOk(p), Cl.prettyPrint(p.result)); }
  else {
    // finish the epoch
    let guard = 0;
    while (guard++ < 10) { const rr = m("convert", [Cl.uint(sats), Cl.uint(1)], w5); if (!isOk(rr)) { console.log("  follow-up convert:", Cl.prettyPrint(rr.result)); break; } const vv = okVal(rr).value; console.log(`  follow-up: route ${vv.route.value} sats-in ${vv["sats-in"].value} ustx-out ${vv["ustx-out"].value} closed ${vv["epoch-closed"].value}`); if (vv["epoch-closed"].value) break; }
    const p = m("payout", [P(w1)], w5); check(`payout after follow-ups ${sats}`, isOk(p), Cl.prettyPrint(p.result));
  }
}
// fill or fail: disable Velar, leave DLMM with less depth than the tranche -> u1020 (no candidate)
{
  const sats = 30_000_000n; const cy = 300;
  fundRewards(cy, Number(sats), [[w1, Number(sats)]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(cy)], w5);
  m("settle-staker-rewards", [P(w1), Cl.uint(cy), Cl.none()], w5);
  m("set-route-enabled", [Cl.uint(2), Cl.bool(false)]);
  const q = mro("quote-routes", [Cl.uint(sats)]).result;
  console.log("fill-or-fail quotes:", Cl.prettyPrint(q));
  const r = m("convert", [Cl.uint(sats), Cl.uint(1)], w5);
  eq("no full-fill candidate -> u1020", errCode(r), 1020n);
  eq("epoch untouched", num(mro("get-open-epoch", []).result), num(mro("get-convert-epoch", []).result));
  // a tranche the DLMM walk can fill goes through
  const filled = BigInt(j(mro("quote-routes", [Cl.uint(sats)]).result).value["dlmm-filled"].value);
  const r2 = m("convert", [Cl.uint(filled), Cl.uint(1)], w5);
  check("tranche sized to dlmm-filled converts", isOk(r2), Cl.prettyPrint(r2.result));
  m("set-route-enabled", [Cl.uint(2), Cl.bool(true)]);
  const r3 = m("convert", [Cl.uint(sats), Cl.uint(1)], w5);
  check("remainder via velar", isOk(r3) && Cl.prettyPrint(r3.result).includes("route: u2"), Cl.prettyPrint(r3.result));
}
console.log("routes:", Cl.prettyPrint(mro("get-routes", []).result));
summary();
