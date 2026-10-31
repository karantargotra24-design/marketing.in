import sys, json, os, html as H
WEEK, OUTDIR = sys.argv[1], sys.argv[2]
sys.argv=[sys.argv[0], "/tmp/ph1080.jpg"]
exec(open("/tmp/kwscripts/carousel_v3.py").read())
E=H.escape
w=json.load(open(WEEK,encoding="utf-8"))
def blobs(cols,op=.7): 
    pos=["18% 20%","86% 28%","72% 90%","12% 84%"]
    return "<div style='position:absolute;inset:0;background:"+",".join(f"radial-gradient(400px 400px at {p},{c},transparent 70%)" for p,c in zip(pos,cols))+f";filter:blur(30px);opacity:{op}'></div>"
def glass(inner,extra=""): return f"<div style='position:relative;background:rgba(255,255,255,.10);border:1.5px solid rgba(255,255,255,.28);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-radius:36px;box-shadow:0 20px 60px rgba(0,0,0,.35);{extra}'>{inner}</div>"
def gtile(inner,sz=120): return glass(inner,f"width:{sz}px;height:{sz}px;display:grid;place-items:center;border-radius:{int(sz*.26)}px")
PAL={"C1":["#FF0069","#7D2AE8","#D97757","#0467DF"],"C2":["#25D366","#0467DF","#D97757","#7D2AE8"],"S1":["#FF0069","#FFB300","#25D366","#7D2AE8"],"S2":["#D97757","#7D2AE8","#25D366","#0467DF"]}
ICON={  # per slide visual: ('logo'|'icon', name)
 ("C1",2):("icon","eye"),("C1",3):("logo","instagram"),("C1",4):("icon","file-text"),("C1",5):("icon","pin"),("C1",6):("icon","link"),
 ("C2",2):("icon","thermometer-snowflake"),("C2",3):("logo","whatsapp"),("C2",4):("logo","whatsapp"),("C2",5):("logo","whatsapp"),("C2",6):("icon","shield-check")}
def vis(k):
    t,n=ICON.get(k,("icon","sparkles"))
    if t=="logo": return ltile(n,120)
    if not os.path.exists(LU+n+".svg"): n="sparkles"
    return gtile(ic(n,"#fff",62,2),120)
UPA=ic("arrow-up","#fff",34,3)
def pill(): return f"<span style='display:inline-flex;align-items:center;gap:26px;background:#fff;color:#0B0B0B;border-radius:999px;padding:16px 18px 16px 48px;font:600 48px Inter'>“AI”<i style='width:72px;height:72px;border-radius:50%;background:#FF0000;display:grid;place-items:center'>{UPA}</i></span>"
def gl_label(series): return f"<div class='lrow' style='position:relative;color:#fff'><span>{series}</span><span class='h'>@karantargotra.a</span></div>"
pages=[]
for p in w["posts"]:
    pid=p["id"]; cols=PAL[pid]; series=p["pillar"]
    if p["format"]=="carousel":
        n=len(p["slides"])
        for s in p["slides"]:
            k=s["n"]
            if s["type"]=="hook" and pid=="C1":
                b=f"""<div class='s b' style="background:#0B0B0B url('{ph}') center top/cover">
<div style='position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,.85) 78%)'></div>
<div style='position:absolute;left:70px;right:70px;bottom:150px'>{glass(f"<span style='font:600 22px Inter;letter-spacing:.14em;color:#fff;opacity:.85'>{E(s['tag'])}</span><div class='serif' style='font-size:84px;line-height:1;color:#fff;margin-top:14px'>{E(s['hook'])}</div><div class='pj red' style='font-size:76px;line-height:1;margin-top:6px'>{E(s['hook_red'].upper())}</div><div style='font:500 32px Inter;color:rgba(255,255,255,.85);margin-top:18px'>{E(s['hook_sub'])}</div>",'padding:44px 50px')}</div>
<div style='position:absolute;right:80px;top:80px;display:flex;gap:16px'>{ltile('instagram',96)}</div>{ft(k,n)}</div>"""
            elif s["type"]=="hook":
                b=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs(cols)}
<div style='position:relative;display:flex;gap:24px;margin-bottom:56px'>{ltile('whatsapp',140)}{gtile(ic('message-circle','#fff',70,2),140)}{gtile(ic('user-check','#fff',70,2),140)}</div>
{glass(f"<span style='font:600 24px Inter;letter-spacing:.14em;color:#fff;opacity:.85'>{E(s['tag'])}</span><div class='serif' style='font-size:104px;line-height:1;color:#fff;margin-top:16px'>{E(s['hook'])}</div><div class='pj red' style='font-size:84px;line-height:1;margin-top:10px'>{E(s['hook_red'].upper())}</div><div style='font:500 34px Inter;color:rgba(255,255,255,.85);margin-top:22px'>{E(s['hook_sub'])}</div>",'padding:56px 60px;width:900px')}
<div style='position:relative;margin-top:44px;font:600 30px Inter;color:#fff;opacity:.8'>Swipe →</div>{ft(k,n)}</div>"""
            elif s["type"]=="content":
                b=f"""<div class='s b' style='background:#0B0B0B'>{blobs(cols,.55)}{gl_label(series)}<div style='flex:1'></div>
