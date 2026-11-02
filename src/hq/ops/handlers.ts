import { z } from "zod";
import { AGENTS } from "../agents/registry";
import { makeContext } from "../agents/base";
import type { AiEngine, GenMeta } from "../ai/engine";
import type { StorePort } from "../port";
import { WorkspaceScope } from "../workspace";
import type { AgentId, AgentOutput, Client, Deliverable, Fact, QaIssueRec, Run, Task } from "../types";
import { braveSearch, fetchPage, pageObservations, type Resolver } from "../tools/web";
import { qaAdPlan, qaContentItem, qaCreativeBrief } from "./claims";
import { adPlanSchema, contentItemSchema, creativeBatchSchema, creativeBriefSchema, reelScriptsSchema, sectionsSchema, strategySchema, type AdPlanBody, type ContentItemBody, type CreativeBriefBody, type SectionsBody, type StrategyBody } from "./schemas";

/** Thrown when a step needs generation but AI is off. The task waits for input instead of faking output. */
export class NeedsAiError extends Error {}
export type OpsResult = { status: "COMPLETED" | "WAITING FOR INPUT"; note?: string; meta: GenMeta | null; deliverableIds: string[] };
export type OpsCtx = { store: StorePort; ai?: AiEngine; client: Client; run: Run; task: Task; tools?: { fetchImpl?: typeof fetch; resolver?: Resolver; env?: Record<string, string | undefined> } };

const sumMeta = (ms: GenMeta[]): GenMeta | null => (ms.length ? ms.reduce((a, m) => ({ ...a, calls: a.calls + m.calls, inputTokens: a.inputTokens + m.inputTokens, outputTokens: a.outputTokens + m.outputTokens, costUsd: a.costUsd + m.costUsd })) : null);
const scopeFacts = (c: OpsCtx, agent: AgentId) => new WorkspaceScope(c.store, c.client.id, agent, AGENTS[agent].knowledgePermissions).allowedFacts();
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n) + "…" : s);

async function latestBody<T>(c: OpsCtx, d: Deliverable): Promise<T> {
  const got = await c.store.getDeliverable(c.client.id, d.id);
  return got!.versions[got!.versions.length - 1].body as T;
}
async function runDeliverables(c: OpsCtx, kind?: string) { return c.store.listDeliverables({ clientId: c.client.id, runId: c.run.id, kind }); }
const save = (c: OpsCtx, kind: string, title: string, agent: string, body: unknown, status: Deliverable["status"] = "draft") =>
  c.store.createDeliverable({ id: c.store.newId("dlv"), clientId: c.client.id, runId: c.run.id, taskId: c.task.id, kind, title, agent, status, qa: null }, body, agent);

/** Drops fact references the model invented; keeps only ids that exist in this client's context. */
function ground<T extends { factIds?: string[] }>(rows: T[], valid: Set<string>): T[] { return rows.map((r) => (r.factIds ? { ...r, factIds: r.factIds.filter((x) => valid.has(x)) } : r)); }

function outputToSections(o: AgentOutput): SectionsBody {
  return { summary: o.summary, sections: [{ heading: o.title, bullets: o.findings.slice(0, 12).map((f) => ({ text: `[${f.status}] ${f.text}`, factIds: f.sources.map((s) => s.split(" · ")[0]).filter((s) => s.startsWith("fact_")), sourceUrls: [] })) }].filter((s) => s.bullets.length) as SectionsBody["sections"], missingInfo: o.missingInfo, risks: o.findings.filter((f) => /risk flag/i.test(f.text)).map((f) => f.text) };
}

const TITLES: Record<string, string> = { research_market: "Market research", research_competitors: "Competitor research", research_audience: "Audience research", research_brand_product: "Brand & product research", audit_business: "Business audit", audit_social: "Social media audit", audit_content: "Content audit", audit_positioning: "Positioning audit", audit_performance: "Performance audit" };

const HINT_SECTIONS = `JSON: {"summary":string,"sections":[{"heading":string,"bullets":[{"text":string,"factIds":[ids from facts],"sourceUrls":[]}]}],"missingInfo":[string],"risks":[string]}. Every bullet must cite factIds from the facts, or say plainly that nothing is stored. No outside facts: no web tool is connected.`;

