import base64
IMG = '/home/user/marketing.in/website/v2/assets/img/'
def b64(f): return 'data:image/webp;base64,' + base64.b64encode(open(IMG + f, 'rb').read()).decode()
PORTRAIT = b64('karan-portrait.webp')
STUDIO = b64('karan-studio.webp')
WA = 'https://wa.me/919682514271?text=' + 'Hi%20Karan%2C%20I%27d%20like%20a%20free%20growth%20audit%20for%20my%20business.'

CHANNELS = ['Meta Ads', 'Google Ads', 'YouTube', 'Spotify Ads', 'JioHotstar Ads', 'Snapchat Ads']
SERVICES = [
    ('Performance marketing', 'Paid campaigns planned around enquiries and sales, run across every channel your customers use, tracked from click to customer.', CHANNELS),
    ('Google Business Profile', 'Get found on Google Search and Maps when people nearby are ready to buy. Setup, posts, photos and review replies.', ['Maps ranking', 'Posts', 'Reviews']),
    ('Websites & landing pages', 'Fast, mobile-first pages built for one job: turning ad clicks into enquiries.', ['Landing pages', 'Business sites', 'Tracking']),
    ('Branding & creative strategy', 'Positioning, offers and ad creative that make people stop, understand and act.', ['Positioning', 'Ad creative', 'Content plans']),
    ('CRM & automation', 'Every lead captured, routed and followed up on WhatsApp, so none goes cold.', ['Lead capture', 'WhatsApp follow-up', 'Reports']),
]
INDUSTRIES = [
    ('Automotive', 'Test drives, exchange offers, showroom visits'),
    ('Real estate', 'Site visits and project launches'),
    ('Education & visas', 'Counselling bookings and admissions'),
    ('Healthcare', 'Appointments and awareness, within platform policies'),
    ('Hospitality', 'Room bookings and seasonal offers'),
    ('Retail & food', 'Store visits, launches and online orders'),
]
WORK = [
    ('Automotive dealership', 'Meta lead campaigns, test-drive funnel and WhatsApp follow-up', 'Ongoing'),
    ('Real estate developer', 'Brand positioning, content engine and site-visit campaigns', 'Ongoing'),
    ('Visa & education consultancy', '360° audit, local setup and a growth roadmap', 'Completed'),
    ('Astrology & wellness brand', 'Business growth strategy and channel plan', 'Completed'),
    ('Food & e-commerce brand', 'Brand development and online growth', 'Upcoming'),
]
STEPS = [('Discover', 'Your business, offer, customers and goals.'), ('Plan', 'A written strategy and channel mix, agreed before any spend.'),
         ('Launch', 'Tracking verified, creatives and pages live.'), ('Optimise', 'Test, cut what does not sell, scale what does.')]


