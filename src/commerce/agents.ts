import type { AgentRun, CommerceAgentId, CommerceTask } from "./types.js";

interface AgentDefinition {
  id: CommerceAgentId;
  purpose: string;
  boundaries: string[];
  run(task: CommerceTask): AgentRun;
}

function makeRun(
  agent: CommerceAgentId,
  task: CommerceTask,
  output: string,
  evidence: string[],
  delegatedTo: CommerceAgentId[] = [],
  toolCalls: string[] = [],
  boundaryEvents: string[] = []
): AgentRun {
  return {
    id: `${agent}-${task.id}`,
    taskId: task.id,
    agent,
    output,
    evidence,
    delegatedTo,
    toolCalls,
    boundaryEvents,
    createdAt: new Date().toISOString()
  };
}

export const creatorResearchAgent: AgentDefinition = {
  id: "creator_research",
  purpose: "Turn a brand brief into evidence-backed creator research without inventing audience or performance claims.",
  boundaries: ["No fabricated metrics", "No private creator data", "Separate evidence from inference"],
  run(task) {
    return makeRun(
      this.id,
      task,
      `Creator research prepared for: ${task.objective}. Recommendations must be supported by supplied campaign and creator evidence.`,
      task.expectedSignals,
      [],
      ["creator_catalog.search", "campaign_history.read"]
    );
  }
};

export const brandCampaignAgent: AgentDefinition = {
  id: "brand_campaign",
  purpose: "Translate a brand objective into a measurable creator campaign brief and flag unresolved product ambiguity.",
  boundaries: ["Do not approve spend", "Do not invent campaign constraints", "Escalate missing commercial terms"],
  run(task) {
    const missingBudget = !task.constraints.some(c => c.toLowerCase().includes("budget"));
    return makeRun(
      this.id,
      task,
      `Campaign brief for: ${task.objective}. Success signals: ${task.expectedSignals.join(", ")}.`,
      task.constraints,
      missingBudget ? ["agent_manager"] : [],
      ["brand_profile.read"],
      missingBudget ? ["missing_budget_requires_product_or_human_clarification"] : []
    );
  }
};

export const creatorBrandMatchAgent: AgentDefinition = {
  id: "creator_brand_match",
  purpose: "Rank creator-brand fit using explicit evidence and explain why a match is appropriate.",
  boundaries: ["No demographic inference from protected traits", "No unsupported performance claims", "No automatic outreach"],
  run(task) {
    return makeRun(
      this.id,
      task,
      `Match analysis for: ${task.objective}. Fit should be ranked using campaign requirements, creator evidence, and prior outcomes.`,
      task.expectedSignals,
      ["creator_research"],
      ["creator_catalog.search", "campaign_history.read"]
    );
  }
};

export const commerceAgents = {
  creator_research: creatorResearchAgent,
  brand_campaign: brandCampaignAgent,
  creator_brand_match: creatorBrandMatchAgent
};
