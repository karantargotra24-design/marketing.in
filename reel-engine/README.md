# reel-engine
Word-locked reel renderer inspired by the reference reels (see `analysis/`).

```
python3 scripts/make_reel.py --video raw.mp4 --words words.json --cues cues.json --out reel.mp4
```
Needs: ffmpeg, Python 3 + Pillow + numpy, Inter fonts. `words.json` = word timestamps (get from ElevenLabs `creative_transcribe_audio` or any Whisper); `cues.json` = cutaway cards (time, duration, title, sub, tile colours).

Status: engine smoke-tested (1080x1920, captions, card cutaway, SFX, -14 LUFS master). **No final reel yet — raw footage not supplied.**

Missing to produce the real reel: raw talking-head video, script/transcript or permission to transcribe, logo/brand colours, CTA keyword, any B-roll/screenshots you want in cutaways.
