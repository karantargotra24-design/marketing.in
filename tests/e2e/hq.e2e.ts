import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";
import path from "node:path";
import { LOCKED_PORT, OPEN_PORT } from "./globalSetup";

const BASE = `http://localhost:${OPEN_PORT}`;
const SHOTS = path.join(process.cwd(), "docs", "screenshots");
let browser: Browser; let page: Page;
const banner = async () => (await page.locator(".bg-green-50, .bg-red-50").first().innerText()).trim();

beforeAll(async () => { browser = await chromium.launch(); page = await (await browser.newContext({ viewport: { width: 1200, height: 900 } })).newPage(); });
afterAll(async () => { await browser?.close(); });

describe("Agency HQ in a real browser (production build, synthetic data, MOCK AI)", () => {
  it("shows the AI engine as MOCK and starts with no workspaces", async () => {
    await page.goto(`${BASE}/hq`);
    await page.getByRole("heading", { name: "AI Marketing Agency HQ" }).waitFor({ state: "visible" });
    expect(await page.getByTestId("ai-mode").innerText()).toBe("MOCK");
    await page.getByText("Simulated AI: outputs are labelled [MOCK AI]").waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Create the 3 workspaces" }).waitFor({ state: "visible" });
  });

  it("creates the three workspaces from the seed file", async () => {
    await page.getByRole("button", { name: "Create the 3 workspaces" }).click();
    await page.waitForURL(/ok=/);
    for (const n of ["Pahadi Origin", "Propedia", "Karan Targotra (Personal Brand)"]) await page.getByRole("link", { name: n }).waitFor({ state: "visible" });
    await page.screenshot({ path: path.join(SHOTS, "01-overview.png") });
  });

  it("runs a 7-agent review for one client and really executes the agents in parallel", async () => {
    const row = page.locator("li", { hasText: "Propedia" }).first();
    await row.locator("select[name=workflow]").selectOption("full_review");
    await row.getByRole("button", { name: "Run" }).click();
    await page.waitForURL(/ok=Workflow/);
    expect(await banner()).toContain("full_review finished for propedia");
    // task table: 7 specialist tasks marked MOCK AI or RULES (insufficient data) and none left pending
    const modes = await page.getByTestId("task-mode").allInnerTexts();
    expect(modes.length).toBeGreaterThanOrEqual(10);
    expect(modes.filter((m) => m === "MOCK AI").length).toBeGreaterThan(0);
    // timeline built from recorded timestamps: assert overlap ourselves, from the DOM data
    const spans = await page.getByTestId("span").evaluateAll((els) => els.map((e) => [Number(e.getAttribute("data-start")), Number(e.getAttribute("data-end"))]));
    const ev = spans.flatMap(([a, b]) => [[a, 1], [b, -1]]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    let cur = 0, overlap = 0; for (const [, d] of ev) { cur += d; overlap = Math.max(overlap, cur); }
    expect(overlap).toBeGreaterThanOrEqual(3);
    expect(Number(await page.getByTestId("max-overlap").innerText())).toBe(overlap);
    // spend panel: simulated cost > 0, real cost exactly $0
    expect(await page.getByTestId("real-spend").innerText()).toMatch(/Today \$0\.0000/);
    expect(await page.getByTestId("sim-spend").innerText()).toMatch(/[1-9]\d* mock calls/);
    // execution history lists attempts
    expect((await page.getByTestId("history").locator("tbody tr").count())).toBeGreaterThanOrEqual(8);
    await page.screenshot({ path: path.join(SHOTS, "02-after-parallel-run.png"), fullPage: true });
  });

  it("opens an AI-produced report that says how it was produced, and passes QA", async () => {
    await page.goto(`${BASE}/hq/client/propedia`);
    await page.locator("a[href*='/hq/report/propedia/research-']").first().click();
    const text = await page.locator("pre").innerText();
    expect(text).toMatch(/Produced by: AI \(mock · mock-sonnet · 1 call/);
    expect(text).toContain("[MOCK AI]");
    await page.goto(`${BASE}/hq/client/propedia`);
    await page.locator("a[href*='/hq/report/propedia/audit-final-']").first().click();
    expect(await page.locator("pre").innerText()).toMatch(/AI was used by \d+ of \d+ agents \(\d+ via the MOCK provider/);
    await page.goto(`${BASE}/hq/client/propedia`);
    const reports = await page.locator("a[href*='/hq/report/propedia/qa-']").first().click().then(() => page.locator("pre").innerText());
    expect(reports).toMatch(/document\(s\) passed QA/);
  });

  it("keeps client workspaces separate in the UI", async () => {
    await page.goto(`${BASE}/hq/client/propedia`);
    const p = await page.locator("main").innerText();
    expect(p).not.toContain("Pahadi Origin"); expect(p).not.toContain("Karan Targotra");
    await page.screenshot({ path: path.join(SHOTS, "03-client-workspace.png") });
    await page.goto(`${BASE}/hq/client/pahadi-origin`);
    expect(await page.locator("main").innerText()).not.toContain("Propedia");
    expect((await page.goto(`${BASE}/hq/client/..%2Fetc`))?.status()).toBe(404);
    expect((await page.goto(`${BASE}/hq/report/propedia/..%2F..%2Fx.md`))?.status()).toBe(404);
  });

  it("approval requests are recorded but execute nothing", async () => {
    await page.goto(`${BASE}/hq`);
    await page.locator("form:has(input[name=summary]) input[name=summary]").fill("Publish test post");
    await page.getByRole("button", { name: "Request approval" }).click();
    await page.waitForURL(/ok=Approval/);
    await page.getByRole("button", { name: "Approve", exact: true }).click();
    await page.waitForURL(/ok=Approval%20approved/);
    expect(await banner()).toContain("nothing was executed");
  });

  it("adds a client and a sourced fact", async () => {
    await page.goto(`${BASE}/hq`);
    await page.fill("input[name=name]", "Jammu Motors"); await page.fill("input[name=id]", "jammu-motors");
    await page.getByRole("button", { name: "Add client" }).click();
    await page.waitForURL(/ok=Client/);
    await page.goto(`${BASE}/hq/client/jammu-motors`);
    await page.fill("input[name=key]", "website_url"); await page.fill("input[name=source]", "client call"); await page.fill("textarea[name=value]", "https://example.com");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForURL(/ok=Fact/);
    await page.getByText("website_url").waitFor({ state: "visible" });
  });

  it("a brand-new empty client waits for input instead of inventing results", async () => {
    await page.goto(`${BASE}/hq`);
    const row = page.locator("li", { hasText: "Jammu Motors" }).first();
    await row.locator("select[name=workflow]").selectOption("audit_360");
    await row.getByRole("button", { name: "Run" }).click();
    await page.waitForURL(/ok=Workflow/);
    await page.getByText("WAITING FOR INPUT").first().waitFor({ state: "visible" });
  });
});

describe("production without auth or overrides fails closed", () => {
  it("redirects HQ pages to the locked page and does not expose client data", async () => {
    const p = await (await browser.newContext()).newPage();
    await p.goto(`http://localhost:${LOCKED_PORT}/hq`);
    await p.getByRole("heading", { name: "Agency HQ is locked" }).waitFor({ state: "visible" });
    await p.goto(`http://localhost:${LOCKED_PORT}/hq/client/propedia`);
    await p.getByRole("heading", { name: "Agency HQ is locked" }).waitFor({ state: "visible" });
  });
  it("rejects a forged server-action POST", async () => {
    const res = await fetch(`http://localhost:${LOCKED_PORT}/hq`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "next-action": "deadbeef" }, body: "clientId=propedia" });
    expect([400, 404, 405, 500]).toContain(res.status); // never 200 with data
    expect((await res.text()).toLowerCase()).not.toContain("propedia");
  });
});
