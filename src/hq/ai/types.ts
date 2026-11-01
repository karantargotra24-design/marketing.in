import { RecoverableError } from "../errors";

export type Usage = { inputTokens: number; outputTokens: number; cacheReadTokens: number };
export type LlmRequest = { model: string; system: string; user: string; maxTokens: number };
export type LlmResponse = { text: string; usage: Usage; model: string; stopReason?: string };

/** One interface for every model vendor. `isMock` providers never spend money. */
export interface LlmProvider {
  readonly id: string;
  readonly isMock: boolean;
  complete(req: LlmRequest): Promise<LlmResponse>;
}

export class BudgetExceededError extends Error { constructor(readonly scope: "run" | "daily" | "monthly", msg: string) { super(msg); } }
export class AiDisabledError extends Error {}
export class AiRefusalError extends Error {}
export class InvalidAiOutputError extends Error {}
export { RecoverableError };
