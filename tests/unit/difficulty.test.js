const test = require('node:test');
const assert = require('node:assert/strict');
const { loadCore } = require('../helpers/load');

test('siklus penuh: normal -> (dipermudah) -> normal -> 3x full clear -> tekanan -> normal', () => {
  const { CONFIG, Difficulty: D } = loadCore();
  const EASE = CONFIG.DIFFICULTY.EASE_AFTER_ROUNDS;
  const NEED = CONFIG.DIFFICULTY.ALL_CLEARS_FOR_PRESSURE;
  assert.equal(EASE, 8);
  assert.equal(NEED, 3);

  D.reset();
  assert.equal(D.getMode(), 'normal');

  // belum sampai batas ronde: tetap normal
  for (let i = 0; i < EASE - 1; i++) D.onRoundDealt();
  assert.equal(D.getMode(), 'normal');

  // tepat di batas: dipermudah
  D.onRoundDealt();
  assert.equal(D.getMode(), 'eased');

  // full clear ke-1 mengakhiri mode dipermudah
  assert.equal(D.onAllClear(), 'progress');
  assert.equal(D.getMode(), 'normal');
  assert.equal(D.allClears, 1);
  assert.equal(D.roundsSinceClear, 0);

  // full clear ke-2
  assert.equal(D.onAllClear(), 'progress');
  assert.equal(D.allClears, 2);
  assert.equal(D.getMode(), 'normal');

  // full clear ke-3 -> tekanan
  assert.equal(D.onAllClear(), 'pressure-start');
  assert.equal(D.getMode(), 'pressure');
  assert.equal(D.pressure, true);
  assert.equal(D.allClears, 3);

  // saat tekanan, banyak ronde TIDAK memicu dipermudah
  for (let i = 0; i < EASE * 3; i++) D.onRoundDealt();
  assert.equal(D.getMode(), 'pressure');

  // full clear berikutnya mengakhiri tekanan dan mereset siklus
  assert.equal(D.onAllClear(), 'pressure-end');
  assert.equal(D.getMode(), 'normal');
  assert.equal(D.allClears, 0);
  assert.equal(D.pressure, false);
  assert.equal(D.roundsSinceClear, 0);

  // siklus berikutnya dimulai ulang: butuh 3 full clear lagi
  assert.equal(D.onAllClear(), 'progress');
  assert.equal(D.onAllClear(), 'progress');
  assert.equal(D.getMode(), 'normal');
  assert.equal(D.onAllClear(), 'pressure-start');
});

test('reset() mengembalikan semua status awal', () => {
  const { Difficulty: D } = loadCore();
  D.allClears = 3; D.pressure = true; D.roundsSinceClear = 20;
  D.reset();
  assert.equal(D.getMode(), 'normal');
  assert.equal(D.allClears, 0);
  assert.equal(D.roundsSinceClear, 0);
  assert.equal(D.pressure, false);
});
