# API

Prefix: `/api/v1`

Kontrak list: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `filter[field]`.
Response list: `data` (array) + `pagination` `{ page, limit, total, totalPages }`.

Auth publik: `POST /api/v1/auth/login` mengembalikan `access_token` (pendek) dan `refresh_token` (lebih lama).
`POST /api/v1/auth/refresh` `{ refresh_token }` — tanpa access token; memutar refresh token.
`POST /api/v1/auth/logout` `{ refresh_token }` — mencabut refresh token.
Endpoint lain memakai access JWT + CASL.
Health: `GET /up`.

Redis opsional (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`). Backend tetap boot jika Redis down. Cache JSON: `helpers/cache.js` (`get` / `set` / `del`).

Auth terautentikasi:
- `GET /api/v1/auth/me`, `GET /api/v1/auth/profile`
- `PUT /api/v1/auth/profile` `{ name }`
- `PUT /api/v1/auth/change-password` `{ current_password, new_password }`

Rekap CP:
- `GET /api/v1/rekap-cp` — ringkasan tersimpan (`mahasiswa`, `cp`, `nilai_capaian`).
- `GET /api/v1/rekap-cp/detail` — baris per mahasiswa × MK × CPMK × sumber penilaian (filter org + `cp_id`, `scp_id`, `matakuliah_id`, `kelas_id`, `angkatan`, `transkrip_saja`).
- `GET /api/v1/rekap-cp/grafik` — agregat capaian vs target per CP/SCP (filter sama; `pilihan_data=nilai_rata` atau persen target).

Laporan CP:
- `GET|POST /api/v1/laporan-cp`, `GET|PUT|DELETE /:id`
- `GET /api/v1/laporan-cp/preview?kurikulum_id=&semester_id=` — baris CP × SCP × CPMK × MK (sumber + dosen digabung, capaian agregat). `semester_id` = semester terpilih **dan sebelumnya**. Body simpan `items` `{ cpmk_id, matakuliah_id, semester_id }`. Detail laporan menampilkan capaian CPMK/SCP/CP dari baris terpilih.
- `GET /api/v1/laporan-cp/matakuliah/:matakuliahId?semester_id=&kurikulum_id=` — agregat evaluasi satu MK untuk modal di detail laporan: header MK (kode, SKS, prodi, kurikulum, semester, jumlah peserta), kelas penyelenggara + dosen, CPMK semester (target, CPL, sumber + bobot), rangkuman evaluasi CPMK (capaian, rata-rata, jumlah lulus), matriks nilai peserta (nilai per sumber + total), dan dokumen evaluasi. Permission `laporan-cp.read`.

Master Periode (`jenis` STRING whitelist `cpmk` | `nilai`, bukan ENUM MySQL):
- `GET|POST /api/v1/periode`, `GET|PUT|DELETE /:id`, `POST /:id/restore`
- Unique hidup: satu baris per `(semester_id, jenis)`. Status buka dihitung dari tanggal (inklusif); tanpa baris = tertutup.
- Mutasi CPMK / sumber penilaian / pemetaan CPMK–SCP butuh periode `cpmk` pada semester `is_aktif`. Mutasi nilai dan `POST /nilai/upload` butuh periode `nilai` pada semester kelas. Baca tetap boleh.

Kelas list/detail menyertakan `jumlah_peserta` dan `progress_upload_nilai` (`Ada`/`Belum`).
Matriks nilai: `GET /api/v1/nilai/kelas/:kelasId/matriks` — kelompok CPMK, sumber+bobot, peserta (NIU, nama, nilai per sumber, angka, huruf). Permission `nilai.read`.

Dokumen evaluasi:
- `GET|POST /api/v1/jenis-dokumen-evaluasi`, `GET|PUT|DELETE /:id`, `POST /:id/restore`
- `GET|POST /api/v1/dokumen-evaluasi`, `GET|PUT|DELETE /:id` — `file_path` teks, bukan unggah biner.