export async function handleOps(c: OpsCtx): Promise<OpsResult> {
  const { kind } = c.task;
  if (!kind) throw new Error("Task has no kind");
  if (kind in TITLES) return sectionsTask(c, kind);
  switch (kind) {
    case "strategy": return strategyTask(c);
    case "content_calendar": return calendarTask(c);
    case "reel_scripts": return scriptsTask(c);
    case "creative_briefs": return briefsTask(c);
    case "ad_plan": return adPlanTask(c);
    case "qa": return qaTask(c);
    case "revise": return reviseTask(c);
    case "package": return packageTask(c);
  }
  throw new Error(`Unknown task kind "${kind}"`);
}


/** Live evidence (only when a source exists): website analysis from a stored URL; search results when a search key is configured. Every bullet carries its URL; the date is in the heading. */
async function webSections(c: OpsCtx, kind: string, facts: Fact[]): Promise<{ sections: SectionsBody["sections"]; missing: string[] }> {
  const out: SectionsBody["sections"] = []; const missing: string[] = []; const env = c.tools?.env ?? process.env;
  if (["research_brand_product", "audit_business", "audit_positioning"].includes(kind)) {
    const urls = facts.filter((f) => f.key.split("@")[0] === "website_url").map((f) => f.value.match(/https?:\/\/\S+/)?.[0]).filter((u): u is string => Boolean(u));
    if (!urls.length) missing.push("No website URL is stored, so no live website analysis was possible");
    for (const u of urls.slice(0, 2)) {
      const r = await fetchPage(u, { fetchImpl: c.tools?.fetchImpl, resolver: c.tools?.resolver });
      if (!r.ok) { missing.push(`Website ${u} could not be analysed: ${r.error}`); continue; }
      out.push({ heading: `Live website analysis (fetched ${r.page.fetchedAt.slice(0, 10)}, status ${r.page.status})`, bullets: pageObservations(r.page).map((t) => ({ text: t, factIds: [], sourceUrls: [r.page.finalUrl] })) });
    }
  }
  if (kind === "research_competitors" || kind === "research_market") {
    const key = env.BRAVE_SEARCH_API_KEY;
    if (!key) missing.push("Live web search is awaiting credentials (BRAVE_SEARCH_API_KEY), so no external market/competitor sources were gathered");
    else {
      const prod = facts.find((f) => f.key === "offer_products")?.value.slice(0, 60) ?? c.client.name; const loc = facts.find((f) => f.key === "location")?.value.slice(0, 40) ?? "";
      const r = await braveSearch(kind === "research_competitors" ? `${prod} sellers ${loc}` : `${prod} market ${loc}`, key, 5, c.tools?.fetchImpl);
      if (r.ok) out.push({ heading: `Web search results (retrieved ${r.at.slice(0, 10)})`, bullets: r.hits.map((h) => ({ text: `${h.title}: ${h.snippet}`.slice(0, 280), factIds: [], sourceUrls: [h.url] })) });
      else missing.push(`Web search failed: ${r.error}`);
    }
  }
  return { sections: out, missing };
}

/* ---- research & audit: rules when AI is off, grounded AI when on ---- */
async function sectionsTask(c: OpsCtx, kind: string): Promise<OpsResult> {
  const agent = c.task.agent as AgentId;
  const facts = await scopeFacts(c, agent);
  const rules = AGENTS[agent].analyze(makeContext(c.client.name, facts));
  const web = await webSections(c, kind, facts);
  if (!c.ai || rules.insufficientData && kind !== "audit_performance") {
    const base = outputToSections(rules);
    const d = await save(c, kind.startsWith("research") ? "research" : "audit", TITLES[kind], agent, { ...base, sections: [...base.sections, ...web.sections], missingInfo: [...base.missingInfo, ...web.missing] });
    return { status: rules.insufficientData ? "WAITING FOR INPUT" : "COMPLETED", note: c.ai ? "Not enough stored data for AI to add anything (no cost)" : "AI is off: rule-based findings only", meta: null, deliverableIds: [d.id] };
  }
  const { value, meta } = await c.ai.generate({ task: c.task, client: c.client, agent, kind, schemaHint: HINT_SECTIONS, schema: sectionsSchema, facts, maxTokens: 1800, payload: { language: c.run.plan.language, platform: c.run.plan.platform, ruleBasedGaps: rules.missingInfo } });
  const valid = new Set(facts.map((f) => f.id));
  const body = { ...value, sections: [...value.sections.map((s) => ({ ...s, bullets: ground(s.bullets, valid) })), ...web.sections], missingInfo: [...new Set([...rules.missingInfo, ...value.missingInfo, ...web.missing])] };
  const d = await save(c, kind.startsWith("research") ? "research" : "audit", TITLES[kind], agent, body);
  return { status: "COMPLETED", meta, deliverableIds: [d.id] };
}

