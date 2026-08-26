/* ============================================================
   BIRTHDAY.EXE — all logic in one file. No modules, no imports,
   works from file:// directly. Personalize via CONFIG below.
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   1. PERSONALIZE HERE
------------------------------------------------------------ */
const CONFIG = {
  name: 'Vidushi',
  secretWord: 'vidushi',
  photos: [
    { src: 'assets/memories/01-baby-with-family.webp', label: 'CHAPTER_01', title: 'The very beginning.', detail: 'A tiny Vidushi, surrounded by love from day one.', position: 'center' },
    { src: 'assets/memories/02-grandpa.webp', label: 'CHAPTER_02', title: 'Grandpa’s little star.', detail: 'A beautiful old memory, held close.', position: 'center 42%' },
    { src: 'assets/memories/03-little-krishna.webp', label: 'CHAPTER_03', title: 'Little Krishna.', detail: 'Dressed for the part, already completely iconic.', position: 'center 34%' },
    { src: 'assets/memories/04-black-dress.webp', label: 'CHAPTER_04', title: 'Classic in black.', detail: 'A look that belongs in the highlight reel.', position: 'center 38%' },
    { src: 'assets/memories/05-festive-lights.webp', label: 'CHAPTER_05', title: 'Festival lights.', detail: 'Dressed up beneath a sky full of sparkle.', position: 'center' },
    { src: 'assets/memories/06-birthday-glow.webp', label: 'CHAPTER_06', title: 'Birthday glow.', detail: 'Golden balloons, cake, and a very happy smile.', position: 'center 38%' },
    { src: 'assets/memories/07-mirror-selfie.webp', label: 'CHAPTER_07', title: 'Mirror moment.', detail: 'A little confidence, a lot of style.', position: 'center 27%' },
    { src: 'assets/memories/08-night-in-blue.jpg', label: 'CHAPTER_08', title: 'Night in blue.', detail: 'A beautiful evening, bright city lights, and her.', position: 'center 37%' }
  ],
  stats: [
    { label: 'CHAOS LEVEL',      value: 100, desc: 'A feature, not a bug.' },
    { label: 'RANDOMNESS',       value: 92,  desc: 'Predictability is overrated.' },
    { label: 'LAUGH GENERATION', value: 100, desc: 'Works in every timezone.' },
    { label: 'REPLY SPEED',      value: 30,  desc: 'Depends on planetary alignment.' },
    { label: 'MEMORY STORAGE',   value: 100, desc: 'Remembers everything. Conveniently.' },
    { label: 'GOOD VIBES',       value: 100, desc: 'Default setting: excellent.' }
  ],
  known: [],
  awards: [
    { icon: '🏆', title: 'Best at Being Vidushi',              detail: 'Unanimously awarded, every single year.' },
    { icon: '✦',  title: 'Most Likely to Say “…”',             detail: 'The pause says everything. Perfectly.' },
    { icon: '★',  title: 'Lifetime Achievement in Randomness', detail: 'A career of bold, unexplained decisions.' },
    { icon: '✹',  title: 'Best Laugh',                         detail: 'An instant atmosphere upgrade for any room.' },
    { icon: '✳',  title: 'CEO of Chaos',                       detail: 'The position was self-appointed. It stands.' },
    { icon: '◈',  title: 'Most Unpredictable Human',           detail: 'And that is exactly the magic.' }
  ]
};

/* ------------------------------------------------------------
   2. Helpers
------------------------------------------------------------ */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const rand  = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SAVE_DATA = navigator.connection?.saveData === true;
const LOW_POWER = REDUCED || SAVE_DATA || (navigator.hardwareConcurrency || 8) <= 4;

const PALETTE = ['#ff6ea9', '#a78bfa', '#7ee8fa', '#d5f36d', '#ff8a5c', '#fff7ec'];

