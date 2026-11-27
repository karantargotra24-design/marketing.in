(function () {
  var SM = window.SM || {};
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var digits = function (s) { return String(s || '').replace(/\D/g, ''); };
  var waUrl = function (msg) { return 'https://wa.me/' + digits(SM.wa) + '?text=' + encodeURIComponent(msg); };

  /* ---------- tracking (only fires to tools whose IDs are configured) ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (window.fbq) {
      if (name === 'generate_lead') fbq('track', 'Lead', params);
      else if (name === 'whatsapp_click') fbq('track', 'Contact', params);
      else fbq('trackCustom', name, params);
    }
    if (window.gtag) gtag('event', name, params);
  }
  window.smTrack = track;
  if (SM.metaPixelId) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', SM.metaPixelId); fbq('track', 'PageView');
  }
  if (SM.ga4Id) {
    var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + SM.ga4Id; document.head.appendChild(g);
    window.gtag = function () { dataLayer.push(arguments); }; gtag('js', new Date()); gtag('config', SM.ga4Id);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-track]'); if (a) track(a.getAttribute('data-track'), { location: (a.closest('section,header,footer') || {}).id || 'page' });
  });

  /* ---------- contact details & WhatsApp links ---------- */
  $$('.wa-link').forEach(function (a) { a.href = waUrl(a.getAttribute('data-msg')); a.target = '_blank'; a.rel = 'noopener'; });
  var line = [], fc = [], so = [];
  if (SM.email) { line.push('<a href="mailto:' + SM.email + '">' + SM.email + '</a>'); fc.push('<li><a href="mailto:' + SM.email + '">' + SM.email + '</a></li>'); }
  if (SM.phone) { line.push('<a href="tel:+' + digits(SM.phone) + '">' + SM.phone + '</a>'); fc.push('<li><a href="tel:+' + digits(SM.phone) + '">' + SM.phone + '</a></li>'); }
  line.push('<span>Jammu, Jammu &amp; Kashmir, India</span>'); fc.push('<li>Jammu, Jammu &amp; Kashmir, India</li>');
  if (SM.wa) so.push('<li><a class="wa-link" data-track="whatsapp_click" target="_blank" rel="noopener" href="' + waUrl("Hi Karan, I'd like to talk about Meta Ads for my business.") + '">WhatsApp</a></li>');
  if (SM.instagram) so.push('<li><a href="' + SM.instagram + '" target="_blank" rel="noopener">Instagram</a></li>');
  if (SM.linkedin) so.push('<li><a href="' + SM.linkedin + '" target="_blank" rel="noopener">LinkedIn</a></li>');
  if (SM.facebook) so.push('<li><a href="' + SM.facebook + '" target="_blank" rel="noopener">Facebook</a></li>');
  $('#contactLine').innerHTML = line.join('');
  $('#footContact').innerHTML = fc.join('');
  $('#footSocial').innerHTML = so.join('');

  /* ---------- nav + menu ---------- */
  var nav = $('#nav'), burger = $('#burger'), mm = $('#mmenu'), sticky = $('#stickyCta');
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('stuck', y > 30);
    var c = $('#contact').getBoundingClientRect();
    sticky.classList.toggle('on', y > innerHeight * 0.9 && c.top > innerHeight * 0.6);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  burger.addEventListener('click', function () { var o = mm.classList.toggle('open'); burger.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; });
  $$('#mmenu a').forEach(function (a) { a.addEventListener('click', function () { mm.classList.remove('open'); burger.setAttribute('aria-expanded', false); document.body.style.overflow = ''; }); });

  /* ---------- smooth scroll (Lenis) + anchor links ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', function (e) { window.__lenisVel = e.velocity; if (window.ScrollTrigger) ScrollTrigger.update(); });
    if (window.gsap) { gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0); }
    else { (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0); }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var el = document.querySelector(id); if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: id === '#top' ? 0 : -70 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- hero intro + 3D rig ---------- */
  requestAnimationFrame(function () { setTimeout(function () { $('.hero').classList.add('ready'); }, 80); });
  var scene = $('#scene'), rig = $('.rig');
  if (scene && fine && !reduce) {
    $('.hero').addEventListener('pointermove', function (e) {
      rig.style.setProperty('--mx', ((e.clientX / innerWidth) - .5) * 2);
      rig.style.setProperty('--my', ((e.clientY / innerHeight) - .5) * 2);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
  }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(function (el) { io.observe(el); });

  /* ---------- tilt cards ---------- */
  if (fine && !reduce) $$('.tilt').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = 'perspective(900px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 8) + 'deg) translateY(-4px)'; });
    c.addEventListener('pointerleave', function () { c.style.transform = ''; });
  });

  /* ---------- 03 advantage: steps drive the workspace ---------- */
  var steps = $$('.step'), panes = $$('#ws .pane'), sides = $$('#ws .side div');
  function setStep(i) {
    steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    panes.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    sides.forEach(function (p, k) { p.classList.toggle('on', k === i); });
  }
  setStep(0);
  var sio = new IntersectionObserver(function (es) {
    es.forEach(function (x) { if (x.isIntersecting) setStep(+x.target.getAttribute('data-i')); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(function (s) { sio.observe(s); });

  /* ---------- 04 growth engine: light the funnel as you scroll ---------- */
  var fns = $$('#funnel .fn'), parts = $$('#parts .part');
  function engine(p) {
    var n = Math.round(p * fns.length), m = Math.round(p * parts.length);
    fns.forEach(function (f, k) { f.classList.toggle('on', k < n); });
    parts.forEach(function (f, k) { f.classList.toggle('on', k < m); });
  }
  if (reduce) engine(1);

  /* ---------- counters ---------- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (x) {
      if (!x.isIntersecting) return; cio.unobserve(x.target);
      var el = x.target, to = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
      if (reduce) return;
      var t0 = performance.now();
      (function f(t) { var k = Math.min(1, (t - t0) / 1600), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec); if (k < 1) requestAnimationFrame(f); })(t0);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- 09 process tabs (auto-cycle) ---------- */
  var tabs = $$('.ptab'), pvs = $$('.pv'), cur = 0, timer = null, pio;
  function setTab(i, user) {
    cur = i;
    tabs.forEach(function (t, k) { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i); var pg = t.querySelector('.pg'); if (pg) { pg.style.animation = 'none'; void pg.offsetWidth; pg.style.animation = ''; } });
    pvs.forEach(function (p, k) { p.classList.toggle('on', k === i); });
    clearTimeout(timer);
    if (!reduce && !user) timer = setTimeout(function () { setTab((cur + 1) % tabs.length); }, 5000);
  }
  tabs.forEach(function (t, k) { t.addEventListener('click', function () { setTab(k, true); timer = setTimeout(function () { setTab((cur + 1) % tabs.length); }, 9000); }); });
  pio = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { setTab(cur); } else clearTimeout(timer); }); }, { threshold: .3 });
  if ($('.proc')) pio.observe($('.proc'));

  /* ---------- GSAP: growth engine scrub + horizontal showcase ---------- */
  function initGsap() {
    if (!window.gsap || !window.ScrollTrigger || reduce) return false;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({ trigger: '#funnel', start: 'top 75%', end: 'bottom 35%', scrub: true, onUpdate: function (s) { engine(s.progress); } });
    var mm = gsap.matchMedia();
    mm.add('(min-width: 901px)', function () {
      var track = $('#hsTrack');
      var dist = function () { return track.scrollWidth - innerWidth + 40; };
      var tw = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: '#hs', start: 'center center', end: function () { return '+=' + dist(); }, pin: '#work', pinSpacing: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
      return function () { tw.kill(); };
    });
    gsap.from('.mq .tr', { opacity: 0, duration: 1.2, delay: .6 });
    return true;
  }
  if (!initGsap()) {
    // fallback: light the engine with an observer
    var eio = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) engine(1); }); }, { threshold: .3 });
    eio.observe($('#funnel'));
  }
  addEventListener('load', function () { if (window.ScrollTrigger) ScrollTrigger.refresh(); });

  /* ---------- enquiry form ---------- */
  var form = $('#auditForm'), thanks = $('#thanks');
  function setErr(el, msg) { el.setAttribute('aria-invalid', msg ? 'true' : 'false'); el.parentElement.querySelector('.err').textContent = msg || ''; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {}; $$('input,select', form).forEach(function (el) { d[el.name] = el.value.trim(); });
    if (d.hp) return; // bot
    var ok = true;
    $$('[required]', form).forEach(function (el) { var m = el.value.trim() ? '' : 'Required'; if (el.name === 'phone' && !m) { var p = digits(el.value).replace(/^91(?=\d{10}$)/, ''); m = /^[6-9]\d{9}$/.test(p) ? '' : 'Enter a valid 10-digit mobile number'; } setErr(el, m); if (m) ok = false; });
    if (!ok) { var first = form.querySelector('[aria-invalid=true]'); if (first) first.focus(); track('form_error'); return; }
    var phone = digits(d.phone).slice(-10);
    var msg = "Hi Karan, I'd like a free growth audit.\n\nName: " + d.name + '\nBusiness: ' + d.business + '\nIndustry: ' + d.industry + '\nLocation: ' + d.location + '\nMonthly ad budget: ' + d.budget + '\nObjective: ' + d.objective + '\nWhatsApp: ' + phone;
    var url = waUrl(msg);
    if (SM.sheet) {
      var q = { name: d.name, phone: phone, service: d.objective + ' | ' + d.budget, message: d.business + ' (' + d.industry + ', ' + d.location + ')', source: 'Growth audit form', page: location.href, ref: document.referrer };
      try { fetch(SM.sheet + '?' + new URLSearchParams(q).toString(), { mode: 'no-cors' }); } catch (err) {}
    }
    track('generate_lead', { industry: d.industry, budget: d.budget, objective: d.objective });
    $('#thanksWa').href = url;
    thanks.classList.add('on');
    window.open(url, '_blank', 'noopener');
  });
  $$('input,select', form).forEach(function (el) { el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') setErr(el, ''); }); });
})();
