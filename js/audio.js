/* ============================================================
   audio.js — efek suara place.mp3, clear.mp3, allclear.mp3.
   Jika file tidak ditemukan, otomatis memakai bunyi "bip" sintetis
   (Web Audio) agar game tetap bersuara.
   ============================================================ */
const SFX = {
  enabled: true,
  sounds: {},
  failed: {},
  ctx: null,

  init() {
    for (const [name, src] of Object.entries(CONFIG.PATHS.sounds)) {
      const a = new Audio(src);
      a.preload = 'auto';
      a.addEventListener('error', () => { this.failed[name] = true; });
      this.sounds[name] = a;
    }
  },

  play(name) {
    if (!this.enabled) return;
    const base = this.sounds[name];
    if (base && !this.failed[name]) {
      // cloneNode agar suara bisa tumpang tindih (mis. place + clear)
      const a = base.cloneNode();
      a.volume = name === 'place' ? 0.6 : 0.9;
      a.play().catch(() => this._beep(name));
    } else {
      this._beep(name);
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  /* ---------- cadangan: bunyi sintetis ---------- */
  _beep(name) {
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const seqs = {
        place:    [[300, 0.08]],
        clear:    [[520, 0.09], [660, 0.09], [780, 0.12]],
        allclear: [[520, 0.1], [660, 0.1], [780, 0.1], [1040, 0.1], [1320, 0.25]]
      };
      let t = this.ctx.currentTime;
      for (const [freq, dur] of seqs[name] || []) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(this.ctx.destination);
        o.start(t); o.stop(t + dur);
        t += dur;
      }
    } catch (e) { /* abaikan */ }
  }
};
