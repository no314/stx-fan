// Route C on the Jing v3 generation market (mock of markets-sbtc-stx-jing-v6),
// contract B only: maker deposit, fills over several settlements, refund of a
// small remainder, parking, set-limit, cancel (resting and parked), taker swap
// (fill or fail, leftover refunded), gates, reserve invariant with sats in Jing,
// stray transfers only favour stakers, abandon after a partial Jing fill.
import { Cl } from "@stacks/transactions";
import { boot, check, eq, summary, num, isOk, errCode, okVal, j, MANAGER_ID, D, MANAGER } from "./harness.mjs";
if (!MANAGER.endsWith("-jing")) { console.log("jing.mjs is for MANAGER=signer-manager-stx-payout-jing"); process.exit(0); }
const t = await boot();
const { w, call, ro, m, mro, P, fundRewards, seedDlmm, seedVelar, sbtcBalance, stxBalance, simnet } = t;
const [w1, w2, w5, w6] = [1, 2, 5, 6].map(w);
const JING = "markets-sbtc-stx-jing-v6";
const PRICE = 31_390_486_455_069n; // STX per BTC x 1e8
const UPD = Cl.bufferFromHex("00"); // the mock ignores the Lazer update
seedDlmm(); seedVelar();
m("set-converter", [P(w5), Cl.bool(true)]);
m("set-stx-payout", [Cl.bool(true)], w1);
m("set-stx-payout", [Cl.bool(true)], w2);
const jstate = () => j(mro("get-jing-state", []).result).value;
const order = () => Cl.prettyPrint(mro("get-jing-order", []).result);
const holding = () => num(mro("jing-holding", []).result);
const remaining = () => num(j(mro("get-pending-conversion", []).result).value["convert-epoch-remaining"]);
const reserveOk = (label) => {
  const bal = sbtcBalance(MANAGER_ID);
  const vars = ["earned-fees", "withdrawal-liability", "total-unclaimed-rewards", "credited-refunds", "total-pending-payouts", "pending-conversion-sats"].map((v) => num(simnet.getDataVar(MANAGER, v)));
  const reserved = vars.reduce((a, b) => a + b, 0n) - num(mro("get-sats-in-jing", []).result);
  check(`${label}: sBTC reserve exact (${bal} == ${reserved})`, bal === reserved, `${bal} vs ${reserved}`);
  check(`${label}: STX liability covered`, stxBalance(MANAGER_ID) >= num(mro("get-ustx-liability", []).result));
};
// STX a maker gets for `sats` cleared at PRICE with the 10 bps fee (mock arithmetic, sats binding)
const stxAt = (sats, p) => { const y = (sats * p) / (100_000_000n * 100n); return y - (y * 10n) / 10_000n; };
const stxFor = (sats) => stxAt(sats, PRICE);
const drain = () => call(JING, "mock-drain-bids", []);
const settle = (cycle, who) => m("settle-staker-rewards", [P(who), Cl.uint(cycle), Cl.none()], w5);
const dep = (sats, limit) => m("jing-deposit", [Cl.uint(sats), Cl.uint(limit), UPD], w5);
const rec = () => m("jing-reconcile", [], w5);

