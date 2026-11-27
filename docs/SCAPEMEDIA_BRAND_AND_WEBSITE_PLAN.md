# ScapeMedia: brand analysis and website plan (Phase 1 to 3, for approval)

Prepared 27 Nov 2026. Nothing has been built or deployed from this plan. It waits for Karan's approval.

## 0. What was inspected

| Source | Status | What it is |
|---|---|---|
| Design system artifact (claude.ai/artifact/UbtRJonFkiJS8sAHsCJ7TL) | Read: README, tokens.json, reference audit | **Karan Targotra personal brand** system, v2 (Oct 2026). Not a ScapeMedia system. |
| Wix site (headless-larvutfbydw…wix-site-host.com) | Inspected: home page desktop + mobile, computed styles; inner pages respond 200 | "ScapeMedia by Karan Targotra". Applies the personal-brand system to the agency. |
| Live site www.scapemedia.in | Inspected 27 Nov | Older dark + orange build (12 Nov). |
| `website/v2` in repo | Inspected | Meta Ads specialist build, recoloured white + red on 27 Nov, **not deployed**. |
| Onboarding PDFs, Jammu Motors proposal reference | Seen earlier in this project | Black / white / red #E10600, Poppins. |
| **Astrology Growth Strategy PPT** | **Not available** | Not uploaded to this session. |
| **SA Visa Central 360° Audit PPT** | **Not available** | Not uploaded to this session. |
| **SA Visa Central Audit & Growth System (Excel)** | **Not available** | Not uploaded to this session. |

The three client files in the brief could not be read, so nothing below is drawn from them. Phase 1 is incomplete until they are uploaded.

## 1. Brand identity analysis

**Finding: ScapeMedia has no single identity yet.** Four directions exist side by side:

| Direction | Where | Colours | Type |
|---|---|---|---|
| A. Personal brand v2 | Design system, Wix site | White, sand, espresso, cream, red | Instrument Serif + Plus Jakarta Sans + Inter |
| B. Dark cinematic orange | Live site | Near-black, orange #FF6200 | Space Grotesk + Inter |
| C. Black / white / red | Onboarding PDFs | #0A0A0A, #FFFFFF, #E10600 | Poppins + Inter |
| D. White / red (27 Nov) | `website/v2`, not live | White, #E10600 | Space Grotesk + Inter |

What is consistent across Karan's own choices since October: **red as the single signature colour, used sparingly, on a white or black ground; no blue; real photos of Karan; no invented numbers.** Orange (B) has been rejected by Karan. Red is the brand.

What is not consistent: the exact red (three values), the typeface, and whether the warm sand / espresso palette belongs to ScapeMedia or only to Karan's personal content.

**Positioning observed on the Wix site:** founder-led ("I"), practitioner tone ("tested, explained"), eight services, transparent "Jammu rates", courses and community. This is closer to a personal consultancy than to the "premium international agency" in the brief. That is a strategic choice for Karan to confirm (section 8).

## 2. Colour palette with confidence levels

Observed means the value was read from a file or computed style. Proposed means it is my recommendation.

| Role | HEX | Source | Confidence |
|---|---|---|---|
| Signature red (text, key word) | #FF0000 | Design system `brand-red`; Wix headline accents (computed rgb 255,0,0) | **High, observed** |
| Red for buttons | #DC2626 | Wix button fill (computed rgb 220,38,38); suggested in the design system's open decisions | **High, observed** |
| Red used in agency PDFs and v2 site | #E10600 | Onboarding PDFs; derived from Karan's red-lit portrait | Medium, observed (my earlier pick, not in the design system) |
| Black / ink | #000000 (system), #111111 (Wix body text), #0A0A0A (PDFs) | Observed | High |
| White | #FFFFFF | Observed | High |
| Sand (warm ground) | #EDE5D8 | Design system, Wix sections | High, observed |
| Espresso (warm dark ground) | #2A211B | Design system, Wix sections | High, observed |
| Cream (text on dark/photos) | #F5EFE3 | Design system | High, observed |
| Stone (muted on dark) | #C9B8A3 | Design system | High, observed |
| Clay (small labels) | #7A5A40 | Design system | High, observed |
| Muted grey text | **#666666 proposed** | Design system currently has `gray-500` = #F3F3F3 (unreadable on white) | Proposed fix |
| Hairline on white | #E5E5E5 | Design system `gray-200` | High, observed |

