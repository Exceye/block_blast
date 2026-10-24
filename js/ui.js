/* ============================================================
   ui.js — semua yang menyentuh DOM: menggambar papan & tray,
   drag-and-drop (mouse + sentuh), pratinjau, efek, toast, overlay.
   Tidak ada aturan game di sini; UI hanya memanggil Game.place().
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const MODE_LABEL = { normal: 'NORMAL', eased: 'DIPERMUDAH', pressure: 'TEKANAN' };

const UI = {
  game: null,
  cells: [],          // 64 elemen sel papan
  drag: null,         // status drag yang sedang berjalan
  preview: [],        // sel yang sedang diberi tanda pratinjau
  toastTimer: null,

  init(game) {
    this.game = game;
    this.el = {
      board: $('#board'), tray: $('#tray'), fx: $('#fx'), layer: $('#drag-layer'),
      score: $('#score'), best: $('#best'), phase: $('#phase'),
      badge: $('#mode-badge'), dots: $('#clear-dots'), toast: $('#toast'),
      overlay: $('#overlay'), finalScore: $('#final-score'), finalBest: $('#final-best'),
      mute: $('#btn-mute')
    };

    this._buildBoard();

    $('#btn-restart').onclick = () => game.newGame();
    $('#btn-again').onclick   = () => game.newGame();
    this.el.mute.onclick = () => {
      this.el.mute.textContent = SFX.toggle() ? '🔊' : '🔇';
    };

    // handler drag dibuat sekali agar bisa di-removeEventListener
    this._onMove = (e) => this._move(e);
    this._onUp   = (e) => this._end(e, false);
    this._onCancel = (e) => this._end(e, true);
  },

  /* ================= papan ================= */
  _buildBoard() {
    const n = CONFIG.BOARD_SIZE;
    this.el.board.innerHTML = '';
    this.cells = [];
    for (let i = 0; i < n * n; i++) {
      const d = document.createElement('div');
      d.className = 'cell';
      this.el.board.appendChild(d);
      this.cells.push(d);
    }
  },

  renderBoard(board) {
    for (let i = 0; i < this.cells.length; i++) {
      const v = board.cells[i];
      const el = this.cells[i];
      el.classList.remove('clearing', 'ghost', 'will-clear');
      if (v >= 0) {
        el.classList.add('filled');
        el.style.setProperty('--c', CONFIG.COLORS[v]);
      } else {
        el.classList.remove('filled');
        el.style.removeProperty('--c');
      }
    }
  },

  /* ================= tray ================= */
  renderTray(tray) {
    this.el.tray.innerHTML = '';
    tray.forEach((piece, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot';
      if (piece) {
        const el = this._buildPiece(piece, 'piece');
        el.addEventListener('pointerdown', (e) => this._start(e, i, el));
        slot.appendChild(el);
      }
      this.el.tray.appendChild(slot);
    });
  },

  _buildPiece(piece, cls) {
    const { w, h, cells } = piece.shape;
    const el = document.createElement('div');
    el.className = cls;
    el.style.gridTemplateColumns = `repeat(${w}, var(--pc))`;
    el.style.gridTemplateRows = `repeat(${h}, var(--pc))`;
    const filled = new Set(cells.map(([r, c]) => r * 100 + c));
    for (let r = 0; r < h; r++) {
      for (let c = 0; c < w; c++) {
        const d = document.createElement('div');
        d.className = 'pc';
        if (filled.has(r * 100 + c)) {
          d.classList.add('filled');
          d.style.setProperty('--c', CONFIG.COLORS[piece.color]);
        } else {
          d.classList.add('off');
        }
        el.appendChild(d);
      }
    }
    return el;
  },

  /* ================= drag & drop ================= */
  _start(e, idx, pieceEl) {
    const g = this.game;
    if (g.locked || g.over || this.drag || !g.tray[idx]) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();

    const piece = g.tray[idx];
    // ukuran & posisi sel papan diukur saat drag mulai (aman saat layar di-resize)
    const r0 = this.cells[0].getBoundingClientRect();
    const r1 = this.cells[1].getBoundingClientRect();
    const step = r1.left - r0.left;           // lebar sel + jarak
    const gap = step - r0.width;

    const el = this._buildPiece(piece, 'drag-piece');
    this.el.layer.appendChild(el);
    pieceEl.classList.add('dragging');

    this.drag = {
      idx, piece, el, pieceEl, step,
      origin: { x: r0.left, y: r0.top },
      w: piece.shape.w * step - gap,
      h: piece.shape.h * step - gap,
      lift: e.pointerType === 'mouse' ? 0 : step * 2.2,   // jari tidak menutupi blok
      r: -99, c: -99, last: null
    };

    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
    window.addEventListener('pointercancel', this._onCancel);
    this._move(e);
  },

  _move(e) {
    const d = this.drag;
    if (!d) return;
    const left = e.clientX - d.w / 2;
    const top = e.clientY - d.h / 2 - d.lift;
    d.el.style.transform = `translate(${left}px, ${top}px)`;

    // sel papan yang paling dekat dengan pojok kiri-atas blok
    const c = Math.round((left - d.origin.x) / d.step);
    const r = Math.round((top - d.origin.y) / d.step);
    d.r = r; d.c = c;
    if (!d.last || d.last[0] !== r || d.last[1] !== c) {
      d.last = [r, c];
      this._showPreview(d.piece, r, c);
    }
  },

  _end(e, cancelled) {
    const d = this._teardownDrag();
    if (!d) return;

    // piece harus masih blok yang sama di tray (bukan hasil bagi ulang / restart)
    if (!cancelled && this.game.tray[d.idx] === d.piece &&
        this.game.board.canPlace(d.piece.shape, d.r, d.c)) {
      this.game.place(d.idx, d.r, d.c);
    }
  },

  /** Batalkan drag yang sedang berjalan tanpa meletakkan apa pun (dipakai saat restart). */
  cancelDrag() {
    this._teardownDrag();
  },

  _teardownDrag() {
    const d = this.drag;
    if (!d) return null;
    window.removeEventListener('pointermove', this._onMove);
    window.removeEventListener('pointerup', this._onUp);
    window.removeEventListener('pointercancel', this._onCancel);
    this._clearPreview();
    d.el.remove();
    d.pieceEl.classList.remove('dragging');
    this.drag = null;
    return d;
  },

  /* ================= pratinjau ================= */
  _showPreview(piece, r, c) {
    this._clearPreview();
    const board = this.game.board;
    if (!board.canPlace(piece.shape, r, c)) return;

    const color = CONFIG.COLORS[piece.color];
    for (const [dr, dc] of piece.shape.cells) {
      const el = this.cells[board.idx(r + dr, c + dc)];
      el.classList.add('ghost');
      el.style.setProperty('--g', color);
      this.preview.push(el);
    }

    // sorot baris/kolom yang akan terhapus bila blok dilepas di sini
    const sim = board.clone();
    sim.place(piece.shape, r, c, 0);
    const lines = sim.findFullLines();
    if (lines.count > 0) {
      for (const i of sim.cellsOfLines(lines)) {
        this.cells[i].classList.add('will-clear');
        this.preview.push(this.cells[i]);
      }
    }
  },

  _clearPreview() {
    for (const el of this.preview) {
      el.classList.remove('ghost', 'will-clear');
      el.style.removeProperty('--g');
    }
    this.preview = [];
  },

  /* ================= efek ================= */
  /** Animasi sel yang terhapus; Promise selesai saat animasi usai. */
  animateClear(board, lines) {
    const list = board.cellsOfLines(lines);
    for (const i of list) {
      this.cells[i].classList.add('clearing');
      this._burst(i, board.cells[i]);
    }
    return new Promise(res => setTimeout(res, CONFIG.TIMING.CLEAR_ANIM_MS));
  },

  _burst(cellIndex, colorIdx) {
    const wrap = this.el.fx.getBoundingClientRect();
    const r = this.cells[cellIndex].getBoundingClientRect();
    const cx = r.left - wrap.left + r.width / 2;
    const cy = r.top - wrap.top + r.height / 2;
    const color = CONFIG.COLORS[colorIdx] || '#fff';
    for (let k = 0; k < 4; k++) {
      const p = document.createElement('i');
      p.className = 'particle';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = color;
      this.el.fx.appendChild(p);
      const ang = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 40;
      const anim = p.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(ang) * dist - 4}px, ${Math.sin(ang) * dist - 4}px) scale(0)`, opacity: 0 }
      ], { duration: 450 + Math.random() * 200, easing: 'ease-out' });
      anim.onfinish = () => p.remove();
    }
  },

  popup(text, kind = '') {
    const p = document.createElement('div');
    p.className = 'popup ' + kind;
    p.textContent = text;
    this.el.fx.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  },

  toast(text, ms = 1800) {
    const t = this.el.toast;
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  },

  /* ================= HUD ================= */
  updateScore(score, best) {
    this.el.score.textContent = score;
    this.el.best.textContent = best;
  },

  setPhase(n) { this.el.phase.textContent = n; },

  setMode(mode, allClears, pressure) {
    this.el.badge.textContent = MODE_LABEL[mode];
    this.el.badge.className = 'badge ' + mode;
    document.body.dataset.mode = mode;
    [...this.el.dots.children].forEach((dot, i) => dot.classList.toggle('on', pressure || i < allClears));
    this.el.dots.classList.toggle('hot', pressure);
  },

  showGameOver(score, best) {
    this.el.finalScore.textContent = score;
    this.el.finalBest.textContent = 'Terbaik: ' + best;
    this.el.overlay.classList.remove('hidden');
  },

  hideGameOver() { this.el.overlay.classList.add('hidden'); }
};
