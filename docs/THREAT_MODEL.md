# Threat Model

This project treats an agent as a privileged software system, not as a trusted employee.

## Protected assets
- Employee and partner data
- Credentials and access tokens
- Financial actions
- Internal policy data
- Audit history

## Primary risks
1. Prompt injection causing unauthorized tool use.
2. Excessive tool permissions.
3. Hallucinated claims of successful actions.
4. Sensitive-data leakage into prompts or logs.
5. Autonomous consequential writes without review.
6. Cross-session state contamination.

## Controls demonstrated
- Role-based tool allowlists.
- Explicit approval gates on high-risk writes.
- Schema validation before tool execution.
- Audit logging for tool requests, blocks, approvals, and executions.
- Separation between read tools and consequential write tools.
- Agent system instruction prohibiting unverified success claims.

## Production extensions
A real deployment should add SSO/OIDC, per-user delegated credentials, encrypted persistent state, data-classification policies, secrets management, tamper-resistant logs, rate limits, sandboxing, red-team evals, and connector-specific authorization checks.
