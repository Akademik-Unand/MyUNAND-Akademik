# Penjadwalan Global

Menu: **Perkuliahan → Penjadwalan Global** (`/perkuliahan/penjadwalan`).

## Menjalankan

Prasyarat: Node sesuai proyek, MySQL, dan Python 3.11–3.13. Worker menggunakan OR-Tools CP-SAT; API tetap Express. Tidak ada dependensi Python pada proses HTTP.

```powershell
cd backend
npm ci
npm run db:migrate
npx sequelize-cli db:seed --seed 20261012065923-penjadwalan-permissions.js
python -m pip install --target .python-deps -r solver/requirements.txt
npm run worker:penjadwalan
```

Jalankan backend/frontend seperti biasa pada terminal lain. Untuk venv, instal requirements pada venv dan set `PENJADWALAN_PYTHON` ke executable Python-nya. Contoh konfigurasi: `.env.penjadwalan.example`. Default batas pencarian server 300 detik, polling antrean 2 detik. Batas yang diminta skenario dibatasi lagi oleh server.

Docker Compose menyediakan service `penjadwalan-worker` terpisah, dengan Python venv di image Debian. Jalankan migrasi dan seeder permission sebelum mengaktifkan worker. Image HTTP tetap tidak memerlukan Python. Build Docker belum menjadi pengganti pengujian data pilot.

Migrasi lama `056-update-shift-and-jadwal-kelas.js` merupakan prasyarat karena pola minggu dan waktu jadwal dipakai oleh modul ini. Modul baru menambah lima tabel `penjadwalan_*` dan pointer publikasi aktif pada semester. Jangan mengubah migrasi yang sudah diterapkan.

## Alur pilot FTI

1. Pusat memilih semester dan fakultas, mengonfirmasi gedung F/G sebagai utama, lalu menetapkan cadangan secara eksplisit. Tidak ada pencocokan nama atau alokasi gedung otomatis saat seeding.
2. Isi jenis/fasilitas/zona ruang, waktu tidak tersedia, reservasi, dan waktu perpindahan dua arah. Reservasi dan ketidaktersediaan seluruh kebijakan pada semester yang sama berlaku lintas fakultas.
3. Fakultas membuat skenario dan kebutuhan setiap sesi: durasi, pola minggu, kelompok paket, jenis/fasilitas ruang. Semua kelas fakultas pada semester terpilih harus tercakup sebelum simulasi/publikasi; draf dapat disimpan bertahap. Tambahkan sesi untuk kelas yang bertemu lebih dari sekali. Durasi harus diverifikasi sesuai kebijakan teori/praktikum; solver tidak menebak dari total SKS.
4. Unduh template atau petakan kolom Excel/CSV jadwal lama. Periksa pratinjau, perbaiki kesalahan, lalu simpan sebagai acuan. Penempatan lama yang melanggar kebijakan merupakan peringatan, bukan izin melanggar aturan.
5. Kunci ruang/waktu sesi yang harus tetap, kemudian jalankan simulasi. Jadwal fakultas lain pada semester tersebut menjadi okupansi tetap, termasuk dosen pengampunya.
6. Tinjau kalender, perubahan, dan usulan cadangan. Penolakan cadangan mengecualikan penempatan yang ditolak pada simulasi berikutnya; aturan wajib tetap berlaku.
7. Fakultas menyetujui tinjauan; pusat menyetujui setiap cadangan dan mengesahkan versi. Perubahan keputusan tinjauan/cadangan membatalkan pengesahan pusat sebelumnya.
8. Publikasi memvalidasi ulang sumber dan persetujuan, lalu mengganti jadwal fakultas dalam transaksi. Jadwal fakultas lain tetap ada. Pointer semester menunjuk satu snapshot publikasi global terakhir; seluruh publikasi terdahulu tetap tersimpan.

