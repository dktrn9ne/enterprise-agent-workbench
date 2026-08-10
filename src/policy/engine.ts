import type { Actor, RiskLevel } from "../types.js";

const allowed: Record<Actor["role"], string[]> = {
  employee: ["search_people", "search_docs", "create_task"],
  manager: ["search_people", "search_docs", "create_task", "draft_message"],
  hr: ["search_people", "search_docs", "create_task", "draft_message", "update_employee_record"],
  finance: ["search_docs", "create_task", "draft_message", "issue_reimbursement"],
  admin: ["*"]
};

export interface PolicyDecision {
  allowed: boolean;
  approvalRequired: boolean;
  risk: RiskLevel;
  reason: string;
}

export function evaluatePolicy(actor: Actor, tool: string): PolicyDecision {
  const roleAllowed = allowed[actor.role].includes("*") || allowed[actor.role].includes(tool);
  if (!roleAllowed) {
    return { allowed: false, approvalRequired: false, risk: "high", reason: `Role ${actor.role} may not call ${tool}.` };
  }
  const highRisk = ["update_employee_record", "issue_reimbursement"].includes(tool);
  return {
    allowed: true,
    approvalRequired: highRisk,
    risk: highRisk ? "high" : "low",
    reason: highRisk ? "Consequential write action requires human approval." : "Permitted low-risk action."
  };
}
