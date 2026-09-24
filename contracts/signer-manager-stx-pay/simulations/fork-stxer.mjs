// Mainnet fork simulation for signer-manager-stx-payout on stxer.
//
// Deploys the exact mainnet source (contracts/signer-manager-stx-payout.clar,
// Clarity 6) on a fork of mainnet at the current tip and drives it against the
// real pox-5, sBTC, Bitflow DLMM, Velar and Jing v6 contracts. Nothing is
// broadcast. This is the step the simnet suites cannot do: the DLMM route
// passes trait typed arguments to the real dlmm-core-v-1-1, and the quotes are
// computed against real bins and reserves.
//
//   node simulations/fork-stxer.mjs               deploy, guards, real quotes
//   node simulations/fork-stxer.mjs --lifecycle   seeded rewards, real pull,
//                                                 settle, convert on a real
//                                                 pool, STX payout, Jing v6
//                                                 deposit and cancel
//
// Environment: STACKS_API_URL (default https://api.hiro.so), STXER_API_URL
// (default https://api.stxer.xyz). Both must be reachable from the machine
// running this. Written 2026-09-23, NOT YET RUN: the workspace it was written
// in cannot reach stxer. Expect the pox-5 fixture (see FIXTURE below) to need
// one round of adjustment against the deployed pox-5 source.
import { createRequire } from "node:module";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, "../package.json"));
const { SimulationBuilder, getSimulationResult } = require("stxer");
const { Cl, ClarityVersion, deserializeCV, cvToString, serializeCV } = require("@stacks/transactions");

const DEP = process.env.FORK_DEPLOYER || "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"; // any funded mainnet address; the fork pays fees from it
// CONTRACT=signer-manager-stx-payout-jing runs the Jing build (adds the Jing steps).
const MANAGER = process.env.CONTRACT || "signer-manager-stx-payout";
const WITH_JING = MANAGER.endsWith("-jing");
const MID = `${DEP}.${MANAGER}`;
const OPERATOR = "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM"; // converter in the fork
const STRANGER = "SP9BP4PN74CNR5XT7CMAMBPA0GWC9HMB69HVVV51";
const NODE = process.env.STACKS_API_URL || "https://api.hiro.so";
const API = process.env.STXER_API_URL || "https://api.stxer.xyz";
const POX = "SP000000000000000000002Q6VF78.pox-5";
const SBTC = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";
const JING = "SPV9K21TBFAK4KNRJXF5DFP8N7W46G4V9RCJDC22.markets-sbtc-stx-jing-v6";
// Signed Pyth Lazer update for the Jing calls (hex). Without one the market
// refuses any call that needs a fresh price; steps then accept the Jing codes.
const UPDATE = Cl.bufferFromHex((process.env.LAZER_UPDATE_HEX || "00").replace(/^0x/, ""));
const WHALE = "SM2RRFN4HXTS7EYP8MHHYKSTG118S3HKGDV8AB8M1"; // large sBTC holder used to fund pox-5 in the fork
const SOURCE = resolve(here, `../contracts/${MANAGER}.clar`);
const RESULTS = resolve(here, "results");
const lifecycle = process.argv.includes("--lifecycle");

const tipResponse = await fetch(`${NODE}/extended/v1/block?limit=1`, { signal: AbortSignal.timeout(20000) });
if (!tipResponse.ok) throw new Error(`tip HTTP ${tipResponse.status}`);
const tip = (await tipResponse.json()).results[0];
const builder = SimulationBuilder.new({ stacksNodeAPI: NODE, apiEndpoint: API, skipTracing: true })
  .useBlockHeight(tip.height)
  .withSender(DEP);
