import type { AgentRun, CommerceTask, EvaluationResult, FailureCategory, ImprovementItem } from "./types.js";

const clamp = (score: number) => Math.max(0, Math.min(1, score));

export class AgentManager {
  evaluate(task: CommerceTask, run: AgentRun): EvaluationResult {
    const notes: string[] = [];
    const failures = new Set<FailureCategory>();

    const evidenceCoverage = task.expectedSignals.length === 0
      ? 1
      : run.evidence.filter(item => task.expectedSignals.includes(item)).length / task.expectedSignals.length;

    if (evidenceCoverage < 0.75) {
      failures.add("knowledge_fix");
      notes.push("Expected evidence is under-covered; inspect retrieval context or source quality.");
    }

    if (run.boundaryEvents.length > 0) {
      failures.add("product_ambiguity");
      notes.push(`Boundary event: ${run.boundaryEvents.join(", ")}`);
    }

    if (run.delegatedTo.includes("agent_manager")) {
      failures.add("human_escalation");
      notes.push("Agent correctly stopped and escalated rather than guessing through an unresolved constraint.");
    }

    if (run.output.trim().length < 60) {
      failures.add("prompt_fix");
      notes.push("Output is too thin to be useful; tighten task contract and response requirements.");
    }

    const scores = {
      accuracy: clamp(evidenceCoverage),
      usefulness: clamp(run.output.length / 180),
      tone: 1,
      evidence: clamp(evidenceCoverage),
      boundaryDiscipline: run.boundaryEvents.length > 0 && !run.delegatedTo.includes("agent_manager") ? 0.4 : 1
    };

    const total = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    return {
      runId: run.id,
      scores,
      total,
      passed: total >= 0.8 && !failures.has("tool_gap"),
      failures: [...failures],
      notes
    };
  }

  triage(run: AgentRun, evaluation: EvaluationResult): ImprovementItem[] {
    return evaluation.failures.map((category, index) => {
      const routing = this.route(category);
      return {
        id: `${run.id}-improvement-${index + 1}`,
        runId: run.id,
        agent: run.agent,
        category,
        priority: evaluation.total < 0.6 ? "p0" : evaluation.passed ? "p2" : "p1",
        owner: routing.owner,
        evidence: evaluation.notes[index] ?? `Evaluation score: ${evaluation.total.toFixed(2)}`,
        recommendation: routing.recommendation
      };
    });
  }

  detectDrift(history: EvaluationResult[], window = 3): { drifting: boolean; delta: number } {
    if (history.length < window * 2) return { drifting: false, delta: 0 };
    const previous = history.slice(-window * 2, -window);
    const current = history.slice(-window);
    const avg = (items: EvaluationResult[]) => items.reduce((sum, item) => sum + item.total, 0) / items.length;
    const delta = avg(current) - avg(previous);
    return { drifting: delta <= -0.1, delta };
  }

  private route(category: FailureCategory): Pick<ImprovementItem, "owner" | "recommendation"> {
    switch (category) {
      case "prompt_fix":
      case "knowledge_fix":
      case "delegation_gap":
        return { owner: "agent_manager", recommendation: "Revise the agent contract, context, or delegation shape and add a regression eval." };
      case "tool_gap":
        return { owner: "engineering", recommendation: "Define the missing capability and route a tool/integration requirement to engineering." };
      case "product_ambiguity":
        return { owner: "product", recommendation: "Resolve the underlying product or customer ambiguity before expanding agent autonomy." };
      case "human_escalation":
        return { owner: "human_ops", recommendation: "Keep a human decision point until the business rule is explicit and safely automatable." };
    }
  }
}
