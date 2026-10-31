# Master Editing Guidelines

## Core principle
Learn Karan's style once. Preserve it. Apply it consistently. Improve execution without destroying the creative identity.

## The 7-step workflow (every task)
1. **UNDERSTAND** — Read/inspect the source (ffprobe + contact sheet for video; open every slide/page for docs). Write the objective in one line.
2. **ANALYZE** — Compare against the knowledge files. Decide: Style A (Clean Tech Minimal) or Style B (Bold Indian Creator) or client brand style. If unclear: tech/AI/B2B → A; local business / real estate / auto / Hinglish → B.
3. **PLAN** — List what changes and what stays untouched. Keep the plan short.
4. **EXECUTE** — Use the right tool (see CLAUDE.md). Work on a copy in `projects/<name>/`.
5. **QUALITY CHECK** — run the checklist below.
6. **DELIVER** — Correct format, versioned filename, one-line summary of what changed.
7. **LEARN** — If Karan corrects/approves and says to save it: update knowledge file + `changelog/STYLE_UPDATES.md`.

## Editing rules
- Never change original content unnecessarily; never remove key info without approval.
- Never fabricate data, references, stats, testimonials, prices.
- Keep originals safe; output as `<project>_<asset>_v<N>.<ext>` (e.g. `tata-motors_diwali-reel_v2.mp4`).
- Preserve editability (native PPTX text boxes, DOCX styles, Excel formulas).
- Do not swap Karan's look for a generic AI template.

## Reel defaults (from references — see VISUAL_STYLE_GUIDE.md)
| Item | Default |
|---|---|
| Aspect / res | 9:16, export 1080×1920 (refs are 720×1280; upscale delivery to 1080p) |
| FPS | 25 or 30 (match source) |
| Length | 35–90 s; sweet spot 45–65 s |
| Hook | On-screen title within first 1 s, spoken hook in first 2 s |
| Shot change | every 3–5 s (Style B: 2–3 s) |
| Captions | 1–3 words per beat, synced to speech |
| Cutaways | 30–45% of runtime as graphics/B-roll |
| End | "Comment ‘KEYWORD’" CTA, last 3–5 s |
| Loudness | -14 LUFS integrated, true peak ≤ -1 dBTP |
| Safe zones | Keep text out of top ~12% and bottom ~20% (IG UI) — except CTA pill which sits mid-lower |

## Quality checklist
- [ ] Style matches the chosen sub-style (fonts, caption position, colours)
- [ ] Hook visible in first second
- [ ] Captions match speech exactly; spelling checked (brand names: ChatGPT, not "Chatgpt")
- [ ] No caption overlaps face or IG UI
- [ ] Every claim/stat on screen is sourced or came from Karan
- [ ] Cuts land on speech beats; no jump in audio
- [ ] Audio -14 LUFS ±1, no clipping
- [ ] CTA present and keyword matches the DM automation keyword
- [ ] File plays, correct res/fps, filename versioned
- [ ] Original untouched
