# Semester Global — Rencana Konsolidasi `semester_prodi`

Status ringkas: **selesai (Fase 1–5), migrasi sudah di-squash.** Riwayat 71 migrasi kini menjadi 50 `create-*` murni (§5) dan DB dev dibangun ulang dari nol. Dokumen ini menyimpan kronologi keputusan; nama-nama file migrasi lama di bagian Fase sudah tidak ada lagi di repo. Semester dan periode kini global murni, kuota SKS menempel di `program_studi`, dan tabel pivot `semester_prodi` beserta halaman/menu/endpoint-nya **sudah dihapus** — `kelas`, `krs`, `penawaran_matakuliah`, dan `rekap_cp` menunjuk `semester_id` (+ `program_studi_id` untuk kelas/penawaran) secara langsung.

## 1. Kondisi awal sebelum Fase 1 (fakta, saat itu)

Diukur pada DB dev (`myunand-kurikulum`, MySQL 8.0.30):

| tabel yang menunjuk `semester_prodi_id` | baris | catatan                                                     |
| --------------------------------------- | ----- | ----------------------------------------------------------- |
| `krs`                                   | 1.918 | `NOT NULL`                                                  |
| `kelas`                                 | 622   | nullable                                                    |
| `penawaran_matakuliah`                  | 3     | `NOT NULL` + **UNIQUE** → satu penawaran per semester-prodi |
| `rekap_cp`                              | 0     | nullable                                                    |

- Prodi terdaftar: **153**; mahasiswa aktif: **632**.
- Sebelum Fase 1: hanya **3 dari 153** prodi punya baris `semester_prodi` untuk semester aktif → 150 prodi tidak bisa menjalankan KRS/kelas/penawaran sama sekali.
- Flag `semester_prodi.is_aktif` tidak dapat dipercaya: 6 baris bernilai `1`, termasuk baris semester 2024 Ganjil; sementara baris semester aktif milik prodi 80203 justru `0`. *(Kolom ini sudah dibuang di Fase 4; keaktifan kini hanya dari `semester.is_aktif`.)*
- `periode` sudah global per semester dengan jenis `cpmk`, `nilai`, `krs` (`helpers/academicPeriod.js` → `JENIS`); backend menegakkan periode KRS lewat `assertKrsPeriodForSemesterProdi`.
- Tidak ada duplikat `(semester_id, program_studi_id)` → unique index aman dipasang.

Akar masalah:

1. **Sumber kebenaran ganda** untuk waktu KRS/revisi dan keaktifan semester — aturan backend sudah pindah ke `periode`, tetapi skema dan dashboard masih menampilkan tanggal per prodi.
2. **Tidak ada provision otomatis** — baris pivot dibuat manual lewat menu Semester Prodi, sehingga prodi yang tidak diinput = mati total.
3. **Penamaan menyamarkan peran** — `semester_prodi` terbaca sebagai entitas otonom, padahal ia pivot + setting.

## 2. Peran `semester_prodi` dan nasibnya

| Isi kolom                                        | Peran sebenarnya                                                  | Keputusan                                |
| ------------------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------- |
| `semester_id`, `program_studi_id`                | pivot (target FK `krs`/`kelas`/`penawaran_matakuliah`/`rekap_cp`) | **sudah dibuang** ✅ (Fase 5c — kolomnya pindah langsung ke tabel akademik) |
| `tanggal_krs_mulai`, `tanggal_krs_selesai`       | duplikat `periode` jenis `krs`                                    | **sudah dibuang** ✅ (Fase 3c)           |
| `tanggal_revisi_mulai`, `tanggal_revisi_selesai` | jadwal revisi KRS                                                 | **sudah dibuang** ✅ — tanpa konsumen    |
| `is_aktif`                                       | duplikat `semester.is_aktif`                                      | **sudah dibuang** ✅ (Fase 4)            |
| `sks_default`, `sks_maksimal`                    | kebijakan per prodi                                               | **pindah ke `program_studi`** ✅ (Fase 5a) |

## 3. Sasaran desain

- `semester`: tahun, jenis, tanggal mulai/selesai, `is_aktif` — **global universitas**.
- `periode`: satu-satunya sumber jadwal (`krs`, `cpmk`, `nilai`, dan `revisi` bila diperlukan) — **global per semester**.
- `semester_prodi`: **sudah dihapus** (Fase 5c). Kuota SKS hidup di `program_studi`; relasi akademik memakai `semester_id`/`program_studi_id` langsung.
- Daftar semester dari API diurutkan **semester berjalan lebih dulu**, lalu tahun terbaru, dan dalam satu tahun Ganjil sebelum Genap (`defaultOrder` di `services/semester/semester.service.js`). Halaman Setting Semester maupun semua pemilih semester di UI membaca list yang sama, jadi semester aktif selalu muncul di baris/opsi pertama; sortir kolom dari pengguna tetap menang atas urutan default ini.

## 4. Fase pelaksanaan

### Fase 1 — Backfill pivot ✅ **selesai**

Tujuan: menutup lubang 150 prodi tanpa mengubah skema.

- Seeder: `src/seeders/20260912000011-backfill-semester-prodi-all-prodi.js`.
- Aturan: semua prodi non-deleted pada semester **aktif + mendatang** (semester lampau tidak disentuh); `sks_default`/`sks_maksimal` diambil dari riwayat terakhir prodi (fallback `15/24`); `is_aktif` diselaraskan dengan `semester.is_aktif`; idempoten.
- `down()` hanya mencabut baris yang belum dipakai kelas/KRS/penawaran.
- Test: `tests/unit/seeders/backfillSemesterProdi.test.js` (7 kasus).