const plan = [];
// Both managers impl-trait the spox trait published at TRAIT (live since
// block 9050280). The check below keeps the runner correct on a fork taken
// before that block or against a re-pointed trait: if TRAIT is absent the fork
// deploys it first, under its exact address (the simulator needs no key),
// otherwise the manager deploy fails with "use of undeclared trait".
const TRAIT_ADDR = "SP3TB3AJ0XMZ9S6CGY2CQ6R06H1Z6DJQ1SH15ZP2H";
const TRAIT_NAME = "reward-claim-signer-manager-trait";
const traitLive = (await fetch(`${NODE}/v2/contracts/interface/${TRAIT_ADDR}/${TRAIT_NAME}`, { signal: AbortSignal.timeout(20000) })).ok;
const deploy = () => {
  if (!traitLive) {
    builder.addContractDeploy({ contract_name: TRAIT_NAME, deployer: TRAIT_ADDR, source_code: readFileSync(resolve(here, `../contracts/${TRAIT_NAME}.clar`), "utf8"), clarity_version: ClarityVersion.Clarity6 });
    plan.push({ label: `deploy ${TRAIT_NAME} in the fork (not on mainnet yet)`, kind: "deploy" });
  }
  builder.addContractDeploy({ contract_name: MANAGER, source_code: readFileSync(SOURCE, "utf8"), clarity_version: ClarityVersion.Clarity6 });
  plan.push({ label: `deploy unchanged mainnet source against real callees (trait ${traitLive ? "live on mainnet" : "deployed in fork"})`, kind: "deploy" });
};
const call = (label, id, fn, args, want, sender = DEP) => {
  builder.addContractCall({ contract_id: id, function_name: fn, function_args: args, sender });
  plan.push({ label, kind: "tx", want });
  return plan.length - 1;
};
const ev = (label, id, code, want) => {
  builder.addEvalCode(id, code);
  plan.push({ label, kind: "eval", want });
  return plan.length - 1;
};
const ok = (v) => v.startsWith("(ok");
const isUint = (v) => /^u\d+$/.test(v);
const uint = (s) => BigInt(s.match(/u(\d+)/)?.[1] ?? "-1");
// `(name uN)` or `(name (some uN))`; -1 when absent or none.
const field = (s, name) => BigInt(s.match(new RegExp(`\\(${name} (?:\\(some )?u(\\d+)`))?.[1] ?? "-1");

deploy();
ev("real pox-5 reward cycle", POX, "(current-pox-reward-cycle)", isUint);
ev("routes pinned to real principals", MID, "(get-routes)", (v) => v.includes("dlmm-core-v-1-1") && v.includes("univ2-pool-v1_0_0-0070") && (!WITH_JING || v.includes("markets-sbtc-stx-jing-v6")));
const q100k = ev("quote-routes 100,000 sats on real pools", MID, "(quote-routes u100000)", (v) => v.includes("(dlmm-filled u"));
ev("quote-dlmm-raw 100,000 sats walks real bins", MID, "(quote-dlmm-raw u100000)", (v) => v.startsWith("(some (tuple (filled u") || v === "none");
ev("quote-velar 100,000 sats on real reserves", MID, "(quote-velar u100000)", (v) => v.startsWith("(some u") || v === "none");
if (WITH_JING) ev("Jing v6 state readable", MID, "(get-jing-state)", (v) => v.includes("(jing-cycle u") && v.includes("(holding u"));
ev("epochs start empty", MID, "(get-pending-conversion)", (v) => v.includes("(convert-epoch-remaining u0)"));
call("stranger cannot convert (u1002)", MID, "convert", [Cl.uint(1000), Cl.uint(1)], "(err u1002)", STRANGER);
if (WITH_JING) call("stranger cannot jing-deposit (u1002)", MID, "jing-deposit", [Cl.uint(1000), Cl.uint(1), UPDATE], "(err u1002)", STRANGER);
if (WITH_JING) call("stranger cannot jing-swap (u1002)", MID, "jing-swap", [Cl.uint(1000), Cl.uint(1), Cl.uint(1), UPDATE], "(err u1002)", STRANGER);
call("stranger cannot set-converter (u1002)", MID, "set-converter", [Cl.principal(STRANGER), Cl.bool(true)], "(err u1002)", STRANGER);
call("stranger cannot sweep-stx (u1002)", MID, "sweep-stx", [Cl.principal(STRANGER)], "(err u1002)", STRANGER);
call("nothing to convert yet (u1022)", MID, "convert", [Cl.uint(1000), Cl.uint(1)], "(err u1022)", DEP);
call("admin sets converter", MID, "set-converter", [Cl.principal(OPERATOR), Cl.bool(true)], "(ok true)", DEP);
call("converter with nothing pending (u1022)", MID, "convert", [Cl.uint(1000), Cl.uint(1)], "(err u1022)", OPERATOR);

