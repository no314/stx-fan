// Invariant and behaviour tests for signer-manager-stx-payout (simnet).
import { Cl } from "@stacks/transactions";
import { boot, check, eq, summary, num, isOk, errCode, okVal, hexBuff, events, MANAGER_ID, D, MANAGER } from "./harness.mjs";

const t = await boot();
const { w, call, ro, m, mro, P, fundRewards, seedDlmm, seedVelar, sbtcBalance, stxBalance, simnet } = t;
const [w1, w2, w3, w4, w5, w6] = [1, 2, 3, 4, 5, 6].map(w);
const CYCLE = 100;

// -------------------------------------------------------------- surface
{
  const iface = simnet.getContractsInterfaces().get(MANAGER_ID);
  const names = new Set(iface.functions.map((f) => f.name));
  for (const f of ["settle-staker-rewards", "payout", "claim-staker-rewards", "claim-rewards", "update-fees", "withdraw-fees",
    "update-admin", "set-payout-config", "clear-payout-config", "settle-accepted-withdrawal", "reclaim-failed-withdrawal",
    "sweep-fee-refunds", "register-self", "is-admin", "get-active-fee-bips", "get-pending-fees", "get-fee-bips-for-cycle",
    "get-earned-fees", "get-earned-staker-rewards", "get-payout-config", "get-pending-payout", "get-staker-refund",
    "get-withdrawal-request-staker", "default-min-claim", "parse-payout-calldata", "settle-many", "payout-many", "convert",
    "get-conversion", "get-routes", "get-pending-conversion", "validate-stake!"])
    check(`surface has ${f}`, names.has(f));
  const vars = new Set(iface.variables.map((v) => v.name));
  check("fees-bips data var present (Leather / Zero to Signing)", vars.has("fees-bips"));
  const claim = iface.functions.find((f) => f.name === "claim-staker-rewards");
  eq("claim-staker-rewards returns the tuple shape", JSON.stringify(claim.outputs.type.response.ok),
    JSON.stringify({ tuple: [{ name: "earned", type: "uint128" }, { name: "withdrawal-request", type: { optional: "uint128" } }] }));
  const settle = iface.functions.find((f) => f.name === "settle-staker-rewards");
  eq("settle-staker-rewards returns (response uint uint)", JSON.stringify(settle.outputs.type.response), JSON.stringify({ ok: "uint128", error: "uint128" }));
  const payout = iface.functions.find((f) => f.name === "payout");
  eq("payout arg is a bare principal", JSON.stringify(payout.args.map((a) => a.type)), JSON.stringify(["principal"]));
}

// ----------------------------------------------------------- elections
{
  // v3 calldata through the pox-5 callback path
  const v3 = hexBuff(Cl.tuple({ "stx-payout": Cl.bool(true) }));
  let r = call("pox-5", "mock-stake", [P(MANAGER_ID), P(w1), Cl.uint(1_000_000_000), Cl.some(v3)]);
  check("v3 calldata accepted", isOk(r), Cl.prettyPrint(r.result));
  eq("w1 currency stx", Cl.prettyPrint(mro("get-payout-currency", [P(w1)]).result), '"stx"');
  eq("w1 is stx elector", Cl.prettyPrint(mro("is-stx-elector", [P(w1)]).result), "true");
  // direct election by the staker
  r = m("set-stx-payout", [Cl.bool(true)], w2);
  check("set-stx-payout ok", isOk(r));
  // staker only
  r = call("pox-5", "mock-stake", [P(MANAGER_ID), P(w3), Cl.uint(1), Cl.none()]);
  check("none calldata clears", isOk(r));
  eq("w3 currency sbtc", Cl.prettyPrint(mro("get-payout-currency", [P(w3)]).result), '"sbtc"');
  // v2 BTC config for w4 with a floor
  const poxAddr = Cl.tuple({ version: Cl.bufferFromHex("00"), hashbytes: Cl.bufferFromHex("11".repeat(20)) });
  const v2 = hexBuff(Cl.tuple({ "pox-addr": poxAddr, "max-fee": Cl.uint(1000), "min-claim": Cl.uint(50_000) }));
  r = call("pox-5", "mock-stake", [P(MANAGER_ID), P(w4), Cl.uint(1), Cl.some(v2)]);
  check("v2 calldata accepted", isOk(r), Cl.prettyPrint(r.result));
  eq("w4 currency btc", Cl.prettyPrint(mro("get-payout-currency", [P(w4)]).result), '"btc"');
  // electing STX clears the BTC config and vice versa
  m("set-stx-payout", [Cl.bool(true)], w4);
  eq("w4 config cleared by stx election", Cl.prettyPrint(mro("get-payout-config", [P(w4)]).result), "none");
  m("set-payout-config", [poxAddr, Cl.uint(1000), Cl.uint(50_000)], w4);
  eq("w4 stx election cleared by btc config", Cl.prettyPrint(mro("is-stx-elector", [P(w4)]).result), "false");
  // v1 calldata still parses
  const v1 = hexBuff(Cl.tuple({ "pox-addr": poxAddr, "max-fee": Cl.uint(1000) }));
  check("parse-payout-calldata v1", Cl.prettyPrint(mro("parse-payout-calldata", [v1]).result).includes("min-claim: u1547"));
  check("parse-stx-calldata rejects v2", Cl.prettyPrint(mro("parse-stx-calldata", [v2]).result) === "none");
}