Hasil di DB dev: `semester_prodi` 17 → **167** baris; coverage semester aktif **153/153 prodi**; **632/632 mahasiswa** kini punya pivot; baris `is_aktif` yang bertentangan **0**; seeder dijalankan dua kali tanpa menambah baris. `sks_default` terbawa dari riwayat untuk S1 Peternakan, S1 NTP, S1 Sistem Informasi, S1 Matematika (`18/24`), sisanya default `15/24` dan perlu disesuaikan admin bila kebijakannya berbeda.

### Fase 2 — Provision otomatis + unique index ✅ **selesai**

Tujuan: baris pivot tidak pernah lagi hilang.

1. Helper bersama `src/helpers/semesterProdiProvision.js`: `semesterProvisionTargets` (aktif + mendatang), `syncSemesterProdi` (idempoten, SKS dari riwayat terakhir prodi, menyelaraskan `is_aktif`), plus dua wrapper: `provisionAllProdiInTargetSemesters` dan `provisionProdiInTargetSemesters`.
2. `services/semester/semester.service.js`: `create` memprovision seluruh prodi **di dalam satu transaksi**; `update` memprovision saat `is_aktif` bernilai true.
3. `services/institusi/program-studi.service.js`: `create` memprovision prodi baru ke seluruh semester target.
4. Seeder Fase 1 diubah menjadi tipis dan mendelegasikan ke helper yang sama (satu sumber logika), `down()` tetap hanya mencabut baris yang belum dipakai.
5. Migrasi `20260912000012-add-unique-semester-prodi-pair.js`: unique index `(semester_id, program_studi_id)`.
6. `services/semester/semester-prodi.service.js`: input manual yang menduplikasi pasangan ditolak `409` dengan pesan jelas (bukan error constraint mentah), dijaga di `create` dan `update`.

Verifikasi yang dijalankan: 286 test backend lolos (termasuk 9 kasus helper, 3 kasus `semester.service`, 1 kasus `program-studi.service`, 4 kasus `semester-prodi.service`); migrasi terpasang (`SHOW INDEX` menampilkan `uq_semester_prodi_semester_prodi` pada `semester_id + program_studi_id`); insert pasangan duplikat ditolak `SequelizeUniqueConstraintError` (`ER_DUP_ENTRY`); seeder dijalankan ulang menambah **0** baris (tetap 167); dry-run create semester baru di dalam transaksi memprovision **153** baris lalu di-rollback tanpa sisa.

Risiko: rendah–sedang (create semester kini punya efek samping provision; ditutup test).

### Fase 3 — Buang duplikasi waktu ✅ **selesai**

Tujuan: `periode` menjadi satu-satunya sumber jadwal.

**Hasil telusur (dasar keputusan):**

- `tanggal_revisi_mulai/selesai` **tidak punya konsumen sama sekali**. Kemunculannya hanya di: model, migrasi `017`, validasi, 3 seeder, dan 2 tempat UI (form + detail Semester Prodi). Tidak ada satu pun service/helper yang membacanya, dan `JENIS` periode masih `['cpmk','nilai','krs']` — jadi revisi KRS tidak pernah ditegakkan sebagai aturan.
- Datanya pun bukan buatan manusia: 7 baris berisi, semuanya di semester lampau (2024 Ganjil, 2025 Genap) dengan nilai berulang persis dari seeder.
- Duplikasi ini sudah menimbulkan UI yang menyesatkan: `tanggal_krs_mulai` per prodi **kosong** untuk semester aktif (2026 Genap), sehingga tiga dashboard (`DashboardPage`/StudentDashboard, `AdminProdiDashboard`, `AdminOrgDashboard`) menampilkan “Belum diatur” dan tanggal “—”, padahal `periode` jenis `krs` semester itu sudah dibuka (2026-08-30 s.d. 2026-10-10) dan itulah yang ditegakkan backend.

**Keputusan:** tidak menambah jenis periode `revisi`. Keempat kolom tanggal di `semester_prodi` dibuang (dead data). Bila kelak jendela revisi memang diperlukan, cukup tambah `revisi` ke `JENIS` periode + whitelist validasi `periode` — halaman `PeriodePage` sudah generik per jenis.

Urutan wajib (jangan dibalik):

1. **Backend menyediakan periode** ✅ **selesai (3a)**: helper `getPeriod(semesterId, jenis)` di `helpers/academicPeriod.js`; `services/dashboard/dashboard.service.js` mengirim blok `periode` jenis `krs` pada `orgSummary` dan `dosenSummary`; `services/krs/krs.service.js` (`getContext`) menambahkan blok yang sama untuk dashboard mahasiswa. Bersifat **aditif**: `tanggal_krs_mulai/selesai` per prodi masih dikirim (ditandai deprecated) sampai frontend pindah di 3b, lalu dihapus bersama kolomnya di 3c.
   Verifikasi 3a: 291 test backend lolos (termasuk 3 kasus `getPeriod` dan 3 kasus blok `periode` di `dashboard.service`); dipanggil langsung ke DB dev — `getContext`, `dosenSummary`, dan `orgSummary` semuanya mengembalikan `{ jenis: 'krs', tanggal_mulai: '2026-08-30', tanggal_selesai: '2026-10-10' }`, sementara `tanggal_krs_mulai`/`selesai` per prodi tetap `null` (bukti bug UI yang diperbaiki di 3b).
