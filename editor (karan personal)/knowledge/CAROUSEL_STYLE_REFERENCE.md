# Carousel Style Reference: @zeeeljain (saved 2026-10-31, batch 2 added same day)

Source: 5 slides Karan shared (local only: `references/images/zeeljain-carousel-2026-10/`, git-ignored).
Purpose: learn the **layout system**, then rebuild it in Karan's Design System v2. **Never copy her identity, handle, monogram, colours or exact layouts.**

## 1. What's observed (verified from the files)

| Element | Observation | Sampled value |
|---|---|---|
| Canvas | 4:5 (1080×1350 and 1440×1800) | — |
| Grounds | Off-white with a faint dot grid; content slides carry a large faint "ZJ" monogram watermark | #FBFBFD / #FFFFFF |
| **Cover** | Real photo of the creator (looking down, warm café light, shallow depth of field). Headline in the **lower third** over a dark bottom fade. Mixed type: thin serif numeral "26", heavy serif "Claude", condensed serif "Shortcuts", small serif "code". Two small topic-brand glyphs (Claude Code mascot + asterisk) in coral | coral ≈ #DB765A |
| **"Paper" slide** | Top row: small label "MUST READ" (left) + handle in serif (right). Numbered square pill "04" with a thin connector line. **Huge condensed serif question headline** in black, tight tracking. Sans sub-line in muted indigo. Small "AI Paper :" pill. Paper title in sans. **Real screenshot of the paper's abstract** in a rounded frame | label ≈ #453E6A, pill ≈ #554F97 |
| **List slide** ("Context & Memory", "Usage & Settings") | Category header = coloured icon tile + bold sans title on a white plate. 4–5 rows: **black rounded chip with a monospace command** → thin connector line → white outlined rounded box with a one-line explanation | chip ≈ #1D1C22, tile ≈ #6E1527 / light cyan |
| Type | Condensed high-contrast serif (headlines), clean grotesk sans (body), monospace (commands) | font names UNVERIFIED |
| Copy | One idea per slide. Headline as a question. Explanation ≤ 1 line per row. English | — |
| Series system | Numbered items (01, 04 …), repeated header row and label, so each slide is recognisable as part of a series | — |

Not observed: engagement, reach or growth. There are no public metrics in these files, so no performance claims.

## 2. Why it works (hypotheses, not data)
- **Question headline + real source screenshot** = curiosity plus proof. It feels researched, not AI-generic.
- **Command chips** make the slide copy-paste useful, and useful slides get saved.
- **Repeated header row and numbering** let you spot a slide as part of the series in the feed.
- **Whitespace and only 2–3 type sizes** keep it readable at thumbnail size.

## 3. Karan's version (adapted into Design System v2)

| Zeel element | Karan rebuild |
|---|---|
| Off-white + dot grid | **White or sand #EDE5D8** + dot grid in #D9CFC0 at ~30% opacity |
| "ZJ" watermark | **Optional "KT" watermark** in Plus Jakarta 800, 4–5% opacity, or none (Karan has no logo, so the wordmark rule applies) |
| "MUST READ" label + handle top row | Pillar tag (e.g. `AI TOOLS`) top-left + `@karantargotra.a` top-right, Inter 500, in clay #7A5A40 |
| Indigo number pill | **Red serif number** (`02`) or an ink square pill with a cream number. Only one red element per slide |
| Condensed serif question headline | **Instrument Serif** question headline (Hinglish), ink #111111 |
| Indigo sub-line | Inter sub-line in **clay #7A5A40**. **No indigo/blue** (brand rule) |
| Paper / screenshot frame | Real tool or ad-dashboard screenshot in a 12 px radius frame, sensitive data blurred, source line underneath |
| Category icon tile | Espresso tile with a cream glyph, or none. No icon packs or third-party logos as decoration (logos only inside real screenshots) |
| Black command chip + outlined box | **Ink #111111 chip, monospace (JetBrains Mono / IBM Plex Mono, UNVERIFIED choice)** → hairline → white box with a 1.5 px #E5E5E5 border, Inter 500 Hinglish explanation |
| Coral brand glyphs on cover | Only if they appear in a **real screenshot**. Otherwise the single ✳ in cream (DS v2) |
| Cover: creator photo + lower-third headline | Karan's real photo, warm grade. Headline in the **top third** (DS v2 rule; Zeel's lower-third works too, but stay consistent) |

## 4. New reusable layouts for Karan (saved)
1. **"Tool List" slide:** pillar tag + handle row → category header → 4–5 command/prompt chips with Hinglish explanations. Use for: shortcuts, prompts, Meta Ads settings, WhatsApp templates.
2. **"Source Proof" slide:** number + question headline (serif) + clay sub-line + real screenshot frame + source line. Use for: tool updates, Meta announcements, research (verify + date).
3. **Series header:** same header row, numbering and footer on every slide of a series (e.g. "Claude se kaam #01").

