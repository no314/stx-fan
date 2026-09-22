// Route C (Jing v2) tests: deposit, full fill, partial fill with rollover and
// a second settlement, limit roll, bump-out refund, cancel-cycle, cancel,
// gates while an order is open, reserve invariant with sats in Jing.
import { Cl } from "@stacks/transactions";
import { boot, check, eq, summary, num, isOk, errCode, okVal, events, j, MANAGER_ID, D } from "./harness.mjs";
const t = await boot();
const { w, call, ro, m, mro, P, fundRewards, seedDlmm, seedVelar, sbtcBalance, stxBalance, simnet } = t;
const [w1, w2, w5] = [1, 2, 5].map(w);
const JING = "sbtc-stx-0-jing-v2";
const JING_ID = `${D}.${JING}`;
const PRICE = 31_390_486_455_069n; // STX per BTC x 1e8, from mainnet cycle 14
seedDlmm(); seedVelar();
m("set-converter", [P(w5), Cl.bool(true)]);
m("set-stx-payout", [Cl.bool(true)], w1);
m("set-stx-payout", [Cl.bool(true)], w2);
const jstate = () => j(mro("get-jing-state", []).result).value;
const order = () => Cl.prettyPrint(mro("get-jing-order", []).result);
const reserveOk = (label) => {
  // sBTC balance must cover everything reserved minus what is in Jing
  const bal = sbtcBalance(MANAGER_ID);
  const vars = ["earned-fees", "withdrawal-liability", "total-unclaimed-rewards", "credited-refunds", "total-pending-payouts", "pending-conversion-sats"].map((v) => num(simnet.getDataVar("signer-manager-stx-payout", v)));
  const reserved = vars.reduce((a, b) => a + b, 0n) - num(mro("get-sats-in-jing", []).result);
  check(`${label}: sBTC reserve exact (balance ${bal} == reserved ${reserved})`, bal === reserved, `${bal} vs ${reserved}`);
  check(`${label}: STX liability covered`, stxBalance(MANAGER_ID) >= num(mro("get-ustx-liability", []).result));
};
// expected STX for a full fill at PRICE with 10 bps fee, Jing arithmetic
const stxFor = (sats) => { const clearing = (sats * PRICE) / (100_000_000n * 100n); return clearing - (clearing * 10n) / 10_000n; };