def sections(arrow='→'):
    svc = ''.join(f'''<article class="svc"><span class="svc-n">{i+1:02d}</span><h3>{t}</h3><p>{d}</p><ul class="chips">{''.join(f'<li>{c}</li>' for c in cs)}</ul></article>''' for i, (t, d, cs) in enumerate(SERVICES))
    ind = ''.join(f'<li class="ind"><b>{t}</b><span>{d}</span></li>' for t, d in INDUSTRIES)
    work = ''.join(f'<article class="wk"><span class="wk-tag">{s}</span><h3>{t}</h3><p>{d}</p></article>' for t, d, s in WORK)
    steps = ''.join(f'<li class="st"><span class="st-n">{i+1}</span><h4>{t}</h4><p>{d}</p></li>' for i, (t, d) in enumerate(STEPS))
    return f'''
<section class="sec" id="services"><div class="wrap">
  <div class="sh"><p class="ey">What we do</p><h2>Performance marketing, <em>end to end</em></h2>
  <p class="lead">From the first ad someone sees to the WhatsApp message that closes the sale. One team, one plan, every channel.</p></div>
  <div class="svc-grid">{svc}</div>
</div></section>
<section class="sec alt" id="industries"><div class="wrap">
  <div class="sh"><p class="ey">Industries</p><h2>Built for businesses <em>that sell</em></h2></div>
  <ul class="ind-grid">{ind}</ul>
</div></section>
<section class="sec" id="work"><div class="wrap">
  <div class="sh"><p class="ey">Selected work</p><h2>Work, by <em>industry</em></h2>
  <p class="lead">Client names and results stay private. Ask for a walkthrough on a call.</p></div>
  <div class="wk-grid">{work}</div>
</div></section>
<section class="sec alt" id="process"><div class="wrap">
  <div class="sh"><p class="ey">How we work</p><h2>Four steps, <em>no surprises</em></h2></div>
  <ol class="steps">{steps}</ol>
</div></section>
<section class="sec" id="about"><div class="wrap founder">
  <figure class="f-img"><img src="{STUDIO}" alt="Karan Targotra, founder of ScapeMedia" loading="lazy"></figure>
  <div class="f-tx"><p class="ey">Founder</p><h2>Karan <em>Targotra</em></h2>
  <p class="lead">ScapeMedia is founder-led. Karan plans every campaign, tests formats and offers before recommending them, and reports in plain language a business owner can act on.</p>
  <p class="cert">Meta Blueprint · Google Ads · Google Analytics · HubSpot certified</p></div>
</div></section>
<section class="cta" id="contact"><div class="wrap cta-in">
  <div><p class="ey">Free growth audit</p><h2>Let's grow your <em>business</em></h2>
  <p>Tell us what you sell and who you want to reach. We reply on WhatsApp with a clear next step.</p></div>
  <form class="form" id="lead">
    <label>Name<input name="n" required autocomplete="name"></label>
    <label>WhatsApp number<input name="p" required inputmode="tel" pattern="[0-9 +]{{10,14}}" autocomplete="tel"></label>
    <label>Interested in<select name="s">{''.join(f'<option>{t}</option>' for t, _, _ in SERVICES)}</select></label>
    <button class="btn btn-p" type="submit">Get my free audit <span>{arrow}</span></button>
    <a class="wa-out" id="waOut" href="{WA}" rel="noopener">Open WhatsApp to send</a>
    <small>Opens WhatsApp with your details filled in. No spam.</small>
  </form>
</div></section>
<footer class="ft"><div class="wrap ft-in">
  <div><span class="logo">ScapeMedia</span><p>Performance marketing agency · Jammu, J&amp;K</p></div>
  <div class="ft-l"><a href="#services">Services</a><a href="#work">Work</a><a href="#about">About</a><a href="{WA}">WhatsApp +91 96825 14271</a></div>
  <p class="legal">Meta, Google, YouTube, Spotify, JioHotstar and Snapchat are trademarks of their owners. ScapeMedia is an independent agency. Results depend on offer, budget and market.</p>
</div></footer>'''


FORM_JS = '''
const f=document.getElementById('lead'),wa=document.getElementById('waOut');
f&&f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f);
const msg=`Hi Karan, I'd like a free growth audit.\\nName: ${d.get('n')}\\nWhatsApp: ${d.get('p')}\\nInterested in: ${d.get('s')}`;
wa.href='https://wa.me/919682514271?text='+encodeURIComponent(msg);wa.classList.add('on');wa.focus();});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.15});
document.querySelectorAll('.sh,.svc,.ind,.wk,.st,.founder,.cta-in').forEach(el=>{el.classList.add('rv');io.observe(el)});
'''

