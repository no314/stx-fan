import { initSimnet } from "@stacks/clarinet-sdk";
const simnet = await initSimnet("./Clarinet.toml", true, { trackCosts: true, trackCoverage: false });
const ifaces = simnet.getContractsInterfaces();
for (const [k, v] of ifaces) if (k.includes("signer-manager-stx-payout")) console.log(k, "functions:", v.functions.length);
