import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v3";
import { invokeTool } from "../tools/registry.js";
import type { AgentContext } from "../types.js";

const server = new McpServer({ name: "enterprise-agent-workbench", version: "0.1.0" });
const ctx: AgentContext = { actor: { id: "mcp-user", role: "manager" }, sessionId: "mcp-session" };

server.registerTool("search_docs", {
  description: "Search mock enterprise policy and operations documents.",
  inputSchema: { query: z.string().min(1) }
}, async ({ query }) => ({ content: [{ type: "text", text: JSON.stringify(await invokeTool("search_docs", { query }, ctx), null, 2) }] }));

server.registerTool("search_people", {
  description: "Search the mock employee directory.",
  inputSchema: { query: z.string().min(1) }
}, async ({ query }) => ({ content: [{ type: "text", text: JSON.stringify(await invokeTool("search_people", { query }, ctx), null, 2) }] }));

server.registerTool("create_task", {
  description: "Create a mock project-management task.",
  inputSchema: { title: z.string(), owner: z.string(), priority: z.enum(["low", "medium", "high"]) }
}, async (args) => ({ content: [{ type: "text", text: JSON.stringify(await invokeTool("create_task", args, ctx), null, 2) }] }));

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("enterprise-agent-workbench MCP server listening on stdio");
