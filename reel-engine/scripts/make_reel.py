#!/usr/bin/env python3
"""Reel engine: talking-head video + word timings + cue list -> 1080x1920 reel.

Look follows the reference reels: word-by-word captions that pop on the spoken
word, emphasis words in red glow, full-screen white "card" cutaways on cues,
synthesized whoosh/tick SFX, voice mastered to -14 LUFS / -1 dBTP.

  make_reel.py --video raw.mp4 --words words.json --cues cues.json --out reel.mp4
words.json: [{"w":"hello","s":0.42,"e":0.80,"emph":false}, ...]
cues.json : [{"t":4.2,"dur":2.4,"title":"4 AI","sub":"Business Systems",
              "icons":["#4FA8FF","#FF8FB8","#9BE37A","#FFD84D"]}, ...]
"""
import argparse, json, subprocess, wave, os, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
FD = "/usr/share/fonts/opentype/inter/"
F_CAP, F_CARD, F_SUB = FD + "InterDisplay-SemiBold.otf", FD + "InterDisplay-Bold.otf", FD + "InterDisplay-Medium.otf"
CAP_Y = int(H * 0.30)          # caption centre line, above the speaker's head like the refs
RED = (255, 40, 40)

def font(p, s): return ImageFont.truetype(p, s)

def ease_out_back(x, k=1.9):
    x = min(max(x, 0), 1) - 1
    return 1 + (k + 1) * x ** 3 + k * x ** 2

