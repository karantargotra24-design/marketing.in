import { contentDraftSchema, contentRequestSchema, type ContentDraft, type ContentProvider } from "./schema";
import { mockProvider } from "./mockProvider";

export type AgentResult =
  | { ok: true; draft: ContentDraft; provider: string; isMock: boolean; ms: number }
  | { ok: false; error: string; provider: string };

/** Validates input, calls the provider, validates the output. Never throws; failures come back as data. */
export async function runContentWriter(input: unknown, provider: ContentProvider = mockProvider): Promise<AgentResult> {
  const req = contentRequestSchema.safeParse(input);
  if (!req.success) return { ok: false, error: req.error.issues[0].message, provider: provider.name };
  const started = Date.now();
  try {
    const raw = await provider.generate(req.data);
    const draft = contentDraftSchema.safeParse(raw);
    if (!draft.success) return { ok: false, error: "AI returned an unusable draft. Try again.", provider: provider.name };
    return { ok: true, draft: draft.data, provider: provider.name, isMock: provider.isMock, ms: Date.now() - started };
  } catch {
    return { ok: false, error: "The writer failed. Nothing was saved. Try again.", provider: provider.name };
  }
}
