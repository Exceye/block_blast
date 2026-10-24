# Tutorial Lengkap: Membuat Block Blast Solo Unlimited (HTML + CSS + JavaScript)

Tutorial ini membawamu dari folder kosong sampai game online di GitHub Pages. Semua kode **dipecah per file** dan dijelaskan satu per satu. Kode di bawah adalah salinan persis dari proyek yang sudah diuji, jadi kamu bisa menyalinnya langsung.

---

## Daftar Isi

0. [Gambaran game](#0-gambaran-game)
1. [Persiapan alat](#1-persiapan-alat)
2. [Buat repository GitHub](#2-buat-repository-github)
3. [Struktur folder & aset](#3-struktur-folder--aset)
4. [Langkah 1 — `index.html`](#langkah-1--indexhtml)
5. [Langkah 2 — `css/style.css`](#langkah-2--cssstylecss)
6. [Langkah 3 — `js/config.js`](#langkah-3--jsconfigjs)
7. [Langkah 4 — `js/shapes.js`](#langkah-4--jsshapesjs)
8. [Langkah 5 — `js/board.js`](#langkah-5--jsboardjs)
9. [Langkah 6 — `js/difficulty.js`](#langkah-6--jsdifficultyjs)
10. [Langkah 7 — `js/generator.js`](#langkah-7--jsgeneratorjs)
11. [Langkah 8 — `js/audio.js`](#langkah-8--jsaudiojs)
12. [Langkah 9 — `js/textures.js`](#langkah-9--jstexturesjs)
13. [Langkah 10 — `js/ui.js`](#langkah-10--jsuijs)
14. [Langkah 11 — `js/game.js` dan `js/main.js`](#langkah-11--jsgamejs-dan-jsmainjs)
15. [Langkah 12 — Tes otomatis](#langkah-12--tes-otomatis)
16. [Menjalankan & menguji manual](#menjalankan--menguji-manual)
17. [Publikasi ke GitHub Pages](#publikasi-ke-github-pages)
18. [Menyetel game (tuning)](#menyetel-game-tuning)
19. [Mengganti aset suara & tekstur](#mengganti-aset-suara--tekstur)
20. [Pemecahan masalah](#pemecahan-masalah)
21. [Ide pengembangan](#ide-pengembangan)

---

## 0. Gambaran game

**Aturan:**
- Papan 8×8. Kamu mendapat **3 blok** sekaligus. Seret tiap blok ke papan.
- Baris atau kolom yang **penuh** akan terhapus dan memberi skor.
- Setelah ketiga blok terpakai, dibagikan 3 blok baru.
- **Game over** bila tidak ada satu pun dari blok yang tersisa yang muat di papan.
- Tidak ada batas waktu: skor setinggi-tingginya (*unlimited*).

**Skor:**

| Kejadian | Poin |
|---|---|
| Tiap kotak yang diletakkan | 1 |
| Hapus *n* garis sekaligus | 10 × n × n (1 garis = 10, 2 = 40, 3 = 90 …) |
| Combo beruntun | tiap combo menambah +50% pada skor garis |
| **Full clear** (papan kosong) | bonus +300 |

**Kesulitan adaptif (tiga kondisi):**

```
              full clear ke-3
 ┌────────┐  ───────────────────►  ┌──────────┐
 │ NORMAL │                        │ TEKANAN  │
 └────────┘  ◄───────────────────  └──────────┘
   ▲  │         full clear lagi          (siklus mulai ulang,
   │  │ 8 ronde tanpa full clear          hitungan full clear = 0)
   │  ▼
 ┌──────────────┐
 │  DIPERMUDAH  │ ── full clear ──► kembali NORMAL
 └──────────────┘
```

- **Normal** — campuran bentuk mudah, sedang, dan sulit.
- **Dipermudah** — aktif jika pemain 8 ronde tidak pernah full clear. Bentuk kecil lebih sering, ada blok pembersih baris, dan bila papan hampir kosong game berusaha memberi **blok penyelesai** yang sekali taruh langsung mengosongkan papan.
- **Tekanan** — aktif setelah **3 kali full clear**. Bentuk besar & canggung (3×3, 5 lurus, plus, U, S/Z) mendominasi. Berakhir saat kamu full clear lagi; hitungan kembali 0 dan siklus mulai dari awal.

Meski sulit, game **tidak curang**: tiap set 3 blok dicek oleh *solver* kecil supaya masih ada urutan penempatan yang memungkinkan.

**Tekstur bertahap:** `fase1.png` dipakai di awal, naik tiap 500 poin (`fase2.png`, `fase3.png`, …).
**Suara:** `place.mp3` (taruh blok), `clear.mp3` (hapus garis), `allclear.mp3` (papan kosong).

---

## 1. Persiapan alat

Kamu butuh:

1. **Editor kode** — [Visual Studio Code](https://code.visualstudio.com/) (gratis).
2. **Git** — unduh di <https://git-scm.com/downloads>. Cek di terminal: `git --version`.
3. **Akun GitHub** — daftar di <https://github.com>.
4. **Browser modern** — Chrome, Edge, Firefox, atau Safari.
5. *(Opsional tapi disarankan)* server lokal. Pilih salah satu:
   - Ekstensi VS Code **Live Server** (klik kanan `index.html` → *Open with Live Server*), atau
   - Python: `python3 -m http.server 8000` di folder proyek, lalu buka <http://localhost:8000>.

> Game ini memakai skrip biasa (bukan ES module), jadi **bisa juga dibuka langsung** dengan klik dua kali `index.html`. Server lokal tetap lebih nyaman karena meniru kondisi saat online.

---

## 2. Buat repository GitHub

1. Masuk ke GitHub → klik **New repository**.
2. Nama: `block-blast-solo`. Pilih **Public**. Centang **Add a README file**. Klik **Create repository**.
3. Di terminal, *clone* ke komputer:

```bash
git clone https://github.com/USERNAME-KAMU/block-blast-solo.git
cd block-blast-solo
code .        # membuka VS Code di folder ini
```

Ganti `USERNAME-KAMU` dengan nama akun GitHub-mu.

**Kebiasaan baik:** setelah menyelesaikan tiap langkah di bawah, simpan ke GitHub:

```bash
git add .
git commit -m "Langkah X: deskripsi singkat"
git push
```

---

## 3. Struktur folder & aset

Buat struktur berikut (folder `js`, `css`, `assets/audio`, `assets/img`):

```
block-blast-solo/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   ├── shapes.js
│   ├── board.js
│   ├── difficulty.js
│   ├── generator.js
│   ├── audio.js
│   ├── textures.js
│   ├── ui.js
│   ├── game.js
│   └── main.js
├── package.json            (skrip tes)
├── tests/
│   ├── helpers/  load.js  server.js
│   ├── unit/     board / difficulty / generator / assets .test.js
│   └── browser/  game.browser.test.js
└── assets/
    ├── audio/
    │   ├── place.mp3
    │   ├── clear.mp3
    │   └── allclear.mp3
    └── img/
        ├── fase1.png
        ├── fase2.png
        └── fase3.png ... (dan seterusnya)
```

Perintah cepat di terminal:

```bash
mkdir -p css js assets/audio assets/img tests/helpers tests/unit tests/browser
```

**Aset:** proyek contoh sudah menyertakan 3 suara dan `fase1.png` s/d `fase6.png` sebagai *placeholder*. Kamu bebas menggantinya (lihat [bagian 18](#mengganti-aset-suara--tekstur)). **Nama file harus persis sama** (huruf kecil semua).

> Bila file suara/tekstur belum ada, game tetap jalan: suara diganti bunyi "bip" sintetis, dan tekstur diganti perubahan warna per fase.

---

## Langkah 1 — `index.html`

Ini kerangka halaman: bar skor, papan, tempat tiga blok, dan layar *game over*. Dua hal penting:

- `<meta name="viewport">` membuat tampilan pas di HP.
- Urutan `<script>` **penting**: file yang dipakai harus dimuat lebih dulu (mis. `config.js` paling awal karena dipakai semua file lain; `main.js` paling akhir karena ia yang menjalankan game).

Buat file `index.html`:

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="theme-color" content="#14102b">
  <title>Block Blast Solo Unlimited</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body data-phase="1" data-mode="normal">

  <div id="app">
    <!-- Bar skor -->
    <header class="hud">
      <div class="stat"><span class="label">SKOR</span><span id="score">0</span></div>
      <div class="stat"><span class="label">TERBAIK</span><span id="best">0</span></div>
      <div class="stat"><span class="label">FASE</span><span id="phase">1</span></div>
    </header>

    <!-- Status mode kesulitan -->
    <div class="status">
      <span id="mode-badge" class="badge">NORMAL</span>
      <div id="clear-dots" title="Full clear menuju mode tekanan"><i></i><i></i><i></i></div>
      <div class="actions">
        <button id="btn-mute" aria-label="Suara">🔊</button>
        <button id="btn-restart" aria-label="Ulangi">↻</button>
      </div>
    </div>

    <!-- Papan 8x8 -->
    <main id="board-wrap">
      <div id="board"></div>
      <div id="fx"></div>
    </main>

    <!-- Tiga blok yang harus ditempatkan -->
    <section id="tray"></section>
  </div>

  <div id="drag-layer"></div>
  <div id="toast"></div>

  <!-- Layar game over -->
  <div id="overlay" class="hidden">
    <div class="card">
      <h2>Game Over</h2>
      <p class="big" id="final-score">0</p>
      <p class="sub" id="final-best">Terbaik: 0</p>
      <button id="btn-again">Main Lagi</button>
    </div>
  </div>

  <!-- Urutan skrip penting: yang dipakai harus dimuat lebih dulu -->
  <script src="js/config.js"></script>
  <script src="js/shapes.js"></script>
  <script src="js/audio.js"></script>
  <script src="js/textures.js"></script>
  <script src="js/board.js"></script>
  <script src="js/difficulty.js"></script>
  <script src="js/generator.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/game.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

> Selama file `.js`/`.css` lain belum kamu buat, konsol browser (F12) akan menampilkan error 404. Itu wajar; hilang setelah semua langkah selesai.

---

## Langkah 2 — `css/style.css`

CSS mengatur seluruh tampilan. Poin-poin kuncinya:

- **Ukuran responsif lewat variabel.** `--board` dihitung dari lebar *dan* tinggi layar, lalu `--cell` (ukuran satu kotak) diturunkan darinya. Karena blok yang diseret (`.drag-piece`) memakai `--cell` yang sama, ukurannya selalu pas dengan papan.
- **Tekstur + warna blok** dalam satu `background`: tiga lapis (tekstur fase → kilap → warna dasar) digabung dengan `background-blend-mode: overlay`. Jadi satu gambar tekstur bisa dipakai untuk semua warna.
- `touch-action: none` pada `.piece` mencegah halaman ikut ter-scroll saat jari menyeret blok di HP.
- `body[data-mode="pressure"]` mengubah latar jadi kemerahan, sehingga pemain **merasakan** mode tekanan.

Buat file `css/style.css`:

```css
/* css/style.css */
/* ============================================================
   style.css — tampilan. Ukuran papan dihitung lewat variabel CSS
   sehingga otomatis pas di HP maupun desktop.
   ============================================================ */
:root {
  /* ukuran: papan selalu persegi & muat di layar */
  --board: clamp(250px, min(94vw, calc(100vh - 360px)), 500px);
  --board: clamp(250px, min(94vw, calc(100svh - 360px)), 500px);
  --pad: 8px;
  --gap: 3px;
  --cell: calc((var(--board) - 2 * var(--pad) - 7 * var(--gap)) / 8);

  --bg1: #2a1b5e;
  --bg2: #0d0a24;
  --accent: #ffd93d;
  --text: #f4f1ff;
  --muted: #a99fd6;
  --block-tex: none;      /* diisi oleh textures.js */
}

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

html, body {
  margin: 0;
  min-height: 100%;
  overscroll-behavior: none;
}

body {
  font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif;
  color: var(--text);
  background: radial-gradient(circle at 50% 0%, var(--bg1), var(--bg2) 70%) fixed;
  user-select: none;
  -webkit-user-select: none;
  transition: background .6s;
}
body[data-mode="eased"]    { --bg1: #124a4a; }
body[data-mode="pressure"] { --bg1: #6a1226; }

#app {
  width: var(--board);
  margin: 0 auto;
  padding: 14px 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ---------- HUD ---------- */
.hud { display: flex; gap: 8px; width: 100%; }
.stat {
  flex: 1;
  background: rgba(255, 255, 255, .07);
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 12px;
  padding: 6px 10px;
  display: flex; flex-direction: column; align-items: center;
}
.stat .label { font-size: 10px; letter-spacing: .14em; color: var(--muted); }
.stat span:last-child { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }

.status {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  margin: 10px 0;
  gap: 8px;
}
.badge {
  font-size: 12px; font-weight: 800; letter-spacing: .1em;
  padding: 6px 12px; border-radius: 999px;
  background: #3a2f78; color: #fff;
  transition: background .4s, box-shadow .4s;
}
.badge.eased    { background: #12806f; }
.badge.pressure { background: #d6203f; box-shadow: 0 0 16px #ff3355aa; animation: pulse 1s infinite alternate; }

#clear-dots { display: flex; gap: 6px; }
#clear-dots i {
  width: 12px; height: 12px; border-radius: 50%;
  background: rgba(255, 255, 255, .15);
  transition: background .3s, transform .3s;
}
#clear-dots i.on { background: var(--accent); transform: scale(1.15); }
#clear-dots.hot i.on { background: #ff3355; box-shadow: 0 0 8px #ff3355; }

.actions { display: flex; gap: 6px; }
.actions button {
  width: 34px; height: 34px; border-radius: 10px; border: 0;
  background: rgba(255, 255, 255, .1); color: #fff; font-size: 16px; cursor: pointer;
}
.actions button:active { transform: scale(.92); }

/* ---------- papan ---------- */
#board-wrap { position: relative; width: var(--board); }

#board {
  display: grid;
  grid-template-columns: repeat(8, var(--cell));
  grid-auto-rows: var(--cell);
  gap: var(--gap);
  padding: var(--pad);
  width: var(--board);
  background: rgba(255, 255, 255, .06);
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, .4);
}

.cell {
  border-radius: 6px;
  background: rgba(255, 255, 255, .07);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .04);
}

/* Blok terisi: warna + tekstur fase + kilap.
   Urutan lapisan: tekstur (atas) -> kilap -> warna dasar (bawah). */
.cell.filled,
.pc.filled {
  background-color: var(--c);
  background-image: var(--block-tex, none),
                    linear-gradient(145deg, rgba(255,255,255,.42), rgba(255,255,255,0) 45%, rgba(0,0,0,.28));
  background-size: cover, 100% 100%;
  background-blend-mode: overlay, normal;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.5),
              inset 0 -3px 0 rgba(0,0,0,.25),
              0 2px 6px rgba(0,0,0,.35);
}

/* Cadangan bila file tekstur tidak ada: tiap fase diberi gaya warna berbeda */
body.no-tex[data-phase="2"] { --fx: hue-rotate(25deg) saturate(1.1); }
body.no-tex[data-phase="3"] { --fx: hue-rotate(60deg) saturate(1.2); }
body.no-tex[data-phase="4"] { --fx: hue-rotate(110deg) saturate(1.2); }
body.no-tex[data-phase="5"] { --fx: hue-rotate(170deg) saturate(1.3); }
body.no-tex[data-phase="6"] { --fx: hue-rotate(230deg) saturate(1.3) brightness(1.1); }
body.no-tex .cell.filled, body.no-tex .pc.filled { filter: var(--fx, none); }

/* Pratinjau saat drag */
.cell.ghost { background: var(--g); opacity: .55; }
.cell.will-clear {
  outline: 2px solid #fff;
  outline-offset: -2px;
  box-shadow: 0 0 14px #fff;
  animation: pulse .5s infinite alternate;
  z-index: 1;
}

/* Animasi hapus */
.cell.clearing { animation: pop .34s ease-in forwards; z-index: 2; }

/* ---------- tray ---------- */
#tray {
  display: flex; gap: 10px;
  width: var(--board);
  margin-top: 18px;
}
.slot {
  flex: 1;
  height: calc(var(--cell) * 3);
  display: grid; place-items: center;
  background: rgba(255, 255, 255, .05);
  border-radius: 14px;
}
.piece {
  display: grid; gap: var(--gap);
  --pc: calc(var(--cell) * .5);
  touch-action: none;          /* penting: cegah scroll saat drag di HP */
  cursor: grab;
  padding: 8px;                /* area sentuh lebih besar */
  transition: transform .12s;
}
.piece:hover { transform: scale(1.08); }
.piece.dragging { opacity: .2; }

.pc { width: var(--pc); height: var(--pc); border-radius: 4px; }
.pc.off { visibility: hidden; }

#drag-layer { position: fixed; inset: 0; pointer-events: none; z-index: 50; }
.drag-piece {
  position: fixed; left: 0; top: 0;
  display: grid; gap: var(--gap);
  --pc: var(--cell);
  will-change: transform;
  filter: drop-shadow(0 10px 12px rgba(0, 0, 0, .45));
}
.drag-piece .pc { border-radius: 6px; }

/* ---------- efek ---------- */
#fx { position: absolute; inset: 0; pointer-events: none; overflow: visible; z-index: 5; }
.particle { position: absolute; width: 8px; height: 8px; border-radius: 2px; }

.popup {
  position: absolute; left: 50%; top: 42%;
  transform: translate(-50%, 0);
  font-size: 26px; font-weight: 900; white-space: nowrap;
  color: #fff; text-shadow: 0 2px 10px #000, 0 0 18px var(--accent);
  animation: floatUp 1.1s ease-out forwards;
}
.popup.allclear { font-size: 38px; color: var(--accent); top: 30%; animation-duration: 1.6s; }

#toast {
  position: fixed; left: 50%; top: 16px;
  transform: translate(-50%, -80px);
  background: rgba(20, 16, 43, .95);
  border: 1px solid rgba(255, 255, 255, .2);
  padding: 10px 18px; border-radius: 14px;
  font-weight: 700; font-size: 14px; max-width: 92vw; text-align: center;
  transition: transform .35s cubic-bezier(.2, 1.2, .4, 1);
  z-index: 80;
}
#toast.show { transform: translate(-50%, 0); }

/* ---------- overlay game over ---------- */
#overlay {
  position: fixed; inset: 0; z-index: 90;
  display: grid; place-items: center;
  background: rgba(8, 5, 24, .8);
  backdrop-filter: blur(4px);
}
#overlay.hidden { display: none; }
#overlay .card {
  text-align: center; padding: 28px 40px; border-radius: 22px;
  background: linear-gradient(160deg, #3a2a86, #1a1240);
  border: 1px solid rgba(255, 255, 255, .2);
  animation: rise .4s ease-out;
}
#overlay h2 { margin: 0 0 6px; font-size: 28px; }
#overlay .big { font-size: 54px; font-weight: 900; margin: 4px 0; color: var(--accent); }
#overlay .sub { margin: 0 0 18px; color: var(--muted); }
#overlay button {
  font-size: 17px; font-weight: 800; padding: 12px 28px; border: 0; border-radius: 14px;
  background: var(--accent); color: #2a1b00; cursor: pointer;
}
#overlay button:active { transform: scale(.96); }

/* ---------- keyframes ---------- */
@keyframes pop {
  0%   { transform: scale(1);    filter: brightness(1); }
  40%  { transform: scale(1.18); filter: brightness(2.2); }
  100% { transform: scale(0);    opacity: 0; }
}
@keyframes pulse   { from { filter: brightness(1); } to { filter: brightness(1.5); } }
@keyframes floatUp { from { opacity: 1; transform: translate(-50%, 0); } to { opacity: 0; transform: translate(-50%, -80px); } }
@keyframes rise    { from { opacity: 0; transform: translateY(20px) scale(.95); } to { opacity: 1; transform: none; } }
```

---

## Langkah 3 — `js/config.js`

Semua angka penyetelan dikumpulkan di satu tempat supaya mudah diubah tanpa menyentuh logika. File ini hanya berisi data satu objek `CONFIG`.

Buat file `js/config.js`:

```js
// js/config.js
/* ============================================================
   config.js — semua angka yang bisa kamu ubah untuk "menyetel"
   game ada di sini. Tidak ada logika, hanya data.
   ============================================================ */
const CONFIG = {
  BOARD_SIZE: 8,          // papan 8 x 8
  PIECES_PER_ROUND: 3,    // jumlah blok yang dibagikan sekaligus

  // Warna dasar blok (dipadukan dengan tekstur fase)
  COLORS: ['#ff5a6e', '#ff9f43', '#ffd93d', '#3ddc84', '#35c4f0', '#6c7bff', '#c26cff'],

  SCORE: {
    PER_CELL: 1,           // poin tiap kotak yang diletakkan
    LINE_BASE: 10,         // poin dasar per baris/kolom: 10 * n * n
    COMBO_STEP: 0.5,       // tiap combo beruntun menambah 50%
    ALL_CLEAR_BONUS: 300   // bonus papan kosong total
  },

  PHASE: {
    MAX_FILES: 6,          // cek fase1.png ... fase6.png
    SCORE_STEP: 500        // naik fase tiap 500 poin
  },

  DIFFICULTY: {
    EASE_AFTER_ROUNDS: 8,         // tanpa full clear selama 8 ronde -> dipermudah
    ALL_CLEARS_FOR_PRESSURE: 3    // 3x full clear -> mode tekanan
  },

  // Peluang tiap tingkat bentuk per mode (bobot, bukan persen)
  WEIGHTS: {
    normal:   { mercy: 0, easy: 30, normal: 50, hard: 20 },
    eased:    { mercy: 8, easy: 57, normal: 33, hard: 2  },
    pressure: { mercy: 0, easy: 4,  normal: 26, hard: 70 }
  },

  GENERATOR: {
    MAX_TRIES: 80,            // percobaan membuat 3 blok yang adil
    SOLVER_NODE_LIMIT: 3500,  // batas pencarian cepat agar tidak lag
    VERIFY_NODE_LIMIT: 60000, // batas lebih besar untuk memverifikasi kandidat fallback
    RELAX_TRIES: 30,          // percobaan per mode yang lebih ringan bila mode asal gagal
    SAFE_TRIES: 40,           // percobaan set bentuk kecil sebagai jaring pengaman terakhir
    FINISHER_MAX_FILLED: 24   // mode mudah: bantu full clear bila isi papan <= ini
  },

  PATHS: {
    sounds: {
      place:    'assets/audio/place.mp3',
      clear:    'assets/audio/clear.mp3',
      allclear: 'assets/audio/allclear.mp3'
    },
    texture: (n) => `assets/img/fase${n}.png`
  },

  TIMING: { CLEAR_ANIM_MS: 340 },
  STORAGE_KEY: 'blockblast-solo-best'
};
```

---

## Langkah 4 — `js/shapes.js`

Katalog bentuk blok. Alih-alih menulis koordinat satu per satu, kita **menggambar bentuk dengan teks**:

```js
{ id: 'l3', tier: 'easy', rows: ['#.', '##'] }
```

`#` adalah kotak terisi. Fungsi `rotate90` otomatis memutar bentuk 4 kali, dan orientasi kembar dibuang (mis. kotak 2×2 hanya satu). Tiap bentuk punya **tier** (`mercy`, `easy`, `normal`, `hard`) yang dipakai generator untuk mengatur kesulitan.

Hasil akhirnya: `SHAPES` (dikelompokkan per tier) dan `ALL_SHAPES` (semua bentuk). Tiap bentuk berupa `{ id, cells, w, h, size }`.

Buat file `js/shapes.js`:

```js
// js/shapes.js
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
```

**Cek cepat** (setelah semua file selesai): buka konsol browser dan ketik `SHAPES.hard.length` — hasilnya `18`.

---

## Langkah 5 — `js/board.js`

Papan murni sebagai **data** (tanpa menyentuh HTML). Sel disimpan dalam array datar 64 angka: `-1` = kosong, `0–6` = indeks warna.

Metode penting:

| Metode | Fungsi |
|---|---|
| `canPlace(shape, r, c)` | apakah bentuk muat di posisi itu? |
| `place(shape, r, c, color)` | tempatkan bentuk |
| `findFullLines()` | cari baris & kolom yang penuh |
| `clearLines(lines)` | hapus (persilangan baris+kolom ikut terhapus tanpa dihitung ganda) |
| `positions(shape)` | semua posisi sah untuk sebuah bentuk |
| `clone()` | salin papan — dipakai solver untuk "mencoba-coba" tanpa merusak papan asli |

Memisahkan logika dari tampilan membuat generator bisa menyimulasikan ribuan langkah dengan cepat.

Buat file `js/board.js`:

```js
// js/board.js
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
```

---

## Langkah 6 — `js/difficulty.js`

Inilah **otak kesulitan adaptif**. File ini hanya menyimpan tiga hal:

- `allClears` — berapa kali full clear dalam siklus ini (0–3)
- `roundsSinceClear` — berapa ronde sejak full clear terakhir
- `pressure` — apakah mode tekanan aktif

`getMode()` menerjemahkannya menjadi `'normal'`, `'eased'`, atau `'pressure'`. `onAllClear()` dipanggil saat papan kosong dan menggeser status:

1. Mode tekanan aktif → **selesai**, hitungan 0, siklus mulai ulang.
2. Jika tidak → `allClears++`; bila sudah 3 → **mode tekanan dimulai**.
3. Di kedua kasus, `roundsSinceClear` direset sehingga mode dipermudah otomatis berakhir.

Buat file `js/difficulty.js`:

```js
// js/difficulty.js
/* ============================================================
   difficulty.js — mesin tiga kondisi kesulitan adaptif.

   NORMAL    : kondisi awal.
   DIPERMUDAH: aktif jika pemain belum full clear selama
               EASE_AFTER_ROUNDS ronde. Kembali NORMAL saat full clear.
   TEKANAN   : aktif setelah pemain full clear sebanyak
               ALL_CLEARS_FOR_PRESSURE kali. Berakhir saat full clear
               berikutnya, lalu siklus mulai dari nol.

   Modul ini hanya menyimpan STATUS. Pembuatan bentuk blok sesuai
   mode dikerjakan oleh generator.js.
   ============================================================ */
const Difficulty = {
  allClears: 0,        // jumlah full clear dalam siklus ini (0..3)
  roundsSinceClear: 0, // ronde sejak full clear terakhir
  pressure: false,     // apakah mode tekanan sedang aktif

  reset() {
    this.allClears = 0;
    this.roundsSinceClear = 0;
    this.pressure = false;
  },

  /** Mode yang berlaku saat ini. */
  getMode() {
    if (this.pressure) return 'pressure';
    if (this.roundsSinceClear >= CONFIG.DIFFICULTY.EASE_AFTER_ROUNDS) return 'eased';
    return 'normal';
  },

  /** Dipanggil tiap kali satu ronde (3 blok) dibagikan. */
  onRoundDealt() {
    this.roundsSinceClear++;
  },

  /**
   * Dipanggil saat papan kosong total.
   * @returns {'progress'|'pressure-start'|'pressure-end'}
   */
  onAllClear() {
    this.roundsSinceClear = 0;

    if (this.pressure) {            // tekanan selesai -> siklus baru
      this.pressure = false;
      this.allClears = 0;
      return 'pressure-end';
    }

    this.allClears++;
    if (this.allClears >= CONFIG.DIFFICULTY.ALL_CLEARS_FOR_PRESSURE) {
      this.pressure = true;
      return 'pressure-start';
    }
    return 'progress';
  }
};
```

---

## Langkah 7 — `js/generator.js`

Generator membagikan 3 blok sesuai mode. Cara kerjanya:

1. **Pilih bentuk berbobot.** `CONFIG.WEIGHTS[mode]` menentukan peluang tier. Misalnya tekanan: 70% bentuk `hard`, hanya 4% `easy`.
2. **Uji keadilan dengan solver (DFS).** `_solve()` mencoba semua urutan & posisi: *apakah ketiga blok masih bisa diletakkan satu per satu, dengan memperhitungkan baris yang terhapus di tengah jalan?* Solver mengembalikan **tiga status yang berbeda**:
   - `'solved'` — ada urutan yang berhasil (terbukti);
   - `'unsolvable'` — semua kemungkinan sudah dicoba, memang tidak ada solusi;
   - `'limit'` — pencarian **berhenti karena `SOLVER_NODE_LIMIT`**, artinya *tidak tahu*. Ini tidak boleh disamakan dengan "tidak ada solusi".

   Set yang tidak `solved` diundi ulang (maksimal 80 kali). Batas langkah pencarian mencegah game lag.
3. **Bantuan mode dipermudah:**
   - `_findFinisher()` mencari bentuk yang sekali taruh membuat papan kosong total.
   - Di 60% percobaan pertama, wajib ada minimal satu blok yang bisa menghapus baris (`_bestLines()`).
4. **Fallback yang diverifikasi (bukan sekadar "satu blok muat").** Bila mode yang diminta tidak menemukan set adil, urutannya:
   1. coba mode yang lebih ringan (tekanan → normal → dipermudah), `reason: 'relaxed'`;
   2. kandidat yang tadi berhenti karena `limit` diperiksa ulang dengan anggaran besar (`VERIFY_NODE_LIMIT`), `reason: 'verified-after-limit'`;
   3. set bentuk kecil yang diverifikasi, `reason: 'safe-fallback'`;
   4. jika semuanya gagal, game **jujur menandai** hasilnya: `meta.solvable = false` dengan `reason` `'unsolved-exhausted'` (semua dicoba, memang buntu — papan nyaris/sudah penuh) atau `'unsolved-limit'` (tidak terbukti karena anggaran habis).

   Setiap hasil `generateRound()` membawa `meta = { solvable, reason, mode }`, sehingga tes dan debugging bisa melihat apakah klaim "aman" benar-benar terbukti.

Buat file `js/generator.js`:

```js
// js/generator.js
/* ============================================================
   generator.js — membagikan 3 blok sesuai mode kesulitan.

   Prinsip: game tidak boleh terasa curang. Untuk setiap set 3 blok
   kita jalankan "solver" kecil yang memastikan ketiganya MASIH BISA
   diletakkan berurutan (dengan memperhitungkan baris yang terhapus).

   Solver mengembalikan TIGA status yang berbeda:
     'solved'     : ada urutan penempatan yang berhasil (terbukti)
     'unsolvable' : seluruh kemungkinan sudah dicoba, tidak ada solusi
     'limit'      : pencarian berhenti karena SOLVER_NODE_LIMIT -> TIDAK TAHU

   Hasil generateRound() adalah array 3 blok dengan properti `meta`:
     meta.solvable : true hanya jika sudah DIBUKTIKAN solvable
     meta.reason   : 'solved' | 'relaxed' | 'verified-after-limit' |
                     'safe-fallback' | 'unsolved-limit' | 'unsolved-exhausted'
     meta.mode     : mode yang benar-benar dipakai (bisa lebih ringan
                     dari yang diminta bila mode asal tak menemukan set adil)
   ============================================================ */
const Generator = {

  /** @returns {{shape:Object,color:number}[]} dengan properti .meta */
  generateRound(board, mode) {
    const G = CONFIG.GENERATOR;
    const filled = board.filledCount();

    // Mode mudah: bila papan hampir kosong, cari blok penyelesai (full clear)
    let finisher = null;
    if (mode === 'eased' && filled > 0 && filled <= G.FINISHER_MAX_FILLED) {
      finisher = this._findFinisher(board);
    }

    const ctx = { finisher, fit: null, limited: [], sawLimit: false };

    // Tangga mode: coba mode diminta dulu, lalu yang lebih ringan
    const ladder = { pressure: ['pressure', 'normal', 'eased'], normal: ['normal', 'eased'], eased: ['eased'] }[mode] || ['normal'];
    for (let li = 0; li < ladder.length; li++) {
      const m = ladder[li];
      const found = this._search(board, m, li === 0 ? G.MAX_TRIES : G.RELAX_TRIES, ctx);
      if (found) return this._wrap(found, { solvable: true, reason: li === 0 ? 'solved' : 'relaxed', mode: m });
    }

    // Kandidat yang tadi berhenti karena batas -> verifikasi dengan anggaran lebih besar
    for (const cand of ctx.limited.slice(0, 5)) {
      const status = this._solve(board, cand, G.VERIFY_NODE_LIMIT);
      if (status === 'solved') {
        return this._wrap(cand, { solvable: true, reason: 'verified-after-limit', mode });
      }
      if (status === 'limit') ctx.sawLimit = true;
    }

    // Jaring pengaman: set bentuk kecil yang diverifikasi
    for (let t = 0; t < G.SAFE_TRIES; t++) {
      const cand = [];
      while (cand.length < CONFIG.PIECES_PER_ROUND) {
        cand.push(this._rand(Math.random() < 0.3 ? SHAPES.mercy : SHAPES.easy));
      }
      const status = this._solve(board, cand, G.VERIFY_NODE_LIMIT);
      if (status === 'solved') return this._wrap(cand, { solvable: true, reason: 'safe-fallback', mode: 'eased' });
      if (status === 'limit') ctx.sawLimit = true;
    }

    // Tidak terbukti ada set yang adil. Jujur ditandai; pakai set yang minimal satu bloknya muat.
    let shapes = ctx.fit;
    if (!shapes) {
      shapes = [];
      while (shapes.length < CONFIG.PIECES_PER_ROUND) shapes.push(this._rand(SHAPES.easy));
    }
    return this._wrap(shapes, {
      solvable: false,
      reason: ctx.sawLimit ? 'unsolved-limit' : 'unsolved-exhausted',
      mode
    });
  },

  /* ---------- satu putaran percobaan untuk satu mode ---------- */
  _search(board, mode, tries, ctx) {
    const G = CONFIG.GENERATOR;
    const filled = board.filledCount();
    const count = CONFIG.PIECES_PER_ROUND;

    for (let t = 0; t < tries; t++) {
      const shapes = [];
      if (mode === 'eased' && ctx.finisher) shapes.push(ctx.finisher);
      while (shapes.length < count) shapes.push(this._pickShape(mode));
      this._shuffle(shapes);

      if (!ctx.fit && shapes.some(s => board.canFit(s))) ctx.fit = shapes;

      // mode mudah: di 60% percobaan pertama, wajib ada blok yang bisa menghapus baris
      if (mode === 'eased' && !ctx.finisher && filled >= 6 && t < tries * 0.6) {
        if (!shapes.some(s => this._bestLines(board, s) > 0)) continue;
      }

      const status = this._solve(board, shapes, G.SOLVER_NODE_LIMIT);
      if (status === 'solved') return shapes;
      if (status === 'limit') { ctx.sawLimit = true; ctx.limited.push(shapes); }
    }
    return null;
  },

  /* ---------- pemilihan bentuk ---------- */
  _pickShape(mode) {
    const weights = CONFIG.WEIGHTS[mode];
    let total = 0;
    for (const k in weights) total += weights[k];
    let roll = Math.random() * total;
    for (const tier in weights) {
      roll -= weights[tier];
      if (roll < 0 && weights[tier] > 0) return this._rand(SHAPES[tier]);
    }
    return this._rand(SHAPES.normal);
  },

  _wrap(shapes, meta) {
    const pieces = shapes.map(shape => ({
      shape,
      color: Math.floor(Math.random() * CONFIG.COLORS.length)
    }));
    pieces.meta = meta;
    return pieces;
  },

  /* ---------- solver: apakah semua blok bisa diletakkan berurutan? ---------- */
  /** @returns {'solved'|'unsolvable'|'limit'} */
  _solve(board, shapes, limit) {
    const st = { nodes: 0, limit, hitLimit: false };
    if (this._dfs(board, shapes, st)) return 'solved';
    return st.hitLimit ? 'limit' : 'unsolvable';
  },

  _dfs(board, shapes, st) {
    if (shapes.length === 0) return true;
    const tried = new Set();
    for (let i = 0; i < shapes.length; i++) {
      const s = shapes[i];
      if (tried.has(s.id)) continue;       // bentuk sama tak perlu dicoba ulang
      tried.add(s.id);
      const rest = shapes.filter((_, j) => j !== i);

      for (const [r, c] of board.positions(s)) {
        if (++st.nodes > st.limit) { st.hitLimit = true; return false; }
        const next = board.clone();
        next.place(s, r, c, 0);
        next.clearLines(next.findFullLines());
        if (this._dfs(next, rest, st)) return true;
        if (st.hitLimit) return false;     // sudah kehabisan anggaran: hentikan semua cabang
      }
    }
    return false;
  },

  /* ---------- bantuan mode mudah ---------- */
  // Berapa baris/kolom paling banyak yang bisa dihapus bentuk ini?
  _bestLines(board, shape) {
    let best = 0;
    for (const [r, c] of board.positions(shape)) {
      const b = board.clone();
      b.place(shape, r, c, 0);
      best = Math.max(best, b.findFullLines().count);
    }
    return best;
  },

  // Cari bentuk yang sekali taruh mengosongkan papan sepenuhnya.
  _findFinisher(board) {
    for (const shape of this._shuffle([...ALL_SHAPES])) {
      for (const [r, c] of board.positions(shape)) {
        const b = board.clone();
        b.place(shape, r, c, 0);
        b.clearLines(b.findFullLines());
        if (b.isEmpty()) return shape;
      }
    }
    return null;
  },

  /* ---------- util ---------- */
  _rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
};
```

---

## Langkah 8 — `js/audio.js`

Memutar `place.mp3`, `clear.mp3`, dan `allclear.mp3`. Dua trik:

- **`cloneNode()`** — tiap pemutaran memakai salinan elemen audio, sehingga suara bisa tumpang tindih (mis. *place* lalu *clear* hampir bersamaan) tanpa terpotong.
- **Cadangan bip** — bila file tak ditemukan, `_beep()` membuat nada lewat Web Audio API, jadi game tetap bersuara.

Browser memblokir suara sebelum pengguna berinteraksi; aman di sini karena suara baru dimainkan setelah pemain menyeret blok.

Buat file `js/audio.js`:

```js
// js/audio.js
/* ============================================================
   audio.js — efek suara place.mp3, clear.mp3, allclear.mp3.
   Jika file tidak ditemukan, otomatis memakai bunyi "bip" sintetis
   (Web Audio) agar game tetap bersuara.
   ============================================================ */
const SFX = {
  enabled: true,
  sounds: {},
  failed: {},
  ctx: null,

  init() {
    for (const [name, src] of Object.entries(CONFIG.PATHS.sounds)) {
      const a = new Audio(src);
      a.preload = 'auto';
      a.addEventListener('error', () => { this.failed[name] = true; });
      this.sounds[name] = a;
    }
  },

  play(name) {
    if (!this.enabled) return;
    const base = this.sounds[name];
    if (base && !this.failed[name]) {
      // cloneNode agar suara bisa tumpang tindih (mis. place + clear)
      const a = base.cloneNode();
      a.volume = name === 'place' ? 0.6 : 0.9;
      a.play().catch(() => this._beep(name));
    } else {
      this._beep(name);
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  /* ---------- cadangan: bunyi sintetis ---------- */
  _beep(name) {
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const seqs = {
        place:    [[300, 0.08]],
        clear:    [[520, 0.09], [660, 0.09], [780, 0.12]],
        allclear: [[520, 0.1], [660, 0.1], [780, 0.1], [1040, 0.1], [1320, 0.25]]
      };
      let t = this.ctx.currentTime;
      for (const [freq, dur] of seqs[name] || []) {
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g).connect(this.ctx.destination);
        o.start(t); o.stop(t + dur);
        t += dur;
      }
    } catch (e) { /* abaikan */ }
  }
};
```

---

## Langkah 9 — `js/textures.js`

Mengelola tekstur bertahap. Prosesnya:

1. `preload()` memuat `fase1.png … fase6.png` di awal (supaya tidak berkedip nanti). File yang gagal dimuat ditandai `false`, bukan menghentikan game.
2. `phaseForScore(score)` → fase = 1 + skor ÷ 500, dibatasi `MAX_FILES`.
3. `apply(phase)` memasang tekstur lewat variabel CSS `--block-tex`. Semua blok di papan dan tray **berubah serentak** karena CSS membaca variabel yang sama.
4. Jika `fase4.png` tidak ada, dipakai fase terdekat di bawahnya yang ada.

> URL dibuat **absolut** dengan `new URL(...)`. Alasannya: `url()` relatif di dalam variabel CSS bisa dihitung dari lokasi file CSS (`css/`), bukan dari `index.html`, sehingga gambar tidak ketemu.

Buat file `js/textures.js`:

```js
// js/textures.js
/* ============================================================
   textures.js — tekstur blok bertahap: fase1.png, fase2.png, ...
   Fase naik mengikuti skor. Tekstur dipasang lewat variabel CSS
   --block-tex, jadi seluruh blok berubah sekaligus.
   Bila file fase tertentu tidak ada, dipakai fase terdekat di bawahnya.
   ============================================================ */
const Textures = {
  loaded: {},       // { 1: true, 2: true, ... }
  current: 0,

  // Memuat semua gambar lebih dulu supaya tidak berkedip saat berganti fase
  preload() {
    const jobs = [];
    for (let n = 1; n <= CONFIG.PHASE.MAX_FILES; n++) {
      jobs.push(new Promise(resolve => {
        const img = new Image();
        img.onload  = () => { this.loaded[n] = true;  resolve(); };
        img.onerror = () => { this.loaded[n] = false; resolve(); };
        img.src = CONFIG.PATHS.texture(n);
      }));
    }
    return Promise.all(jobs);
  },

  // Skor -> nomor fase (1, 2, 3, ...)
  phaseForScore(score) {
    const p = 1 + Math.floor(score / CONFIG.PHASE.SCORE_STEP);
    return Math.min(p, CONFIG.PHASE.MAX_FILES);
  },

  // Cari file terdekat yang benar-benar ada
  urlFor(phase) {
    for (let n = phase; n >= 1; n--) {
      if (this.loaded[n]) {
        // URL absolut: url() relatif di dalam variabel CSS bisa salah rujukan
        return new URL(CONFIG.PATHS.texture(n), document.baseURI).href;
      }
    }
    return null;
  },

  apply(phase) {
    this.current = phase;
    const url = this.urlFor(phase);
    const root = document.documentElement;
    root.style.setProperty('--block-tex', url ? `url("${url}")` : 'none');
    document.body.dataset.phase = phase;
    document.body.classList.toggle('no-tex', !url);
  }
};
```

---

## Langkah 10 — `js/ui.js`

Semua yang menyentuh tampilan ada di sini. Bagian terpenting adalah **drag-and-drop** dengan *Pointer Events* (satu kode untuk mouse, layar sentuh, dan pen):

1. `pointerdown` pada blok di tray → buat salinan besar (`.drag-piece`) seukuran blok di papan.
2. `pointermove` → salinan mengikuti pointer. Pojok kiri-atas salinan dikonversi ke baris/kolom papan dengan `Math.round((posisi - asal) / ukuranSel)`.
3. Di layar sentuh, blok diangkat **±2 sel di atas jari** (`lift`) supaya tidak tertutup jari.
4. Setiap posisi berubah, `_showPreview()` menampilkan **bayangan** penempatan dan menyorot baris/kolom yang akan terhapus.
5. `pointerup` → bila posisi sah **dan blok itu masih blok yang sama di tray**, panggil `Game.place()`; bila tidak, blok kembali ke tray.
6. `cancelDrag()` membatalkan drag tanpa meletakkan apa pun. Dipanggil oleh `Game.newGame()` agar restart di tengah drag tidak membuat blok "nyasar" ke permainan baru.

Efek lain: partikel (Web Animations API), teks skor melayang, *toast* notifikasi, dan layar game over.

Buat file `js/ui.js`:

```js
// js/ui.js
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
```

---

## Langkah 11 — `js/game.js` dan `js/main.js`

`game.js` adalah **sutradara** yang menghubungkan semua modul. Alur satu langkah di `place()`:

```
taruh blok → bunyi "place" → skor kotak
   └─ ada garis penuh?
        ├─ ya  → combo++ → cek apakah hasilnya papan kosong
        │         → bunyi clear / allclear → animasi → hapus → skor garis
        │         └─ papan kosong? → bonus + Difficulty.onAllClear()
        └─ tidak → combo = 0
→ tambah skor (+ cek naik fase)
→ tray kosong? bagikan 3 blok baru (mode sesuai Difficulty)
→ ada blok yang masih muat? bila tidak → GAME OVER
```

Perhatikan `locked = true` selama animasi: pemain tak bisa menyeret blok di tengah animasi.

**Mencegah race condition saat restart (session token).** `place()` punya `await` (animasi hapus ±340 ms). Tombol restart tetap bisa ditekan selama itu, sehingga tanpa perlindungan, `place()` lama akan *melanjutkan* eksekusi di atas papan permainan baru: menghapus sel, menambah skor, bahkan menghitung full clear yang salah. Solusinya:

```js
newGame() { this.session++; ... }          // token naik tiap permainan baru
async place(...) {
  const token = this.session;              // catat token saat mulai
  ...
  await UI.animateClear(...);
  if (token !== this.session) return false;   // sesi sudah basi -> berhenti, jangan sentuh apa pun
  ...
}
```

Hal yang sama untuk **timeout Game Over**: `setTimeout` disimpan di `gameOverTimer`, dibatalkan di `newGame()`, dan callback-nya memeriksa `token === session` serta `over === true` sebelum menampilkan overlay.

Buat file `js/game.js`:

```js
// js/game.js
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
```

Terakhir, `js/main.js` hanya satu baris yang menyalakan game:

```js
// js/main.js
/* ============================================================
   main.js — titik masuk. Skrip dimuat di akhir <body>, jadi DOM
   sudah siap; cukup panggil Game.start().
   ============================================================ */
Game.start();
```

---

## Langkah 12 — Tes otomatis

Ada dua lapis tes (memakai *test runner* bawaan Node.js 20+, tanpa framework tambahan):

| Lapis | Folder | Menguji | Butuh browser? |
|---|---|---|---|
| **Unit** | `tests/unit/` | papan 8×8, penempatan, batas papan, hapus baris/kolom, full clear 64 sel, siklus kesulitan, generator & solver, keberadaan/format aset, urutan `<script>`, sintaks JS | Tidak |
| **Browser** | `tests/browser/` | halaman sungguhan di Chromium: drag-drop mouse, full clear di DOM, siklus normal → tekanan, **restart saat animasi**, **restart saat drag**, **restart setelah Game Over dipicu**, aset diminta lewat HTTP & didekode | Ya (Playwright) |

**Cara menjalankan:**

```bash
npm install                          # memasang playwright (hanya untuk tes browser)
npx playwright install chromium      # mengunduh Chromium (sekali saja)

npm run test:unit                    # cepat, tanpa browser
npm run test:browser                 # tes di Chromium sungguhan
npm test                             # keduanya
```

Tanpa `npm install`, `npm run test:unit` tetap bisa dijalankan; tes browser akan **melaporkan bahwa ia dilewati** (bukan diam-diam lulus).

**Bagaimana tes memverifikasi generator tanpa "menilai dirinya sendiri":** `tests/helpers/load.js` berisi *verifier* DFS terpisah (`exhaustivelySolvable`) yang tidak memakai kode `Generator`. Setiap kali generator mengklaim `meta.solvable === true`, tes memeriksanya dengan verifier independen itu, termasuk pada papan acak.

**Tes browser memakai teknik "tahan animasi":** `CONFIG.TIMING.CLEAR_ANIM_MS` dinaikkan menjadi 1200 ms agar ada jendela waktu untuk menekan tombol restart di tengah animasi. Papan sengaja disusun (baris 0 terisi 7 sel + titik di sel terakhir) agar penempatan lama *pasti* berakhir sebagai full clear. Jika perlindungan session token dihapus, tes ini gagal.

**Mengecek bahwa tes benar-benar menangkap bug:** arahkan tes ke salinan kode lama dengan variabel `BB_ROOT`:

```bash
BB_ROOT=/path/ke/versi-lama npm run test:browser
```

Pada versi sebelum perbaikan, tiga tes bertanda `BUG 1`, `BUG 1b`, dan `BUG 2` gagal; pada versi ini semuanya lulus.

Kode tes:

```js
// tests/helpers/load.js
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
```

```js
// tests/helpers/server.js
/* Server statis kecil untuk tes browser (tanpa dependensi). */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json' };

function startServer(root) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(root, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => {
    resolve({ url: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise(r => server.close(r)) });
  }));
}
module.exports = { startServer };
```

```js
// tests/unit/board.test.js
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
```

```js
// tests/unit/difficulty.test.js
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
```

```js
// tests/unit/generator.test.js
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
```

```js
// tests/unit/assets.test.js
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
```

```js
// tests/browser/game.browser.test.js
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
```

`package.json`:

```json
{
  "name": "block-blast-solo",
  "version": "1.1.0",
  "private": true,
  "description": "Block Blast Solo Unlimited - game puzzle web 8x8",
  "scripts": {
    "test": "node --test \"tests/**/*.test.js\"",
    "test:unit": "node --test \"tests/unit/*.test.js\"",
    "test:browser": "node --test \"tests/browser/*.test.js\"",
    "serve": "python3 -m http.server 8000"
  },
  "devDependencies": {
    "playwright": "^1.48.0"
  }
}
```

> **Catatan jujur tentang cakupan:** tes browser memakai Chromium *headless*. Uji sentuh di HP asli, kualitas suara, dan tampilan di Safari/Firefox tetap perlu dicoba manual. Dekode MP3 diuji hanya bila Chromium yang dipakai mendukung codec MP3 (tes mencetak keterangan bila tidak).

---

## Menjalankan & menguji manual

1. Simpan semua file, lalu jalankan server lokal (Live Server atau `python3 -m http.server 8000`).
2. Buka halaman, tekan **F12** → tab *Console*. Pastikan **tidak ada error merah**.
3. Seret blok ke papan. Kamu harus melihat bayangan penempatan, mendengar suara *place*, dan skor bertambah.
4. Isi satu baris penuh → terdengar *clear*, partikel muncul, skor naik.

**Menguji mode kesulitan tanpa harus bermain lama.** Tempel perintah ini di konsol:

```js
// 1) Paksa mode tekanan: simulasi 3x full clear
Difficulty.allClears = 2;       // lalu lakukan 1x full clear sungguhan, atau:
Difficulty.onAllClear();        // -> 'pressure-start'
Game._dealRound();              // bagikan blok baru bergaya tekanan

// 2) Paksa mode dipermudah
Difficulty.reset();
Difficulty.roundsSinceClear = 8;
Game._dealRound();

// 3) Lompat ke fase tekstur berikutnya
Game._addScore(500);

// 4) Lihat status
Difficulty.getMode();           // 'normal' | 'eased' | 'pressure'
```

**Daftar periksa akhir:**

- [ ] Blok bisa diseret dengan mouse **dan** jari (uji di HP)
- [ ] Baris dan kolom terhapus; persilangan tidak dihitung ganda
- [ ] Tiga suara terdengar di momen yang benar
- [ ] Badge berubah: NORMAL → DIPERMUDAH → TEKANAN
- [ ] Tiga titik kuning terisi tiap full clear; merah semua saat tekanan
- [ ] Tekstur berganti tiap 500 poin
- [ ] Skor terbaik tetap tersimpan setelah halaman di-*refresh*
- [ ] Tekan ↻ saat animasi hapus berlangsung: skor 0, papan bersih, tidak ada efek sisa
- [ ] Tekan ↻ tepat setelah Game Over: overlay lama tidak muncul di permainan baru

---

## Publikasi ke GitHub Pages

1. Simpan & kirim semua kode:

```bash
git add .
git commit -m "Block Blast Solo Unlimited: versi pertama"
git push
```

2. Di halaman repository GitHub: **Settings → Pages**.
3. Pada *Build and deployment* → **Source: Deploy from a branch**. Branch: `main`, folder: `/ (root)`. Klik **Save**.
4. Tunggu 1–2 menit. Game bisa dimainkan di:

```
https://USERNAME-KAMU.github.io/block-blast-solo/
```

> Karena semua path aset relatif (`assets/img/...`), game berjalan benar di sub-folder GitHub Pages tanpa pengaturan tambahan.

**Alur kerja berkelanjutan:** buat *branch* tiap fitur (`git checkout -b fitur-combo`), ubah, uji, lalu *Pull Request* ke `main`. Setiap `push` ke `main` otomatis memperbarui situs.

---

## Menyetel game (tuning)

Semua ada di `js/config.js`:

| Ingin… | Ubah |
|---|---|
| Bantuan datang lebih cepat/lambat | `DIFFICULTY.EASE_AFTER_ROUNDS` (default 8) |
| Tekanan lebih jarang/sering | `DIFFICULTY.ALL_CLEARS_FOR_PRESSURE` (default 3) |
| Tekanan lebih kejam | naikkan bobot `hard` di `WEIGHTS.pressure` |
| Mode mudah lebih murah hati | naikkan `mercy` & `easy` di `WEIGHTS.eased` |
| Ganti tekstur lebih cepat/lambat | `PHASE.SCORE_STEP` (default 500) |
| Lebih banyak fase | `PHASE.MAX_FILES` + tambah `faseN.png` |
| Skor lebih besar | `SCORE.*` |
| Papan lain (mis. 10×10) | `BOARD_SIZE`, lalu ubah `repeat(8, ...)` dan `/ 8` di CSS |
| Bentuk blok baru | tambah satu baris di `SHAPE_DEFS` (`shapes.js`) — lalu perbarui jumlah bentuk di `board.test.js` |
| Batas pencarian solver | `GENERATOR.SOLVER_NODE_LIMIT` (cepat), `VERIFY_NODE_LIMIT` (verifikasi fallback) |

---

## Mengganti aset suara & tekstur

**Suara** (`assets/audio/`): ganti `place.mp3`, `clear.mp3`, `allclear.mp3` dengan file milikmu, **dengan nama yang sama**. Saran: *place* sangat pendek (<0,2 dtk), *clear* ±0,5 dtk, *allclear* ±1–2 dtk. Sumber gratis: [freesound.org](https://freesound.org), [pixabay.com/sound-effects](https://pixabay.com/sound-effects/). Periksa lisensinya.

**Tekstur** (`assets/img/`): `fase1.png`, `fase2.png`, `fase3.png`, dst.

- Ukuran 64×64 hingga 256×256 piksel, persegi.
- Karena memakai mode *overlay*, tekstur terbaik berwarna **abu-abu/netral**: area abu-abu menengah tidak mengubah warna blok, area terang memberi kilau, area gelap memberi bayangan. Tekstur berwarna cerah akan menggeser warna blok.
- Mau lebih dari 6 fase? Tambah file `fase7.png`, dst., lalu naikkan `PHASE.MAX_FILES`.

---

## Pemecahan masalah

| Gejala | Penyebab & solusi |
|---|---|
| Halaman kosong, konsol: `X is not defined` | Urutan `<script>` salah atau nama file salah ketik. Ikuti urutan di `index.html`. |
| Error 404 pada `fase1.png` | Nama/folder salah. Harus `assets/img/fase1.png` (huruf kecil). |
| Tidak ada suara | Pastikan tombol 🔊 aktif & file `.mp3` ada. Di iPhone, pastikan mode senyap mati. |
| Blok tidak bisa diseret di HP | Pastikan `touch-action: none` ada pada `.piece` di CSS. |
| Di GitHub Pages gambar hilang | Periksa huruf besar/kecil nama file (server GitHub membedakannya). |
| Skor terbaik tidak tersimpan | Mode privat browser memblokir `localStorage`; kode sudah aman, hanya tidak tersimpan. |
| Game terasa lag di mode tekanan | Turunkan `GENERATOR.SOLVER_NODE_LIMIT`, `VERIFY_NODE_LIMIT`, atau `MAX_TRIES`. |
| Tes browser dilewati | Jalankan `npm install` lalu `npx playwright install chromium`. |
| Tes browser macet menunggu `Game` | `Game` adalah `const` global, bukan `window.Game`; pakai `typeof Game !== 'undefined'`. |

---

## Ide pengembangan

- Menyimpan skor tertinggi online (Firebase / Supabase).
- Bonus "warna sama satu garis" (garis satu warna = poin ekstra).
- Tombol *undo* satu langkah atau *hold* satu blok.
- Mode *daily challenge* dengan seed acak yang sama untuk semua pemain.
- Getaran HP saat combo: `navigator.vibrate(30)`.
- Tema warna berbeda per fase (ubah `--bg1` di CSS lewat `data-phase`).
- Mengubah proyek menjadi PWA (tambahkan `manifest.json` + *service worker*) agar bisa dipasang di HP.

Selamat membuat game! 🎮
