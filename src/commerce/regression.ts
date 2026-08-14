import { commerceAgents } from "./agents.js";
import { getActiveAgentConfig } from "./config.js";
import { AgentManager } from "./manager.js";
import type { CommerceAgentId, CommerceTask, EvaluationResult } from "./types.js";

export interface RegressionCase {
  id: string;
  agent: Exclude<CommerceAgentId, "agent_manager">;
  task: CommerceTask;
  mustIncludeFailures?: string[];
  mustNotIncludeFailures?: string[];
  minimumScore: number;
}

export interface RegressionResult {
  caseId: string;
  agent: CommerceAgentId;
  configVersion?: string;
  evaluation: EvaluationResult;
  passed: boolean;
  reasons: string[];
}

export const regressionCases: RegressionCase[] = [
  {
    id: "missing-budget-escalates",
    agent: "brand_campaign",
    task: {
      id: "reg-brand-001",
      customer: "brand",
      objective: "Create a creator launch campaign",
      constraints: ["US launch"],
      expectedSignals: []
    },
    mustIncludeFailures: ["product_ambiguity", "human_escalation"],
    minimumScore: 0.7
  },
  {
    id: "creator-match-stays-evidence-driven",
    agent: "creator_brand_match",
    task: {
      id: "reg-match-001",
      customer: "brand",
      objective: "Rank creators for a premium beauty campaign",
      constraints: ["budget: $50k", "US only"],
      expectedSignals: ["brand fit", "content quality"]
    },
    mustNotIncludeFailures: ["product_ambiguity", "human_escalation"],
    minimumScore: 0.8
  }
];

export function runRegressionSuite(cases = regressionCases): RegressionResult[] {
  const manager = new AgentManager();

  return cases.map(testCase => {
    const run = commerceAgents[testCase.agent].run(testCase.task);
    const evaluation = manager.evaluate(testCase.task, run);
    const reasons: string[] = [];

    for (const failure of testCase.mustIncludeFailures ?? []) {
      if (!evaluation.failures.includes(failure as never)) reasons.push(`Expected failure classification missing: ${failure}`);
    }

    for (const failure of testCase.mustNotIncludeFailures ?? []) {
      if (evaluation.failures.includes(failure as never)) reasons.push(`Unexpected failure classification: ${failure}`);
    }

    if (evaluation.total < testCase.minimumScore) {
      reasons.push(`Score ${evaluation.total.toFixed(2)} below minimum ${testCase.minimumScore.toFixed(2)}`);
    }

    return {
      caseId: testCase.id,
      agent: testCase.agent,
      configVersion: getActiveAgentConfig(testCase.agent)?.version,
      evaluation,
      passed: reasons.length === 0,
      reasons
    };
  });
}
