import { describe, expect, it } from "vitest";
import { getAppMode } from "./appMode";

describe("getAppMode", () => {
  it("defaults to mock when unset", () => {
    expect(getAppMode(undefined)).toBe("mock");
  });
  it("falls back to mock for unknown values", () => {
    expect(getAppMode("banana")).toBe("mock");
  });
  it("returns real only when explicitly set", () => {
    expect(getAppMode("real")).toBe("real");
  });
});
