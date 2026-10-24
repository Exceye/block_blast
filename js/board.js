/* ============================================================
   board.js — logika papan 8x8 (tanpa DOM, murni data).
   Isi sel: -1 = kosong, 0..6 = indeks warna blok.
   ============================================================ */
class Board {
  constructor() {
    this.n = CONFIG.BOARD_SIZE;
    this.cells = new Int8Array(this.n * this.n).fill(-1);
  }

  clone() {
    const b = new Board();
    b.cells.set(this.cells);
    return b;
  }

  reset() { this.cells.fill(-1); }

  idx(r, c) { return r * this.n + c; }
  get(r, c) { return this.cells[this.idx(r, c)]; }

  /** Apakah bentuk muat di pojok kiri-atas (r, c)? */
  canPlace(shape, r, c) {
    for (const [dr, dc] of shape.cells) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= this.n || cc >= this.n) return false;
      if (this.cells[this.idx(rr, cc)] !== -1) return false;
    }
    return true;
  }

  place(shape, r, c, color) {
    for (const [dr, dc] of shape.cells) this.cells[this.idx(r + dr, c + dc)] = color;
  }

  /** Cari baris & kolom yang penuh. */
  findFullLines() {
    const rows = [], cols = [];
    for (let i = 0; i < this.n; i++) {
      let rowFull = true, colFull = true;
      for (let j = 0; j < this.n; j++) {
        if (this.cells[this.idx(i, j)] === -1) rowFull = false;
        if (this.cells[this.idx(j, i)] === -1) colFull = false;
      }
      if (rowFull) rows.push(i);
      if (colFull) cols.push(i);
    }
    return { rows, cols, count: rows.length + cols.length };
  }

  /** Daftar indeks sel yang terlibat dalam baris/kolom penuh (tanpa duplikat). */
  cellsOfLines(lines) {
    const set = new Set();
    for (const r of lines.rows) for (let c = 0; c < this.n; c++) set.add(this.idx(r, c));
    for (const c of lines.cols) for (let r = 0; r < this.n; r++) set.add(this.idx(r, c));
    return [...set];
  }

  /** Hapus baris+kolom sekaligus (persilangan ikut terhapus). */
  clearLines(lines) {
    const list = this.cellsOfLines(lines);
    for (const i of list) this.cells[i] = -1;
    return list.length;
  }

  filledCount() {
    let k = 0;
    for (const v of this.cells) if (v !== -1) k++;
    return k;
  }

  isEmpty() { return this.filledCount() === 0; }

  /** Semua posisi sah untuk sebuah bentuk. */
  *positions(shape) {
    for (let r = 0; r <= this.n - shape.h; r++)
      for (let c = 0; c <= this.n - shape.w; c++)
        if (this.canPlace(shape, r, c)) yield [r, c];
  }

  canFit(shape) {
    for (const _ of this.positions(shape)) return true;
    return false;
  }
}
