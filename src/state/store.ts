export interface SessionState {
  id: string;
  memory: Record<string, unknown>;
  updatedAt: string;
}

export class InMemoryStateStore {
  private sessions = new Map<string, SessionState>();

  get(id: string): SessionState {
    const existing = this.sessions.get(id);
    if (existing) return existing;
    const created = { id, memory: {}, updatedAt: new Date().toISOString() };
    this.sessions.set(id, created);
    return created;
  }

  patch(id: string, values: Record<string, unknown>): SessionState {
    const current = this.get(id);
    const next = {
      ...current,
      memory: { ...current.memory, ...values },
      updatedAt: new Date().toISOString()
    };
    this.sessions.set(id, next);
    return next;
  }
}