// ------------------------------------------------------------ pull + fee
{
  // fee 300 bips set before the pull: decrease from 0? No: increase, delayed 2 cycles.
  let r = m("update-fees", [Cl.uint(300)]);
  check("update-fees 300 ok", isOk(r));
  eq("active fee still 0 (increase delayed)", num(mro("get-active-fee-bips", []).result), 0n);
  r = m("update-fees", [Cl.uint(501)]);
  eq("update-fees 501 refused u1005", errCode(r), 1005n);
  r = m("update-fees", [Cl.uint(300)], w1);
  eq("non-admin update-fees u1002", errCode(r), 1002n);
  call("pox-5", "mock-set-cycle", [Cl.uint(CYCLE + 2)]);
  eq("active fee 300 after 2 cycles", num(mro("get-active-fee-bips", []).result), 300n);
  const pf = Cl.prettyPrint(mro("get-pending-fees", []).result);
  check("get-pending-fees shape", pf.includes("active-bips: u300") && pf.includes("pending-bips: u300"), pf);
  r = m("update-fees", [Cl.uint(200)]);
  eq("decrease applies immediately", num(mro("get-active-fee-bips", []).result), 200n);
  eq("fees-bips var reads 200", num(simnet.getDataVar(MANAGER_ID.split(".")[1], "fees-bips")), 200n);

  // pull: 1,000,000 sats for cycle 100; w1 400k, w2 300k, w3 200k, w4 100k
  fundRewards(CYCLE, 1_000_000, [[w1, 400_000], [w2, 300_000], [w3, 200_000], [w4, 100_000]]);
  r = m("claim-rewards", [Cl.list([]), Cl.uint(CYCLE)], w5);
  check("claim-rewards permissionless ok", isOk(r), Cl.prettyPrint(r.result));
  eq("manager holds 1,000,000 sats", sbtcBalance(MANAGER_ID), 1_000_000n);
  eq("unclaimed bucket = 1,000,000", num(mro("get-unclaimed-rewards-for-cycle", [Cl.uint(CYCLE), Cl.none()]).result), 1_000_000n);
  eq("fee snapshot for cycle = 200", num(mro("get-fee-bips-for-cycle", [Cl.uint(CYCLE), Cl.none()]).result), 200n);
  eq("sweep refused: everything reserved", errCode(m("sweep-fee-refunds", [P(D)])), 1010n);
}