let slots = {};
if (lifecycle) {
  // FIXTURE. Seeds a past reward cycle in the real pox-5 with fork-only Eval
  // writes so that `claim-rewards` pulls FUND sats and each staker's
  // `claim-staker-rewards-for-signer` returns their share. Map names read
  // from the deployed pox-5 on 2026-09-23: signer-shares-staked-for-cycle,
  // signer-pending-staked-ustx-per-cycle, signer-rewards-per-token-settled-
  // for-cycle, signer-unclaimed-rewards-for-cycle, staker-shares-staked-for-
  // cycle, staker-rewards-per-token-settled-for-cycle, staker-unclaimed-
  // rewards-for-cycle, last-accounted-rewards-only. The key tuples are
  // quoted from the source. Whether setting staker-unclaimed-rewards-for-
  // cycle directly is enough for claim-staker-rewards-for-signer to pay
  // depends on the private settle-staker-rewards in pox-5; if the first run
  // returns earned u0, seed staker-rewards-per-token-settled-for-cycle to u0
  // instead and let pox-5 compute earned from shares.
  const cycleResp = await fetch(`${NODE}/v2/contracts/call-read/SP000000000000000000002Q6VF78/pox-5/current-pox-reward-cycle`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sender: DEP, arguments: [] }),
  });
  const cycle = Number(deserializeCV((await cycleResp.json()).result).value) - 1;
  const FUND = 100_000;
  const ALICE = "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE"; // sBTC staker, 1 share
  const BOB = "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS"; // STX elector, 3 shares
  const calldata = "0x" + serializeCV(Cl.tuple({ "stx-payout": Cl.bool(true) })).replace(/^0x/, "");
  const key = (staker) => `{ reward-cycle: u${cycle}, bond-index: none, signer: '${MID}${staker ? `, staker: '${staker}` : ""} }`;
  call("fund real pox-5 sBTC balance (fork only)", SBTC, "transfer", [Cl.uint(FUND), Cl.principal(WHALE), Cl.principal(POX), Cl.none()], "(ok true)", WHALE);
  ev("fixture: signer rewards, staker shares and unclaimed rewards", POX, `(begin
  (map-set signer-shares-staked-for-cycle ${key()} u4)
  (map-set signer-pending-staked-ustx-per-cycle { signer: '${MID}, cycle: u${cycle} } u4)
  (map-set signer-rewards-per-token-settled-for-cycle ${key()} (get-rewards-per-token-for-cycle u${cycle} none))
  (map-set signer-unclaimed-rewards-for-cycle ${key()} u${FUND})
  (map-set staker-shares-staked-for-cycle ${key(ALICE)} u1)
  (map-set staker-shares-staked-for-cycle ${key(BOB)} u3)
  (map-set staker-rewards-per-token-settled-for-cycle ${key(ALICE)} (get-rewards-per-token-for-cycle u${cycle} none))
  (map-set staker-rewards-per-token-settled-for-cycle ${key(BOB)} (get-rewards-per-token-for-cycle u${cycle} none))
  (map-set staker-unclaimed-rewards-for-cycle ${key(ALICE)} u${FUND / 4})
  (map-set staker-unclaimed-rewards-for-cycle ${key(BOB)} u${(FUND * 3) / 4})
  (var-set last-accounted-rewards-only (+ (var-get last-accounted-rewards-only) u${FUND}))
  (try! (contract-call? '${MID} validate-stake! '${ALICE} u${cycle} u1 u1 u0 false none))
  (try! (contract-call? '${MID} validate-stake! '${BOB} u${cycle} u1 u3 u0 false (some ${calldata})))
  (ok true))`, "(ok true)");
  ev("Bob elected STX through v3 calldata", MID, `(get-payout-currency '${BOB})`, (v) => v.includes("stx"));
  ev("Alice stays on sBTC", MID, `(get-payout-currency '${ALICE})`, (v) => v.includes("sbtc"));
  call("real pox-5 pull", MID, "claim-rewards", [Cl.list([]), Cl.uint(cycle)], (v) => ok(v) && v.includes(`(total-rewards u${FUND})`), STRANGER);
  slots.aliceSbtcBefore = ev("Alice sBTC before", SBTC, `(get-balance '${ALICE})`, ok);
  call("settle-many: Alice (sBTC) and Bob (STX elector)", MID, "settle-many", [Cl.list([
    Cl.tuple({ staker: Cl.principal(ALICE), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() }),
    Cl.tuple({ staker: Cl.principal(BOB), "reward-cycle": Cl.uint(cycle), "bond-index": Cl.none() }),
  ])], (v) => ok(v) && v.includes("(ok-count u2)"), STRANGER);
  call("Alice paid in sBTC", MID, "payout", [Cl.principal(ALICE)], ok, STRANGER);
  slots.aliceSbtcAfter = ev("Alice sBTC after", SBTC, `(get-balance '${ALICE})`, ok);
  slots.pending = ev("Bob's sats pending conversion", MID, "(get-pending-conversion)", (v) => v.includes(`(convert-epoch-remaining u${(FUND * 3) / 4})`));
  call("Bob cannot be paid before conversion (u1019)", MID, "payout", [Cl.principal(BOB)], "(err u1019)", STRANGER);
  // Tranche 1 on a real pool: 25,000 sats, floor u1 in the fork; the quote is
  // compared with the realized output below.
  slots.quote1 = ev("quote 25,000 sats", MID, "(quote-routes u25000)", (v) => v.includes("(dlmm-filled u"));
  call("convert 25,000 sats on the best real route", MID, "convert", [Cl.uint(25_000), Cl.uint(1)], (v) => ok(v) && v.includes("(sats-in u25000)"), OPERATOR);
  slots.conv1 = ev("conversion 1 booked", MID, "(get-conversion u1)", (v) => v.includes("(ustx-out u"));
  if (WITH_JING) {
    // Tranche 2 rests on the real Jing v6 book, then is cancelled. Accepts the
    // market's own refusals offset by u2000: u3007 paused, u3003 stale or
    // missing Lazer update, u3016 the limit would cross the book.
    const jingOk = (v) => ok(v) || ["(err u3007)", "(err u3003)", "(err u3016)", "(err u3023)", "(err u3025)"].includes(v);
    ev("Jing v6 cycle", JING, "(get-current-cycle)", isUint);
    slots.jingDeposit = call("jing-deposit 25,000 sats at a high limit", MID, "jing-deposit", [Cl.uint(25_000), Cl.uint(99_999_999_999_999_999n), UPDATE], jingOk, OPERATOR);
    ev("sats-in-jing", MID, "(get-sats-in-jing)", isUint);
    call("convert refused while the order is open (u1032), or nothing to gate", MID, "convert", [Cl.uint(1000), Cl.uint(1)], (v) => v === "(err u1032)" || ok(v), OPERATOR);
    call("jing-reconcile books nothing new", MID, "jing-reconcile", [], (v) => ok(v) || v === "(err u1033)", OPERATOR);
    call("jing-cancel returns the remainder", MID, "jing-cancel", [], (v) => ok(v) || v === "(err u1033)", OPERATOR);
    ev("no Jing order open", MID, "(get-jing-order)", "none");
    call("jing-swap 1,000 sats as taker (fill or fail at Jing)", MID, "jing-swap", [Cl.uint(1_000), Cl.uint(1), Cl.uint(1), UPDATE], (v) => ok(v) || jingOk(v) || v === "(err u3017)" || v === "(err u3009)", OPERATOR);
  }
  // Finish the epoch on the instant routes and pay Bob in STX.
  slots.rest = ev("remaining sats", MID, "(get-pending-conversion)", (v) => v.includes("(convert-epoch-remaining u"));
  call("convert the remaining 50,000 sats", MID, "convert", [Cl.uint(50_000), Cl.uint(1)], (v) => ok(v) && v.includes("(epoch-closed true)"), OPERATOR);
  slots.epoch = ev("epoch 1 closed with blended rate", MID, "(get-epoch u1)", (v) => v.includes("(closed true)"));
  slots.bobBefore = ev("Bob STX before", MID, `(stx-get-balance '${BOB})`, isUint);
  call("Bob paid in STX", MID, "payout", [Cl.principal(BOB)], (v) => ok(v), STRANGER);
  slots.bobAfter = ev("Bob STX after", MID, `(stx-get-balance '${BOB})`, isUint);
  call("Bob payout replay refused (u1016)", MID, "payout", [Cl.principal(BOB)], "(err u1016)", STRANGER);
  ev("STX liability back to zero", MID, "(get-ustx-liability)", "u0");
  ev("sBTC reserve exact: unattributed-balance u0", MID, "(unattributed-balance)", "u0");
}

