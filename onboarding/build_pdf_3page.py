import base64, io, os, qrcode
from PIL import Image, ImageOps, ImageDraw

W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
W = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/pdfwork/'
IM = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/images/'
OUT = '/home/user/marketing.in/onboarding/'
os.makedirs(OUT, exist_ok=True)

# BLACK + WHITE + RED only
RED = '#E10600'; BLACK = '#0A0A0A'; WHITE = '#FFFFFF'
G1 = '#3A3A3A'; G2 = '#BDBDBD'; G3 = '#1A1A1A'; LINE = '#2C2C2C'
PW, PH = 1080, 1620

def b64(p): return base64.b64encode(open(p, 'rb').read()).decode()
def font(wt): return "@font-face{font-family:'Poppins';font-weight:%s;src:url(data:font/woff2;base64,%s) format('woff2')}" % (wt, b64(W + 'node_modules/@fontsource/poppins/files/poppins-latin-%s-normal.woff2' % wt))
fonts = ''.join(font(w) for w in (400, 500, 600, 700))

# Cover photo: clean full-width rectangle, bottom fades into the black page (no frame, no text on it)
src = Image.open(IM + '27.jpg').convert('RGB')
ph = ImageOps.fit(src, (1080, 900), Image.LANCZOS, centering=(0.5, 0.20))
mask = Image.new('L', (1080, 900), 0); d = ImageDraw.Draw(mask)
for y in range(900):
    a = 0 if y < 740 else int(255 * ((y - 740) / 160) ** 1.4)
    d.line([(0, y), (1080, y)], fill=min(255, a))
black = Image.new('RGB', (1080, 900), (10, 10, 10)); ph = Image.composite(black, ph, mask)
bf = io.BytesIO(); ph.save(bf, 'JPEG', quality=90); cover = 'data:image/jpeg;base64,' + base64.b64encode(bf.getvalue()).decode()

qr = qrcode.QRCode(border=1, box_size=10); qr.add_data('https://wa.me/919682514271?text=Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit.'); qr.make(fit=True)
qb = io.BytesIO(); qr.make_image(fill_color=BLACK, back_color='#FFFFFF').convert('RGB').save(qb, 'PNG')
qrdata = 'data:image/png;base64,' + base64.b64encode(qb.getvalue()).decode()

logo = '<div class="logo"><i></i>ScapeMedia</div>'

css = fonts + '''
@page{size:1080px 1620px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;font:400 26px/1.5 Poppins,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:1080px;height:1620px;position:relative;overflow:hidden;page-break-after:always;padding:90px 90px}
.logo{display:flex;align-items:center;gap:12px;font:700 30px Poppins;letter-spacing:-.01em}
.logo i{width:18px;height:18px;border-radius:50%;background:@RED@}
.kick{font:600 21px Poppins;color:@RED@;display:flex;align-items:center;gap:14px}
.kick:before{content:"";width:36px;height:4px;background:@RED@;border-radius:2px}
h1,h2{font-family:Poppins;font-weight:700;letter-spacing:-.03em;line-height:1.06}
.red{color:@RED@}

/* PAGE 1: black, clean photo on top, text below, nothing overlapping */
.p1{background:@BLACK@;color:@WHITE@;padding:0}
.p1 .photo{position:absolute;left:0;top:0;width:1080px;height:900px;background:#000 center/cover no-repeat}
.p1 .top{position:absolute;left:90px;top:70px;display:flex;gap:0;width:900px;justify-content:space-between;align-items:center}
.p1 .top .logo{text-shadow:0 2px 12px #000}
.p1 .text{position:absolute;left:90px;right:90px;top:905px}
.p1 h1{font-size:92px;margin-top:20px}
.p1 .sub{font:400 30px/1.45 Poppins;color:@G2@;margin-top:30px;max-width:840px}
.p1 .tags{display:flex;gap:30px;align-items:center;margin-top:36px;font:600 24px Poppins}
.p1 .tags span{display:flex;align-items:center;gap:30px}
.p1 .tags span+span:before{content:"";width:9px;height:9px;border-radius:50%;background:@RED@}
.p1 .base{position:absolute;left:90px;right:90px;bottom:64px;display:flex;justify-content:space-between;align-items:center;font:500 22px Poppins;color:#9a9a9a}
.p1 .base .logo{color:#fff}

/* PAGE 2: white */
.p2{background:@WHITE@;color:@BLACK@}
.p2 h2{font-size:80px;margin-top:22px}
.flow{display:grid;grid-template-columns:repeat(4,1fr);margin-top:44px;position:relative}
.flow:before{content:"";position:absolute;left:12.5%;right:12.5%;top:41px;height:4px;background:@RED@}
.flow div{text-align:center;position:relative;font:600 23px Poppins}
.flow b{display:grid;place-items:center;width:84px;height:84px;margin:0 auto 14px;border-radius:50%;background:@WHITE@;color:@BLACK@;border:5px solid @RED@;font:700 28px Poppins}
.flow div:last-child b{background:@RED@;color:#fff}
.blocks{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:44px}
.blk{border-radius:20px;padding:32px 34px;background:@BLACK@;color:#fff}
.blk .n{font:700 22px Poppins;color:@RED@}
.blk h3{font:700 36px/1.15 Poppins;letter-spacing:-.02em;margin:6px 0 10px}
.blk p{font:400 22px/1.45 Poppins;color:@G2@}
.blk.red{background:@RED@}.blk.red .n{color:#fff;opacity:.85}.blk.red p{color:#fff}
.built{margin-top:34px;border-top:3px solid @BLACK@;padding-top:24px}
.built h3{font:600 22px Poppins;color:@RED@;margin-bottom:12px}
.built p{font:500 25px/1.5 Poppins;letter-spacing:-.01em}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:28px;border:3px solid @BLACK@;border-radius:18px;overflow:hidden}
.steps div{padding:20px 6px;text-align:center;font:600 24px Poppins}
.steps div+div{border-left:3px solid @BLACK@}
.steps small{display:block;color:@RED@;font:700 16px Poppins}
.foot{position:absolute;left:90px;right:90px;bottom:56px;display:flex;justify-content:space-between;font:500 19px Poppins;color:#8a8a8a}

/* PAGE 3: black */
.p3{background:@BLACK@;color:@WHITE@}
.p3 .logo{color:#fff}
.p3 h2{font-size:104px;margin-top:70px}
.p3 .sub{font:400 32px/1.45 Poppins;color:@G2@;margin-top:34px;max-width:820px}
.p3 .row{display:grid;grid-template-columns:1fr 330px;gap:50px;margin-top:80px;align-items:start}
.contact{display:grid;gap:0}
.contact div{padding:24px 0;border-top:2px solid #2e2e2e}
.contact div:last-child{border-bottom:2px solid #2e2e2e}
.contact small{display:block;font:600 18px Poppins;color:@RED@;margin-bottom:4px}
.contact b{font:600 31px Poppins;letter-spacing:-.01em}
.qr{background:#fff;border-radius:6px;padding:20px;text-align:center;color:@BLACK@;font:600 19px Poppins}
.qr img{width:100%;display:block;margin-bottom:8px}
.btn{display:inline-block;margin-top:70px;background:@RED@;color:#fff;font:600 30px Poppins;padding:24px 54px;border-radius:999px}
.who{margin-top:70px;border-top:4px solid @RED@;padding-top:20px;font:400 24px Poppins;color:@G2@}
.who b{display:block;color:#fff;font:700 32px Poppins}
.legal{position:absolute;left:90px;right:90px;bottom:48px;font:400 15px/1.45 Poppins;color:#8a8a8a}
'''
for k, v in {'@RED@': RED, '@BLACK@': BLACK, '@WHITE@': WHITE, '@G1@': G1, '@G2@': G2, '@G3@': G3}.items(): css = css.replace(k, v)

