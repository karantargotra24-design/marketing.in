from common import page, PORTRAIT, CHANNELS
OUT = '/tmp/claude-0/-home-user-marketing-in/ea79702d-7e1d-5bee-995a-615e853f0e10/scratchpad/variants/'

# shared three.js helper: text texture
TEX = '''
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function wrapT(g,t,x,y,mw,lh){const ws=t.split(' ');let l='';for(const w of ws){const k=l?l+' '+w:w;if(g.measureText(k).width>mw&&l){g.fillText(l,x,y);l=w;y+=lh}else l=k}g.fillText(l,x,y);return y}
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function sizeR(r,cam,el){const w=el.clientWidth,h=el.clientHeight;r.setSize(w,h,false);if(cam.isPerspectiveCamera){cam.aspect=w/h}else{const a=w/h,s=cam.userData.s;cam.left=-s*a;cam.right=s*a;cam.top=s;cam.bottom=-s}cam.updateProjectionMatrix()}
'''

# ---------- V1: Ad feed (black, cinematic) ----------
v1_css = '''
body{background:#0A0A0A;color:#F5F5F5;font:16px/1.55 Inter,system-ui,sans-serif}
h1,h2,.logo,.svc h3,.wk h3,.st h4{font-family:Anton,Impact,sans-serif;font-weight:400;letter-spacing:.005em;text-transform:uppercase}
h2{font-size:clamp(40px,5.6vw,76px);line-height:.98}h2 em{font-style:normal;color:#FF3B30}
.logo{font-family:Inter;font-weight:800;text-transform:none;color:#fff}
.nv.stuck{background:rgba(10,10,10,.85);backdrop-filter:blur(12px)}
.btn-p{background:#E10600;color:#fff}.btn-p:hover{background:#B00500}.btn-g{border-color:#3a3a3a;color:#fff}.btn-g:hover{border-color:#fff}
.hero{position:relative;min-height:100svh;display:grid;align-items:center;overflow:hidden}
#c1{position:absolute;inset:0;width:100%;height:100%}
.h-in{position:relative;z-index:2;padding:120px 0 80px;max-width:640px;pointer-events:none}.h-in a{pointer-events:auto}
.h-in h1{font-size:clamp(56px,9vw,132px);line-height:.92;margin:18px 0 0}.h-in h1 em{font-style:normal;color:#E10600}
.h-in p{font-size:clamp(17px,1.5vw,20px);color:#B5B5B5;max-width:44ch;margin:24px 0 32px}
.acts{display:flex;gap:12px;flex-wrap:wrap}
.ey{font-size:13px;font-weight:600;color:#A3A3A3;margin:0 0 16px;display:flex;align-items:center;gap:10px}.ey:before{content:"";width:8px;height:8px;border-radius:50%;background:#E10600;box-shadow:0 0 0 0 #E10600;animation:live 2s infinite}
@keyframes live{70%{box-shadow:0 0 0 8px rgba(225,6,0,0)}100%{box-shadow:0 0 0 0 rgba(225,6,0,0)}}
.chan{position:relative;z-index:2;border-block:1px solid #222;overflow:hidden;padding:18px 0;white-space:nowrap}
.chan div{display:inline-flex;gap:48px;animation:mq 30s linear infinite;font:400 28px Anton,sans-serif;text-transform:uppercase;color:#5c5c5c}.chan b{color:#fff;font-weight:400}
@keyframes mq{to{transform:translateX(-50%)}}
.lead{color:#A3A3A3}.alt{background:#111}
.svc{background:#141414;border:1px solid #232323;border-radius:16px;padding:28px;display:flex;flex-direction:column;transition:border-color .2s}.svc:hover{border-color:#E10600}
.svc-n{color:#E10600;font-weight:700;font-size:13px}.svc h3{font-size:30px;line-height:1}.svc:first-child h3{font-size:clamp(40px,4vw,56px)}.svc p{color:#A3A3A3}
.chips li{border:1px solid #333;border-radius:999px;padding:6px 12px;font-size:13px;color:#ddd}.svc:first-child .chips li{border-color:#E10600;color:#fff}
.ind{border-top:1px solid #262626}.ind b{font-size:20px}.ind span{color:#A3A3A3;font-size:15px}
.wk{border-top:2px solid #E10600;padding-top:16px}.wk-tag{font-size:12px;color:#A3A3A3}.wk h3{font-size:22px}.wk p{color:#A3A3A3}
.st-n{font:400 56px/1 Anton,sans-serif;color:#E10600}.st h4{font-size:24px}.st p{color:#A3A3A3}
.f-img{border-radius:20px}.cert{color:#A3A3A3}
.cta{background:#E10600}.cta .ey{color:#fff}.cta .ey:before{background:#fff;animation:none}.cta h2 em{color:#0A0A0A}
.form{background:#0A0A0A;border-radius:16px}.form input,.form select{background:#161616;border:1px solid #2a2a2a;color:#fff}
.wa-out{background:#25D366;color:#04210f}
.ft{background:#0A0A0A}.ft p{color:#A3A3A3}
@media(max-width:720px){.h-in{padding-top:110px}#c1{opacity:.45}}
'''
v1_hero = '''<header class="hero"><canvas id="c1" aria-hidden="true"></canvas><div class="wrap"><div class="h-in">
<p class="ey">Performance marketing agency · Jammu</p>
<h1>Ads that turn <em>scrolls</em> into sales</h1>
<p>We plan, create and run paid campaigns on Meta, Google, YouTube, Spotify, JioHotstar and Snapchat, and follow every lead until it buys.</p>
<div class="acts"><a class="btn btn-p" href="#contact">Get a free growth audit <span>→</span></a><a class="btn btn-g" href="#work">See our work</a></div>
</div></div></header>
<div class="chan" aria-label="Channels we run"><div>''' + ''.join(f'<span><b>{c}</b></span><span>✦</span>' for c in CHANNELS * 2) + '''</div></div>'''
v1_js = TEX + '''
const el=document.getElementById('c1');
if(window.THREE)document.fonts.ready.then(()=>{const r=new THREE.WebGLRenderer({canvas:el,antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));
const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,.1,100);cam.position.set(0,0,15);
const ads=[['Meta Ads','Test drive this weekend in Jammu','Book test drive'],['Google Search','Site visits open this Sunday','Get directions'],['YouTube','Admissions open for the new batch','Enquire now'],
['Spotify Ads','Hear the offer, tap to claim','Listen'],['JioHotstar','Festival offers, only this week','Shop now'],['Snapchat','New menu. Order in two taps','Order now'],['Google Business Profile','Open now · Get directions','Call now']];
const grp=new THREE.Group();s.add(grp);
ads.forEach((a,i)=>{const t=tex(512,900,(g,w,h)=>{g.fillStyle='#161616';rr(g,0,0,w,h,40);g.fill();g.fillStyle='#fff';g.font='700 30px Inter,sans-serif';g.fillText(a[0],40,70);g.fillStyle='#8a8a8a';g.font='500 22px Inter,sans-serif';g.fillText('Sponsored',40,104);
g.fillStyle='#0d0d0d';rr(g,40,140,w-80,420,24);g.fill();g.fillStyle='#E10600';g.beginPath();g.arc(w/2+(i%2?60:-60),330,110+i*6,0,7);g.fill();g.fillStyle='#262626';g.fillRect(40,470,w-80,90);
g.fillStyle='#fff';g.font='700 40px Inter,sans-serif';const y=wrapT(g,a[1],40,630,w-80,50);g.fillStyle='#E10600';rr(g,40,y+40,w-80,90,18);g.fill();g.fillStyle='#fff';g.font='700 32px Inter,sans-serif';g.fillText(a[2]+'  →',70,y+98)});
const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,4.22),new THREE.MeshBasicMaterial({map:t,transparent:true}));
const an=i/ads.length*Math.PI*2;m.position.set(Math.cos(an)*4.2,(i-3)*.55,Math.sin(an)*4.2);m.lookAt(0,(i-3)*.55,0);m.rotateY(Math.PI);grp.add(m)});
grp.position.x=innerWidth>720?5.6:0;grp.rotation.x=.12;
let mx=0,my=0;addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
const ro=new ResizeObserver(()=>{sizeR(r,cam,el);grp.position.x=el.clientWidth>720?5.6:0});ro.observe(el);
(function f(){grp.rotation.y+=RM?0:.0035;grp.rotation.x+=((.12+my*.2)-grp.rotation.x)*.05;cam.position.x+=(mx*1.2-cam.position.x)*.05;cam.lookAt(grp.position.x*.4,0,0);r.render(s,cam);requestAnimationFrame(f)})()})
'''
open(OUT + 'v1.html', 'w').write(page('ScapeMedia · Ad Feed', 'family=Anton&family=Inter:wght@400;500;600;700;800', v1_css, '', v1_hero, v1_js, three=True))

