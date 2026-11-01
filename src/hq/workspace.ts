import type { StorePort } from "./port";
import type { AgentId, Fact, KnowledgeBase } from "./types";

/**
 * The ONLY door through which an agent touches client data. A scope is bound to one client id
 * and one agent id at creation. It has no method that accepts a different client id, so an
 * agent cannot read or write another workspace (Part 7 / Part 11 rule 2).
 */
export class WorkspaceScope {
  constructor(private store: StorePort, readonly clientId: string, readonly agent: AgentId | "orchestrator", private allowedKbs: readonly KnowledgeBase[]) {}

  async facts(kb?: KnowledgeBase): Promise<Fact[]> {
    if (kb && !this.allowedKbs.includes(kb)) throw new Error(`Agent ${this.agent} has no permission for knowledge base "${kb}"`);
    const all = await this.store.listFacts(this.clientId);
    return all.filter((f) => (kb ? f.kb === kb : this.allowedKbs.includes(f.kb)));
  }
  async allowedFacts() { return this.facts(); }

  async saveOutput(name: string, body: string) {
    const rel = await this.store.saveOutput(this.clientId, name, body);
    await this.store.log({ clientId: this.clientId, actor: this.agent, action: "output.saved", detail: rel });
    return rel;
  }
  async readOutput(name: string) { return this.store.readOutput(this.clientId, name); }
  async log(action: string, detail: string) { await this.store.log({ clientId: this.clientId, actor: this.agent, action, detail }); }
}