// ------------------------------------------------------------- settlement
{
  // w1 (STX elector): 400,000 gross, 2 percent fee = 8,000, net 392,000
  let r = m("settle-staker-rewards", [P(w1), Cl.uint(CYCLE), Cl.none()], w5);
  check("settle w1 ok", isOk(r), Cl.prettyPrint(r.result));
  eq("w1 settled 392,000", num(r.result), 392_000n);
  eq("earned-fees 8,000", num(mro("get-earned-fees", []).result), 8_000n);
  const pend = Cl.prettyPrint(mro("get-stx-pending", [P(w1)]).result);
  check("w1 stx-pending in epoch 1", pend.includes("epoch: u1") && pend.includes("sats: u392000"), pend);
  eq("pending-conversion-sats 392,000", num(simnet.getDataVar(MANAGER, "pending-conversion-sats")), 392_000n);
  eq("w1 has no sBTC pending payout", num(mro("get-pending-payout", [P(w1)]).result), 0n);
  // re-settle with nothing new: distinct code
  r = m("settle-staker-rewards", [P(w1), Cl.uint(CYCLE), Cl.none()], w5);
  eq("re-settle refused u1018", errCode(r), 1018n);
  // never settled zero: u1001
  r = m("settle-staker-rewards", [P(w6), Cl.uint(CYCLE), Cl.none()], w5);
  eq("zero never settled u1001", errCode(r), 1001n);
  // w3 (sBTC elector) 200,000 gross -> 196,000 net into pending-payouts
  r = m("settle-staker-rewards", [P(w3), Cl.uint(CYCLE), Cl.none()], w5);
  eq("w3 settled 196,000", num(r.result), 196_000n);
  eq("w3 pending payout 196,000", num(mro("get-pending-payout", [P(w3)]).result), 196_000n);
  // sweep still refused: reserve covers conversion sats and pending payouts
  eq("sweep refused after settles", errCode(m("sweep-fee-refunds", [P(D)])), 1010n);
  // claim-staker-rewards for STX elector w2: settles, cannot pay yet
  r = m("claim-staker-rewards", [P(w2), Cl.uint(CYCLE), Cl.none()], w5);
  check("claim for stx elector ok", isOk(r), Cl.prettyPrint(r.result));
  check("claim returns settled sats, no withdrawal", Cl.prettyPrint(r.result).includes("earned: u294000") && Cl.prettyPrint(r.result).includes("withdrawal-request: none"), Cl.prettyPrint(r.result));
  check("awaiting-conversion event", events(r, "claim-awaiting-conversion").length === 1);
  eq("payout for w2 refused: conversion pending", errCode(m("payout", [P(w2)], w5)), 1019n);
  // second distribution of the same cycle: settle again is legitimate
  call("pox-5", "mock-set-staker-earned", [P(MANAGER_ID), Cl.uint(CYCLE), Cl.none(), P(w1), Cl.uint(10_000)]);
  call("pox-5", "mock-set-signer-rewards", [P(MANAGER_ID), Cl.uint(CYCLE), Cl.none(), Cl.uint(10_000)]);
  call("sbtc-token", "mint", [Cl.uint(10_000), P(`${D}.pox-5`)]);
  m("claim-rewards", [Cl.list([]), Cl.uint(CYCLE)], w5);
  r = m("settle-staker-rewards", [P(w1), Cl.uint(CYCLE), Cl.none()], w5);
  eq("second settle same cycle ok: 9,800", num(r.result), 9_800n);
  eq("w1 pending sats 401,800", num(mro("get-stx-pending-sats", [P(w1)]).result), 401_800n);
}

