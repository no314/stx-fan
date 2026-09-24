// abandon-epoch (design 14): admin closes the convert epoch without converting
// the rest; converted part pays STX at the blended rate, the rest pays back as
// sBTC pro rata; two payout legs; gates; reserve invariants; dust stays reserved.
import { Cl } from "@stacks/transactions";
import { boot, check, eq, summary, num, isOk, errCode, okVal, j, MANAGER_ID, D, MANAGER } from "./harness.mjs";
const t = await boot();
const { w, call, m, mro, P, fundRewards, seedDlmm, seedVelar, sbtcBalance, stxBalance, simnet } = t;
const [w1, w2, w3, w5] = [1, 2, 3, 5].map(w);
seedDlmm(); seedVelar();
m("set-converter", [P(w5), Cl.bool(true)]);
m("set-stx-payout", [Cl.bool(true)], w2);
m("set-stx-payout", [Cl.bool(true)], w3);
const reserveOk = (label) => {
  const bal = sbtcBalance(MANAGER_ID);
  const vars = ["earned-fees", "withdrawal-liability", "total-unclaimed-rewards", "credited-refunds", "total-pending-payouts", "pending-conversion-sats"].map((v) => num(simnet.getDataVar(MANAGER, v)));
  const JING = MANAGER.endsWith("-jing");
  const reserved = vars.reduce((a, b) => a + b, 0n) - (JING ? num(mro("get-sats-in-jing", []).result) : 0n);
  check(`${label}: sBTC reserve exact (${bal} == ${reserved})`, bal === reserved, `${bal} vs ${reserved}`);
  check(`${label}: STX liability covered`, stxBalance(MANAGER_ID) >= num(mro("get-ustx-liability", []).result));
};
const epoch = (n) => j(mro("get-epoch", [Cl.uint(n)]).result).value.value;
const settle = (cycle, who) => m("settle-staker-rewards", [P(who), Cl.uint(cycle), Cl.none()], w5);

