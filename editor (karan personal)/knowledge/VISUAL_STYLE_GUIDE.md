# Visual Style Guide

Status: **Karan's personal brand = VERIFIED (Design System v2).** Reel editing pattern = from 4 reference reels. Slide decks = follow brand system until PPT refs arrive.

## 0D. KARAN'S OWN REELS = REFERENCE STYLE A (Karan, 31 Oct 2026)
Reels follow the reference reel format, Style A Clean Tech Minimal: black title box hook (white sentence-case text), thin white 1–3 word captions with one bold word, white/near-white app-screen cutaways (chat mock or real screenshot) with a red highlight outline, thin-line diagrams, white rounded "Comment" pill with black circle arrow overlaid on the talking head at the end, cut every 3–5 s, −14 LUFS. Colours: black/white + red accent only; tool logos in official colours. Unique keyword per reel. Generator: `projects/reels/R01_5-tasks-to-AI/cutaways_generator_styleA.py`.

## 0C. CAROUSEL ROTATION — Karan, 31 Oct 2026 (wins over 0B)
Never post the same carousel look twice in a row. Rotate 3 variants in this fixed order, one per carousel upload (a carousel goes out every 3–4 days):
1. **B+D: Glass + Sticker.** Glass base + tilted app-icon stickers, red marker circle/arrows, yellow highlighter tags. Stickers and marker on covers and flow slides; text-heavy slides stay plain glass. Sample: `projects/carousel-system-preview/carousel_direction_BD_glass-sticker.png`.
2. **B: Glass.** See §0B.
3. **D: Sticker Collage.** White dot-grid ground, sticker app icons, red marker, yellow highlighter, black type. Sample: `carousel_directions_ABCD.png` (D).
**Colour rule (Karan, 31 Oct 2026): backgrounds, glows, highlighter tags, arrows, icon tiles and cards use ONLY Karan's palette (black #0B0B0B, white, red #FF0000, greys #E6E6E6/#6B6B6B).** Glows = red + white blur. Highlighter = white tag with black text (red tag for the key line), hard black drop shadow. No purple, green, blue or yellow elements. Tool logos keep official colours (per Karan's earlier ask; confirm if he wants these in brand colours too).
Preview of all 3: `projects/carousel-system-preview/carousel_rotation_3_variants_brand-colours.png`.
Then back to 1. Shared across all three: red punch/CTA, official-colour logos, Hinglish, Comment "AI" pill, real photos only.
Track the last variant used in `projects/weekly-content/ROTATION_LOG.md` and pick the next one in order.

## 0B. CAROUSEL STANDARD = DIRECTION B "GLASS" — Karan picked B, 31 Oct 2026 (wins over 0A where they differ)
- Ground: black #0B0B0B with 3–4 soft **brand-colour blur blobs** (Claude #D97757, Canva purple #7D2AE8, WhatsApp #25D366, Meta #0467DF), blur ~30px, opacity ~.6–.75. Pick blob colours from the tools in that post.
- Content sits on **frosted glass cards**: rgba(255,255,255,.10) fill, 1.5px rgba(255,255,255,.28) border, 36px radius, backdrop blur 18px, soft shadow.
- Logos: official brand-colour app-icon tiles (ChatGPT = black tile). Glass tiles with white logos for cover rows.
- Text white; red #FF0000 for the punch line, step numbers and the FREE/CTA badge only.
- Photo covers: Karan's real photo full-bleed, glass headline card placed off the face.
- Reference: `projects/carousel-system-preview/carousel_directions_ABCD.png` (B) + `directions_generator.py`.

## 0A. CAROUSEL LOOK v2 — Karan, 31 Oct 2026 (overrides §0 grounds/elements for carousels)
- **Grounds: black #0B0B0B (primary) and white #FFFFFF (secondary)**, alternating. Red #FF0000 accent. Greys #F4F4F4 / #E6E6E6 / #6B6B6B only for supporting elements. Sand/espresso no longer used for carousels.
- **Never typography-only.** Every slide carries at least one visual element: real tool logo tiles (monochrome), lucide-style line icons, phone/post mockups, flow nodes, icon cards, red highlighter marker, dot grid (white) / line grid (black).
- Logos: real marks from simple-icons, rendered black-on-white or white-on-black, used only to name the tool. Never recoloured into fake variants.
- Type unchanged: Plus Jakarta Sans 800 for punch/caps headlines, Instrument Serif for serif lines, Inter for body.
- Reference build: `projects/carousel-system-preview/index.html` (v2). Generator: icon/logo kit from npm `simple-icons` + `lucide-static`.

## 0. KARAN'S PERSONAL BRAND (overrides Style A/B for his own content)
> Real face. Warm light. Red only where the eye must land.

