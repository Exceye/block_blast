/* Tes browser SUNGGUHAN (Chromium via Playwright): halaman benar-benar dimuat,
   klik/drag sungguhan, aset benar-benar diminta lewat HTTP.
   Variabel BB_ROOT dapat menunjuk salinan proyek lain (mis. versi lama). */
const { describe, test, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer } = require('../helpers/server');

let chromium = null;
try { ({ chromium } = require('playwright')); }
catch (e) { console.log('# DILEWATI: paket "playwright" tidak terpasang (npm install). Tes browser TIDAK dijalankan.'); }

const ROOT = process.env.BB_ROOT || path.resolve(__dirname, '../..');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

describe('browser', { skip: !chromium }, () => {
  let server, browser, page, errors;

  before(async () => {
    server = await startServer(ROOT);
    browser = await chromium.launch();
  });
  after(async () => { await browser?.close(); await server?.close(); });

  beforeEach(async () => {
    page = await browser.newPage({ viewport: { width: 420, height: 800 } });
    errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(server.url);
    await page.waitForFunction(() => typeof Game !== 'undefined' && Game.tray.length === 3);
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  });
  afterEach(async () => { await page.close(); });

  // ---- pembantu yang dijalankan di dalam halaman ----
  const setupDotAllClear = () => page.evaluate(() => {
    // baris 0 terisi kolom 0..6; menaruh titik di (0,7) = baris penuh = papan kosong = FULL CLEAR
    Game.board.reset();
    for (let c = 0; c < 7; c++) Game.board.cells[c] = 1;
    Game.tray = [{ shape: SHAPES.mercy[0], color: 0 }, null, null];
    UI.renderBoard(Game.board); UI.renderTray(Game.tray);
    Game.locked = false;
  });
  const gameState = () => page.evaluate(() => ({
    filled: Game.board.filledCount(), score: Game.score, over: Game.over, locked: Game.locked,
    allClears: Difficulty.allClears, pressure: Difficulty.pressure, mode: Difficulty.getMode(),
    traySize: Game.tray.filter(Boolean).length,
    clearingCells: document.querySelectorAll('.cell.clearing').length,
    domFilled: document.querySelectorAll('.cell.filled').length,
    overlayHidden: document.querySelector('#overlay').classList.contains('hidden'),
    badge: document.querySelector('#mode-badge').textContent,
    bodyMode: document.body.dataset.mode
  }));

  test('halaman dimuat tanpa error: 64 sel, 3 blok, tekstur fase1 terpasang', async () => {
    assert.equal(await page.locator('.cell').count(), 64);
    assert.equal(await page.locator('.piece').count(), 3);
    const tex = await page.evaluate(() => document.documentElement.style.getPropertyValue('--block-tex'));
    assert.match(tex, /assets\/img\/fase1\.png/);
    assert.deepEqual(errors, []);
  });

  test('drag-and-drop mouse sungguhan meletakkan blok dan menambah skor', async () => {
    const pb = await page.locator('.piece').first().boundingBox();
    const bb = await page.locator('#board').boundingBox();
    const size = await page.evaluate(() => Game.tray[0].shape.size);
    await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
    await page.mouse.down();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 8 });
    assert.ok(await page.locator('.cell.ghost').count() > 0, 'pratinjau bayangan harus tampil');
    await page.mouse.up();
    await sleep(500);
    const s = await gameState();
    assert.equal(s.filled, size);
    assert.equal(s.score, size);
    assert.equal(await page.locator('.drag-piece').count(), 0);
    assert.deepEqual(errors, []);
  });

  test('FULL CLEAR: semua 64 sel kosong (data dan DOM), bonus skor, hitungan siklus naik', async () => {
    await page.evaluate(() => {
      CONFIG.TIMING.CLEAR_ANIM_MS = 30;
      Game.board.cells.fill(1);                         // papan penuh...
      for (const i of [0, 1, 8, 9]) Game.board.cells[i] = -1;   // ...kecuali lubang 2x2 di pojok
      Game.tray = [{ shape: SHAPES.easy.find(s => s.id === 'o2-0'), color: 2 }, null, null];
      UI.renderBoard(Game.board); UI.renderTray(Game.tray);
    });
    assert.equal((await gameState()).domFilled, 60);
    await page.evaluate(() => Game.place(0, 0, 0));
    const s = await gameState();
    assert.equal(s.filled, 0);
    assert.equal(s.domFilled, 0, 'DOM juga harus kosong');
    assert.equal(await page.evaluate(() => [...Game.board.cells].every(v => v === -1)), true);
    assert.equal(s.allClears, 1);
    // 4 sel + 16 garis -> 10*16*16 + 4 + bonus 300
    assert.equal(s.score, 4 + 10 * 16 * 16 + 300);
    assert.deepEqual(errors, []);
  });

  test('siklus kesulitan di game: 3x full clear -> TEKANAN (badge/tema), full clear lagi -> NORMAL', async () => {
    await page.evaluate(() => { CONFIG.TIMING.CLEAR_ANIM_MS = 20; });
    const seen = [];
    for (let i = 0; i < 4; i++) {
      await setupDotAllClear();
      await page.evaluate(() => Game.place(0, 0, 7));
      const s = await gameState();
      seen.push([s.mode, s.allClears, s.badge, s.bodyMode]);
    }
    assert.deepEqual(seen, [
      ['normal', 1, 'NORMAL', 'normal'],
      ['normal', 2, 'NORMAL', 'normal'],
      ['pressure', 3, 'TEKANAN', 'pressure'],
      ['normal', 0, 'NORMAL', 'normal']
    ]);
    assert.deepEqual(errors, []);
  });

  test('mode dipermudah muncul setelah 8 ronde tanpa full clear dan hilang saat full clear', async () => {
    const r = await page.evaluate(async () => {
      CONFIG.TIMING.CLEAR_ANIM_MS = 20;
      Game.newGame();
      const modes = [Difficulty.getMode()];
      for (let i = 0; i < 9; i++) { Game.tray = [null, null, null]; Game._dealRound(); modes.push(Difficulty.getMode()); }
      return modes;
    });
    assert.equal(r[0], 'normal');
    assert.equal(r.at(-1), 'eased');
    assert.equal(await page.evaluate(() => document.querySelector('#mode-badge').textContent), 'DIPERMUDAH');
    await setupDotAllClear();
    await page.evaluate(() => Game.place(0, 0, 7));
    assert.equal((await gameState()).mode, 'normal');
  });

  test('BUG 1: restart saat animasi penghapusan -> sesi lama tidak boleh merusak sesi baru', async () => {
    await page.evaluate(() => { CONFIG.TIMING.CLEAR_ANIM_MS = 1200; });
    await setupDotAllClear();
    // mulai penempatan (full clear) tapi JANGAN ditunggu: animasi 1,2 detik sedang berjalan
    await page.evaluate(() => { window.__old = Game.place(0, 0, 7); });
    await sleep(250);
    assert.ok((await gameState()).clearingCells > 0, 'animasi hapus harus sedang berjalan');

    await page.click('#btn-restart');                 // klik tombol restart sungguhan
    const stale = await page.evaluate(() => window.__old);   // tunggu placement lama selesai
    await sleep(300);

    const s = await gameState();
    assert.equal(stale, false, 'placement basi harus berhenti (return false)');
    assert.equal(s.score, 0, 'skor sesi lama tidak boleh masuk sesi baru');
    assert.equal(s.allClears, 0, 'full clear sesi lama tidak boleh dihitung');
    assert.equal(s.pressure, false);
    assert.equal(s.filled, 0);
    assert.equal(s.clearingCells, 0);
    assert.equal(s.traySize, 3);
    assert.equal(s.locked, false);
    assert.equal(s.over, false);
    assert.equal(s.mode, 'normal');

    // sesi baru tetap bisa dimainkan setelah placement lama selesai
    await page.evaluate(() => { CONFIG.TIMING.CLEAR_ANIM_MS = 20; });
    const ok = await page.evaluate(() => {
      const p = Game.tray[0]; const [pos] = [...Game.board.positions(p.shape)];
      return Game.place(0, pos[0], pos[1]);
    });
    assert.equal(ok, true);
    assert.deepEqual(errors, []);
  });

  test('BUG 1b: restart saat blok sedang diseret -> lepas mouse tidak meletakkan apa pun', async () => {
    const pb = await page.locator('.piece').first().boundingBox();
    const bb = await page.locator('#board').boundingBox();
    await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
    await page.mouse.down();
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 6 });
    assert.equal(await page.locator('.drag-piece').count(), 1);
    await page.evaluate(() => Game.newGame());              // restart di tengah drag
    assert.equal(await page.locator('.drag-piece').count(), 0, 'blok seret harus dibatalkan');
    await page.mouse.up();
    await sleep(300);
    const s = await gameState();
    assert.equal(s.filled, 0);
    assert.equal(s.score, 0);
    assert.equal(s.traySize, 3);
    assert.deepEqual(errors, []);
  });

  // papan hampir penuh: sel kosong hanya di dua diagonal (tiap baris/kolom punya 2 lubang, jadi menaruh titik TIDAK menghapus garis).
  // Titik ditaruh di (0,0); sisa blok 3x3 mustahil muat -> GAME OVER tanpa animasi hapus.
  const setupStuck = () => page.evaluate(() => {
    Game.board.cells.fill(1);
    for (let i = 0; i < 8; i++) { Game.board.cells[i * 8 + i] = -1; Game.board.cells[i * 8 + (i + 1) % 8] = -1; }
    Game.tray = [{ shape: SHAPES.mercy[0], color: 0 },
                 { shape: SHAPES.hard.find(s => s.id === 'o3-0'), color: 1 }, null];
    UI.renderBoard(Game.board); UI.renderTray(Game.tray);
    Game.locked = false;
  });

  test('Game Over normal (tanpa restart): overlay tampil setelah jeda', async () => {
    await setupStuck();
    await page.evaluate(() => Game.place(0, 0, 0));
    assert.equal((await gameState()).over, true);
    await page.waitForFunction(() => !document.querySelector('#overlay').classList.contains('hidden'), null, { timeout: 2000 });
    assert.equal(await page.locator('#final-score').innerText(), '1');
  });

  test('BUG 2: restart sesaat setelah Game Over dipicu -> overlay lama tidak boleh muncul di sesi baru', async () => {
    await setupStuck();
    await page.evaluate(() => Game.place(0, 0, 0));
    assert.equal((await gameState()).over, true);
    assert.equal((await gameState()).overlayHidden, true, 'overlay belum tampil (timeout 500 ms masih tertunda)');

    await page.click('#btn-restart');
    await sleep(900);                                   // lewati 500 ms timeout lama
    const s = await gameState();
    assert.equal(s.over, false);
    assert.equal(s.overlayHidden, true, 'overlay Game Over lama muncul di sesi baru!');
    assert.equal(s.score, 0);
    assert.equal(s.traySize, 3);
    assert.deepEqual(errors, []);
  });

  test('Game Over kedua setelah restart tetap berfungsi (timer tidak rusak)', async () => {
    await setupStuck(); await page.evaluate(() => Game.place(0, 0, 0));
    await page.click('#btn-restart'); await sleep(100);
    await setupStuck(); await page.evaluate(() => Game.place(0, 0, 0));
    await page.waitForFunction(() => !document.querySelector('#overlay').classList.contains('hidden'), null, { timeout: 2000 });
  });

  test('ASET (HTTP): semua suara & fase1..N dapat diminta (200, tipe benar); gambar terdecode', async () => {
    const res = await page.evaluate(async () => {
      const out = { sounds: {}, images: {} };
      for (const [k, p] of Object.entries(CONFIG.PATHS.sounds)) {
        const r = await fetch(p); const b = await r.arrayBuffer();
        out.sounds[k] = { status: r.status, type: r.headers.get('content-type'), bytes: b.byteLength };
      }
      for (let n = 1; n <= CONFIG.PHASE.MAX_FILES; n++) {
        const p = CONFIG.PATHS.texture(n);
        const r = await fetch(p);
        const img = new Image(); img.src = p;
        let ok = true; try { await img.decode(); } catch (e) { ok = false; }
        out.images[n] = { status: r.status, type: r.headers.get('content-type'), decoded: ok, w: img.naturalWidth, h: img.naturalHeight };
      }
      out.loadedFlags = { ...Textures.loaded };
      return out;
    });
    for (const [k, v] of Object.entries(res.sounds)) {
      assert.equal(v.status, 200, k); assert.equal(v.type, 'audio/mpeg', k); assert.ok(v.bytes > 500, k);
    }
    for (const [n, v] of Object.entries(res.images)) {
      assert.equal(v.status, 200, 'fase' + n); assert.equal(v.type, 'image/png');
      assert.equal(v.decoded, true, 'fase' + n + ' gagal didecode'); assert.ok(v.w > 0 && v.h > 0);
      assert.equal(res.loadedFlags[n], true, 'Textures.loaded[' + n + ']');
    }
  });

  test('ASET (audio): dekode MP3 hanya diuji bila Chromium mendukung codec; jika tidak, dilaporkan', async (t) => {
    const support = await page.evaluate(() => new Audio().canPlayType('audio/mpeg'));
    if (!support) { t.diagnostic('Chromium ini tanpa codec MP3: dekode audio TIDAK diuji (hanya HTTP + header).'); return; }
    const durations = await page.evaluate(() => Promise.all(Object.entries(CONFIG.PATHS.sounds).map(([k, p]) => new Promise(res => {
      const a = new Audio(p); a.addEventListener('loadedmetadata', () => res([k, a.duration])); a.addEventListener('error', () => res([k, -1]));
    }))));
    for (const [k, d] of durations) assert.ok(d > 0, `${k}.mp3 gagal didekode`);
  });

  test('tekstur fase naik mengikuti skor (fase1 -> fase2 pada 500 poin)', async () => {
    const before = await page.evaluate(() => document.documentElement.style.getPropertyValue('--block-tex'));
    await page.evaluate(() => Game._addScore(500));
    const after = await page.evaluate(() => ({ tex: document.documentElement.style.getPropertyValue('--block-tex'), phase: document.querySelector('#phase').textContent, dataPhase: document.body.dataset.phase }));
    assert.match(before, /fase1\.png/);
    assert.match(after.tex, /fase2\.png/);
    assert.equal(after.phase, '2'); assert.equal(after.dataPhase, '2');
  });
});