2. **Frontend pindah pembaca** ✅ **selesai (3b)**: semua pembaca tanggal per prodi dimigrasikan ke blok `periode`.
   - `helpers/krsPeriod.js` (`krsPeriodStatus`) kini **hanya** membaca `{tanggal_mulai, tanggal_selesai}` dan mengenal empat keadaan: “Belum diatur” (ghost), “Belum dibuka” (warning), “Dibuka” (success), “Ditutup” (error). Fallback kolom legacy `tanggal_krs_*` dihapus.
   - Komponen baru `components/dashboard/PeriodeAkademikCard.jsx` menjadi satu-satunya penyaji jadwal berjalan (semester + KRS mulai/selesai + SKS maksimal), dipakai `pages/DashboardPage.jsx` (mahasiswa), `AdminProdiDashboard`, dan `AdminOrgDashboard` — ketiga `periodStatus`/`formatDate` lokal dihapus.
   - `pages/semester/SemesterProdiPage.jsx` + `components/master/SemesterProdiForm.jsx` membuang kolom/input/`emptyForm` jadwal (KRS & revisi); halaman kini fokus kuota SKS dan memberi arahan ke menu **Periode**. `is_aktif` tetap sampai Fase 4.
   Verifikasi 3b: `grep -rn "tanggal_krs\|tanggal_revisi" frontend/src/` **0 hasil**; 148 test frontend lolos; `vite build` sukses; lint tidak menyisakan error di file yang disentuh (kini malah membersihkan `BookOpen`/`Clock` yang tak terpakai).
3. **Fase 3c — drop kolom** ✅ **selesai**: migrasi `20260912000013-drop-tanggal-krs-revisi-from-semester-prodi.js` (idempoten, `down()` mengembalikan keempat kolom sebagai `DATEONLY` nullable) membuang `tanggal_krs_mulai`, `tanggal_krs_selesai`, `tanggal_revisi_mulai`, `tanggal_revisi_selesai`. Ikut dibersihkan: `models/semesterProdi.js`, `validations/semester/semester-prodi.validation.js` (whitelist sort + schema create/update), `services/semester/semester-prodi.service.js` (`sortableFields`), blok deprecated `tanggal_krs_*` di `services/dashboard/dashboard.service.js` (`orgSummary`), dan ketiga seeder lama (`002-seed-master-akademik.js`, `20260904045729-demo-mapping-data.js`, `20260912000002-seed-peternakan-semester-kelas.js`).
   Verifikasi 3c: `SHOW COLUMNS FROM semester_prodi` → `id, program_studi_id, semester_id, is_aktif, sks_default, sks_maksimal, createdAt, updatedAt`; `20260912000013` tercatat di `SequelizeMeta`; 167 baris pivot utuh; select/update/insert lewat model (di dalam transaksi lalu di-rollback) berhasil; provision ulang semester aktif = **0** baris baru; 291 test backend lolos; `require('./src/routes')` boot normal.

Verifikasi Fase 3 (gabungan): dashboard mahasiswa/prodi/org menampilkan status dari `periode` (bukan “Belum diatur”); `grep -rn "tanggal_krs\|tanggal_revisi"` bersih di `frontend/src/` **dan** `backend/src/` (kecuali migrasi historis `017` + migrasi drop itu sendiri); `npm test` hijau (291 backend, 148 frontend); `vite build` sukses.

Risiko: sedang — menyentuh 3 dashboard + form/page, dan seeder lama wajib dibersihkan pada rilis yang sama karena `db:seed:all` menjalankan ulang semua seeder.

### Fase 4 — Pensiun `is_aktif` di pivot ✅ **selesai**

Tujuan: keaktifan semester hanya dari `semester.is_aktif`.

1. Migrasi `20260912000014-drop-is-aktif-from-semester-prodi.js` (idempoten; `down()` mengembalikan kolom `BOOLEAN DEFAULT false`) membuang `semester_prodi.is_aktif`.
2. Dibersihkan: `models/semesterProdi.js`, `validations/semester/semester-prodi.validation.js` (whitelist sort + schema create/update), `services/semester/semester-prodi.service.js` (`sortableFields`/`filterableFields`), serta **seluruh penulisnya** — `helpers/semesterProdiProvision.js` (tidak lagi menulis flag saat provision maupun menyelaraskannya) dan lima seeder (`002-seed-master-akademik`, `20260904045729-demo-mapping-data`, `20260909033159-import-tpb-portal-data`, `20260912000002-seed-peternakan-semester-kelas`, `20260912000003-seed-peternakan-penawaran`).
3. `services/dashboard/dashboard.service.js` (`orgSummary`) tidak lagi menyaring pivot dengan `is_aktif: true`; semester berjalan dicari lewat include `semester` dengan `where: { is_aktif: true }` (`activeSemesterInclude()`), sama seperti `krs.service.getContext`, `dosenSummary`, dan `bimbingan-akademik.service`.
4. UI: `pages/semester/SemesterProdiPage.jsx` membuang kolom/detail "Status"; status aktif kini ditampilkan sebagai badge pada kolom **Semester** (mengikuti `row.semester.is_aktif`, seperti halaman Periode), dan `components/master/SemesterProdiForm.jsx` membuang checkbox "Semester berjalan". `pages/perkuliahan/JadwalRuangPage.jsx` (urut semester + label "· aktif") ikut pindah ke `row.semester.is_aktif`.

Verifikasi Fase 4: `SHOW COLUMNS FROM semester_prodi` → `id, program_studi_id, semester_id, sks_default, sks_maksimal, createdAt, updatedAt`; `20260912000014` tercatat di `SequelizeMeta`; 167 baris pivot utuh; `orgSummary` level prodi tetap benar (pivot semester 2026, `sks_maksimal` 24, periode KRS terisi) dan provision ulang semester aktif = **0** baris baru; 290 test backend + 148 test frontend lolos; `vite build` sukses; lint bersih di file yang disentuh.

