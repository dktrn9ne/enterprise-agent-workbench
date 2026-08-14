import { z } from "zod";
import type { AgentContext, ToolResult } from "../types.js";
import { evaluatePolicy } from "../policy/engine.js";
import { AuditLog } from "../observability/audit.js";
import { people, docs } from "./data.js";

export type ToolDefinition = {
  name: string;
  description: string;
  schema: z.ZodTypeAny;
  execute: (args: any, ctx: AgentContext) => Promise<ToolResult>;
};

export const audit = new AuditLog();

const rawTools: ToolDefinition[] = [
  {
    name: "search_people",
    description: "Search the mock employee directory by name or team.",
    schema: z.object({ query: z.string().min(1) }),
    async execute({ query }) {
      const q = query.toLowerCase();
      return { ok: true, data: people.filter(p => `${p.name} ${p.team}`.toLowerCase().includes(q)) };
    }
  },
  {
    name: "search_docs",
    description: "Search internal policy and operations documents.",
    schema: z.object({ query: z.string().min(1) }),
    async execute({ query }) {
      const terms = query.toLowerCase().split(/\s+/);
      return { ok: true, data: docs.filter(d => terms.some((t: string) => `${d.title} ${d.text}`.toLowerCase().includes(t))) };
    }
  },
  {
    name: "create_task",
    description: "Create a mock project-management task.",
    schema: z.object({ title: z.string(), owner: z.string(), priority: z.enum(["low", "medium", "high"]) }),
    async execute(args) { return { ok: true, data: { id: `task-${Date.now()}`, ...args, status: "open" } }; }
  },
  {
    name: "draft_message",
    description: "Draft a message for a human to review before sending.",
    schema: z.object({ channel: z.string(), audience: z.string(), body: z.string() }),
    async execute(args) { return { ok: true, data: { ...args, status: "draft" } }; }
  },
  {
    name: "update_employee_record",
    description: "Update a mock employee record. Consequential write requiring approval.",
    schema: z.object({ employeeId: z.string(), field: z.string(), value: z.string() }),
    async execute(args) { return { ok: true, data: { ...args, updated: true } }; }
  },
  {
    name: "issue_reimbursement",
    description: "Issue a mock employee reimbursement. Consequential financial action requiring approval.",
    schema: z.object({ employeeId: z.string(), amount: z.number().positive(), memo: z.string() }),
    async execute(args) { return { ok: true, data: { ...args, reimbursementId: `reimb-${Date.now()}` } }; }
  }
];

export const tools = new Map(rawTools.map(t => [t.name, t]));

export async function invokeTool(name: string, args: unknown, ctx: AgentContext, approved = false): Promise<ToolResult> {
  const tool = tools.get(name);
  if (!tool) return { ok: false, error: `Unknown tool: ${name}` };
  audit.record({ sessionId: ctx.sessionId, actorId: ctx.actor.id, event: "tool_requested", tool: name, metadata: { args } });
  const policy = evaluatePolicy(ctx.actor, name);
  if (!policy.allowed) {
    audit.record({ sessionId: ctx.sessionId, actorId: ctx.actor.id, event: "tool_blocked", tool: name, metadata: { reason: policy.reason } });
    return { ok: false, error: policy.reason };
  }
  if (policy.approvalRequired && !approved) {
    audit.record({ sessionId: ctx.sessionId, actorId: ctx.actor.id, event: "approval_requested", tool: name, metadata: { reason: policy.reason } });
    return { ok: false, error: `APPROVAL_REQUIRED: ${policy.reason}` };
  }
  const parsed = tool.schema.safeParse(args);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const result = await tool.execute(parsed.data, ctx);
  audit.record({ sessionId: ctx.sessionId, actorId: ctx.actor.id, event: "tool_executed", tool: name, metadata: { ok: result.ok } });
  return result;
}
