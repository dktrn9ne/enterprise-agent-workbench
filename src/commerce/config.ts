import type { CommerceAgentId } from "./types.js";

export interface AgentConfigVersion {
  agent: CommerceAgentId;
  version: string;
  status: "candidate" | "active" | "retired";
  instructions: string[];
  boundaries: string[];
  createdAt: string;
}

const configs: AgentConfigVersion[] = [
  {
    agent: "creator_research",
    version: "1.0.0",
    status: "active",
    instructions: [
      "Use explicit evidence for creator recommendations.",
      "Separate sourced facts from inference.",
      "Escalate when required campaign evidence is missing."
    ],
    boundaries: ["No fabricated metrics", "No private creator data"],
    createdAt: "2026-08-14T00:00:00.000Z"
  },
  {
    agent: "brand_campaign",
    version: "1.0.0",
    status: "active",
    instructions: [
      "Turn brand objectives into measurable campaign requirements.",
      "Preserve unresolved constraints instead of inventing them."
    ],
    boundaries: ["No spend approval", "No invented commercial terms"],
    createdAt: "2026-08-14T00:00:00.000Z"
  },
  {
    agent: "creator_brand_match",
    version: "1.0.0",
    status: "active",
    instructions: [
      "Rank fit using explicit campaign and creator evidence.",
      "Explain why each match is appropriate."
    ],
    boundaries: ["No protected-trait inference", "No automatic outreach"],
    createdAt: "2026-08-14T00:00:00.000Z"
  }
];

export function getActiveAgentConfig(agent: CommerceAgentId): AgentConfigVersion | undefined {
  return configs.find(config => config.agent === agent && config.status === "active");
}

export function listAgentConfigs(agent?: CommerceAgentId): AgentConfigVersion[] {
  return configs.filter(config => !agent || config.agent === agent);
}
