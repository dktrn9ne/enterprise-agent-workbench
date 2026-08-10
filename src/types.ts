export type RiskLevel = "low" | "medium" | "high";

export interface Actor {
  id: string;
  role: "employee" | "manager" | "hr" | "finance" | "admin";
}

export interface AgentContext {
  actor: Actor;
  sessionId: string;
}

export interface ToolResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export interface ApprovalRequest {
  id: string;
  tool: string;
  reason: string;
  risk: RiskLevel;
  arguments: Record<string, unknown>;
  status: "pending" | "approved" | "denied";
}
