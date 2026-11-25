import base64, io, os, qrcode
from PIL import Image, ImageOps

W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
IM = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/images/'
OUT = '/home/user/marketing.in/onboarding/'
os.makedirs(OUT, exist_ok=True)
R = '#E4202D'      # ScapeMedia red
R2 = '#FF4D55'     # light red

def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
def font(fam, wt, f, pkg): return "@font-face{font-family:'%s';font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (fam, wt, b64(W + 'node_modules/@fontsource/%s/files/%s' % (pkg, f)))
fonts = ''.join([font('Space Grotesk', 500, 'space-grotesk-latin-500-normal.woff2', 'space-grotesk'), font('Space Grotesk', 700, 'space-grotesk-latin-700-normal.woff2', 'space-grotesk'),
                 font('Inter', 400, 'inter-latin-400-normal.woff2', 'inter'), font('Inter', 600, 'inter-latin-600-normal.woff2', 'inter')])

def photo(n, w, h, cy=0.3, q=86):
    im = Image.open(IM + '%d.jpg' % n).convert('RGB'); im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, cy))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
red = photo(25, 800, 1100, 0.3)
studio = photo(26, 400, 400, 0.18)

qr = qrcode.QRCode(border=1, box_size=10); qr.add_data('https://wa.me/919682514271?text=Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit.'); qr.make(fit=True)
qb = io.BytesIO(); qr.make_image(fill_color='#0B0B0C', back_color='#FFFFFF').convert('RGB').save(qb, 'PNG')
qrdata = 'data:image/png;base64,' + base64.b64encode(qb.getvalue()).decode()

LOGO = '<div class="logo"><i></i>ScapeMedia<small>Meta Ads</small></div>'

