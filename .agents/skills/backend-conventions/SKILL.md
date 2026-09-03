---
name: backend-conventions
description: Aturan wajib dan struktur folder untuk backend project ini (Express.js + Sequelize + Joi + CASL). Gunakan skill ini SETIAP kali membuat, mengedit, atau meninjau kode backend — endpoint baru, controller, service, model, migrasi, validasi, middleware, atau permission. Wajib dicek juga saat menulis test dan dokumentasi API. Jangan generate kode backend tanpa membaca skill ini terlebih dahulu.
---

# Backend Conventions — Express.js + Sequelize

Skill ini adalah rulebook wajib untuk semua kode backend di project ini. Ikuti urutan dan struktur di bawah ini secara konsisten — jangan menyimpang tanpa alasan jelas yang didiskusikan dengan user.

## 1. Struktur Folder

Semua kode backend berada di dalam `src/`. Struktur dasar:

```
src/
├── config/          # konfigurasi (db, jwt, casl, dll) — baca dari .env
├── controllers/     # terima request, panggil service, kirim response
├── services/        # logika bisnis murni, tidak tahu soal req/res
├── routes/          # definisi endpoint, mapping ke controller
├── models/          # model Sequelize (hasil generate CLI)
├── migrations/      # migrasi Sequelize (hasil generate CLI)
├── seeders/         # seeder Sequelize
├── validations/      # schema Joi per resource
├── middlewares/     # auth, permission check, error handler, dll
├── helpers/         # fungsi murni yang dipakai berulang (format, mapping, dll)
├── utils/           # utilitas umum (logger, response formatter, dll)
├── policies/        # definisi CASL ability per role
└── app.js / server.js
```

### Subfolder untuk fitur besar

Kalau satu fitur punya banyak file (controller/service/route/validation), kelompokkan jadi subfolder dengan nama fitur, bukan ditumpuk rata di root folder. Contoh untuk fitur "KRS":

```
controllers/krs/krs.controller.js
services/krs/krs.service.js
routes/krs/krs.route.js
validations/krs/krs.validation.js
```

Kalau fiturnya kecil dan tidak akan berkembang, file tunggal di root folder (`controllers/user.controller.js`) tetap boleh.

## 2. Alur Request (Layering)

Setiap endpoint HARUS melewati alur ini, tidak boleh loncat layer:

```
route → middleware (auth, permission, validasi) → controller → service → model
```

- **Route**: hanya mapping URL + method ke controller + middleware yang dibutuhkan. Tidak ada logika di sini.
- **Controller**: hanya menerima `req`, memanggil service, dan mengembalikan response terstandar (lihat poin 5). Tidak ada query DB langsung di controller.
- **Service**: semua logika bisnis, query DB, panggil model, transaksi. Service TIDAK boleh tahu soal `req`/`res` — supaya bisa dites terpisah dan dipakai ulang (misalnya dipanggil dari job/cron).

## 3. Sequelize — Wajib Pakai CLI

- Gunakan `sequelize-cli` untuk generate model, migration, dan seeder — jangan tulis manual dari nol.
  ```bash
  npx sequelize-cli model:generate --name Krs --attributes ...
  npx sequelize-cli migration:generate --name add-column-x-to-krs
  npx sequelize-cli seed:generate --name demo-krs
  ```
- **Migrasi lama TIDAK BOLEH diedit** setelah pernah dijalankan/di-commit. Kalau ada perubahan skema, selalu buat file migrasi baru (misal `add-status-to-krs`, `rename-column-x`).
- Gunakan transaction (`sequelize.transaction()`) untuk operasi yang melibatkan lebih dari satu tabel, supaya atomic.

## 4. Validasi — Wajib Joi

- Setiap request yang masuk (`body`, `params`, `query`) WAJIB divalidasi pakai Joi sebelum masuk ke controller logic.
- Schema Joi diletakkan di `validations/<resource>/`, satu file per resource atau per aksi (`create`, `update`).
- Validasi dijalankan lewat middleware generik, contoh pola:
  ```js
  router.post('/krs', validate(krsValidation.create), krsController.create);
  ```
- Kalau validasi gagal, middleware langsung melempar error terstandar (lihat poin 5), tidak sampai ke controller.

## 5. Standarisasi Response

Semua response API — sukses maupun error — HARUS mengikuti format yang sama lewat helper terpusat (contoh: `utils/apiResponse.js`), jangan `res.json({...})` manual berulang-ulang.

Format sukses:
```json
{
  "success": true,
  "message": "Data KRS berhasil dibuat",
  "statusCode": 201,
  "data": { }
}
```

Format error:
```json
{
  "success": false,
  "message": "Validasi gagal",
  "statusCode": 422,
  "errors": [ { "field": "nim", "message": "NIM wajib diisi" } ]
}
```

Untuk list/pagination, `data` berbentuk:
```json
{ "items": [ ], "page": 1, "limit": 10, "total": 42 }
```

Gunakan custom Error class (`AppError`) yang membawa `statusCode` + `message`, dilempar dari service, ditangkap oleh global error handler (lihat poin 7).

## 6. Logging — Wajib Pino