Setelah publikasi, endpoint jadwal lama menolak perubahan penempatan semester tersebut. Gunakan salinan skenario dan persetujuan baru. Publikasi tidak otomatis dijalankan oleh worker. Perubahan data master/roster tetap harus dikelola pengelola dan diperiksa dampaknya; snapshot menyimpan kondisi saat pengesahan.

## Aturan dan algoritma

Aturan wajib meliputi ruang/dosen/kelompok peserta/kelas tidak bentrok, kapasitas, fasilitas, jenis ruang, kalender waktu, pola minggu, kunci, reservasi, dan perpindahan. Seluruh dosen kelas dianggap wajib hadir pada setiap sesi; pengaturan dosen per sesi belum digunakan sebagai pengecualian.

Kelompok paket diberi namespace fakultas. Nama yang sama pada beberapa sesi di fakultas yang sama berarti peserta bersama. Konflik berdasarkan KRS individual dan paket bersama lintas fakultas belum dimodelkan; keduanya membutuhkan data peserta tambahan.

Setiap window waktu memberikan satu kandidat jam mulai; sesi harus selesai sebelum batas akhir. Jadwal acuan dengan jam mulai lain tetap dapat menjadi kandidat jika berada dalam window. Default formulir: Senin–Jumat, mulai tiap 30 menit dari 07:00 sampai 16:30, selesai maksimal 18:00. Sesuaikan sebelum menjalankan pilot. Istirahat ditetapkan melalui aturan ketidaktersediaan.

Worker pertama mencari solusi menggunakan gedung utama. Gedung cadangan baru dibuka jika model utama **terbukti INFEASIBLE**. Jika pencarian utama habis waktu tanpa kesimpulan, status UNKNOWN, bukan bukti bahwa gedung utama tidak cukup.

Optimasi leksikografis: jumlah cadangan → jumlah sesi berubah → perubahan hari/jam → perubahan gedung → perubahan ruang → jeda dan ketimpangan beban harian. Prioritas sebelumnya dikunci hanya setelah optimum terbukti. Jika suatu fase hanya menemukan FEASIBLE, solusi valid tersebut dikembalikan tanpa mengorbankannya untuk fase berikutnya. Tujuan terakhir memakai jeda berdasarkan rentang hari, ketimpangan beban per dosen/kelompok, serta penalti 30 menit per gedung tambahan yang dikunjungi per hari untuk minggu ganjil/genap. Jumlah gedung yang dikunjungi merupakan pendekatan pengurangan perpindahan, bukan perhitungan rute berjalan kaki.

Validator Node memeriksa seluruh penempatan hasil terhadap snapshot, kelengkapan sesi, kunci, dan seluruh pasangan jadwal; tidak menerima status solver saja. Batas model pilot: 40.000 kandidat dan 2.000.000 pasangan bentrok. Model yang melampaui batas ditolak dengan alasan agar pengelola mempersempit ruang/waktu. Ini bukan jaminan kapasitas seuniversitas.

Jadwal acuan tidak menjamin hak memakai gedung. Ruang tanpa kapasitas/jenis yang memadai tidak ditawarkan. Waktu perpindahan yang belum diketahui membatasi perpindahan antargedung pada hari sama untuk dosen/kelompok terkait; lengkapi dua arah, bukan mengasumsikan nol menit.

## Kontrak API

Prefix `/api/v1/penjadwalan`. Semua memakai auth, CASL, Joi, envelope API proyek, dan audit aktivitas untuk operasi tulis. Collection memakai `page`, `limit`, `search`, `sortBy`, `sortOrder`, `filter[...]`; data array dan pagination terpisah. Halaman/skema kebijakan dibatasi scope fakultas; configure/approve/publish mensyaratkan scope universitas.