Risiko: rendah–sedang (hanya pemakaian di UI; backend sudah memakai `semester.is_aktif`).

**Perbaikan bonus — scope organisasi `orgSummary` ✅:** saat pencarian pivot dipindahkan ke semester aktif di atas, ketahuan bahwa `orgSummary` level **departemen/fakultas** tidak menerapkan scope organisasi pada pencarian pivot (`semesterProdiWhere` hanya diisi untuk level `prodi`), lalu memakai **satu** baris pivot sembarang sebagai dasar hitungan. Akibatnya seluruh fakultas melaporkan `kelas: 0` meski Fakultas Teknologi Pertanian punya 555 kelas (65 di antaranya di semester berjalan). Perilaku ini sudah ada sebelum Fase 4 (dulu pivot sembarang dipilih dari baris ber-flag `is_aktif = 1`), bukan regresi.

Perbaikannya:

1. `semesterProdi.findAll` memakai `buildScopeCondition(level, ids)` yang sama dengan hitungan mahasiswa/dosen — `{ program_studi_id }` untuk level prodi, `{ '$programStudi.departemen_id$' }` / `{ '$programStudi.fakultas_id$' }` untuk departemen/fakultas; `includeProdi()` dijadikan factory agar objek include tidak dipakai bersama antar-query.
2. **Semua** pivot dalam scope dipakai untuk hitungan kelas/KRS/penawaran (sebelumnya hanya satu baris), sehingga admin prodi yang memegang lebih dari satu prodi pun kini terhitung lengkap.
3. Include `jenisSemester` ikut dipasang pada pivot, jadi label semester di kartu dashboard prodi/org lengkap ("Genap 2026/2027", bukan hanya tahun) — sebelumnya objek `jenisSemester` selalu `undefined`.

Verifikasi: hasil `orgSummary` dicocokkan dengan SQL manual (hanya semester berjalan) — Fakultas Teknologi Pertanian kelas **65/65** & penawaran **1/1**; Peternakan **3/3** & **2/2**; departemen Teknik Pertanian dan Biosistem **65/65**; level prodi 54231 tetap **3/1** (tidak berubah). 3 test baru di `tests/unit/services/dashboard.service.test.js` (scope prodi, fakultas lintas-prodi, departemen).

Catatan kecil: `semesterProdi` pada respons hanya satu baris perwakilan (terbaru) untuk label & `sks_maksimal`; untuk scope yang memuat banyak prodi dengan kuota SKS berbeda, angka SKS itu milik salah satu prodi — aggregasi kelas/KRS/penawaran tetap benar karena memakai seluruh pivot.

**Perbaikan bonus 2 — seeder `002` tidak lagi menimpa semester berjalan ✅:** `src/seeders/002-seed-master-akademik.js` dulu meng-upsert semester 2024 Ganjil dengan `is_aktif: true` **dan** mencantumkan `is_aktif` di daftar `updateOnDuplicate`. Di database yang sudah berjalan, `db:seed:all` karena itu menyalakan lagi 2024 Ganjil sebagai semester aktif — meninggalkan dua semester aktif sekaligus, padahal `semester.is_aktif` adalah satu-satunya acuan semester berjalan. Sekarang:

1. baris itu dinyatakan aktif **hanya bila belum ada semester aktif sama sekali** (dicek lebih dulu: `SELECT id FROM semester WHERE is_aktif = 1 AND deletedAt IS NULL LIMIT 1`) — instalasi baru tetap punya semester berjalan seperti sebelumnya;
2. `is_aktif` **tidak** ikut di-update saat upsert, sehingga re-run tidak pernah mengubah keaktifan semester yang sudah ada — termasuk tidak memadamkan semester 2024 sendiri bila ia yang sedang aktif.

Verifikasi: snapshot DB dev sebelum/sesudah `sequelize-cli db:seed --seed 002-seed-master-akademik.js` identik — semester aktif tetap **2026 Genap** (satu-satunya), 2024 Ganjil tetap `0`, dan jumlah baris tidak berubah (`semester 8 · semester_prodi 167 · program_studi 153 · fakultas 16 · departemen 67 · periode 3 · kelas 622 · krs 1918 · kurikulum 8`). 3 test baru di `tests/unit/seeders/masterAkademikSemesterAktif.test.js`: aktif hanya saat belum ada yang aktif, tidak menimpa saat sudah ada (termasuk `updateOnDuplicate` tanpa `is_aktif`), dan `semester_prodi` tidak lagi ditulisi `is_aktif`.

**Perbaikan bonus 3 — jendela periode demo mengikuti semesternya ✅:** `src/seeders/20260904084633-demo-periode-aktif.js` menyeed periode `cpmk` + `nilai` untuk semester aktif dengan tanggal **bulan berjalan** (`new Date(now.getFullYear(), now.getMonth(), 1)` s.d. akhir bulan), bukan rentang semesternya. Dampaknya: periode demo bisa bertanggal di luar semester (semester lampau yang kebetulan aktif akan dapat periode bertahun sekarang) — dan itu memang terjadi di DB dev: dua baris `periode` milik **semester 2024** bertanggal `2026-09-01` s.d. `2026-09-30` (sudah soft-deleted `2026-09-12`). Sekarang jendelanya diambil dari `semester.tanggal_mulai/selesai` (dinormalkan agar tahan driver yang mengembalikan `Date` maupun string); bulan berjalan hanya dipakai sebagai cadangan bila semester belum punya tanggal.