let toastTimer = null;
function showToast(html) {
  const toast = $('#toast');
  if (!toast) return;
  toast.innerHTML = html;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ------------------------------------------------------------
   3. Audio engine (WebAudio — synthesized, zero files needed)
------------------------------------------------------------ */
const AudioFX = (() => {
  let ctx = null;
  let enabled = true;

  function ready() {
    if (!enabled) return false;
    // Do not allocate a suspended audio graph during the loader. Audio starts
    // after the first real interaction, which is also what browsers require.
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return false;
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx.state === 'running' || ctx.state === 'suspended';
    } catch { return false; }
  }

  function note(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function tone(freq, start, dur, { type = 'triangle', vol = 0.16 } = {}) {
    const t = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function noiseBuffer(dur) {
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function blow() {
    if (!ready()) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(0.35);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.3);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.33);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);
  }

  function pop() {
    if (!ready()) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(rand(500, 700), t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.09);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.13);
  }

  /* Happy Birthday — [midi, beats] */
  const MELODY = [
    [67,.75],[67,.25],[69,1],[67,1],[72,1],[71,2],
    [67,.75],[67,.25],[69,1],[67,1],[74,1],[72,2],
    [67,.75],[67,.25],[79,1],[76,1],[72,1],[71,1],[69,3],
    [77,.75],[77,.25],[76,1],[72,1],[74,1],[72,3]
  ];
  const BEAT = 0.42;

  function melody() {
    if (!ready()) return;
    let t = 0;
    MELODY.forEach(([m, b]) => {
      const d = b * BEAT;
      tone(note(m), t, d * 0.95, { type: 'triangle', vol: 0.17 });
      tone(note(m) * 2, t, d * 0.9, { type: 'sine', vol: 0.05 });
      t += d;
    });
    return t;
  }

  function fanfare() {
    if (!ready()) return;
    [72, 76, 79, 84].forEach((m, i) => tone(note(m), i * 0.09, 0.35, { type: 'square', vol: 0.09 }));
  }

  function setEnabled(v) { enabled = v; }

  return { ready, pop, blow, melody, fanfare, setEnabled };
})();

