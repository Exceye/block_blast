/* ============================================================
   textures.js — tekstur blok bertahap: fase1.png, fase2.png, ...
   Fase naik mengikuti skor. Tekstur dipasang lewat variabel CSS
   --block-tex, jadi seluruh blok berubah sekaligus.
   Bila file fase tertentu tidak ada, dipakai fase terdekat di bawahnya.
   ============================================================ */
const Textures = {
  loaded: {},       // { 1: true, 2: true, ... }
  current: 0,

  // Memuat semua gambar lebih dulu supaya tidak berkedip saat berganti fase
  preload() {
    const jobs = [];
    for (let n = 1; n <= CONFIG.PHASE.MAX_FILES; n++) {
      jobs.push(new Promise(resolve => {
        const img = new Image();
        img.onload  = () => { this.loaded[n] = true;  resolve(); };
        img.onerror = () => { this.loaded[n] = false; resolve(); };
        img.src = CONFIG.PATHS.texture(n);
      }));
    }
    return Promise.all(jobs);
  },

  // Skor -> nomor fase (1, 2, 3, ...)
  phaseForScore(score) {
    const p = 1 + Math.floor(score / CONFIG.PHASE.SCORE_STEP);
    return Math.min(p, CONFIG.PHASE.MAX_FILES);
  },

  // Cari file terdekat yang benar-benar ada
  urlFor(phase) {
    for (let n = phase; n >= 1; n--) {
      if (this.loaded[n]) {
        // URL absolut: url() relatif di dalam variabel CSS bisa salah rujukan
        return new URL(CONFIG.PATHS.texture(n), document.baseURI).href;
      }
    }
    return null;
  },

  apply(phase) {
    this.current = phase;
    const url = this.urlFor(phase);
    const root = document.documentElement;
    root.style.setProperty('--block-tex', url ? `url("${url}")` : 'none');
    document.body.dataset.phase = phase;
    document.body.classList.toggle('no-tex', !url);
  }
};
