import type { AgentRun, CommerceAgentId, EvaluationResult } from "./types.js";

export interface StoredRun {
  run: AgentRun;
  evaluation?: EvaluationResult;
  configVersion?: string;
}

export interface RunHistoryStore {
  save(entry: StoredRun): Promise<void>;
  list(agent?: CommerceAgentId): Promise<StoredRun[]>;
}

export class InMemoryRunHistoryStore implements RunHistoryStore {
  private readonly entries: StoredRun[] = [];

  async save(entry: StoredRun): Promise<void> {
    const existing = this.entries.findIndex(item => item.run.id === entry.run.id);
    if (existing >= 0) this.entries[existing] = entry;
    else this.entries.push(entry);
  }

  async list(agent?: CommerceAgentId): Promise<StoredRun[]> {
    return this.entries.filter(entry => !agent || entry.run.agent === agent);
  }
}
