# API

Prefix: `/api/v1`

Kontrak list: `page`, `limit`, `search`, `sortBy`, `sortOrder`, `filter[field]`.
Response list: `data` (array) + `pagination` `{ page, limit, total, totalPages }`.

Auth publik: `POST /api/v1/auth/login`. Endpoint lain memakai JWT + CASL.
Health: `GET /up`.

Auth terautentikasi:
- `GET /api/v1/auth/me`, `GET /api/v1/auth/profile`
- `PUT /api/v1/auth/profile` `{ name }`
- `PUT /api/v1/auth/change-password` `{ current_password, new_password }`

Dashboard: `GET /api/v1/dashboard/summary` — hitung `mahasiswa`, `dosen`, `matakuliah`, `kelas`.

Dokumen evaluasi:
- `GET|POST /api/v1/jenis-dokumen-evaluasi`, `GET|PUT|DELETE /:id`, `POST /:id/restore`
- `GET|POST /api/v1/dokumen-evaluasi`, `GET|PUT|DELETE /:id` — `file_path` teks, bukan unggah biner.