async function upstream(c: OpsCtx) {
  const ds = [...(await runDeliverables(c, "research")), ...(await runDeliverables(c, "audit"))];
  return Promise.all(ds.map(async (d) => { const b = await latestBody<SectionsBody>(c, d); return { kind: d.kind, title: d.title, summary: cut(b.summary, 300), bullets: b.sections.flatMap((s) => s.bullets.map((x) => cut(x.text, 160))).slice(0, 6), missing: b.missingInfo.slice(0, 5) }; }));
}
const needAi = (c: OpsCtx) => { if (!c.ai) throw new NeedsAiError("This step needs AI generation, but AI is off. Set HQ_AI=mock (free, simulated) or live (needs your approval and key)."); return c.ai; };

async function strategyTask(c: OpsCtx): Promise<OpsResult> {
  const ai = needAi(c); const facts = await scopeFacts(c, "audit_strategy");
  const { value, meta } = await ai.generate({ task: c.task, client: c.client, agent: "audit_strategy", kind: "strategy", schema: strategySchema, facts, maxTokens: 3000, schemaHint: `JSON: {"objectives":[{"text","metric":string|null,"factIds"}],"personas":[{"name","description","factIds"}],"pillars":[{"name","description","example"}],"campaignTheme":string,"growth":[{"text","factIds"}],"assumptions":[string],"missingInfo":[string]}. Label unvalidated personas "Hypothesis". No invented metrics or targets.`, payload: { language: c.run.plan.language, platform: c.run.plan.platform, days: c.run.plan.days, missing: c.run.plan.missingInfo.slice(0, 12), upstream: await upstream(c) } });
  const valid = new Set(facts.map((f) => f.id));
  const body: StrategyBody = { ...value, objectives: ground(value.objectives, valid), personas: ground(value.personas, valid), growth: ground(value.growth, valid) };
  const d = await save(c, "strategy", `Marketing strategy: ${c.client.name}`, "audit_strategy", body);
  return { status: "COMPLETED", meta, deliverableIds: [d.id] };
}

const addDays = (iso: string, n: number) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

async function calendarTask(c: OpsCtx): Promise<OpsResult> {
  const ai = needAi(c); const facts = await scopeFacts(c, "content");
  const strat = (await runDeliverables(c, "strategy"))[0]; const sb = strat ? await latestBody<StrategyBody>(c, strat) : null;
  const days = c.run.plan.days; const startDate = addDays(c.run.createdAt.slice(0, 10), 1);
  const chunks: [number, number][] = []; for (let i = 0; i < days; i += 8) chunks.push([i, Math.min(i + 8, days)]);
  const results = await Promise.all(chunks.map(([a, b]) => ai.generate({ task: c.task, client: c.client, agent: "content", kind: "content_chunk", schema: z.object({ items: z.array(contentItemSchema).min(1).max(8) }), facts, maxTokens: 3500,
    schemaHint: `JSON: {"items":[exactly ${b - a} content items for day indexes ${a}..${b - 1}]}. Each item: {"date":"YYYY-MM-DD","platform","format":"reel|carousel|static|story","pillar","language","title","hook"(<=150 chars),"caption","cta","hashtags":[#tags],"script":null,"slides":[{"n","text"}]|null,"claimsUsed":[factIds],"needsVerification":[strings]}. Day index 0 is ${startDate}. Use only prices and policies from the facts.`,
    payload: { language: c.run.plan.language, platform: c.run.plan.platform, days, startDate, range: [a, b], strategy: sb ? { pillars: sb.pillars.map((p) => ({ name: p.name })), campaignTheme: sb.campaignTheme } : null } })));
  const valid = new Set(facts.map((f) => f.id));
  const items: ContentItemBody[] = results.flatMap((r, i) => r.value.items.slice(0, chunks[i][1] - chunks[i][0]).map((x, j) => ({ ...x, platform: c.run.plan.platform, date: addDays(startDate, chunks[i][0] + j), claimsUsed: x.claimsUsed.filter((id) => valid.has(id)) })));
  const ids: string[] = [];
  for (const [i, it] of items.entries()) { const d = await save(c, "content_item", `Day ${i + 1} · ${it.format} · ${it.title}`, "content", it); ids.push(d.id); }
  const cal = await save(c, "content_calendar", `${days}-day ${c.run.plan.platform} content calendar`, "content", { platform: c.run.plan.platform, startDate, days, language: c.run.plan.language, items: items.map((it, i) => ({ id: ids[i], date: it.date, format: it.format, pillar: it.pillar, title: it.title })), notes: [] });
  return { status: "COMPLETED", meta: sumMeta(results.map((r) => r.meta)), deliverableIds: [cal.id, ...ids] };
}

