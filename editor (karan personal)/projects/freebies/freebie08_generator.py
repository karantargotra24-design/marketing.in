import os, html as H
OUT=os.environ["OUT"]; E=H.escape
CSS="""@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@800&family=Instrument+Serif:ital@0;1&display=swap');
@page{size:A4;margin:12mm 0 16mm} @page :first{margin-top:0} *{box-sizing:border-box;margin:0} body{font:400 11pt/1.5 Inter,sans-serif;color:#0B0B0B}
.cover{background:#0B0B0B;color:#fff;padding:22mm 18mm 16mm;position:relative}
.cover .k{font:600 8.5pt Inter;letter-spacing:.16em;color:#FF0000} .cover h1{font:400 34pt/1 'Instrument Serif',serif;margin-top:6mm} .cover h1 b{font:800 30pt 'Plus Jakarta Sans';letter-spacing:-.03em;display:block;color:#FF0000;text-transform:uppercase;margin-top:2mm}
.cover p{margin-top:5mm;color:#ccc;max-width:140mm} .cover .h{position:absolute;right:18mm;top:22mm;font:400 13pt 'Instrument Serif'}
.body{padding:10mm 18mm 18mm} h2{font:800 15pt 'Plus Jakarta Sans';letter-spacing:-.02em;margin:7mm 0 3mm;display:flex;gap:3mm;align-items:baseline} h2 span{font:400 22pt 'Instrument Serif';color:#FF0000}
.box{border:1.5px solid #0B0B0B;border-radius:4mm;padding:4mm 5mm;margin:2.5mm 0;break-inside:avoid} .box small{display:block;font:600 8pt Inter;letter-spacing:.14em;color:#6B6B6B;margin-bottom:1.5mm}
.prompt{font:500 10.5pt/1.5 'Courier New',monospace;background:#F4F4F4;border-radius:3mm;padding:3.5mm 4mm;white-space:pre-wrap}
ul.ck{list-style:none;padding:0} ul.ck li{padding:2.2mm 0 2.2mm 9mm;border-bottom:1px solid #E6E6E6;position:relative} ul.ck li:before{content:"";position:absolute;left:0;top:2.6mm;width:4.5mm;height:4.5mm;border:1.5px solid #0B0B0B;border-radius:1mm}
.tip{background:#0B0B0B;color:#fff;border-radius:4mm;padding:4mm 5mm;margin-top:6mm} .tip b{color:#FF0000}
.foot{position:fixed;bottom:8mm;left:18mm;right:18mm;display:flex;justify-content:space-between;font:500 8pt Inter;color:#6B6B6B;border-top:1px solid #E6E6E6;padding-top:2mm}
"""
def doc(fname,kicker,title,punch,intro,body):
    h=f"<!DOCTYPE html><html><head><meta charset='utf-8'><style>{CSS}</style></head><body><div class='cover'><div class='h'>@karantargotra.a</div><div class='k'>{kicker}</div><h1>{title}<b>{punch}</b></h1><p>{intro}</p></div><div class='body'>{body}</div></body></html>"
    open(f"{OUT}/{fname}.html","w").write(h)
P=lambda t: f"<div class='prompt'>{E(t)}</div>"

steps=[("Pick one real task",["Choose a task you actually do every week (caption, summary, research, design)","Write down how long it takes you today"]),
("Same prompt, 2 tools",["Write one clear prompt (role, context, task, format)","Run the exact same prompt in both tools","Use the free plan first if one exists"]),
("Time it",["Note the minutes until you get a result you'd actually use","Count how many follow-up prompts you needed"]),
("Check every fact",["Verify every number, date and claim against a real source","Note any made-up facts or broken links"])]
b="".join(f"<h2><span>{i:02d}</span>{E(t)}</h2><ul class='ck'>"+"".join(f"<li>{E(x)}</li>" for x in items)+"</ul>" for i,(t,items) in enumerate(steps,1))
b+="<h2><span>05</span>Score sheet</h2><div class='box'><small>FILL IN FOR EACH TOOL</small><table style='width:100%;border-collapse:collapse;font-size:10pt'><tr><th style='text-align:left;border-bottom:1.5px solid #0B0B0B;padding:2mm'>Check</th><th style='border-bottom:1.5px solid #0B0B0B;padding:2mm'>Tool A</th><th style='border-bottom:1.5px solid #0B0B0B;padding:2mm'>Tool B</th></tr>"+"".join(f"<tr><td style='padding:2.5mm 2mm;border-bottom:1px solid #E6E6E6'>{r}</td><td style='border-bottom:1px solid #E6E6E6'></td><td style='border-bottom:1px solid #E6E6E6'></td></tr>" for r in ["Minutes to a usable result","Follow-up prompts needed","Facts that were wrong","Would I post this? (yes / no)","Price per month (₹)"])+"</table></div>"
b+="<div class='tip'><b>Rule:</b> pay for the tool that wins on your own task, not the one with the best ads.</div>"
doc("08_ai_tool_test_sheet","FREE TEST SHEET","Test an AI tool","BEFORE YOU PAY","A 20-minute test to compare two AI tools on your own work.",b)
