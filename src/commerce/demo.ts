import { commerceAgents } from "./agents.js";
import { AgentManager } from "./manager.js";
import type { CommerceTask } from "./types.js";

const manager = new AgentManager();

const task: CommerceTask = {
  id: "campaign-001",
  customer: "brand",
  objective: "Find culturally aligned creators for a premium skincare launch and define a campaign brief.",
  constraints: ["US launch", "creator-led education", "no unsupported efficacy claims"],
  expectedSignals: ["brand fit", "audience relevance", "content quality", "prior campaign evidence"]
};

const campaignRun = commerceAgents.brand_campaign.run(task);
const campaignEval = manager.evaluate(task, campaignRun);

const matchRun = commerceAgents.creator_brand_match.run(task);
const matchEval = manager.evaluate(task, matchRun);

console.log(JSON.stringify({
  task,
  runs: [campaignRun, matchRun],
  evaluations: [campaignEval, matchEval],
  improvementQueue: [
    ...manager.triage(campaignRun, campaignEval),
    ...manager.triage(matchRun, matchEval)
  ]
}, null, 2));