# ---------- V2: Channel orbit (white, precise) ----------
v2_css = '''
body{background:#fff;color:#0A0A0A;font:16px/1.55 Inter,system-ui,sans-serif}
h1,h2,.svc h3,.wk h3,.st h4{font-family:"Inter Tight",Inter,sans-serif;font-weight:600;letter-spacing:-.035em}
h2{font-size:clamp(36px,4.6vw,60px);line-height:1.02}h2 em{font-style:normal;color:#E10600}
.nv.stuck{background:rgba(255,255,255,.9);backdrop-filter:blur(12px);box-shadow:0 1px 0 #ececec}
.btn-p{background:#0A0A0A;color:#fff}.btn-p:hover{background:#E10600}.btn-g{border-color:#d6d6d6}.btn-g:hover{border-color:#0A0A0A}
.hero{min-height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);align-items:center;gap:24px;padding:96px max(20px,calc((100vw - 1240px)/2)) 40px}
.h-in h1{font-size:clamp(48px,6.6vw,96px);line-height:.95;margin:0}.h-in h1 em{font-style:normal;color:#E10600}
.h-in p{font-size:clamp(17px,1.4vw,20px);color:#5C5C5C;max-width:42ch;margin:24px 0 32px}.acts{display:flex;gap:12px;flex-wrap:wrap}
.orb{position:relative;aspect-ratio:1;max-height:82svh;width:100%}#c2{position:absolute;inset:0;width:100%;height:100%}
.ey{font-size:13px;font-weight:600;color:#E10600;margin:0 0 16px}
.lead{color:#5C5C5C}.alt{background:#F5F5F5}
.svc{border:1px solid #E6E6E6;border-radius:20px;padding:28px;display:flex;flex-direction:column;background:#fff;transition:transform .25s,box-shadow .25s}.svc:hover{transform:translateY(-3px);box-shadow:0 24px 48px -28px rgba(0,0,0,.3)}
.svc:first-child{background:#0A0A0A;color:#fff;border-color:#0A0A0A}.svc:first-child p{color:#B5B5B5}.svc:first-child h3{font-size:clamp(36px,3.6vw,52px)}
.svc-n{font-size:13px;color:#E10600;font-weight:600}.svc h3{font-size:26px;line-height:1.05}.svc p{color:#5C5C5C}
.chips li{background:#F2F2F2;border-radius:999px;padding:6px 12px;font-size:13px}.svc:first-child .chips li{background:#1c1c1c;color:#fff}
.ind{border-top:1px solid #E2E2E2}.ind b{font:600 22px "Inter Tight";letter-spacing:-.02em}.ind span{color:#5C5C5C;font-size:15px}
.wk{background:#fff;border:1px solid #E6E6E6;border-radius:16px;padding:20px}.wk-tag{font-size:12px;font-weight:600;color:#E10600}.wk p{color:#5C5C5C}
.st{border-top:2px solid #0A0A0A;padding-top:18px}.st-n{font:600 15px Inter;color:#E10600}.st h4{font-size:24px}.st p{color:#5C5C5C}
.f-img{border-radius:24px}.cert{color:#5C5C5C}
.cta{background:#0A0A0A;color:#fff}.cta .ey{color:#FF3B30}.form{background:#fff;color:#0A0A0A;border-radius:20px}
.form input,.form select{border:1px solid #D9D9D9;background:#fff}.cta .btn-p{background:#E10600}.wa-out{background:#25D366;color:#04210f}
.ft p{color:#5C5C5C}
@media(max-width:860px){.hero{grid-template-columns:1fr;padding-top:110px}.orb{max-height:none;width:min(560px,100%);margin:auto}}
'''
v2_hero = '''<header class="hero"><div class="h-in"><p class="ey">Performance marketing · Jammu</p>
<h1>Every channel. <em>One plan.</em></h1>
<p>Meta, Google, YouTube, Spotify, JioHotstar and Snapchat, planned around your business and measured by the customers they bring.</p>
<div class="acts"><a class="btn btn-p" href="#contact">Get a free growth audit <span>→</span></a><a class="btn btn-g" href="#services">Our services</a></div></div>
<div class="orb"><canvas id="c2" aria-label="Six ad channels orbiting your business"></canvas></div></header>'''
v2_js = TEX + '''
const el=document.getElementById('c2');
if(window.THREE)document.fonts.ready.then(()=>{const r=new THREE.WebGLRenderer({canvas:el,antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));
const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(30,1,.1,100);cam.position.set(0,5,18);cam.lookAt(0,0,0);
s.add(new THREE.AmbientLight(0xffffff,.75));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(3,8,6);s.add(dl);
const core=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,.5,64),[new THREE.MeshStandardMaterial({color:0xb00500,roughness:.5}),new THREE.MeshStandardMaterial({map:tex(512,512,(g,w,h)=>{g.fillStyle='#E10600';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.textAlign='center';g.font='600 64px "Inter Tight",Inter';g.fillText('Your',w/2,h/2-10);g.fillText('business',w/2,h/2+62)}),roughness:.45}),new THREE.MeshStandardMaterial({color:0xb00500})]);
s.add(core);const ring=new THREE.Mesh(new THREE.TorusGeometry(4,.012,8,160),new THREE.MeshBasicMaterial({color:0xd0d0d0}));ring.rotation.x=Math.PI/2;s.add(ring);
const names=''' + str(CHANNELS) + ''';const tiles=[],lines=[];
names.forEach((n,i)=>{const t=tex(512,256,(g,w,h)=>{g.fillStyle='#fff';rr(g,4,4,w-8,h-8,40);g.fill();g.strokeStyle='#e4e4e4';g.lineWidth=4;g.stroke();g.fillStyle='#E10600';g.beginPath();g.arc(64,h/2,14,0,7);g.fill();g.fillStyle='#0A0A0A';g.font='600 56px "Inter Tight",Inter';g.textBaseline='middle';g.fillText(n,100,h/2+2)});
const m=new THREE.Mesh(new THREE.PlaneGeometry(2.3,1.15),new THREE.MeshBasicMaterial({map:t,transparent:true}));s.add(m);tiles.push(m);
const lg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const ln=new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xE10600,transparent:true,opacity:.35}));s.add(ln);lines.push(ln)});
const ro=new ResizeObserver(()=>sizeR(r,cam,el));ro.observe(el);let a=0,mx=0;addEventListener('pointermove',e=>mx=e.clientX/innerWidth-.5);
(function f(){a+=RM?0:.004;tiles.forEach((m,i)=>{const an=a+i/tiles.length*Math.PI*2;m.position.set(Math.cos(an)*4,Math.sin(an*2+i)*.25+.3,Math.sin(an)*4);m.quaternion.copy(cam.quaternion);
const p=lines[i].geometry.attributes.position;p.setXYZ(1,m.position.x,m.position.y-.4,m.position.z);p.needsUpdate=true});core.rotation.y=a*.5;cam.position.x+=(mx*2-cam.position.x)*.04;cam.lookAt(0,0,0);r.render(s,cam);requestAnimationFrame(f)})()})
'''
open(OUT + 'v2.html', 'w').write(page('ScapeMedia · Channel Orbit', 'family=Inter+Tight:wght@500;600&family=Inter:wght@400;500;600;700;800', v2_css, '', v2_hero, v2_js, three=True))