async function itemsOfRun(c: OpsCtx) { const ds = (await runDeliverables(c, "content_item")).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.title.localeCompare(b.title, undefined, { numeric: true })); return Promise.all(ds.map(async (d, index) => ({ d, index, body: await latestBody<ContentItemBody>(c, d) }))); }

async function scriptsTask(c: OpsCtx): Promise<OpsResult> {
  const ai = needAi(c); const facts = await scopeFacts(c, "video");
  const items = await itemsOfRun(c); const reels = items.filter((x) => x.body.format === "reel");
  if (!reels.length) return { status: "COMPLETED", note: "No reels in this plan", meta: null, deliverableIds: [] };
  const { value, meta } = await ai.generate({ task: c.task, client: c.client, agent: "video", kind: "reel_scripts", schema: reelScriptsSchema, facts, maxTokens: 3500, schemaHint: `JSON: {"scripts":[{"index":number (the item index given),"script":[{"t":"0–3s","text":string}],"storyboard":[string]}]} one per reel item; hook first, CTA last, 15–30 seconds.`,
    payload: { language: c.run.plan.language, items: reels.map((x) => ({ index: x.index, id: x.d.id, format: x.body.format, title: x.body.title, hook: x.body.hook, date: x.body.date })) } });
  const touched: string[] = [];
  for (const s of value.scripts) { const t = reels.find((x) => x.index === s.index); if (!t) continue; await c.store.reviseDeliverable(c.client.id, t.d.id, { ...t.body, script: s.script, storyboard: s.storyboard }, "video", "Reel script and storyboard added by the Video agent"); touched.push(t.d.id); }
  return { status: "COMPLETED", meta, deliverableIds: touched };
}

async function briefsTask(c: OpsCtx): Promise<OpsResult> {
  const ai = needAi(c); const facts = await scopeFacts(c, "creative");
  const items = await itemsOfRun(c);
  const source = items.length ? items.map((x) => ({ index: x.index, id: x.d.id, format: x.body.format, title: x.body.title, hook: x.body.hook, date: x.body.date })) : [];
  if (!source.length) return { status: "WAITING FOR INPUT", note: "No content items to brief", meta: null, deliverableIds: [] };
  const { value, meta } = await ai.generate({ task: c.task, client: c.client, agent: "creative", kind: "creative_briefs", schema: creativeBatchSchema, facts, maxTokens: 3500, schemaHint: `JSON: {"briefs":[{"contentItemId":id,"concept","layout","aspect":"9:16|4:5|1:1|1.91:1","imagePrompt"(>=40 chars, must say no text/logo/watermark),"videoPrompt":string|null,"storyboard":[string]|null,"variations":[string],"brandNotes","assetSlots":[string]}]} one per item. Do not invent brand colours or fonts; say if they are unconfirmed.`, payload: { language: c.run.plan.language, items: source } });
  const ids: string[] = [];
  for (const [i, b] of value.briefs.entries()) { const target = source.find((s) => s.id === b.contentItemId) ?? source[i]; if (!target) continue; const d = await save(c, "creative_brief", `Brief · ${target.title}`, "creative", { ...b, contentItemId: target.id }); ids.push(d.id); }
  return { status: "COMPLETED", meta, deliverableIds: ids };
}

