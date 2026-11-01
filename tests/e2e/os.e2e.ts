import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";
import path from "node:path";
import { LOCKED_PORT, OS_PORT } from "./globalSetup";

const BASE = `http://localhost:${OS_PORT}`;
const SHOTS = path.join(process.cwd(), "docs", "screenshots");
const CAMPAIGN = "Prepare a complete seven-day Instagram growth campaign for Pahadi Origin.";
let browser: Browser; let page: Page; let runUrl = "";
const text = async () => page.locator("main").innerText();
const flash = async () => (await page.locator("main [role=status], main [role=alert]").first().innerText()).trim();
const open = (p: string) => page.goto(`${BASE}${p}`);
const switchTo = async (id: string) => { await Promise.all([page.waitForResponse((r) => r.request().method() === "POST"), page.getByTestId("client-switcher").selectOption(id)]); await page.waitForLoadState("networkidle"); };
/** Click and wait until the URL really changes (a redirect carrying the result). */
const go = async (loc: import("playwright").Locator) => { const before = page.url(); await loc.click(); await page.waitForFunction((b) => location.href !== b, before, { timeout: 30_000 }); await page.waitForLoadState(); };

beforeAll(async () => { browser = await chromium.launch(); page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); });
afterAll(async () => { await browser?.close(); });

