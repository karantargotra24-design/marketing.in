# Carousel Style Reference: @zeeeljain (saved 2026-10-31)

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