async function adPlanTask(c: OpsCtx): Promise<OpsResult> {
  const ai = needAi(c); const facts = await scopeFacts(c, "paid_ads");
  const strat = (await runDeliverables(c, "strategy"))[0]; const sb = strat ? await latestBody<StrategyBody>(c, strat) : null;
  const items = await itemsOfRun(c);
  const { value, meta } = await ai.generate({ task: c.task, client: c.client, agent: "paid_ads", kind: "ad_plan", schema: adPlanSchema, facts, maxTokens: 3000, schemaHint: `JSON: {"objective","budget":{"amountInr":number|null,"note"},"audiences":[{"name","targeting","rationale","validated":false}],"adCopy":[{"headline"(<=80),"text","cta","language","claimsUsed":[ids]}],"creativeRefs":[ids],"risks":[string],"launchChecklist":[{"item","done":boolean}],"performanceAnalysis":{"status":"NO DATA"|"ANALYSED","note"}}. amountInr must be null unless a budget fact exists. Claim nothing unverified.`,
    payload: { language: c.run.plan.language, platform: c.run.plan.platform, strategy: sb ? { theme: sb.campaignTheme, objectives: sb.objectives.map((o) => o.text) } : null, upstreamIds: items.map((x) => x.d.id) } });
  const d = await save(c, "ad_plan", `Advertising plan: ${c.client.name}`, "paid_ads", { ...value, creativeRefs: value.creativeRefs.length ? value.creativeRefs : items.map((x) => x.d.id) });
  return { status: "COMPLETED", meta, deliverableIds: [d.id] };
}