/* ------------------------------------------------------------
   4. FX canvas — confetti + fireworks (one loop)
------------------------------------------------------------ */
const FX = (() => {
  const canvas = $('#fxCanvas');
  if (!canvas) return { burst(){}, cannon(){}, firework(){}, volley(){}, rain(){} };
  const ctx2d = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const pieces = [];
  const rockets = [];
  const sparks = [];
  let frame = 0;

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, LOW_POWER ? 1.25 : 1.75);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx2d.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  function ensureRunning() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(loop);
  }

  function burst(x, y, count = 26, power = 9) {
    const n = REDUCED ? Math.ceil(count / 3) : count;
    for (let i = 0; i < n; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(2, power);
      pieces.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(1, 4),
        g: rand(0.12, 0.2),
        w: rand(4, 9),
        h: rand(6, 13),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.25, 0.25),
        color: PALETTE[randInt(0, PALETTE.length - 1)],
        life: rand(55, 100),
        age: 0,
        shape: Math.random() < 0.25 ? 'circle' : 'rect'
      });
    }
    trim();
    ensureRunning();
  }

  function cannon() {
    burst(W * 0.5, H * 0.42, LOW_POWER ? 36 : 52, 13);
    burst(W * 0.06, H * 0.86, LOW_POWER ? 20 : 28, 15);
    burst(W * 0.94, H * 0.86, LOW_POWER ? 20 : 28, 15);
  }

  function rain(count = 120) {
    const n = REDUCED ? Math.ceil(count / 4) : count;
    for (let i = 0; i < n; i++) {
      pieces.push({
        x: rand(0, W), y: rand(-H * 0.4, -12),
        vx: rand(-0.7, 0.7), vy: rand(1.4, 3.4),
        g: 0.02, w: rand(4, 8), h: rand(7, 13),
        rot: rand(0, Math.PI * 2), vr: rand(-0.18, 0.18),
        color: PALETTE[randInt(0, PALETTE.length - 1)],
        life: rand(160, 240), age: 0,
        shape: Math.random() < 0.3 ? 'circle' : 'rect'
      });
    }
    trim();
    ensureRunning();
  }

  function trim() {
    const max = REDUCED ? 160 : LOW_POWER ? 360 : 520;
    if (pieces.length > max) pieces.splice(0, pieces.length - max);
  }

  function firework(x = rand(W * 0.2, W * 0.8), targetY = rand(H * 0.16, H * 0.44)) {
    rockets.push({
      x, y: H + 10,
      vx: rand(-1, 1),
      vy: -(H - targetY) / rand(52, 64),
      ty: targetY,
      hue: randInt(0, 360)
    });
    ensureRunning();
  }

  function explode(r) {
    const count = REDUCED ? 28 : LOW_POWER ? randInt(42, 64) : randInt(52, 78);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.08, 0.08);
      const speed = rand(1.6, 6.4);
      sparks.push({
        x: r.x, y: r.y, px: r.x, py: r.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        hue: r.hue + rand(-24, 24),
        life: rand(48, 84), age: 0
      });
    }
  }

  function volley(total = 7, gapMs = 420) {
    for (let i = 0; i < total; i++) setTimeout(() => firework(), i * gapMs + rand(0, 160));
  }

  function stepPiece(p) {
    p.age++;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 + p.g;
    p.x += p.vx + Math.sin((p.age + p.w) * 0.09) * 0.6;
    p.y += p.vy;
    p.rot += p.vr;
    return p.age < p.life && p.y < H + 30;
  }

  function drawPieces() {
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (!stepPiece(p)) { pieces.splice(i, 1); continue; }
      const alpha = p.age > p.life * 0.72 ? 1 - (p.age - p.life * 0.72) / (p.life * 0.28) : 1;
      ctx2d.globalAlpha = alpha;
      ctx2d.fillStyle = p.color;
      if (p.shape === 'circle') {
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2);
        ctx2d.fill();
      } else {
        ctx2d.save();
        ctx2d.translate(p.x, p.y);
        ctx2d.rotate(p.rot);
        ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * (0.55 + 0.45 * Math.abs(Math.sin(p.age * 0.14))));
        ctx2d.restore();
      }
    }
    ctx2d.globalAlpha = 1;
  }

  function stepRocket(r, idx) {
    r.x += r.vx;
    r.y += r.vy;
    r.vy += 0.045;
    ctx2d.strokeStyle = `hsl(${r.hue} 100% 72%)`;
    ctx2d.lineWidth = 2.4;
    ctx2d.beginPath();
    ctx2d.moveTo(r.x - r.vx * 2.4, r.y - r.vy * 2.4);
    ctx2d.lineTo(r.x, r.y);
    ctx2d.stroke();
    ctx2d.fillStyle = '#fff';
    ctx2d.beginPath();
    ctx2d.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
    ctx2d.fill();
    if (r.y <= r.ty || r.vy >= 0) { explode(r); rockets.splice(idx, 1); }
  }

  function stepSpark(s, i) {
    s.age++;
    s.px = s.x; s.py = s.y;
    s.vx *= 0.966;
    s.vy = s.vy * 0.966 + 0.055;
    s.x += s.vx;
    s.y += s.vy;
    if (s.age >= s.life) { sparks.splice(i, 1); return; }
    const alpha = 1 - s.age / s.life;
    ctx2d.strokeStyle = `hsla(${s.hue}, 100%, ${62 + alpha * 22}%, ${alpha})`;
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.moveTo(s.px, s.py);
    ctx2d.lineTo(s.x, s.y);
    ctx2d.stroke();
  }

  function loop() {
    frame = 0;
    if (document.hidden) return;
    ctx2d.clearRect(0, 0, W, H);
    ctx2d.globalCompositeOperation = 'lighter';
    for (let i = rockets.length - 1; i >= 0; i--) stepRocket(rockets[i], i);
    for (let i = sparks.length - 1; i >= 0; i--) stepSpark(sparks[i], i);
    ctx2d.globalCompositeOperation = 'source-over';
    drawPieces();
    if (pieces.length || rockets.length || sparks.length) ensureRunning();
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && (pieces.length || rockets.length || sparks.length)) ensureRunning();
  });

  return { burst, cannon, firework, volley, rain };
})();