**Recommendation (proposed):** one red family, not three.
- `red` #FF0000 for large type only (24px+). It is 4.0:1 on white, which fails for small text.
- `red-strong` #DC2626 for buttons, links and any red text under 24px (4.8:1 with white).
- Retire #E10600 and #FF6200.
- Grounds: white (main), sand #EDE5D8 (alternate sections), espresso #2A211B (one or two feature bands, footer).

## 3. Typography recommendation

Observed on the Wix site and in the design system: **Instrument Serif** (headlines), **Plus Jakarta Sans ExtraBold** (one punch word, buttons, small headings), **Inter** (body, 17px).

Recommendation: **keep this pairing for ScapeMedia.** It is the only typography Karan has documented as a system, it is already live on the Wix build, and the serif and sans contrast is what makes it look editorial rather than template. Drop Poppins and Space Grotesk.

| Role | Font | Size (desktop / mobile) |
|---|---|---|
| Display / H1 | Instrument Serif 400 | 72–80 / 44 |
| Punch word | Plus Jakarta Sans 800, uppercase, red | 1.05em of the headline |
| H2 | Instrument Serif 400 | 48 / 34 |
| H3, card titles | Plus Jakarta Sans 700 | 22 / 20 |
| Body | Inter 400 | 17 / 16, line height 1.65 |
| Labels, eyebrows | Inter 600, uppercase, 0.14em tracking | 12 |

All three are free Google Fonts.

## 4. Reference design analysis (Wix site)

**Keep**
- Editorial serif + sans headlines with one red punch word. Distinctive and on-brand.
- White / sand / espresso rhythm between sections.
- Clear service grid, four-step process, FAQ, WhatsApp-first enquiry form.
- Honest framing ("no guaranteed-results promises").

**Improve or fix**
1. **Confidential client data is published.** The Jammu Motors band shows ad spend (~₹87K), responses (1,619), bookings (151), retails (116) and an estimated ₹5.8 Cr sales value. Earlier in this project these figures were marked confidential, and the onboarding PDF removed them. Needs Karan's and the client's written approval, or removal.
2. **Instagram views case card** ("802.3K, +30.7%") conflicts with "don't show off audience numbers".
3. **Pricing section** ("Clear prices, Jammu rates") shows ₹3,000–₹12,000 packages. The onboarding PDF deliberately had no pricing. Decide one policy.
4. **Placeholder imagery:** the four "B-roll" tiles and the About photo are blurred placeholders. Real photos of Karan exist in the repo.
5. **Logo:** a black "S" square is a placeholder. The design system says no logo exists yet.
6. **Stale copy:** "Next batches start in November 2026".
7. **Footer legal links** stack one per line on desktop (layout bug).
8. **Voice:** first person ("I", "Work with me") reads as a freelancer. Fine for founder-led, weaker for "premium agency".

**Live site (scapemedia.in), for comparison:** older orange build, no Meta Pixel, broken "✦" characters (missing UTF-8 charset), Instagram view statistics, no sitemap. It should be replaced whichever direction is chosen.

## 5. Proposed sitemap

Services marked "verify" are in the brief but have no evidence in the materials I could read.

```
Home
Services
  Meta Ads & Performance Marketing        (evidence: all sources)
  Lead Generation & CRM Automation        (evidence: Wix, v2; CRM part: verify)
  Social Media Management & Content       (evidence: Wix)
  Websites & Landing Pages                (evidence: Wix)
  Branding & Creative Strategy            (verify; SA Visa audit may support it)
  Google Ads                              (evidence: old live site only; verify)
  AI & Automation                         (evidence: Wix)
  Growth Consulting / Audits              (evidence: Wix, SA Visa)
Work (portfolio)
  Case: Jammu Motors (automotive)        approved facts only
  Case: SA Visa Central (education & visas, completed)
  Case: Astrology business (growth strategy)  needs files and permission
  Case: Propedia (real estate, ongoing)
  Upcoming: Pahadi Origin
About (Karan, approach, certifications)
Learn (courses + community)               keep or move off the agency site: decision
Contact / Free growth audit
Legal: Privacy, Terms, Refunds (refunds needed only if courses are sold)
```

