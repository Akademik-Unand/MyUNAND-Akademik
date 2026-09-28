# Pengujian UI kalender KRS

Jalankan dari folder `e2e`:

```sh
npm ci
npx playwright install chromium
npm run test:ui
```

Konfigurasi `playwright.ui.config.mjs` menjalankan Vite di port 5199 dan menggunakan respons API terisolasi dari `krs-calendar.fixture.mjs`. Tidak membutuhkan backend/DB, tidak menjalankan `global-setup.mjs` atau `resetSandbox`. Ini menguji integrasi UI; kontrak service backend diuji terpisah melalui Jest.

Jika browser sudah tersedia, `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` dapat menunjuk executable Chrome/Chromium. Pada Linux, pastikan pustaka sistem yang dibutuhkan Playwright tersedia.

Cakupan: bentrok dengan UUID, interval bersambung, beberapa sesi dan hari Minggu, pengajuan lintas yang masih menunggu PA, pengajuan ditolak yang tidak mengikat, jadwal belum lengkap, pratinjau tanpa mutasi, tambah/hapus KRS, jadwal berubah saat submit, API gagal dan pulih, KRS disetujui, semester belum aktif, serta agenda ponsel dengan teks besar dan tema gelap.

Kalender tersedia melalui **Pengambilan KRS → Mata Kuliah di KRS Anda → Kalender Mingguan**. Pilih kelas lalu klik **Pratinjau jadwal** untuk membandingkan dengan KRS aktif. Sesi dapat diklik untuk membuka detail dan rentang bentrok. Jadwal baru disimpan saat menekan **Ambil/Ajukan**.