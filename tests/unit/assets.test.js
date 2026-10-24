const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadCore, ROOT } = require('../helpers/load');

const { CONFIG } = loadCore();

test('semua file suara ada, tidak kosong, dan berformat MP3', () => {
  for (const [name, rel] of Object.entries(CONFIG.PATHS.sounds)) {
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), `${name}: ${rel} tidak ada`);
    const buf = fs.readFileSync(file);
    assert.ok(buf.length > 500, `${rel} terlalu kecil`);
    const id3 = buf.slice(0, 3).toString() === 'ID3';
    const frameSync = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
    assert.ok(id3 || frameSync, `${rel} bukan MP3 (header tidak dikenal)`);
  }
  assert.deepEqual(Object.keys(CONFIG.PATHS.sounds).sort(), ['allclear', 'clear', 'place']);
});

test('semua gambar fase1..faseN ada dan PNG valid (dimensi terbaca)', () => {
  assert.ok(CONFIG.PHASE.MAX_FILES >= 1);
  for (let n = 1; n <= CONFIG.PHASE.MAX_FILES; n++) {
    const rel = CONFIG.PATHS.texture(n);
    assert.equal(rel, `assets/img/fase${n}.png`);
    const file = path.join(ROOT, rel);
    assert.ok(fs.existsSync(file), `${rel} tidak ada`);
    const buf = fs.readFileSync(file);
    assert.equal(buf.slice(1, 4).toString(), 'PNG', `${rel} bukan PNG`);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    assert.ok(w > 0 && h > 0, `${rel} dimensi tidak valid`);
  }
});

test('index.html: semua <script>/<link> menunjuk file yang ada, urutan benar, tidak ada js yatim', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]);
  const css = [...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map(m => m[1]);
  for (const rel of [...scripts, ...css]) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `${rel} dirujuk index.html tetapi tidak ada`);
  }
  assert.equal(scripts[0], 'js/config.js', 'config.js harus pertama');
  assert.equal(scripts[scripts.length - 1], 'js/main.js', 'main.js harus terakhir');

  const idx = (f) => scripts.indexOf('js/' + f + '.js');
  const order = ['config', 'shapes', 'board', 'difficulty', 'generator', 'ui', 'game', 'main'];
  for (let i = 1; i < order.length; i++) assert.ok(idx(order[i - 1]) < idx(order[i]), `${order[i - 1]} harus sebelum ${order[i]}`);
  assert.ok(idx('audio') < idx('game') && idx('textures') < idx('game'));

  const onDisk = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f);
  for (const f of onDisk) assert.ok(scripts.includes(f), `${f} ada di disk tetapi tidak dimuat index.html`);
});

test('semua file JavaScript lolos pemeriksaan sintaks', () => {
  const vm = require('node:vm');
  for (const f of fs.readdirSync(path.join(ROOT, 'js'))) {
    assert.doesNotThrow(() => new vm.Script(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), { filename: f }), f);
  }
});