## 5. White space Karan can own (vs this reference)
- **Hinglish, India-first:** the reference is English and global. Karan explains the same tools with ₹ costs, phone-first steps and Indian SMB examples.
- **Marketing outcomes, not tool trivia:** turn shortcuts into workflows that save time or get leads ("Claude se 7 din ka content 20 min mein").
- **Proof from his own tests:** BUILD IN PUBLIC screenshots of his real results. The reference shows papers, not personal experiments.
- **Warm palette + red accent** instead of indigo/coral, so the grid is instantly his.

---
## 6. Batch 2: 5 more slides (observed)

| File | Type | Observation |
|---|---|---|
| 06 | **Type cover, rating pill** | White ground. Giant heavy grotesk ALL CAPS "AI TOPICS". A small frosted pill "10/10" overlaps the headline top. Small sparkle glyph. Sub-line "to nerd on" with a pixel mascot. Two cut-out people below (the creator + a **real TV actor's likeness**). |
| 07 | **Concept Sequence** | Series label row (ALL CAPS small sans left, handle right). Heavy grotesk ALL CAPS title "MODEL COLLAPSE". Question sub-line. 3 step markers v1 → v2 → v3 (dashed circles, last one filled coral) joined by hairlines over 3 grey image cards showing drift. Bottom: 2-line takeaway. |
| 08 | **Photo cover, big number** | Real moody photo (laptop, video call). Huge serif "5 Things", small sans "You can build", bold sans "with AI". Small app icon + coral asterisk. Bottom sub-line in brackets "(Without knowing how to code.)". |
| 09 | **Save CTA, dark** | Near-black radial vignette, mascot, bold sans "Save This", light grey sub "for your next AI deep dive". |
| 10 | **Flow Demo** | Series label row. Serif headline "Your personal AI Assistant". Flow: user chat bubble → avatar → connector → "Reading the Documents" card → arrow → AI reply bubble → robot → "Task Complete" card. Bottom: 2-line takeaway. |

**Pattern across both batches:** every inner slide = series label row → one headline → one visual (screenshot, sequence or flow) → one bottom takeaway line. Covers alternate photo / type. The last slide is a single-action CTA.

## 7. Saved into Karan's design (Design System v2 rebuild)

| # | Layout | Karan version |
|---|---|---|
| L1 | Tool List | (§4) |
| L2 | Source Proof | (§4) |
| L3 | **Series label row** (every inner slide) | Left: series name in Inter 600, ALL CAPS, 22 px, letter-spacing .14em, ink. Right: `@karantargotra.a` in Instrument Serif 28 px, clay |
| L4 | **Concept Sequence** | Title in Plus Jakarta 800 caps (punch) **or** serif; Hinglish question sub-line in Inter; 3 steps with dashed clay circles + hairlines, **last step filled red (the one red element)**; 3 sand cards with real screenshots or simple wireframes; 2-line bottom takeaway in Inter 500 |
| L5 | **Flow Demo** | Serif headline; chat bubbles (white, 1.5 px #E5E5E5 border) → process card → result card, hairline connectors and arrows; **no Memoji, robot clipart or icon packs**; use real tool UI crops; 2-line takeaway |
| L6 | **Big-Number Photo Cover** | Karan's real photo, warm grade; huge Instrument Serif number + word ("5 Tareeke"), small Inter connector, Plus Jakarta 800 punch line; bracket sub-line at the bottom "(Coding ke bina.)"; max one ✳ |
| L7 | **Type Cover + Rating Pill** | White or sand; Plus Jakarta 800 caps headline; small ink pill with a cream label (e.g. "10/10", "FREE", "2026") overlapping the headline corner; Hinglish sub-line; optional real photo cut-out of Karan only |
| L8 | **Bottom takeaway line** | Every content slide ends with a ≤2-line Inter 500 takeaway, centred, 96 px above the footer |
| CTA | Dark CTA slide | Use the existing **espresso Comment "AI" pill slide** (Karan's rule), not "Save This". A "Save kar lo" sub-line only if Karan asks for a save objective |

## 8. Do not carry over
- **Celebrity or real-person likeness** (the TV-actor cut-out on 06). It's a legal/permission risk and breaks "real photos of Karan only".
- Her pixel mascot, "ZJ" monogram, handle and coral/indigo palette. A personal mascot for Karan is an **open decision**, not adopted.
- Apple Memoji, 3D robot clipart, app logos as decoration (logos only inside real screenshots).
- Blue sparkle glyphs (no blue).
