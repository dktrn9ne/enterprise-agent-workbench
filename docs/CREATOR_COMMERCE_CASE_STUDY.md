# Gardening a Creator-Commerce Agent Fleet

## Product problem

Creator-commerce teams do not need a generic chatbot. They need bounded agents that understand who they serve, perform a specific job, delegate intentionally, and improve from evidence produced by real runs.

This case study extends Enterprise Agent Workbench with a small creator-commerce fleet and an **Agent Manager** responsible for quality, boundaries, delegation, drift, and improvement routing.

## Fleet

| Agent | Customer need | Boundary |
| --- | --- | --- |
| Creator Research | Find relevant creators and support recommendations with evidence | Never invent audience/performance claims |
| Brand Campaign | Turn an objective into a measurable campaign brief | Never invent commercial terms or approve spend |
| Creator-Brand Match | Explain and rank creator-brand fit | No protected-trait inference, unsupported performance claims, or automatic outreach |
| Agent Manager | Keep the fleet pointed at useful work | Does not silently convert product ambiguity into agent autonomy |

## The gardening loop

1. **Understand the task contract** — customer, objective, constraints, and expected evidence are explicit.
2. **Run the bounded specialist** — the agent produces output, evidence, tool-call history, delegation, and boundary events.
3. **Evaluate the run** — accuracy, usefulness, tone, evidence coverage, and boundary discipline are scored.
4. **Diagnose the failure** — failures are classified as prompt, knowledge, tool, delegation, product ambiguity, or human escalation problems.
5. **Route the improvement** — agent-side changes stay with the Agent Manager; capability gaps go to engineering; product ambiguity goes to product; unresolved decisions stay with human operations.
6. **Add regression coverage** — fixes should become eval cases so solved failures do not silently return.
7. **Watch for drift** — recent quality windows are compared with prior windows and a meaningful decline is surfaced.

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

## What I would measure in production

- task success rate by agent and workflow
- human acceptance / edit rate
- evidence-grounding rate
- boundary violation rate
- escalation precision and recall
- delegation success rate
- tool failure rate
- latency and cost per successful task
- quality score by prompt/version
- repeated failure frequency
- drift by agent, customer segment, and workflow

## Next iteration

The next production step would persist run histories, add versioned prompt/agent configurations, introduce offline eval datasets from representative workflows, compare candidate versions before promotion, and connect the improvement queue to an issue or product-management system.