BASE_CSS = '''*{box-sizing:border-box;min-width:0}html{scroll-behavior:smooth;scroll-padding-top:80px}
body{margin:0;overflow-x:clip;-webkit-font-smoothing:antialiased}img{max-width:100%;display:block}a{color:inherit}
.wrap{width:min(1240px,100% - 40px);margin-inline:auto}
.sec{padding:clamp(72px,9vw,128px) 0}
.sh{max-width:760px;margin-bottom:48px}.sh h2,.founder h2,.cta h2{margin:0;text-wrap:balance}
.lead{font-size:clamp(16px,1.4vw,19px);line-height:1.6;margin:20px 0 0;max-width:60ch}
.svc-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}
.svc{grid-column:span 2}.svc:first-child{grid-column:span 4;grid-row:span 2}.svc:nth-child(2){grid-column:span 2}
.svc h3{margin:12px 0 8px}.svc p{margin:0 0 18px;line-height:1.6}
.chips{list-style:none;padding:0;margin:auto 0 0;display:flex;flex-wrap:wrap;gap:8px}
.ind-grid{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0}
.ind{display:flex;flex-direction:column;gap:6px;padding:28px 24px 28px 0}
.wk-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}
.wk h3{margin:14px 0 8px;font-size:18px}.wk p{margin:0;font-size:14px;line-height:1.55}
.steps{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
.st h4{margin:14px 0 6px;font-size:18px}.st p{margin:0;line-height:1.55;font-size:15px}
.founder{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,6vw,96px);align-items:center}
.f-img{margin:0;aspect-ratio:4/5;overflow:hidden}.f-img img{width:100%;height:100%;object-fit:cover}
.cert{font-size:14px;margin-top:24px}
.cta{padding:clamp(72px,9vw,120px) 0}.cta-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:48px;align-items:center}
.cta p{line-height:1.6;max-width:46ch}
.form{display:grid;gap:14px;padding:28px}.form label{display:grid;gap:6px;font-size:13px;font-weight:600}
.form input,.form select{height:48px;border-radius:8px;padding:0 14px;font:inherit;font-size:16px;font-weight:400}
.form small{font-size:12px;opacity:.75}
.wa-out{display:none;text-align:center;font-weight:700;padding:12px;border-radius:8px}.wa-out.on{display:block}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:52px;padding:0 24px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;border:1px solid transparent;cursor:pointer;transition:background-color .2s,color .2s,transform .2s}
.btn:active{transform:scale(.98)}.btn span{transition:transform .2s}.btn:hover span{transform:translateX(3px)}
:focus-visible{outline:2px solid #E10600;outline-offset:3px}
.ft{padding:56px 0 40px}.ft-in{display:grid;grid-template-columns:1fr auto;gap:24px}.ft p{margin:8px 0 0;font-size:14px}
.ft-l{display:flex;flex-wrap:wrap;gap:20px;font-size:14px}.ft-l a{text-decoration:none}.legal{grid-column:1/-1;font-size:12px!important;opacity:.6}
.rv{opacity:0;transform:translateY(16px);transition:opacity .6s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1)}.rv.in{opacity:1;transform:none}
nav.nv{position:fixed;inset:0 0 auto;z-index:50;transition:background-color .3s}
.nv-in{display:flex;align-items:center;justify-content:space-between;height:72px;gap:16px}
.nv-l{display:flex;gap:28px;font-size:14px}.nv-l a{text-decoration:none}
.logo{display:inline-flex;align-items:center;gap:8px;font-weight:800;font-size:19px;letter-spacing:-.01em;text-decoration:none}
.logo:before{content:"";width:9px;height:9px;border-radius:50%;background:#E10600}
@media(max-width:980px){.svc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.svc,.svc:first-child,.svc:nth-child(2){grid-column:span 1;grid-row:auto}.svc:first-child{grid-column:1/-1}
.wk-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ind-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:720px){.nv-l{display:none}.founder,.cta-in{grid-template-columns:1fr}.ft-in{grid-template-columns:1fr}}
@media(max-width:520px){.svc-grid,.wk-grid,.ind-grid,.steps{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}html{scroll-behavior:auto}}
'''


def page(title, fonts, css, nav_cls, hero, script, three=False):
    nav = f'''<nav class="nv {nav_cls}"><div class="wrap nv-in"><a class="logo" href="#top">ScapeMedia</a>
<div class="nv-l"><a href="#services">Services</a><a href="#industries">Industries</a><a href="#work">Work</a><a href="#about">About</a></div>
<a class="btn btn-p nv-b" href="#contact">Free growth audit</a></div></nav>'''
    lib = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>' if three else ''
    return f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}&display=swap">
<style>{BASE_CSS}{css}</style></head><body id="top">{nav}{hero}{sections()}{lib}
<script>{{{FORM_JS}
const nv=document.querySelector('.nv');addEventListener('scroll',()=>nv.classList.toggle('stuck',scrollY>40),{{passive:true}});
{script}}}</script></body></html>'''