# ---------- V3: Funnel (black + serif, scroll story) ----------
v3_css = '''
body{background:#0A0A0A;color:#F2F2F2;font:16px/1.6 Inter,system-ui,sans-serif}
h1,h2,.svc h3,.wk h3,.st h4{font-family:"Instrument Serif",Georgia,serif;font-weight:400;letter-spacing:-.01em}
h2{font-size:clamp(42px,5.4vw,72px);line-height:1}h2 em{font-family:"Plus Jakarta Sans",sans-serif;font-style:normal;font-weight:800;text-transform:uppercase;letter-spacing:-.03em;color:#FF3B30;font-size:.9em}
.logo{color:#fff}.nv.stuck{background:rgba(10,10,10,.85);backdrop-filter:blur(12px)}
.btn-p{background:#E10600;color:#fff;font-family:"Plus Jakarta Sans"}.btn-p:hover{background:#B00500}.btn-g{border-color:#333;color:#fff}
.story{position:relative;height:320svh}
.pin{position:sticky;top:0;height:100svh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);align-items:center;padding:80px max(20px,calc((100vw - 1240px)/2)) 32px;overflow:hidden}
#c3{position:absolute;right:0;top:0;width:55%;height:100%}
.h-in{position:relative;z-index:2}
.h-in h1{font-size:clamp(52px,7.4vw,112px);line-height:.95;margin:0}.h-in h1 b{font-family:"Plus Jakarta Sans";font-weight:800;text-transform:uppercase;color:#E10600;letter-spacing:-.04em;font-size:.86em}
.h-in p{color:#A3A3A3;font-size:clamp(17px,1.4vw,20px);max-width:42ch;margin:24px 0 32px}.acts{display:flex;gap:12px;flex-wrap:wrap}
.stage{position:absolute;right:max(20px,calc((100vw - 1240px)/2));bottom:56px;z-index:2;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
.stage span{font:600 13px "Plus Jakarta Sans";padding:8px 14px;border-radius:999px;border:1px solid #333;color:#777;transition:all .3s}.stage span.on{border-color:#E10600;color:#fff;background:#E10600}
.ey{font-size:13px;font-weight:600;color:#A3A3A3;margin:0 0 16px}
.lead{color:#A3A3A3}.alt{background:#111}
.svc{border-top:1px solid #2a2a2a;padding:24px 0;display:flex;flex-direction:column}.svc-n{color:#FF3B30;font:400 28px "Instrument Serif"}
.svc h3{font-size:34px;line-height:1.05}.svc:first-child h3{font-size:clamp(44px,4.6vw,64px)}.svc p{color:#A3A3A3}
.chips li{border:1px solid #333;border-radius:999px;padding:5px 12px;font-size:13px}
.ind{border-top:1px solid #262626}.ind b{font:400 28px "Instrument Serif"}.ind span{color:#A3A3A3;font-size:15px}
.wk{background:#141414;border-radius:12px;padding:20px}.wk-tag{font-size:12px;color:#FF3B30}.wk h3{font-size:24px}.wk p{color:#A3A3A3}
.st-n{font:400 64px/1 "Instrument Serif";color:#FF3B30}.st h4{font-size:30px}.st p{color:#A3A3A3}
.f-img{border-radius:4px;filter:contrast(1.05)}.cert{color:#A3A3A3}
.cta{background:#E10600;color:#fff}.cta h2 em{color:#0A0A0A}.cta .ey{color:#fff}.form{background:#fff;color:#0A0A0A;border-radius:12px}
.form input,.form select{border:1px solid #D9D9D9}.wa-out{background:#25D366;color:#04210f}.ft p{color:#A3A3A3}
@media(max-width:860px){.pin{grid-template-columns:1fr;align-content:start;padding-top:110px}#c3{width:100%;height:55%;top:auto;bottom:0;opacity:.9}.stage{left:20px;right:20px;justify-content:flex-start}}
'''
v3_hero = '''<header class="story" id="story"><div class="pin"><canvas id="c3" aria-hidden="true"></canvas><div class="h-in">
<p class="ey">Performance marketing agency · Jammu</p>
<h1>From attention to <b>customers.</b></h1>
<p>We build the whole path: the ad, the page, the follow-up and the sale. Scroll to see how a campaign moves people through it.</p>
<div class="acts"><a class="btn btn-p" href="#contact">Get a free growth audit <span>→</span></a><a class="btn btn-g" href="#services">What we do</a></div></div>
<div class="stage" id="stage"><span class="on">Attention</span><span>Click</span><span>Lead</span><span>Follow-up</span><span>Customer</span></div></div></header>'''
v3_js = TEX + '''
const el=document.getElementById('c3'),stage=[...document.querySelectorAll('#stage span')],story=document.getElementById('story');
if(window.THREE)document.fonts.ready.then(()=>{const r=new THREE.WebGLRenderer({canvas:el,antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));
const s=new THREE.Scene(),cam=new THREE.PerspectiveCamera(34,1,.1,100);cam.position.set(0,2,14);
const fun=new THREE.Group();s.add(fun);const N=5;
for(let i=0;i<N;i++){const rad=3.4-i*.62;const m=new THREE.Mesh(new THREE.TorusGeometry(rad,.035,8,128),new THREE.MeshBasicMaterial({color:i===N-1?0xE10600:0x5a5a5a}));m.rotation.x=Math.PI/2;m.position.y=3-i*1.5;fun.add(m)}
const P=420,pos=new Float32Array(P*3),sp=[];for(let i=0;i<P;i++){sp.push({t:Math.random(),a:Math.random()*6.28,v:.002+Math.random()*.003,keep:Math.random()});}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xE10600,size:.09}));fun.add(pts);
const ro=new ResizeObserver(()=>sizeR(r,cam,el));ro.observe(el);let prog=0;
addEventListener('scroll',()=>{const b=story.getBoundingClientRect();prog=Math.min(1,Math.max(0,-b.top/(b.height-innerHeight)));const k=Math.min(N-1,Math.floor(prog*N));stage.forEach((x,i)=>x.classList.toggle('on',i<=k))},{passive:true});
(function f(){for(let i=0;i<P;i++){const p=sp[i];p.t+=RM?0:p.v;if(p.t>1||(p.t>p.keep&&p.keep<.85&&p.t>.25+p.keep*.6)){p.t=0;p.a=Math.random()*6.28}
const y=3-p.t*6,rad=Math.max(.15,3.4-p.t*(N-1)*.62*1.05)*(.6+.4*Math.sin(p.a*3));p.a+=.01;pos[i*3]=Math.cos(p.a)*rad;pos[i*3+1]=y;pos[i*3+2]=Math.sin(p.a)*rad}
pg.attributes.position.needsUpdate=true;fun.rotation.y+=RM?0:.002;cam.position.y=2-prog*3;cam.position.z=14-prog*3;cam.lookAt(0,-prog*2,0);r.render(s,cam);requestAnimationFrame(f)})()})
'''
open(OUT + 'v3.html', 'w').write(page('ScapeMedia · Funnel', 'family=Instrument+Serif&family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600;700;800', v3_css, '', v3_hero, v3_js, three=True))

