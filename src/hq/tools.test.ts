import { describe, it, expect, beforeEach } from "vitest";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { assertPublicUrl, braveSearch, fetchPage, isPrivateIp, pageObservations } from "./tools/web";
import { INTEGRATION_DEFS, integrationStatus, isIntegrationOperational, listIntegrations, testIntegration } from "./integrations";
import { HqStore } from "./store";
import { seedWorkspaces } from "./seed";
import { SAMPLE_CLIENTS } from "./fixtures";
import { submitInstruction, processJobs } from "./ops/runs";
import { performExternalAction, requestApproval, decideApproval } from "./approvals";
import { handleOps } from "./ops/handlers";

const PUBLIC = async () => ["93.184.216.34"];
const html = (body: string, extra = "") => new Response(body, { status: 200, headers: { "content-type": "text/html; charset=utf-8", ...(extra ? { "x-x": extra } : {}) } });
const PAGE = `<html lang="en"><head><title>Pahadi Origin — Himalayan walnuts, honey, kahwa</title><meta name="description" content="Order direct"><link rel="canonical" href="https://x.test/"></head><body><h1>Pahadi Pantry</h1><h2>Walnuts</h2><img src="a.jpg"><img src="b.jpg" alt="honey"><a href="/a">a</a><script type="application/ld+json">{}</script><p>${"word ".repeat(50)}</p></body></html>`;

describe("SSRF protection", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.5", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"])("treats %s as private", (ip) => expect(isPrivateIp(ip)).toBe(true));
  it.each(["93.184.216.34", "8.8.8.8", "2606:4700:4700::1111"])("treats %s as public", (ip) => expect(isPrivateIp(ip)).toBe(false));
  it("rejects bad schemes, credentials, private literals and hosts that resolve privately", async () => {
    for (const u of ["file:///etc/passwd", "ftp://x.test", "javascript:alert(1)", "http://user:pw@x.test/", "http://localhost/", "http://127.0.0.1:3000/", "http://169.254.169.254/latest/meta-data/", "http://[::1]/", "notaurl"]) await expect(assertPublicUrl(u, PUBLIC)).rejects.toThrow();
    await expect(assertPublicUrl("http://internal.example/", async () => ["10.0.0.7"])).rejects.toThrow(/not public/);
    await expect(assertPublicUrl("http://rebind.example/", async () => ["93.184.216.34", "127.0.0.1"])).rejects.toThrow(/not public/);   // any private address blocks
    await expect(assertPublicUrl("https://ok.example/", PUBLIC)).resolves.toBeInstanceOf(URL);
  });
  it("re-validates every redirect hop (a public page cannot bounce us into the private network)", async () => {
    let calls = 0;
    const f = (async (u: string) => { calls++; return u.includes("start") ? new Response(null, { status: 302, headers: { location: "http://169.254.169.254/latest" } }) : html(PAGE); }) as unknown as typeof fetch;
    const r = await fetchPage("https://start.example/", { fetchImpl: f, resolver: async (h) => (h.includes("169.254") ? ["169.254.169.254"] : ["93.184.216.34"]) });
    expect(r).toMatchObject({ ok: false, error: expect.stringMatching(/not public/) }); expect(calls).toBe(1);
  });
});