console.log(`${lifecycle ? "lifecycle" : "guards"}: submitting ${plan.length} steps at mainnet block ${tip.height}`);
const id = await builder.run();
console.log(`View: https://stxer.xyz/simulations/mainnet/${id}`);
const result = await getSimulationResult(id, { stxerApi: API });
const checks = plan.map((p, i) => {
  const step = result.steps[i]?.Result;
  let actual;
  if (p.kind === "eval") actual = step?.Eval?.Ok !== undefined ? cvToString(deserializeCV(step.Eval.Ok)) : `ENGINE ${JSON.stringify(step)}`;
  else actual = step?.Transaction?.Ok && !step.Transaction.Ok.vm_error ? cvToString(deserializeCV(step.Transaction.Ok.result)) : `ENGINE ${JSON.stringify(step)}`;
  const passed = p.kind === "deploy" ? actual.startsWith("(ok") : typeof p.want === "function" ? p.want(actual) : actual === p.want;
  console.log(`${passed ? "PASS" : "FAIL"} ${p.label}: ${actual.slice(0, 240)}`);
  return { label: p.label, passed, actual };
});
if (lifecycle && checks.every((c) => c.passed)) {
  // Derived checks: realized output within 1 percent of the pre-trade quote,
  // Alice got 25,000 sats, Bob got the epoch's STX.
  const q = checks[slots.quote1].actual;
  const quoted = [field(q, "dlmm"), field(q, "velar")].filter((x) => x > 0n).sort((a, b) => (a > b ? -1 : 1))[0] ?? 0n;
  const realized = field(checks[slots.conv1].actual, "ustx-out");
  checks.push({ label: "tranche 1 realized within 1 percent of the best quote", passed: realized * 100n >= quoted * 99n, actual: `${realized} vs quoted ${quoted}` });
  const aliceDelta = uint(checks[slots.aliceSbtcAfter].actual) - uint(checks[slots.aliceSbtcBefore].actual);
  checks.push({ label: "Alice received 25,000 sats", passed: aliceDelta === 25_000n, actual: String(aliceDelta) });
  const bobDelta = uint(checks[slots.bobAfter].actual) - uint(checks[slots.bobBefore].actual);
  const epochOut = field(checks[slots.epoch].actual, "ustx-out");
  checks.push({ label: "Bob received the whole epoch output (sole STX elector)", passed: bobDelta === epochOut, actual: `${bobDelta} vs ${epochOut}` });
}
mkdirSync(RESULTS, { recursive: true });
const report = { id, url: `https://stxer.xyz/simulations/mainnet/${id}`, contract: MANAGER, mode: lifecycle ? "lifecycle" : "guards", block: tip.height, burn: tip.burn_block_height, sourceUnmodified: true, checks };
writeFileSync(resolve(RESULTS, `${MANAGER}-${lifecycle ? "lifecycle" : "guards"}.json`), JSON.stringify(report, null, 2));
const failed = checks.filter((c) => !c.passed).length;
console.log(`${checks.length - failed}/${checks.length} checks passed`);
if (failed) process.exit(1);