/* ------------------------------------------------------------
   5. Balloons — spawn, drift, POP
------------------------------------------------------------ */
const Balloons = (() => {
  const layer = $('#balloonLayer');
  if (!layer) return { start(){} };
  const HUES = [330, 265, 190, 80, 300];
  const active = new Map();
  let alive = 0;
  let timer = null;

  function pop(el) {
    const record = active.get(el);
    if (!record || el.classList.contains('pop')) return;
    const { anim, cleanup } = record;
    const r = el.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height / 2, 22, 8);
    AudioFX.pop();
    el.classList.add('pop');
    anim.pause();
    setTimeout(cleanup, 300);
  }

  function spawn() {
    if (document.hidden || REDUCED || alive >= (LOW_POWER ? 4 : 5)) return;
    alive++;
    const el = document.createElement('div');
    el.className = 'balloon';
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Pop the balloon');
    const float = document.createElement('div');
    float.className = 'balloon-float';
    float.innerHTML = '<span class="balloon-body"></span><span class="balloon-string"></span>';
    el.appendChild(float);

    el.style.setProperty('--h', HUES[randInt(0, HUES.length - 1)]);
    el.style.setProperty('--sway', `${rand(2.2, 3.6)}s`);
    el.style.setProperty('--amp', `${rand(7, 16)}px`);
    el.style.left = `${rand(3, 91)}vw`;
    const scale = rand(0.65, 1.15);
    el.style.transform = `translate3d(0,0,0) scale(${scale})`;

    layer.appendChild(el);

    const duration = rand(11000, 17000);
    const travel = innerHeight + 390;
    const anim = el.animate(
      [
        { transform: `translate3d(0,0,0) scale(${scale})` },
        { transform: `translate3d(0,-${travel}px,0) scale(${scale})` }
      ],
      { duration, easing: 'linear', fill: 'forwards' }
    );
    const cleanup = () => { anim.cancel(); active.delete(el); el.remove(); alive--; };
    anim.onfinish = cleanup;
    active.set(el, { anim, cleanup });

    el.addEventListener('pointerdown', e => {
      e.stopPropagation();
      pop(el);
    });
  }

  // Balloons stay behind the content, so detect a tap on their visible area here.
  document.addEventListener('pointerdown', e => {
    for (const el of active.keys()) {
      const r = el.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        e.preventDefault();
        e.stopPropagation();
        pop(el);
        break;
      }
    }
  }, true);

  function start() {
    spawn(); setTimeout(spawn, 900); setTimeout(spawn, 1900);
    timer = setInterval(spawn, randInt(3200, 4800));
  }
  return { start };
})();

