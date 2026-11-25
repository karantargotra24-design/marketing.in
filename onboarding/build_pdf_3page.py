import base64, io, os, qrcode
from PIL import Image, ImageOps

W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
IM = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/images/'
OUT = '/home/user/marketing.in/onboarding/'
os.makedirs(OUT, exist_ok=True)

# ScapeMedia brand: BLACK + WHITE + RED only
RED = '#E10600'
BLACK = '#0A0A0A'
WHITE = '#FFFFFF'
G1 = '#3A3A3A'   # body grey on white
G2 = '#BDBDBD'   # body grey on black
G3 = '#1A1A1A'   # card on black
LINE = '#2C2C2C'

def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
def font(wt): return "@font-face{font-family:'Poppins';font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (wt, b64(W + 'node_modules/@fontsource/poppins/files/poppins-latin-%s-normal.woff2' % wt))
fonts = ''.join(font(w) for w in (400, 500, 600, 700))

def photo(n, w, h, cy=0.3, q=88):
    im = Image.open(IM + '%d.jpg' % n).convert('RGB'); im = ImageOps.fit(im, (w, h), Image.LANCZOS, centering=(0.5, cy))
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()
hero = photo(27, 880, 1100, 0.3)
avatar = photo(27, 400, 400, 0.2)

qr = qrcode.QRCode(border=1, box_size=10); qr.add_data('https://wa.me/919682514271?text=Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit.'); qr.make(fit=True)
qb = io.BytesIO(); qr.make_image(fill_color=BLACK, back_color='#FFFFFF').convert('RGB').save(qb, 'PNG')
qrdata = 'data:image/png;base64,' + base64.b64encode(qb.getvalue()).decode()

def logo(on_dark=False):
    return '<div class="logo"><i></i>ScapeMedia<small>Meta Ads</small></div>'

css = fonts + '''
@page{size:1080px 1350px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;font:400 26px/1.5 Poppins,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:1080px;height:1350px;position:relative;overflow:hidden;page-break-after:always;padding:80px}
.logo{display:flex;align-items:center;gap:12px;font:700 30px Poppins;letter-spacing:-.01em}
.logo i{width:18px;height:18px;border-radius:50%;background:@RED@}
.logo small{font:500 15px Poppins;opacity:.6;margin-left:4px}
.kick{font:600 20px Poppins;color:@RED@;margin-bottom:14px;display:flex;align-items:center;gap:12px}
.kick:before{content:"";width:34px;height:4px;background:@RED@;border-radius:2px}
h1,h2{font-family:Poppins;font-weight:700;letter-spacing:-.025em;line-height:1.06}
h2{font-size:72px}
.red{color:@RED@}
.foot{position:absolute;left:80px;right:80px;bottom:38px;display:flex;justify-content:space-between;font:500 17px Poppins;opacity:.55}

/* PAGE 1: white */
.p1{background:@WHITE@;color:@BLACK@}
.p1 .bar{position:absolute;left:0;top:0;bottom:0;width:22px;background:@RED@}
.p1 .logo{margin-left:6px}
.p1 .tag{position:absolute;right:80px;top:88px;font:600 17px Poppins;color:@BLACK@;opacity:.7}
.p1 h1{font-size:100px;margin:46px 0 0 6px}
.p1 .low{position:absolute;left:86px;right:80px;top:670px;bottom:80px;display:grid;grid-template-columns:1fr 500px;gap:40px}
.p1 .L{display:flex;flex-direction:column;justify-content:space-between}
.p1 .sub{font:500 31px/1.35 Poppins;color:@G1@}
.chips{display:grid;gap:12px;justify-items:start}
.chip{font:600 21px Poppins;padding:11px 24px;border-radius:999px;background:@RED@;color:#fff}
.chip.o{background:transparent;border:2.5px solid @BLACK@;color:@BLACK@}
.p1 .by{border-top:3px solid @BLACK@;padding-top:16px;font:500 21px Poppins;color:@G1@}
.p1 .by b{display:block;font:700 27px Poppins;color:@BLACK@}
.art{position:relative}
.blob{position:absolute;right:-60px;bottom:-30px;width:470px;height:470px;border-radius:50%;background:@RED@}
.card{position:absolute;inset:0;border-radius:250px 250px 28px 28px;overflow:hidden;background:#000 center/cover no-repeat;border:6px solid @WHITE@;box-shadow:0 30px 60px -20px #000a}

/* PAGE 2: black */
.p2{background:@BLACK@;color:@WHITE@}
.p2 h2{font-size:64px}
.p2 .logo small{opacity:.55}
.flow{display:grid;grid-template-columns:repeat(5,1fr);margin-top:34px;position:relative}
.flow:before{content:"";position:absolute;left:10%;right:10%;top:34px;height:4px;background:@RED@;border-radius:2px}
.flow div{text-align:center;position:relative;font:600 19px/1.2 Poppins}
.flow b{display:grid;place-items:center;width:68px;height:68px;margin:0 auto 10px;border-radius:50%;background:@BLACK@;color:#fff;border:4px solid @RED@;font:700 24px Poppins}
.flow div:last-child b{background:@RED@}
.tiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:30px}
.tile{background:@G3@;border:1.5px solid @LINE@;border-radius:24px;padding:22px 24px}
.tile .ic{font:700 20px Poppins;color:@RED@}
.tile h3{font:700 29px/1.1 Poppins;letter-spacing:-.02em;margin:6px 0 6px}
.tile p{font:400 20px/1.4 Poppins;color:@G2@}
.tile.hot{background:@RED@;border-color:@RED@}.tile.hot .ic{color:#fff;opacity:.85}.tile.hot p{color:#fff}
.ind{margin-top:26px;padding:22px 28px;border-radius:24px;border:1.5px solid @LINE@}
.ind h3{font:600 20px Poppins;color:@RED@;margin-bottom:12px}
.ind div{display:flex;flex-wrap:wrap;gap:10px}
.ind span{font:500 20px Poppins;padding:7px 16px;border-radius:999px;border:1.5px solid #555}
.steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:20px}
.steps div{font:600 19px Poppins;text-align:center;padding:12px 4px;border-radius:16px;background:@WHITE@;color:@BLACK@}
.steps small{display:block;color:@RED@;font:700 15px Poppins}

/* PAGE 3: white */
.p3{background:@WHITE@;color:@BLACK@}
.p3 h2{font-size:76px;margin-top:22px}
.nums{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:30px}
.nums div{padding:22px 24px 20px;border-radius:24px;background:@BLACK@;color:#fff;border-top:8px solid @RED@}
.nums b{display:block;font:700 62px/1 Poppins;letter-spacing:-.04em}
.nums span{font:400 19px/1.35 Poppins;color:@G2@;display:block;margin-top:10px}
.src{font:400 17px/1.4 Poppins;color:#6a6a6a;margin-top:12px}
.price{margin-top:22px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 34px;border-radius:26px;background:@RED@;color:#fff}
.price b{font:700 54px/1 Poppins;letter-spacing:-.03em}
.price b small{font:500 24px Poppins;opacity:.85;letter-spacing:0}
.price span{font:500 21px/1.35 Poppins;text-align:right;max-width:390px}
.cta{display:grid;grid-template-columns:1fr 250px;gap:28px;margin-top:22px;align-items:center}
.btns{display:grid;gap:14px}
.btn{border-radius:999px;padding:18px 30px;font:600 25px Poppins}
.b1{background:@BLACK@;color:#fff}
.b2{background:@RED@;color:#fff}
.b3{border:2.5px solid @BLACK@;font-size:21px}
.qr{border:3px solid @BLACK@;border-radius:26px;padding:16px;text-align:center;font:600 17px Poppins}
.qr img{width:100%;display:block;margin-bottom:6px}
.who{display:grid;grid-template-columns:92px 1fr;gap:20px;align-items:center;margin-top:20px}
.who .a{width:92px;height:92px;border-radius:50%;background:center top/cover;border:4px solid @RED@}
.who b{font:700 28px Poppins;display:block}.who span{font:400 21px Poppins;color:@G1@}
.legalbar{position:absolute;left:0;right:0;bottom:0;height:88px;background:@BLACK@;padding:18px 80px;font:400 14px/1.45 Poppins;color:#a9a9a9}
'''
for k, v in {'@RED@': RED, '@BLACK@': BLACK, '@WHITE@': WHITE, '@G1@': G1, '@G2@': G2, '@G3@': G3, '@LINE@': LINE}.items(): css = css.replace(k, v)