Verifikasi: `db:seed --seed 20260904084633-demo-periode-aktif` pada DB dev menghasilkan `cpmk` dan `nilai` untuk semester aktif 2026 dengan jendela **2026-09-01 s.d. 2026-10-10** (rentang semester, bukan 2026-09-01..2026-09-30); seeder lalu di-`db:seed:undo` sehingga DB dev kembali ke keadaan semula (3 baris `periode`: 1 aktif + 2 warisan soft-deleted) — jadi periode demo bisa dibuat kapan pun dengan tanggal yang benar. 6 test baru di `tests/unit/seeders/demoPeriodeAktif.test.js` (jendela dari semester, bentuk `Date`, cadangan bulan berjalan, tanpa semester aktif, tidak menggandakan jenis, `down`).

### Fase 5 — `semester_id` langsung, pensiunkan pivot ✅ **5a–5c selesai**

Tujuan: `kelas`/`krs`/`penawaran_matakuliah`/`rekap_cp` menunjuk semester (dan prodi) langsung, lalu tabel `semester_prodi` beserta halaman/menu/endpoint-nya dihapus.

Ketentuan yang dipakai:

| tabel | kolom baru | catatan |
| --- | --- | --- |
| `kelas` (622) | `semester_id`*, `program_studi_id`* | prodi pemilik kelas, dulu dipinjam dari pivot |
| `krs` (1.918) | `semester_id`* | prodi tetap dari `mahasiswa` |
| `penawaran_matakuliah` (3) | `semester_id`*, `program_studi_id`* | unik per `(semester_id, program_studi_id)` |
| `rekap_cp` (0) | `semester_id` | boleh kosong, seperti sebelumnya |
| `program_studi` (153) | `sks_default`, `sks_maksimal` | kuota SKS memang kebijakan per prodi, bukan per semester |

Unik gabungan ikut dipindah (MySQL diam-diam memangkas kolom dari indeks saat kolomnya di-drop, jadi wajib dieksplisitkan): `uk_kelas` → `uq_kelas_semester_prodi_mk_nama(semester_id, program_studi_id, matakuliah_id, nama)`, `uk_krs` → `uq_krs_semester_mahasiswa(semester_id, mahasiswa_id)`, `uq_penawaran_per_semester_prodi` → `uq_penawaran_semester_prodi(semester_id, program_studi_id)`, `uk_rekap_cp` → `uq_rekap_cp_semester(mahasiswa_id, cp_id, semester_id)`.

**5a — tambah & backfill ✅ selesai**(`20260912000015-add-semester-and-prodi-to-academic-tables.js`, aditif/idempoten)

- Menambah kolom baru (backfill dari pivot, lalu `NOT NULL` kecuali `rekap_cp`), membuat unik/indeks baru, melonggarkan `semester_prodi_id` di `krs` & `penawaran_matakuliah` agar kode baru bisa menyimpan tanpa pivot, dan memindahkan kuota SKS ke `program_studi` (diambil dari baris pivot terakhir tiap prodi).
- `semester_prodi_id` masih ada supaya kode lama tetap jalan; model juga masih mendefinisikannya sebagai atribut legacy.

Verifikasi 5a di DB dev: 1.918 `krs`, 622 `kelas` (termasuk `program_studi_id`), dan 3 `penawaran_matakuliah` terisi **tanpa selisih** dengan pivot (`selisih backfill kelas = 0`); kuota SKS terbawa — **149 prodi 15/24** dan **4 prodi 18/24** (Peternakan, NTP, SI, Matematika); unik/indeks baru terpasang; 304 test backend lolos.

**5b — kode pindah ke kolom baru + hapus konsumen pivot ✅ selesai**

Backend:

- `helpers/academicFilters.js`: `semesterProdiIdsSql` + `orgFiltersOnSemesterProdiId` dihapus; scope `kelas` memakai `kelasScopeSql` (`k.program_studi_id` / `k.semester_id` langsung).
- `helpers/academicPeriod.js`: `semesterIdFromKelas`, `assertKrsPeriodForKrs`, dan **`assertKrsPeriodForSemester`** (pengganti `assertKrsPeriodForSemesterProdi`) membaca `semester_id` langsung.
- `helpers/jadwalConflict.js` (batas bentrok per `semester_id` + `program_studi_id`), `helpers/rekapCpDetail.js`, `helpers/laporanCpPreview.js`.
- Service: `krs` (`getContext` memakai `semester.is_aktif` global + `sks_maksimal` prodi), `krs-detil`, `cross-enrollment`, `kelas`, `penawaran-matakuliah`, `jadwal-kelas`, `dashboard` (`orgSummary`/`dosenSummary` mengirim `semester` + `sks_maksimal`), `bimbingan-akademik`, `rekap-cp`, `laporan-cp-matakuliah` (JOIN `semester` langsung).
- Dihapus: `helpers/semesterProdiProvision.js`, modul `semester-prodi` (service/controller/route/validasi), entri permission `SemesterProdi`, provisi di `semester.service`/`program-studi.service`, dan seeder backfill Fase 1 yang jadi usang.
- Validasi: `semester_prodi_id` → `semester_id` (+`program_studi_id` untuk `kelas`/`penawaran_matakuliah`).
- Seeder dibersihkan dari semua tulisan `semester_prodi`: `002-seed-master-akademik` (kuota SKS ke `program_studi`), `20260904045729-demo-mapping-data`, `20260909033159-import-tpb-portal-data`, `20260912000002`, `20260912000003`.

Frontend:

