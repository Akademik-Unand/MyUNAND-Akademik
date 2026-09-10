# API

Prefix: `/api/v1`

Kontrak list: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `filter[field]`.
Response list: `data` (array) + `pagination` `{ page, limit, total, totalPages }`.

Auth publik: `POST /api/v1/auth/login` mengembalikan `access_token` (pendek) dan `refresh_token` (lebih lama).
`POST /api/v1/auth/refresh` `{ refresh_token }` — tanpa access token; memutar refresh token.
`POST /api/v1/auth/logout` `{ refresh_token }` — mencabut refresh token.
Endpoint lain memakai access JWT + CASL.

Administrasi user (`/api/v1/users`) menerapkan scope organisasi pada service untuk list, detail, update, delete/restore, assign role, dan assign unit. Aktor tanpa scope valid ditolak (fail closed); admin unit hanya dapat mengelola target dalam unit dan hierarki role di bawahnya. Seeder akun organisasi memakai `ORG_ACCOUNT_SEED_PASSWORD` (minimal 12 karakter), tidak berjalan di production bila env tidak disediakan, dan menghasilkan dua akun deterministik per fakultas/departemen/prodi (`admin-*` dan `pimpinan-*`; 472 akun pada master canonical 16/67/153).
Health: `GET /up`.

Redis opsional (`REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`). Backend tetap boot jika Redis down. Cache JSON: `helpers/cache.js` (`get` / `set` / `del`).

Auth terautentikasi:
- `GET /api/v1/auth/me`, `GET /api/v1/auth/profile` mengembalikan payload akses otoritatif dan deterministik: `role`, `role_label`, `roles[]` berlabel, `permissions[]`, `units[]` berlabel, dan `org_scope` terhitung.
- `PUT /api/v1/auth/profile` `{ name }`
- `PUT /api/v1/auth/change-password` `{ current_password, new_password }`
- Payload akses memakai `user_roles` sebagai satu-satunya sumber otorisasi. `role` dipilih deterministik dari role yang diurutkan berdasarkan nama; `users.role` hanya data tampilan legacy. Payload menyertakan `roles`, permission gabungan, unit ringkas (ID/kode/nama/induk), dan `org_scope` efektif.

IAM User (seluruh endpoint memerlukan permission CASL dan dibatasi scope organisasi aktor):
- `GET /api/v1/users`, `GET /api/v1/users/:id` — admin unit hanya melihat user yang memiliki `user_units` di dalam scope-nya; scope kosong/tidak valid ditolak (fail closed).
- `POST /api/v1/users` — pembuatan awal user tanpa role/unit hanya untuk admin universitas; role diberikan lewat endpoint khusus.
- `PUT /api/v1/users/:id`, `DELETE /api/v1/users/:id`, `POST /api/v1/users/:id/restore` — target wajib berada di scope aktor dan memiliki role lebih rendah; hapus diri sendiri ditolak.
- `PUT /api/v1/users/:id/roles` `{ role_ids }` — role target wajib lebih rendah dari role tertinggi aktor; perubahan role sendiri ditolak.
- `PUT /api/v1/users/:id/units` `{ units }` — setiap item wajib memilih tepat satu dari `fakultas_id`, `departemen_id`, atau `program_studi_id`; referensi dan scope aktor divalidasi; perubahan unit sendiri ditolak.

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