p1 = '''<section class="pg p1"><div class="bar"></div>%s<div class="tag">Performance marketing &middot; Jammu</div>
<h1>We turn<br>ad spend into<br><span class="red">business<br>opportunities.</span></h1>
<div class="low"><div class="L"><p class="sub">Specialist Meta Ads for businesses in Jammu &amp; J&amp;K that want customers, not just reach.</p>
<div class="chips"><span class="chip">Meta Ads</span><span class="chip o">Leads</span><span class="chip o">Enquiries</span><span class="chip o">Customers</span></div>
<div class="by"><b>Karan Targotra</b>Founder, ScapeMedia</div></div>
<div class="art"><div class="blob"></div><div class="card" style="background-image:url(%s)"></div></div></div></section>''' % (logo(), hero)

p2 = '''<section class="pg p2">%s<div style="margin-top:30px"><p class="kick">One specialisation</p>
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
<div class="foot"><span>scapemedia.in</span><span>2 / 3</span></div></section>''' % logo(True)

p3 = '''<section class="pg p3">%s
<h2>Real work.<br><span class="red">Real data.</span></h2>
<div class="nums"><div><b>7.13L</b><span>Instagram views &middot; Jammu Motors</span></div><div><b>2.55L</b><span>Unique viewers reached</span></div><div><b>9.9L</b><span>Views in one month &middot; founder account</span></div></div>
<p class="src">Verified: Instagram Insights (13 Aug &ndash; 10 Nov 2026; June 2026). Ad spend, leads and sales stay client-confidential.</p>
<div class="price"><b>&#8377;6,000<small> /month</small></b><span>Starting price for Meta Ads management. Ad spend is paid directly to Meta.</span></div>
<div class="cta"><div class="btns"><div class="btn b1">Get your free growth audit</div><div class="btn b2">WhatsApp &nbsp;+91 96825 14271</div><div class="btn b3">karan@scapemedia.in &nbsp;&middot;&nbsp; scapemedia.in</div></div>
<div class="qr"><img src="%s" alt="">Scan to chat</div></div>
<div class="who"><div class="a" style="background-image:url(%s)"></div><div><b>Karan Targotra</b><span>Founder &middot; Jammu, J&amp;K</span></div></div>
<div class="legalbar">Meta, Facebook and Instagram are trademarks of Meta Platforms, Inc. ScapeMedia is independent and not affiliated with Meta. Prices are starting points, excluding taxes. Results depend on offer, budget, market and follow-up; none are guaranteed.</div></section>''' % (logo(), qrdata, avatar)

html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ScapeMedia | Meta Ads for Jammu businesses</title><style>%s</style></head><body>%s</body></html>' % (css, p1 + p2 + p3)
open(OUT + 'ScapeMedia_Onboarding_3page.html', 'w').write(html)
print('ok', len(html))