// ---------------------------------------------------------- full fill
{
  fundRewards(200, 1_000_000, [[w1, 600_000], [w2, 400_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(200)], w5);
  m("settle-staker-rewards", [P(w1), Cl.uint(200), Cl.none()], w5);
  m("settle-staker-rewards", [P(w2), Cl.uint(200), Cl.none()], w5);
  eq("epoch 1 holds 1,000,000 sats", num(simnet.getDataVar("signer-manager-stx-payout", "pending-conversion-sats")), 1_000_000n);
  eq("non-converter refused u1002", errCode(m("jing-deposit", [Cl.uint(1_000_000), Cl.uint(1)], w1)), 1002n);
  eq("limit required u1026", errCode(m("jing-deposit", [Cl.uint(1_000_000), Cl.uint(0)], w5)), 1026n);
  let r = m("jing-deposit", [Cl.uint(1_000_000), Cl.uint(PRICE - 1n)], w5);
  check("jing-deposit ok", isOk(r), Cl.prettyPrint(r.result));
  eq("sats-in-jing 1,000,000", num(mro("get-sats-in-jing", []).result), 1_000_000n);
  eq("Jing holds our deposit", num(ro(JING, "get-sbtc-deposit", [Cl.uint(15), P(MANAGER_ID)]).result), 1_000_000n);
  eq("open epoch advanced", num(mro("get-open-epoch", []).result), 2n);
  reserveOk("after deposit");
  // gates
  eq("second order refused u1032", errCode(m("jing-deposit", [Cl.uint(1), Cl.uint(1)], w5)), 1032n);
  eq("convert refused while order open u1032", errCode(m("convert", [Cl.uint(1), Cl.uint(1)], w5)), 1032n);
  eq("sweep-stx refused while order open u1032", errCode(m("sweep-stx", [P(D)])), 1032n);
  eq("reconcile before settle: u1035", errCode(m("jing-reconcile", [], w5)), 1035n);
  // STX buyer worth more than our sBTC: full fill
  call(JING, "mock-buy", [Cl.uint(10_000_000_000n)]); // 10,000 STX
  call(JING, "close-deposits", []);
  eq("set-limit in settle phase refused u1034", errCode(m("jing-set-limit", [Cl.uint(5)], w5)), 1034n);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  const expected = stxFor(1_000_000n);
  eq("Jing pushed STX to the manager", stxBalance(MANAGER_ID), expected);
  r = m("jing-reconcile", [], w5);
  check("reconcile ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("filled 1,000,000", BigInt(v["filled-sats"].value), 1_000_000n);
  eq("stx-received exact", BigInt(v["stx-received"].value), expected);
  eq("order closed", String(v["order-open"].value), "false");
  eq("order none", order(), "none");
  eq("epoch 1 closed", Cl.prettyPrint(mro("get-epoch", [Cl.uint(1)]).result).includes("closed: true"), true);
  eq("conversion route 3", Cl.prettyPrint(mro("get-conversion", [Cl.uint(1)]).result).includes("route: u3"), true);
  eq("sats-in-jing back to 0", num(mro("get-sats-in-jing", []).result), 0n);
  reserveOk("after full fill");
  const b1 = stxBalance(w1);
  check("w1 paid in STX", isOk(m("payout", [P(w1)], w5)));
  eq("w1 got 60 percent floor", stxBalance(w1) - b1, (600_000n * expected) / 1_000_000n);
}

// -------------------------------------------- partial fill, then the rest
{
  fundRewards(201, 2_000_000, [[w1, 2_000_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(201)], w5);
  m("settle-staker-rewards", [P(w1), Cl.uint(201), Cl.none()], w5);
  let r = m("jing-deposit", [Cl.uint(2_000_000), Cl.uint(1)], w5);
  check("deposit 2,000,000", isOk(r), Cl.prettyPrint(r.result));
  // STX side worth roughly a quarter of the sBTC: partial fill
  const quarter = stxFor(500_000n) + 10_000_000n;
  call(JING, "mock-buy", [Cl.uint(quarter)]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  const stxBefore = stxBalance(MANAGER_ID);
  r = m("jing-reconcile", [], w5);
  check("reconcile partial ok", isOk(r), Cl.prettyPrint(r.result));
  let v = okVal(r).value;
  const filled1 = BigInt(v["filled-sats"].value), rem1 = BigInt(v["remainder-sats"].value);
  check("partial: filled + remainder == 2,000,000", filled1 + rem1 === 2_000_000n, `${filled1} ${rem1}`);
  check("partial: filled roughly a quarter", filled1 > 400_000n && filled1 < 600_000n, String(filled1));
  eq("order still open", String(v["order-open"].value), "true");
  eq("remainder is what Jing rolled", num(ro(JING, "get-sbtc-deposit", [Cl.uint(17), P(MANAGER_ID)]).result), rem1);
  eq("sats-in-jing == remainder", num(mro("get-sats-in-jing", []).result), rem1);
  eq("epoch 2 not closed", Cl.prettyPrint(mro("get-epoch", [Cl.uint(2)]).result).includes("closed: false"), true);
  reserveOk("after partial");
  // settle for a STX elector into the converting epoch is refused
  fundRewards(202, 1_000, [[w1, 1_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(202)], w5);
  eq("settle into converting epoch u1027", errCode(m("settle-staker-rewards", [P(w1), Cl.uint(202), Cl.none()], w5)), 1027n);
  // re-price, then the second cycle fills the rest
  check("set-limit ok", isOk(m("jing-set-limit", [Cl.uint(PRICE - 5n)], w5)));
  eq("Jing limit updated", num(ro(JING, "get-sbtc-limit", [P(MANAGER_ID)]).result), PRICE - 5n);
  call(JING, "mock-buy", [Cl.uint(50_000_000_000n)]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  r = m("jing-reconcile", [], w5);
  check("reconcile second ok", isOk(r), Cl.prettyPrint(r.result));
  v = okVal(r).value;
  eq("second fill == remainder", BigInt(v["filled-sats"].value), rem1);
  eq("order closed", String(v["order-open"].value), "false");
  eq("epoch 2 closed", Cl.prettyPrint(mro("get-epoch", [Cl.uint(2)]).result).includes("closed: true"), true);
  const e2 = j(mro("get-epoch", [Cl.uint(2)]).result).value.value;
  const c2 = j(mro("get-conversion", [Cl.uint(2)]).result).value.value, c3 = j(mro("get-conversion", [Cl.uint(3)]).result).value.value;
  eq("epoch 2 ustx-out == both Jing fills", BigInt(e2["ustx-out"].value), BigInt(c2["ustx-out"].value) + BigInt(c3["ustx-out"].value));
  eq("second fill STX == balance delta", BigInt(c3["ustx-out"].value), stxBalance(MANAGER_ID) - stxBefore);
  reserveOk("after second fill");
  // now w1 can settle cycle 202 into epoch 3 (epoch 2 crystallizes)
  check("settle after close ok", isOk(m("settle-staker-rewards", [P(w1), Cl.uint(202), Cl.none()], w5)));
  check("w1 payout ok", isOk(m("payout", [P(w1)], w5)));
}

// ------------------------------------------------- limit roll (no fill)
{
  // epoch 3 holds w1's 980 sats (1,000 gross, 2% fee); too small for Jing's min? min-sbtc-deposit u1000 -> refused by Jing
  eq("below Jing minimum surfaces Jing u1001", errCode(m("jing-deposit", [Cl.uint(980), Cl.uint(1)], w5)), 1001n);
  fundRewards(203, 500_000, [[w2, 500_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(203)], w5);
  m("settle-staker-rewards", [P(w2), Cl.uint(203), Cl.none()], w5);
  const rem = num(j(mro("get-pending-conversion", []).result).value["convert-epoch-remaining"]);
  let r = m("jing-deposit", [Cl.uint(rem), Cl.uint(PRICE + 1_000_000_000n)], w5); // limit above the price: rolls
  check("deposit with high limit ok", isOk(r), Cl.prettyPrint(r.result));
  // another seller keeps the cycle settleable (Jing refuses to settle an empty sBTC side)
  const w6 = w(6);
  call("sbtc-token", "mint", [Cl.uint(200_000), P(w6)]);
  call(JING, "deposit-sbtc", [Cl.uint(200_000), Cl.uint(1)], w6);
  call(JING, "mock-buy", [Cl.uint(10_000_000_000n)]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  r = m("jing-reconcile", [], w5);
  check("reconcile rolled ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("nothing filled", BigInt(v["filled-sats"].value), 0n);
  eq("remainder == deposit", BigInt(v["remainder-sats"].value), rem);
  eq("order open on next Jing cycle", String(v["order-open"].value), "true");
  reserveOk("after limit roll");
  // cancel the Jing cycle (no settlement): deposits roll again
  call(JING, "close-deposits", []);
  call(JING, "mock-cancel-cycle", []);
  r = m("jing-reconcile", [], w5);
  check("reconcile after cancel-cycle ok", isOk(r) && Cl.prettyPrint(r.result).includes("order-open: true"), Cl.prettyPrint(r.result));
  // cancel ourselves during the deposit phase
  const before = sbtcBalance(MANAGER_ID);
  r = m("jing-cancel", [], w5);
  check("jing-cancel ok", isOk(r), Cl.prettyPrint(r.result));
  eq("sBTC back in the manager", sbtcBalance(MANAGER_ID) - before, rem);
  eq("order none", order(), "none");
  eq("sats-in-jing 0", num(mro("get-sats-in-jing", []).result), 0n);
  reserveOk("after cancel");
  // finish the epoch on the instant routes
  r = m("convert", [Cl.uint(rem), Cl.uint(1)], w5);
  check("convert remainder ok", isOk(r), Cl.prettyPrint(r.result));
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
}

// ------------------------------------------------------- bump-out refund
{
  fundRewards(204, 300_000, [[w2, 300_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(204)], w5);
  m("settle-staker-rewards", [P(w2), Cl.uint(204), Cl.none()], w5);
  const rem = num(j(mro("get-pending-conversion", []).result).value["convert-epoch-remaining"]);
  check("deposit ok", isOk(m("jing-deposit", [Cl.uint(rem), Cl.uint(1)], w5)));
  const before = sbtcBalance(MANAGER_ID);
  call(JING, "mock-bump", [P(MANAGER_ID)]);
  eq("Jing refunded the deposit", sbtcBalance(MANAGER_ID) - before, rem);
  const r = m("jing-reconcile", [], w5);
  check("reconcile detects bump", isOk(r) && Cl.prettyPrint(r.result).includes("filled-sats: u0") && Cl.prettyPrint(r.result).includes("order-open: false"), Cl.prettyPrint(r.result));
  eq("sats-in-jing 0", num(mro("get-sats-in-jing", []).result), 0n);
  reserveOk("after bump");
  // remainder bumped after a partial fill: deposit, partial settle, bump the rolled remainder, reconcile
  check("deposit again", isOk(m("jing-deposit", [Cl.uint(rem), Cl.uint(1)], w5)));
  call(JING, "mock-buy", [Cl.uint(stxFor(100_000n))]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  const before2 = sbtcBalance(MANAGER_ID);
  call(JING, "mock-bump", [P(MANAGER_ID)]); // refunds the rolled remainder in the new cycle
  const refunded = sbtcBalance(MANAGER_ID) - before2;
  check("remainder refunded", refunded > 0n && refunded < rem, String(refunded));
  const r2 = m("jing-reconcile", [], w5);
  check("reconcile partial + bumped remainder ok", isOk(r2), Cl.prettyPrint(r2.result));
  const v2 = okVal(r2).value;
  eq("filled == deposit - refunded", BigInt(v2["filled-sats"].value), rem - refunded);
  eq("order closed", String(v2["order-open"].value), "false");
  reserveOk("after partial + bump");
  // the refunded sats stay pending in the epoch and convert on an instant route
  const left = num(j(mro("get-pending-conversion", []).result).value["convert-epoch-remaining"]);
  eq("refunded sats still pending", left, refunded);
  check("convert the rest", isOk(m("convert", [Cl.uint(left), Cl.uint(1)], w5)));
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
  reserveOk("end");
}

// w6 is declared in the limit-roll block; a fresh handle for the gap tests
const w6b = w(6);
const stray = (ustx) => simnet.transferSTX(ustx, MANAGER_ID, w6b);
const remaining = () => num(j(mro("get-pending-conversion", []).result).value["convert-epoch-remaining"]);

// -------- STX payout of a closed epoch while an order is open; stray STX
{
  fundRewards(205, 600_000, [[w1, 300_000], [w2, 300_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(205)], w5);
  m("settle-staker-rewards", [P(w1), Cl.uint(205), Cl.none()], w5);
  const e5 = remaining();
  check("epoch 5 converted instantly", isOk(m("convert", [Cl.uint(e5), Cl.uint(1)], w5)));
  m("settle-staker-rewards", [P(w2), Cl.uint(205), Cl.none()], w5); // opens epoch 6
  const dep = remaining();
  check("deposit epoch 6", isOk(m("jing-deposit", [Cl.uint(dep), Cl.uint(1)], w5)));
  const b1 = stxBalance(w1);
  check("STX payout of closed epoch 5 while order open ok", isOk(m("payout", [P(w1)], w5)));
  check("w1 received STX", stxBalance(w1) > b1);
  reserveOk("after payout with order open");
  // stray STX lands before the settlement; it must not change the booked fill
  stray(1_000_000);
  call(JING, "mock-buy", [Cl.uint(50_000_000_000n)]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  const r = m("jing-reconcile", [], w5);
  check("reconcile with stray STX ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("filled == deposit", BigInt(v["filled-sats"].value), dep);
  eq("stx-received is Jing's formula, not the balance delta", BigInt(v["stx-received"].value), stxFor(dep));
  eq("stray STX stays unattributed", stxBalance(MANAGER_ID) - num(mro("get-ustx-liability", []).result), 1_000_000n);
  check("sweep-stx returns the stray amount", Cl.prettyPrint(m("sweep-stx", [P(D)]).result) === "(ok u1000000)");
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
  reserveOk("after stray");
}

// ------------------------ late reconcile: u1037, then admin jing-resolve
{
  fundRewards(206, 200_000, [[w2, 200_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(206)], w5);
  m("settle-staker-rewards", [P(w2), Cl.uint(206), Cl.none()], w5);
  const dep = remaining();
  check("deposit", isOk(m("jing-deposit", [Cl.uint(dep), Cl.uint(1)], w5)));
  call(JING, "mock-buy", [Cl.uint(stxFor(50_000n))]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]); // partial, remainder rolled
  // the operator misses the window: Jing settles the rolled remainder too
  call(JING, "mock-buy", [Cl.uint(50_000_000_000n)]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  eq("late reconcile refused u1037", errCode(m("jing-reconcile", [], w5)), 1037n);
  eq("jing-cancel refused u1036 (unreconciled)", errCode(m("jing-cancel", [], w5)), 1036n);
  eq("jing-resolve non-admin u1002", errCode(m("jing-resolve", [Cl.uint(dep), Cl.uint(0)], w5)), 1002n);
  eq("jing-resolve bad split u1026", errCode(m("jing-resolve", [Cl.uint(dep - 1n), Cl.uint(0)])), 1026n);
  const received = stxBalance(MANAGER_ID) - num(mro("get-ustx-liability", []).result);
  check("both Jing payouts sit unattributed", received > 0n, String(received));
  const r = m("jing-resolve", [Cl.uint(dep), Cl.uint(0)]);
  check("jing-resolve ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("resolve books all unattributed STX", BigInt(v["stx-received"].value), received);
  eq("resolve reason", String(v["reason"].value), "resolved");
  eq("order none", order(), "none");
  eq("sats-in-jing 0", num(mro("get-sats-in-jing", []).result), 0n);
  eq("epoch closed", Cl.prettyPrint(mro("get-epoch", [Cl.uint(7)]).result).includes("closed: true"), true);
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
  reserveOk("after resolve");
}

// ------------------------------- cancel-cycle, then settlement, one reconcile
{
  fundRewards(207, 200_000, [[w2, 200_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(207)], w5);
  m("settle-staker-rewards", [P(w2), Cl.uint(207), Cl.none()], w5);
  const dep = remaining();
  const c0 = num(ro(JING, "get-current-cycle", []).result);
  check("deposit", isOk(m("jing-deposit", [Cl.uint(dep), Cl.uint(1)], w5)));
  call(JING, "close-deposits", []);
  call(JING, "mock-cancel-cycle", []);
  call(JING, "mock-buy", [Cl.uint(50_000_000_000n)]);
  call(JING, "close-deposits", []);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  eq("two Jing cycles passed", num(ro(JING, "get-current-cycle", []).result), c0 + 2n);
  const r = m("jing-reconcile", [], w5);
  check("reconcile walks the cancelled cycle", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("filled == deposit", BigInt(v["filled-sats"].value), dep);
  eq("booked at the settled cycle", BigInt(v["jing-cycle"].value), c0 + 1n);
  eq("stx-received exact", BigInt(v["stx-received"].value), stxFor(dep));
  eq("order closed", String(v["order-open"].value), "false");
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
  reserveOk("after cancel-cycle then settle");
}

// ------------------------------- small-share roll (filtered at close-deposits)
{
  fundRewards(208, 2_000, [[w2, 2_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(208)], w5);
  m("settle-staker-rewards", [P(w2), Cl.uint(208), Cl.none()], w5);
  const dep = remaining();
  check("deposit small", isOk(m("jing-deposit", [Cl.uint(dep), Cl.uint(1)], w5)), String(dep));
  call("sbtc-token", "mint", [Cl.uint(5_000_000), P(w6b)]);
  call(JING, "deposit-sbtc", [Cl.uint(5_000_000), Cl.uint(1)], w6b); // ours is under 0.2 percent
  call(JING, "mock-buy", [Cl.uint(50_000_000_000n)]);
  call(JING, "close-deposits", []); // rolls our deposit into the next cycle before clearing
  eq("holding still whole in the next cycle", BigInt(jstate()["holding"].value), dep);
  eq("reconcile during the settle phase refused u1035", errCode(m("jing-reconcile", [], w5)), 1035n);
  call(JING, "mock-settle", [Cl.uint(PRICE)]);
  const r = m("jing-reconcile", [], w5);
  check("reconcile after small-share roll ok", isOk(r), Cl.prettyPrint(r.result));
  const v = okVal(r).value;
  eq("nothing filled", BigInt(v["filled-sats"].value), 0n);
  eq("reason rolled", String(v["reason"].value), "rolled");
  eq("remainder == deposit", BigInt(v["remainder-sats"].value), dep);
  eq("order open", String(v["order-open"].value), "true");
  check("jing-cancel ok", isOk(m("jing-cancel", [], w5)));
  eq("remainder pending again", remaining(), dep);
  check("convert rest", isOk(m("convert", [Cl.uint(dep), Cl.uint(1)], w5)));
  check("w2 payout ok", isOk(m("payout", [P(w2)], w5)));
  reserveOk("after small-share roll");
}

// ------------------------------------------------------ route toggle
{
  check("admin disables jing", isOk(m("set-route-enabled", [Cl.uint(3), Cl.bool(false)])));
  fundRewards(209, 100_000, [[w2, 100_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(209)], w5);
  m("settle-staker-rewards", [P(w2), Cl.uint(209), Cl.none()], w5);
  eq("jing-deposit refused when disabled u1020", errCode(m("jing-deposit", [Cl.uint(1_000), Cl.uint(1)], w5)), 1020n);
  console.log("routes:", Cl.prettyPrint(mro("get-routes", []).result));
  console.log("jing state:", Cl.prettyPrint(mro("get-jing-state", []).result));
}
summary();
