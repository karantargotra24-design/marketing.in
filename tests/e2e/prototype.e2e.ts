import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type Page } from "playwright";
import path from "node:path";

const URL_ = "file://" + path.join(process.cwd(), "docs", "prototype", "index.html");
let browser: Browser; let page: Page;
const text = async () => page.locator("#screen").innerText();
const go = async (label: string) => { await page.locator("#nav a", { hasText: label }).first().click(); };

beforeAll(async () => { browser = await chromium.launch(); page = await (await browser.newContext({ viewport: { width: 1360, height: 900 } })).newPage(); await page.goto(URL_); });
afterAll(async () => { await browser?.close(); });

describe("clickable UI prototype (design only; sample data)", () => {
  it("is visibly labelled as a prototype and lists all 15 required sections", async () => {
    expect(await page.locator("#banner").innerText()).toMatch(/PROTOTYPE.*SAMPLE.*nothing executes/s);
    const labels = await page.locator("#nav a").allInnerTexts();
    for (const l of ["Agency Overview", "Client Management", "Client Knowledge Centre", "AI Agent Command Centre", "Task Management", "Research & Audit", "Marketing Strategy", "Content Calendar", "Creative Studio", "Campaign Manager", "Approval Centre", "Analytics & Reports", "Automation Centre", "Integrations", "Settings & Permissions"])
      expect(labels.some((x) => x.startsWith(l)), l).toBe(true);
  });
  it("every screen states what is built today", async () => {
    for (const l of ["Strategy", "Calendar", "Creative", "Campaign", "Automation", "Settings"]) { await go(l); expect(await text()).toMatch(/Today in the app: Not built/); }
    for (const l of ["Overview", "Knowledge", "Agent Command", "Approval Centre", "Integrations"]) { await go(l); expect(await text()).toMatch(/Today in the app: Partial/); }
  });
  it("client switcher changes the data, not just the title (isolation)", async () => {
    await page.selectOption("#client", "propedia"); await go("Knowledge");
    let t = await text(); expect(t).toContain("colors@diagnostic-doc"); expect(t).not.toContain("Akharot");
    await page.selectOption("#client", "pahadi"); t = await text(); expect(t).toContain("offer_products"); expect(t).not.toContain("JKRERA");
  });
  it("agent command centre shows real capability levels: no agent claims real AI", async () => {
    await go("Agent Command");
    const t = await text();
    expect(t).toContain("Rules + Mock AI tested"); expect(t).toContain("Rules only");
    expect(t).not.toMatch(/Real AI: ?(yes|active)/i);
    expect(await page.locator("#screen .badge.b-ok").count()).toBe(0);
  });
  it("calendar enforces the QA gate: a post with unverified claims cannot be approved", async () => {
    await go("Content Calendar");
    await page.locator(".post", { hasText: "5 Pahadi products" }).click();
    expect(await page.getByRole("button", { name: "Approve", exact: true }).isDisabled()).toBe(true);
    await page.locator(".post", { hasText: "Akharot giri" }).click();
    expect(await page.getByRole("button", { name: "Approve", exact: true }).isDisabled()).toBe(false);
  });
  it("approval centre: approving records a decision and states that nothing executes; blocked ad launch cannot be approved", async () => {
    await go("Approval Centre");
    await page.locator("tr[data-sel]", { hasText: "Week plan" }).click();
    await page.getByRole("button", { name: "Approve", exact: true }).click();
    expect(await text()).toMatch(/Execution: none/);
    await page.locator("tr[data-sel]", { hasText: "Meta ‘COD traffic test’" }).click();
    expect(await text()).toMatch(/cannot be approved yet/);
    expect(await page.getByRole("button", { name: "Approve", exact: true }).count()).toBe(0);
  });
  it("analytics says NO DATA instead of showing numbers; sample layout is explicitly labelled", async () => {
    await go("Analytics"); expect(await text()).toMatch(/NO DATA/);
    await page.getByRole("button", { name: /sample numbers/ }).click();
    expect(await text()).toMatch(/ILLUSTRATIVE LAYOUT ONLY/);
  });
  it("campaign launch stays disabled; integrations show nothing connected", async () => {
    await go("Campaign");
    expect(await page.getByRole("button", { name: /launch approval/ }).isDisabled()).toBe(true);
    await go("Integrations");
    expect(await page.locator("#screen .badge.b-ok").count()).toBe(0);
  });
  it("instruction bar opens an orchestrator plan marked as simulated", async () => {
    await page.fill("#ask", "Build next week's content plan"); await page.click("#send");
    const m = await page.locator("#modal").innerText();
    expect(m).toContain("SIMULATED PREVIEW"); expect(m).toContain("Content Strategist"); expect(m).toContain("YOU — Approval Centre");
    await page.getByRole("button", { name: /Approve plan/ }).click();
    await page.waitForFunction(() => document.getElementById("pb0")?.style.width === "100%");
    await page.locator("#modal button", { hasText: "Cancel" }).click();
  });
});
