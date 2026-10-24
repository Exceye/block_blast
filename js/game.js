/* ============================================================
   game.js — alur permainan: meletakkan blok, skor, combo, full clear,
   pergantian ronde, ganti fase, dan game over.
   ============================================================ */
const Game = {
  board: new Board(),
  tray: [],           // 3 blok (null bila sudah dipakai)
  score: 0,
  best: 0,
  combo: 0,           // clear beruntun (reset jika menaruh tanpa clear)
  phase: 1,
  locked: false,      // true saat animasi berjalan
  over: false,
  session: 0,         // token sesi: naik tiap newGame(); operasi async lama jadi basi
  gameOverTimer: null,

  async start() {
    SFX.init();
    await Textures.preload();
    this.best = this._loadBest();
    UI.init(this);
    this.newGame();
  },

  newGame() {
    // Batalkan semua yang masih tertunda dari sesi lama:
    this.session++;                          // place() lama akan berhenti setelah await
    clearTimeout(this.gameOverTimer);        // overlay Game Over lama tidak boleh muncul
    this.gameOverTimer = null;
    UI.cancelDrag();                         // blok yang sedang diseret dibatalkan

    this.board.reset();
    Difficulty.reset();
    this.score = 0;
    this.combo = 0;
    this.over = false;
    this.locked = false;
    this.phase = Textures.phaseForScore(0);
    Textures.apply(this.phase);

    UI.hideGameOver();
    UI.renderBoard(this.board);
    UI.updateScore(this.score, this.best);
    UI.setPhase(this.phase);
    this._dealRound();
  },

  /* ---------- bagi 3 blok baru ---------- */
  _dealRound() {
    Difficulty.onRoundDealt();
    const mode = Difficulty.getMode();
    this.tray = Generator.generateRound(this.board, mode);
    UI.renderTray(this.tray);
    this._refreshMode();
    if (mode === 'eased' && Difficulty.roundsSinceClear === CONFIG.DIFFICULTY.EASE_AFTER_ROUNDS) {
      UI.toast('Santai… blok dipermudah 😌');
    }
  },

  _refreshMode() {
    UI.setMode(Difficulty.getMode(), Difficulty.allClears, Difficulty.pressure);
  },

  /* ---------- meletakkan blok ---------- */
  async place(idx, r, c) {
    if (this.locked || this.over) return false;
    const piece = this.tray[idx];
    if (!piece || !this.board.canPlace(piece.shape, r, c)) return false;

    this.locked = true;
    const token = this.session;              // sesi saat blok ini diletakkan
    this.board.place(piece.shape, r, c, piece.color);
    this.tray[idx] = null;
    SFX.play('place');

    let gain = piece.shape.size * CONFIG.SCORE.PER_CELL;
    UI.renderBoard(this.board);
    UI.renderTray(this.tray);

    const lines = this.board.findFullLines();
    if (lines.count > 0) {
      this.combo++;

      // apakah setelah dihapus papan jadi kosong? (full clear)
      const after = this.board.clone();
      after.clearLines(lines);
      const isAllClear = after.isEmpty();

      SFX.play(isAllClear ? 'allclear' : 'clear');
      await UI.animateClear(this.board, lines);

      // Jika selama animasi pemain menekan restart, sesi ini sudah basi:
      // jangan menyentuh papan, skor, atau status kesulitan sesi baru.
      if (token !== this.session) return false;

      this.board.clearLines(lines);
      UI.renderBoard(this.board);

      const lineScore = this._lineScore(lines.count);
      gain += lineScore;
      UI.popup(`+${lineScore}` + (this.combo > 1 ? `  COMBO x${this.combo}` : ''), 'clear');

      if (isAllClear) {
        gain += CONFIG.SCORE.ALL_CLEAR_BONUS;
        this._handleAllClear();
      }
    } else {
      this.combo = 0;
    }

    this._addScore(gain);

    if (this.tray.every(p => p === null)) this._dealRound();
    this._refreshMode();

    // game over bila tidak ada satu pun blok yang muat
    const stuck = !this.tray.some(p => p && this.board.canFit(p.shape));
    if (stuck) this._gameOver();

    this.locked = false;
    return true;
  },

  // 1 baris = 10, 2 = 40, 3 = 90 ... lalu dikali bonus combo
  _lineScore(n) {
    const S = CONFIG.SCORE;
    const base = S.LINE_BASE * n * n;
    return Math.round(base * (1 + S.COMBO_STEP * (this.combo - 1)));
  },

  _handleAllClear() {
    UI.popup(`FULL CLEAR! +${CONFIG.SCORE.ALL_CLEAR_BONUS}`, 'allclear');
    const event = Difficulty.onAllClear();
    if (event === 'pressure-start') {
      UI.toast('🔥 MODE TEKANAN! Blok makin sulit sampai kamu full clear lagi', 3200);
    } else if (event === 'pressure-end') {
      UI.toast('✅ Tekanan selesai! Siklus dimulai dari awal', 3200);
    } else {
      UI.toast(`✨ Full clear ${Difficulty.allClears}/${CONFIG.DIFFICULTY.ALL_CLEARS_FOR_PRESSURE}`, 2200);
    }
  },

  /* ---------- skor & fase ---------- */
  _addScore(gain) {
    this.score += gain;
    if (this.score > this.best) {
      this.best = this.score;
      this._saveBest();
    }
    UI.updateScore(this.score, this.best);

    const p = Textures.phaseForScore(this.score);
    if (p !== this.phase) {
      this.phase = p;
      Textures.apply(p);
      UI.setPhase(p);
      UI.toast(`🎨 FASE ${p}! Tekstur blok berubah`, 2200);
    }
  },

  _gameOver() {
    this.over = true;
    this._saveBest();
    const token = this.session;
    clearTimeout(this.gameOverTimer);
    this.gameOverTimer = setTimeout(() => {
      this.gameOverTimer = null;
      // validasi: harus masih sesi yang sama dan masih berstatus game over
      if (token !== this.session || !this.over) return;
      UI.showGameOver(this.score, this.best);
    }, 500);
  },

  /* ---------- penyimpanan skor terbaik ---------- */
  _loadBest() {
    try { return parseInt(localStorage.getItem(CONFIG.STORAGE_KEY), 10) || 0; }
    catch (e) { return 0; }
  },
  _saveBest() {
    try { localStorage.setItem(CONFIG.STORAGE_KEY, String(this.best)); }
    catch (e) { /* mode privat: abaikan */ }
  }
};
