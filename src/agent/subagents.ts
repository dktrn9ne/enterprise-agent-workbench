import type { AgentContext } from "../types.js";
import { evaluatePolicy } from "../policy/engine.js";
import { invokeTool } from "../tools/registry.js";

export const policyGuard = {
  name: "policy_guard",
  review(ctx: AgentContext, tool: string) { return evaluatePolicy(ctx.actor, tool); }
};

export const researchAssistant = {
  name: "research_assistant",
  async gather(ctx: AgentContext, query: string) {
    const [docs, people] = await Promise.all([
      invokeTool("search_docs", { query }, ctx),
      invokeTool("search_people", { query }, ctx)
    ]);
    return { docs, people };
  }
};