# ---------- V4: Kinetic billboard (white, Wincible-like, CSS 3D) ----------
formats = [('Instagram Reel', 'Meta Ads', 'Test drive this weekend', 'reel'), ('Search ad', 'Google Ads', 'Site visits this Sunday · Book now', 'search'),
           ('Pre-roll', 'YouTube', 'Admissions open · Enquire', 'yt'), ('Audio ad', 'Spotify Ads', 'Hear the offer, tap to claim', 'audio'),
           ('Streaming banner', 'JioHotstar', 'Festival offers this week', 'tv'), ('Story ad', 'Snapchat', 'New menu · Order in two taps', 'snap'),
           ('Maps listing', 'Google Business Profile', 'Open now · Get directions', 'map')]
cards = ''.join(f'''<article class="fmt f-{k}"><div class="scr"><span class="pl">{p}</span><div class="art"></div><b>{h}</b><i>Learn more →</i></div><p><span>{f}</span>{p}</p></article>''' for f, p, h, k in formats)
v4_css = '''
body{background:#fff;color:#0A0A0A;font:16px/1.55 Inter,system-ui,sans-serif}
h1,h2,.svc h3,.wk h3,.st h4{font-family:Anton,Impact,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:.01em}
h2{font-size:clamp(44px,6vw,88px);line-height:.95}h2 em{font-style:normal;color:#E10600}
.nv-in{background:#0A0A0A;color:#fff;border-radius:999px;height:60px;margin-top:14px;padding:0 8px 0 24px}.nv .btn-p{height:44px;border-radius:999px}
.btn-p{background:#E10600;color:#fff}.btn-p:hover{background:#0A0A0A}.btn-g{border-color:#0A0A0A}.btn-g:hover{background:#0A0A0A;color:#fff}
html{overflow-x:clip}.hero{padding:140px 0 40px;text-align:center}
.hero h1{font-size:clamp(52px,9vw,150px);line-height:.9;margin:0}
.rot{display:grid;color:#E10600;height:.9em;overflow:hidden;line-height:.9}.rot span{display:block;grid-area:1/1;line-height:.9;transform:translateY(100%);transition:transform .6s cubic-bezier(.7,0,.2,1)}.rot span.on{transform:none}.rot span.out{transform:translateY(-100%)}
.hero p{font-size:clamp(17px,1.5vw,21px);color:#5C5C5C;max-width:52ch;margin:28px auto 32px}.acts{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.ey{font-size:13px;font-weight:700;color:#E10600;margin:0 0 16px}
.rail{display:flex;gap:28px;overflow-x:auto;scroll-snap-type:x mandatory;padding:56px max(20px,calc((100vw - 1240px)/2)) 72px;perspective:1200px;scrollbar-width:none}.rail::-webkit-scrollbar{display:none}
.fmt{flex:none;width:240px;scroll-snap-align:center;transition:transform .5s cubic-bezier(.2,.7,.2,1)}.fmt:nth-child(odd){transform:rotateY(14deg) translateY(16px)}.fmt:nth-child(even){transform:rotateY(-14deg)}.fmt:hover{transform:none}
.scr{height:420px;border-radius:28px;background:#0A0A0A;color:#fff;padding:16px;display:flex;flex-direction:column;gap:10px;box-shadow:0 30px 60px -30px rgba(0,0,0,.5);border:6px solid #1c1c1c}
.pl{font-size:12px;font-weight:700}.art{flex:1;border-radius:14px;background:#1d1d1d;position:relative;overflow:hidden}
.art:before{content:"";position:absolute;width:70%;aspect-ratio:1;border-radius:50%;background:#E10600;left:15%;top:18%}.f-search .art:before,.f-map .art:before{border-radius:12px;width:60%;aspect-ratio:auto;height:30%;top:12%}
.f-audio .art:before{width:auto;aspect-ratio:auto;height:40%;left:10%;right:10%;top:30%;border-radius:0;background:repeating-linear-gradient(90deg,#E10600 0 6px,transparent 6px 12px)}
.scr b{font-size:17px;line-height:1.25}.scr i{font-style:normal;font-size:13px;background:#E10600;border-radius:8px;padding:10px 12px;font-weight:700}
.fmt p{margin:14px 0 0;font-weight:700}.fmt p span{display:block;font-weight:500;color:#5C5C5C;font-size:13px}
.bigw{overflow:hidden;padding:24px 0}.big{background:#0A0A0A;color:#fff;padding:24px 0;overflow:hidden;white-space:nowrap;transform:rotate(-2deg) scaleX(1.02)}
.big div{display:inline-flex;gap:40px;animation:mq 26s linear infinite;font:400 clamp(36px,5vw,64px)/1 Anton,sans-serif;text-transform:uppercase}.big em{font-style:normal;color:#E10600}
@keyframes mq{to{transform:translateX(-50%)}}
.lead{color:#5C5C5C}.alt{background:#F4F4F4}
.svc{border:2px solid #0A0A0A;border-radius:24px;padding:28px;display:flex;flex-direction:column;background:#fff;transition:background-color .25s,color .25s}.svc:hover{background:#0A0A0A;color:#fff}.svc:hover p{color:#bbb}
.svc:first-child{background:#E10600;color:#fff;border-color:#E10600}.svc:first-child p{color:#ffe1df}.svc:first-child h3{font-size:clamp(44px,4.6vw,68px)}
.svc-n{font-weight:800}.svc h3{font-size:34px;line-height:.95}.svc p{color:#5C5C5C}
.chips li{border:1.5px solid currentColor;border-radius:999px;padding:5px 12px;font-size:13px;font-weight:600}
.ind{border-top:2px solid #0A0A0A}.ind b{font:400 30px Anton;text-transform:uppercase}.ind span{color:#5C5C5C}
.wk{border:2px solid #0A0A0A;border-radius:20px;padding:20px}.wk-tag{font-size:12px;font-weight:800;color:#E10600}.wk h3{font-size:24px}.wk p{color:#5C5C5C}
.st-n{display:grid;place-items:center;width:56px;height:56px;border-radius:50%;background:#E10600;color:#fff;font:400 26px Anton}.st h4{font-size:28px}.st p{color:#5C5C5C}
.f-img{border-radius:32px}.cert{color:#5C5C5C}
.cta{background:#0A0A0A;color:#fff}.form{background:#fff;color:#0A0A0A;border-radius:24px}.form input,.form select{border:2px solid #0A0A0A}.wa-out{background:#25D366;color:#04210f}
.ft p{color:#5C5C5C}
@media(max-width:720px){.nv-in{padding:0 6px 0 18px}.nv .btn-p{padding:0 14px;font-size:13px}.fmt{width:200px}.scr{height:360px}}
'''
words = ['Meta', 'Google', 'YouTube', 'Spotify', 'JioHotstar', 'Snapchat']
v4_hero = '''<header class="hero"><div class="wrap"><p class="ey">ScapeMedia · Performance marketing agency, Jammu</p>
<h1>Ads on<span class="rot" id="rot">''' + ''.join(f'<span{" class=on" if i == 0 else ""}>{w}</span>' for i, w in enumerate(words)) + '''</span>that people <em style="font-style:normal;color:#E10600">act</em> on</h1>
<p>We make the ads, run the campaigns and set up the follow-up, so attention turns into enquiries and enquiries turn into sales.</p>
<div class="acts"><a class="btn btn-p" href="#contact">Get a free growth audit <span>→</span></a><a class="btn btn-g" href="#work">See our work</a></div></div></header>
<section aria-label="Ad formats we build"><div class="rail">''' + cards + '''</div></section>
<div class="big" aria-hidden="true"><div>''' + ''.join(f'<span>{w} <em>●</em></span>' for w in ['Meta Ads', 'Google Ads', 'GMB', 'Websites', 'Branding', 'CRM'] * 2) + '''</div></div></div>'''
v4_js = '''
const rs=[...document.querySelectorAll('#rot span')];let ri=0;
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{const a=rs[ri];a.classList.remove('on');a.classList.add('out');ri=(ri+1)%rs.length;const b=rs[ri];b.classList.remove('out');b.classList.add('on');setTimeout(()=>{a.style.transition='none';a.classList.remove('out');void a.offsetWidth;a.style.transition=''},650)},1800);
'''
open(OUT + 'v4.html', 'w').write(page('ScapeMedia · Billboard', 'family=Anton&family=Inter:wght@400;500;600;700;800', v4_css, '', v4_hero, v4_js))

