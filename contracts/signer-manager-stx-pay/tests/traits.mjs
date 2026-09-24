// Trait conformance: the manager passed as a trait argument to a copy of the
// spox reward-claim-registry trait (structural check at call time), then the
// registry's two calls (claim-rewards pull, claim-staker-rewards) for an sBTC
// staker and for an STX elector.
import { Cl } from "@stacks/transactions";
import { boot, check, eq, summary, isOk, okVal, errCode, MANAGER_ID, D } from "./harness.mjs";
const t = await boot();
const { w, call, m, mro, P, fundRewards, seedDlmm, seedVelar, stxBalance } = t;
const [w1, w2, w5] = [1, 2, 5].map(w);
const T = "reward-claim-trait-check";
seedDlmm(); seedVelar();
m("set-converter", [P(w5), Cl.bool(true)]);
let r = call(T, "conforms", [P(MANAGER_ID)], w5);
check("manager conforms to reward-claim-signer-manager-trait", isOk(r), Cl.prettyPrint(r.result));
fundRewards(300, 1_000_000, [[w1, 600_000], [w2, 400_000]]);
m("set-stx-payout", [Cl.bool(true)], w2);
r = call(T, "pull", [P(MANAGER_ID), Cl.uint(300)], w5);
check("registry-style claim-rewards pull ok", isOk(r) && Cl.prettyPrint(r.result).includes("total-rewards: u1000000"), Cl.prettyPrint(r.result));
r = call(T, "claim", [P(MANAGER_ID), P(w1), Cl.uint(300)], w5);
check("registry-style claim for sBTC staker pays", isOk(r) && Cl.prettyPrint(r.result).includes("earned: u600000"), Cl.prettyPrint(r.result));
r = call(T, "claim", [P(MANAGER_ID), P(w2), Cl.uint(300)], w5);
check("registry-style claim for STX elector settles into the epoch, pays nothing yet", isOk(r) && Cl.prettyPrint(r.result).includes("withdrawal-request: none"), Cl.prettyPrint(r.result));
const pend = Cl.prettyPrint(mro("get-stx-pending", [P(w2)]).result);
check("STX elector has stx-pending after registry claim", pend.includes("sats: u400000"), pend);
// operator converts, then the next registry installment pays the STX
check("convert ok", isOk(m("convert", [Cl.uint(400_000), Cl.uint(1)], w5)));
fundRewards(301, 1_000, [[w2, 1_000]]);
call(T, "pull", [P(MANAGER_ID), Cl.uint(301)], w5);
const b = stxBalance(w2);
r = call(T, "claim", [P(MANAGER_ID), P(w2), Cl.uint(301)], w5);
check("next installment pays converted STX through claim-staker-rewards", isOk(r) && stxBalance(w2) > b, Cl.prettyPrint(r.result));
// the two withdrawal functions reach the manager through the trait (u1008: unknown request id)
eq("settle-accepted-withdrawal via trait reaches the manager (u1008)", errCode(call(T, "settle-via-trait", [P(MANAGER_ID), Cl.uint(1)], w5)), 1008n);
eq("reclaim-failed-withdrawal via trait reaches the manager (u1008)", errCode(call(T, "reclaim-via-trait", [P(MANAGER_ID), Cl.uint(1)], w5)), 1008n);
summary();
