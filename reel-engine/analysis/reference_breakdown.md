# Reference breakdown (measured with ffprobe / ffmpeg; frame-sampled, not frame-perfect)

## Manifest
| File (uploads) | Type | Spec | Audio | Role |
|---|---|---|---|---|
| 833f9f56 (2.35.02 PM) | Reel | 720x1280 30fps 59.2s | AAC 44.1k, **-14.4 LUFS** | Reference reel A (ChatGPT memory / skills, green-shelf office, black-suit speaker) |
| ed6b9d01 (2.35.10 PM) | Reel | 720x1280 25fps 66.0s | AAC 48k, **-14.1 LUFS**, true-peak >0 dBFS (clips) | Reference reel B (Spotify AI music, white sofa) |
| 94c7b31c (2.35.14 PM) | Reel | 720x1280 25fps 92.3s | AAC 48k, **-14.6 LUFS** | Reference reel C ("4 AI Business Systems", green-shelf office, cream top) |
| 1845c691 (2.42.01 PM) | Slide video | 720x900 (4:5) 30fps 7.3s | none | Explainer slide "Then it designs the sound" (06/11 series, brand *zeeuiux*) |
| 8aa87d26 (2.42.02 PM) | Slide video | 720x900 (4:5) 30fps 8.0s | none | Explainer slide "Every graphic lands on a word" (06/11) |

**Raw footage / brand assets / script: none supplied.** Nothing to edit yet.

## Structure (Observed)
- Scene-change timestamps (ffmpeg scene>0.25):
  - A: 8.8 19.1 21.1 24.1 25.1 28.0 31.3 34.6 37.9 40.5 45.0 54.6 (≈ one cutaway every 4.6s)
  - B: 2.1 4.8 5.7 10.8 12.9 15.4 21.3 22.6 26.5 30.0 31.0 31.8 33.0 34.1 40.0 45.7 55.3 (≈ 3.1s; denser in 30–34s burst)
  - C: 0.9 6.3 10.8 21.8 26.3 28.6 32.2 43.6 46.4 48.6 49.7 51.7 60.2 62.0 66.0 77.5 79.9 85.7 87.1 89.8 (≈ 4.6s)
- Pattern: **A-roll talking head (static camera, speaker mid-frame) alternating with full-screen B-roll/infographic cutaways of 1–4s**, returning to A-roll on the same sentence. Cutaway types seen: (1) white screen + UI/infographic (ChatGPT history page, flow diagrams, app-icon tiles, "4 AI Business Systems" title with 4 coloured tiles); (2) stock/archival photo or clip (laptop user, concert stage); (3) tinted/duotone footage (purple invert); (4) pure-white word card ("criticisms", "were ever given").
- Hook: reel A opens on a black-box title ("Chatgpt is Creepy") + speaker; C opens on a white title card (title + 4 tiles) within 0.9s; B opens on a red word ("Question ?") over speaker.
- CTA (B, last ~3s, Observed): "Comment 'Music'" pill + one-line topic caption.

## Typography / captions (Observed)
- One word (or 2-word chunk) on screen at a time, lower-case/sentence case, bold grotesque sans (Helvetica/Inter-like), white with soft drop shadow over footage; black text over light bg.
- Emphasis words: red, larger, with red glow (e.g. "the same way.", "criticisms").
- Caption sits in the upper third, above the speaker's head — keeps the face clear. Hook title uses a solid black label box with white text.
- Pop-in (scale up ~0.8→1 with overshoot) on each word; hard replace on next word.

## Audio (Observed / Measured)
- All three reels mastered to ≈ -14 LUFS integrated, LRA ≈ 3.6–3.8 LU: voice-forward, compressed.
- B has inter-sample peaks above 0 dBFS (clipping risk) — don't copy that; target -1 dBTP.
- BPM / beat grid: **not measured** (no librosa/scipy in env; speech-led, no clear music bed audible in sampled frames — unverified).
- SFX presence (whooshes on cutaways): *Inferred* from the slide deck ("a tap on every click, a chime to close") — not verified by listening.

## Slide videos (workflow disclosed by the creator — Observed text)
Pass 04 "Motion": *Claude reads the transcript, plans one scene per idea, then builds each one in code, timed to the frame.* Scenes fire on a word timestamp (e.g. "overanalysis" @ 00:04.40, "walking" @ 00:10.00, "Harvard" @ 00:16.24). Pass 05 "Sound": SFX on every cue, voice on top, **master to -14 LUFS**. Slide look: near-black bg, big white grotesque headline + italic serif second line with pink→lavender gradient, mono "PASS 0x" kicker, green "PROMPT" chip, 11-step progress bar. This matches the three reels' measured -14 LUFS and word-locked graphics.
