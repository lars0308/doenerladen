// Kleine Sound-Engine: alle Effekte und die Musik werden live erzeugt (keine Dateien nötig).
const Sfx = (() => {
  let ac = null, master = null, muted = false;
  let timer = null, step = 0, song = null;

  function ctx() {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain();
        master.gain.value = 0.55;
        master.connect(ac.destination);
      } catch (e) { return null; }
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tone(f, d, type = 'square', vol = 0.12, slide = 0, when = 0) {
    const a = ctx(); if (!a || muted) return;
    const t = a.currentTime + when;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + d + 0.03);
  }

  function noise(d, vol = 0.1, fc = 1200, when = 0) {
    const a = ctx(); if (!a || muted) return;
    const t = a.currentTime + when;
    const len = Math.floor(a.sampleRate * d);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(); s.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fc;
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t);
  }

  const fx = {
    jump: () => tone(300, 0.18, 'square', 0.09, 420),
    land: () => noise(0.06, 0.05, 300),
    shoot: () => { tone(620, 0.12, 'sawtooth', 0.1, -420); noise(0.07, 0.05, 2200); },
    empty: () => tone(140, 0.08, 'square', 0.07, -40),
    suck: () => noise(0.12, 0.05, 700 + Math.random() * 400),
    gulp: () => { tone(200, 0.18, 'sine', 0.2, 300); tone(500, 0.1, 'sine', 0.1, -200, 0.1); },
    pickup: () => tone(780, 0.07, 'triangle', 0.1, 300),
    coin: () => { tone(988, 0.07, 'square', 0.07); tone(1318, 0.16, 'square', 0.07, 0, 0.06); },
    hit: () => { tone(220, 0.12, 'square', 0.12, -120); noise(0.08, 0.08, 900); },
    pop: () => { tone(420, 0.14, 'triangle', 0.14, -260); noise(0.1, 0.08, 1800); },
    hurt: () => { tone(260, 0.3, 'sawtooth', 0.13, -200); },
    stomp: () => { tone(160, 0.12, 'square', 0.12, 200); noise(0.06, 0.07, 500); },
    switch: () => { tone(520, 0.09, 'square', 0.1); tone(780, 0.14, 'square', 0.1, 0, 0.08); },
    gate: () => { tone(110, 0.5, 'sawtooth', 0.08, 60); noise(0.4, 0.05, 250); },
    crate: () => { noise(0.18, 0.12, 600); tone(150, 0.12, 'square', 0.08, -60); },
    boom: () => { noise(0.5, 0.22, 200); tone(90, 0.5, 'sawtooth', 0.15, -50); },
    check: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.12, 'triangle', 0.1, 0, i * 0.08)); },
    win: () => { [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, 0.22, 'square', 0.09, 0, i * 0.13)); },
    boss: () => { tone(80, 0.9, 'sawtooth', 0.16, -20); tone(85, 0.9, 'square', 0.1, -20); },
    select: () => tone(660, 0.07, 'square', 0.08),
    confirm: () => { tone(520, 0.07, 'square', 0.09); tone(880, 0.12, 'square', 0.09, 0, 0.07); },
    heal: () => { [523, 659, 784, 1046].forEach((q, i) => tone(q, 0.14, 'triangle', 0.12, 0, i * 0.07)); },
    burp: () => { tone(110, 0.35, 'sawtooth', 0.14, -50); tone(90, 0.3, 'square', 0.08, 30, 0.05); },
    super: () => { noise(0.3, 0.2, 400); tone(180, 0.35, 'sawtooth', 0.18, 500); tone(540, 0.25, 'square', 0.1, 300, 0.05); },
    boing: () => { tone(200, 0.4, 'sine', 0.2, 600); tone(300, 0.3, 'triangle', 0.1, 400, 0.05); },
    power: () => { [392, 523, 659, 784, 1046, 1318].forEach((q, i) => tone(q, 0.1, 'square', 0.09, 0, i * 0.06)); },
    splat: () => { noise(0.14, 0.14, 700); tone(180, 0.12, 'sine', 0.12, -90); },
    honk: () => { tone(330, 0.12, 'sawtooth', 0.12); tone(310, 0.2, 'sawtooth', 0.12, 0, 0.1); },
    talk: () => tone(240 + Math.random() * 160, 0.04, 'square', 0.04),
  };

  // ── Musik: pro Welt Tonart, Akkordfolge, Melodie (aus Motiven erzeugt), Bass und Schlagzeug ──
  const SC = { pent: [0, 2, 4, 7, 9], mpent: [0, 3, 5, 7, 10], mixo: [0, 2, 4, 5, 7, 9, 10], hm: [0, 2, 3, 5, 7, 8, 11], major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
  const SONGS = {
    menu:    { bpm: 118, root: 220, sc: 'major', ch: [0, 5, 3, 4], lead: 'square', bass: 'triangle', swing: 0.1, drums: 'pop', fun: 0.25 },
    alley:   { bpm: 126, root: 196, sc: 'pent',  ch: [0, 3, 4, 3], lead: 'square', bass: 'triangle', swing: 0.14, drums: 'pop', fun: 0.3 },
    sewer:   { bpm: 100, root: 165, sc: 'mpent', ch: [0, 0, 3, 4], lead: 'triangle', bass: 'sawtooth', swing: 0.2, drums: 'slow', fun: 0.35 },
    junk:    { bpm: 118, root: 147, sc: 'mixo',  ch: [0, 4, 3, 4], lead: 'square', bass: 'square', swing: 0.18, drums: 'rock', fun: 0.3 },
    factory: { bpm: 138, root: 131, sc: 'minor', ch: [0, 5, 3, 6], lead: 'sawtooth', bass: 'sawtooth', swing: 0.0, drums: 'drive', fun: 0.15 },
    winter:  { bpm: 110, root: 262, sc: 'major', ch: [0, 4, 5, 3], lead: 'triangle', bass: 'triangle', swing: 0.08, drums: 'pop', fun: 0.2, bells: true },
    grave:   { bpm: 96,  root: 139, sc: 'hm',    ch: [0, 3, 4, 0], lead: 'triangle', bass: 'sawtooth', swing: 0.0, drums: 'slow', fun: 0.2, spooky: true },
    boss:    { bpm: 152, root: 110, sc: 'hm',    ch: [0, 5, 4, 3], lead: 'sawtooth', bass: 'sawtooth', swing: 0.0, drums: 'drive', fun: 0.1 },
  };
  const BARS = 8, SPB = 8;   // 8 Takte à 8 Achtel
  const cache = {};
  function degHz(s, deg, oct = 0) { const sc = SC[s.sc], n = sc.length, o = Math.floor(deg / n), d = ((deg % n) + n) % n; return s.root * Math.pow(2, (sc[d] + 12 * (o + oct)) / 12); }
  function build(name) {
    if (cache[name]) return cache[name];
    const s = SONGS[name]; let q = 0; for (const c of name) q = (q * 31 + c.charCodeAt(0)) >>> 0;
    const rnd = () => (q = (q * 1664525 + 1013904223) >>> 0) / 4294967296;
    const motifs = []; for (let m = 0; m < 3; m++) { const rh = [], nt = []; let deg = Math.floor(rnd() * 4); for (let i = 0; i < SPB; i++) { const on = (i % 2 === 0) ? rnd() < 0.75 : rnd() < 0.4; rh.push(on); deg += Math.floor(rnd() * 5) - 2; deg = Math.max(-2, Math.min(7, deg)); nt.push(deg); } motifs.push({ rh, nt }); }
    const steps = [];
    for (let bar = 0; bar < BARS; bar++) {
      const chord = s.ch[bar % s.ch.length], m = motifs[[0, 1, 0, 2, 0, 1, 0, 2][bar]], fill = bar % 4 === 3;
      for (let i = 0; i < SPB; i++) {
        const st = {};
        st.k = (i === 0 || i === 4 || (s.drums === 'drive' && (i === 2 || i === 6)) || (s.drums === 'rock' && i === 3 && bar % 2));
        st.s = (i === 2 || i === 6) && s.drums !== 'drive' || (s.drums === 'drive' && (i === 2 || i === 6));
        if (s.drums === 'slow') { st.k = i === 0 || i === 5; st.s = i === 4; }
        st.h = (s.drums === 'drive' || s.drums === 'pop') ? true : i % 2 === 1;
        if (fill && i >= 6) st.s = true;
        if (i === 0 || i === 3 || i === 4 || i === 7) st.bass = degHz(s, chord + (i === 3 || i === 7 ? 4 : 0), -2);
        if (i % 2 === 1 && !s.spooky) st.chord = [degHz(s, chord, 0), degHz(s, chord + 2, 0), degHz(s, chord + 4, 0)];
        if (s.spooky && i === 0) st.chord = [degHz(s, chord, 0), degHz(s, chord + 2, 0), degHz(s, chord + 4, 0)];
        if (m.rh[i]) { st.lead = degHz(s, m.nt[i] + chord, 1); st.fun = rnd() < s.fun * 0.5; st.len = (i % 2 === 0 && !m.rh[i + 1]) ? 2 : 1; }
        steps.push(st);
      }
    }
    return (cache[name] = { s, steps });
  }
  let sched = null, stepIdx = 0, songName = null;
  function playStep() {
    if (!songName) return;
    const { s, steps } = build(songName), st = steps[stepIdx % steps.length], d = 60 / s.bpm / 2, sw = (stepIdx % 2) ? s.swing * d : 0;
    const w = sw;
    if (st.k) { tone(120, 0.12, 'sine', 0.22, -80, w); noise(0.05, 0.05, 150, w); }
    if (st.s) noise(0.11, 0.1, 1800, w);
    if (st.h) noise(0.03, 0.03, 7000, w);
    if (st.bass) tone(st.bass, d * 1.6, s.bass, 0.11, 0, w);
    if (st.chord) st.chord.forEach(c => tone(c, d * 0.7, 'square', 0.025, 0, w));
    if (st.lead) {
      tone(st.lead, d * 0.95 * (st.len || 1), s.lead, 0.07, st.fun ? 260 : 0, w);
      if (s.bells && stepIdx % 4 === 0) tone(st.lead * 2, 0.5, 'sine', 0.04, 0, w);
      if (s.spooky && stepIdx % 8 === 0) tone(st.lead * 0.5, 0.9, 'sine', 0.05, 0, w);
    }
    if (st.fun && Math.random() < 0.5) tone(st.lead * 1.5, 0.08, 'square', 0.03, -200, w + d * 0.5);
    stepIdx++;
  }

  return {
    play(name) { try { fx[name] && fx[name](); } catch (e) {} },
    music(name) {
      if (songName === name) return;
      songName = name; stepIdx = 0;
      if (sched) clearInterval(sched); sched = null;
      if (!name || !SONGS[name]) { songName = null; return; }
      ctx();
      sched = setInterval(playStep, 60000 / SONGS[name].bpm / 2);
    },
    toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.55; return muted; },
    isMuted() { return muted; },
    unlock() { ctx(); },
  };
})();
