export interface AuditEvent {
  timestamp: string;
  sessionId: string;
  actorId: string;
  event: "tool_requested" | "tool_executed" | "tool_blocked" | "approval_requested" | "approval_resolved";
  tool?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLog {
  private events: AuditEvent[] = [];

  record(event: Omit<AuditEvent, "timestamp">) {
    this.events.push({ ...event, timestamp: new Date().toISOString() });
  }

  all() { return [...this.events]; }
}
