// Minimal test harness on top of the Clarinet SDK simnet (vitest's forks pool
// cannot start in this sandbox, so tests run as a plain node script).
import { initSimnet } from "@stacks/clarinet-sdk";
import { Cl, cvToJSON, serializeCV } from "@stacks/transactions";

// MANAGER=signer-manager-stx-payout-jing selects the Jing build.
export const MANAGER = process.env.MANAGER || "signer-manager-stx-payout";
export const D = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
export const MANAGER_ID = `${D}.${MANAGER}`;

let passed = 0, failed = 0;
const failures = [];
export function check(name, cond, detail) {
  if (cond) passed++;
  else { failed++; failures.push(name + (detail ? " :: " + detail : "")); console.log("  FAIL", name, detail ?? ""); }
}
export function eq(name, a, b) { check(name, a === b, `${a} !== ${b}`); }
export function summary() {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) { console.log(failures.join("\n")); process.exit(1); }
}
export function pp(cv) { return Cl.prettyPrint(cv); }
export function j(cv) { return cvToJSON(cv); }
export function num(cv) {
  // uint or (ok uint) or (some uint)
  const x = cvToJSON(cv);
  const v = x.value?.value ?? x.value;
  return BigInt(typeof v === "object" ? v.value : v);
}
export function isOk(r) { return cvToJSON(r.result).success === true; }
export function errCode(r) { const x = cvToJSON(r.result); return x.success === false ? BigInt(x.value.value) : null; }
export function okVal(r) { return cvToJSON(r.result).value; }
export function hexBuff(cv) { return Cl.bufferFromHex(serializeCV(cv)); }
export function events(r, topic) {
  return r.events
    .filter((e) => e.event === "print_event")
    .map((e) => cvToJSON(Cl.deserialize(e.data.raw_value)))
    .filter((v) => !topic || v.value?.topic?.value === topic);
}

export async function boot() {
  const simnet = await initSimnet("./Clarinet.toml", true, { trackCosts: true, trackCoverage: false });
  const accounts = simnet.getAccounts();
  const w = (n) => accounts.get(`wallet_${n}`);
  const call = (c, f, args, sender = D) => simnet.callPublicFn(c, f, args, sender);
  const ro = (c, f, args, sender = D) => simnet.callReadOnlyFn(c, f, args, sender);
  const m = (f, args, sender = D) => call(MANAGER, f, args, sender);
  const mro = (f, args, sender = D) => ro(MANAGER, f, args, sender);
  const P = (s) => Cl.principal(s);

  // Reward plumbing: sBTC minted to the pox-5 mock, signer-level rewards set
  // for (cycle, none), staker earned set per staker.
  function fundRewards(cycle, total, perStaker /* [[principal, sats], ...] */) {
    call("sbtc-token", "mint", [Cl.uint(total), P(`${D}.pox-5`)]);
    call("pox-5", "mock-set-signer-rewards", [P(MANAGER_ID), Cl.uint(cycle), Cl.none(), Cl.uint(total)]);
    for (const [s, sats] of perStaker)
      call("pox-5", "mock-set-staker-earned", [P(MANAGER_ID), Cl.uint(cycle), Cl.none(), P(s), Cl.uint(sats)]);
  }
  // Route liquidity. Real mainnet numbers observed 2026-09-19.
  function seedDlmm(bins = [[428, 3468263770n, 1183711n], [429, 6678826000n, 0n], [430, 6708202558n, 0n], [431, 5616035132n, 0n], [432, 6000000000n, 0n], [433, 6000000000n, 0n]]) {
    call("sbtc-token", "mint", [Cl.uint(10_000_000_000n), P(D)]);
    call("dlmm-pool-stx-sbtc-v-1-bps-15", "mock-set-active-bin", [Cl.int(-72)]);
    for (const [id, x, y] of bins) call("dlmm-pool-stx-sbtc-v-1-bps-15", "mock-set-bin", [Cl.uint(id), Cl.uint(x), Cl.uint(y)]);
  }
  function seedVelar(r0 = 199691979105n, r1 = 74436391n) {
    call("sbtc-token", "mint", [Cl.uint(r1), P(D)]);
    call("univ2-pool-v1_0_0-0070", "mock-seed", [Cl.uint(r0), Cl.uint(r1)]);
  }
  const sbtcBalance = (who) => num(ro("sbtc-token", "get-balance", [P(who)]).result);
  const stxBalance = (who) => BigInt(simnet.getAssetsMap().get("STX")?.get(who) ?? 0);

  return { simnet, accounts, w, call, ro, m, mro, P, fundRewards, seedDlmm, seedVelar, sbtcBalance, stxBalance };
}