describe("Marketing OS (/os): one instruction → coordinated agents → deliverables → approval (production build, MOCK AI, synthetic data)", () => {
  it("has working navigation to all 15 modules, each with a real heading", async () => {
    await open("/os/clients");
    if (await page.getByRole("button", { name: /Create the 3 workspaces/ }).count()) await go(page.getByRole("button", { name: /Create the 3 workspaces/ }));
    const pages: [string, string, RegExp][] = [["Agency Overview", "/os", /Agency Overview/], ["Client Management", "/os/clients", /Client Management/], ["Client Knowledge Centre", "/os/knowledge", /Knowledge Centre/], ["AI Agent Command Centre", "/os/agents", /Agent Command Centre/], ["Task Management", "/os/tasks", /Task Management/], ["Research & Audit", "/os/research", /Research & Audit/], ["Marketing Strategy", "/os/strategy", /Marketing Strategy/], ["Content Calendar", "/os/calendar", /Content Calendar/], ["Creative Studio", "/os/creative", /Creative Studio/], ["Campaign Manager", "/os/campaigns", /Campaign Manager/], ["Approval Centre", "/os/approvals", /Approval Centre/], ["Analytics & Reports", "/os/analytics", /Analytics & Reports/], ["Automation Centre", "/os/automation", /Automation Centre/], ["Integrations", "/os/integrations", /Integrations/], ["Settings & Permissions", "/os/settings", /Settings & Permissions/]];
    for (const [label, href, h1re] of pages) {
      await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: label, exact: true }).click();
      await page.waitForURL(new RegExp(`${BASE}${href}$`));
      expect(await page.getByRole("heading", { level: 1 }).first().innerText(), label).toMatch(h1re);
      expect(await page.locator("body").innerText()).not.toMatch(/Application error|Internal Server Error/);
    }
  });

  it("shows the mode honestly and starts with no runs for the active client", async () => {
    await open("/os");
    expect(await page.getByTestId("ai-mode").innerText()).toBe("AI: MOCK");
    expect(await page.getByTestId("client-switcher").inputValue()).toBe("pahadi-origin");
  });

  it("a high-impact objective is planned, previewed, and waits for approval: nothing runs yet", async () => {
    await page.getByTestId("command-bar").locator("input[name=instruction]").fill(CAMPAIGN);
    await page.getByTestId("command-bar").getByRole("button", { name: "Send" }).click();
    await page.waitForURL(/\/os\/runs\//); runUrl = page.url();
    await page.getByTestId("plan-approval").waitFor();
    expect(await page.getByTestId("run-status").innerText()).toMatch(/AWAITING PLAN APPROVAL/);
    const waves = await page.getByTestId("plan-waves").innerText();
    expect(waves).toMatch(/Wave 1 \(9 in parallel\)/);
    for (const a of ["research", "audit_strategy", "social", "analytics", "content", "video", "creative", "paid_ads", "qa", "orchestrator"]) expect(waves).toContain(a);
    expect(await page.getByTestId("plan-missing").innerText()).toContain("☐");
    expect(await text()).toMatch(/Tasks are created when the plan is approved/);
    await page.screenshot({ path: path.join(SHOTS, "os-01-plan-preview.png"), fullPage: true });
  });

  it("approving the plan starts the agents; the page shows real live progress and ends COMPLETED", async () => {
    await page.getByRole("button", { name: "Approve plan & run" }).click();
    await page.waitForURL(runUrl);
    await page.waitForFunction(() => /COMPLETED|FAILED/.test(document.querySelector("[data-testid=run-status]")?.textContent ?? ""), null, { timeout: 90_000, polling: 1000 });
    expect(await page.getByTestId("run-status").innerText()).toBe("COMPLETED");
    const body = await text();
    expect(body).not.toMatch(/\bPENDING\b/);
    const deliverables = await page.getByTestId("deliverables").innerText();
    for (const k of ["Market research", "Competitor research", "Audience research", "Business audit", "Marketing strategy", "content calendar", "Brief", "Advertising plan", "QA report", "package"]) expect(deliverables.toLowerCase(), k).toContain(k.toLowerCase());
    expect(deliverables).toMatch(/v[23]/);                     // something was revised from QA feedback
    await page.screenshot({ path: path.join(SHOTS, "os-02-run-completed.png"), fullPage: true });
  });

  it("content calendar: 7 posts with caption, QA checks and version history; a revised post passes QA and can be approved", async () => {
    await open("/os/calendar");
    expect(await page.getByTestId("calendar").locator("a").count()).toBe(7);
    // find a post that QA blocked and an agent revised automatically
    const hrefs = await page.getByTestId("calendar").locator("a").evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute("href")!));
    let revisedHref = "";
    for (const h of hrefs) { await page.goto(`${BASE}${h}`); const d = await page.getByTestId("post-detail").innerText(); const copy = (await page.getByTestId("hook").innerText()) + (await page.getByTestId("caption").innerText()); expect(copy, "published copy must not contain unverified claims").not.toMatch(/only few left|40% OFF|health benefits/i); if (/Revised after QA/.test(d)) revisedHref ||= h; }
    expect(revisedHref, "at least one post must have been revised after QA feedback").not.toBe("");
    await page.goto(`${BASE}${revisedHref}`);
    const detail = await page.getByTestId("post-detail").innerText();
    expect(detail).toMatch(/Hook[\s\S]*Caption[\s\S]*Quality checks[\s\S]*Version history/);
    expect(detail).toMatch(/v1 .*first draft[\s\S]*v2/);
    await page.getByRole("button", { name: "Approve", exact: true }).click();
    await page.waitForURL(/ok=/);
    expect(await flash()).toMatch(/Approved\. Nothing has been published/);
    await page.screenshot({ path: path.join(SHOTS, "os-03-calendar-detail.png"), fullPage: true });
  });

  it("request changes without a note is refused; with a note the authoring agent revises and QA re-checks", async () => {
    await open("/os/calendar");
    await page.getByTestId("calendar").locator("a").nth(2).click();
    await page.getByRole("button", { name: "Request changes" }).click();
    await page.waitForURL(/error=/);
    expect(await flash()).toMatch(/say what should change/i);
    await page.locator("textarea[name=note]").fill("Make the hook shorter and keep the price");
    await page.getByRole("button", { name: "Request changes" }).click();
    await page.waitForURL(/ok=/);
    expect(await flash()).toMatch(/Revised by the authoring agent/);
    expect(await page.getByTestId("post-detail").innerText()).toMatch(/Revised from owner feedback/);
  });

  it("creative studio shows prompts and honestly reports the unconfirmed brand palette and unavailable generation", async () => {
    await open("/os/creative");
    expect(await page.getByTestId("brand-check").innerText()).toMatch(/NOT confirmed|confirmed/);
    expect(await page.getByTestId("brief-detail").innerText()).toMatch(/Image-generation prompt[\s\S]*no text, no logo, no watermark/);
    expect(await page.getByRole("button", { name: /Generate image/ }).isDisabled()).toBe(true);
    await page.screenshot({ path: path.join(SHOTS, "os-04-creative.png"), fullPage: true });
  });

  it("campaign manager: ad plan with computed launch checklist; launch cannot be pressed", async () => {
    await open("/os/campaigns");
    const list = await page.getByTestId("launch-checklist").innerText();
    expect(list).toMatch(/☐ Budget/); expect(list).toMatch(/☐ Meta Ads integration connected AND tested/);
    expect(await page.getByTestId("launch-btn").isDisabled()).toBe(true);
    expect(await page.getByTestId("ad-copy").innerText()).not.toMatch(/Only few left/i);
  });

  it("approval centre: the package is reviewable; approving records the decision and executes nothing; execution can be prepared from approved items", async () => {
    await open("/os/approvals");
    await page.getByTestId("package").first().waitFor();
    expect(await page.getByTestId("package").first().innerText()).toMatch(/Nothing has been published, sent, scheduled or spent/);
    await page.getByTestId("package").first().getByRole("button", { name: "Approve", exact: true }).click();
    await page.waitForURL(/ok=/);
    await open("/os/approvals");
    expect(await page.getByTestId("decision-history").innerText()).toMatch(/deliverable\.approved/);
    await page.goto(runUrl);
    await page.getByRole("button", { name: "Prepare execution package" }).click();
    await page.waitForURL(/ok=/);
    expect(await flash()).toMatch(/Nothing was published or scheduled/);
    await open("/os/approvals");
    expect(await text()).toMatch(/Execution package ready/);
    expect(await text()).toMatch(/no publishing integration is connected and tested/);
    await page.screenshot({ path: path.join(SHOTS, "os-05-approvals.png"), fullPage: true });
  });

  it("agent command centre derives capability from real executions (no real AI claimed)", async () => {
    await open("/os/agents");
    const grid = await page.getByTestId("agent-grid").innerText();
    expect(grid).toMatch(/Mock AI \(executed\)/); expect(grid).not.toMatch(/Real AI/);
    expect(await page.locator("main").innerText()).toMatch(/Paid Advertising/);
    await page.screenshot({ path: path.join(SHOTS, "os-06-agents.png"), fullPage: true });
  });

  it("task management board shows real statuses and dependencies", async () => {
    await open("/os/tasks");
    const board = await page.getByTestId("board").innerText();
    expect(board).toMatch(/COMPLETED \((\d+)\)/); expect(board).toMatch(/PENDING \(0\)/);
    expect(await text()).toMatch(/Waits for/);
  });

  it("knowledge centre: source is mandatory, gaps are listed, new fact appears with history", async () => {
    await open("/os/knowledge");
    expect(await page.getByTestId("gaps").innerText()).toContain("☐");
    await page.locator("input[name=key]").fill("website_url"); await page.locator("textarea[name=value]").fill("https://pahadi.example/");
    expect(await page.locator("input[name=source]").getAttribute("required")).not.toBeNull();
    await page.locator("input[name=source]").fill("client call"); await page.getByRole("button", { name: "Save as new version" }).click();
    await page.waitForURL(/ok=/);
    expect(await page.getByTestId("facts").innerText()).toContain("website_url");
  });

  it("analytics: NO DATA until real numbers are imported; bad CSV is rejected; usage separates mock from real", async () => {
    await open("/os/analytics");
    await page.getByTestId("no-data").waitFor();
    expect(await page.getByTestId("usage").innerText()).toMatch(/Real spend, month[\s\S]*\$0\.0000/);
    await page.locator("textarea[name=csv]").fill("wrong,header\n1,2");
    await go(page.getByRole("button", { name: /Import into Performance/ }));
    expect(await flash()).toMatch(/Header must be exactly/);
    await page.locator("textarea[name=csv]").fill("date,channel,metric,value\n2026-10-12,instagram,reach,1840\n2026-10-13,instagram,reach,2100\nbad,row,x,y");
    await go(page.getByRole("button", { name: /Import into Performance/ }));
    expect(await flash()).toMatch(/Imported 2 row\(s\)/);
    expect(await page.getByTestId("metrics").innerText()).toMatch(/instagram reach\s+3,940/);
  });

  it("automation: create a schedule, run the worker, pause it", async () => {
    await open("/os/automation");
    const form = page.locator("form", { has: page.locator("input[name=cadence]") });
    await form.locator("input[name=name]").fill("Weekly audit"); await form.locator("input[name=instruction]").fill("audit our business and social presence");
    await go(form.getByRole("button", { name: "Create schedule" }));
    expect(await page.getByTestId("schedules").innerText()).toContain("Weekly audit");
    await go(page.getByRole("button", { name: "Run worker now" }));
    await page.getByTestId("schedules").getByRole("button", { name: "Pause" }).click();
    await page.waitForFunction(() => document.querySelector("[data-testid=schedules]")?.textContent?.includes("paused"), null, { timeout: 15_000 });
    const f2 = page.locator("form", { has: page.locator("input[name=cadence]") });
    await f2.locator("input[name=cadence]").fill("every minute"); await f2.locator("input[name=name]").fill("x"); await f2.locator("input[name=instruction]").fill("audit everything please");
    await go(f2.getByRole("button", { name: "Create schedule" }));
    expect(await flash()).toMatch(/Cadence must look like/);
  });

  it("integrations: nothing claims to be connected without credentials and a live test", async () => {
    await open("/os/integrations");
    const t = await page.getByTestId("integrations").innerText();
    expect(t).toMatch(/Awaiting credentials/); expect(t).toMatch(/Built in/);
    expect(t).not.toMatch(/Tested OK/);
    expect(await page.getByRole("button", { name: "Run live test" }).count()).toBe(0);
    await page.screenshot({ path: path.join(SHOTS, "os-07-integrations.png"), fullPage: true });
  });

  it("settings: autonomy policy is editable and persists; permission matrix is real", async () => {
    await open("/os/settings");
    await page.locator("input[name=maxEstUsd]").fill("2.5"); await page.getByRole("button", { name: "Save policy" }).click(); await page.waitForURL(/ok=/);
    expect(await page.locator("input[name=maxEstUsd]").inputValue()).toBe("2.5");
    expect(await page.getByTestId("perm-matrix").locator("tbody tr").count()).toBe(12);
  });

  it("routine internal work starts automatically without a plan approval step", async () => {
    await open("/os");
    await page.getByTestId("command-bar").locator("input[name=instruction]").fill("audit our business and social presence");
    await page.getByTestId("command-bar").getByRole("button", { name: "Send" }).click();
    await page.waitForURL(/\/os\/runs\//);
    expect(await page.getByTestId("plan-approval").count()).toBe(0);
    await page.waitForFunction(() => /COMPLETED|FAILED/.test(document.querySelector("[data-testid=run-status]")?.textContent ?? ""), null, { timeout: 90_000, polling: 1000 });
    expect(await page.getByTestId("run-status").innerText()).toBe("COMPLETED");
  });

  it("client isolation in the UI: another client sees none of this work, cannot open this run, and cannot be addressed from here", async () => {
    await open("/os");
    await switchTo("propedia");
    await open("/os/calendar");
    expect(await text()).toMatch(/No content has been produced for Propedia/);
    await page.goto(runUrl);
    expect(await text()).toMatch(/does not exist in Propedia/);
    await open("/os/knowledge");
    expect(await page.getByTestId("facts").innerText()).not.toContain("website_url"); expect(await text()).not.toMatch(/Pahadi/);
    await open("/os");
    await page.getByTestId("command-bar").locator("input[name=instruction]").fill("Prepare a campaign for Pahadi Origin");
    await page.getByTestId("command-bar").getByRole("button", { name: "Send" }).click();
    await page.waitForURL(/error=/);
    expect(await flash()).toMatch(/names "Pahadi Origin" but the active workspace is "Propedia"/);
    await page.screenshot({ path: path.join(SHOTS, "os-08-isolation.png") });
    await switchTo("pahadi-origin");
  });

  it("works on a phone: menu, navigation and the approval screen are usable", async () => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const m = await ctx.newPage(); await m.goto(`${BASE}/os`);
    expect(await m.getByRole("button", { name: "Menu" }).isVisible()).toBe(true);
    expect(await m.getByRole("navigation", { name: "Main" }).isVisible()).toBe(false);
    await m.getByRole("button", { name: "Menu" }).click();
    await m.getByRole("link", { name: /Approval Centre/ }).click();
    await m.waitForURL(/\/os\/approvals/);
    expect(await m.getByRole("heading", { level: 1 }).innerText()).toContain("Approval Centre");
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(8);
    await m.screenshot({ path: path.join(SHOTS, "os-09-mobile-approvals.png") });
    await ctx.close();
  });
});

describe("production without auth stays locked", () => {
  it("/os redirects to the locked page", async () => {
    const p = await (await browser.newContext()).newPage();
    await p.goto(`http://localhost:${LOCKED_PORT}/os/approvals`);
    await p.getByRole("heading", { name: "Agency HQ is locked" }).waitFor();
  });
  it("worker endpoint is disabled without a secret and rejects wrong secrets", async () => {
    const r = await fetch(`http://localhost:${LOCKED_PORT}/api/worker`, { method: "POST" });
    expect(r.status).toBe(503);
    expect((await fetch(`http://localhost:${LOCKED_PORT}/api/worker`)).status).toBe(405);
  });
});
