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

Master Program Studi:
- `GET|POST /api/v1/program-studi`, `GET|PUT|DELETE /:id`, `POST /:id/restore` — CRUD profil prodi (kode, jenjang, kurikulum, unit, nama). Kuota SKS **tidak** ikut di sini: field itu dibuang oleh validasi walau dikirim.
- `PATCH /api/v1/program-studi/:id/sks` `{ sks_default, sks_maksimal }` — satu-satunya pintu perubahan kuota SKS, karena angkanya kebijakan universitas (aturan rektor). Permission `program-studi.update-sks`, hanya dipegang role tingkat universitas; admin fakultas/departemen tetap bisa mengubah profil prodi tapi tidak angka SKS-nya, dan admin prodi hanya membaca.

Master Semester (`is_aktif` satu-satunya penanda semester berjalan, global universitas):
- `GET|POST /api/v1/semester`, `GET|PUT|DELETE /:id`, `POST /:id/restore`
- `PATCH /api/v1/semester/:id/activate` — jadikan semester ini semester berjalan: semester aktif lama dimatikan dan target dinyalakan dalam **satu transaksi** (permission memakai `Semester.update`), jadi tidak pernah ada dua atau nol semester aktif. Dipakai halaman Setting Semester.

Master Periode (`jenis` STRING whitelist `cpmk` | `nilai` | `krs`, bukan ENUM MySQL):
- `GET|POST /api/v1/periode`, `GET|PUT|DELETE /:id`, `POST /:id/restore`
- Unique hidup: satu baris per `(semester_id, jenis)`. Status buka dihitung dari tanggal (inklusif); tanpa baris = tertutup.
- Batas jendela: `tanggal_selesai` periode **tidak boleh melebihi** `semester.tanggal_selesai` (dan tidak boleh lebih awal dari `tanggal_mulai`). Semester yang `tanggal_selesai`-nya masih kosong dilewati — tidak ada batas yang dipakai. Pelanggaran dijawab `422` dengan pesan yang menyebut tanggal batasnya.
- Mutasi CPMK / sumber penilaian / pemetaan CPMK–SCP butuh periode `cpmk` pada semester `is_aktif`. Mutasi nilai dan `POST /nilai/upload` butuh periode `nilai` pada semester kelas. Pengambilan mata kuliah (KRS reguler maupun lintas prodi) butuh periode `krs` pada semester yang bersangkutan — satu periode untuk seluruh universitas. Baca tetap boleh.

KRS Reguler (mahasiswa prodi sendiri):
- Pintu tunggal pengambilan: mata kuliah hanya bisa diambil jika **penawaran-nya `published`** pada semester yang sama dengan KRS (dicek lewat relasi `kelas → penawaran_matakuliah_detil → penawaran_matakuliah`). MK yang tidak dibuka ⇒ tidak ada kelas yang dapat dipilih ⇒ otomatis tidak tersedia.
- `POST /api/v1/krs` `{ mahasiswa_id, semester_id }` — buat header KRS; butuh periode `krs` terbuka pada semester tersebut. Jika pemanggil adalah mahasiswa, `mahasiswa_id` dipaksa miliknya sendiri.
- `POST /api/v1/krs-detil` `{ krs_id, kelas_id }` — daftar satu mata kuliah; butuh periode `krs`, KRS belum disetujui (`approval_ke = 0`), kelas milik penawaran `published` pada semester yang sama, dan kapasitas kelas (`kelas.jumlah_peserta_max`) belum penuh untuk mahasiswa prodi sendiri.
- `PATCH /api/v1/krs/:id/approve` — persetujuan dosen: `approval_ke` naik, `jam_selesai` di-set, detil **reguler** menjadi `approved: '1'`, dan pengajuan **lintas prodi** yang masih `pending_pa` ikut ditetapkan (`cross_enrollment_status: 'approved'`, `pa_approved_by`, `pa_approved_at`) — pengajuan yang sudah diputuskan sebelumnya tidak ditimpa. Setelah disetujui, detil KRS tidak dapat ditambah/diubah/dihapus lagi.
- `GET /api/v1/krs` — daftar KRS, otomatis dibatasi: mahasiswa hanya miliknya, dosen hanya mahasiswa bimbingannya (dari `bimbingan_akademik` aktif), admin/prodi melihat semua.
- `GET /api/v1/krs/mahasiswa/:mahasiswaId` — riwayat KRS seorang mahasiswa.

Lintas Program Studi (cross enrollment):
- Admin prodi penyelenggara membuka penawaran lewat `POST /api/v1/penawaran-matakuliah` (lalu `/:id/publish`, `/:id/close`). Penawaran boleh memuat mata kuliah berprasyarat — larangan berprasyarat hanya berlaku saat **diambil lintas prodi** (dicek saat `enroll`), bukan saat dibuka.
- `GET /api/v1/penawaran-matakuliah/catalog` — katalog penawaran yang sedang dibuka untuk mahasiswa.
- `POST /api/v1/cross-enrollment/enroll` `{ penawaran_matakuliah_id, kelas_id }` — `penawaran_matakuliah_id` adalah id baris penawaran per mata kuliah. Status awal `pending_pa`.
- Keputusan PA atas pengajuan diambil bersama persetujuan KRS (permission `krs.approve`); tidak ada endpoint persetujuan lintas prodi terpisah.
- Pengajuan lintas prodi dikeluarkan dengan **menghapus barisnya**: `DELETE /api/v1/krs-detil/:id`. Tidak ada aksi/status "dibatalkan" terpisah — sama seperti mata kuliah reguler, berlaku selama KRS belum disetujui (`approval_ke = 0`).
- `GET /api/v1/cross-enrollment` — daftar pengajuan, otomatis dibatasi: mahasiswa hanya miliknya, dosen hanya mahasiswa bimbingannya.
- Validasi enroll: penawaran `published` + periode `krs` pada semester penawaran, bukan prodi sendiri, rentang semester, MK tanpa prasyarat, punya dosen PA, kuota lintas prodi, batas SKS, dan bentrok jadwal. Jendela tanggal penawaran tidak dipakai lagi — selama periode KRS terbuka dan penawaran `published`, mata kuliah dapat diambil.
- Kapasitas dua pot terpisah: `kelas.jumlah_peserta_max` membatasi mahasiswa prodi sendiri (dicek pada `POST /krs-detil`), sedangkan `kuota_lintas_prodi` (default header, override per MK/prodi tujuan) adalah jatah tambahan di luar kapasitas kelas untuk mahasiswa lintas prodi (dicek saat `enroll`).

