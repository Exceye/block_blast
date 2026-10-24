const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load');

const { CONFIG, SHAPES, ALL_SHAPES, Board } = loadCore();
const shape = (id) => ALL_SHAPES.find(s => s.id === id);

test('papan 8x8: 64 sel, semua kosong', () => {
  const b = new Board();
  assert.equal(CONFIG.BOARD_SIZE, 8);
  assert.equal(b.n, 8);
  assert.equal(b.cells.length, 64);
  assert.ok(b.isEmpty());
  assert.equal(b.filledCount(), 0);
});

test('penempatan blok: sel terisi dengan warna, tidak boleh menimpa', () => {
  const b = new Board();
  const o2 = shape('o2-0');
  assert.ok(b.canPlace(o2, 3, 3));
  b.place(o2, 3, 3, 5);
  assert.equal(b.filledCount(), 4);
  assert.equal(b.get(3, 3), 5);
  assert.equal(b.get(4, 4), 5);
  assert.equal(b.canPlace(o2, 4, 4), false, 'tumpang tindih ditolak');
  assert.equal(b.canPlace(shape('dot-0'), 3, 3), false);
  assert.ok(b.canPlace(shape('dot-0'), 5, 5));
});

test('batas papan: di luar tepi ditolak, tepat di tepi diterima', () => {
  const b = new Board();
  const o2 = shape('o2-0');
  assert.equal(b.canPlace(o2, -1, 0), false);
  assert.equal(b.canPlace(o2, 0, -1), false);
  assert.equal(b.canPlace(o2, 7, 0), false, 'tinggi 2 di baris 7 keluar papan');
  assert.equal(b.canPlace(o2, 0, 7), false, 'lebar 2 di kolom 7 keluar papan');
  assert.ok(b.canPlace(o2, 6, 6), 'pojok kanan-bawah tepat muat');
  const i5h = SHAPES.hard.find(s => s.w === 5 && s.h === 1);
  assert.ok(b.canPlace(i5h, 0, 3));
  assert.equal(b.canPlace(i5h, 0, 4), false);
});

test('positions() hanya memberi posisi sah', () => {
  const b = new Board();
  const o3 = shape('o3-0');
  assert.equal([...b.positions(o3)].length, 36);          // 6 x 6 posisi di papan kosong
  b.place(shape('dot-0'), 4, 4, 0);
  const all = [...b.positions(o3)];
  assert.ok(all.every(([r, c]) => b.canPlace(o3, r, c)));
  assert.ok(all.length < 36);
});

test('hapus baris penuh', () => {
  const b = new Board();
  for (let c = 0; c < 8; c++) b.cells[b.idx(2, c)] = 1;
  const lines = b.findFullLines();
  assert.deepEqual(JSON.parse(JSON.stringify(lines)), { rows: [2], cols: [], count: 1 });
  assert.equal(b.clearLines(lines), 8);
  assert.ok(b.isEmpty());
});

test('hapus kolom penuh', () => {
  const b = new Board();
  for (let r = 0; r < 8; r++) b.cells[b.idx(r, 5)] = 1;
  const lines = b.findFullLines();
  assert.equal(lines.cols[0], 5);
  assert.equal(lines.count, 1);
  assert.equal(b.clearLines(lines), 8);
  assert.ok(b.isEmpty());
});

test('baris + kolom bersilang: persilangan dihapus sekali (15 sel, bukan 16)', () => {
  const b = new Board();
  for (let i = 0; i < 8; i++) { b.cells[b.idx(3, i)] = 1; b.cells[b.idx(i, 6)] = 1; }
  b.cells[b.idx(0, 0)] = 2;                       // sel lain harus tetap utuh
  const lines = b.findFullLines();
  assert.equal(lines.count, 2);
  assert.equal(b.clearLines(lines), 15);
  assert.equal(b.filledCount(), 1);
  assert.equal(b.get(0, 0), 2);
});

test('baris belum penuh (7/8) tidak dihapus', () => {
  const b = new Board();
  for (let c = 0; c < 7; c++) b.cells[b.idx(0, c)] = 1;
  assert.equal(b.findFullLines().count, 0);
});

test('full clear: seluruh 64 sel benar-benar kosong setelah dihapus', () => {
  const b = new Board();
  const o2 = shape('o2-0');
  for (let r = 0; r < 8; r += 2) for (let c = 0; c < 8; c += 2) {
    assert.ok(b.canPlace(o2, r, c));
    b.place(o2, r, c, (r + c) % 7);
  }
  assert.equal(b.filledCount(), 64);
  const lines = b.findFullLines();
  assert.equal(lines.rows.length, 8);
  assert.equal(lines.cols.length, 8);
  assert.equal(b.clearLines(lines), 64);
  assert.equal(b.filledCount(), 0);
  assert.ok(b.isEmpty());
  for (let i = 0; i < 64; i++) assert.equal(b.cells[i], -1);
});

test('clone() independen dari papan asli', () => {
  const b = new Board();
  b.place(shape('dot-0'), 0, 0, 3);
  const c = b.clone();
  c.place(shape('dot-0'), 1, 1, 4);
  assert.equal(b.filledCount(), 1);
  assert.equal(c.filledCount(), 2);
});

test('katalog bentuk: orientasi unik, ternormalisasi, ukuran benar', () => {
  assert.equal(ALL_SHAPES.length, 1 + 9 + 20 + 18);
  const keys = new Set(ALL_SHAPES.map(s => s.id));
  assert.equal(keys.size, ALL_SHAPES.length, 'id unik');
  for (const s of ALL_SHAPES) {
    assert.equal(s.size, s.cells.length);
    assert.equal(Math.min(...s.cells.map(p => p[0])), 0);
    assert.equal(Math.min(...s.cells.map(p => p[1])), 0);
    assert.equal(Math.max(...s.cells.map(p => p[0])) + 1, s.h);
    assert.equal(Math.max(...s.cells.map(p => p[1])) + 1, s.w);
  }
});
