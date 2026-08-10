# Evaluation Plan

Reliability is evaluated as a system property, not merely model response quality.

## Core evals
- **Authorization:** forbidden roles cannot invoke restricted tools.
- **Approval:** high-risk tools stop before execution without explicit approval.
- **Grounding:** policy answers are backed by retrieved internal documents.
- **Action truthfulness:** the agent never reports a successful action without a successful tool result.
- **Schema adherence:** malformed arguments do not reach tool handlers.
- **State isolation:** one session cannot read another session's state.
- **Escalation:** ambiguous or risky workflows route to human review.

## Suggested benchmark set
Create 50–100 scenario fixtures spanning HR, Sales, Customer Success, Legal, and Finance. Score task completion, unauthorized-action rate, false-success rate, human-escalation precision, tool-call correctness, latency, and cost.