| Method | Path | Fungsi / permission |
|---|---|---|
| GET | `/setup?semester_id=UUID&fakultas_id=UUID` | Pilihan kelas, sumber daya, kebijakan; `read` |
| GET / PUT | `/policies` | Daftar `read`; simpan `configure` |
| GET / POST | `/scenarios` | Daftar `read`; buat `create` |
| GET / PUT | `/scenarios/:id` | Detail `read`; ubah input/penempatan `update` |
| POST | `/scenarios/:id/simulate` | Antrekan, HTTP 202 + ID pekerjaan; `simulate` |
| POST | `/scenarios/:id/cancel` | Batalkan pekerjaan antre/berjalan; `simulate` |
| GET | `/scenarios/:id/jobs` | 20 pekerjaan terakhir, tanpa payload snapshot; `read` |
| POST | `/scenarios/:id/decisions` | `review` untuk tinjauan, `approve` untuk pengesahan/cadangan |
| POST | `/scenarios/:id/publish` | Publikasi atomik; `publish` |
| POST | `/scenarios/:id/fork` | Salin versi kini/historis; `create` |
| GET | `/scenarios/:id/history` | Ringkasan versi, termasuk versi kini; `read` |
| GET | `/scenarios/:id/versions/:revision` | Input, hasil, keputusan versi historis; `read` |
| POST | `/scenarios/:id/import/preview` | Parse dan validasi tanpa mengubah acuan; `update` |
| POST | `/scenarios/:id/import/commit` | Simpan acuan pada revisi baru; `update` |
| GET | `/scenarios/:id/export?format=csv\|xlsx&template=true\|false` | Template atau jadwal hasil/acuan; `read` |

Body kebijakan:

```json
{
  "semester_id": "UUID", "fakultas_id": "UUID",
  "config": {
    "main_buildings": ["UUID-F", "UUID-G"], "backup_buildings": [],
    "rooms": [{"id": "UUID-RUANG", "type": "teori", "facilities": ["proyektor"], "zone": "Limau Manis"}],
    "travel": [{"from": "UUID-F", "to": "UUID-G", "minutes": 15}],
    "unavailable": [], "reservations": []
  }
}
```

`unavailable`: `{resource: "room"|"lecturer", resource_id: UUID, hari, jam_mulai, jam_selesai, frekuensi}`. `reservations`: `{ruang_id, fakultas_id, hari, jam_mulai, jam_selesai, frekuensi}`. `travel` berarah; isi kedua arah. Gedung, ruang, dosen, dan fakultas harus merupakan data master yang ada.

Body skenario:

```json
{
  "nama": "Pilot FTI Ganjil", "semester_id": "UUID", "fakultas_id": "UUID",
  "input": {
    "sessions": [{"id": "ti101-a-1", "kelas_id": "UUID", "duration": 100, "frekuensi": "Mingguan", "groups": ["TI-2025-A"], "type": "teori", "facilities": ["proyektor"], "lock_room": false, "lock_time": false}],
    "slots": [{"hari": "Senin", "jam_mulai": "08:00", "jam_selesai": "12:00", "frekuensi": "Mingguan"}],
    "baseline": [], "max_seconds": 120
  }
}
```

Semua contoh UUID adalah placeholder. Jam `HH:mm`, hari Senin–Jumat, frekuensi `Mingguan|Ganjil|Genap`.

Penempatan: `{session_id, ruang_id, hari, jam_mulai, jam_selesai, frekuensi}`. PUT skenario membutuhkan `{revision, input, nama?, assignments?}`; jika assignments diberikan, harus merupakan solusi lengkap dan valid. Simulate/cancel/publish membutuhkan `{revision}`. Setiap edit/simulasi menghasilkan revisi baru dan mengosongkan persetujuan. Revisi tidak cocok → 409.

Keputusan: `{revision, action: "review"|"approve"|"backup", approved: boolean, session_id?, note?}`. Backup membutuhkan session_id dan terikat penempatan/revisi. Fork: `{nama, source_revision?}`; menghasilkan draf baru tanpa persetujuan. Snapshot sumber daya global internal tidak dikirim melalui detail/versi/pekerjaan; kebijakan yang digunakan tersedia sebagai `policy_snapshot`.

