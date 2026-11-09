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
    talk: () => tone(240 + Math.random() * 160, 0.04, 'square', 0.04),
  };

  // Musik: Basslinie + Arpeggio je Welt, ganz einfach
  const SONGS = {
    menu:    { bpm: 104, bass: [0, 0, 7, 7, 5, 5, 7, 7], arp: [0, 4, 7, 12], root: 55, wave: 'triangle', lead: 'square' },
    alley:   { bpm: 118, bass: [0, 0, 5, 5, 7, 7, 3, 3], arp: [0, 3, 7, 10], root: 55, wave: 'triangle', lead: 'square' },
    sewer:   { bpm: 96,  bass: [0, 0, 0, 3, 5, 5, 3, 3], arp: [0, 3, 6, 9],  root: 49, wave: 'sawtooth', lead: 'triangle' },
    junk:    { bpm: 126, bass: [0, 7, 0, 7, 5, 12, 5, 12], arp: [0, 7, 12, 7], root: 52, wave: 'square', lead: 'square' },
    factory: { bpm: 132, bass: [0, 0, 3, 0, 5, 5, 7, 6], arp: [0, 3, 7, 3],  root: 46, wave: 'sawtooth', lead: 'square' },
    winter:  { bpm: 112, bass: [0, 0, 7, 7, 3, 3, 5, 5], arp: [0, 7, 12, 7],  root: 58, wave: 'triangle', lead: 'triangle' },
    grave:   { bpm: 92,  bass: [0, 0, 1, 1, 0, 0, 6, 6], arp: [0, 3, 6, 3],  root: 44, wave: 'sawtooth', lead: 'triangle' },
    boss:    { bpm: 150, bass: [0, 0, 1, 0, 0, 0, 3, 1], arp: [0, 1, 7, 6],  root: 41, wave: 'sawtooth', lead: 'square' },
  };
  const hz = (root, semis) => root * Math.pow(2, semis / 12);

  function tick() {
    if (!song) return;
    const s = SONGS[song];
    const b = s.bass[Math.floor(step / 2) % s.bass.length];
    if (step % 2 === 0) tone(hz(s.root, b), 0.26, s.wave, 0.1);
    const a = s.arp[step % s.arp.length];
    tone(hz(s.root * 4, b + a), 0.12, s.lead, 0.03);
    if (step % 4 === 2) noise(0.04, 0.03, 5000);
    step++;
  }

  return {
    play(name) { try { fx[name] && fx[name](); } catch (e) {} },
    music(name) {
      if (song === name) return;
      song = name; step = 0;
      if (timer) clearInterval(timer);
      timer = null;
      if (!name) return;
      ctx();
      const ms = 60000 / SONGS[name].bpm / 2;
      timer = setInterval(tick, ms);
    },
    toggleMute() { muted = !muted; if (master) master.gain.value = muted ? 0 : 0.55; return muted; },
    isMuted() { return muted; },
    unlock() { ctx(); },
  };
})();
