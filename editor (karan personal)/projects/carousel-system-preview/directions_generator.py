import sys
sys.argv=[sys.argv[0], "/tmp/ph1080.jpg"]
exec(open("/tmp/kwscripts/carousel_v3.py").read())
ph_url=ph
def glass(inner,extra=""): return f"<div style='background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-radius:36px;box-shadow:0 20px 60px rgba(0,0,0,.35);{extra}'>{inner}</div>"
BLOBS="<div style='position:absolute;inset:0;background:radial-gradient(380px 380px at 18% 22%,#D97757,transparent 70%),radial-gradient(420px 420px at 85% 30%,#7D2AE8,transparent 70%),radial-gradient(420px 380px at 70% 88%,#25D366,transparent 70%),radial-gradient(360px 360px at 12% 85%,#0467DF,transparent 70%);filter:blur(30px);opacity:.75'></div>"
O={}
# A — current v3
O["A · App Icon Pop (current v3)"]=(S[1][1],S[4][1])
# B — Glass
gl_cover=f"""<div class='s b' style='justify-content:center;align-items:center;text-align:center;background:#0B0B0B'>{BLOBS}
<div style='position:relative;display:flex;gap:26px;margin-bottom:60px'>{''.join(glass(logo(n,'#fff',70),'width:150px;height:150px;display:grid;place-items:center') for n in ['openai','claude','googlegemini','canva'])}</div>
{glass("<div class='pj' style='font-size:150px;line-height:.9;color:#fff'>AI TOOLS</div><div class='serif it' style='font-size:56px;color:#fff;margin-top:14px'>jo har marketer ko aane chahiye</div>",'position:relative;padding:60px 70px')}
<span style='position:relative;margin-top:44px;background:#FF0000;color:#fff;font:700 40px Inter;padding:12px 30px;border-radius:999px'>FREE</span>{ft(1)}</div>"""
rows="".join(glass(f"<div style='display:flex;align-items:center;gap:26px'>{ltile(n,96)}<div><div style='font:700 40px Inter;color:#fff'>{t}</div><div style='font:500 28px Inter;color:rgba(255,255,255,.75)'>{u}</div></div></div>",'padding:22px 28px') for n,t,u in [("openai","ChatGPT","Captions aur hooks"),("claude","Claude","Lambe docs aur scripts"),("googlegemini","Gemini","Research"),("canva","Canva","Design aur resize")])
gl_inner=f"""<div class='s b' style='background:#0B0B0B'>{BLOBS}<div style='position:relative'>{lrow(SER)}
<div class='serif' style='font-size:96px;line-height:1;margin-top:46px;color:#fff'>Kaunsa AI tool,<br><span class='pj red' style='font-size:88px'>KIS KAAM KA?</span></div>
<div style='display:grid;gap:20px;margin-top:46px'>{rows}</div></div>{ft(5)}</div>"""
O["B · Glass (frosted cards over brand-colour blur)"]=(gl_cover,gl_inner)
# C — Bento
def box(inner,bg="#fff",fg="#0B0B0B",extra=""): return f"<div class='sh' style='background:{bg};color:{fg};border-radius:34px;padding:30px;display:flex;flex-direction:column;justify-content:space-between;{extra}'>{inner}</div>"
bento_cover=f"""<div class='s w' style='padding:70px'>
<div style='display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:repeat(4,1fr);gap:22px;height:100%'>
{box("<div class='pj' style='font-size:120px;line-height:.9'>AI<br>TOOLS</div><div class='serif it' style='font-size:44px'>jo har marketer ko aane chahiye</div>","#0B0B0B","#fff","grid-column:1/3;grid-row:1/3")}
{box(ltile('claude',120)+"<b style='font:700 34px Inter'>Claude</b>","#FFF1EC","#0B0B0B","grid-row:1/2;align-items:flex-start")}
{box("<span style='font:700 34px Inter;color:#fff;background:#FF0000;padding:10px 22px;border-radius:999px;align-self:flex-start'>FREE</span><b style='font:600 32px/1.2 Inter'>Sab ka free plan se start</b>","#fff","#0B0B0B","grid-row:2/3")}
{box(ltile('openai',110)+"<b style='font:700 32px Inter'>ChatGPT</b>","#F4F4F4","#0B0B0B","")}
{box(ltile('googlegemini',110)+"<b style='font:700 32px Inter'>Gemini</b>","#F3EEFB","#0B0B0B","")}
{box(ltile('canva',110)+"<b style='font:700 32px Inter'>Canva</b>","#E6FAFB","#0B0B0B","")}
{box(f"<div style='display:flex;gap:18px'>{ltile('zapier',90)}{ltile('notion',90)}{ltile('whatsapp',90)}</div><b style='font:600 34px Inter'>+ automation tools, slide 6</b>","#fff","#0B0B0B","grid-column:1/4")}
</div></div>"""
bento_inner=f"""<div class='s b' style='padding:70px'>{lrow(SER)}
<div style='display:grid;grid-template-columns:1fr 1fr;grid-template-rows:auto 1fr 1fr;gap:22px;margin-top:40px;flex:1'>
{box("<div class='serif' style='font-size:88px;line-height:1'>Prompt ke <span class='pj red' style='font-size:84px'>4 PARTS</span></div>","#fff","#0B0B0B","grid-column:1/3")}
{''.join(box(f"<div style='width:96px;height:96px;border-radius:24px;background:{c};display:grid;place-items:center'>{ic(i,'#fff',52,2)}</div><div><div class='pj' style='font-size:52px'>{t}</div><div style='font:500 28px/1.3 Inter;opacity:.7'>{d}</div></div>","#161616","#fff","") for i,t,d,c in [("user","ROLE","Meta Ads expert bano","#D97757"),("file-text","CONTEXT","Business + ₹ budget","#0467DF"),("target","TASK","Ek clear kaam","#25D366"),("layout-list","FORMAT","Table ya bullets","#FF0000")])}
</div><div style='height:70px'></div>{ft(6)}</div>"""
O["C · Bento Grid (Apple-style mixed boxes)"]=(bento_cover,bento_inner)
# D — Sticker collage
def stk(n,sz,rot,x,y): return f"<div style='position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg);padding:10px;background:#fff;border-radius:{int(sz*.3)}px;box-shadow:0 10px 24px rgba(0,0,0,.18)'>{ltile(n,sz)}</div>"
ARROWSVG="<svg width='260' height='160' viewBox='0 0 260 160' fill='none' stroke='#FF0000' stroke-width='9' stroke-linecap='round'><path d='M10 120 C 80 20, 170 20, 230 90'/><path d='M200 92 L232 92 L228 60'/></svg>"
stk_cover=f"""<div class='s w' style='justify-content:center;align-items:center;text-align:center'>
{stk('openai',120,-10,90,170)}{stk('claude',130,8,820,150)}{stk('canva',110,6,110,980)}{stk('googlegemini',120,-7,820,990)}{stk('instagram',96,12,480,90)}
<div style='position:relative'><div class='pj' style='font-size:170px;line-height:.88'>AI<br>TOOLS</div>
<svg style='position:absolute;left:-40px;top:-30px' width='600' height='360' viewBox='0 0 600 360' fill='none' stroke='#FF0000' stroke-width='8'><ellipse cx='300' cy='180' rx='290' ry='170' transform='rotate(-4 300 180)'/></svg></div>
<div style='margin-top:50px;background:#FFE14D;font:700 44px Inter;padding:14px 30px;transform:rotate(-2deg)'>jo har marketer ko aane chahiye</div>{ft(1)}</div>"""
stk_inner=f"""<div class='s w'>{lrow(SER)}
<div class='serif' style='font-size:100px;line-height:1;margin-top:50px'>Comment se DM tak,<br><span class='pj' style='font-size:92px'>AUTOMATIC</span></div>
<div style='position:relative;height:640px;margin-top:40px'>
{stk('instagram',150,-8,20,40)}<div style='position:absolute;left:30px;top:260px;font:700 34px Inter;transform:rotate(-3deg)'>Comment: "AI"</div>
<div style='position:absolute;left:230px;top:60px'>{ARROWSVG}</div>
<div style='position:absolute;left:470px;top:150px;transform:rotate(4deg);padding:10px;background:#fff;border-radius:44px;box-shadow:0 10px 24px rgba(0,0,0,.18)'><div style='width:150px;height:150px;border-radius:36px;background:#FFB300;display:grid;place-items:center'>{ic('zap','#0B0B0B',80,2.4)}</div></div>
<div style='position:absolute;left:640px;top:330px;transform:rotate(110deg)'>{ARROWSVG}</div>
{stk('whatsapp',160,7,600,440)}<div style='position:absolute;left:170px;top:520px;background:#FFE14D;font:700 36px Inter;padding:12px 24px;transform:rotate(-3deg)'>Free resource DM mein</div></div>{ft(4)}</div>"""
O["D · Sticker Collage (stickers, red marker, highlighter)"]=(stk_cover,stk_inner)
rowsH="".join(f"<section><h2>{k}</h2><div class='pair'><div class='fr'><div class='sc'>{a}</div></div><div class='fr'><div class='sc'>{b}</div></div></div></section>" for k,(a,b) in O.items())
html=f"""<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}
*{{box-sizing:border-box;margin:0}} body{{background:#EDEDED;font-family:Inter;padding:30px;width:1900px}}
h1{{font:800 46px 'Plus Jakarta Sans';letter-spacing:-.04em;margin-bottom:20px}} h1 span{{color:#FF0000}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:30px}} h2{{font:700 24px Inter;margin-bottom:10px}}
.pair{{display:flex;gap:14px}} .fr{{width:432px;height:540px;overflow:hidden;border-radius:6px}} .sc{{width:1080px;height:1350px;transform:scale(.4);transform-origin:0 0}}
</style></head><body><h1>Pick a carousel direction: <span>A, B, C or D</span></h1><div class='grid'>{rowsH}</div></body></html>"""
open("/tmp/options.html","w").write(html); print("ok")
