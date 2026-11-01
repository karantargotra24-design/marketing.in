# Video effects pack: "45 Video Effects for Claude" (by @vibha.in.progress, MIT)

Source: claude-video-effects-main.zip (Karan, 1 Nov 2026). **Installed 1 Nov 2026** (Karan allowed it) as a project skill at `.claude/skills/effects/` (use `/effects`). Setup: Python venv (git-ignored) + system lib `libegl1` added for mediapipe. Run: `.claude/skills/effects/.venv/bin/python .claude/skills/effects/scripts/fx.py --plan plan.json in.mp4 out.mp4`. Plan options go as top-level keys, e.g. `{"fx":"headline-box","zoom":"1.0",...}`.
Reviewed: SKILL.md, README, setup.sh, fx.py (2,245 lines), words.py. No network calls in the effect code. It runs locally with ffmpeg and two bundled face/segmentation models (YuNet MIT, MediaPipe Apache-2.0). Optional `fx_private.py` hook: not present in the zip.
Limit: `words.py` (word timings) downloads a Whisper model from Hugging Face, which this environment blocks. Timings must come from Karan or a transcript.

## How it works
Plan JSON → check stills → render. Effects track the face and can sit behind the head; the original audio is kept; 1080p output. Visuals only: no captions or SFX.
`{"effects":[{"fx":"lean-in","start":3.2,"end":4.0},{"fx":"comment-box","start":8,"end":10,"text":"TOOLS"}]}`

## Brand fit for Karan (Style A, black/white/red, unique keyword per reel)
| Use often ✅ | Why |
|---|---|
| `lean-in` (punch-in on one word) | = rule 3 wide/punch-in, but face-tracked |
| `slow-push` | Push-in inside long A-roll shots |
| `locked-on` | Corner brackets + camera follow, clean tech look |
| `headline-box` | Two-line headline, second line in a white box = the Style A hook box |
| `backdrop-word` (`color=#FF0000`, `font=serif`) | Giant word behind the head, brand red + Instrument Serif |
| `comment-box` (`text=<KEYWORD>`) | Types the post's keyword in an IG comment bar: perfect for the Comment CTA ending |
| `todo` / `checklist` | Steps tick off as he talks (5 tasks, 4 fixes) |
| `apple-toggles` | Settings-style list (prompt parts, checklist) |
| `messages` | iMessage pop-ups: DM automation / WhatsApp follow-up reels |
| `split-headline` | Headline card pushes him to the bottom half |
| `match-cut` | News-page cuts for Source Proof reels (real pages only) |
| `reject-stamp` (red) | "Mistake" moments, used once per reel max |

| Use carefully ⚠️ | Why |
|---|---|
| `liquid-glass-graph`, `over-the-shoulder-zoom`, `headline-wall`, `place-in-grid`, `profile-wall` | Show numbers/view counts: **real data only**, never invented |
| `glass-widgets` | Adds an "Edited by Claude" pill; check it's wanted |
| `spotlight`, `led-sign`, `timeline`, `moody` | Strong grades; fine in red/black, avoid blue/cool looks |

| Avoid ❌ | Why |
|---|---|
| `pastel-word` (lavender), `check-pills` (blue pills), `cool` grade | Off-palette (no blue/purple) |
| `tier-list` (Claude flies into S tier), `uninstall`, `rabbit-hole`, `shortcut-rain` | Gimmicky for his practitioner tone; use only if asked |

## Where it fits in the reel grammar
Rule 1 hook → `headline-box` · Rule 3 → `lean-in` / `slow-push` · Rule 6 overlays → `todo`, `checklist`, `messages`, `apple-toggles` · Rule 9 end → `comment-box` with the post's keyword (or our white pill).
Max 2–3 effects per reel, 1.5–4 s each, never over the face.

## Field notes (first test, R02, 1 Nov 2026)
- `lean-in` ✅ works well (face-tracked punch-in). Used in R02_v3 at 6.0–7.1 s.
- `headline-box` ❌ on tight framing: it puts text above the face and partly behind the head; with the face high in frame the second line gets hidden. Needs real footage with headroom (top 30% empty).
- `comment-box` (`look=bar`) ⚠️ sits low and goes behind a mic in the foreground (segmentation treats the mic as the person); its avatar dot is pink (off-palette). Our own white Comment pill overlay stays the default.
- After every render: re-run QC (stamp/black frames, −14 LUFS).
