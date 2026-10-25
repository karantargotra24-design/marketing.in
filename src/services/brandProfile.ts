import { z } from "zod";

/** "a, b\nc" -> ["a","b","c"] (trimmed, no blanks, no duplicates, max 20). */
export function parseList(value: string): string[] {
  return [...new Set(value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean))].slice(0, 20);
}

export const tones = ["friendly", "professional", "premium", "playful", "local & warm"] as const;

export const brandProfileSchema = z.object({
  name: z.string().trim().min(1, "Client name is required").max(120),
  industry: z.string().trim().max(80).default(""),
  city: z.string().trim().max(80).default(""),
  audience: z.string().trim().max(300).default(""),
  tone: z.enum(tones).default("friendly"),
  language: z.enum(["english", "hinglish"]).default("hinglish"),
  usps: z.array(z.string().max(120)).max(20).default([]),
  doNot: z.array(z.string().max(120)).max(20).default([]),
  competitors: z.array(z.string().max(120)).max(20).default([]),
  goal: z.string().trim().max(300).default(""),
  monthlyLeadTarget: z.number().int().min(0).max(100000).nullable().default(null),
  brandColors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/, "Colors look like #C2410C")).max(6).default([]),
});
export type BrandProfile = z.infer<typeof brandProfileSchema>;
export type SavedBrand = BrandProfile & { id: string };

export function brandFromForm(f: FormData) {
  const target = String(f.get("monthlyLeadTarget") ?? "").trim();
  return brandProfileSchema.safeParse({
    name: f.get("name") ?? "",
    industry: f.get("industry") ?? "",
    city: f.get("city") ?? "",
    audience: f.get("audience") ?? "",
    tone: f.get("tone") ?? "friendly",
    language: f.get("language") ?? "hinglish",
    usps: parseList(String(f.get("usps") ?? "")),
    doNot: parseList(String(f.get("doNot") ?? "")),
    competitors: parseList(String(f.get("competitors") ?? "")),
    goal: f.get("goal") ?? "",
    monthlyLeadTarget: target === "" ? null : Number(target),
    brandColors: parseList(String(f.get("brandColors") ?? "")),
  });
}
