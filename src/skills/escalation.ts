import type { AgentContext } from "../types.js";
import { invokeTool } from "../tools/registry.js";

export async function customerEscalationSkill(account: string, owner: string, context: AgentContext) {
  const policy = await invokeTool("search_docs", { query: "customer escalation critical" }, context);
  const task = await invokeTool("create_task", { title: `Critical escalation: ${account}`, owner, priority: "high" }, context);
  const draft = await invokeTool("draft_message", {
    channel: "#customer-escalations",
    audience: "Customer Success",
    body: `Critical escalation opened for ${account}. Owner: ${owner}. Human review required before sending.`
  }, context);
  return { policy, task, draft };
}
