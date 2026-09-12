# Permission catalog

Format nama: `{subject}.{action}` (contoh `fakultas.read`, `krs.approve`).
Satu aksi = satu baris. Jangan `manage-*`.

Aksi standar: `read`, `create`, `update`, `delete`.
Aksi khusus: `approve`, `upload`, `restore`, `assign-roles`, `sync-permissions`, `assign-units`, `publish`, `close`, `catalog`, `schedule`, `sync`, `enroll`.
`restore` hanya untuk data master (soft delete).

## Subject

- institusi: universitas, fakultas, departemen, jenjang-akademik, model-kurikulum, program-studi, dosen, mahasiswa, bimbingan-akademik
- semester: jenis-semester, semester, semester-prodi, periode
- kurikulum: kurikulum, sifat-matakuliah, tipe-matakuliah, matakuliah, matakuliah-kurikulum
- obe: cp, scp, cpmk, sumber-penilaian, cpmk-scp
- perkuliahan: gedung, ruang, shift, kelas, dosen-kelas, jadwal-kelas, dosen-jadwal, penawaran-matakuliah (+ publish, close, catalog, schedule, sync)
- krs: krs, krs-detil, cross-enrollment (+ `krs.approve`, enroll). Persetujuan pengajuan lintas prodi memakai `krs.approve` — tidak ada aksi terpisah.
- nilai: nilai (+ `nilai.upload`)
- evaluasi: history-upload-nilai, evaluasi-cpmk, jenis-dokumen-evaluasi, dokumen-evaluasi
- laporan: rekap-cp, laporan-cp
- iam: user, role, permission, activity-log (`activity-log.read` saja; + `user.assign-roles`, `role.sync-permissions`, `user.assign-units`)

## Grant default

- admin-universitas (Admin Universitas): `manage` all (via nama role; slug lama `superadmin` masih dikenali)
- admin-fakultas: semua kecuali `role.delete`, `permission.delete`, ubah universitas, dan `role.sync-permissions`
- admin-departemen: seperti admin-fakultas, fakultas hanya read
- admin-prodi: seperti admin-departemen, departemen hanya read, dan **Program Studi read-only** (tanpa `create`/`update`/`delete`/`restore`)
- `program-studi.update-sks` (kuota SKS) hanya diberikan ke role tingkat universitas (`admin-universitas`, `admin`); admin unit tetap boleh mengubah profil prodi lewat `program-studi.update`, tetapi angka SKS-nya terbuang sebelum sampai ke service.

## Sidebar admin unit

Grant role admin unit sengaja luas (lihat "Grant default") — pembatasan datanya ada di scope organisasi, bukan di grant. Yang memisahkan tampilannya dari admin universitas adalah penyempitan menu di `frontend/src/helpers/navigation.js`:

- semua admin unit (fakultas/departemen/prodi): disembunyikan Fakultas, Jenjang Akademik, Gedung, Ruang, seluruh menu Semester (Jenis/Setting/Periode), Pengambilan KRS, Persetujuan KRS, dan grup Pengguna & Akses (Pengguna/Peran/Aktivitas);
- admin-departemen & admin-prodi: ditambah master Departemen (unit sendiri bagi departemen, unit di atasnya bagi prodi);
- admin-prodi juga tidak melihat master Program Studi: prodi bersifat read-only baginya (data prodinya tetap terbaca lewat scope organisasi), sedangkan kuota SKS-nya memang wewenang admin universitas. Admin departemen tetap melihat master Program Studi untuk prodi di departemennya.

Penyempitan ini hanya berlaku bila akun murni admin unit; bila ia juga memegang `admin-universitas`/`superadmin`, menu penuh yang ditampilkan (role yang lebih luas menang). Menu yang disembunyikan tetap terlindungi di sisi lain: akses URL dicek `PermissionRoute`, dan daftar/operasinya dibatasi scope organisasi.

## Scope unit organisasi

Role organisasi otomatis membatasi data ke unitnya (server-side, tidak bisa dilewati klien):
- admin-fakultas / pimpinan-fakultas → data fakultasnya (fakultas → semua departemen & prodi di dalamnya)
- admin-departemen / pimpinan-departemen → data departemennya (departemen → semua prodi di dalamnya)
- admin-prodi / pimpinan-prodi → data prodinya

`bimbingan-akademik` ikut dibatasi scope, tetapi karena tabelnya tidak menyimpan unit, filternya diterjemahkan lewat program studi **mahasiswa** bimbingan — termasuk pada operasi tulis (menetapkan/mengubah/menghapus PA mahasiswa di luar unit ditolak `403`).

Unit user ditentukan dari `user_units` (tabel assignment per user; diatur lewat `PUT /api/v1/users/:id/units`).
Admin universitas tidak dibatasi. User multi-unit mendapat gabungan unitnya.
- dosen: `krs.read`, `krs.approve` (termasuk keputusan pengajuan lintas prodi bimbingannya), seluruh nilai/evaluasi, laporan read
- dosen-pa: grant dosen + bimbingan akademik + `mahasiswa.read`
- mahasiswa: `krs.read` / `krs.create` / `krs.update`, `krs-detil.create` / `krs-detil.delete` (hanya KRS miliknya sendiri), penawaran catalog, cross-enrollment read/enroll, laporan read. Mengeluarkan mata kuliah — reguler maupun lintas prodi — dilakukan lewat `krs-detil.delete`.
- orang-tua: laporan read
- pimpinan-prodi / pimpinan-departemen / pimpinan-fakultas: read akademik (bukan IAM)

Grant diubah lewat `GET /api/v1/roles/matrix` dan `PUT /api/v1/roles/:id/permissions`.

User multi-role: `user_roles`. `GET /api/v1/auth/me` mengembalikan `roles[]` dan `permissions[]`.

Jejak aktivitas tulis-saja: `GET /api/v1/activity-logs` (permission `activity-log.read`). Middleware mencatat create/update/delete/restore/login dan aksi khusus; GET tidak dicatat.