/* ---- quality assurance ---- */
export async function qaDeliverables(c: OpsCtx, only?: string[]): Promise<{ checked: number; blocked: number; warned: number; lines: string[] }> {
  const facts = await scopeFacts(c, "qa");
  const all = await c.store.listFacts(c.client.id, { includeSuperseded: true });
  const corpus = all.map((f) => `${f.value} ${f.source} ${f.key}`).join(" ");
  const hasPalette = all.some((f) => f.key.split("@")[0] === "colors" && f.status !== "NEEDS VERIFICATION");
  const others = (await c.store.listClients()).filter((x) => x.id !== c.client.id).map((x) => x.name.replace(/\s*\(.*\)/, ""));
  const ds = (await runDeliverables(c)).filter((d) => ["content_item", "creative_brief", "ad_plan", "strategy", "research", "audit"].includes(d.kind) && (!only || only.includes(d.id)));
  let blocked = 0, warned = 0; const lines: string[] = [];
  for (const d of ds) {
    const body = await latestBody<unknown>(c, d);
    let issues: QaIssueRec[] = [];
    if (d.kind === "content_item") issues = qaContentItem(body as ContentItemBody, facts, c.client, corpus);
    else if (d.kind === "creative_brief") issues = qaCreativeBrief(body as CreativeBriefBody, c.client, facts, hasPalette);
    else if (d.kind === "ad_plan") issues = qaAdPlan(body as AdPlanBody, c.client, facts, corpus);
    else if (d.kind === "research" || d.kind === "audit") {
      const b = body as SectionsBody;
      for (const s of b.sections) for (const x of s.bullets) if (!x.factIds.length && !x.sourceUrls.length && !/no stored facts|NO DATA|nothing/i.test(x.text)) issues.push({ severity: "warn", rule: "source", detail: `Unsourced finding in "${d.title}": ${cut(x.text, 80)}` });
    }
    const json = JSON.stringify(body);
    for (const o of others) if (new RegExp(`\\b${o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(json)) issues.push({ severity: "blocker", rule: "client-isolation", detail: `"${d.title}" mentions another workspace ("${o}")` });
    const hasBlocker = issues.some((i) => i.severity === "blocker");
    await c.store.patchDeliverable(c.client.id, d.id, { qa: { pass: !hasBlocker, issues }, status: hasBlocker ? "changes_requested" : d.status === "approved" ? "approved" : "in_review" });
    if (hasBlocker) blocked++; if (issues.some((i) => i.severity === "warn")) warned++;
    lines.push(`${hasBlocker ? "BLOCKED" : "pass"} · ${d.kind} · ${d.title} · ${issues.length} issue(s)`);
  }
  return { checked: ds.length, blocked, warned, lines };
}
async function qaTask(c: OpsCtx): Promise<OpsResult> {
  const r = await qaDeliverables(c);
  const d = await save(c, "qa_report", `QA report (${c.task.params?.round ?? c.task.id.slice(-4)})`, "qa", { checked: r.checked, blocked: r.blocked, warned: r.warned, lines: r.lines }, "in_review");
  return { status: "COMPLETED", note: `${r.checked} checked, ${r.blocked} blocked, ${r.warned} with warnings`, meta: null, deliverableIds: [d.id] };
}

/* ---- automatic revision: QA feedback goes back to the authoring agent ---- */
async function reviseTask(c: OpsCtx): Promise<OpsResult> {
  const blocked = (await runDeliverables(c)).filter((d) => d.status === "changes_requested" && d.qa && d.qa.issues.some((i) => i.severity === "blocker") && ["content_item", "creative_brief", "ad_plan"].includes(d.kind));
  if (!blocked.length) return { status: "COMPLETED", note: "Nothing needed revision", meta: null, deliverableIds: [] };
  const ai = needAi(c);
  const metas: GenMeta[] = []; const touched: string[] = [];
  await Promise.all(blocked.map(async (d) => {
    const agent = d.agent as AgentId; const facts = await scopeFacts(c, agent);
    const prev = await latestBody<unknown>(c, d); const issues = d.qa!.issues.filter((i) => i.severity === "blocker").map((i) => i.detail);
    const schema = d.kind === "content_item" ? contentItemSchema : d.kind === "creative_brief" ? creativeBriefSchema : adPlanSchema;
    const { value, meta } = await ai.generate({ task: c.task, client: c.client, agent, kind: `revise_${d.kind}`, schema: schema as z.ZodType<unknown>, facts, schemaHint: `Return the SAME JSON shape as "previous", corrected so that every listed issue is resolved. Remove unsupported claims entirely; do not replace them with other claims.`, payload: { language: c.run.plan.language, previous: prev, issues } });
    await c.store.reviseDeliverable(c.client.id, d.id, value, agent, `Revised after QA: ${issues.map((x) => cut(x, 70)).join(" | ")}`);
    metas.push(meta); touched.push(d.id);
  }));
  return { status: "COMPLETED", note: `${touched.length} item(s) revised from QA feedback`, meta: sumMeta(metas), deliverableIds: touched };
}

/* ---- package + hand-off to the Approval Centre ---- */
async function packageTask(c: OpsCtx): Promise<OpsResult> {
  const ds = (await runDeliverables(c)).filter((d) => d.kind !== "campaign_package");
  const tasks = await c.store.listTasks({ runId: c.run.id });
  const taskIds = new Set(tasks.map((t) => t.id));
  const usage = (await c.store.listUsage({ clientId: c.client.id })).filter((u) => u.taskId && taskIds.has(u.taskId));
  const strat = ds.find((d) => d.kind === "strategy");
  const sb = strat ? await latestBody<StrategyBody>(c, strat) : null;
  const missing = new Set<string>(c.run.plan.missingInfo);
  for (const d of ds.filter((x) => ["research", "audit"].includes(x.kind))) (await latestBody<SectionsBody>(c, d)).missingInfo.forEach((m) => missing.add(m));
  sb?.missingInfo.forEach((m) => missing.add(m));
  const pending = tasks.filter((t) => t.status === "WAITING FOR INPUT").map((t) => `${t.description}: ${t.error ?? "needs input"}`);
  const body = { title: `${c.run.objective.replace("_", " ")} package · ${c.client.name}`, objective: c.run.instruction, summary: c.run.plan.summary,
    deliverables: ds.map((d) => ({ id: d.id, kind: d.kind, title: d.title, status: d.status, qa: d.qa ? (d.qa.pass ? `pass (${d.qa.issues.length} notes)` : `blocked: ${d.qa.issues.filter((i) => i.severity === "blocker").length}`) : ["qa_report", "content_calendar"].includes(d.kind) ? "n/a (index)" : "not checked" })),
    missingInfo: [...missing, ...pending], assumptions: [...c.run.plan.assumptions, ...(sb?.assumptions ?? [])],
    usage: { calls: usage.length, costUsd: usage.reduce((a, u) => a + u.costUsd, 0), mock: usage.some((u) => u.provider === "mock") },
    nextSteps: ["Review each deliverable in the Content Calendar, Creative Studio, Strategy and Campaign screens", "Approve what is ready; request changes on the rest (agents revise automatically)", "Provide the missing information listed above", "Execution preparation starts only after approval and needs a connected, tested integration"],
    notExecuted: "Nothing has been published, sent, scheduled or spent." };
  const pkg = await save(c, "campaign_package", body.title, "orchestrator", body, "in_review");
  const { requestApproval } = await import("../approvals");
  await requestApproval(c.store, { clientId: c.client.id, kind: "other", summary: `Review ${body.title} (${ds.length} deliverables)`, requestedBy: "orchestrator", ref: `deliverable:${pkg.id}` });
  return { status: "COMPLETED", meta: null, deliverableIds: [pkg.id] };
}
export type { Fact };