// ------------------------------------------------------------- conversion
{
  seedDlmm();
  seedVelar();
  // convert is role-gated: admins and enabled converters
  eq("non-converter refused u1002", errCode(m("convert", [Cl.uint(1), Cl.uint(1)], w5)), 1002n);
  eq("non-admin cannot set-converter u1002", errCode(m("set-converter", [P(w5), Cl.bool(true)], w5)), 1002n);
  check("admin enables w5 as converter", isOk(m("set-converter", [P(w5), Cl.bool(true)])));
  eq("is-converter w5", Cl.prettyPrint(mro("is-converter", [P(w5)]).result), "true");
  const total = 401_800n + 294_000n; // w1 + w2 in epoch 1
  const q = Cl.prettyPrint(mro("quote-routes", [Cl.uint(total)]).result);
  console.log("  quotes for", total, "sats:", q);
  const qd = num(mro("quote-dlmm", [Cl.uint(total)]).result);
  const qv = num(mro("quote-velar", [Cl.uint(total)]).result);
  check("both routes quote", qd > 0n && qv > 0n, q);
  // rate floor above both quotes: refused, state unchanged. Rate is ustx per sat x 1e8.
  const RATE = 100_000_000n;
  const bestRate = ((qd > qv ? qd : qv) * RATE) / total;
  let r = m("convert", [Cl.uint(total), Cl.uint(bestRate + 1n)], w5);
  eq("convert refused below min-stx-out u1021", errCode(r), 1021n);
  eq("epoch 1 untouched", Cl.prettyPrint(mro("get-epoch", [Cl.uint(1)]).result).includes("sats-converted: u0"), true);
  eq("open epoch still 1 after failed convert", num(mro("get-open-epoch", []).result), 1n);
  // best route: pick the higher quote, execute, realized >= quote
  const stxBefore = stxBalance(MANAGER_ID);
  r = m("convert", [Cl.uint(total), Cl.uint(bestRate - 1n)], w5);
  check("convert ok at a floor just under the best rate", isOk(r), Cl.prettyPrint(r.result));
  const res = okVal(r);
  const route = BigInt(res.value.route.value);
  const out = BigInt(res.value["ustx-out"].value);
  const expectedRoute = qd >= qv ? 1n : 2n;
  eq("better route chosen", route, expectedRoute);
  check("realized output equals its quote", out === (route === 1n ? qd : qv), `${out} vs dlmm ${qd} velar ${qv}`);
  eq("STX arrived in the manager", stxBalance(MANAGER_ID) - stxBefore, out);
  eq("epoch 1 closed", Cl.prettyPrint(mro("get-epoch", [Cl.uint(1)]).result).includes("closed: true"), true);
  eq("open epoch advanced to 2", num(mro("get-open-epoch", []).result), 2n);
  eq("convert epoch advanced to 2", num(mro("get-convert-epoch", []).result), 2n);
  eq("pending-conversion-sats back to 0", num(simnet.getDataVar(MANAGER, "pending-conversion-sats")), 0n);
  eq("ustx-liability = out", num(mro("get-ustx-liability", []).result), out);
  eq("conversion logged", num(mro("get-last-conversion-id", []).result), 1n);
  check("convert event", events(r, "convert").length === 1);
  eq("nothing left to convert u1022", errCode(m("convert", [Cl.uint(1), Cl.uint(1)], w5)), 1022n);

  // payouts at the realized rate, floored, remainder stays in liability
  const e = okVal(mro("get-epoch", [Cl.uint(1)]));
  const satsTotal = BigInt(e.value["sats-total"].value), ustxOut = BigInt(e.value["ustx-out"].value);
  const exp1 = (401_800n * ustxOut) / satsTotal, exp2 = (294_000n * ustxOut) / satsTotal;
  eq("get-stx-claimable w1", num(mro("get-stx-claimable", [P(w1)]).result), exp1);
  const b1 = stxBalance(w1);
  r = m("payout", [P(w1)], w5); // third party may trigger; no floor on STX
  check("payout w1 ok", isOk(r), Cl.prettyPrint(r.result));
  eq("w1 received floor(sats * out / total)", stxBalance(w1) - b1, exp1);
  check("payout returns ustx amount and none", Cl.prettyPrint(r.result).includes(`amount: u${exp1}`) && Cl.prettyPrint(r.result).includes("withdrawal-request: none"));
  r = m("payout", [P(w2)], w2);
  eq("w2 paid", stxBalance(MANAGER_ID), out - exp1 - exp2);
  eq("remainder stays in liability", num(mro("get-ustx-liability", []).result), out - exp1 - exp2);
  check("remainder is < 2 ustx", out - exp1 - exp2 < 2n, String(out - exp1 - exp2));
  eq("payout again refused u1016", errCode(m("payout", [P(w1)], w5)), 1016n);
  eq("sweep-stx refused: liability covers balance", errCode(m("sweep-stx", [P(D)])), 1028n);
}