describe("page fetch and analysis", () => {
  it("parses a page into cited facts with a fetch date", async () => {
    const r = await fetchPage("https://x.test/", { fetchImpl: (async () => html(PAGE)) as unknown as typeof fetch, resolver: PUBLIC });
    if (!r.ok) throw new Error(r.error);
    expect(r.page).toMatchObject({ title: expect.stringContaining("Pahadi Origin"), description: "Order direct", lang: "en", imageCount: 2, imagesMissingAlt: 1, hasJsonLd: true, h1: ["Pahadi Pantry"] });
    expect(r.page.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const obs = pageObservations(r.page).join("\n");
    expect(obs).toContain("1 of 2 images have no alt text"); expect(obs).toContain("One H1");
  });
  it("refuses non-HTML, oversized pages, timeouts and too many redirects", async () => {
    const mk = (res: () => Response) => ({ fetchImpl: (async () => res()) as unknown as typeof fetch, resolver: PUBLIC });
    expect(await fetchPage("https://x.test/", mk(() => new Response("{}", { headers: { "content-type": "application/json" } })))).toMatchObject({ ok: false, error: expect.stringMatching(/Not an HTML/) });
    expect(await fetchPage("https://x.test/", { ...mk(() => html("x".repeat(2000))), maxBytes: 1000 })).toMatchObject({ ok: false, error: expect.stringMatching(/too large/) });
    expect(await fetchPage("https://x.test/", mk(() => new Response(null, { status: 302, headers: { location: "https://x.test/" } })))).toMatchObject({ ok: false, error: expect.stringMatching(/redirects/) });
    const slow = (async (_u: string, init: RequestInit) => new Promise((_r, rej) => init.signal!.addEventListener("abort", () => rej(new Error("aborted"))))) as unknown as typeof fetch;
    expect((await fetchPage("https://x.test/", { fetchImpl: slow, resolver: PUBLIC, timeoutMs: 30 })).ok).toBe(false);
  });
  it("brave search adapter parses hits with retrieval date and reports provider errors", async () => {
    const ok = (async () => new Response(JSON.stringify({ web: { results: [{ title: "T", url: "https://a.test/", description: "<b>snip</b>" }] } }))) as unknown as typeof fetch;
    const r = await braveSearch("q", "k", 3, ok); if (!r.ok) throw new Error(r.error);
    expect(r.hits[0]).toEqual({ title: "T", url: "https://a.test/", snippet: "snip" });
    expect(await braveSearch("q", "k", 3, (async () => new Response("", { status: 429 })) as unknown as typeof fetch)).toMatchObject({ ok: false });
  });
});

describe("integrations: nothing is 'connected' without a passing live test", () => {
  let store: HqStore;
  beforeEach(async () => { store = new HqStore(await mkdtemp(path.join(tmpdir(), "hq-int-"))); await seedWorkspaces(store, true, SAMPLE_CLIENTS); });
  const ig = INTEGRATION_DEFS.find((d) => d.id === "instagram_graph")!;
  it("status ladder: awaiting → configured → tested", () => {
    expect(integrationStatus(ig, {}, null)).toBe("awaiting_credentials");
    const env = { META_ACCESS_TOKEN: "t", IG_USER_ID: "1" };
    expect(integrationStatus(ig, env, null)).toBe("configured_untested");
    expect(integrationStatus(ig, env, { ok: true, detail: "", at: "" })).toBe("tested_ok");
    expect(integrationStatus(ig, env, { ok: false, detail: "", at: "" })).toBe("tested_failed");
    expect(integrationStatus(INTEGRATION_DEFS.find((d) => d.id === "google_ads")!, { GOOGLE_ADS_DEVELOPER_TOKEN: "a", GOOGLE_ADS_REFRESH_TOKEN: "b", GOOGLE_ADS_CUSTOMER_ID: "c" }, null)).toBe("adapter_not_written");
  });
  it("with no environment, every credentialed integration is awaiting credentials and none is operational", async () => {
    const all = await listIntegrations(store, {});
    expect(all.filter((i) => i.status === "tested_ok")).toHaveLength(0);
    expect(all.find((i) => i.id === "web_fetch")!.status).toBe("built_in");
    expect(all.filter((i) => i.requiredEnv.length).every((i) => i.status === "awaiting_credentials")).toBe(true);
    await expect(testIntegration(store, "instagram_graph", {})).rejects.toThrow(/missing/);
    await expect(testIntegration(store, "google_ads", { GOOGLE_ADS_DEVELOPER_TOKEN: "a", GOOGLE_ADS_REFRESH_TOKEN: "b", GOOGLE_ADS_CUSTOMER_ID: "c" })).rejects.toThrow(/No adapter/);
  });
  it("a passing live test (fake HTTP here) records status without leaking the token; a failing one is recorded as failed", async () => {
    const env = { META_ACCESS_TOKEN: "SECRET-TOKEN-123", IG_USER_ID: "99" };
    const okF = (async () => new Response(JSON.stringify({ username: "karantargotra.a" }))) as unknown as typeof fetch;
    const rec = await testIntegration(store, "instagram_graph", env, okF);
    expect(rec).toMatchObject({ ok: true, detail: "Connected as @karantargotra.a" });
    expect(await isIntegrationOperational(store, "instagram_graph", env)).toBe(true);
    expect(await isIntegrationOperational(store, "instagram_graph", {})).toBe(false);          // creds removed → not operational
    const bad = await testIntegration(store, "instagram_graph", env, (async () => { throw new Error("boom token=SECRET-TOKEN-123"); }) as unknown as typeof fetch);
    expect(bad.ok).toBe(false); expect(JSON.stringify(bad)).not.toContain("SECRET-TOKEN-123");
    expect(await isIntegrationOperational(store, "instagram_graph", env)).toBe(false);
    expect(JSON.stringify(await store.readLog(50))).not.toContain("SECRET-TOKEN-123");
  });
  it("the approval gate refuses to execute through an untested integration even when approved", async () => {
    const a = await requestApproval(store, { clientId: "pahadi-origin", kind: "publish_post", summary: "post", requestedBy: "content" });
    await decideApproval(store, a.id, "APPROVED", "human:karan");
    let ran = 0;
    const r = await performExternalAction(store, { approvalId: a.id, clientId: "pahadi-origin", integrationId: "instagram_graph", execute: async () => { ran++; } });
    expect(r).toMatchObject({ ok: false, reason: expect.stringMatching(/not connected and tested/) }); expect(ran).toBe(0);
  });
});

describe("live research inside the agent workflow", () => {
  it("fetches the stored website, cites it with URL and date; reports a missing site as missing, never invents", async () => {
    const store = new HqStore(await mkdtemp(path.join(tmpdir(), "hq-web-")));
    await seedWorkspaces(store, true, SAMPLE_CLIENTS);
    const sub = await submitInstruction(store, "pahadi-origin", "audit our business and social presence", "human:karan");
    if (!sub.ok) throw new Error(sub.error);
    // without a stored website
    await processJobs(store, { ai: undefined, max: 2 });
    const noSite = await Promise.all((await store.listDeliverables({ clientId: "pahadi-origin", runId: sub.run.id, kind: "audit" })).map(async (d) => JSON.stringify((await store.getDeliverable("pahadi-origin", d.id))!.versions[0].body)));
    expect(noSite.join("")).toMatch(/No website URL is stored/);
    // with a website, through the handler (injected fetch, public resolver)
    await store.putFact({ clientId: "pahadi-origin", kb: "business", key: "website_url", value: "https://pahadi.example/", status: "CLIENT-PROVIDED", source: "test" });
    const tasks = await store.listTasks({ runId: sub.run.id }); const t = tasks.find((x) => x.kind === "audit_business")!;
    const run = (await store.getRun("pahadi-origin", sub.run.id))!;
    const res = await handleOps({ store, client: (await store.getClient("pahadi-origin"))!, run, task: t, tools: { fetchImpl: (async () => html(PAGE)) as unknown as typeof fetch, resolver: PUBLIC, env: {} } });
    const body = (await store.getDeliverable("pahadi-origin", res.deliverableIds[0]))!.versions[0].body as { sections: { heading: string; bullets: { sourceUrls: string[] }[] }[]; missingInfo: string[] };
    const live = body.sections.find((s) => s.heading.startsWith("Live website analysis (fetched "))!;
    expect(live.bullets.every((b) => b.sourceUrls[0] === "https://pahadi.example/")).toBe(true);
    expect(body.missingInfo.join(" ")).not.toMatch(/No website URL/);
  });
  it("search results are used only when a search key exists; otherwise the gap is stated", async () => {
    const store = new HqStore(await mkdtemp(path.join(tmpdir(), "hq-ws-")));
    await seedWorkspaces(store, true, SAMPLE_CLIENTS);
    const sub = await submitInstruction(store, "pahadi-origin", "competitor research please", "human:karan");
    if (!sub.ok) throw new Error(sub.error);
    await processJobs(store, { ai: undefined, max: 2 });
    const t = (await store.listTasks({ runId: sub.run.id })).find((x) => x.kind === "research_competitors")!;
    const run = (await store.getRun("pahadi-origin", sub.run.id))!; const client = (await store.getClient("pahadi-origin"))!;
    const none = await handleOps({ store, client, run, task: t, tools: { env: {} } });
    expect(JSON.stringify((await store.getDeliverable("pahadi-origin", none.deliverableIds[0]))!.versions[0].body)).toMatch(/awaiting credentials/);
    const f = (async () => new Response(JSON.stringify({ web: { results: [{ title: "Rival", url: "https://rival.test/", description: "walnut seller" }] } }))) as unknown as typeof fetch;
    const some = await handleOps({ store, client, run, task: t, tools: { env: { BRAVE_SEARCH_API_KEY: "k" }, fetchImpl: f } });
    const b = (await store.getDeliverable("pahadi-origin", some.deliverableIds[0]))!.versions[0].body as { sections: { heading: string; bullets: { sourceUrls: string[] }[] }[] };
    expect(b.sections.find((s) => s.heading.startsWith("Web search results (retrieved "))!.bullets[0].sourceUrls).toEqual(["https://rival.test/"]);
  });
});