- Halaman/menu/route/policy/`api.js` **Semester Prodi dihapus** (`SemesterProdiPage`, `SemesterProdiForm`, plus `PenawaranForm` yang sudah tak terpakai).
- Pembaca `semesterProdi` pindah ke `semester`/`programStudi`: dashboard mahasiswa/prodi/org/dosen, `KelasPage`, `JadwalRuangPage` (kini memilih dari daftar semester global), `PenawaranSemesterPage`, `PenawaranDetailPage`, `PengambilanKrsPage` (kirim `semester_id` saat membuat KRS), `PersetujuanKrsPage`, `MahasiswaBimbinganPage`, kelas (`KelasInfoCard`, `KelasJadwalPanel`, `kelasListColumns`).
- `helpers/semesterProdi.js` → **`helpers/academicLabel.js`** (label semester/prodi tetap, nama file tidak lagi menyesatkan); `helpers/jadwal.js` membandingkan `semester_id` + `program_studi_id`; `helpers/courseOffering.js` mengirim `semester_id`/`program_studi_id`.

Verifikasi 5b:

- `grep -rn "semesterProdi\|semester_prodi" frontend/src backend/src` → hanya menyisakan model/migrasi historis + komentar (Fase 5c).
- **290 test backend** (51 suite) + **148 test frontend** lolos; `vite build` sukses; lint tidak menambah masalah baru (16 temuan pra-eksisting di file yang tak disentuh).
- Smoke test langsung ke DB dev: `kelas.list` mengembalikan `semester` "2026 Genap" + `programStudi` "S1 Peternakan"; `penawaran.list` `semester` 2026 + prodi; `krs.list` `semester` 2026; `orgSummary` prodi 79211 → `semester 2026`, `sks_maksimal 24`, `periode 2026-08-30 → 2026-10-10`; `getContext` → `semester` Genap 2026, `sks_maksimal 24`, KRS + periode terisi.
- Seeder diuji ulang pada DB dev: `002`, `20260904045729`, `20260912000002`, `20260912000003` jalan tanpa error, **idempoten** (run kedua: `kelas` tetap 654, `krs` 1.918, `semester_prodi` tetap **167** — tidak ada baris pivot baru), dan **0 kolom baru yang NULL**.

Catatan: run pertama menyisipkan **32 kelas lama Si** (2024 Ganjil 22, 2025 Genap 10) yang ternyata belum pernah ada di DB dev; tidak ada duplikat pada kunci baru `(semester_id, program_studi_id, matakuliah_id, nama)`, dan run berikutnya tidak menambah baris lagi.

**5c — migrasi drop + bersihkan model ✅ selesai** (`20260912000016-drop-semester-prodi.js`)

- Urutan wajib MySQL dijalankan eksplisit: (1) lepas FK ke pivot, (2) lepas **indeks unik lama** yang memuat `semester_prodi_id` — kalau tidak, MySQL hanya mencabut kolomnya dari indeks dan menyisakan unik yang salah arti (mis. `krs` jadi "satu KRS per mahasiswa seumur hidup"), (3) buang kolom `semester_prodi_id` di keempat tabel, (4) `DROP TABLE semester_prodi`.
- Nama FK/indeks dicari dari `information_schema` (tahan perbedaan penamaan antar-instalasi), sehingga `up()` **idempoten** dan `down()` bisa memulihkan struktur tanpa tabel pivot (isi pivot sudah tidak bisa kembali — kolomnya `NULL`, jalur pemulihan lewat seeder/provision).
- Model & asosiasi dibersihkan: `models/semesterProdi.js` dihapus, begitu pula atribut `semester_prodi_id` serta asosiasi `SemesterProdi` di `kelas`, `krs`, `penawaranMatakuliah`, `rekapCp`, `programStudi`, dan `semester`.
- Kuota SKS kini benar-benar hidup di **Program Studi**: `program_studi.sks_default`/`sks_maksimal` ditambahkan ke validasi create/update dan ke form Prodi (backend `program-studi.validation.js`, frontend `ProdiForm.jsx`/`ProdiFormPage.jsx`).

Verifikasi 5c di DB dev:

- `SHOW TABLES LIKE 'semester_prodi'` → tidak ada; `semester_prodi_id` hilang dari `kelas`/`krs`/`penawaran_matakuliah`/`rekap_cp`; kolom baru lengkap dan **0 `NULL`** (`kelas` 654 baris, `krs` 1.918 baris); `program_studi.sks_default`/`sks_maksimal` ada.
- Migrasi diuji langsung: `up()` dipanggil dua kali (idempoten — tidak error, keadaan sama), lalu `down()` mengembalikan tabel + kolom + FK + unik lama, dan `up()` berikutnya membuangnya lagi. DB dev berakhir pada keadaan final (pivot tidak ada).
- Smoke test pasca-drop ke DB dev: `kelas.list` (68 → `semester` 2026 Genap + `programStudi` "S1 Peternakan"), `penawaran.list` (3), `krs.list` (359), `krs.getContext` → `semester` Genap 2026, `sks_maksimal 24`, periode `2026-08-30 → 2026-10-10`, 3 detil KRS, **tanpa** properti `semesterProdi`; `orgSummary` fakultas Teknologi Pertanian → `kelas 65` (cocok dengan SQL acuan), prodi → `sks_maksimal 24`.
- **290 test backend** (51 suite) + **146 test frontend** lolos; `vite build` sukses; lint tetap 16 temuan pra-eksisting (tidak ada yang baru).
- Sisa penyebutan nama lama hanya di komentar penjelas dan migrasi historis; `grep "semesterProdi\|semester_prodi" frontend/src` bersih, dan helper `semesterProdiLabel` yang jadi dead code ikut dihapus.

**Catatan risiko (sudah dilewati)**: kode 5b tidak lagi menulis `semester_prodi_id`, jadi drop di 5c aman — dengan syarat tidak ada deploy kode lama lagi setelahnya. Migrasi 5c karena itu harus satu rilis dengan kode 5b.

## 5. Baseline migrasi (setelah squash) ✅