css = fonts + '''
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;font:400 26px/1.45 Inter,sans-serif;color:#F5F1EE;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:1080px;height:1350px;position:relative;overflow:hidden;page-break-after:always;background:#0A0A0B;padding:80px}
.pg.lt{background:#F4F0EC;color:#0A0A0B}
h1,h2,h3,.logo,.k{font-family:'Space Grotesk',sans-serif}
.logo{display:flex;align-items:center;gap:12px;font-weight:700;font-size:30px;letter-spacing:-.02em}
.logo i{width:16px;height:16px;border-radius:50%;background:%(R)s;box-shadow:0 0 24px %(R)s}
.logo small{font:500 14px 'Space Grotesk';letter-spacing:.18em;text-transform:uppercase;color:#9a9aa3;margin-left:6px}
.lt .logo small{color:#6b6b73}
.red{color:%(R)s}.pg:not(.lt) .red{color:%(R2)s}
.eb{font:700 17px 'Space Grotesk';letter-spacing:.22em;text-transform:uppercase;color:%(R2)s;display:flex;align-items:center;gap:14px;margin-bottom:22px}
.eb:before{content:"";width:40px;height:3px;background:currentColor}
.lt .eb{color:%(R)s}
h2{font:700 84px/.94 'Space Grotesk';letter-spacing:-.045em;text-transform:uppercase}
.foot{position:absolute;left:80px;right:80px;bottom:40px;display:flex;justify-content:space-between;font:500 16px 'Space Grotesk';letter-spacing:.16em;text-transform:uppercase;color:#6f6f78}
.chip{display:inline-block;font:700 19px 'Space Grotesk';letter-spacing:.12em;text-transform:uppercase;padding:13px 22px;border-radius:999px;border:2px solid %(R)s;color:#fff;background:#E4202D22}

/* PAGE 1 */
.p1{padding:0}
.p1 .ph{position:absolute;right:-40px;top:0;width:640px;height:1350px;background:#000 center/cover no-repeat}
.p1 .ph:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0A0A0B 0%%,#0a0a0b00 55%%),linear-gradient(0deg,#0A0A0B 0%%,#0a0a0b00 35%%)}
.p1 .glow{position:absolute;left:-200px;bottom:-250px;width:900px;height:900px;border-radius:50%%;background:radial-gradient(circle,#E4202D55,transparent 65%%)}
.p1 .in{position:absolute;left:80px;top:80px;bottom:80px;width:760px;display:flex;flex-direction:column}
.p1 h1{font:700 124px/.88 'Space Grotesk';letter-spacing:-.055em;text-transform:uppercase;margin-top:auto}
.p1 h1 em{font-style:normal;color:%(R2)s;text-shadow:0 0 40px #E4202D88}
.p1 .sub{font:500 32px/1.3 'Space Grotesk';color:#d8d8de;margin-top:34px;max-width:600px}
.p1 .chips{display:flex;gap:12px;flex-wrap:wrap;margin-top:40px;max-width:720px}
.p1 .by{margin-top:40px;font:500 21px 'Space Grotesk';color:#9a9aa3}
.p1 .by b{color:#fff}

/* PAGE 2 */
.flow{display:grid;grid-template-columns:repeat(5,1fr);gap:0;margin-top:46px;position:relative}
.flow:before{content:"";position:absolute;left:10%%;right:10%%;top:38px;height:4px;background:linear-gradient(90deg,%(R)s,%(R2)s);border-radius:2px}
.flow div{text-align:center;position:relative;font:700 19px/1.15 'Space Grotesk';letter-spacing:.06em;text-transform:uppercase}
.flow b{display:grid;place-items:center;width:78px;height:78px;margin:0 auto 14px;border-radius:50%%;background:#0A0A0B;color:#fff;border:4px solid %(R)s;font:700 24px 'Space Grotesk';box-shadow:0 0 0 8px #E4202D22}
.flow div:last-child b{background:%(R)s}
.tiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:46px}
.tile{background:#fff;border:1px solid #0a0a0b14;border-radius:26px;padding:28px 26px;min-height:196px}
.tile .ic{font:700 20px 'Space Grotesk';color:%(R)s;letter-spacing:.1em}
.tile h3{font:700 33px/1 'Space Grotesk';letter-spacing:-.03em;text-transform:uppercase;margin:12px 0 8px}
.tile p{font-size:21px;color:#4a4a52;line-height:1.35}
.tile.hot{background:%(R)s;color:#fff;border:0}.tile.hot .ic{color:#fff;opacity:.85}.tile.hot p{color:#fff}
.ind{margin-top:44px;padding:30px 34px;border-radius:26px;background:#0A0A0B;color:#fff}
.ind h3{font:700 22px 'Space Grotesk';letter-spacing:.2em;text-transform:uppercase;color:%(R2)s;margin-bottom:16px}
.ind div{display:flex;flex-wrap:wrap;gap:10px}
.ind span{font:600 22px 'Space Grotesk';padding:10px 18px;border-radius:999px;border:1.5px solid #ffffff33}
.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:30px}
.steps div{font:700 20px 'Space Grotesk';text-transform:uppercase;letter-spacing:.04em;text-align:center;padding:16px 4px;border-radius:16px;background:#E4202D14;border:1.5px solid #E4202D55}
.steps small{display:block;color:%(R)s;font-size:15px;margin-bottom:2px}

/* PAGE 3 */
.p3 .bg{position:absolute;inset:0;background:radial-gradient(900px 700px at 15%% 10%%,#E4202D40,transparent 60%%),radial-gradient(800px 600px at 100%% 100%%,#E4202D2a,transparent 60%%),#0A0A0B}
.p3>*{position:relative}
.p3 h2{font-size:92px;margin-top:40px}
.nums{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:44px}
.nums div{padding:26px 24px;border-radius:24px;background:#E4202D18;border:1.5px solid #E4202D66}
.nums b{display:block;font:700 76px/1 'Space Grotesk';letter-spacing:-.05em;color:%(R2)s}
.nums span{font-size:20px;color:#d6d6dc;line-height:1.3;display:block;margin-top:8px}
.src{font-size:17px;color:#77777f;margin-top:12px}
.price{margin-top:34px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px 34px;border-radius:26px;background:#fff;color:#0A0A0B}
.price b{font:700 62px/1 'Space Grotesk';letter-spacing:-.04em;color:%(R)s}
.price b small{font:500 24px 'Space Grotesk';color:#55555e;letter-spacing:0}
.price span{font:600 22px/1.3 'Space Grotesk';text-align:right;max-width:380px}
.cta{display:grid;grid-template-columns:1fr 290px;gap:32px;margin-top:34px;align-items:center}
.btns{display:grid;gap:14px}
.btn{border-radius:999px;padding:22px 32px;font:700 27px 'Space Grotesk'}
.b1{background:%(R)s;color:#fff;box-shadow:0 14px 40px -10px %(R)s}
.b2{background:#25D366;color:#04210f}
.b3{border:2px solid #ffffff33;font-size:22px}
.qr{background:#fff;border-radius:26px;padding:18px;text-align:center;color:#0A0A0B;font:700 16px 'Space Grotesk';letter-spacing:.1em;text-transform:uppercase}
.qr img{width:100%%;display:block;margin-bottom:8px;border-radius:6px}
.who{display:grid;grid-template-columns:110px 1fr;gap:22px;align-items:center;margin-top:30px}
.who .a{width:110px;height:110px;border-radius:50%%;background:center top/cover;border:3px solid %(R)s}
.who b{font:700 28px 'Space Grotesk';display:block}.who span{font-size:21px;color:#b9b9c2}
.legal{position:absolute;left:80px;right:80px;bottom:34px;font-size:14px;line-height:1.4;color:#6b6b74}
'''.replace('%%','%').replace('%(R2)s',R2).replace('%(R)s',R)

