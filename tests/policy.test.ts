import test from "node:test";
import assert from "node:assert/strict";
import { evaluatePolicy } from "../src/policy/engine.js";
import { invokeTool } from "../src/tools/registry.js";

test("employee cannot update employee records", () => {
  const decision = evaluatePolicy({ id: "u", role: "employee" }, "update_employee_record");
  assert.equal(decision.allowed, false);
});

test("finance reimbursement requires approval", () => {
  const decision = evaluatePolicy({ id: "u", role: "finance" }, "issue_reimbursement");
  assert.equal(decision.allowed, true);
  assert.equal(decision.approvalRequired, true);
});

test("high-risk action is blocked without approval", async () => {
  const result = await invokeTool("issue_reimbursement", { employeeId: "u", amount: 20, memo: "Taxi" }, { actor: { id: "f", role: "finance" }, sessionId: "test" });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /APPROVAL_REQUIRED/);
});

test("approved high-risk action executes", async () => {
  const result = await invokeTool("issue_reimbursement", { employeeId: "u", amount: 20, memo: "Taxi" }, { actor: { id: "f", role: "finance" }, sessionId: "test-2" }, true);
  assert.equal(result.ok, true);
});
