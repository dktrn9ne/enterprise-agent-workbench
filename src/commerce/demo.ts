import { commerceAgents } from "./agents.js";
import { getActiveAgentConfig } from "./config.js";
import { InMemoryRunHistoryStore } from "./history.js";
import { AgentManager } from "./manager.js";
import { runRegressionSuite } from "./regression.js";
import type { CommerceTask } from "./types.js";

const manager = new AgentManager();
const history = new InMemoryRunHistoryStore();

const task: CommerceTask = {
  id: "campaign-001",
  customer: "brand",
  objective: "Find culturally aligned creators for a premium skincare launch and define a campaign brief.",
  constraints: ["US launch", "creator-led education", "no unsupported efficacy claims"],
  expectedSignals: ["brand fit", "audience relevance", "content quality", "prior campaign evidence"]
};

const campaignRun = commerceAgents.brand_campaign.run(task);
const campaignEval = manager.evaluate(task, campaignRun);
await history.save({
  run: campaignRun,
  evaluation: campaignEval,
  configVersion: getActiveAgentConfig(campaignRun.agent)?.version
});

const matchRun = commerceAgents.creator_brand_match.run(task);
const matchEval = manager.evaluate(task, matchRun);
await history.save({
  run: matchRun,
  evaluation: matchEval,
  configVersion: getActiveAgentConfig(matchRun.agent)?.version
});

console.log(JSON.stringify({
  task,
  runs: [campaignRun, matchRun],
  evaluations: [campaignEval, matchEval],
  runHistory: await history.list(),
  improvementQueue: [
    ...manager.triage(campaignRun, campaignEval),
    ...manager.triage(matchRun, matchEval)
  ],
  regressionSuite: runRegressionSuite()
}, null, 2));
