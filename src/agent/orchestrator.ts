import Anthropic from "@anthropic-ai/sdk";
import type { AgentContext } from "../types.js";
import { InMemoryStateStore } from "../state/store.js";
import { invokeTool } from "../tools/registry.js";

const state = new InMemoryStateStore();

export class EnterpriseAgent {
  async run(prompt: string, ctx: AgentContext) {
    state.patch(ctx.sessionId, { lastPrompt: prompt });

    if (!process.env.ANTHROPIC_API_KEY || !process.env.CLAUDE_MODEL) {
      return this.mockPlan(prompt, ctx);
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: process.env.CLAUDE_MODEL,
      max_tokens: 700,
      system: "You are an enterprise workflow agent. Never claim an action succeeded unless a tool result confirms it. Consequential writes require human approval.",
      messages: [{ role: "user", content: prompt }]
    });
    const text = message.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    return { mode: "claude", response: text, state: state.get(ctx.sessionId) };
  }

  private async mockPlan(prompt: string, ctx: AgentContext) {
    const lower = prompt.toLowerCase();
    if (lower.includes("reimbursement")) {
      const docs = await invokeTool("search_docs", { query: "reimbursement expense approval" }, ctx);
      const attempted = await invokeTool("issue_reimbursement", { employeeId: ctx.actor.id, amount: 650, memo: "Travel expense" }, ctx);
      return { mode: "mock", response: "I checked the policy and stopped at the approval boundary instead of executing the financial action.", tools: { docs, attempted }, state: state.get(ctx.sessionId) };
    }
    const docs = await invokeTool("search_docs", { query: prompt }, ctx);
    return { mode: "mock", response: "I searched the relevant internal knowledge and returned evidence without taking a consequential action.", tools: { docs }, state: state.get(ctx.sessionId) };
  }
}
