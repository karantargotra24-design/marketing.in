import { describe, expect, it } from "vitest";
import { brandFromForm, brandProfileSchema, parseList } from "./brandProfile";

describe("parseList", () => {
  it("splits on commas and new lines, trims, removes blanks and duplicates", () => {
    expect(parseList(" a, b\n\nc ,a")).toEqual(["a", "b", "c"]);
  });
});

describe("brandProfileSchema", () => {
  it("needs a name", () => {
    expect(brandProfileSchema.safeParse({ name: " " }).success).toBe(false);
  });
  it("rejects bad colors", () => {
    expect(brandProfileSchema.safeParse({ name: "X", brandColors: ["red"] }).success).toBe(false);
  });
  it("fills defaults", () => {
    const b = brandProfileSchema.parse({ name: "X" });
    expect(b.tone).toBe("friendly");
    expect(b.monthlyLeadTarget).toBeNull();
  });
});

describe("brandFromForm", () => {
  it("builds a profile from form fields", () => {
    const f = new FormData();
    f.set("name", "Jammu Motors");
    f.set("doNot", "fixed price, guaranteed");
    f.set("monthlyLeadTarget", "40");
    const r = brandFromForm(f);
    expect(r.success && r.data.doNot).toEqual(["fixed price", "guaranteed"]);
    expect(r.success && r.data.monthlyLeadTarget).toBe(40);
  });
});
