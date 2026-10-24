/* ============================================================
   shapes.js — katalog bentuk blok.
   Bentuk digambar dengan teks ('#' = kotak terisi), lalu otomatis
   diputar 90° untuk mendapatkan semua orientasi uniknya.
   tier: mercy (sangat mudah) | easy | normal | hard
   ============================================================ */
const SHAPE_DEFS = [
  // ---- mercy: hanya muncul di mode dipermudah ----
  { id: 'dot', tier: 'mercy', rows: ['#'], rotate: false },

  // ---- easy ----
  { id: 'i2', tier: 'easy', rows: ['##'] },
  { id: 'i3', tier: 'easy', rows: ['###'] },
  { id: 'o2', tier: 'easy', rows: ['##', '##'], rotate: false },
  { id: 'l3', tier: 'easy', rows: ['#.', '##'] },

  // ---- normal ----
  { id: 'i4', tier: 'normal', rows: ['####'] },
  { id: 'r23', tier: 'normal', rows: ['###', '###'] },
  { id: 'l4', tier: 'normal', rows: ['#.', '#.', '##'] },
  { id: 'j4', tier: 'normal', rows: ['.#', '.#', '##'] },
  { id: 't4', tier: 'normal', rows: ['###', '.#.'] },
  { id: 's4', tier: 'normal', rows: ['.##', '##.'] },
  { id: 'z4', tier: 'normal', rows: ['##.', '.##'] },

  // ---- hard: besar / canggung, dominan di mode tekanan ----
  { id: 'i5', tier: 'hard', rows: ['#####'] },
  { id: 'o3', tier: 'hard', rows: ['###', '###', '###'], rotate: false },
  { id: 'L5', tier: 'hard', rows: ['#..', '#..', '###'] },
  { id: 'T5', tier: 'hard', rows: ['###', '.#.', '.#.'] },
  { id: 'plus', tier: 'hard', rows: ['.#.', '###', '.#.'], rotate: false },
  { id: 'u5', tier: 'hard', rows: ['#.#', '###'] },
  { id: 'r24', tier: 'hard', rows: ['####', '####'] }
];

/* ---------- fungsi bantu ---------- */
function parseRows(rows) {
  const cells = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === '#') cells.push([r, c]); }));
  return cells;
}

// geser agar pojok kiri-atas = (0,0), lalu urutkan supaya key-nya konsisten
function normalize(cells) {
  const minR = Math.min(...cells.map(p => p[0]));
  const minC = Math.min(...cells.map(p => p[1]));
  return cells.map(([r, c]) => [r - minR, c - minC])
              .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}

// putar 90° searah jarum jam: (r,c) -> (c, maxR - r)
function rotate90(cells) {
  const maxR = Math.max(...cells.map(p => p[0]));
  return normalize(cells.map(([r, c]) => [c, maxR - r]));
}

function makeShape(id, cells) {
  return {
    id,
    cells,
    h: Math.max(...cells.map(p => p[0])) + 1,
    w: Math.max(...cells.map(p => p[1])) + 1,
    size: cells.length
  };
}

function buildShapeLibrary() {
  const lib = { mercy: [], easy: [], normal: [], hard: [] };
  for (const def of SHAPE_DEFS) {
    let cells = normalize(parseRows(def.rows));
    const seen = new Set();
    const turns = def.rotate === false ? 1 : 4;
    for (let k = 0; k < turns; k++) {
      const key = JSON.stringify(cells);
      if (!seen.has(key)) {               // buang orientasi kembar
        seen.add(key);
        lib[def.tier].push(makeShape(`${def.id}-${k}`, cells));
      }
      cells = rotate90(cells);
    }
  }
  return lib;
}

const SHAPES = buildShapeLibrary();
const ALL_SHAPES = Object.values(SHAPES).flat();
