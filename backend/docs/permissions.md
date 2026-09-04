# Permission catalog

Format nama: `{subject}.{action}` (contoh `fakultas.read`, `krs.approve`).
Satu aksi = satu baris. Jangan `manage-*`.

Aksi standar: `read`, `create`, `update`, `delete`.
Aksi khusus: `approve`, `upload`, `restore`, `assign-roles`, `sync-permissions`.
`restore` hanya untuk data master (soft delete).

## Subject

- institusi: universitas, fakultas, departemen, jenjang-akademik, model-kurikulum, program-studi, dosen, mahasiswa, bimbingan-akademik
- semester: jenis-semester, semester, semester-prodi
- kurikulum: kurikulum, sifat-matakuliah, tipe-matakuliah, matakuliah, matakuliah-kurikulum
- obe: cp, scp, cpmk, sumber-penilaian, cpmk-scp
- perkuliahan: ruang, kelas, dosen-kelas, jadwal-kelas, dosen-jadwal
- krs: krs, krs-detil (+ `krs.approve`)
- nilai: nilai (+ `nilai.upload`)
- evaluasi: history-upload-nilai, evaluasi-cpmk, jenis-dokumen-evaluasi, dokumen-evaluasi
- laporan: rekap-cp, laporan-cp
- iam: user, role, permission, activity-log (`activity-log.read` saja; + `user.assign-roles`, `role.sync-permissions`)

## Grant default

- admin-universitas (Admin Universitas): `manage` all (via nama role; slug lama `superadmin` masih dikenali)
- admin: semua kecuali `role.delete` dan `permission.delete` (akun lama)
- admin-fakultas: seperti admin, tanpa ubah universitas dan tanpa `role.sync-permissions`
- admin-departemen: seperti admin-fakultas, fakultas hanya read
- admin-prodi: seperti admin-departemen, departemen hanya read
- dosen: `krs.read`, `krs.approve`, seluruh nilai/evaluasi, laporan read
- dosen-pa: grant dosen + bimbingan akademik + `mahasiswa.read`
- mahasiswa: `krs.read` / `krs.create` / `krs.update`, laporan read
- orang-tua: laporan read
- pimpinan-prodi / pimpinan-departemen / pimpinan-fakultas: read akademik (bukan IAM)

Grant diubah lewat `GET /api/v1/roles/matrix` dan `PUT /api/v1/roles/:id/permissions`.

User multi-role: `user_roles`. `GET /api/v1/auth/me` mengembalikan `roles[]` dan `permissions[]`.

Jejak aktivitas tulis-saja: `GET /api/v1/activity-logs` (permission `activity-log.read`). Middleware mencatat create/update/delete/restore/login dan aksi khusus; GET tidak dicatat.