/* ------------------------------------------------------------
   6. Loader — progress bar + 3·2·1 countdown
------------------------------------------------------------ */
function initLoader() {
  const loader = $('#loader'), bar = $('#loaderBar'), statusEl = $('#loaderStatus'), count = $('#loaderCount');
  const header = $('#siteHeader');
  const steps = ['warming up the confetti…', 'inflating balloons…', 'frosting the cake…', 'polishing the crown…'];
  let progress = 0;

  const fill = setInterval(() => {
    progress += rand(22, 30);
    bar.style.width = `${Math.min(progress, 100)}%`;
    statusEl.textContent = steps[Math.min(Math.floor(progress / 26), steps.length - 1)];
    if (progress >= 100) {
      clearInterval(fill);
      setTimeout(countdown, 180);
    }
  }, 180);

  function tick(n) {
    count.textContent = n;
    count.animate(
      [{ transform: 'scale(1.5)', opacity: 0.2 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 380, easing: 'ease-out' }
    );
    AudioFX.pop();
  }

  function countdown() {
    tick('3');
    setTimeout(() => tick('2'), 420);
    setTimeout(() => tick('1'), 840);
    setTimeout(() => {
      count.textContent = '🎉';
      count.animate([{ transform: 'scale(.4)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
        { duration: 450, easing: 'cubic-bezier(.2,1.6,.3,1)' });
    }, 1260);
    setTimeout(() => {
      loader.classList.add('done');
      header.classList.add('visible');
      FX.cannon();
      AudioFX.fanfare();
      showToast(`Welcome to the party, ${CONFIG.name} 🎉`);
      Balloons.start();
    }, 1650);
  }
}

/* ------------------------------------------------------------
   7. Render dynamic content
------------------------------------------------------------ */
function renderContent() {
  const grid = $('#memoryGrid');
  if (grid) {
    grid.innerHTML = CONFIG.photos.map((p, i) => `
      <article class="memory-card reveal"
               style="--tilt:0deg">
        <div class="memory-visual" style="--photo-position:${p.position}"><img src="${p.src}" alt="${p.title}" loading="lazy" decoding="async" fetchpriority="low"></div>
        <div class="memory-caption">${p.title}</div>
      </article>`).join('');
  }

  const stats = $('#statsList');
  if (stats) {
    stats.innerHTML = CONFIG.stats.map(s => `
      <div class="stat reveal">
        <div class="stat-top"><span>${s.label}</span><span data-count="${s.value}">0%</span></div>
        <div class="stat-bar"><span data-width="${s.value}%"></span></div>
        <div class="stat-desc">${s.desc}</div>
      </div>`).join('');
  }

  const awards = $('#awardsGrid');
  if (awards) {
    awards.innerHTML = CONFIG.awards.map(a => `
      <article class="award reveal">
        <div class="award-icon">${a.icon}</div>
        <h3>${a.title}</h3><p>${a.detail}</p>
      </article>`).join('');
  }
}

/* ------------------------------------------------------------
   8. Scroll reveals + stat counters
------------------------------------------------------------ */
function initReveals() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (entry.target.matches('.stat')) {
        const bar = entry.target.querySelector('.stat-bar span');
        if (bar) bar.style.width = bar.dataset.width;
        const num = entry.target.querySelector('[data-count]');
        if (num) {
          const target = parseInt(num.dataset.count, 10);
          const start = performance.now();
          (function count(now) {
            const k = Math.min((now - start) / 900, 1);
            num.textContent = `${Math.round(target * k)}%`;
            if (k < 1) requestAnimationFrame(count);
          })(start);
        }
      }
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ------------------------------------------------------------
   9. Pointer magic — cursor, ring, sparkles, magnetic buttons
------------------------------------------------------------ */
function initPointer() {
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  const fine = matchMedia('(pointer:fine)').matches;

  if (fine && dot && ring) {
    let mx = innerWidth / 2, my = innerHeight / 2, pointerFrame = 0;
    let lastSpark = 0;
    const paintPointer = () => {
      pointerFrame = 0;
      const position = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
      dot.style.transform = position;
      ring.style.transform = position;
    };
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(paintPointer);

      const now = performance.now();
      if (REDUCED || LOW_POWER || now - lastSpark < 140 || Math.random() > 0.45) return;
      lastSpark = now;
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = Math.random() < 0.5 ? '✦' : '✧';
      s.style.left = `${e.clientX + rand(-8, 8)}px`;
      s.style.top = `${e.clientY + rand(-8, 8)}px`;
      s.style.color = PALETTE[randInt(0, PALETTE.length - 1)];
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 720);
    }, { passive: true });

    document.addEventListener('mouseover', e => {
      document.body.classList.toggle('cursor-hover',
        !!e.target.closest('a,button,[role="button"]'));
    });

  }

  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${dx * 0.22}px,${dy * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* mini confetti wherever you click/tap */
  let lastTap = 0;
  document.addEventListener('pointerdown', e => {
    const now = performance.now();
    if (now - lastTap < 90) return;
    lastTap = now;
    FX.burst(e.clientX, e.clientY, 12, 7);
  }, { passive: true });
}

/* ------------------------------------------------------------
   10. Cake — blow out the candles ritual
------------------------------------------------------------ */
function initCake() {
  const hint = $('#cakeHint'), wishCard = $('#wishCard');
  const flames = $$('.flame');
  let lit = flames.length;
  if (!hint) return;

  const extinguish = flame => {
    const candle = flame.closest('.candle');
    if (!candle || candle.classList.contains('out')) return;
    candle.classList.add('out');
    AudioFX.blow();
    lit--;
    hint.textContent = lit > 0
      ? `🔥 × ${lit} still burning…`
      : 'all clear. wish locked in. ✦';
    if (lit === 0) setTimeout(celebrate, 380);
  };

  flames.forEach(flame => {
    flame.addEventListener('click', () => extinguish(flame));
    flame.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); extinguish(flame); }
    });
  });

  let celebrated = false;
  function celebrate() {
    if (celebrated) return;
    celebrated = true;
    wishCard.classList.add('show');
    FX.cannon();
    FX.volley(8, 380);
    AudioFX.melody();
    showToast('Wish granted. Express delivery. ✦');
  }
}