# ---------- V5: Growth engine (light grey, isometric 3D system) ----------
v5_css = '''
body{background:#F2F2F2;color:#0A0A0A;font:16px/1.55 Inter,system-ui,sans-serif}
h1,h2,.svc h3,.wk h3,.st h4{font-family:Archivo,Inter,sans-serif;font-weight:800;letter-spacing:-.03em;font-stretch:112%}
h2{font-size:clamp(36px,4.8vw,64px);line-height:1}h2 em{font-style:normal;color:#E10600}
.nv.stuck{background:rgba(242,242,242,.9);backdrop-filter:blur(12px)}
.btn-p{background:#E10600;color:#fff}.btn-p:hover{background:#0A0A0A}.btn-g{border-color:#0A0A0A}.btn-g:hover{background:#0A0A0A;color:#fff}
.hero{position:relative;height:max(100svh,760px);display:grid;grid-template-rows:auto minmax(0,1fr);padding-top:84px;overflow:hidden}
.h-in{text-align:center;max-width:900px;margin:0 auto;padding:24px 20px 0;position:relative;z-index:2}
.h-in h1{font-size:clamp(40px,5vw,72px);line-height:.98;margin:0}.h-in h1 em{font-style:normal;color:#E10600}
.h-in p{color:#5C5C5C;font-size:clamp(16px,1.3vw,19px);max-width:56ch;margin:16px auto 22px}.acts{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
#c5{width:100%;height:100%;min-height:440px;display:block}
.legend{position:absolute;left:50%;bottom:24px;transform:translateX(-50%);display:flex;gap:18px;flex-wrap:wrap;justify-content:center;font-size:13px;color:#5C5C5C;z-index:2}
.legend b{color:#0A0A0A}.legend i{display:inline-block;width:10px;height:10px;background:#E10600;margin-right:6px}
.ey{font-size:13px;font-weight:600;color:#E10600;margin:0 0 16px}
.lead{color:#5C5C5C}.alt{background:#fff}
.svc{background:#fff;border-radius:4px;padding:28px;display:flex;flex-direction:column;box-shadow:0 1px 0 #e2e2e2}.alt .svc{background:#F2F2F2}
.svc:first-child{background:#0A0A0A;color:#fff}.svc:first-child p{color:#B5B5B5}.svc:first-child h3{font-size:clamp(36px,3.8vw,56px)}
.svc-n{font:800 13px Archivo;color:#E10600}.svc h3{font-size:26px;line-height:1}.svc p{color:#5C5C5C}
.chips li{background:#EDEDED;padding:6px 10px;font-size:13px;font-weight:600}.svc:first-child .chips li{background:#E10600;color:#fff}
.ind{border-top:1px solid #D6D6D6}.ind b{font:800 22px Archivo;letter-spacing:-.02em}.ind span{color:#5C5C5C;font-size:15px}
.wk{background:#F2F2F2;padding:20px;border-left:0}.wk-tag{font-size:12px;font-weight:700;color:#E10600}.wk p{color:#5C5C5C}
.st-n{font:800 48px/1 Archivo;color:#E10600}.st h4{font-size:24px}.st p{color:#5C5C5C}
.f-img{border-radius:4px}.cert{color:#5C5C5C}
.cta{background:#0A0A0A;color:#fff}.form{background:#F2F2F2;color:#0A0A0A;border-radius:4px}.form input,.form select{border:1px solid #cfcfcf;background:#fff}.wa-out{background:#25D366;color:#04210f}
.ft p{color:#5C5C5C}
'''
v5_hero = '''<header class="hero"><div class="h-in"><p class="ey">Performance marketing agency · Jammu</p>
<h1>A growth engine, <em>built for your business</em></h1>
<p>Ads bring people in, your website and Google profile convert them, the CRM follows up until they buy. We build and run every part.</p>
<div class="acts"><a class="btn btn-p" href="#contact">Get a free growth audit <span>→</span></a><a class="btn btn-g" href="#services">See the parts</a></div></div>
<canvas id="c5" aria-label="Leads moving from ads to website and Google profile to CRM to sales"></canvas>
<p class="legend"><span><i></i><b>Leads</b> moving through the system</span></p></header>'''
v5_js = TEX + '''
const el=document.getElementById('c5');
if(window.THREE)document.fonts.ready.then(()=>{const r=new THREE.WebGLRenderer({canvas:el,antialias:true,alpha:true});r.setPixelRatio(Math.min(devicePixelRatio,2));
const s=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,.1,100);cam.userData.s=5;cam.position.set(10,10,10);cam.lookAt(0,0,0);
s.add(new THREE.AmbientLight(0xffffff,.8));const dl=new THREE.DirectionalLight(0xffffff,.55);dl.position.set(-4,10,6);s.add(dl);
const st=[['Ads','Meta · Google · YouTube · Spotify · JioHotstar · Snapchat',-6,0],['Website','Landing pages',-2,-1.6],['Google profile','Maps · reviews',-2,1.6],['CRM','WhatsApp follow-up',2,0],['Sales','Customers',6,0]];
const M=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.7});
st.forEach(([n,sub,x,z],i)=>{const top=tex(512,512,(g,w,h)=>{g.fillStyle=i===4?'#E10600':'#0A0A0A';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='800 72px Archivo,Inter';g.fillText(n,40,110);g.font='500 30px Inter';g.fillStyle=i===4?'#fff':'#bdbdbd';wrapT(g,sub,40,170,w-80,40)});
const box=new THREE.Mesh(new THREE.BoxGeometry(2.4,i===4?1.2:.7,2.4),[M(0x1c1c1c),M(0x1c1c1c),new THREE.MeshStandardMaterial({map:top,roughness:.6}),M(0x111),M(0x2a2a2a),M(0x2a2a2a)]);
if(i===4)box.material.forEach((m,k)=>{if(k!==2)m.color.set(0xb00500)});box.position.set(x,(i===4?.6:.35),z);s.add(box)});
const path=[[-6,0],[-2,-1.6],[2,0],[6,0]],path2=[[-6,0],[-2,1.6],[2,0],[6,0]];
const track=(p)=>{const pts=p.map(([x,z])=>new THREE.Vector3(x,.02,z));const c=new THREE.CatmullRomCurve3(pts);const tube=new THREE.Mesh(new THREE.TubeGeometry(c,80,.05,8),M(0xc9c9c9));s.add(tube);return c};
const c1=track(path),c2=track(path2);const packets=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.28),new THREE.MeshStandardMaterial({color:0xE10600,roughness:.4}));s.add(m);packets.push({m,t:i/14,c:i%2?c1:c2})}
const ro=new ResizeObserver(()=>{cam.userData.s=el.clientWidth<720?6.8:5;sizeR(r,cam,el)});ro.observe(el);
(function f(){packets.forEach(p=>{p.t=(p.t+(RM?0:.0025))%1;const v=p.c.getPointAt(p.t);p.m.position.set(v.x,.32,v.z);p.m.rotation.y+=.03});r.render(s,cam);requestAnimationFrame(f)})()})
'''
open(OUT + 'v5.html', 'w').write(page('ScapeMedia · Growth Engine', 'family=Archivo:wdth,wght@100..125,400..800&family=Inter:wght@400;500;600;700;800', v5_css, '', v5_hero, v5_js, three=True))
print('built')