// ---------------------------------------------------------- maker, full fill
{
  fundRewards(200, 1_000_000, [[w1, 600_000], [w2, 400_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(200)], w5);
  settle(200, w1); settle(200, w2);
  eq("non-converter refused u1002", errCode(m("jing-deposit", [Cl.uint(1), Cl.uint(1), UPD], w1)), 1002n);
  eq("limit u0 refused u1026", errCode(dep(1_000_000n, 0n)), 1026n);
  eq("below Jing minimum surfaces Jing u1001 as u3001", errCode(dep(999n, PRICE + 1n)), 3001n);
  let r = dep(1_000_000n, PRICE + 1n); // above the mock price: rests
  check("jing-deposit ok", isOk(r), Cl.prettyPrint(r.result));
  eq("sats-in-jing", num(mro("get-sats-in-jing", []).result), 1_000_000n);
  eq("holding == deposit", holding(), 1_000_000n);
  eq("open epoch advanced", num(mro("get-open-epoch", []).result), 2n);
  reserveOk("after deposit");
  eq("second order refused u1032", errCode(dep(1n, 1n)), 1032n);
  eq("convert refused while order open u1032", errCode(m("convert", [Cl.uint(1), Cl.uint(1)], w5)), 1032n);
  eq("jing-swap refused while order open u1032", errCode(m("jing-swap", [Cl.uint(1000), Cl.uint(1), Cl.uint(1), UPD], w5)), 1032n);
  eq("sweep-stx refused while order open u1032", errCode(m("sweep-stx", [P(D)])), 1032n);
  eq("abandon refused while order open u1032", errCode(m("abandon-epoch", [])), 1032n);
  r = rec();
  check("reconcile with nothing new books nothing", isOk(r) && Cl.prettyPrint(r.result).includes("filled-sats: u0") && Cl.prettyPrint(r.result).includes("order-open: true"), Cl.prettyPrint(r.result));
  // bids arrive, price rises above our limit, a settlement clears everything
  call(JING, "mock-buy", [Cl.uint(10_000_000_000n)]);
  call(JING, "mock-set-price", [Cl.uint(PRICE + 2n)]);
  check("settle", isOk(call(JING, "mock-settle", [])));
  const expected = stxFor(1_000_000n) - 0n;
  eq("Jing pushed STX", stxBalance(MANAGER_ID), (1_000_000n * (PRICE + 2n)) / (100_000_000n * 100n) - ((1_000_000n * (PRICE + 2n)) / (100_000_000n * 100n) * 10n) / 10_000n);
  const pushed = stxBalance(MANAGER_ID);
  r = rec();
  check("reconcile books the fill", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("filled 1,000,000", BigInt(v["filled-sats"].value), 1_000_000n);
  eq("stx-received == pushed", BigInt(v["stx-received"].value), pushed);
  eq("order closed", order(), "none");
  eq("sats-in-jing 0", num(mro("get-sats-in-jing", []).result), 0n);
  eq("epoch 1 closed", Cl.prettyPrint(mro("get-epoch", [Cl.uint(1)]).result).includes("closed: true"), true);
  eq("conversion route 3", Cl.prettyPrint(mro("get-conversion", [Cl.uint(1)]).result).includes("route: u3"), true);
  reserveOk("after fill");
  check("w1 paid in STX", isOk(m("payout", [P(w1)], w5)));
  check("w2 paid in STX", isOk(m("payout", [P(w2)], w5)));
  eq("liability zero", num(mro("get-ustx-liability", []).result), pushed - (600_000n * pushed) / 1_000_000n - (400_000n * pushed) / 1_000_000n);
}

// -------------------- partial fills over two settlements, then small refund
{
  drain();
  fundRewards(201, 2_000_000, [[w1, 2_000_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(201)], w5);
  settle(201, w1);
  call(JING, "mock-set-price", [Cl.uint(PRICE)]);
  let d = dep(2_000_000n, PRICE + 1n); check("deposit 2,000,000 above the mid", isOk(d), Cl.prettyPrint(d.result));
  // bids for about a quarter; the price moves above our limit and a settlement clears
  call(JING, "mock-buy", [Cl.uint(stxFor(500_000n) + 10_000_000n)]);
  eq("with bids present a limit at or under the mid is refused (Jing u1016 -> u3016)", errCode(m("jing-set-limit", [Cl.uint(PRICE), UPD], w5)), 3016n);
  call(JING, "mock-set-price", [Cl.uint(PRICE + 2n)]);
  call(JING, "mock-settle", []);
  let r = rec(); check("reconcile partial ok", isOk(r), Cl.prettyPrint(r.result));
  let v = okVal(r).value;
  const f1 = BigInt(v["filled-sats"].value), rem1 = BigInt(v["remainder-sats"].value);
  check("filled + remainder == 2,000,000", f1 + rem1 === 2_000_000n, `${f1} ${rem1}`);
  check("about a quarter", f1 > 400_000n && f1 < 600_000n, String(f1));
  eq("remainder rolled in Jing", holding(), rem1);
  eq("order open", String(v["order-open"].value), "true");
  reserveOk("after partial");
  // a second settlement clears all but a leftover below the minimum: Jing refunds it
  // leftover bids from the first settlement plus new bids: enough for all but ~500 sats
  const bidsLeft = BigInt(j(ro(JING, "get-cycle-totals", [Cl.uint(num(ro(JING, "get-current-cycle", []).result))]).result).value["total-token-y"].value);
  const want = ((rem1 - 500n) * (PRICE + 2n)) / (100_000_000n * 100n);
  call(JING, "mock-buy", [Cl.uint(want > bidsLeft ? want - bidsLeft : 0n)]);
  call(JING, "mock-settle", []);
  const before = sbtcBalance(MANAGER_ID);
  r = rec(); check("reconcile second ok", isOk(r), Cl.prettyPrint(r.result));
  v = okVal(r).value;
  const f2 = BigInt(v["filled-sats"].value), ref2 = BigInt(v["refunded-sats"].value);
  check("second fill + refund == remainder", f2 + ref2 === rem1, `${f2} ${ref2} ${rem1}`);
  check("small leftover refunded (below 1,000)", ref2 > 0n && ref2 < 1_000n, String(ref2));
  eq("order closed", order(), "none");
  eq("refunded sats still pending in the epoch", remaining(), ref2);
  reserveOk("after refund");
  check("convert the refunded sats on a DEX", isOk(m("convert", [Cl.uint(ref2), Cl.uint(1)], w5)));
  check("w1 payout ok", isOk(m("payout", [P(w1)], w5)));
  reserveOk("epoch 2 done");
}

// ------------------------------------------ set-limit, parking, cancel paths
{
  drain();
  fundRewards(202, 300_000, [[w2, 300_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(202)], w5);
  settle(202, w2);
  check("deposit at a high limit", isOk(dep(300_000n, PRICE * 2n)));
  eq("Jing limit recorded", num(ro(JING, "get-token-x-limit", [P(MANAGER_ID)]).result), PRICE * 2n);
  check("set-limit ok", isOk(m("jing-set-limit", [Cl.uint(PRICE * 3n), UPD], w5)));
  eq("Jing limit updated", num(ro(JING, "get-token-x-limit", [P(MANAGER_ID)]).result), PRICE * 3n);
  eq("set-limit crossing the book refused (Jing u1016 -> u3016)", (call(JING, "mock-buy", [Cl.uint(1_000_000_000n)]), errCode(m("jing-set-limit", [Cl.uint(1), UPD], w5))), 3016n);
  // a settlement rolls us (limit above price); then a bigger maker parks us
  call(JING, "mock-settle", []);
  let r = rec(); check("rolled: nothing filled", isOk(r) && Cl.prettyPrint(r.result).includes("filled-sats: u0") && Cl.prettyPrint(r.result).includes("remainder-sats: u300000"), Cl.prettyPrint(r.result));
  call(JING, "mock-park", [P(MANAGER_ID)]);
  eq("parked in Jing", num(ro(JING, "get-token-x-parked", [P(MANAGER_ID)]).result), 300_000n);
  eq("holding counts parked", holding(), 300_000n);
  r = rec(); check("parked is not a fill", isOk(r) && Cl.prettyPrint(r.result).includes("filled-sats: u0"), Cl.prettyPrint(r.result));
  reserveOk("while parked");
  const before = sbtcBalance(MANAGER_ID);
  r = m("jing-cancel", [], w5);
  check("cancel refunds the parked amount", isOk(r) && Cl.prettyPrint(r.result).includes("refunded-sats: u300000"), Cl.prettyPrint(r.result));
  eq("sBTC back", sbtcBalance(MANAGER_ID) - before, 300_000n);
  eq("order none", order(), "none");
  eq("cancel with no order u1033", errCode(m("jing-cancel", [], w5)), 1033n);
  eq("reconcile with no order u1033", errCode(rec()), 1033n);
  reserveOk("after cancel");
  check("convert the rest", isOk(m("convert", [Cl.uint(300_000), Cl.uint(1)], w5)));
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
}

// ------------------------------------------------------- taker: jing-swap
{
  drain();
  fundRewards(203, 800_000, [[w2, 800_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(203)], w5);
  settle(203, w2);
  call(JING, "mock-set-price", [Cl.uint(PRICE)]);
  eq("swap with no bids fails at Jing (u1009 -> u3009)", errCode(m("jing-swap", [Cl.uint(500_000), Cl.uint(1), Cl.uint(1), UPD], w5)), 3009n);
  call(JING, "mock-buy", [Cl.uint(stxFor(200_000n))]); // bids for about 200,000 sats
  eq("swap larger than the bids: Jing partial fill (u1017 -> u3017)", errCode(m("jing-swap", [Cl.uint(500_000), Cl.uint(1), Cl.uint(1), UPD], w5)), 3017n);
  eq("limit above the price refused by Jing (u1016 -> u3016)", errCode(m("jing-swap", [Cl.uint(100_000), Cl.uint(PRICE + 1n), Cl.uint(1), UPD], w5)), 3016n);
  eq("rate floor too high u1021", errCode(m("jing-swap", [Cl.uint(100_000), Cl.uint(1), Cl.uint(PRICE * 1000n), UPD], w5)), 1021n);
  const sb = sbtcBalance(MANAGER_ID), st = stxBalance(MANAGER_ID);
  const r = m("jing-swap", [Cl.uint(100_000), Cl.uint(PRICE - 1n), Cl.uint(1), UPD], w5);
  check("jing-swap ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("sats-in == balance delta", BigInt(v["sats-in"].value), sb - sbtcBalance(MANAGER_ID));
  eq("ustx-out == balance delta", BigInt(v["ustx-out"].value), stxBalance(MANAGER_ID) - st);
  check("sats-in is the net of the 20 bps rebate, fully filled", BigInt(v["sats-in"].value) === 100_000n - 200n, Cl.prettyPrint(r.result));
  eq("route 3 conversion", Cl.prettyPrint(mro("get-conversion", [Cl.uint(num(mro("get-last-conversion-id", []).result))]).result).includes("route: u3"), true);
  eq("no order open after a taker swap", order(), "none");
  reserveOk("after jing-swap");
  // the rest on a DEX; then payout
  check("convert the rest", isOk(m("convert", [Cl.uint(remaining()), Cl.uint(1)], w5)));
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
  reserveOk("epoch done");
}

// ---------------------- stray transfers before reconcile only favour stakers
{
  drain();
  fundRewards(204, 400_000, [[w2, 400_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(204)], w5);
  settle(204, w2);
  call(JING, "mock-set-price", [Cl.uint(PRICE)]);
  check("deposit", isOk(dep(400_000n, PRICE + 1n)));
  simnet.transferSTX(1_000_000, MANAGER_ID, w6); // stray STX
  call("sbtc-token", "mint", [Cl.uint(5_000), P(w6)]);
  call("sbtc-token", "transfer", [Cl.uint(5_000), P(w6), P(MANAGER_ID), Cl.none()], w6); // stray sBTC
  call(JING, "mock-buy", [Cl.uint(10_000_000_000n)]);
  call(JING, "mock-set-price", [Cl.uint(PRICE + 2n)]);
  call(JING, "mock-settle", []);
  const liabBefore = num(mro("get-ustx-liability", []).result);
  const r = rec(); check("reconcile ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("stray sBTC read as refund, capped by the order", BigInt(v["refunded-sats"].value), 5_000n);
  eq("filled = deposit - stray", BigInt(v["filled-sats"].value), 395_000n);
  eq("stray STX booked to the epoch (everything above the liability)", BigInt(v["stx-received"].value), stxBalance(MANAGER_ID) - liabBefore);
  reserveOk("after strays (value moved toward stakers)");
  check("convert the 5,000 'refunded' sats", isOk(m("convert", [Cl.uint(5_000), Cl.uint(1)], w5)));
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
  eq("nothing sweepable (stray went to the staker)", errCode(m("sweep-stx", [P(D)])), 1028n);
}

// ---------------------------------- partial Jing fill, then abandon-epoch
{
  drain();
  fundRewards(205, 600_000, [[w1, 600_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(205)], w5);
  settle(205, w1);
  call(JING, "mock-set-price", [Cl.uint(PRICE)]);
  check("deposit", isOk(dep(600_000n, PRICE + 1n)));
  const bidsNow = BigInt(j(ro(JING, "get-cycle-totals", [Cl.uint(num(ro(JING, "get-current-cycle", []).result))]).result).value["total-token-y"].value);
  const wantBids = stxAt(100_000n, PRICE + 2n);
  call(JING, "mock-buy", [Cl.uint(wantBids > bidsNow ? wantBids - bidsNow : 0n)]);
  call(JING, "mock-set-price", [Cl.uint(PRICE + 2n)]);
  call(JING, "mock-settle", []);
  check("reconcile", isOk(rec()));
  eq("abandon refused while the remainder rests u1032", errCode(m("abandon-epoch", [])), 1032n);
  check("cancel the rest", isOk(m("jing-cancel", [], w5)));
  const r = m("abandon-epoch", []);
  check("abandon ok", isOk(r), Cl.prettyPrint(r.result));
  const sb = sbtcBalance(w1);
  check("w1 sBTC leg", isOk(m("payout", [P(w1)], w5)));
  check("w1 got the unconverted sats back", sbtcBalance(w1) - sb > 490_000n, String(sbtcBalance(w1) - sb));
  check("w1 STX leg", isOk(m("payout", [P(w1)], w5)));
  reserveOk("end");
}

// ------------------------------------------------------ route toggle, paused
{
  check("admin disables jing", isOk(m("set-route-enabled", [Cl.uint(3), Cl.bool(false)])));
  fundRewards(206, 100_000, [[w2, 100_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(206)], w5);
  settle(206, w2);
  eq("jing-deposit refused when disabled u1020", errCode(dep(50_000n, 1n)), 1020n);
  eq("jing-swap refused when disabled u1020", errCode(m("jing-swap", [Cl.uint(50_000), Cl.uint(1), Cl.uint(1), UPD], w5)), 1020n);
  check("admin enables jing", isOk(m("set-route-enabled", [Cl.uint(3), Cl.bool(true)])));
  call(JING, "mock-set-paused", [Cl.bool(true)]);
  eq("Jing paused surfaces u1007 -> u3007", errCode(dep(50_000n, 1n)), 3007n);
  call(JING, "mock-set-paused", [Cl.bool(false)]);
  console.log("jing state:", Cl.prettyPrint(mro("get-jing-state", []).result));
}
summary();
