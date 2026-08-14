import assert from "node:assert/strict";
import test from "node:test";
import { brandCampaignAgent } from "../src/commerce/agents.js";
import { AgentManager } from "../src/commerce/manager.js";
import type { CommerceTask, EvaluationResult } from "../src/commerce/types.js";

const manager = new AgentManager();

const task: CommerceTask = {
  id: "test-campaign",
  customer: "brand",
  objective: "Build a creator campaign brief",
  constraints: ["US only"],
  expectedSignals: ["brand fit", "content quality"]
};

test("manager routes unresolved campaign constraints instead of letting an agent guess", () => {
  const run = brandCampaignAgent.run(task);
  const evaluation = manager.evaluate(task, run);
  const queue = manager.triage(run, evaluation);

  assert.ok(run.boundaryEvents.length > 0);
  assert.ok(run.delegatedTo.includes("agent_manager"));
  assert.ok(evaluation.failures.includes("product_ambiguity"));
  assert.ok(queue.some(item => item.owner === "product"));
  assert.ok(queue.some(item => item.owner === "human_ops"));
});

test("manager detects meaningful quality drift across recent run windows", () => {
  const result = (runId: string, total: number): EvaluationResult => ({
    runId,
    scores: { accuracy: total, usefulness: total, tone: total, evidence: total, boundaryDiscipline: total },
    total,
    passed: total >= 0.8,
    failures: [],
    notes: []
  });

  const history = [
    result("1", 0.94), result("2", 0.92), result("3", 0.91),
    result("4", 0.78), result("5", 0.76), result("6", 0.74)
  ];

  const drift = manager.detectDrift(history);
  assert.equal(drift.drifting, true);
  assert.ok(drift.delta < -0.1);
});
