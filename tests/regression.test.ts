import assert from "node:assert/strict";
import test from "node:test";
import { getActiveAgentConfig, listAgentConfigs } from "../src/commerce/config.js";
import { InMemoryRunHistoryStore } from "../src/commerce/history.js";
import { runRegressionSuite } from "../src/commerce/regression.js";
import type { AgentRun, EvaluationResult } from "../src/commerce/types.js";

test("each specialist has an active versioned config", () => {
  for (const agent of ["creator_research", "brand_campaign", "creator_brand_match"] as const) {
    const config = getActiveAgentConfig(agent);
    assert.ok(config);
    assert.equal(config.status, "active");
    assert.match(config.version, /^\d+\.\d+\.\d+$/);
    assert.ok(listAgentConfigs(agent).length >= 1);
  }
});

test("run history stores evaluation and config version", async () => {
  const store = new InMemoryRunHistoryStore();
  const run: AgentRun = {
    id: "run-1",
    taskId: "task-1",
    agent: "creator_research",
    output: "Evidence-backed creator research output with sufficient detail for evaluation.",
    evidence: ["brand fit"],
    delegatedTo: [],
    toolCalls: ["creator_catalog.search"],
    boundaryEvents: [],
    createdAt: new Date().toISOString()
  };
  const evaluation: EvaluationResult = {
    runId: run.id,
    scores: { accuracy: 1, usefulness: 1, tone: 1, evidence: 1, boundaryDiscipline: 1 },
    total: 1,
    passed: true,
    failures: [],
    notes: []
  };

  await store.save({ run, evaluation, configVersion: "1.0.0" });
  const history = await store.list("creator_research");

  assert.equal(history.length, 1);
  assert.equal(history[0].configVersion, "1.0.0");
  assert.equal(history[0].evaluation?.passed, true);
});

test("known regression cases pass against active configs", () => {
  const results = runRegressionSuite();
  assert.ok(results.length >= 2);
  assert.equal(results.every(result => result.passed), true, JSON.stringify(results, null, 2));
  assert.equal(results.every(result => Boolean(result.configVersion)), true);
});