<div style='position:relative;display:flex;justify-content:space-between;align-items:flex-end'><span class='serif' style='font-size:200px;line-height:.8;color:#FF0000'>{k:02d}</span>{vis((pid,k))}</div>
{glass(f"<div class='serif' style='font-size:76px;line-height:1.02;color:#fff'>{E(s['title'])}</div><div class='pj' style='font-size:62px;line-height:1.05;color:#fff;margin-top:8px'>{E(s['title_red'].upper())}</div><p style='font:400 38px/1.45 Inter;color:rgba(255,255,255,.88);margin-top:30px'>{E(s['body'])}</p>",'padding:50px 54px;margin-top:44px')}<div style='flex:1.3'></div>
{ft(k,n)}</div>"""
            else:
                b=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs(cols)}
{glass(f"<div class='serif' style='font-size:104px;line-height:1;color:#fff'>{E(s['cta_title'])}</div><div style='font:500 36px Inter;color:rgba(255,255,255,.75);margin:60px 0 22px'>Comment</div>{pill()}<p style='font:500 36px/1.4 Inter;color:rgba(255,255,255,.85);margin-top:46px'>{E(s['cta_body'].split('— ',1)[-1])}</p>",'padding:70px 60px;width:900px')}{ft(k,n)}</div>"""
            pages.append((f"{pid}_slide{k:02d}",b))
    else:
        s=p["static"]
        if pid=="S1":
            steps=[x.strip() for x in s["support"].replace("2.","|").replace("3.","|").replace("1.","").split("|")]
            icons=[ltile('instagram',92),f"<div class='sh' style='width:92px;height:92px;border-radius:22px;background:#FFB300;display:grid;place-items:center'>{ic('zap','#0B0B0B',50,2.2)}</div>",ltile('whatsapp',92)]
            rows="".join(glass(f"<div style='display:flex;align-items:center;gap:26px'>{icons[i]}<span class='serif' style='font-size:64px;color:#FF0000;width:40px'>{i+1}</span><span style='font:500 34px/1.3 Inter;color:#fff'>{E(t)}</span></div>",'padding:22px 28px') for i,t in enumerate(steps))
            b=f"""<div class='s b' style='background:#0B0B0B'>{blobs(cols)}{gl_label(s['tag'])}
<div class='serif' style='position:relative;font-size:96px;line-height:1;color:#fff;margin-top:56px'>{E(s['headline'])}</div><div class='pj red' style='position:relative;font-size:90px;margin-top:6px'>{E(s['headline_red'].upper())}</div>
<div style='display:grid;gap:20px;margin-top:44px'>{rows}</div>
<div style='position:relative;margin-top:44px;display:flex;align-items:center;gap:24px;color:#fff'><span style='font:500 30px Inter;opacity:.8'>Comment</span>{pill()}<span style='font:500 28px Inter;opacity:.8'>setup guide DM mein</span></div>{ft(1,1).replace('1 / 1','')}</div>"""
        else:
            b=f"""<div class='s b' style="background:#0B0B0B url('{ph}') center top/cover">
<div style='position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.2) 0%,rgba(0,0,0,0) 38%,rgba(0,0,0,.88) 75%)'></div>
<div style='position:absolute;left:70px;right:70px;bottom:130px'>{glass(f"<span style='font:600 22px Inter;letter-spacing:.14em;color:#fff;opacity:.85'>{E(s['tag'])}</span><div class='serif' style='font-size:80px;line-height:1;color:#fff;margin-top:14px'>{E(s['headline'])}</div><div class='pj red' style='font-size:72px;line-height:1;margin-top:6px'>{E(s['headline_red'].upper())}</div><div style='font:500 30px/1.35 Inter;color:rgba(255,255,255,.85);margin-top:18px'>{E(s['support'])}</div><div style='margin-top:26px;display:flex;align-items:center;gap:20px;color:#fff'><span style='font:500 28px Inter;opacity:.8'>Comment</span>{pill()}</div>",'padding:44px 50px')}</div>
<div style='position:absolute;right:80px;top:80px;display:flex;gap:14px'>{ltile('openai',90)}{ltile('claude',90)}{ltile('googlegemini',90)}</div>{ft(1,1).replace('1 / 1','')}</div>"""
        pages.append((f"{pid}_static",b))
os.makedirs(OUTDIR,exist_ok=True)
for name,b in pages:
    open(os.path.join(OUTDIR,name+".html"),"w",encoding="utf-8").write(f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}}body{{width:1080px;height:1350px;overflow:hidden}}</style></head><body>{b}</body></html>")
print(len(pages))
