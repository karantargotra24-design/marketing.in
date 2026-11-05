import sys, json, os, html as H
WEEK, OUTDIR = sys.argv[1], sys.argv[2]
exec(open("/tmp/kwscripts/variants.py").read())   # brand-only helpers: blobs, glass, stk, stki, tag, arrow, circle, pillcta, zaptile, ltile, ic, logo
E=H.escape
w=json.load(open(WEEK,encoding="utf-8"))
def gtile(icon,sz=120): return glass(ic(icon,"#fff",int(sz*.52),2),f"width:{sz}px;height:{sz}px;display:grid;place-items:center;border-radius:{int(sz*.26)}px")
def lr(t): return f"<div style='position:relative;color:#fff'>{lrow(t)}</div>"
def photo_bg(): return f"background:#0B0B0B url('{ph}') center top/cover"
SHADE="<div style='position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,.86) 76%)'></div>"
pages=[]
for p in w["posts"]:
    pid=p["id"]
    if pid=="C1":   # variant 1: B+D
        n=len(p["slides"]); IC={2:"eye",4:"file-text",5:"pin",6:"link"}
        for s in p["slides"]:
            k=s["n"]
            if s["type"]=="hook":
                b=f"""<div class='s b' style="{photo_bg()}">{SHADE}{stk('instagram',120,10,850,90)}
<div style='position:absolute;left:70px;right:70px;bottom:150px'>{glass(f"<span style='font:600 22px Inter;letter-spacing:.14em;color:#fff;opacity:.85'>{E(s['tag'])}</span><div class='serif' style='font-size:86px;line-height:1;color:#fff;margin-top:14px'>{E(s['hook'])}</div><div style='margin-top:16px'>{tag(E(s['hook_red']),-2,54,True)}</div><div style='font:500 32px Inter;color:rgba(255,255,255,.85);margin-top:24px'>{E(s['hook_sub'])}</div>",'padding:44px 50px')}</div>{ft(k,n)}</div>"""
            elif s["type"]=="content":
                sticker = stk('instagram',120,8,800,150) if k==3 else stki(IC[k],120,8,800,150)
                num=f"<div style='position:relative;display:inline-block'><span class='serif' style='font-size:200px;line-height:.8;color:#FF0000'>{k:02d}</span>{circle(300,240,-50,-50) if k==2 else ''}</div>"
                b=f"""<div class='s b' style='background:#0B0B0B'>{blobs()}{lr(p['pillar'])}{sticker}<div style='flex:1'></div><div style='position:relative'>{num}</div>
{glass(f"<div class='serif' style='font-size:76px;line-height:1.02;color:#fff'>{E(s['title'])}</div><div style='margin-top:16px'>{tag(E(s['title_red'].upper()),-2,48)}</div><p style='font:400 38px/1.45 Inter;color:rgba(255,255,255,.88);margin-top:30px'>{E(s['body'])}</p>",'padding:50px 54px;margin-top:40px')}<div style='flex:1.3'></div>{ft(k,n)}</div>"""
            else:
                b=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs()}{stk('instagram',110,-10,110,170)}{stk('whatsapp',100,9,840,190)}
{glass(f"<div class='serif' style='font-size:104px;line-height:1;color:#fff'>{E(s['cta_title'])}</div><div style='font:500 36px Inter;color:#fff;opacity:.75;margin:56px 0 22px'>Comment</div>{pillcta()}",'padding:70px 60px;width:880px')}
<div style='position:relative;margin-top:40px'>{tag(E(s['cta_body'].split('— ',1)[-1]),2,34)}</div>{ft(k,n)}</div>"""
            pages.append((f"C1_slide{k:02d}",b))
    elif pid=="C2":   # variant 2: B
        n=len(p["slides"]); VIS={2:gtile('thermometer-snowflake'),3:ltile('whatsapp',120),4:ltile('whatsapp',120),5:ltile('whatsapp',120),6:gtile('shield-check')}
        for s in p["slides"]:
            k=s["n"]
            if s["type"]=="hook":
                b=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs()}
<div style='position:relative;display:flex;gap:24px;margin-bottom:56px'>{ltile('whatsapp',140)}{gtile('message-circle',140)}{gtile('user-check',140)}</div>
{glass(f"<span style='font:600 24px Inter;letter-spacing:.14em;color:#fff;opacity:.85'>{E(s['tag'])}</span><div class='serif' style='font-size:104px;line-height:1;color:#fff;margin-top:16px'>{E(s['hook'])}</div><div class='pj' style='font-size:84px;line-height:1;margin-top:10px;color:#FF0000'>{E(s['hook_red'].upper())}</div><div style='font:500 34px Inter;color:rgba(255,255,255,.85);margin-top:22px'>{E(s['hook_sub'])}</div>",'padding:56px 60px;width:900px')}
<div style='position:relative;margin-top:44px;font:600 30px Inter;color:#fff;opacity:.8'>Swipe →</div>{ft(k,n)}</div>"""
            elif s["type"]=="content":
                b=f"""<div class='s b' style='background:#0B0B0B'>{blobs()}{lr(p['pillar'])}<div style='flex:1'></div>
<div style='position:relative;display:flex;justify-content:space-between;align-items:flex-end'><span class='serif' style='font-size:200px;line-height:.8;color:#FF0000'>{k:02d}</span>{VIS[k]}</div>
{glass(f"<div class='serif' style='font-size:76px;line-height:1.02;color:#fff'>{E(s['title'])}</div><div class='pj' style='font-size:62px;line-height:1.05;color:#fff;margin-top:8px'>{E(s['title_red'].upper())}</div><p style='font:400 38px/1.45 Inter;color:rgba(255,255,255,.88);margin-top:30px'>{E(s['body'])}</p>",'padding:50px 54px;margin-top:44px')}<div style='flex:1.3'></div>{ft(k,n)}</div>"""
            else:
                b=f"""<div class='s b' style='background:#0B0B0B;justify-content:center;align-items:center;text-align:center'>{blobs()}
{glass(f"<div class='serif' style='font-size:104px;line-height:1;color:#fff'>{E(s['cta_title'])}</div><div style='font:500 36px Inter;color:#fff;opacity:.75;margin:60px 0 22px'>Comment</div>{pillcta()}<p style='font:500 36px/1.4 Inter;color:rgba(255,255,255,.85);margin-top:46px'>{E(s['cta_body'].split('— ',1)[-1])}</p>",'padding:70px 60px;width:900px')}{ft(k,n)}</div>"""
            pages.append((f"C2_slide{k:02d}",b))
    elif pid=="S1":
        s=p["static"]; steps=[x.strip() for x in s["support"].replace("2.","|").replace("3.","|").replace("1.","").split("|")]
        icons=[ltile('instagram',92),zaptile(92),ltile('whatsapp',92)]
        rows="".join(glass(f"<div style='display:flex;align-items:center;gap:26px'>{icons[i]}<span class='serif' style='font-size:64px;color:#FF0000;width:40px'>{i+1}</span><span style='font:500 34px/1.3 Inter;color:#fff'>{E(t)}</span></div>",'padding:22px 28px') for i,t in enumerate(steps))
        b=f"""<div class='s b' style='background:#0B0B0B'>{blobs()}{lr(s['tag'])}
<div class='serif' style='position:relative;font-size:96px;line-height:1;color:#fff;margin-top:56px'>{E(s['headline'])}</div><div class='pj' style='position:relative;font-size:90px;margin-top:6px;color:#FF0000'>{E(s['headline_red'].upper())}</div>
<div style='display:grid;gap:20px;margin-top:44px'>{rows}</div>
<div style='position:relative;margin-top:44px;display:flex;align-items:center;gap:24px;color:#fff'><span style='font:500 30px Inter;opacity:.8'>Comment</span>{pillcta()}<span style='font:500 28px Inter;opacity:.8'>setup guide DM mein</span></div><div class='ft'><span>@karantargotra.a</span><span></span></div></div>"""
        pages.append(("S1_static",b))
    else:
        s=p["static"]
        b=f"""<div class='s b' style="{photo_bg()}">{SHADE}
<div style='position:absolute;right:80px;top:80px;display:flex;gap:14px'>{ltile('openai',90)}{ltile('claude',90)}{ltile('googlegemini',90)}</div>
<div style='position:absolute;left:70px;right:70px;bottom:130px'>{glass(f"<span style='font:600 22px Inter;letter-spacing:.14em;color:#fff;opacity:.85'>{E(s['tag'])}</span><div class='serif' style='font-size:80px;line-height:1;color:#fff;margin-top:14px'>{E(s['headline'])}</div><div class='pj' style='font-size:72px;line-height:1;margin-top:6px;color:#FF0000'>{E(s['headline_red'].upper())}</div><div style='font:500 30px/1.35 Inter;color:rgba(255,255,255,.85);margin-top:18px'>{E(s['support'])}</div><div style='margin-top:26px;display:flex;align-items:center;gap:20px;color:#fff'><span style='font:500 28px Inter;opacity:.8'>Comment</span>{pillcta()}</div>",'padding:44px 50px')}</div><div class='ft'><span>@karantargotra.a</span><span></span></div></div>"""
        pages.append(("S2_static",b))
os.makedirs(OUTDIR,exist_ok=True)
for name,b in pages:
    open(os.path.join(OUTDIR,name+".html"),"w",encoding="utf-8").write(f"<!DOCTYPE html><html><head><meta charset='utf-8'>{FONTS}<style>{CSS}*{{box-sizing:border-box;margin:0}}body{{width:1080px;height:1350px;overflow:hidden}}</style></head><body>{b}</body></html>")
print(len(pages))
