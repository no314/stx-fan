// Testnet batch sizing bench (NOT RUN in this session: the build sandbox has no route to any
// Stacks API and no funded key). Submits settle-many at the given sizes against a deployed
// manager and records inclusion latency (blocks and seconds) from the Hiro API.
//
//   TESTNET_KEY=<hex privkey> node scripts/testnet-batch-bench.mjs ST...deployer 25 50 100 200
//
// Preconditions: stakers registered on testnet pox-5 with earned rewards, and claim-rewards
// pulled for the cycle. Entries are read from entries.json: [{staker, cycle, bond}] .
import { makeContractCall, broadcastTransaction, Cl, PostConditionMode, AnchorMode } from "@stacks/transactions";
import { readFileSync } from "node:fs";
const API = process.env.STACKS_API ?? "https://api.testnet.hiro.so";
const [deployer, ...sizes] = process.argv.slice(2);
const key = process.env.TESTNET_KEY;
if (!deployer || !key || sizes.length === 0) throw new Error("usage: TESTNET_KEY=... node scripts/testnet-batch-bench.mjs ST... 25 50 100 200");
const entries = JSON.parse(readFileSync("entries.json", "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function tip() { const j = await (await fetch(`${API}/v2/info`)).json(); return { stacks: j.stacks_tip_height, burn: j.burn_block_height }; }
for (const n of sizes.map(Number)) {
  const batch = entries.slice(0, n).map((e) => Cl.tuple({ staker: Cl.principal(e.staker), "reward-cycle": Cl.uint(e.cycle), "bond-index": e.bond == null ? Cl.none() : Cl.some(Cl.uint(e.bond)) }));
  const tx = await makeContractCall({ contractAddress: deployer, contractName: "signer-manager-stx-payout", functionName: "settle-many", functionArgs: [Cl.list(batch)], senderKey: key, network: "testnet", postConditionMode: PostConditionMode.Allow, anchorMode: AnchorMode.Any, fee: 50000n });
  const t0 = Date.now(); const h0 = await tip();
  const res = await broadcastTransaction({ transaction: tx, network: "testnet" });
  const txid = res.txid ?? res;
  console.log(`n=${n} broadcast ${txid} at stacks ${h0.stacks} burn ${h0.burn}`);
  for (;;) {
    await sleep(10000);
    const j = await (await fetch(`${API}/extended/v1/tx/0x${String(txid).replace(/^0x/, "")}`)).json();
    if (j.tx_status === "success" || String(j.tx_status).startsWith("abort")) {
      const h1 = await tip();
      console.log(`n=${n} ${j.tx_status} in ${(Date.now() - t0) / 1000}s, +${j.block_height - h0.stacks} stacks blocks, burn ${j.burn_block_height} (+${j.burn_block_height - h0.burn}); execution_cost reads=${j.execution_cost_read_count} read_len=${j.execution_cost_read_length} writes=${j.execution_cost_write_count} runtime=${j.execution_cost_runtime}`);
      break;
    }
  }
}
