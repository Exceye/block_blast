/* ============================================================
   generator.js — membagikan 3 blok sesuai mode kesulitan.

   Prinsip: game tidak boleh terasa curang. Untuk setiap set 3 blok
   kita jalankan "solver" kecil yang memastikan ketiganya MASIH BISA
   diletakkan berurutan (dengan memperhitungkan baris yang terhapus).

   Solver mengembalikan TIGA status yang berbeda:
     'solved'     : ada urutan penempatan yang berhasil (terbukti)
     'unsolvable' : seluruh kemungkinan sudah dicoba, tidak ada solusi
     'limit'      : pencarian berhenti karena SOLVER_NODE_LIMIT -> TIDAK TAHU

   Hasil generateRound() adalah array 3 blok dengan properti `meta`:
     meta.solvable : true hanya jika sudah DIBUKTIKAN solvable
     meta.reason   : 'solved' | 'relaxed' | 'verified-after-limit' |
                     'safe-fallback' | 'unsolved-limit' | 'unsolved-exhausted'
     meta.mode     : mode yang benar-benar dipakai (bisa lebih ringan
                     dari yang diminta bila mode asal tak menemukan set adil)
   ============================================================ */
const Generator = {

  /** @returns {{shape:Object,color:number}[]} dengan properti .meta */
  generateRound(board, mode) {
    const G = CONFIG.GENERATOR;
    const filled = board.filledCount();

    // Mode mudah: bila papan hampir kosong, cari blok penyelesai (full clear)
    let finisher = null;
    if (mode === 'eased' && filled > 0 && filled <= G.FINISHER_MAX_FILLED) {
      finisher = this._findFinisher(board);
    }

    const ctx = { finisher, fit: null, limited: [], sawLimit: false };

    // Tangga mode: coba mode diminta dulu, lalu yang lebih ringan
    const ladder = { pressure: ['pressure', 'normal', 'eased'], normal: ['normal', 'eased'], eased: ['eased'] }[mode] || ['normal'];
    for (let li = 0; li < ladder.length; li++) {
      const m = ladder[li];
      const found = this._search(board, m, li === 0 ? G.MAX_TRIES : G.RELAX_TRIES, ctx);
      if (found) return this._wrap(found, { solvable: true, reason: li === 0 ? 'solved' : 'relaxed', mode: m });
    }

    // Kandidat yang tadi berhenti karena batas -> verifikasi dengan anggaran lebih besar
    for (const cand of ctx.limited.slice(0, 5)) {
      const status = this._solve(board, cand, G.VERIFY_NODE_LIMIT);
      if (status === 'solved') {
        return this._wrap(cand, { solvable: true, reason: 'verified-after-limit', mode });
      }
      if (status === 'limit') ctx.sawLimit = true;
    }

    // Jaring pengaman: set bentuk kecil yang diverifikasi
    for (let t = 0; t < G.SAFE_TRIES; t++) {
      const cand = [];
      while (cand.length < CONFIG.PIECES_PER_ROUND) {
        cand.push(this._rand(Math.random() < 0.3 ? SHAPES.mercy : SHAPES.easy));
      }
      const status = this._solve(board, cand, G.VERIFY_NODE_LIMIT);
      if (status === 'solved') return this._wrap(cand, { solvable: true, reason: 'safe-fallback', mode: 'eased' });
      if (status === 'limit') ctx.sawLimit = true;
    }

    // Tidak terbukti ada set yang adil. Jujur ditandai; pakai set yang minimal satu bloknya muat.
    let shapes = ctx.fit;
    if (!shapes) {
      shapes = [];
      while (shapes.length < CONFIG.PIECES_PER_ROUND) shapes.push(this._rand(SHAPES.easy));
    }
    return this._wrap(shapes, {
      solvable: false,
      reason: ctx.sawLimit ? 'unsolved-limit' : 'unsolved-exhausted',
      mode
    });
  },

  /* ---------- satu putaran percobaan untuk satu mode ---------- */
  _search(board, mode, tries, ctx) {
    const G = CONFIG.GENERATOR;
    const filled = board.filledCount();
    const count = CONFIG.PIECES_PER_ROUND;

    for (let t = 0; t < tries; t++) {
      const shapes = [];
      if (mode === 'eased' && ctx.finisher) shapes.push(ctx.finisher);
      while (shapes.length < count) shapes.push(this._pickShape(mode));
      this._shuffle(shapes);

      if (!ctx.fit && shapes.some(s => board.canFit(s))) ctx.fit = shapes;

      // mode mudah: di 60% percobaan pertama, wajib ada blok yang bisa menghapus baris
      if (mode === 'eased' && !ctx.finisher && filled >= 6 && t < tries * 0.6) {
        if (!shapes.some(s => this._bestLines(board, s) > 0)) continue;
      }

      const status = this._solve(board, shapes, G.SOLVER_NODE_LIMIT);
      if (status === 'solved') return shapes;
      if (status === 'limit') { ctx.sawLimit = true; ctx.limited.push(shapes); }
    }
    return null;
  },

  /* ---------- pemilihan bentuk ---------- */
  _pickShape(mode) {
    const weights = CONFIG.WEIGHTS[mode];
    let total = 0;
    for (const k in weights) total += weights[k];
    let roll = Math.random() * total;
    for (const tier in weights) {
      roll -= weights[tier];
      if (roll < 0 && weights[tier] > 0) return this._rand(SHAPES[tier]);
    }
    return this._rand(SHAPES.normal);
  },

  _wrap(shapes, meta) {
    const pieces = shapes.map(shape => ({
      shape,
      color: Math.floor(Math.random() * CONFIG.COLORS.length)
    }));
    pieces.meta = meta;
    return pieces;
  },

  /* ---------- solver: apakah semua blok bisa diletakkan berurutan? ---------- */
  /** @returns {'solved'|'unsolvable'|'limit'} */
  _solve(board, shapes, limit) {
    const st = { nodes: 0, limit, hitLimit: false };
    if (this._dfs(board, shapes, st)) return 'solved';
    return st.hitLimit ? 'limit' : 'unsolvable';
  },

  _dfs(board, shapes, st) {
    if (shapes.length === 0) return true;
    const tried = new Set();
    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
      if (tried.has(s.id)) continue;       // bentuk sama tak perlu dicoba ulang
      tried.add(s.id);
      const rest = shapes.filter((_, j) => j !== i);

      for (const [r, c] of board.positions(s)) {
        if (++st.nodes > st.limit) { st.hitLimit = true; return false; }
        const next = board.clone();
        next.place(s, r, c, 0);
        next.clearLines(next.findFullLines());
        if (this._dfs(next, rest, st)) return true;
        if (st.hitLimit) return false;     // sudah kehabisan anggaran: hentikan semua cabang
      }
    }
    return false;
  },

  /* ---------- bantuan mode mudah ---------- */
  // Berapa baris/kolom paling banyak yang bisa dihapus bentuk ini?
  _bestLines(board, shape) {
    let best = 0;
    for (const [r, c] of board.positions(shape)) {
      const b = board.clone();
      b.place(shape, r, c, 0);
      best = Math.max(best, b.findFullLines().count);
    }
    return best;
  },

  // Cari bentuk yang sekali taruh mengosongkan papan sepenuhnya.
  _findFinisher(board) {
    for (const shape of this._shuffle([...ALL_SHAPES])) {
      for (const [r, c] of board.positions(shape)) {
        const b = board.clone();
        b.place(shape, r, c, 0);
        b.clearLines(b.findFullLines());
        if (b.isEmpty()) return shape;
      }
    }
    return null;
  },

  /* ---------- util ---------- */
  _rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
