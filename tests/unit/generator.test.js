const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCore, exhaustivelySolvable } = require('../helpers/load');

const MODES = ['normal', 'eased', 'pressure'];
const shapesOf = (round) => round.map(p => p.shape);
const avgSize = (rounds) => rounds.flat().reduce((a, p) => a + p.shape.size, 0) / rounds.flat().length;

test('papan kosong: tiap mode membagikan 3 blok yang TERBUKTI bisa diselesaikan', () => {
  const { Board, Generator } = loadCore();
  for (const mode of MODES) {
    for (let i = 0; i < 30; i++) {
      const board = new Board();
      const round = Generator.generateRound(board, mode);
      assert.equal(round.length, 3);
      assert.equal(round.meta.solvable, true, `${mode}: ${round.meta.reason}`);
      assert.equal(round.meta.reason, 'solved');
      assert.equal(round.meta.mode, mode);
      assert.ok(exhaustivelySolvable(board, shapesOf(round)), `${mode}: verifier independen menolak`);
      round.forEach(p => assert.ok(p.color >= 0 && p.color < 7));
    }
  }
});

test('papan hampir penuh (lubang 3x3 + 1 sel): klaim solvable benar menurut verifier independen', () => {
  const { Board, Generator } = loadCore();
  const board = new Board();
  board.cells.fill(1);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) board.cells[board.idx(r, c)] = -1;
  board.cells[board.idx(7, 7)] = -1;
  for (const mode of MODES) {
    for (let i = 0; i < 20; i++) {
      const round = Generator.generateRound(board, mode);
      assert.equal(round.length, 3);
      if (round.meta.solvable) {
        assert.ok(exhaustivelySolvable(board, shapesOf(round)), `${mode}/${round.meta.reason}: klaim solvable palsu`);
      }
    }
  }
  // Untuk papan ini memang ada solusi (mis. dot/dot/dot), jadi generator harus menemukannya
  const r = Generator.generateRound(board, 'pressure');
  assert.equal(r.meta.solvable, true, r.meta.reason);
});

test('papan benar-benar penuh: tidak ada solusi -> ditandai solvable=false (exhausted), bukan solved palsu', () => {
  const { Board, Generator } = loadCore();
  const board = new Board();
  board.cells.fill(1);
  const round = Generator.generateRound(board, 'normal');
  assert.equal(round.length, 3);
  assert.equal(round.meta.solvable, false);
  assert.equal(round.meta.reason, 'unsolved-exhausted');
  assert.equal(exhaustivelySolvable(board, shapesOf(round)), false);
});

test('solver membedakan solved / unsolvable / limit', () => {
  const { Board, Generator, SHAPES } = loadCore();
  const empty = new Board();
  const trio = [SHAPES.easy[0], SHAPES.easy[1], SHAPES.normal[0]];
  assert.equal(Generator._solve(empty, trio, 10000), 'solved');

  const full = new Board(); full.cells.fill(1);
  assert.equal(Generator._solve(full, trio, 10000), 'unsolvable');

  // anggaran 0 = berhenti sebelum sempat menyimpulkan apa pun
  const status = Generator._solve(empty, trio, 0);
  assert.equal(status, 'limit');
  assert.notEqual(status, 'unsolvable', 'limit TIDAK boleh dianggap tidak ada solusi');
});

test('solver kehabisan anggaran: fallback memverifikasi dengan anggaran besar, hasil tetap terbukti', () => {
  const { CONFIG, Board, Generator } = loadCore();
  CONFIG.GENERATOR.SOLVER_NODE_LIMIT = 0;     // semua percobaan cepat berakhir 'limit'
  const board = new Board();
  const round = Generator.generateRound(board, 'normal');
  assert.equal(round.meta.solvable, true);
  assert.equal(round.meta.reason, 'verified-after-limit');
  assert.ok(exhaustivelySolvable(board, shapesOf(round)));
});

test('anggaran verifikasi pun habis: jujur ditandai unsolved-limit (bukan unsolved-exhausted)', () => {
  const { CONFIG, Board, Generator } = loadCore();
  CONFIG.GENERATOR.SOLVER_NODE_LIMIT = 0;
  CONFIG.GENERATOR.VERIFY_NODE_LIMIT = 0;
  const round = Generator.generateRound(new Board(), 'pressure');
  assert.equal(round.length, 3);
  assert.equal(round.meta.solvable, false);
  assert.equal(round.meta.reason, 'unsolved-limit');
});

test('properti: pada papan acak, setiap klaim solvable=true lolos verifier independen', () => {
  const { Board, Generator } = loadCore();
  let claimed = 0, unproven = 0;
  for (const mode of MODES) {
    for (let k = 0; k < 60; k++) {
      const board = new Board();
      const target = 30 + Math.floor(Math.random() * 28);          // 30..57 sel terisi
      while (board.filledCount() < target) board.cells[Math.floor(Math.random() * 64)] = 2;
      board.clearLines(board.findFullLines());
      const round = Generator.generateRound(board, mode);
      assert.equal(round.length, 3);
      assert.ok(round.meta && typeof round.meta.solvable === 'boolean');
      if (round.meta.solvable) {
        claimed++;
        assert.ok(exhaustivelySolvable(board, shapesOf(round)),
          `klaim palsu: ${mode}/${round.meta.reason}`);
      } else unproven++;
    }
  }
  assert.ok(claimed > 0);
  console.log(`# properti: ${claimed} klaim solvable terverifikasi, ${unproven} set ditandai tidak terbukti`);
});

test('mode memengaruhi bentuk: tekanan > normal > dipermudah (rata-rata ukuran blok, papan kosong)', () => {
  const { Board, Generator } = loadCore();
  const sample = (mode) => Array.from({ length: 250 }, () => Generator.generateRound(new Board(), mode));
  const eased = avgSize(sample('eased'));
  const normal = avgSize(sample('normal'));
  const pressure = avgSize(sample('pressure'));
  console.log(`# rata-rata ukuran: eased=${eased.toFixed(2)} normal=${normal.toFixed(2)} pressure=${pressure.toFixed(2)}`);
  assert.ok(eased < normal, 'dipermudah harus lebih kecil dari normal');
  assert.ok(normal < pressure, 'tekanan harus lebih besar dari normal');
});

test('mode dipermudah: papan hampir kosong -> ada blok penyelesai yang sekali taruh mengosongkan papan', () => {
  const { Board, Generator } = loadCore();
  const board = new Board();
  for (let c = 0; c < 7; c++) board.cells[board.idx(0, c)] = 1;     // tinggal 1 sel kosong di baris 0
  for (let i = 0; i < 15; i++) {
    const round = Generator.generateRound(board, 'eased');
    const finishes = round.some(p => {
      for (const [r, c] of board.positions(p.shape)) {
        const b = board.clone(); b.place(p.shape, r, c, 0); b.clearLines(b.findFullLines());
        if (b.isEmpty()) return true;
      }
      return false;
    });
    assert.ok(finishes, 'harus ada blok yang membuat full clear');
  }
});
