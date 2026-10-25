import type { ContentProvider, ContentRequest } from "./schema";

const slug = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "");

/** Fake writer: fills templates. Clearly NOT AI. Used until a real AI key is configured. */
export const mockProvider: ContentProvider = {
  name: "Mock writer (no AI connected)",
  isMock: true,
  async generate(r: ContentRequest) {
    const hi = r.language === "hinglish";
    const where = r.city ? ` in ${r.city}` : "";
    const hook = hi ? `${r.topic}? Yeh zaroor padhein 👇` : `${r.topic}? Read this before you decide 👇`;
    const usp = r.brand.usps[0] ? ` ${r.brand.usps[0]}.` : "";
    const caption = hi
      ? `${hook}\n\n${r.clientName}${where} mein hum ${r.topic.toLowerCase()} ko aasan banate hain. [CONFIRM OFFER]${usp}\n\nAaj hi visit karein ya DM karein.`
      : `${hook}\n\nAt ${r.clientName}${where}, we make ${r.topic.toLowerCase()} simple. [CONFIRM OFFER]${usp}\n\nVisit us or send a DM today.`;
    const tags = [r.clientName, r.city, r.industry, r.platform === "instagram" ? "InstagramIndia" : "LocalBusiness"]
      .map(slug)
      .filter(Boolean)
      .map((t) => `#${t}`);
    return {
      hook,
      caption,
      hashtags: [...new Set(tags)],
      script:
        r.format === "reel"
          ? [`0-3s: ${hook}`, `3-15s: Show ${r.topic.toLowerCase()} at ${r.clientName}`, "15-25s: One clear benefit on screen", "25-30s: Call to action"]
          : undefined,
      carouselSlides:
        r.format === "carousel"
          ? [hook, `What is ${r.topic}?`, "3 things to know", "Common mistakes", `Talk to ${r.clientName}`]
          : undefined,
      editingNotes: r.format === "reel" ? ["Vertical 9:16", "Captions on screen", "Add trending audio manually"] : undefined,
      seoTitle: `${r.topic}${where} | ${r.clientName}`.slice(0, 70),
      seoDescription: `${r.clientName}${where}: ${r.topic}. Visit or message us to know more.`.slice(0, 160),
      altText: `${r.clientName} ${r.topic}`.slice(0, 200),
      qaFlags: [],
    };
  },
};