p1 = '''<section class="pg p1"><div class="photo" style="background-image:url(%s)"></div>
<div class="text"><p class="kick">Performance marketing &middot; Jammu</p>
<h1>We turn ad spend<br>into <span class="red">business<br>opportunities.</span></h1>
<p class="sub">Meta Ads built on data, designed to generate leads and drive sales for businesses in Jammu &amp; J&amp;K.</p>
<div class="tags"><span>Meta Ads</span><span>Lead generation</span><span>Sales</span><span>Data</span></div></div>
<div class="base">%s<span>scapemedia.in</span></div></section>''' % (cover, logo)

p2 = '''<section class="pg p2">%s<p class="kick" style="margin-top:36px">What we do</p>
<h2>Performance marketing<br><span class="red">that sells.</span></h2>
<div class="flow"><div><b>1</b>Meta Ads</div><div><b>2</b>Leads</div><div><b>3</b>Follow-up</div><div><b>4</b>Sales</div></div>
<div class="blocks">
<div class="blk red"><span class="n">01</span><h3>Meta Ads</h3><p>Facebook and Instagram campaigns built around your business goal.</p></div>
<div class="blk"><span class="n">02</span><h3>Lead generation</h3><p>Quality leads from the right audience, not just clicks.</p></div>
<div class="blk"><span class="n">03</span><h3>Data-led decisions</h3><p>Every rupee tracked, tested and optimised.</p></div>
<div class="blk red"><span class="n">04</span><h3>Sales focus</h3><p>A follow-up system that turns leads into customers.</p></div></div>
<div class="built"><h3>Built for</h3><p>Automotive &middot; Real estate &middot; Education &middot; Healthcare &middot; Hospitality &middot; Retail</p></div>
<div class="steps"><div><small>01</small>Strategy</div><div><small>02</small>Creative</div><div><small>03</small>Launch</div><div><small>04</small>Optimise</div></div>
</section>''' % logo

p3 = '''<section class="pg p3">%s
<h2>Let's grow<br>your <span class="red">business.</span></h2>
<p class="sub">Free growth audit for businesses in Jammu &amp; J&amp;K.</p>
<div class="row"><div class="contact">
<div><small>WhatsApp</small><b>+91 96825 14271</b></div>
<div><small>Email</small><b>karan@scapemedia.in</b></div>
<div><small>Website</small><b>scapemedia.in</b></div>
<div><small>Instagram</small><b>@karantargotra.a</b></div></div>
<div class="qr"><img src="%s" alt="">Scan to chat on WhatsApp</div></div>
<div class="who"><b>Karan Targotra</b>Founder, ScapeMedia</div>
<div class="legal">Meta, Facebook and Instagram are trademarks of Meta Platforms, Inc. ScapeMedia is independent and not affiliated with Meta. Results depend on offer, budget, market and follow-up; none are guaranteed.</div></section>''' % (logo, qrdata)

html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ScapeMedia | Meta Ads Performance Marketing, Jammu</title><style>%s</style></head><body>%s</body></html>' % (css, p1 + p2 + p3)
open(OUT + 'ScapeMedia_Onboarding_3page.html', 'w').write(html)
print('ok', len(html))
