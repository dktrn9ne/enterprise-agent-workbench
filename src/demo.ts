import { EnterpriseAgent } from "./agent/orchestrator.js";
import { audit } from "./tools/registry.js";

const agent = new EnterpriseAgent();
const context = { actor: { id: "u-204", role: "finance" as const }, sessionId: "demo-session" };

const result = await agent.run("Please issue my $650 travel reimbursement and tell me the policy.", context);
console.log(JSON.stringify(result, null, 2));
console.log("\nAUDIT TRAIL\n", JSON.stringify(audit.all(), null, 2));
