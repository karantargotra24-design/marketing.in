import sys
sys.argv=[sys.argv[0], "/tmp/ph1080.jpg"]
exec(open("/tmp/kwscripts/carousel_v3.py").read())
def blobs(cols,op=.7):
    pos=["18% 20%","86% 28%","72% 90%","12% 84%"]
    return "<div style='position:absolute;inset:0;background:"+",".join(f"radial-gradient(400px 400px at {p},{c},transparent 70%)" for p,c in zip(pos,cols))+f";filter:blur(30px);opacity:{op}'></div>"
def glass(inner,extra=""): return f"<div style='position:relative;background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-radius:36px;box-shadow:0 20px 60px rgba(0,0,0,.35);{extra}'>{inner}</div>"
def stk(n,sz,rot,x,y): return f"<div style='position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg);padding:10px;background:#fff;border-radius:{int(sz*.32)}px;box-shadow:0 14px 30px rgba(0,0,0,.45)'>{ltile(n,sz)}</div>"
def stki(icon,bg,sz,rot,x,y): return f"<div style='position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg);padding:10px;background:#fff;border-radius:{int(sz*.32)}px;box-shadow:0 14px 30px rgba(0,0,0,.45)'><div style='width:{sz}px;height:{sz}px;border-radius:{int(sz*.24)}px;background:{bg};display:grid;place-items:center'>{ic(icon,'#0B0B0B',int(sz*.55),2.2)}</div></div>"
def hlt(t,rot=-2,size=42): return f"<span style='display:inline-block;background:#FFE14D;color:#0B0B0B;font:700 {size}px Inter;padding:12px 26px;transform:rotate({rot}deg)'>{t}</span>"
def arrow(w=260,h=160,rot=0,x=0,y=0): return f"<svg style='position:absolute;left:{x}px;top:{y}px;transform:rotate({rot}deg)' width='{w}' height='{h}' viewBox='0 0 260 160' fill='none' stroke='#FF0000' stroke-width='9' stroke-linecap='round'><path d='M10 120 C 80 20, 170 20, 230 90'/><path d='M200 92 L232 92 L228 60'/></svg>"
def circle(w,h,x,y,rot=-4): return f"<svg style='position:absolute;left:{x}px;top:{y}px' width='{w}' height='{h}' viewBox='0 0 {w} {h}' fill='none' stroke='#FF0000' stroke-width='8'><ellipse cx='{w/2}' cy='{h/2}' rx='{w/2-8}' ry='{h/2-8}' transform='rotate({rot} {w/2} {h/2})'/></svg>"
COLS=["#D97757","#7D2AE8","#25D366","#0467DF"]
# 1 cover
c1=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs(COLS)}
{stk('openai',120,-10,90,170)}{stk('claude',130,8,820,150)}{stk('canva',110,6,100,1000)}{stk('googlegemini',120,-7,830,1000)}{stk('instagram',96,12,480,80)}
<div style='position:relative'>{glass("<div class='pj' style='font-size:160px;line-height:.88;color:#fff'>AI<br>TOOLS</div>",'padding:50px 80px')}{circle(660,430,-40,-25)}
<span style='position:absolute;right:-50px;top:-40px;background:#FF0000;color:#fff;font:700 40px Inter;padding:12px 28px;border-radius:999px;transform:rotate(8deg)'>FREE</span></div>
<div style='position:relative;margin-top:56px'>{hlt('jo har marketer ko aane chahiye')}</div>{ft(1)}</div>"""
# 2 inner tool list
rows="".join(f"<div style='position:relative;transform:rotate({r}deg)'>"+glass(f"<div style='display:flex;align-items:center;gap:26px'><div style='padding:8px;background:#fff;border-radius:30px'>{ltile(n,88)}</div><div><div style='font:700 40px Inter;color:#fff'>{t}</div><div style='font:500 28px Inter;color:rgba(255,255,255,.78)'>{u}</div></div></div>",'padding:20px 28px')+"</div>" for n,t,u,r in [("openai","ChatGPT","Captions aur hooks",-1),("claude","Claude","Lambe docs aur scripts",1),("googlegemini","Gemini","Research",-1),("canva","Canva","Design aur resize",1)])
c2=f"""<div class='s b' style='background:#0B0B0B'>{blobs(COLS,.6)}<div style='position:relative'>{lrow(SER)}
<div class='serif' style='font-size:96px;line-height:1;margin-top:46px;color:#fff'>Kaunsa AI tool,</div><div style='margin-top:12px'>{hlt('KIS KAAM KA?',-2,70)}</div>
<div style='display:grid;gap:22px;margin-top:50px'>{rows}</div>{arrow(170,110,35,700,250)}</div>{ft(5)}</div>"""
# 3 flow
c3=f"""<div class='s b' style='background:#0B0B0B'>{blobs(["#FF0069","#FFB300","#25D366","#7D2AE8"])}<div style='position:relative'>{lrow(SER)}
<div class='serif' style='font-size:100px;line-height:1;margin-top:50px;color:#fff'>Comment se DM tak,</div><div class='pj' style='font-size:92px;color:#fff'>AUTO<span class='red'>MATIC</span></div></div>
<div style='position:relative;height:700px;margin-top:30px'>
{stk('instagram',150,-8,20,40)}<div style='position:absolute;left:10px;top:240px'>{hlt('Comment: "AI"',-3,34)}</div>
{arrow(260,160,0,230,60)}
{stki('zap','#FFB300',150,4,470,150)}<div style='position:absolute;left:440px;top:350px'>{glass("<span style='font:600 30px Inter;color:#fff'>Keyword pakda, 1 sec</span>",'padding:16px 24px')}</div>
{arrow(260,160,110,640,330)}
{stk('whatsapp',160,7,600,470)}<div style='position:absolute;left:150px;top:560px'>{hlt('Free resource DM mein',-3,36)}</div></div>{ft(4)}</div>"""
# 4 CTA
c4=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs(COLS)}
{stk('instagram',110,-10,110,180)}{stk('whatsapp',100,9,840,200)}
{glass(f"<div class='serif' style='font-size:110px;line-height:1;color:#fff'>Poori list chahiye?</div><div style='font:500 36px Inter;color:rgba(255,255,255,.75);margin:56px 0 22px'>Comment</div><span style='display:inline-flex;align-items:center;gap:26px;background:#fff;color:#0B0B0B;border-radius:999px;padding:16px 18px 16px 48px;font:600 48px Inter'>“AI”<i style='width:72px;height:72px;border-radius:50%;background:#FF0000;display:grid;place-items:center'>{UP}</i></span>",'padding:70px 60px;width:880px')}
<div style='position:relative;margin-top:40px'>{hlt('Main DM mein bhej dunga',2,38)}</div>{ft(8)}</div>"""
frames="".join(f"<div class='fr'><div class='sc'>{b}</div></div>" for b in [c1,c2,c3,c4])
open("/tmp/bd.html","w").write(f"""<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}} body{{background:#EDEDED;padding:30px;width:1900px;font-family:Inter}} h1{{font:800 44px 'Plus Jakarta Sans';letter-spacing:-.04em;margin-bottom:20px}} h1 span{{color:#FF0000}} .row{{display:flex;gap:16px}} .fr{{width:432px;height:540px;overflow:hidden;border-radius:6px}} .sc{{width:1080px;height:1350px;transform:scale(.4);transform-origin:0 0}}</style></head><body><h1>B + D: <span>Glass + Sticker</span> (cover · tool list · flow · CTA)</h1><div class='row'>{frames}</div></body></html>""")
for i,b in enumerate([c1,c2,c3,c4],1):
    open(f"/tmp/bd_s{i}.html","w").write(f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}}body{{width:1080px;height:1350px;overflow:hidden}}</style></head><body>{b}</body></html>")
print("ok")
