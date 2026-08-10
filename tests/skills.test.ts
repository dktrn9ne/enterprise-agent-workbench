import test from "node:test";
import assert from "node:assert/strict";
import { customerEscalationSkill } from "../src/skills/escalation.js";

test("customer escalation creates reusable workflow outputs", async () => {
  const result = await customerEscalationSkill("Acme", "Avery", { actor: { id: "m", role: "manager" }, sessionId: "skill-test" });
  assert.equal(result.task.ok, true);
  assert.equal(result.draft.ok, true);
});