Impor preview: `{revision, format: "csv"|"xlsx", content, mapping?}`; CSV berupa teks, XLSX base64. Mapping memetakan field kanonik ke nama kolom sumber. Field inti template: `session_id,ruang_id,hari,jam_mulai,jam_selesai,frekuensi`. Alternatif berkas lama: `kelas_id` atau `kode_matakuliah,nama_kelas,kode_prodi?,nomor_sesi?`, serta `kode_gedung?,kode_ruang`. Kode ambigu ditolak; nomor sesi mengikuti urutan kebutuhan kelas mulai 1. Waktu Excel bertipe jam didukung. Maksimum 7 MB, 10.000 baris, 100 kolom. Preview mengembalikan baseline/errors/warnings/can_commit. Commit: `{revision,baseline}`. Error identitas/format/duplikasi harus diperbaiki; pelanggaran aturan pada acuan disajikan sebagai peringatan.

## Operasional dan pengujian

Antrean disimpan di MySQL. Claim pekerjaan dan perubahan status dilakukan dalam transaksi; beberapa worker tidak mengambil pekerjaan yang sama. Pembatalan membunuh subprocess dan mengabaikan hasil terlambat. Pekerjaan running yang melewati batas server + 120 detik ditandai gagal dan dapat disimulasikan ulang. Monitor log `Simulasi penjadwalan gagal`, `Antrean penjadwalan gagal`, serta antrean yang menumpuk.

Publikasi memakai lock semester dan isolasi SERIALIZABLE. Fingerprint mencakup semester, kelas, prodi, ruang/gedung, dosen kelas, okupansi semester, serta kebijakan. Perubahan sumber menyebabkan 409 dan memerlukan simulasi/persetujuan ulang. Penulisan jadwal lama memegang lock semester yang sama; snapshot hasil tidak dipublikasikan sebagian.

```powershell
cd backend
$env:PENJADWALAN_DB_TEST='1'
npm test -- --testPathPatterns=penjadwalan
npm run benchmark:penjadwalan
cd ../frontend
npm test -- src/validations/penjadwalan.test.js
npm run build
cd ../e2e
npx playwright test --config playwright.ui.config.mjs penjadwalan.spec.mjs --workers=1
```

Tes MySQL opt-in membuat database acak `myunand_sched_test_<hex>`, menjalankan migrasi lengkap, lalu menghapus hanya database tersebut. Memerlukan akun dengan izin membuat database uji. Tes solver memerlukan Python + requirements. UI test mengintersep API pada test saja dan tidak menulis database aplikasi.

Benchmark sintetis pada mesin pengembangan (12 Oktober 2026), 3 ruang, 20 pilihan waktu, batas solver 10 detik:

| Sesi | Kandidat | Status | Total waktu | Peak RSS solver | Pelanggaran / perubahan acuan |
|---|---:|---|---:|---:|---:|
| 10 | 600 | OPTIMAL | 4,5 detik | 110 MiB | 0 / 0 |
| 20 | 1.200 | OPTIMAL | 10,0 detik | 143 MiB | 0 / 0 |
| 30 | 1.800 | FEASIBLE | 12,3 detik | 181 MiB | 0 / 0 |

Waktu total mencakup pembentukan kandidat dan startup Python. Data ini bukan dataset FTI dan bukan SLA. Sebelum penggunaan operasional: lengkapi seluruh okupansi bersama, uji bayangan dengan Excel jadwal FTI sebenarnya, ukur kelengkapan/perubahan/memori/waktu, lalu pusat menetapkan batas penerimaan. Versi ini adalah pilot satu fakultas per skenario; perluasan dilakukan bertahap dengan batasan global, bukan optimasi seluruh fakultas sekaligus dalam satu job. Ujian, pembagian dosen otomatis, dan student sectioning belum termasuk.
