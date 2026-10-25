import { z } from "zod";

export const platforms = ["instagram", "facebook", "google_business"] as const;
export const formats = ["post", "reel", "carousel"] as const;
export const languages = ["english", "hinglish"] as const;

export const contentRequestSchema = z.object({
  clientName: z.string().trim().min(1).max(120),
  industry: z.string().trim().max(80).default(""),
  city: z.string().trim().max(80).default(""),
  platform: z.enum(platforms),
  format: z.enum(formats),
  topic: z.string().trim().min(3, "Topic needs at least 3 characters").max(200),
  tone: z.string().trim().max(80).default("friendly"),
  language: z.enum(languages).default("hinglish"),
  brand: z
    .object({ usps: z.array(z.string()).default([]), doNot: z.array(z.string()).default([]) })
    .default({ usps: [], doNot: [] }),
});
export type ContentRequest = z.infer<typeof contentRequestSchema>;

export const contentDraftSchema = z.object({
  hook: z.string().min(1).max(150),
  caption: z.string().min(1).max(2200),
  hashtags: z.array(z.string().regex(/^#\w+$/)).max(15),
  script: z.array(z.string().min(1)).optional(),
  carouselSlides: z.array(z.string().min(1)).max(10).optional(),
  editingNotes: z.array(z.string().min(1)).optional(),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(160),
  altText: z.string().max(200),
  qaFlags: z.array(z.string()),
});
export type ContentDraft = z.infer<typeof contentDraftSchema>;

/** Any AI backend (mock now, Claude later) implements this one function. */
export type ContentProvider = {
  name: string;
  isMock: boolean;
  generate(request: ContentRequest): Promise<unknown>;
};