// ---------------------------------------------- partial conversion, then abandon
{
  fundRewards(200, 1_000_000, [[w1, 200_000], [w2, 500_000], [w3, 300_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(200)], w5);
  settle(200, w1); settle(200, w2); settle(200, w3);
  eq("epoch 1 holds 800,000 sats", BigInt(epoch(1)["sats-total"].value), 800_000n);
  eq("non-admin refused before the stranded boundary u1034", errCode(m("abandon-epoch", [], w5)), 1034n);
  check("convert 300,000 (fill or fail)", isOk(m("convert", [Cl.uint(300_000), Cl.uint(1)], w5)));
  if (MANAGER.endsWith("-jing")) {
    // a Jing order blocks abandoning
    check("jing-deposit 100,000", isOk(m("jing-deposit", [Cl.uint(100_000), Cl.uint(99_999_999_999_999_999n), Cl.bufferFromHex("00")], w5)));
    eq("abandon refused while a Jing order is open u1032", errCode(m("abandon-epoch", [])), 1032n);
    check("jing-cancel", isOk(m("jing-cancel", [], w5)));
  } else {
    eq("route 3 refused in the no-Jing build u1023", errCode(m("set-route-enabled", [Cl.uint(3), Cl.bool(true)])), 1023n);
  }
  const ustxOut = BigInt(epoch(1)["ustx-out"].value);
  const r = m("abandon-epoch", []);
  check("abandon-epoch ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("refund == remaining 500,000", BigInt(v["sats-refund"].value), 500_000n);
  eq("converted 300,000", BigInt(v["sats-converted"].value), 300_000n);
  eq("epoch 1 closed", String(epoch(1)["closed"].value), "true");
  eq("convert-epoch advanced", num(mro("get-convert-epoch", []).result), 2n);
  eq("open epoch advanced", num(mro("get-open-epoch", []).result), 2n);
  eq("nothing left to convert u1022", errCode(m("convert", [Cl.uint(1), Cl.uint(1)], w5)), 1022n);
  eq("abandon again: nothing pending u1022", errCode(m("abandon-epoch", [])), 1022n);
  reserveOk("after abandon");
  // w2: 500,000 of 800,000 -> 312,500 sats back and 500,000 * ustxOut / 800,000 STX
  const sb = sbtcBalance(w2), stb = stxBalance(w2);
  let p = m("payout", [P(w2)], w5);
  check("w2 first payout pays the sBTC leg", isOk(p) && Cl.prettyPrint(p.result).includes("amount: u312500"), Cl.prettyPrint(p.result));
  eq("w2 received 312,500 sats", sbtcBalance(w2) - sb, 312_500n);
  eq("w2 STX still claimable", num(mro("get-stx-claimable", [P(w2)]).result), (500_000n * ustxOut) / 800_000n);
  p = m("payout", [P(w2)], w5);
  check("w2 second payout pays the STX leg", isOk(p), Cl.prettyPrint(p.result));
  eq("w2 received the STX", stxBalance(w2) - stb, (500_000n * ustxOut) / 800_000n);
  eq("w2 third payout: nothing u1016", errCode(m("payout", [P(w2)], w5)), 1016n);
  reserveOk("after w2");
  // w3 through payout-many twice
  const sb3 = sbtcBalance(w3), stb3 = stxBalance(w3);
  check("payout-many leg 1", isOk(m("payout-many", [Cl.list([P(w3), P(w1)])], w5)));
  check("payout-many leg 2", isOk(m("payout-many", [Cl.list([P(w3)])], w5)));
  eq("w3 sats back 187,500", sbtcBalance(w3) - sb3, 187_500n);
  eq("w3 STX", stxBalance(w3) - stb3, (300_000n * ustxOut) / 800_000n);
  eq("w1 (sBTC staker) paid normally", sbtcBalance(w1), 200_000n);
  reserveOk("after all legs");
  // flooring dust: the STX remainder stays in ustx-liability, no sats dust here (exact division)
  eq("ustx-liability == flooring remainder", num(mro("get-ustx-liability", []).result), ustxOut - (500_000n * ustxOut) / 800_000n - (300_000n * ustxOut) / 800_000n);
}

// ------------------------------------ abandon with nothing converted (all sBTC)
{
  fundRewards(201, 700_001, [[w2, 700_001]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(201)], w5);
  settle(201, w2);
  fundRewards(202, 3, [[w3, 3]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(202)], w5);
  settle(202, w3);
  const total = BigInt(epoch(2)["sats-total"].value);
  eq("epoch 2 total", total, 700_004n);
  const r = m("abandon-epoch", []);
  check("abandon unconverted epoch ok", isOk(r) && Cl.prettyPrint(r.result).includes("ustx-out: u0"), Cl.prettyPrint(r.result));
  const sb = sbtcBalance(w2);
  check("w2 payout pays sBTC", isOk(m("payout", [P(w2)], w5)));
  eq("w2 got its sats back", sbtcBalance(w2) - sb, 700_001n);
  eq("w2 nothing more u1016", errCode(m("payout", [P(w2)], w5)), 1016n);
  eq("w2 no stx pending", Cl.prettyPrint(mro("get-stx-pending", [P(w2)]).result), "none");
  check("w3 payout pays 3 sats", isOk(m("payout", [P(w3)], w5)));
  reserveOk("after all-sBTC abandon");
}

// -------------------- new settlement after abandon crystallizes the old entry
{
  fundRewards(203, 100_000, [[w2, 60_000], [w3, 40_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(203)], w5);
  settle(203, w2); settle(203, w3);
  check("convert 30,000 of epoch 3", isOk(m("convert", [Cl.uint(30_000), Cl.uint(1)], w5)));
  check("abandon epoch 3", isOk(m("abandon-epoch", [])));
  // settle a later cycle for w2 before any payout: old entry crystallizes into both legs
  fundRewards(204, 10_000, [[w2, 10_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(204)], w5);
  check("settle into epoch 4 while epoch 3 legs are unpaid", isOk(settle(204, w2)));
  eq("w2 sBTC leg credited", num(mro("get-pending-payout", [P(w2)]).result), (60_000n * 70_000n) / 100_000n);
  check("w2 STX owed > 0", num(mro("get-stx-owed", [P(w2)]).result) > 0n);
  eq("w2 pending now in epoch 4", j(mro("get-stx-pending", [P(w2)]).result).value.value["epoch"].value, "4");
  reserveOk("after re-settle");
  // dust: 40,000 * 70,000 / 100,000 = 28,000 exact; use odd numbers to force dust
  fundRewards(205, 7, [[w3, 7]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(205)], w5);
  settle(205, w3); // w3 still has epoch 3 entry (closed) -> crystallizes, then books 7 into epoch 4
  eq("w3 sBTC leg 28,000", num(mro("get-pending-payout", [P(w3)]).result), 28_000n);
  check("w3 payout leg 1", isOk(m("payout", [P(w3)], w5)));
  check("w3 payout leg 2", isOk(m("payout", [P(w3)], w5)));
  reserveOk("end");
}

// ------------------------------------------------ stranded epoch (design 14)
// Epoch 4 holds w2's 10,000 and w3's 7 sats. Nobody converts it. After 4200
// burn blocks without progress anyone may abandon it (and in the Jing build
// cancel a resting order first). Progress resets the clock.
{
  const JING = MANAGER.endsWith("-jing");
  const pc = () => j(mro("get-pending-conversion", []).result).value;
  const burn = () => BigInt(simnet.burnBlockHeight);
  eq("convert epoch is 4", pc()["convert-epoch"].value, "4");
  const p0 = BigInt(pc()["progress-burn-height"].value);
  check("progress clock started by the first settlement into epoch 4", p0 > 0n && p0 <= burn(), `${p0} vs ${burn()}`);
  eq("stranded-at = progress + 4200", BigInt(pc()["stranded-at-burn-height"].value), p0 + 4200n);
  check("not stranded yet", pc()["stranded"].value === false, JSON.stringify(pc()["stranded"]));
  eq("stranger cannot abandon u1034", errCode(m("abandon-epoch", [], w1)), 1034n);
  simnet.mineEmptyBurnBlocks(4000);
  eq("stranger still refused after 4000 blocks u1034", errCode(m("abandon-epoch", [], w1)), 1034n);
  check("converter converts 1,000 sats (progress)", isOk(m("convert", [Cl.uint(1_000), Cl.uint(1)], w5)));
  const p1 = BigInt(pc()["progress-burn-height"].value);
  check("convert reset the clock", p1 > p0 && p1 >= p0 + 4000n, `${p0} -> ${p1}`);
  if (JING) {
    check("jing-deposit 1,000 (progress)", isOk(m("jing-deposit", [Cl.uint(1_000), Cl.uint(99_999_999_999_999_999n), Cl.bufferFromHex("00")], w5)));
    eq("stranger cannot cancel the Jing order yet u1034", errCode(m("jing-cancel", [], w1)), 1034n);
  }
  const p2 = BigInt(pc()["progress-burn-height"].value);
  simnet.mineEmptyBurnBlocks(Number(p2 + 4200n - burn()) - 1);
  eq("one block short: stranger refused u1034", errCode(m("abandon-epoch", [], w1)), 1034n);
  simnet.mineEmptyBurnBlocks(1);
  check("stranded now", pc()["stranded"].value === true, JSON.stringify(pc()["stranded"]));
  if (JING) {
    eq("abandon refused while the order rests u1032", errCode(m("abandon-epoch", [], w1)), 1032n);
    check("stranger cancels the resting Jing order", isOk(m("jing-cancel", [], w1)));
    eq("no Jing order left", Cl.prettyPrint(mro("get-jing-state", []).result).includes("order: none"), true);
  }
  const remaining = BigInt(pc()["convert-epoch-remaining"].value);
  const b2 = sbtcBalance(w2);
  const r = m("abandon-epoch", [], w1);
  check("stranger abandons the stranded epoch", isOk(r), Cl.prettyPrint(r.result));
  check("event says by-admin false", r.events.some((e) => e.event === "print_event" && Cl.prettyPrint(e.data.value).includes('topic: "abandon-epoch"') && Cl.prettyPrint(e.data.value).includes("by-admin: false")), "no matching event");
  eq("epoch 4 refund = remaining", BigInt(epoch(4)["sats-refund"].value), remaining);
  eq("convert epoch advanced to 5", pc()["convert-epoch"].value, "5");
  check("w2 payout leg 1 (sBTC back)", isOk(m("payout", [P(w2)], w1)));
  check("w2 received sBTC", sbtcBalance(w2) > b2);
  check("w2 payout leg 2 (STX from the 1,000 sat tranche)", isOk(m("payout", [P(w2)], w1)));
  eq("stranger cannot abandon an empty epoch u1034", errCode(m("abandon-epoch", [], w1)), 1034n);
  eq("admin on an empty epoch: nothing to convert u1022", errCode(m("abandon-epoch", [])), 1022n);
  reserveOk("after stranded abandon");
}
summary();