Bimbingan Akademik (Dosen PA):
- `GET /api/v1/bimbingan-akademik` — daftar bimbingan. Filter unit (`fakultas_id`/`departemen_id`/`program_studi_id`) diterjemahkan lewat program studi **mahasiswa** bimbingan, jadi admin prodi hanya melihat bimbingannya. `search` menjangkau `tahun_akademik`, nama/NIU mahasiswa, dan nama dosen.
- `GET /api/v1/bimbingan-akademik/candidates` — mahasiswa yang **belum punya PA aktif** (calon yang terblokir ambil KRS), ikut dibatasi scope unit; filter `program_studi_id` dan `angkatan`.
- `GET /api/v1/bimbingan-akademik/summary` — `{ total_mahasiswa, sudah_punya_pa, belum_punya_pa, dosen_membimbing, beban_teratas[] }` untuk filter unit yang sama.
- `POST /api/v1/bimbingan-akademik` `{ mahasiswa_id, dosen_id, tahun_akademik?, catatan? }` — dosen wajib **seprodi atau sedepartemen** dengan mahasiswa (`422` bila tidak). Bila mahasiswa sudah punya PA aktif, penetapan baru otomatis menutup PA lama (`status: selesai`) agar tetap satu PA aktif per mahasiswa. Penetapan ulang dosen yang sama saat masih aktif ditolak (`409`).
- `POST /api/v1/bimbingan-akademik/assign-bulk` `{ dosen_id, mahasiswa_ids[], tahun_akademik?, catatan? }` — penetapan massal satu dosen untuk banyak mahasiswa. Hasil `{ ditetapkan, ditutup, dilewati: [{ mahasiswa_id, nama, alasan }], dosen }`; mahasiswa yang berbeda unit atau sudah dibimbing dosen itu **dilewati dengan alasan**, bukan menggagalkan seluruh proses.
- `PUT /api/v1/bimbingan-akademik/:id`, `DELETE /api/v1/bimbingan-akademik/:id` — ganti/lepas PA. Operasi tulis hanya boleh menyentuh mahasiswa di dalam scope unit aktor (`403` bila di luar).

Kelas:
- `GET|POST /api/v1/kelas`, `GET|PUT|DELETE /:id`, `POST /:id/restore` — `create` menerima `{ semester_id, program_studi_id, matakuliah_id, penawaran_matakuliah_id, nama, jumlah_peserta_min, jumlah_peserta_max }`. `penawaran_matakuliah_id` mengikat kelas ke detail penawaran (opsional tapi disarankan) — service memvalidasi konsistensi: detail penawaran harus cocok dengan MK dan semester/prodi yang dipilih, serta MK harus milik prodi semester tersebut.
- Kelas list/detail menyertakan `jumlah_peserta` dan `progress_upload_nilai` (`Ada`/`Belum`).
- Nama kelas unik **per mata kuliah per semester** (`uq_kelas_semester_prodi_mk_nama` = `semester_id` + `program_studi_id` + `matakuliah_id` + `nama`) — bukan global. Mata kuliah berbeda pada semester & prodi yang sama boleh memakai nama yang sama (mis. "Pemrograman A" dan "Desain A"), dan MK yang sama di semester lain bebas memakai nama itu lagi (2026 "Pemrograman A", 2027 juga boleh). Bentrok hanya berarti nama itu sudah dipakai MK yang sama di semester & prodi yang sama, dan dijawab `422` dengan pesan yang menyebut MK-nya — bukan pesan unik mentah dari MySQL.
- Dosen pengampu diatur per kelas lewat `dosen-kelas` (`{ dosen_id, kelas_id, dosen_ke }`) — bukan dari mata kuliah.
- Shift Jadwal (master, per fakultas): `GET|POST /api/v1/shift`, `GET|PUT|DELETE /:id`, `POST /:id/restore` — `{ fakultas_id, kode, jam_mulai, jam_selesai }`; jam selesai harus setelah jam mulai (`422`).
- Jadwal kuliah lewat `jadwal-kelas` (`{ kelas_id, shift_id, ruang_id, hari }` — jam otomatis diambil dari shift master, `shift_id` wajib sesuai fakultas kelas; tanpa `shift_id` jam manual lama tetap didukung). create/update menolak jadwal bentrok pada ruang, hari, dan jam yang sama (`409`).
Matriks nilai: `GET /api/v1/nilai/kelas/:kelasId/matriks` — kelompok CPMK, sumber+bobot, peserta (NIU, nama, nilai per sumber, angka, huruf). Permission `nilai.read`.

Dokumen evaluasi:
- `GET|POST /api/v1/jenis-dokumen-evaluasi`, `GET|PUT|DELETE /:id`, `POST /:id/restore`
- `GET|POST /api/v1/dokumen-evaluasi`, `GET|PUT|DELETE /:id` — `file_path` teks, bukan unggah biner.
