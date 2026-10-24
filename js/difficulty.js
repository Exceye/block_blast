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