css += """
.p2 h2{font-size:74px}.p2 .flow{margin-top:34px}.p2 .flow b{width:68px;height:68px;font-size:22px;margin-bottom:10px}.p2 .flow:before{top:34px}
.p2 .tiles{margin-top:30px;gap:14px}.p2 .tile{min-height:0;padding:22px 24px}.p2 .tile h3{font-size:30px;margin:8px 0 6px}.p2 .tile p{font-size:20px}
.p2 .ind{margin-top:26px;padding:22px 28px}.p2 .ind h3{margin-bottom:12px;font-size:19px}.p2 .ind span{font-size:20px;padding:8px 16px}
.p2 .steps{margin-top:20px}.p2 .steps div{padding:12px 4px;font-size:19px}
.p3 h2{margin-top:34px}.p3 .nums{margin-top:40px}.p3 .price{margin-top:30px}.p3 .cta{margin-top:30px}.p3 .who{margin-top:26px}
"""

p1 = '''<section class="pg p1"><div class="glow"></div><div class="ph" style="background-image:url(%s)"></div>
<div class="in">%s<h1>We turn<br>ad spend<br>into <em>business</em><br>opportunities.</h1>
<p class="sub">Specialist Meta Ads for businesses in Jammu &amp; J&amp;K that want customers, not just reach.</p>
<div class="chips"><span class="chip">Meta Ads</span><span class="chip">Leads</span><span class="chip">Enquiries</span><span class="chip">Customers</span></div>
<div class="by">By <b>Karan Targotra</b> &nbsp;·&nbsp; Founder, ScapeMedia</div></div></section>''' % (red, LOGO)

p2 = '''<section class="pg lt p2">%s<div style="margin-top:30px"><p class="eb">One specialisation</p>
<h2>Ads that build<br><span class="red">customers.</span></h2>
<div class="flow"><div><b>1</b>Ad</div><div><b>2</b>Attention</div><div><b>3</b>Enquiry</div><div><b>4</b>Qualified lead</div><div><b>5</b>Sale</div></div>
<div class="tiles">
<div class="tile hot"><span class="ic">01</span><h3>Meta Ads</h3><p>Facebook &amp; Instagram campaigns built on your goal.</p></div>
<div class="tile"><span class="ic">02</span><h3>Lead gen</h3><p>Forms and WhatsApp that capture real enquiries.</p></div>
<div class="tile"><span class="ic">03</span><h3>Creatives</h3><p>Reels, Stories and Feed ads that stop the scroll.</p></div>
<div class="tile"><span class="ic">04</span><h3>Tracking</h3><p>Pixel and cost per lead, so you know what works.</p></div>
<div class="tile"><span class="ic">05</span><h3>Follow-up</h3><p>Fast replies so leads don't go cold.</p></div>
<div class="tile hot"><span class="ic">06</span><h3>Optimise</h3><p>Test, cut losers, scale winners.</p></div></div>
<div class="ind"><h3>Built for</h3><div><span>Automotive</span><span>Real estate</span><span>Education</span><span>Healthcare</span><span>Hotels</span><span>Restaurants</span><span>Retail</span></div></div>
<div class="steps"><div><small>01</small>Discover</div><div><small>02</small>Strategise</div><div><small>03</small>Create</div><div><small>04</small>Launch</div><div><small>05</small>Optimise</div></div></div>
<div class="foot"><span>scapemedia.in</span><span>02 / 03</span></div></section>''' % LOGO

p3 = '''<section class="pg p3"><div class="bg"></div>%s
<h2>Real work.<br><span class="red">Real data.</span></h2>
<div class="nums"><div><b>7.13L</b><span>Instagram views · Jammu Motors</span></div><div><b>2.55L</b><span>Unique viewers reached</span></div><div><b>9.9L</b><span>Views in one month · founder account</span></div></div>
<p class="src">Verified: Instagram Insights (13 Aug – 10 Nov 2026; June 2026). Ad spend, leads and sales stay client-confidential.</p>
<div class="price"><b>&#8377;6,000<small> /month</small></b><span>Starting price for Meta Ads management. Ad spend is paid directly to Meta.</span></div>
<div class="cta"><div class="btns"><div class="btn b1">Get your free growth audit</div><div class="btn b2">WhatsApp &nbsp;+91 96825 14271</div><div class="btn b3">karan@scapemedia.in &nbsp;·&nbsp; scapemedia.in</div></div>
<div class="qr"><img src="%s" alt="">Scan to chat</div></div>
<div class="who"><div class="a" style="background-image:url(%s)"></div><div><b>Karan Targotra</b><span>Founder · Jammu, J&amp;K</span></div></div>
<div class="legal">Meta, Facebook and Instagram are trademarks of Meta Platforms, Inc. ScapeMedia is independent and not affiliated with Meta. Prices are starting points, excluding taxes. Results depend on offer, budget, market and follow-up; none are guaranteed.</div></section>''' % (LOGO, qrdata, studio)

html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ScapeMedia | Meta Ads for Jammu businesses</title><style>%s</style></head><body>%s</body></html>' % (css, p1 + p2 + p3)
open(OUT + 'ScapeMedia_Onboarding_3page.html', 'w').write(html)
print('ok', len(html))