Riwayat 71 migrasi (39 `create-*` + 32 tambal-sulam `add-*`/`drop-*`/`change-*`/`rename-*`, termasuk seluruh saga `semester_prodi` di atas) **sudah di-squash** menjadi **50 migrasi `create-*` murni** — satu file per tabel, urut sesuai dependensi FK, tanpa satu pun `add`/`drop`/`change`. Nama file lama yang disebut di bagian Fase di atas sudah tidak ada lagi di repo; jejaknya hanya catatan historis di dokumen ini.

Isi tiap file: `createTable` (semua kolom final + tipe + default + nullable), lalu `addIndex` untuk setiap indeks non-PRIMARY, lalu `addConstraint` FK dengan nama deterministik `<tabel>_<kolom>_fk`; `down()` = `dropTable`.

| # | file | # | file |
| --- | --- | --- | --- |
| 001 | `create-roles` | 026 | `create-cpmk-scp` |
| 002 | `create-permissions` | 027 | `create-sumber-penilaian` |
| 003 | `create-users` | 028 | `create-gedung` |
| 004 | `create-user-roles` | 029 | `create-ruang` |
| 005 | `create-role-permissions` | 030 | `create-shift` |
| 006 | `create-universitas` | 031 | `create-penawaran-matakuliah` |
| 007 | `create-fakultas` | 032 | `create-penawaran-matakuliah-detil` |
| 008 | `create-departemen` | 033 | `create-penawaran-matakuliah-prodi` |
| 009 | `create-jenjang-akademik` | 034 | `create-kelas` |
| 010 | `create-model-kurikulum` | 035 | `create-dosen-kelas` |
| 011 | `create-program-studi` | 036 | `create-jadwal-kelas` |
| 012 | `create-dosen` | 037 | `create-dosen-jadwal` |
| 013 | `create-mahasiswa` | 038 | `create-krs` |
| 014 | `create-bimbingan-akademik` | 039 | `create-krs-detil` |
| 015 | `create-jenis-semester` | 040 | `create-nilai-mahasiswa` |
| 016 | `create-semester` | 041 | `create-history-upload-nilai` |
| 017 | `create-jenis-dokumen-evaluasi` | 042 | `create-evaluasi-cpmk` |
| 018 | `create-kurikulum` | 043 | `create-rekap-cp` |
| 019 | `create-sifat-matakuliah` | 044 | `create-laporan-cp` |
| 020 | `create-tipe-matakuliah` | 045 | `create-laporan-cp-detil` |
| 021 | `create-matakuliah` | 046 | `create-dokumen-evaluasi` |
| 022 | `create-matakuliah-kurikulum` | 047 | `create-periode` |
| 023 | `create-cp` | 048 | `create-refresh-tokens` |
| 024 | `create-scp` | 049 | `create-user-units` |
| 025 | `create-cpmk` | 050 | `create-activity-logs` |

Dua hal yang **berubah** dibanding skema lama (keduanya perbaikan, sudah masuk baseline):

1. Enam FK yang dulu terlewat kini terpasang — `kelas.semester_id`/`kelas.program_studi_id`, `krs.semester_id`, `penawaran_matakuliah.semester_id`/`program_studi_id` (semua `RESTRICT`), dan `rekap_cp.semester_id` (`SET NULL`); plus `idx_rekap_cp_semester` sebagai penopang FK-nya.
2. Nama constraint FK jadi seragam `<tabel>_<kolom>_fk` (dulu campur `*_ibfk_N` dan `*_foreign_idx`). Nama indeks tidak diubah.

Cara kerja dengan baseline ini:

- **Instalasi baru**: `npm run db:migrate` lalu `npm run db:seed` — terbukti jalan dari nol (50/50 migrasi, 26/26 seeder, tanpa error).
- **Database lama** (yang `SequelizeMeta`-nya masih berisi 71 nama lama): cukup arahkan ulang riwayatnya, jangan jalankan `create-*` di atas tabel yang sudah ada —
  `DELETE FROM SequelizeMeta; INSERT INTO SequelizeMeta (name) VALUES ('001-create-roles.js'), … '050-create-activity-logs.js';`
  (atau impor dump, lalu `db:migrate`).
- **Rollback**: `npm run db:migrate:undo:all` membalik seluruh 50 migrasi (terverifikasi: 50 reverted, menyisakan `SequelizeMeta` saja).

Verifikasi squash (DB dev di-drop & dibangun ulang dari nol, 12 Sep 2026):

- Skema hasil rebuild **identik** dengan skema sebelum squash: 50 tabel, 422 kolom, dan seluruh 78 FK lama utuh dengan aturan `ON DELETE`/`ON UPDATE` yang sama; satu-satunya selisih adalah 6 FK + 1 indeks baru di atas serta nama constraint FK.
- Database uji terpisah (`myunand_migcheck`) yang dimigrasi dari nol menghasilkan snapshot **tanpa satu pun selisih** dengan DB dev hasil rebuild (50 tabel, 422 kolom, 196 indeks, 84 FK) — lalu di-`undo:all` (50 reverted) dan dihapus.
- Data dev terisi lagi oleh 26 seeder (logika idempoten yang sama): 153 prodi, 16 fakultas, 67 departemen, 632 mahasiswa, 220 matakuliah, 650 kelas, 1.917 KRS, 5.936 KRS detil, 305.965 nilai.
- **290 test backend** (51 suite) + **146 test frontend** lolos; smoke test ke DB dev lolos (`kelas.list`, `penawaran.list`, `krs.list`, `krs.getContext`, dan `orgSummary` fakultas = 71 kelas — sama persis dengan SQL acuan).
- Backup sebelum rebuild: `mysqldump` penuh DB dev (mis. `/tmp/myunand-before.sql`) diambil sebelum tabel dibuang.

