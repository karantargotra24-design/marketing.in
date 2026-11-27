# ScapeMedia

The design system for **ScapeMedia**, a performance marketing agency in Jammu, founded by Karan Targotra. One system for the website, proposals, audits, PDFs and social creatives.

> Red, black and white. Red only where the eye must land.

## Who ScapeMedia is

A founder-led performance marketing agency. It focuses on sales and marketing: ads that bring enquiries, enquiries that become customers. It is not a training business; no courses are sold under ScapeMedia.

**Services (the only five we present):**

| Service | What it covers |
| --- | --- |
| Performance marketing | Meta Ads and Google Ads, lead generation, tracking and optimisation |
| Websites & landing pages | Fast, mobile-first sites built to convert ad traffic |
| Google Business Profile | GMB setup, optimisation, posts and reviews for local search |
| Branding & creative strategy | Positioning, messaging and ad creative direction |
| CRM & automation | Lead capture, routing, WhatsApp follow-up and reporting |

**Industries we work in** (named by category, never by client): Automotive · Real estate · Education & visas · Healthcare · Hospitality · Retail · Food & e-commerce.

## Content fundamentals

**Voice.** Confident, plain, specific. We speak as ScapeMedia ("we"); Karan appears by name as founder. Short sentences. Business words (leads, customers, sales, cost per lead), not social words (views, likes, followers).

**Three hard rules on every public page and PDF**

1. **No prices.** Pricing is shared only after a call.
2. **No numbers about results or audience.** No views, followers, spend, leads, bookings or revenue figures.
3. **No client names or logos.** Show work by industry ("Automotive dealership, Jammu"), never by brand.

| Do | Don't |
| --- | --- |
| "Ads built to bring customers, not just reach." | "We got 7 lakh views." |
| "Automotive dealership · Meta Ads lead campaigns" | "Jammu Motors: 151 bookings" |
| "Book a free growth audit." | "Packages from ₹6,000/month" |
| One clear CTA per section | Fake urgency, "guaranteed results", emoji |

**Headlines.** Serif sentence + one punch word in red caps. Example: *Advertising that brings* **CUSTOMERS.** One punch word per headline.

## Visual foundations

### Colour: red, black, white

| Token | Value | Use |
| --- | --- | --- |
| `red` | #E10600 | The brand colour. Punch word, numbers in documents, arrows, primary buttons, links |
| `black` | #0A0A0A | Ink on white; dark sections, footer, document covers |
| `white` | #FFFFFF | Default page ground; ink on black |
| `red-bright` | #FF3B30 | Small red text on black only |
| `red-deep` | #B00500 | Hover / pressed red buttons |
| greys | #F5F5F5 · #E6E6E6 · #5C5C5C · #A3A3A3 · #262626 · #161616 | Surfaces, hairlines and muted text only. Never a feature colour. |

**Proportion:** about 70% white, 25% black, 5% red. **The red rule:** one red element per section (a punch word, a number, an arrow or the main button). The only red slab allowed is the final call-to-action band. No gradients, no orange, no blue, no beige.

**Why #E10600:** it is the red already used across the ScapeMedia PDFs and website v2, and it passes 4.97:1 on white, so one red works for headlines, buttons and small links. Pure #FF0000 fails for small text (4.0:1). Use #E10600 in the personal brand too, so both brands share one red.

**Contrast:** ink on surface 18:1+ in both themes; ink-muted 6.1:1+; white on red 4.97:1; red-bright on black 5.6:1.

### Typography: the same pairing as Karan's personal brand

1. **Instrument Serif**: headlines. Carries the sentence.
2. **Plus Jakarta Sans 800**: the one punch word (uppercase, red), card titles, buttons, the wordmark.
3. **Inter**: body, labels, forms, captions.

All free on Google Fonts. Max three sizes per screen; one punch word per headline.

### Layout

- 12-column grid, max width 1240px, 96px section padding (64px mobile).
- Whitespace is the premium signal. Generous margins, nothing crowded.
- Sections alternate **white → light grey → black**; end every page on the red CTA band and a black footer.
- Corners: square for sections, photos and documents; 12px cards; 6px buttons; pills for tags only.
- Depth: flat. One soft shadow (`shadow-card`) for form cards only.

### Imagery

Real photos of Karan, graded neutral-to-warm with deep blacks (the red-lit portrait is the signature shot). Real screens of work with client names and numbers blurred. Industry photos may be stock, clearly generic. Never AI faces presented as real people, never text over a face.

### Motion

Fade-up on scroll (400ms), button hover, one marquee strip at most. Respect reduced-motion. No 3D, no scroll-jacking.

## Logo and wordmark

No logo mark exists yet; none is invented here. The wordmark used across the website and PDFs is a **red dot + "ScapeMedia"** in Plus Jakarta Sans 800, tracking −0.01em.

- On white: black text, red dot. On black: white text, red dot.
- Clear space: the dot's diameter × 2 on all sides. Minimum 16px text height.
- Never: red text wordmark, outlines, shadows, stretched or italic.

## Iconography

Text-first. The arrow `→` in accent is the recurring glyph. Simple 1.5px line icons only where a card needs one, in ink. No emoji, no icon packs with filled colours, no third-party logos except inside real screenshots.

## Components

Button · Tag · SectionHeader · ServiceCard · IndustryCard · ProcessStep · CTABand · DocCover. Plain HTML + `components/bundle.css` classes (`sm-…`), so they rebuild directly in the website, in PDFs and as Canva templates.

## Open decisions

- **Logo mark:** wordmark only for now. A mark can be designed later.
- **Personal brand red:** Karan's personal design system uses #FF0000. Switching it to #E10600 makes both brands one red.
- **Photography:** a fresh shoot of Karan at work (laptop, client meeting, dashboard) would replace stock on the website.