## 6. Homepage wireframe (proposed)

```
[Nav]  ScapeMedia wordmark ........ Services  Work  About  Learn ..... [Get a growth audit]

[Hero, white]
  eyebrow: PERFORMANCE MARKETING · JAMMU & KASHMIR
  H1 (serif): Advertising that turns attention into  [PUNCH: CUSTOMERS.]
  sub (Inter): Meta Ads, lead generation and creative for growing businesses.
  [Get a free growth audit]  [See our work]
  right: real photo of Karan at work (graded warm), no text over the face

[Proof strip]  client names / industries as text, no logos without permission

[Services, white]   6 cards, 2 x 3, serif number + title + one-line outcome

[How we work, espresso band]   Discover → Plan → Launch → Optimise → Report

[Selected work, sand]   3 case cards: client, industry, challenge, what we did,
                        result ONLY where approved, else "Results private at client's request"

[Industries, white]   automotive, real estate, education, healthcare, hospitality, retail

[About Karan, white]   real photo, short story, certifications

[FAQ, sand]

[CTA + form, espresso or red]   "Tell us what you want to grow." WhatsApp-first form

[Footer, espresso]   wordmark, links, contact, legal, Meta trademark line
```

Mobile: single column, sticky "Get a growth audit" + WhatsApp button at the bottom, hero photo below the headline.

## 7. Visual direction and design system

- **Mood:** editorial, warm, confident. Magazine, not tech startup.
- **Red rule:** one red element per section (punch word, number or CTA). Never a red background slab except the final CTA band, if approved.
- **Imagery:** real photos of Karan and real (blurred-where-needed) work screenshots. No AI faces, no stock "team in office".
- **Shape:** square editorial blocks; 12px radius on cards only; 6px on buttons; pills for tags.
- **Motion:** fade-up on scroll, marquee strip, button hover. Respect reduced-motion. No WebGL or heavy scroll-jacking.
- **Components:** Button (primary red-strong, secondary outline), Tag, Service card, Case card, Process step, FAQ item, Quote, Form field, Section header (eyebrow + serif H2 + punch).
- **Tech stack (proposed):** static HTML/CSS/JS (as now), deployed to Hostinger. It is fast, free to host and easy to edit. Move to Next.js only if a CMS or blog is needed.
- **Accessibility:** body text 4.5:1 minimum, red text under 24px uses #DC2626, visible focus rings, alt text on every photo.

## 8. Decisions that need Karan's approval

1. **Upload the three client files** (Astrology PPT, SA Visa PPT, SA Visa Excel). Phase 1 cannot finish without them.
2. **Brand base:** adopt the documented personal-brand system (white + sand + espresso + red, Instrument Serif + Plus Jakarta + Inter) for ScapeMedia? Or keep ScapeMedia strictly white + red, with the warm colours staying personal only?
3. **One red:** #FF0000 (large) + #DC2626 (buttons/small)? Or keep #E10600?
4. **Voice:** founder-led ("I", "Work with me") or agency ("we", "our team")?
5. **Pricing on the website:** show starting prices or not?
6. **Jammu Motors figures:** remove, or get the client's written OK to publish? The same question applies to Instagram view numbers.
7. **Services list:** confirm Google Ads, Branding & Creative Strategy and CRM Automation are real offerings today.
8. **Courses and community:** keep on scapemedia.in, or move to a separate learning site?
9. **Logo:** keep a wordmark only (recommended for now), or commission a mark?
10. **Which build becomes the live site:** the Wix build, or a rebuild in the repo on Hostinger?
11. **The white + red `website/v2`** made today is committed but not deployed. Hold it, or ship it now as a stop-gap while the full site is built?