## 6. Risiko & mitigasi

| Risiko                                                                        | Mitigasi                                                                                                          |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 150 prodi tanpa pivot → KRS/kelas/penawaran mati                              | Fase 1 (selesai) + Fase 2 (provision otomatis)                                                                    |
| Dashboard menampilkan "Belum diatur" karena membaca tanggal prodi yang kosong | Sudah diperbaiki: Fase 3a menyediakan blok `periode`, Fase 3b memindahkan ketiga dashboard membacanya; pastikan `periode` jenis `krs` terisi sebelum semester aktif |
| `db:seed:all` menjalankan ulang semua seeder (DB tanpa tabel riwayat seeder)  | Jangan `drop` kolom sebelum semua seeder lama dibersihkan; seeder baru wajib idempoten. Seeder `002` sudah dijaga: tidak ikut menulis `is_aktif` semester saat upsert dan hanya mengaktifkan 2024 Ganjil bila belum ada semester aktif |
| `UNIQUE` lama di `penawaran_matakuliah`/`krs` yang memuat kolom pivot          | Sudah diganti unik baru tanpa pivot di Fase 5a; Fase 5c melepas unik lama sebelum kolomnya di-drop                |
| `krs` tanpa semester saat pivot belum ada                                      | Teratasi sejak Fase 1/2 (provision + backfill) dan hilang total di Fase 5 karena `krs.semester_id` kini wajib    |
| Perubahan menyentuh scope organisasi (dulu `semesterProdiIdsSql`)             | Scope `kelas` kini memakai `kelasScopeSql`; jalankan test `academicFilters`, `rekapCpDetail`, dan uji manual filter per fakultas/departemen/prodi |
| `20260912000016` (`DROP TABLE semester_prodi`) sudah dijalankan              | Wajib **satu rilis** dengan kode 5b: rollback kode lama saja akan gagal karena kolom pivot sudah tidak ada. Pemulihan lewat `down()` (struktur saja) + seeder provision                                                              |

## 7. Keputusan yang masih terbuka

1. **Batas SKS**: memang berbeda per prodi, atau satu angka global per semester? Data dev: semua `sks_maksimal = 24`, `sks_default` berbeda (15/18). Rekomendasi: pertahankan per prodi, dengan default dari satu setting global. **Belum diputuskan** (tidak menghambat Fase 3).
2. **Revisi KRS** — **diputuskan di Fase 3**: tidak dipakai. Tidak ada konsumen di backend, `JENIS` periode tidak memuat `revisi`, dan 7 baris berisinya hanya sisa seeder di semester lampau. Keempat kolom tanggal di `semester_prodi` dibuang; jenis `revisi` ditambahkan hanya bila fiturnya benar-benar dibutuhkan.
3. **Cakupan provision** — **diputuskan di Fase 2**: semester lampau dilewati; seeder & prodi baru memakai semester target (aktif + mendatang), sedangkan **semester yang baru dibuat selalu diprovision** karena admin sengaja membuatnya untuk dipakai. Mengecualikan riwayat impor dapat ditambahkan bila nanti dibutuhkan.

## 8. Pemakaian yang sudah disisir (Fase 1–5) ✅

Daftar di bawah adalah berkas yang dikhawatirkan menulis/membaca pivot pada saat rencana dibuat. Semuanya sudah dipindahkan ke `semester_id`/`program_studi_id` dan lolos uji:

- Backend: `helpers/academicPeriod.js`, `helpers/academicFilters.js`, `helpers/rekapCpDetail.js`, `helpers/jadwalConflict.js`, `helpers/laporanCpPreview.js`, `services/semester/*`, `services/krs/*`, `services/perkuliahan/{kelas,penawaran-matakuliah,jadwal-kelas}.service.js`, `services/dashboard/dashboard.service.js`, `services/institusi/bimbingan-akademik.service.js`, `services/evaluasi/*`, `validations/{krs,perkuliahan,evaluasi}/*`, serta lima seeder demo/import.
- Frontend: `helpers/krsPeriod.js`, `helpers/academicLabel.js` (dulu `semesterProdi.js`), `helpers/jadwal.js`, `helpers/courseOffering.js`, `pages/DashboardPage.jsx`, `components/dashboard/{AdminProdiDashboard,AdminOrgDashboard,DosenDashboard}.jsx`, `pages/perkuliahan/{KelasPage,PenawaranSemesterPage,PenawaranDetailPage,JadwalRuangPage,PersetujuanKrsPage}.jsx`, `pages/mahasiswa/PengambilanKrsPage.jsx`, `pages/kemahasiswaan/MahasiswaBimbinganPage.jsx`, `components/kelas/*`, `utils/crossEnrollment.js`, `services/api.js`, `routes/index.jsx`, `constants/navigation.js`, `policies/defineAbility.js`.
- Dihapus: `validations/semester/semester-prodi.validation.js`, `services/semester/semester-prodi.service.js` (+ controller/route), `helpers/semesterProdiProvision.js`, `pages/semester/SemesterProdiPage.jsx`, `components/master/SemesterProdiForm.jsx`, `models/semesterProdi.js`.

Regresi dijaga oleh: `tests/unit/helpers/academicFilters.test.js` (assert SQL tidak memuat `semester_prodi`), `tests/unit/services/semester.service.test.js`, `tests/unit/seeders/masterAkademikSemesterAktif.test.js` (seeder tidak menyentuh tabel pivot), `frontend/src/helpers/academicLabel.test.js`, dan smoke test pasca Fase 5c di DB dev.
