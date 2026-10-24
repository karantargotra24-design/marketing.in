import { describe, expect, it } from "vitest";
import { loginSchema, newClientSchema } from "./clientSchema";

describe("newClientSchema", () => {
  it("requires a name", () => {
    expect(newClientSchema.safeParse({ name: "  " }).success).toBe(false);
  });
  it("turns empty optional fields into null", () => {
    const r = newClientSchema.parse({ name: " Jammu Motors ", industry: "", city: "Jammu" });
    expect(r).toEqual({ name: "Jammu Motors", industry: null, city: "Jammu" });
  });
  it("rejects very long names", () => {
    expect(newClientSchema.safeParse({ name: "x".repeat(121) }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("lowercases email and enforces password length", () => {
    expect(loginSchema.parse({ email: " A@B.com ", password: "12345678" }).email).toBe("a@b.com");
    expect(loginSchema.safeParse({ email: "a@b.com", password: "short" }).success).toBe(false);
  });
});