- Setup logger terpusat pakai `pino` di `utils/logger.js` atau `config/logger.js`. Untuk development, pasangkan `pino-pretty` supaya output di terminal enak dibaca; di production biarkan JSON polos (lebih murah & gampang diparsing log aggregator).
- Pasang `pino-http` sebagai middleware Express supaya setiap request otomatis ke-log (method, path, status code, response time) tanpa nulis manual di tiap controller.
- Log minimal: request masuk/keluar (lewat pino-http), error dengan stack trace (`logger.error({ err }, 'pesan error')`), dan event penting bisnis (misal "user X submit KRS").
- Jangan pakai `console.log` langsung di kode — selalu lewat logger, biar bisa diatur level (`info`, `warn`, `error`, `debug`) lewat `LOG_LEVEL` di `.env`.

## 7. Error Handling Global

- Ada satu middleware error handler di paling akhir chain Express yang menangkap semua error (termasuk dari Joi, Sequelize, dan `AppError` custom) lalu mengembalikan format response terstandar (poin 5).
- Gunakan wrapper `asyncHandler(fn)` di setiap controller supaya tidak perlu try-catch manual di setiap function — error otomatis diteruskan ke `next()`.

## 8. Helper & Utils

- Kalau ada logic yang berpotensi dipakai di lebih dari satu tempat (format tanggal, generate kode unik, mapping data, dsb), taruh di `helpers/` (spesifik domain) atau `utils/` (generik, tidak terikat domain tertentu). Jangan copy-paste logic yang sama ke banyak file.

## 9. Environment & Config

- Semua nilai sensitif/berubah-ubah (DB credential, JWT secret, port, dsb) HARUS lewat `.env`, jangan hardcode di kode.
- Konfigurasi dikumpulkan di `config/` (misal `config/database.js`, `config/jwt.js`) yang membaca dari `process.env`, bukan diakses `process.env` langsung tersebar di banyak file.

## 10. Security & Middleware Dasar

- Pasang `helmet` untuk security header dasar.
- Pasang `cors` dengan whitelist origin yang jelas, jangan `*` di production.
- Pasang `express-rate-limit` minimal untuk endpoint auth/login dan endpoint publik yang rawan abuse.

## 11. API Versioning

- Semua route diprefix versi, misal `/api/v1/...`, supaya breaking change di masa depan tidak merusak konsumen lama.

## 12. Otorisasi — Role Based Permission dengan CASL

- Gunakan `@casl/ability` untuk mendefinisikan permission, bukan hardcode pengecekan role (`if (user.role === 'admin')`) tersebar di controller.
- Definisikan ability per role di `policies/` (misal `policies/defineAbility.js`), berbasis data role + permission dari database (tabel `roles`, `permissions`, atau `role_permissions`), bukan hardcode di kode kalau permission-nya bisa berubah dari admin panel.
- Middleware `checkPermission('krs', 'create')` (atau bentuk serupa) dipasang di route sebelum controller, memakai `ability.can(action, subject)` dari CASL.
- Kalau menambah fitur baru: (1) tambahkan permission baru ke seeder/tabel permission, (2) definisikan action & subject-nya di `defineAbility.js`, (3) pasang middleware permission di route-nya. Jangan lupa update dokumentasi permission.

## 13. Testing & Dokumentasi — Wajib Jest, per Function/Endpoint

- Gunakan `jest` sebagai test runner untuk semua jenis test (unit maupun integration).
- Setiap kali selesai membuat function/service/endpoint baru, LANGSUNG buat test-nya sebelum lanjut ke fitur berikutnya:
  - **Unit test** untuk service/helper/utils — mock dependency (model, external call) pakai `jest.mock()`, fokus ke logika murni.
  - **Integration test** untuk endpoint — pakai `supertest` dipasangkan dengan Jest untuk hit route asli (`request(app).post('/api/v1/krs')...`), idealnya pakai database test terpisah (bisa direset per test run lewat migrasi).
- LANGSUNG update dokumentasi API (Swagger/OpenAPI via JSDoc comment di atas route, atau file `docs/` kalau belum ada Swagger setup) setiap endpoint baru selesai — jangan menumpuk dokumentasi di akhir.
- Struktur test mengikuti struktur source, pisah folder unit dan integration: `tests/unit/services/krs.service.test.js`, `tests/integration/krs.route.test.js`.

## 14. Kerapian & Modularitas

- Satu file = satu tanggung jawab. Kalau satu file service/controller sudah terlalu panjang dan menangani banyak hal berbeda, pecah jadi beberapa file/module.
- Penamaan konsisten: camelCase untuk variabel/fungsi JS, PascalCase untuk nama Class/Model, kebab-case atau camelCase untuk nama file (pilih satu gaya, jangan campur).
- Import/export style konsisten di seluruh project (pilih salah satu: CommonJS `require` atau ESM `import`, jangan campur).

## Checklist Sebelum Anggap Selesai

Setiap kali membuat fitur/endpoint baru, pastikan:
- [ ] Route → middleware (validasi Joi + permission CASL) → controller → service, semua ada
- [ ] Migrasi baru (bukan edit migrasi lama) kalau ada perubahan skema
- [ ] Response pakai format terstandar (sukses & error)
- [ ] Logging ditambahkan di titik penting
- [ ] Logic reusable dipindah ke helper/utils
- [ ] Permission CASL didefinisikan & middleware dipasang
- [ ] Test ditulis (unit dan/atau integration)
- [ ] Dokumentasi API diupdate