/* ------------------------------------------------------------
   11. Memory lightbox
------------------------------------------------------------ */
function initLightbox() {
  const box = $('#lightbox');
  if (!box) return;
  let index = 0;

  function show(i) {
    index = (i + CONFIG.photos.length) % CONFIG.photos.length;
    const p = CONFIG.photos[index];
    $('#lightboxLabel').textContent = `MEMORY / ${p.label}`;
    $('#lightboxVisual').innerHTML = `<img src="${p.src}" alt="${p.title}">`;
    $('#lightboxCaption').textContent = p.title;
    $('#lightboxDetail').textContent = p.detail;
  }
  function open(i) { show(i); box.classList.add('open'); box.setAttribute('aria-hidden', 'false'); }
  function close() { box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); }

  $$('.memory-card').forEach(card => {
    const go = () => open(parseInt(card.dataset.index, 10));
    card.addEventListener('click', go);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  });

  $('#lightboxClose').addEventListener('click', close);
  $('#lightboxPrev').addEventListener('click', () => show(index - 1));
  $('#lightboxNext').addEventListener('click', () => show(index + 1));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
}

/* ------------------------------------------------------------
   12. Nav, envelope, gift, scan, sound, easter egg
------------------------------------------------------------ */
function initInteractions() {
  /* smooth-scroll buttons */
  $$('[data-scroll]').forEach(btn =>
    btn.addEventListener('click', () => {
      const target = $(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }));

  /* mobile menu */
  const menu = $('#mobileMenu');
  $('#menuToggle').addEventListener('click', () => menu.classList.toggle('open'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

  /* sound toggle */
  const soundToggle = $('#soundToggle');
  soundToggle.addEventListener('click', () => {
    const on = !soundToggle.classList.contains('on');
    soundToggle.classList.toggle('on', on);
    soundToggle.setAttribute('aria-pressed', String(on));
    $('.sound-label', soundToggle).textContent = on ? 'SOUND ON' : 'SOUND OFF';
    AudioFX.setEnabled(on);
    showToast(on ? 'Sound effects: <b>ON</b>' : 'Sound effects muted.');
    if (on) AudioFX.fanfare();
  });

  /* scan button */
  $('#scanButton').addEventListener('click', () => {
    showToast('Scan complete: still iconic.');
    FX.burst(innerWidth / 2, innerHeight / 2, 24, 9);
    $$('.stat-bar span').forEach(bar => {
      bar.style.transition = 'none'; bar.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = ''; bar.style.width = bar.dataset.width;
      }));
    });
  });

  /* envelope */
  const envelope = $('#envelope');
  envelope.addEventListener('click', () => {
    const open = envelope.classList.toggle('open');
    envelope.setAttribute('aria-expanded', String(open));
    if (open) { FX.burst(innerWidth / 2, innerHeight / 2, 20, 8); AudioFX.pop(); }
  });

  /* gift finale */
  const gift = $('#giftButton'), message = $('#finalMessage');
  gift.addEventListener('click', () => {
    if (gift.classList.contains('open') || gift.classList.contains('shaking')) return;
    gift.classList.add('shaking');
    AudioFX.blow();
    setTimeout(() => {
      gift.classList.remove('shaking');
      gift.classList.add('open');
      message.classList.add('show');
      FX.volley(8, 320);
      FX.rain(64);
      AudioFX.melody();
      showToast('SURPRISE SUCCESSFULLY DEPLOYED 🎁');
    }, 480);
  });

  /* replay the whole party */
  $('#replayButton').addEventListener('click', () => {
    gift.classList.remove('open');
    message.classList.remove('show');
    $$('.candle').forEach(c => c.classList.remove('out'));
    const hint = $('#cakeHint');
    if (hint) hint.textContent = '🔥 × 3 still burning…';
    scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { FX.cannon(); AudioFX.fanfare(); }, 700);
    showToast('Party reset. Round two. 🔁');
  });

  /* type her name anywhere → mega mode */
  let typed = '';
  document.addEventListener('keydown', e => {
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-CONFIG.secretWord.length);
    if (typed === CONFIG.secretWord) {
      typed = '';
      FX.cannon(); FX.volley(10, 280); FX.rain(90);
      AudioFX.melody();
      showToast(`<b>${CONFIG.name.toUpperCase()}</b> MODE: FULLY ACTIVATED ✦✦✦`);
    }
  });
}

/* ------------------------------------------------------------
   BOOT
------------------------------------------------------------ */
renderContent();
initLoader();
initReveals();
initPointer();
initCake();
initInteractions();
