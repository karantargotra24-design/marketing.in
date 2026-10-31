# Reference Analysis

Analysed: 2026-10-31. Method: ffprobe metadata, ffmpeg scene detection (threshold 0.3 — subtle cuts and zooms may be missed), EBU R128 loudness, 24-frame contact sheets, full-res frame checks.
Contact sheets: `references/videos/`. Raw MP4s are not stored in git.

## Summary table

| # | Topic (inferred from on-screen text) | Length | Res / FPS | Detected cuts | Avg shot | Loudness |
|---|---|---|---|---|---|---|
| 01 | "ChatGPT is Creepy" — computer history feature | 59.2 s | 720×1280 / 30 | 12 | ~4.6 s | -14.4 LUFS |
| 02 | Spotify × UMG AI music licensing | 66.0 s | 720×1280 / 25 | 21 | ~3.0 s | -14.1 LUFS |
| 03 | Zeel Jain (KnowAI) — "4 AI Business Systems" | 92.3 s | 720×1280 / 25 | 20 | ~4.4 s | -14.6 LUFS |
| 04 | "Your Real Estate Content is Wrong" (Hinglish) | 36.2 s | 720×1280 / 25 | 12 | ~2.8 s | -14.4 LUFS |

All four are 9:16 educational / thought-leadership reels with a single presenter.

## Common design language (across all 4)
1. **Format:** 9:16, presenter seated, mid-shot, framed in the lower ~60% of frame; head sits roughly at the vertical centre, leaving top third for text.
2. **Structure:** Hook (0–2 s) → context → explanation with B-roll / motion-graphics → payoff → **"Comment ‘KEYWORD’" CTA** in the last 3–5 s.
3. **Pacing:** a visual change every ~3–5 s (cut, graphic, zoom, or caption state).
4. **Captions:** one to three words at a time, appearing as spoken — never full sentences on screen.
5. **Cutaways:** clean white / near-white full-screen cards with UI screenshots, logos, icons, diagrams. These replace the presenter for 1–5 s.
6. **CTA pill:** white rounded pill, small "Comment" label above, keyword in quotes, circular up-arrow icon on the right (refs 01, 02, 03). Ref 04 uses a script "Comment" + textured keyword box instead.
7. **Audio:** all mastered to ≈ -14 LUFS integrated (Instagram/Reels-ready).

## Two distinct sub-styles

### Style A — "Clean Tech Minimal" (refs 01, 02, 03)
- Office / studio set (green shelf wall, or soft light-blue wall), presenter in dark solid outfit.
- Captions: large, thin/regular-weight white sans-serif, mid-frame over the presenter, slight soft shadow, sometimes semi-transparent. Key word may switch to bold (ref 02 "a **quick**").
- Hook title (ref 01): white text in a solid black rectangle at the top, sentence case ("Chatgpt is Creepy").
- Cutaways: Apple-like white canvas, real product UI screenshots, highlight rectangles (cyan outline), app logos, node/flow diagrams with thin lines, brand-colour accents only from the subject brand (Spotify green, Claude orange).
- Lower-third / intro card (ref 03): name stacked ("Zeel / Jain") + brand tag in a blue block, cut-out photo.
- Numbered system cards (ref 03): rounded square tiles, one colour per item (blue / pink / green / yellow), label "3. Delivery & Support System".
- Mood: premium, calm, information-rich, lots of white space.

### Style B — "Bold Indian Creator" (ref 04, Hinglish)
- Warm maroon wall, podcast mic in frame, presenter in close mid-shot.
- Hook title: two-line, bold rounded sans, black line 1 + **red** line 2, on white rounded label, with 🚨 emoji, over a top B-roll band separated by a **wavy white edge** (split-screen top 35%).
- Captions: ALL CAPS, bold, small, white with black outline/shadow, placed **lower-centre** (around chest). Emphasis lines in yellow/gold condensed bold caps ("KYUKI REAL ESTATE ME ZYADA DEALS").
- Colour flashes / light-leak transitions (orange, red, purple washes) between beats.
- Full-screen AI-generated lifestyle B-roll (investor vs end-user family) with thin white icon + label lists.
- Mock UI concept ("NEIGHBOURHOOD NETFLIX" on a TV).
- CTA: script "Comment" + distressed/textured box with keyword "REAL".
- Mood: energetic, desi, punchy, sales-oriented.

## Not verifiable from these files (UNVERIFIED)
- Exact font names (look like Inter/SF-Pro-style neo-grotesk for Style A; Montserrat/Poppins-style bold for Style B — **unconfirmed**).
- Exact hex values (video compression shifts colour; see COLOR_PALETTE.md for sampled approximations).
- Music/SFX choices, voiceover script (no transcription tool run).
- Whether these are Karan's own edits or inspiration references — **assumed: inspiration references representing the target style.**
- No PPT / PDF / Excel / document references were provided → slide/document style is not yet defined.

---
## Reference 05 — Personal_Brand_OS_Content_Database.pdf (added 2026-10-31)
6-page Google Sheets export (Arial, letter). Tabs: content (7 draft rows PB-2026-001…007, scheduled 12–18 Oct 2026 19:00 IST, all Pending/Draft), brand, sources, approvals, publish log, performance. Content/ops reference, not a visual design reference. Details → `BRAND_PROFILE.md`.

## Reference 06 — Personal_Brand_Content_OS_Claude_Canva_Setup.zip (added 2026-10-31)
16 text files: project instructions, automation blueprint, weekly run command, 8 skill files, empty brand profile/logs. Defines a weekly 2-carousel + 2-static English workflow with quality gate and approval rules. Brand profile and visual identity fields are **empty** → still no verified fonts/colours. Stored as-is in `references/documents/personal_brand_content_os/`.