- **Two cover modes:** Photo cover (real approved photo of Karan, warm grade, serif+sans headline in cream, one red word) · Type cover (white or espresso ground, same headline pairing, one red word).
- **Grid rhythm:** photo, photo, type — repeat. Inside carousel slides stay clean (white/sand, screenshots only).
- **Carousel:** 1080×1350, 96px margin, footer hairline 64px from bottom with handle + "Swipe →" in red. Steps: red serif big number, serif title, ≤35 words, white/sand alternating. Last slide: one ask + handle.
- **Reel cover 1080×1920:** headline in centre 1080×1440 band; clear of bottom 320px and right 120px.
- **Photo cover layout:** headline top third, face middle third, sub-line lower third. Headline may sit behind head but red word fully visible.
- **Corners:** square slides/photos; 6px buttons; pills for tags + the Comment "AI" pill only. Flat — shadows/scrim only on photos.
- **Imagery:** real photos of Karan only; real tool screenshots with sensitive data blurred. AI allowed for backgrounds/props/B-roll, never Karan's face as real, never AI-rendered text.
- **Photo grade:** Temp +8–12, Tint +3, Contrast −10, Highlights −25, Shadows +15, Blacks +10, Sat −10, Blue sat −40, Orange lum +5, Grain 10.
- **Export:** render 2x, downscale with Lanczos, upload **PNG** (not JPEG) for statics/carousels.
- **Carousel layouts (saved 2026-10-31):** L1 Tool List, L2 Source Proof, L3 series label row, L4 Concept Sequence, L5 Flow Demo, L6 Big-Number Photo Cover, L7 Type Cover + Rating Pill, L8 bottom takeaway line. Spec: `knowledge/CAROUSEL_STYLE_REFERENCE.md` §3–4 and §7.
- **CTA:** Comment "AI" pill — cream pill on photos/espresso, white or sand pill on light grounds, keyword in ink, red up-arrow circle allowed as the one red element.
- **No:** blue, emoji, icon packs, third-party logos as decoration, dealership/car settings in personal brand.


## REEL EDITING PATTERNS (from reference reels — use pacing/structure for Karan; use Style A/B looks for client work)

### Frame layout (9:16)
```
┌──────────────┐  0%
│  IG UI safe  │
│  HOOK TITLE  │  ~5–15%   (Style A: black box top-left/centre; Style B: white label over B-roll band)
│              │
│  CAPTIONS    │  ~25–40%  Style A (over presenter, above head/at head level)
│   (face)     │
│  CAPTIONS    │  ~65–75%  Style B (chest level)
│  CTA PILL    │  ~75–80%  at the end (Style A sits higher, ~78–82% from top in ref 01, ~80% ref 02/03)
│  IG UI safe  │
└──────────────┘ 100%
```

### Style A — Clean Tech Minimal (default for AI/tech/B2B/agency content)
- Set: clean office or plain soft wall; presenter in solid dark colour.
- Hook title: white sentence-case text in a solid black rectangle.
- Captions: large white thin/regular sans, soft shadow; key word can go **bold**; on white cards captions turn black.
- Cutaways: white/near-white canvas (#FBFBFB sampled), real UI screenshots, thin highlight boxes (cyan), logos, thin-line flow diagrams, rounded cards with soft shadows.
- Numbered lists: rounded colour tiles, one colour per item.
- Transitions: hard cuts, quick slide-ins of UI, light zoom-ins. No flashy effects.
- Lower-third intro: name stacked + brand block.

### Style B — Bold Indian Creator (default for local business, real estate, auto dealers, Hinglish)
- Set: warm coloured wall (maroon), mic in frame.
- Hook title: 2 lines, bold rounded sans, line 1 black, line 2 red, white rounded label + emoji, over a top B-roll band with a wavy white divider.
- Captions: ALL CAPS bold, white with dark outline, chest level; emphasis lines in yellow/gold condensed caps.
- Transitions: colour washes / light leaks (orange, red, purple) on beat changes.
- B-roll: full-screen lifestyle images (can be AI-generated) with thin white icon + label bullet lists.
- CTA (ref only): script "Comment" + textured keyword box. **For Karan, use the Comment "AI" pill instead.**

### CTA pill — Karan's default for ALL content (reels, carousel last slide, statics)
Keyword: “AI”.
White rounded pill · small "Comment" label above · keyword in curly quotes · black circle up-arrow icon at right · optional subline under pill (e.g. "Spotify's new music model.").

## SLIDES / DOCUMENTS
UNVERIFIED — no presentation/document references yet. Until supplied:
- When editing Karan's existing file: copy its own layout, fonts, colours exactly.
- When creating new: use Style A principles (white space, one idea per slide, real screenshots, thin-line diagrams, bold key word) and confirm after the first draft.
