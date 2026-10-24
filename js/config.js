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