def caption_layer(word, emph, age):
    """RGBA layer with the current word; age = seconds since word start."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    txt = word.upper() if emph else word
    f = font(F_CAP, 116 if emph else 104)
    tw = Image.new("RGBA", (W, 260), (0, 0, 0, 0))
    d = ImageDraw.Draw(tw)
    bb = d.textbbox((0, 0), txt, font=f)
    x, y = (W - (bb[2] - bb[0])) // 2 - bb[0], 80
    col = RED + (255,) if emph else (255, 255, 255, 255)
    if emph:  # red glow
        g = Image.new("RGBA", tw.size, (0, 0, 0, 0)); ImageDraw.Draw(g).text((x, y), txt, font=f, fill=RED + (255,))
        tw = Image.alpha_composite(tw, g.filter(ImageFilter.GaussianBlur(22)))
    sh = Image.new("RGBA", tw.size, (0, 0, 0, 0)); ImageDraw.Draw(sh).text((x + 3, y + 5), txt, font=f, fill=(0, 0, 0, 150))
    tw = Image.alpha_composite(tw, sh.filter(ImageFilter.GaussianBlur(5)))
    ImageDraw.Draw(tw).text((x, y), txt, font=f, fill=col)
    sc = 0.78 + 0.22 * ease_out_back(age / 0.12)           # 4-frame pop with overshoot
    tw = tw.resize((int(tw.width * sc), int(tw.height * sc)), Image.LANCZOS)
    tw.putalpha(tw.getchannel("A").point(lambda a: int(a * min(1, age / 0.06))))
    im.alpha_composite(tw, ((W - tw.width) // 2, CAP_Y - tw.height // 2))
    return im

def card_layer(cue, age, dur):
    """Full-screen white cutaway: title + sub + optional colour tiles, scale/slide in."""
    im = Image.new("RGBA", (W, H), (250, 250, 250, 255))
    c = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(c)
    y = H // 2 - 170
    ft = font(F_CARD, 120)
    def centred(t, f, y, fill):
        bb = d.textbbox((0, 0), t, font=f); d.text(((W - bb[2] + bb[0]) // 2 - bb[0], y), t, font=f, fill=fill)
        return bb[3] - bb[1]
    h = centred(cue["title"], ft, y, (12, 12, 12, 255)); y += h + 50
    icons = cue.get("icons", [])
    if icons:
        sz, gap = 130, 26; x0 = (W - (len(icons) * sz + (len(icons) - 1) * gap)) // 2
        for i, col in enumerate(icons):
            p = ease_out_back((age - 0.08 * i) / 0.3)           # staggered pop
            s = int(sz * max(p, 0)); cx = x0 + i * (sz + gap) + sz // 2
            d.rounded_rectangle((cx - s // 2, y + sz // 2 - s // 2, cx + s // 2, y + sz // 2 + s // 2), radius=int(s * .22), fill=col)
        y += sz + 40
    if cue.get("sub"): centred(cue["sub"], font(F_SUB, 96), y, (12, 12, 12, 255))
    p = ease_out_back(age / 0.28, 1.2)
    c = c.resize((int(W * (0.9 + 0.1 * p)), int(H * (0.9 + 0.1 * p))), Image.LANCZOS)
    c.putalpha(c.getchannel("A").point(lambda a: int(a * min(1, age / 0.1))))
    im.alpha_composite(c, ((W - c.width) // 2, (H - c.height) // 2))
    if age > dur - 0.0001: pass
    return im

def synth_sfx(dur, cues, words, sr=48000):
    """Whoosh at each card in/out, soft tick on each emphasis word. Original-synthesis, no samples."""
    out = np.zeros(int(dur * sr) + sr, dtype=np.float32); rng = np.random.default_rng(7)
    def add(t, x):
        i = int(t * sr); out[i:i + len(x)] += x[:len(out) - i]
    def whoosh(n=0.42, up=True):
        N = int(n * sr); t = np.linspace(0, 1, N); noise = rng.standard_normal(N)
        k = np.cumsum(noise); k -= np.convolve(k, np.ones(200) / 200, "same")   # crude band-pass
        env = np.sin(np.pi * t) ** 2 * (t if up else 1 - t + .2)
        return (k / (np.abs(k).max() + 1e-9) * env * 0.32).astype(np.float32)
    def tick():
        N = int(.05 * sr); t = np.arange(N) / sr
        return (np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 90) * 0.18).astype(np.float32)
    for c in cues:
        add(max(c["t"] - 0.18, 0), whoosh(up=True)); add(c["t"] + c["dur"] - 0.12, whoosh(.3, up=False))
    for w in words:
        if w.get("emph"): add(w["s"], tick())
    return out, sr

def write_wav(path, x, sr):
    with wave.open(path, "wb") as f:
        f.setnchannels(1); f.setsampwidth(2); f.setframerate(sr)
        f.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())

def main():
    a = argparse.ArgumentParser()
    a.add_argument("--video", required=True); a.add_argument("--words", required=True)
    a.add_argument("--cues", default=None); a.add_argument("--out", required=True)
    a.add_argument("--start", type=float, default=0); a.add_argument("--dur", type=float, default=None)
    a = a.parse_args()
    words = json.load(open(a.words)); cues = json.load(open(a.cues)) if a.cues else []
    pr = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", a.video]))
    dur = a.dur or (float(pr["format"]["duration"]) - a.start)
    tmp = tempfile.mkdtemp(); sfx = os.path.join(tmp, "sfx.wav"); base = os.path.join(tmp, "base.mp4")
    x, sr = synth_sfx(dur, cues, words); write_wav(sfx, x, sr)
    n = int(dur * FPS); wi = 0
    # overlay pipe: RGBA frames at 30fps (cards are opaque, captions transparent)
    ff = ["ffmpeg", "-v", "error", "-y", "-ss", str(a.start), "-t", str(dur), "-i", a.video,
          "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
          "-i", sfx,
          "-filter_complex",
          f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}[v];[v][1:v]overlay=format=auto,format=yuv420p[vo];"
          "[0:a]aresample=48000,highpass=f=70[va];[2:a]aresample=48000[sx];[va][sx]amix=inputs=2:duration=first:normalize=0,"
          "loudnorm=I=-14:TP=-1:LRA=9[ao]",
          "-map", "[vo]", "-map", "[ao]", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-c:a", "aac", "-b:a", "192k",
          "-movflags", "+faststart", "-t", str(dur), a.out]
    p = subprocess.Popen(ff, stdin=subprocess.PIPE)
    blank = Image.new("RGBA", (W, H), (0, 0, 0, 0)).tobytes()
    for f in range(n):
        t = f / FPS
        card = next((c for c in cues if c["t"] <= t < c["t"] + c["dur"]), None)
        if card: p.stdin.write(card_layer(card, t - card["t"], card["dur"]).tobytes()); continue
        while wi < len(words) and words[wi]["e"] < t - 0.15: wi += 1
        w = next((w for w in words[wi:wi + 3] if w["s"] <= t < max(w["e"], w["s"] + .25)), None)
        p.stdin.write(caption_layer(w["w"], w.get("emph"), t - w["s"]).tobytes() if w else blank)
    p.stdin.close(); p.wait()
    print("rendered", a.out, "dur", dur, "rc", p.returncode)

if __name__ == "__main__":
    main()