// ---------------------------------------------------- floor and BTC path
{
  // w4 is a BTC elector with min-claim 50,000; settle 98,000 net
  let r = m("settle-staker-rewards", [P(w4), Cl.uint(CYCLE), Cl.none()], w5);
  eq("w4 settled 98,000", num(r.result), 98_000n);
  // lower the floor above the balance to test refusal
  const poxAddr = Cl.tuple({ version: Cl.bufferFromHex("00"), hashbytes: Cl.bufferFromHex("11".repeat(20)) });
  m("set-payout-config", [poxAddr, Cl.uint(1000), Cl.uint(200_000)], w4);
  eq("third party below floor refused u1013", errCode(m("payout", [P(w4)], w5)), 1013n);
  r = m("payout", [P(w4)], w4);
  check("staker themselves may pay out below floor", isOk(r), Cl.prettyPrint(r.result));
  check("BTC payout created a withdrawal request", Cl.prettyPrint(r.result).includes("withdrawal-request: (some u1)"), Cl.prettyPrint(r.result));
  eq("withdrawal liability 98,000", num(mro("get-withdrawal-liability", []).result), 98_000n);
  // reject and reclaim
  call("sbtc-withdrawal", "mock-reject", [Cl.uint(1), P(MANAGER_ID)]);
  const b4 = sbtcBalance(w4);
  r = m("reclaim-failed-withdrawal", [Cl.uint(1)], w5);
  check("reclaim ok", isOk(r), Cl.prettyPrint(r.result));
  check("reclaim returns (ok true), the spox trait type (design decision 15)", Cl.prettyPrint(r.result) === "(ok true)", Cl.prettyPrint(r.result));
  check("reclaim event carries the refund", r.events.some((e) => e.event === "print_event" && Cl.prettyPrint(e.data.value).includes('topic: "reclaim-failed-withdrawal"') && Cl.prettyPrint(e.data.value).includes("amount-sats: u98000")), "no matching print event");
  eq("w4 refunded 98,000 sBTC", sbtcBalance(w4) - b4, 98_000n);
  eq("withdrawal liability back to 0", num(mro("get-withdrawal-liability", []).result), 0n);
  // accept and settle: the sBTC protocol pays L1 and mints the unused fee back here
  fundRewards(CYCLE + 3, 60_000, [[w4, 60_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(CYCLE + 3)], w5);
  eq("w4 settled 58,800 net of the 2 percent fee", num(m("settle-staker-rewards", [P(w4), Cl.uint(CYCLE + 3), Cl.none()], w5).result), 58_800n);
  r = m("payout", [P(w4)], w4);
  check("second BTC payout created request u2", Cl.prettyPrint(r.result).includes("withdrawal-request: (some u2)"), Cl.prettyPrint(r.result));
  eq("withdrawal liability 58,800", num(mro("get-withdrawal-liability", []).result), 58_800n);
  eq("settle before acceptance refused u1011", errCode(m("settle-accepted-withdrawal", [Cl.uint(2)], w5)), 1011n);
  call("sbtc-registry", "mock-set-status", [Cl.uint(2), Cl.some(Cl.bool(true))]);
  call("sbtc-token", "mint", [Cl.uint(400), P(MANAGER_ID)]); // max-fee 1000, actual fee 600
  r = m("settle-accepted-withdrawal", [Cl.uint(2)], w5);
  check("settle returns (ok true), the spox trait type (design decision 15)", Cl.prettyPrint(r.result) === "(ok true)", Cl.prettyPrint(r.result));
  check("settle event carries fee-refund u400", r.events.some((e) => e.event === "print_event" && Cl.prettyPrint(e.data.value).includes('topic: "settle-accepted-withdrawal"') && Cl.prettyPrint(e.data.value).includes("fee-refund: u400")), "no matching print event");
  eq("w4 credited refund 400", num(mro("get-staker-refund", [P(w4)]).result), 400n);
  eq("withdrawal liability back to 0 again", num(mro("get-withdrawal-liability", []).result), 0n);
  eq("settle replay refused u1008", errCode(m("settle-accepted-withdrawal", [Cl.uint(2)], w5)), 1008n);
}

// ------------------------------------------------------------ batches
{
  const CY2 = CYCLE + 1;
  // new distribution: w1 (stx) 100k, w3 (sbtc) 50k, w5 (sbtc) 30k, w6 nothing
  fundRewards(CY2, 180_000, [[w1, 100_000], [w3, 50_000], [w5, 30_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(CY2)], w5);
  const entry = (s) => Cl.tuple({ staker: P(s), "reward-cycle": Cl.uint(CY2), "bond-index": Cl.none() });
  const pend3 = num(mro("get-pending-payout", [P(w3)]).result);
  let r = m("settle-many", [Cl.list([entry(w1), entry(w6), entry(w3), entry(w5), entry(w3)])], w6);
  check("settle-many ok", isOk(r), Cl.prettyPrint(r.result));
  const s = Cl.prettyPrint(r.result);
  check("settle-many counts 3 ok 2 err", s.includes("ok-count: u3") && s.includes("err-count: u2"), s);
  eq("zc-settle-ok events", events(r, "zc-settle-ok").length, 3);
  const errs = events(r, "zc-settle-err");
  eq("zc-settle-err events", errs.length, 2);
  check("w6 err code u1001", errs.some((e) => e.value.staker.value === w6 && e.value.code.value === "1001"));
  check("duplicate w3 err code u1018", errs.some((e) => e.value.staker.value === w3 && e.value.code.value === "1018"));
  eq("w3 pending grew by exactly 49,000 (one settle landed, the duplicate wrote nothing)", num(mro("get-pending-payout", [P(w3)]).result) - pend3, 49_000n);
  eq("w1 stx pending in epoch 2", Cl.prettyPrint(mro("get-stx-pending", [P(w1)]).result).includes("epoch: u2"), true);
  eq("w6 has no pending", num(mro("get-pending-payout", [P(w6)]).result), 0n);
  // payout-many: w3 and w5 in sBTC succeed, w1 (stx, unconverted) fails, w6 fails
  const b3 = sbtcBalance(w3);
  r = m("payout-many", [Cl.list([P(w3), P(w1), P(w5), P(w6)])], w6);
  const p = Cl.prettyPrint(r.result);
  check("payout-many counts 2 ok 2 err", p.includes("ok-count: u2") && p.includes("err-count: u2"), p);
  eq("w3 received sBTC", sbtcBalance(w3) - b3, pend3 + 49_000n);
  const perr = events(r, "zc-payout-err");
  check("w1 err u1019 conversion pending", perr.some((e) => e.value.staker.value === w1 && e.value.code.value === "1019"));
  check("w6 err u1016 nothing", perr.some((e) => e.value.staker.value === w6 && e.value.code.value === "1016"));
  eq("total-pending-payouts drained for sbtc electors", num(mro("get-total-pending-payouts", []).result), 0n);
}

// ------------------------------------------------- dead route fallback
{
  // epoch 2 holds w1's 98,000 sats. Pause Velar: quote still succeeds but the
  // swap fails; DLMM must carry it.
  call("univ2-pool-v1_0_0-0070", "mock-set-paused", [Cl.bool(true)]);
  const qd = num(mro("quote-dlmm", [Cl.uint(98_000)]).result);
  const qv = num(mro("quote-velar", [Cl.uint(98_000)]).result);
  // make Velar look better on paper by disabling DLMM... instead force the
  // order: if velar quotes higher it is tried first and fails.
  let r = m("convert", [Cl.uint(50_000), Cl.uint(1)], w5);
  check("convert with paused velar ok", isOk(r), Cl.prettyPrint(r.result));
  eq("dlmm executed", BigInt(okVal(r).value.route.value), 1n);
  check("tranche of 50,000 recorded", Cl.prettyPrint(r.result).includes("sats-in: u50000"), Cl.prettyPrint(r.result));
  eq("epoch 2 not closed after partial tranche", Cl.prettyPrint(mro("get-epoch", [Cl.uint(2)]).result).includes("closed: false"), true);
  eq("open epoch advanced to 3 on first tranche", num(mro("get-open-epoch", []).result), 3n);
  // a settle for w1 now (epoch 2 converting) is refused with u1027
  fundRewards(CYCLE + 2, 5_000, [[w1, 5_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(CYCLE + 2)], w5);
  eq("settle into converting epoch refused u1027", errCode(m("settle-staker-rewards", [P(w1), Cl.uint(CYCLE + 2), Cl.none()], w5)), 1027n);
  // disable DLMM in the core (paused pool) and velar still paused: no route
  call("dlmm-core-v-1-1", "mock-set-status", [Cl.bool(false)]);
  eq("dlmm quote none when pool disabled", Cl.prettyPrint(mro("quote-dlmm", [Cl.uint(48_000)]).result), "none");
  // only Velar quotes (DLMM disabled in its core); its swap fails on pause and that code surfaces
  eq("only candidate fails: velar err u107 surfaces", errCode(m("convert", [Cl.uint(48_000), Cl.uint(1)], w5)), 107n);
  // admin disables velar route explicitly, re-enables dlmm pool: proceeds
  eq("non-admin cannot toggle routes u1002", errCode(m("set-route-enabled", [Cl.uint(2), Cl.bool(false)], w1)), 1002n);
  check("admin disables velar", isOk(m("set-route-enabled", [Cl.uint(2), Cl.bool(false)])));
  eq("velar quote none when disabled", Cl.prettyPrint(mro("quote-velar", [Cl.uint(48_000)]).result), "none");
  call("dlmm-core-v-1-1", "mock-set-status", [Cl.bool(true)]);
  r = m("convert", [Cl.uint(1_000_000), Cl.uint(1)], w5);
  check("remaining 48,000 converted", isOk(r) && Cl.prettyPrint(r.result).includes("sats-in: u48000"), Cl.prettyPrint(r.result));
  eq("epoch 2 closed", Cl.prettyPrint(mro("get-epoch", [Cl.uint(2)]).result).includes("closed: true"), true);
  // w1 can now settle into epoch 3 (old epoch crystallizes on the way)
  r = m("settle-staker-rewards", [P(w1), Cl.uint(CYCLE + 2), Cl.none()], w5);
  check("settle after close ok", isOk(r), Cl.prettyPrint(r.result));
  check("w1 owed > 0 after crystallize", num(mro("get-stx-owed", [P(w1)]).result) > 0n);
  const e2 = okVal(mro("get-epoch", [Cl.uint(2)]));
  const blended = BigInt(e2.value["ustx-out"].value), tot = BigInt(e2.value["sats-total"].value);
  eq("w1 owed = floor(98000 * out / total) blended over two tranches", num(mro("get-stx-owed", [P(w1)]).result), (98_000n * blended) / tot);
  eq("sats-crystallized = sats-total", BigInt(e2.value["sats-crystallized"].value), tot);
  check("conversions logged: 3", num(mro("get-last-conversion-id", []).result) === 3n);
  call("univ2-pool-v1_0_0-0070", "mock-set-paused", [Cl.bool(false)]);
  m("set-route-enabled", [Cl.uint(2), Cl.bool(true)]);
}

// ------------------------------------------------------- admin guards
{
  eq("last admin cannot remove self u1015", errCode(m("update-admin", [P(D), Cl.bool(false)])), 1015n);
  check("add admin w6", isOk(m("update-admin", [P(w6), Cl.bool(true)])));
  check("w6 removes deployer", isOk(m("update-admin", [P(D), Cl.bool(false)], w6)));
  eq("deployer no longer admin", Cl.prettyPrint(mro("is-admin", [P(D)]).result), "false");
  eq("withdraw-fees by non-admin u1002", errCode(m("withdraw-fees", [Cl.uint(1), P(D)])), 1002n);
  const fees = num(mro("get-earned-fees", []).result);
  eq("withdraw more than earned u1007", errCode(m("withdraw-fees", [Cl.uint(fees + 1n), P(w6)], w6)), 1007n);
  const b6 = sbtcBalance(w6);
  check("withdraw-fees exact ok", isOk(m("withdraw-fees", [Cl.uint(fees), P(w6)], w6)));
  eq("fees received", sbtcBalance(w6) - b6, fees);
  // reserve: sBTC sent by mistake is the only sweepable amount
  call("sbtc-token", "mint", [Cl.uint(777), P(MANAGER_ID)]);
  const r = m("sweep-fee-refunds", [P(w6)], w6);
  eq("sweep takes exactly the stray 777", num(r.result), 777n);
  // stray STX likewise
  simnet.transferSTX(555, MANAGER_ID, w6);
  eq("sweep-stx takes exactly 555", num(m("sweep-stx", [P(w6)], w6).result), 555n);
  eq("STX balance equals liability after sweep", stxBalance(MANAGER_ID), num(mro("get-ustx-liability", []).result));
}

// ---------------------------------------- deficits (design decision 9)
{
  const CY = CYCLE + 7;
  // never pulled: refused up front, pox-5 untouched
  call("pox-5", "mock-set-staker-earned", [P(MANAGER_ID), Cl.uint(CY), Cl.none(), P(w3), Cl.uint(40_000)]);
  eq("settle before pull u1030", errCode(m("settle-staker-rewards", [P(w3), Cl.uint(CY), Cl.none()], w5)), 1030n);
  eq("pox-5 pending untouched", num(ro("pox-5", "get-earned-staker-rewards", [P(MANAGER_ID), Cl.uint(CY), Cl.none(), P(w3)]).result), 40_000n);
  // pull 40,000 then accrue 10,000 more for w3 before the next pull
  fundRewards(CY, 40_000, [[w3, 40_000]]);
  m("claim-rewards", [Cl.list([]), Cl.uint(CY)], w5);
  call("pox-5", "mock-set-staker-earned", [P(MANAGER_ID), Cl.uint(CY), Cl.none(), P(w3), Cl.uint(50_000)]);
  let r = m("settle-staker-rewards", [P(w3), Cl.uint(CY), Cl.none()], w5);
  check("settle with post-pull accrual ok", isOk(r), Cl.prettyPrint(r.result));
  eq("settled full 49,000 net", num(r.result), 49_000n);
  eq("deficit 10,000 booked", num(mro("get-cycle-deficit", [Cl.uint(CY), Cl.none()]).result), 10_000n);
  eq("bucket drained to 0", num(mro("get-unclaimed-rewards-for-cycle", [Cl.uint(CY), Cl.none()]).result), 0n);
  eq("payout gated u1029", errCode(m("payout", [P(w3)], w5)), 1029n);
  eq("convert gated u1029", errCode(m("convert", [Cl.uint(1), Cl.uint(1)], w5)), 1029n);
  // claim-staker-rewards whose own settle opens a deficit keeps the settle (audit M-3)
  call("pox-5", "mock-set-staker-earned", [P(MANAGER_ID), Cl.uint(CY), Cl.none(), P(w3), Cl.uint(2_000)]);
  r = m("claim-staker-rewards", [P(w3), Cl.uint(CY), Cl.none()], w5);
  check("claim-staker-rewards under a deficit returns ok with the settled sats", isOk(r) && Cl.prettyPrint(r.result).includes("earned: u1960") && Cl.prettyPrint(r.result).includes("withdrawal-request: none"), Cl.prettyPrint(r.result));
  check("claim-unfunded event", events(r, "claim-unfunded").length === 1);
  eq("deficit grew to 12,000", num(mro("get-cycle-deficit", [Cl.uint(CY), Cl.none()]).result), 12_000n);
  eq("w3 pending payout 50,960", num(mro("get-pending-payout", [P(w3)]).result), 50_960n);
  // the accrual is pullable: pull funds the deficit first
  call("sbtc-token", "mint", [Cl.uint(12_000), P(`${D}.pox-5`)]);
  call("pox-5", "mock-set-signer-rewards", [P(MANAGER_ID), Cl.uint(CY), Cl.none(), Cl.uint(12_000)]);
  m("claim-rewards", [Cl.list([]), Cl.uint(CY)], w5);
  eq("deficit cleared", num(mro("get-total-deficit", []).result), 0n);
  eq("bucket still 0 (pull went to the deficit)", num(mro("get-unclaimed-rewards-for-cycle", [Cl.uint(CY), Cl.none()]).result), 0n);
  const b3 = sbtcBalance(w3);
  r = m("payout", [P(w3)], w5);
  check("payout after funding ok", isOk(r), Cl.prettyPrint(r.result));
  eq("w3 paid 50,960", sbtcBalance(w3) - b3, 50_960n);
  eq("reserve exact: sweep refused", errCode(m("sweep-fee-refunds", [P(w6)], w6)), 1010n);
}

// --------------------------------------------- register-self path (mock)
{
  const key = Cl.bufferFromHex("02" + "ab".repeat(32));
  const sig = Cl.bufferFromHex("cd".repeat(65));
  const r = m("register-self", [P(MANAGER_ID), key, Cl.uint(1), sig], w6);
  check("register-self ok through pox-5 mock", isOk(r), Cl.prettyPrint(r.result));
}

summary();
