/* Fancy mode: an opt-in layer of motion and interaction on top of app.js.
   When off, nothing here touches the page except the switch button. */
(() => {
  "use strict";

  const root = document.documentElement;
  const btn = document.getElementById("fancy-btn");
  const reduce = () => false; // the user opted in explicitly
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeOutBack = t => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const isZh = () => root.lang.startsWith("zh");

  const F = { on: false };
  window.slpFancy = F;

  let added = [];          // injected nodes to remove on disable
  let offs = [];           // listener removers
  let raf = 0;
  let io = null;
  const listen = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); offs.push(() => el.removeEventListener(ev, fn, opt)); };
  const make = (tag, attrs = {}, parent = document.body) => {
    const el = document.createElement(tag);
    Object.assign(el, attrs);
    parent.appendChild(el); added.push(el);
    return el;
  };

  // ------------------------------------------------------------------ colors
  let palette = [];
  function readPalette() {
    const cs = getComputedStyle(root);
    palette = ["--fit", "--used", "--target"].map(v => cs.getPropertyValue(v).trim()).concat(["#7b5cff"]);
  }
  const hexA = (hex, a) => {
    const h = hex.replace("#", "");
    if (h.length !== 6) return `rgba(123,92,255,${a})`;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
  };

  // ------------------------------------------------------------------ canvases
  let cvBg, cvTop, ctxBg, ctxTop, glow, progress, W = 0, H = 0, DPR = 1;
  const mouse = { x: -9999, y: -9999, gx: innerWidth / 2, gy: innerHeight / 2, px: 0, py: 0, active: false };
  let nodes = [], sparks = [];

  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    for (const c of [cvBg, cvTop]) { c.width = W * DPR; c.height = H * DPR; c.style.width = W + "px"; c.style.height = H + "px"; }
    ctxBg.setTransform(DPR, 0, 0, DPR, 0, 0); ctxTop.setTransform(DPR, 0, 0, DPR, 0, 0);
    const n = Math.round(clamp(W * H / 16000, 30, 110));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: 1 + Math.random() * 1.8, c: Math.floor(Math.random() * 4),
    }));
  }

  function burst(x, y, n = 26, opts = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (opts.speed || 4) * (0.4 + Math.random());
      sparks.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opts.lift || 1.5),
        life: 1, decay: 0.012 + Math.random() * 0.02, size: opts.confetti ? 4 + Math.random() * 5 : 1.5 + Math.random() * 2.5,
        c: palette[Math.floor(Math.random() * palette.length)], g: opts.gravity ?? 0.12,
        rot: Math.random() * 6, vr: (Math.random() - .5) * .4, confetti: !!opts.confetti,
      });
    }
  }
  function confettiFrom(el) {
    const r = el.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 70, { confetti: true, speed: 7, lift: 4, gravity: 0.18 });
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    // cursor glow (smoothed)
    mouse.gx = lerp(mouse.gx, mouse.x < -999 ? W / 2 : mouse.x, 0.12);
    mouse.gy = lerp(mouse.gy, mouse.y < -999 ? H / 3 : mouse.y, 0.12);
    glow.style.transform = `translate(${mouse.gx}px, ${mouse.gy}px)`;

    // background constellation
    ctxBg.clearRect(0, 0, W, H);
    const LINK = 130, M = 180;
    for (const p of nodes) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < M * M && d2 > 1) { const f = (1 - Math.sqrt(d2) / M) * 0.6; p.vx += dx / Math.sqrt(d2) * f * 0.12; p.vy += dy / Math.sqrt(d2) * f * 0.12; }
      p.vx *= 0.985; p.vy *= 0.985;
      p.vx += (Math.random() - .5) * 0.02; p.vy += (Math.random() - .5) * 0.02;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
    }
    ctxBg.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK * LINK) {
          ctxBg.strokeStyle = hexA(palette[a.c] || "#7b5cff", 0.22 * (1 - Math.sqrt(d2) / LINK));
          ctxBg.beginPath(); ctxBg.moveTo(a.x, a.y); ctxBg.lineTo(b.x, b.y); ctxBg.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 200) {
        ctxBg.strokeStyle = hexA(palette[a.c] || "#7b5cff", 0.4 * (1 - dm / 200));
        ctxBg.beginPath(); ctxBg.moveTo(a.x, a.y); ctxBg.lineTo(mouse.x, mouse.y); ctxBg.stroke();
      }
      ctxBg.fillStyle = hexA(palette[a.c] || "#7b5cff", 0.75);
      ctxBg.beginPath(); ctxBg.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctxBg.fill();
    }

    // sparks & confetti
    ctxTop.clearRect(0, 0, W, H);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.vy += s.g; s.vx *= 0.985; s.x += s.vx; s.y += s.vy; s.life -= s.decay; s.rot += s.vr;
      if (s.life <= 0 || s.y > H + 40) { sparks.splice(i, 1); continue; }
      ctxTop.globalAlpha = Math.max(0, s.life);
      ctxTop.fillStyle = s.c;
      if (s.confetti) {
        ctxTop.save(); ctxTop.translate(s.x, s.y); ctxTop.rotate(s.rot);
        ctxTop.fillRect(-s.size / 2, -s.size / 4, s.size, s.size / 2); ctxTop.restore();
      } else {
        ctxTop.shadowColor = s.c; ctxTop.shadowBlur = 8;
        ctxTop.beginPath(); ctxTop.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2); ctxTop.fill();
        ctxTop.shadowBlur = 0;
      }
    }
    ctxTop.globalAlpha = 1;
  }

  // ------------------------------------------------------------------ toasts / help
  let toastBox;
  function toast(html, ms = 1800) {
    if (!F.on) return;
    while (toastBox.children.length > 2) toastBox.firstChild.remove();
    const t = document.createElement("div");
    t.className = "fx-toast"; t.innerHTML = html; toastBox.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 400); }, ms);
  }
  function toggleHelp() {
    const ex = $("#fx-help");
    if (ex) { ex.remove(); return; }
    const zh = isZh();
    const rows = [
      ["1 – 6", zh ? "切换场景" : "Apply a scenario"],
      ["B", zh ? "开关 bootstrap" : "Toggle bootstrap"],
      ["R", zh ? "重置" : "Reset"],
      ["T", zh ? "切换主题" : "Toggle theme"],
      ["F", zh ? "开关炫酷模式" : "Toggle fancy mode"],
      ["?", zh ? "显示/隐藏此面板" : "Show / hide this panel"],
    ];
    const h = make("div", { id: "fx-help" });
    h.innerHTML = `<div class="box"><h3>${zh ? "键盘快捷键" : "Keyboard shortcuts"}</h3><table>${rows.map(([k, v]) => `<tr><td><kbd>${k}</kbd></td><td>${v}</td></tr>`).join("")}</table></div>`;
    h.addEventListener("click", () => h.remove());
  }

  // ------------------------------------------------------------------ hero title
  function splitTitle(animate = true) {
    const h1 = $(".hero h1");
    if (!h1 || h1.querySelector(".fx-ch")) return;
    const text = h1.textContent;
    h1.setAttribute("aria-label", text);
    h1.innerHTML = Array.from(text).map((c, i) => `<span class="fx-ch" aria-hidden="true" style="--i:${animate ? i : 0}">${c === " " ? " " : c}</span>`).join("");
    h1.classList.remove("fx-shine");
    setTimeout(() => F.on && h1.classList.add("fx-shine"), 900 + text.length * 28);
  }
  function unsplitTitle() {
    const h1 = $(".hero h1");
    if (h1 && h1.querySelector(".fx-ch")) { h1.textContent = h1.getAttribute("aria-label") || h1.textContent; }
    if (h1) { h1.removeAttribute("aria-label"); h1.classList.remove("fx-shine"); }
  }

  // ------------------------------------------------------------------ reveal
  function setupReveal() {
    const targets = [...$$(".hero > *"), $(".scenarios"), ...$$("main > .card"), ...$$(".controls > *")].filter(Boolean);
    targets.forEach((el, i) => { el.classList.add("fx-reveal"); el.style.setProperty("--fx-d", `${Math.min(i, 8) * 70}ms`); });
    io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("fx-in"); io.unobserve(e.target); }
    }), { threshold: 0.08 });
    targets.forEach(el => io.observe(el));
  }
  function teardownReveal() {
    if (io) io.disconnect(); io = null;
    $$(".fx-reveal").forEach(el => { el.classList.remove("fx-reveal", "fx-in"); el.style.removeProperty("--fx-d"); });
  }

  // ------------------------------------------------------------------ sliders
  function paintSliders() {
    $$('input[type=range]').forEach(r => {
      const pct = (r.value - r.min) / (r.max - r.min) * 100;
      r.style.setProperty("--fx-pct", pct + "%");
    });
  }
  const lastOut = new Map();
  function bumpOutputs() {
    $$(".control output").forEach(o => {
      const prev = lastOut.get(o.id);
      if (prev !== undefined && prev !== o.textContent) { o.classList.remove("fx-bump"); void o.offsetWidth; o.classList.add("fx-bump"); }
      lastOut.set(o.id, o.textContent);
    });
  }

  // ------------------------------------------------------------------ chart morphing
  const NUM = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
  const split = s => { const n = []; const tpl = s.replace(NUM, m => { n.push(+m); return "\u0001"; }); return { tpl, n }; };
  const join = (tpl, n) => { let i = 0; return tpl.replace(/\u0001/g, () => n[i++].toFixed(1)); };
  const ATTRS = ["cx", "cy", "x", "y", "x1", "x2", "y1", "y2"];
  let snap = null, morphRaf = 0, drawNext = true;

  function snapshot() {
    const s = {};
    for (const id of ["plot1", "plot2"]) {
      const svg = document.getElementById(id);
      const keyed = {}, pts = {};
      svg.querySelectorAll("[data-k]").forEach(el => {
        const o = {};
        if (el.hasAttribute("d")) o.d = el.getAttribute("d");
        ATTRS.forEach(a => el.hasAttribute(a) && (o[a] = +el.getAttribute(a)));
        keyed[el.dataset.k] = o;
      });
      svg.querySelectorAll(".pt").forEach(el => { pts[el.dataset.i] = { cx: +el.getAttribute("cx"), cy: +el.getAttribute("cy"), used: el.getAttribute("fill") === "var(--used)" }; });
      s[id] = { keyed, pts };
    }
    return s;
  }

  function morph() {
    cancelAnimationFrame(morphRaf);
    const jobs = [], finals = [];
    const keep = (el, a) => finals.push([el, a, el.getAttribute(a)]);
    for (const id of ["plot1", "plot2"]) {
      const svg = document.getElementById(id), old = snap && snap[id];
      svg.querySelectorAll("[data-k]").forEach(el => {
        const o = old && old.keyed[el.dataset.k];
        if (el.hasAttribute("d")) {
          const to = split(el.getAttribute("d"));
          if (o && o.d) {
            const from = split(o.d);
            if (from.tpl === to.tpl && from.n.length === to.n.length) {
              keep(el, "d");
              jobs.push(t => el.setAttribute("d", join(to.tpl, to.n.map((v, i) => lerp(from.n[i], v, t)))));
              el.setAttribute("d", o.d);
              return;
            }
          }
          if (el.dataset.k === "fit" && (drawNext || !o)) drawOn(el);
          else if (el.dataset.k === "band" && !o) fadeIn(el);
        }
        if (o) ATTRS.forEach(a => {
          if (!el.hasAttribute(a) || o[a] === undefined) return;
          const to = +el.getAttribute(a), from = o[a];
          if (from === to) return;
          keep(el, a);
          el.setAttribute(a, from);
          jobs.push(t => el.setAttribute(a, lerp(from, to, t).toFixed(1)));
        });
      });
      // points
      svg.querySelectorAll(".pt").forEach(el => {
        const o = old && old.pts[el.dataset.i];
        const used = el.getAttribute("fill") === "var(--used)";
        if (!o) return;
        if (o.used !== used) el.classList.add("fx-pop");
        const tx = +el.getAttribute("cx"), ty = +el.getAttribute("cy");
        if (o.cx !== tx || o.cy !== ty) {
          keep(el, "cx"); keep(el, "cy");
          el.setAttribute("cx", o.cx); el.setAttribute("cy", o.cy);
          jobs.push((t, tb) => { el.setAttribute("cx", lerp(o.cx, tx, tb).toFixed(1)); el.setAttribute("cy", lerp(o.cy, ty, tb).toFixed(1)); });
        }
      });
      addPulse(svg);
    }
    drawNext = false;
    if (!jobs.length) return;
    const t0 = performance.now(), dur = 520;
    const step = now => {
      const k = clamp((now - t0) / dur, 0, 1);
      const t = easeOutCubic(k), tb = easeOutBack(k);
      jobs.forEach(j => j(t, tb));
      if (k < 1) morphRaf = requestAnimationFrame(step);
      else finals.forEach(([el, a, v]) => el.setAttribute(a, v));
    };
    morphRaf = requestAnimationFrame(step);
  }
  function drawOn(el) {
    try {
      const L = el.getTotalLength();
      el.animate([{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }],
        { duration: 1100, easing: "cubic-bezier(.6,.05,.2,1)" });
    } catch (e) {}
  }
  const fadeIn = el => el.animate([{ opacity: 0, transform: "scaleY(.2)" }, { opacity: 1, transform: "none" }],
    { duration: 600, easing: "cubic-bezier(.2,.9,.3,1.2)", transformOrigin: "center" });
  function addPulse(svg) {
    const p = svg.querySelector('[data-k="pred"]');
    if (!p || svg.querySelector(".fx-pulse")) return;
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("class", "fx-pulse");
    ["cx", "cy"].forEach(a => ring.setAttribute(a, p.getAttribute(a)));
    ring.setAttribute("r", "6"); ring.setAttribute("fill", "none"); ring.setAttribute("stroke", "var(--fit)"); ring.setAttribute("stroke-width", "2");
    p.parentNode.insertBefore(ring, p);
    // keep it glued to the moving marker
    const follow = () => { if (!ring.isConnected) return; ring.setAttribute("cx", p.getAttribute("cx")); ring.setAttribute("cy", p.getAttribute("cy")); requestAnimationFrame(follow); };
    follow();
  }
  function ringAt(svg, x, y, color) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("class", "fx-ringc"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", "6");
    c.setAttribute("fill", "none"); c.setAttribute("stroke", color);
    svg.appendChild(c); setTimeout(() => c.remove(), 750);
  }

  // ------------------------------------------------------------------ crosshair on plot 1
  let cross, crossTip, lastDetail = null;
  function pathPairs(d) {
    const n = (d.match(NUM) || []).map(Number), out = [];
    for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
    return out;
  }
  const human = N => N >= 1e13 ? N.toExponential(1).replace("e+", "e") : N >= 1e12 ? `${+(N / 1e12).toPrecision(3)}T` : N >= 1e9 ? `${+(N / 1e9).toPrecision(3)}B` : `${+(N / 1e6).toPrecision(3)}M`;
  function onPlotMove(e) {
    const svg = document.getElementById("plot1");
    if (!lastDetail || e.target.closest(".pt")) { hideCross(); return; }
    const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
    const sx = vb.width / r.width, x = (e.clientX - r.left) * sx;
    if (x < 62 || x > vb.width - 22) { hideCross(); return; }
    const fitEl = svg.querySelector('[data-k="fit"]'), truthEl = svg.querySelector('[data-k="truth"]');
    if (!fitEl || !truthEl) { hideCross(); return; }
    const near = pts => pts.reduce((b, p) => (Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b), pts[0]);
    const pf = near(pathPairs(fitEl.getAttribute("d"))), pt = near(pathPairs(truthEl.getAttribute("d")));
    if (!cross) {
      cross = document.createElementNS("http://www.w3.org/2000/svg", "g");
      cross.setAttribute("class", "fx-cross");
      cross.innerHTML = `<line y1="18" y2="348"/><circle r="5" fill="var(--fit)"/><circle r="5" fill="var(--truth)"/>`;
    }
    if (!cross.isConnected) svg.appendChild(cross);
    const [ln, cf, ct] = cross.children;
    ln.setAttribute("x1", pf[0]); ln.setAttribute("x2", pf[0]);
    cf.setAttribute("cx", pf[0]); cf.setAttribute("cy", pf[1]);
    ct.setAttribute("cx", pt[0]); ct.setAttribute("cy", pt[1]);
    // values from the model parameters
    const { R, state } = lastDetail, xMin = 8 - 0.15, xMax = Math.max(state.target, 11) + 0.2;
    const lx = xMin + (pf[0] - 62) / (vb.width - 62 - 22) * (xMax - xMin), N = 10 ** lx;
    const g = R.truth, a = g.beta / (g.alpha + g.beta), b = g.alpha / (g.alpha + g.beta);
    const G = Math.pow((g.alpha * g.A) / (g.beta * g.B), 1 / (g.alpha + g.beta));
    const D = Math.pow(Math.pow(N / G, 1 / a), b) / G;
    const L = (p) => p.E + p.A * Math.pow(N, -p.alpha) + p.B * Math.pow(D, -p.beta);
    const lt = L(g), lf = R.fit ? L(R.fit) : NaN;
    const zh = isZh();
    crossTip.innerHTML = `<b>N ≈ ${human(N)}</b> · D ≈ ${human(D)}<br><span class="f">● ${zh ? "拟合" : "fit"} ${lf.toFixed(4)}</span><br><span class="t">● ${zh ? "真实" : "true"} ${lt.toFixed(4)}</span><br>Δ ${(lf - lt >= 0 ? "+" : "") + (lf - lt).toFixed(4)}`;
    crossTip.hidden = false;
    const wrap = document.getElementById("plot1-wrap").getBoundingClientRect();
    let left = pf[0] / sx + 14; if (left + crossTip.offsetWidth > wrap.width) left = pf[0] / sx - crossTip.offsetWidth - 14;
    crossTip.style.left = left + "px"; crossTip.style.top = Math.max(0, pf[1] / sx - 40) + "px";
  }
  function hideCross() { if (cross) cross.remove(); if (crossTip) crossTip.hidden = true; }

  // ------------------------------------------------------------------ readout count-up
  let prevStats = null, prevBad = new Set();
  const PLAIN = /^[+-]?\d+\.\d+$/;
  function snapStats() { prevStats = $$("#readout .stat").map(s => s.querySelector(".v")?.textContent || ""); }
  function animateStats(first) {
    const stats = $$("#readout .stat");
    stats.forEach((s, i) => {
      const v = s.querySelector(".v"); if (!v) return;
      const to = v.textContent, from = prevStats ? prevStats[i] : undefined;
      if (first) { s.animate([{ opacity: 0, transform: "translateY(14px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: i * 45, easing: "cubic-bezier(.2,.9,.3,1.2)", fill: "backwards" }); }
      const bad = v.classList.contains("bad");
      if (bad && !prevBad.has(i) && !first) { s.classList.remove("fx-shake"); void s.offsetWidth; s.classList.add("fx-shake"); }
      bad ? prevBad.add(i) : prevBad.delete(i);
      if (from === undefined || from === to) return;
      if (PLAIN.test(from) && PLAIN.test(to)) {
        const a = +from, b = +to, dec = (to.split(".")[1] || "").length, sign = to.startsWith("+");
        s.classList.remove("fx-up", "fx-down"); void s.offsetWidth; s.classList.add(b > a ? "fx-up" : "fx-down");
        const t0 = performance.now(), dur = 450;
        const step = now => {
          const k = clamp((now - t0) / dur, 0, 1), val = lerp(a, b, easeOutCubic(k));
          v.textContent = (sign && val >= 0 ? "+" : "") + val.toFixed(dec);
          if (k < 1 && v.isConnected) requestAnimationFrame(step); else v.textContent = to;
        };
        requestAnimationFrame(step);
      } else {
        s.classList.remove("fx-up", "fx-down"); void s.offsetWidth; s.classList.add("fx-up");
      }
    });
  }

  // ------------------------------------------------------------------ tilt / spotlight / magnet / ripple
  function onMove(e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
    const dist = Math.hypot(e.clientX - mouse.px, e.clientY - mouse.py);
    if (dist > 8) {
      mouse.px = e.clientX; mouse.py = e.clientY;
      if (sparks.length < 400) sparks.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * 1.2, life: 1, decay: 0.035, size: 2.2, c: palette[Math.floor(Math.random() * palette.length)], g: 0.02, rot: 0, vr: 0 });
    }
    if (e.pointerType === "touch") return; // no tilt/magnet while dragging on phones
    // card spotlight + tilt
    const card = e.target.closest && e.target.closest(".card");
    $$(".card").forEach(c => {
      if (c !== card && c.style.transform) c.style.transform = "";
    });
    if (card) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
      const big = r.height > 300;
      const max = big ? 1.2 : 3;
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -max, ry = ((e.clientX - r.left) / r.width - 0.5) * max;
      card.style.transform = `perspective(1400px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    }
    // stat tiles tilt
    const stat = e.target.closest && e.target.closest(".stat");
    $$(".stat").forEach(s => { if (s !== stat && s.style.transform) s.style.transform = ""; });
    if (stat) {
      const r = stat.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -14, ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
      stat.style.transform = `perspective(500px) rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) translateZ(10px) scale(1.04)`;
    }
    // magnetic buttons
    const mag = e.target.closest && e.target.closest(".chip, .mini, .ghost");
    $$(".chip, .mini, .ghost").forEach(b => { if (b !== mag && b.style.transform) b.style.transform = ""; });
    if (mag) {
      const r = mag.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      mag.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.3).toFixed(1)}px) translateY(-2px)`;
    }
  }
  function onLeaveWindow() { mouse.x = mouse.y = -9999; $$(".card, .stat, .chip, .mini, .ghost").forEach(el => (el.style.transform = "")); }

  function onDown(e) {
    const b = e.target.closest && e.target.closest(".chip, .mini, .ghost, .stat");
    if (b) {
      const r = b.getBoundingClientRect();
      const s = document.createElement("span");
      s.className = "fx-ripple"; s.style.left = e.clientX - r.left + "px"; s.style.top = e.clientY - r.top + "px";
      b.appendChild(s); setTimeout(() => s.remove(), 700);
    }
    burst(e.clientX, e.clientY, b ? 18 : 8, { speed: b ? 3.5 : 2.2, lift: 1 });
  }

  function onClick(e) {
    const chip = e.target.closest && e.target.closest("[data-sc]");
    if (chip) { drawNext = true; confettiFrom(chip); toast(`✦ ${chip.textContent}`); }
    const pt = e.target.closest && e.target.closest(".pt");
    if (pt) {
      const svg = document.getElementById("plot1");
      ringAt(svg, pt.getAttribute("cx"), pt.getAttribute("cy"), pt.getAttribute("fill") === "var(--used)" ? "var(--held)" : "var(--used)");
      burst(e.clientX, e.clientY, 22, { speed: 3 });
    }
    if (e.target.closest && e.target.closest("#share")) toast(isZh() ? "🔗 链接已复制" : "🔗 Link copied");
    if (e.target.closest && e.target.closest("#csv")) toast(isZh() ? "📄 CSV 已导出" : "📄 CSV exported");
    if (e.target.closest && e.target.closest("#reset")) { drawNext = true; toast(isZh() ? "↺ 已重置" : "↺ Reset"); }
    if (e.target.closest && e.target.closest("#reseed")) toast(isZh() ? "🎲 新的随机种子" : "🎲 New noise seed");
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName) && document.activeElement.type !== "range" && document.activeElement.type !== "checkbox") return;
    const k = e.key;
    const app = window.slpApp;
    if (/^[1-9]$/.test(k) && app) {
      const keys = app.scenarioKeys(), key = keys[+k - 1];
      if (key) { const chip = document.querySelector(`[data-sc="${key}"]`); drawNext = true; app.applyScenario(key); if (chip) { confettiFrom(chip); toast(`✦ ${chip.textContent}`); } }
    } else if (k === "b" || k === "B") { app && app.toggleBoot(); toast(document.getElementById("boot").checked ? "Bootstrap ✓" : "Bootstrap ✗"); }
    else if (k === "r" || k === "R") { drawNext = true; app && app.reset(); toast(isZh() ? "↺ 已重置" : "↺ Reset"); }
    else if (k === "t" || k === "T") document.getElementById("theme-btn").click();
    else if (k === "?") toggleHelp();
    else if (k === "Escape") { const h = $("#fx-help"); if (h) h.remove(); }
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    $(".top").classList.toggle("fx-scrolled", scrollY > 8);
    const hero = $(".hero");
    if (hero) hero.style.transform = `translateY(${(scrollY * 0.18).toFixed(1)}px)`;
    if (hero) hero.style.opacity = String(clamp(1 - scrollY / 700, 0.3, 1));
  }

  // ------------------------------------------------------------------ theme circular reveal
  F.themeTransition = (apply, from) => {
    if (!document.startViewTransition) { apply(); return; }
    const r = from.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(() => { apply(); readPalette(); });
    vt.ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(.6,0,.2,1)", pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
    setTimeout(readPalette, 50);
  };

  // ------------------------------------------------------------------ app hooks
  document.addEventListener("slp:beforerender", () => { if (!F.on) return; snap = snapshot(); snapStats(); hideCross(); });
  document.addEventListener("slp:render", e => {
    lastDetail = e.detail;
    if (!F.on) return;
    morph();
    animateStats(false);
    paintSliders();
    bumpOutputs();
    splitTitle(true);
  });

  // ------------------------------------------------------------------ enable / disable
  function enable(silent) {
    if (F.on) return;
    F.on = true;
    root.classList.add("fancy");
    readPalette();
    make("div", { id: "fx-bg", innerHTML: "<i></i><i></i><i></i><i></i>" });
    glow = make("div", { id: "fx-glow" });
    cvBg = make("canvas", { id: "fx-canvas-bg" });
    cvTop = make("canvas", { id: "fx-canvas-top" });
    progress = make("div", { id: "fx-progress" });
    toastBox = make("div", { id: "fx-toasts" });
    crossTip = make("div", { className: "fx-crosstip", hidden: true }, document.getElementById("plot1-wrap"));
    ctxBg = cvBg.getContext("2d"); ctxTop = cvTop.getContext("2d");
    resize();
    listen(window, "resize", resize);
    listen(window, "pointermove", onMove, { passive: true });
    listen(document, "pointerleave", onLeaveWindow);
    listen(window, "blur", onLeaveWindow);
    listen(document, "pointerdown", onDown, { passive: true });
    listen(document, "click", onClick, true);
    listen(document, "keydown", onKey);
    listen(window, "scroll", onScroll, { passive: true });
    listen(document.getElementById("plot1"), "pointermove", onPlotMove);
    listen(document.getElementById("plot1"), "pointerleave", hideCross);
    $$('input[type=range]').forEach(r => listen(r, "input", paintSliders));
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const rp = () => setTimeout(readPalette, 30);
    mq.addEventListener("change", rp); offs.push(() => mq.removeEventListener("change", rp));
    listen(document.getElementById("theme-btn"), "click", rp);
    listen(document, "visibilitychange", () => { cancelAnimationFrame(raf); if (!document.hidden && F.on) raf = requestAnimationFrame(frame); });
    raf = requestAnimationFrame(frame);

    splitTitle(true);
    setupReveal();
    paintSliders();
    bumpOutputs();
    onScroll();
    // replay charts and tiles with motion
    drawNext = true;
    snap = null; prevStats = null;
    $$("#plot1 [data-k=fit], #plot2 [data-k=fit]").forEach(drawOn);
    $$("#plot1, #plot2").forEach(addPulse);
    $$("#plot1 .pt").forEach((p, i) => p.animate([{ opacity: 0, transform: "scale(0)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 200 + i * 18, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "backwards" }));
    drawNext = false;
    animateStats(true);
    if (!silent) {
      confettiFrom(btn);
      toast(isZh() ? "✦ 炫酷模式已开启 · 按 <kbd>?</kbd> 查看快捷键" : "✦ Fancy mode on · press <kbd>?</kbd> for shortcuts", 2600);
    }
    btn.setAttribute("aria-checked", "true");
  }

  function disable() {
    if (!F.on) return;
    F.on = false;
    cancelAnimationFrame(raf); cancelAnimationFrame(morphRaf);
    offs.forEach(f => f()); offs = [];
    added.forEach(n => n.remove()); added = [];
    hideCross(); cross = null;
    const help = $("#fx-help"); if (help) help.remove();
    teardownReveal();
    unsplitTitle();
    root.classList.remove("fancy");
    $$(".card, .stat, .chip, .mini, .ghost, .hero").forEach(el => { el.style.transform = ""; el.style.opacity = ""; el.style.removeProperty("--mx"); el.style.removeProperty("--my"); });
    $$('input[type=range]').forEach(r => r.style.removeProperty("--fx-pct"));
    $$(".fx-pulse, .fx-ringc, .fx-ripple").forEach(n => n.remove());
    $$(".fx-pop, .fx-up, .fx-down, .fx-shake, .fx-bump").forEach(n => n.classList.remove("fx-pop", "fx-up", "fx-down", "fx-shake", "fx-bump"));
    document.getAnimations().forEach(a => { try { a.cancel(); } catch (e) {} });
    $(".top").classList.remove("fx-scrolled");
    $$('[style=""]').forEach(el => el.removeAttribute("style"));
    $$('[class=""]').forEach(el => el.removeAttribute("class"));
    sparks = []; nodes = []; snap = null; prevStats = null; prevBad = new Set(); lastOut.clear();
    btn.setAttribute("aria-checked", "false");
    if (window.slpApp && window.slpApp.rerender) window.slpApp.rerender();
  }

  function set(on, silent) {
    on ? enable(silent) : disable();
    try { localStorage.setItem("slp-fancy", on ? "1" : "0"); } catch (e) {}
  }
  btn.addEventListener("click", () => set(!F.on));
  document.addEventListener("keydown", e => {
    if ((e.key === "f" || e.key === "F") && !e.metaKey && !e.ctrlKey && !e.altKey &&
      !(/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName) && !["range", "checkbox"].includes(document.activeElement.type))) set(!F.on);
  });
  let saved = null;
  try { saved = localStorage.getItem("slp-fancy"); } catch (e) {}
  if (saved === "1") enable(true);
})();
