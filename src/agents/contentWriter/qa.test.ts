import { describe, expect, it } from "vitest";
import { checkDraftText } from "./qa";

describe("checkDraftText", () => {
  it("flags client do-not phrases case-insensitively", () => {
    expect(checkDraftText("Get a FIXED PRICE today", ["fixed price"])[0]).toContain("fixed price");
  });
  it("flags risky claims", () => {
    expect(checkDraftText("Guaranteed results", []).length).toBe(1);
  });
  it("flags unresolved placeholders", () => {
    expect(checkDraftText("Offer: [CONFIRM OFFER]", []).length).toBe(1);
  });
  it("returns nothing for clean text", () => {
    expect(checkDraftText("Visit our showroom", ["fixed price"])).toEqual([]);
  });
});
