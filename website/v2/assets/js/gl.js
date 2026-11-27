/* ScapeMedia GL stage: DOM-synced image planes that bend with scroll velocity,
   RGB-split at speed and ripple on hover. Falls back to plain <img> if WebGL is unavailable. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('gl');
  if (!canvas || reduce) { if (canvas) canvas.remove(); return; }
  var gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) { canvas.remove(); return; }

  var mobile = matchMedia('(max-width: 768px)').matches;
  var SEG = mobile ? 16 : 32;
  var DPR = Math.min(window.devicePixelRatio || 1, 1.75);

  var vs = [
    'attribute vec2 aPos;',
    'uniform vec4 uRect;', // x, y, w, h in CSS px (top-left origin)
    'uniform vec2 uRes;',
    'uniform float uVel;',
    'uniform float uReveal;',
    'varying vec2 vUv;',
    'void main(){',
    '  vUv = aPos;',
    '  vec2 p = uRect.xy + aPos * uRect.zw;',
    '  float bend = sin(aPos.x * 3.14159) * uVel * 0.9;', // bow vertically with scroll speed
    '  p.y += bend;',
    '  float curl = (1.0 - uReveal) * sin(aPos.x * 3.14159) * uRect.w * 0.12;',
    '  p.y += curl;',
    '  vec2 clip = (p / uRes) * 2.0 - 1.0;',
    '  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);',
    '}'
  ].join('\n');

  var fs = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform sampler2D uTex;',
    'uniform vec2 uImg;',   // natural size
    'uniform vec4 uRect;',
    'uniform float uVel;',
    'uniform vec2 uMouse;',
    'uniform float uHover;',
    'uniform float uTime;',
    'uniform float uReveal;',
    'uniform float uRadius;',
    'varying vec2 vUv;',
    'void main(){',
    '  vec2 size = uRect.zw;',
    '  float ra = size.x / size.y, ia = uImg.x / uImg.y;',
    '  vec2 sc = ra > ia ? vec2(1.0, ia / ra) : vec2(ra / ia, 1.0);',
    '  float zoom = 1.0 + (1.0 - uReveal) * 0.25;',
    '  vec2 uv = (vUv - 0.5) * sc / zoom + 0.5;',
    '  vec2 d = vUv - uMouse; float dist = length(d * vec2(ra, 1.0));',
    '  uv += normalize(d + 1e-4) * sin(dist * 18.0 - uTime * 6.0) * 0.02 * uHover * exp(-dist * 3.0);',
    '  vec2 off = vec2(0.0, uVel * 0.0012);',
    '  float r = texture2D(uTex, uv + off).r;',
    '  float g = texture2D(uTex, uv).g;',
    '  float b = texture2D(uTex, uv - off).b;',
    // rounded corners
    '  vec2 px = vUv * size; vec2 q = min(px, size - px);',
    '  float a = 1.0;',
    '  if (q.x < uRadius && q.y < uRadius) { a = 1.0 - smoothstep(uRadius - 1.0, uRadius + 0.5, length(vec2(uRadius) - q)); }',
    '  a *= smoothstep(1.0 - uReveal - 0.02, 1.0 - uReveal + 0.02, 1.0 - vUv.y);',
    '  gl_FragColor = vec4(vec3(r, g, b) * a, a);',
    '}'
  ].join('\n');

  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(s); return s; }
  var prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw 'link';
  } catch (e) { canvas.remove(); return; }
  gl.useProgram(prog);

  // grid geometry
  var verts = [], idx = [];
  for (var y = 0; y <= SEG; y++) for (var x = 0; x <= SEG; x++) verts.push(x / SEG, y / SEG);
  for (y = 0; y < SEG; y++) for (x = 0; x < SEG; x++) {
    var i = y * (SEG + 1) + x;
    idx.push(i, i + 1, i + SEG + 1, i + 1, i + SEG + 2, i + SEG + 1);
  }
  var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'aPos'); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['uRect', 'uRes', 'uVel', 'uReveal', 'uTex', 'uImg', 'uMouse', 'uHover', 'uTime', 'uRadius'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

  var planes = [];
  function addPlane(img) {
    var p = { img: img, tex: null, ready: false, reveal: 0, revealT: 0, hover: 0, hoverT: 0, mouse: [0.5, 0.5], seen: false, radius: 0 };
    var host = img.closest('.im,.a,.b') || img.parentElement;
    p.radius = parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0;
    function load() {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img); }
      catch (e) { img.style.opacity = 1; return; } // cross-origin / file:// fallback
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      p.tex = t; p.ready = true;
    }
    img.loading = 'eager';
    if (img.complete && img.naturalWidth) load(); else img.addEventListener('load', load, { once: true });
    if (!mobile) {
      host.addEventListener('pointermove', function (e) { var r = img.getBoundingClientRect(); p.mouse = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; p.hoverT = 1; });
      host.addEventListener('pointerleave', function () { p.hoverT = 0; });
    }
    planes.push(p);
  }
  document.documentElement.classList.add('gl-on');
  document.querySelectorAll('img[data-gl]').forEach(addPlane);

  // scroll velocity (works with or without Lenis)
  var lastY = window.scrollY, vel = 0, velS = 0;
  window.SMGL = { setVelocity: function (v) { vel = v; } };

  function resize() {
    canvas.width = Math.floor(innerWidth * DPR); canvas.height = Math.floor(innerHeight * DPR);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener('resize', resize); resize();

  var running = true;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(frame); });
  var t0 = performance.now(), last = t0;
  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    var kR = 1 - Math.exp(-dt * 2.8), kH = 1 - Math.exp(-dt * 4), kV = 1 - Math.exp(-dt * 6);
    var y = window.scrollY;
    vel = y - lastY;
    lastY = y;
    vel = Math.max(-40, Math.min(40, vel));
    velS += (vel - velS) * kV;
    var k = mobile ? 0.5 : 1;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, innerWidth, innerHeight);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    for (var i = 0; i < planes.length; i++) {
      var p = planes[i];
      if (!p.ready) continue;
      var r = p.img.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50 || r.width === 0) continue;
      if (!p.seen && r.top < innerHeight * 0.92) { p.seen = true; p.revealT = 1; }
      p.reveal += (p.revealT - p.reveal) * kR; if (p.revealT && p.reveal > 0.995) p.reveal = 1;
      p.hover += (p.hoverT - p.hover) * kH;
      gl.bindTexture(gl.TEXTURE_2D, p.tex);
      gl.uniform4f(U.uRect, r.left, r.top, r.width, r.height);
      gl.uniform2f(U.uImg, p.img.naturalWidth, p.img.naturalHeight);
      gl.uniform1f(U.uVel, velS * k);
      gl.uniform1f(U.uReveal, p.reveal);
      gl.uniform2f(U.uMouse, p.mouse[0], p.mouse[1]);
      gl.uniform1f(U.uHover, p.hover);
      gl.uniform1f(U.uRadius, p.radius);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
