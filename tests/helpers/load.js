/* Memuat file inti game (tanpa DOM) ke konteks VM baru agar bisa dites di Node.
   Tiap pemanggilan memberi konteks BARU, jadi status Difficulty/CONFIG tidak bocor antar tes. */
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.env.BB_ROOT || path.resolve(__dirname, '../..');

function loadCore() {
  const ctx = vm.createContext({ Math, console, performance });
  for (const f of ['config', 'shapes', 'board', 'difficulty', 'generator']) {
    const file = path.join(ROOT, 'js', f + '.js');
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  }
  return vm.runInContext('({ CONFIG, SHAPES, ALL_SHAPES, Board, Difficulty, Generator })', ctx);
}

/* Verifier INDEPENDEN (bukan Generator._solve): DFS tanpa batas anggaran.
   Dipakai tes untuk memeriksa klaim "solvable" dari generator. */
function exhaustivelySolvable(board, shapes) {
  if (shapes.length === 0) return true;
  const seen = new Set();
  for (let i = 0; i < shapes.length; i++) {
    const s = shapes[i];
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    const rest = shapes.filter((_, j) => j !== i);
    for (let r = 0; r <= board.n - s.h; r++) {
      for (let c = 0; c <= board.n - s.w; c++) {
        if (!board.canPlace(s, r, c)) continue;
        const next = board.clone();
        next.place(s, r, c, 0);
        next.clearLines(next.findFullLines());
        if (exhaustivelySolvable(next, rest)) return true;
      }
    }
  }
  return false;
}

module.exports = { ROOT, loadCore, exhaustivelySolvable };
