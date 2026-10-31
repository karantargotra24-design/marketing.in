# Phase 5 — Architecture Proposal (needs Karan's approval before any upload)

## Recommendation: train on REAL footage with a hosted avatar + voice-clone service
Image-to-video from stills (Veo, Kling etc.) re-invents the face on every clip, so identity drifts. A video-trained avatar learns from real footage, keeps the face stable and lip-syncs to any audio. For a weekly reel workflow on a phone-only setup, that's the right trade-off.

| Layer | Option A (recommended) | Option B | Option C (most private) |
|---|---|---|---|
| Voice clone | ElevenLabs voice clone from your real recordings (Instant 1–3 min; Professional 30+ min) | Higgsfield `create_voice` (connector available here) | Local open-source TTS clone (needs a GPU machine; none in this environment) |
| Talking-head avatar | HeyGen video avatar trained on your real 2–5 min footage (HeyGen MCP is connected here but **needs sign-in**) | Higgsfield lip-sync / AI-influencer tools on real footage | Local lip-sync (needs a GPU) |
| B-roll and backgrounds | AI allowed (props, sets), per Design System v2 | — | — |
| Edit and captions | This editor workspace (reel pattern, -14 LUFS, Comment "AI" pill) | — | — |

**Unverified:** plans, prices, consent-verification steps and commercial-use terms for every vendor above. Verify them at signup; I didn't browse.

## Privacy rules built in
- Face and voice files are git-ignored, so they never go to GitHub. Store them in Drive "02 Real Photos" or locally.
- Nothing is uploaded to ElevenLabs, HeyGen or Higgsfield without your explicit "approve upload to <vendor>".
- Every twin-generated video is labelled AI-generated in the caption, and the platform AI label is turned on.

## Workflow once trained (Phase 7)
Input: topic + script (Hinglish) + background + angle + format + duration
→ script QC (editor rules) → voice clone renders the audio → avatar renders a 9:16 lip-synced video → editor adds captions, cutaways and the Comment "AI" pill → -14 LUFS → QC → you approve.

## QA plan (Phase 8)
Blind A/B test of real voice vs clone with 3 people. Lip-sync check at 0.5x speed. Face consistency across 3 angles. Hinglish pronunciation test: "zyada", "kyunki", "₹500".
