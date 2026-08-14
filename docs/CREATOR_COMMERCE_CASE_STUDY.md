# Gardening a Creator-Commerce Agent Fleet

## Product problem

Creator-commerce teams do not need a generic chatbot. They need bounded agents that understand who they serve, perform a specific job, delegate intentionally, and improve from evidence produced by real runs.

This case study extends Enterprise Agent Workbench with a small creator-commerce fleet and an **Agent Manager** responsible for quality, boundaries, delegation, drift, improvement routing, version control, and regression coverage.

## Fleet

| Agent | Customer need | Boundary |
| --- | --- | --- |
| Creator Research | Find relevant creators and support recommendations with evidence | Never invent audience/performance claims |
| Brand Campaign | Turn an objective into a measurable campaign brief | Never invent commercial terms or approve spend |
| Creator-Brand Match | Explain and rank creator-brand fit | No protected-trait inference, unsupported performance claims, or automatic outreach |
| Agent Manager | Keep the fleet pointed at useful work | Does not silently convert product ambiguity into agent autonomy |

## The gardening loop

1. **Understand the task contract** — customer, objective, constraints, and expected evidence are explicit.
2. **Run a versioned specialist** — each run is associated with an explicit agent configuration version.
3. **Persist the run history** — output, evidence, tool calls, delegation, boundary events, evaluation, and config version are stored together.
4. **Evaluate the run** — accuracy, usefulness, tone, evidence coverage, and boundary discipline are scored.
5. **Diagnose the failure** — failures are classified as prompt, knowledge, tool, delegation, product ambiguity, or human escalation problems.
6. **Route the improvement** — agent-side changes stay with the Agent Manager; capability gaps go to engineering; product ambiguity goes to product; unresolved decisions stay with human operations.
7. **Add regression coverage** — solved failures become reusable eval cases.
8. **Compare versions before promotion** — candidate configs should clear regression cases before becoming active.
9. **Watch for drift** — recent quality windows are compared with prior windows and a meaningful decline is surfaced.

## Versioned agent configurations

`src/commerce/config.ts` separates agent behavior from ad-hoc prompt edits. Each configuration has:

- agent ID
- semantic version
- lifecycle status: `candidate`, `active`, or `retired`
- explicit instructions
- explicit boundaries
- creation timestamp

This makes behavioral changes reviewable. Instead of saying "we changed the prompt," the team can say "creator-brand-match 1.1.0 is a candidate intended to improve evidence grounding without changing outreach boundaries."

A production promotion flow would be:

**candidate config → offline regression suite → shadow/limited traffic → quality comparison → active config**

## Run history

`src/commerce/history.ts` defines a storage contract for the evidence produced by each run. The current implementation is in-memory for portability, but the interface is designed to be replaced by a durable store.

Each stored entry ties together:

- the original agent run
- the resulting evaluation
- the exact config version that produced it

That link is important because quality drift is not actionable if the team cannot determine which behavior version caused it.

## Regression evals

`src/commerce/regression.ts` turns known failure modes into executable cases. The initial suite protects two behaviors:

1. A brand campaign with an undefined budget must **escalate instead of inventing a commercial constraint**.
2. Creator-brand matching with sufficient inputs must remain evidence-driven and avoid unnecessary product/human escalation.

Each case defines an agent, representative task, minimum score, and failure classifications that must or must not appear. The suite records the active config version used for the test, making eval results version-aware.

This creates a practical rule for agent gardening: **when a production failure is fixed, add a regression case before declaring it solved.**

## Why the routing matters

A weak agent program treats every bad output as a prompt problem. Production systems fail for different reasons. A missing API is an engineering problem. An undefined business rule is a product problem. A consequential decision with insufficient policy is a human-review problem. The Agent Manager's job is to distinguish these quickly and keep agents inside the shape where they are useful and trusted.

## Evaluation model

Each run produces a structured `EvaluationResult` with five dimensions:

- accuracy
- usefulness
- tone
- evidence coverage
- boundary discipline

The current evaluator is deterministic so the behavior is inspectable and testable. A production version could layer calibrated LLM-as-judge evaluations on top of deterministic checks, while retaining human review for high-impact decisions.

## Example failure

A brand asks for a creator campaign but provides no budget. The Brand Campaign Agent recognizes that the commercial constraint is missing, records a boundary event, and delegates to the Agent Manager rather than inventing a number. The evaluator classifies the run as product ambiguity plus human escalation. The improvement queue routes those issues to product and human operations instead of asking engineering to "make the model smarter."

That failure is now represented in the regression suite, so a later prompt or configuration change that stops escalating will fail evaluation before promotion.

## What I would measure in production

- task success rate by agent and workflow
- human acceptance / edit rate
- evidence-grounding rate
- boundary violation rate
- escalation precision and recall
- delegation success rate
- tool failure rate
- latency and cost per successful task
- quality score by agent/config version
- regression pass rate
- repeated failure frequency
- drift by agent, customer segment, and workflow

## Next production iteration

The next step would replace the in-memory history store with durable persistence, add candidate-config registration and promotion controls, build larger offline datasets from representative customer workflows, introduce calibrated LLM-as-judge dimensions where deterministic checks are insufficient, and connect improvement items to an issue or product-management system.
