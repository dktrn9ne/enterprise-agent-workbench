export type CommerceAgentId =
  | "creator_research"
  | "brand_campaign"
  | "creator_brand_match"
  | "agent_manager";

export type FailureCategory =
  | "prompt_fix"
  | "knowledge_fix"
  | "tool_gap"
  | "delegation_gap"
  | "product_ambiguity"
  | "human_escalation";

export interface CommerceTask {
  id: string;
  customer: "brand" | "creator" | "internal";
  objective: string;
  constraints: string[];
  expectedSignals: string[];
}

export interface AgentRun {
  id: string;
  taskId: string;
  agent: CommerceAgentId;
  output: string;
  evidence: string[];
  delegatedTo: CommerceAgentId[];
  toolCalls: string[];
  boundaryEvents: string[];
  createdAt: string;
}

export interface EvaluationResult {
  runId: string;
  scores: {
    accuracy: number;
    usefulness: number;
    tone: number;
    evidence: number;
    boundaryDiscipline: number;
  };
  total: number;
  passed: boolean;
  failures: FailureCategory[];
  notes: string[];
}

export interface ImprovementItem {
  id: string;
  runId: string;
  agent: CommerceAgentId;
  category: FailureCategory;
  priority: "p0" | "p1" | "p2";
  owner: "agent_manager" | "engineering" | "product" | "human_ops";
  evidence: string;
  recommendation: string;
}
