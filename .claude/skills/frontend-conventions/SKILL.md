---
name: frontend-conventions
description: Aturan wajib dan struktur folder untuk frontend project ini (React + Vite, konsumsi API backend Express). Gunakan skill ini SETIAP kali membuat, mengedit, atau meninjau kode frontend — komponen baru, halaman, hook, pemanggilan API, form, atau pengecekan permission di UI. Wajib dicek juga saat menulis test komponen. Jangan generate kode frontend tanpa membaca skill ini terlebih dahulu.
---

# Frontend Conventions — React (Vite)

Skill ini adalah rulebook wajib untuk kode frontend di project ini, konsisten dengan konvensi backend (lihat skill `backend-conventions`). Prinsip utama: **modular & atomic** — tidak ada logika, style, atau markup besar yang menumpuk jadi satu file raksasa.

## 1. Struktur Folder

```
src/
├── components/
│   ├── ui/            # atom paling dasar: Button, Input, Badge, Modal, Spinner — tanpa logic bisnis
│   ├── common/         # gabungan beberapa ui/ jadi unit yang lebih besar tapi masih generik (SearchBar, DataTable, Pagination)
│   └── <fitur>/        # komponen spesifik satu fitur, misal components/krs/KrsTable.jsx
├── pages/              # halaman/route level — komposisi dari components, tempat manggil hook & service
├── layouts/            # shell halaman (MainLayout, AuthLayout, Sidebar, Navbar)
├── hooks/              # custom hooks reusable (useAuth, useDebounce, dll)
├── services/           # semua pemanggilan API
├── store/              # Zustand store (state global)
├── validations/         # schema Zod per resource/form
├── utils/              # fungsi murni reusable (format tanggal, currency, dll)
├── helpers/            # helper spesifik domain (mapping data API -> bentuk UI)
├── constants/          # konstanta (role, status, enum, route path)
├── policies/           # definisi CASL ability (show/hide UI berdasarkan permission)
├── routes/             # definisi routing + ProtectedRoute
├── assets/
└── main.jsx / App.jsx
```

### Prinsip Atomic — component/ui wajib dipecah berjenjang

`components/ui/` khusus untuk elemen paling kecil dan generik (tidak boleh import dari `services/` atau `store/` — murni terima props):

```
components/ui/Button.jsx
components/ui/Input.jsx
components/ui/Select.jsx
components/ui/Modal.jsx
components/ui/Badge.jsx
```

`components/common/` boleh menggabungkan beberapa `ui/` jadi komponen yang lebih kompleks tapi tetap tidak terikat satu fitur (misalnya `DataTable` dipakai di banyak halaman list).

`components/<fitur>/` baru untuk komponen yang memang spesifik satu domain bisnis (KRS, User, dll), dan boleh compose dari `ui/` + `common/`.

**Aturan keras**: jangan taruh markup besar (form panjang, tabel kompleks, dsb) langsung di dalam `pages/`. Halaman di `pages/` idealnya cuma memanggil hook untuk data + compose beberapa komponen — bukan tempat menulis JSX yang panjang.

### Subfolder per fitur besar

Kalau satu fitur (misal "KRS") sudah punya banyak file, kelompokkan konsisten di semua layer:

```
pages/krs/KrsListPage.jsx
pages/krs/KrsFormPage.jsx
components/krs/KrsTable.jsx
components/krs/KrsFilterBar.jsx
services/krs/krs.service.js
validations/krs/krs.schema.js
store/krs.store.js          # kalau memang butuh state khusus fitur ini
```

## 2. Konfigurasi & Kredensial (.env)

- Semua nilai environment-specific (base URL API, key pihak ketiga, dsb) HARUS lewat `.env`, dengan prefix `VITE_` (wajib di Vite supaya ke-expose ke client, contoh: `VITE_API_BASE_URL`).
- Jangan hardcode URL/key di kode. Buat satu file `src/config/env.js` yang membaca `import.meta.env` dan mengekspor nilai yang sudah divalidasi/di-default, supaya `import.meta.env.VITE_XXX` tidak dipanggil tersebar di banyak file.
- Sediakan `.env.example` di root project sebagai referensi variabel yang dibutuhkan (tanpa isi credential asli).

## 3. Service API (Axios)

Struktur service dua lapis:

```
services/
├── apiClient.js        # satu axios instance: baseURL dari config/env.js, header default, interceptor
└── <fitur>/
    └── krs.service.js  # fungsi spesifik resource, pakai apiClient
```

`apiClient.js` bertanggung jawab untuk:
- `baseURL` diambil dari `config/env.js` (bukan hardcode)
- interceptor request: sisipkan token auth dari `store/auth.store.js`
- interceptor response: bongkar wrapper backend (`{ success, message, data }`) jadi langsung `data`, dan lempar error terstandar kalau `success: false`, supaya komponen tidak perlu tahu bentuk wrapper-nya

`krs.service.js` hanya berisi fungsi per-aksi, contoh pola:
```js
export const krsService = {
  getAll: (params) => apiClient.get('/krs', { params }),
  getById: (id) => apiClient.get(`/krs/${id}`),
  create: (payload) => apiClient.post('/krs', payload),
  update: (id, payload) => apiClient.put(`/krs/${id}`, payload),
};
```

Komponen/hook TIDAK boleh memanggil `axios`/`fetch` langsung — selalu lewat fungsi di `services/`.

## 4. Data Fetching — React Query

- Semua data dari server (list, detail) diambil lewat `@tanstack/react-query`, dibungkus custom hook per resource (`hooks/useKrsList.js`), bukan `useEffect` + `useState` manual.
- Custom hook inilah yang dipanggil dari `pages/`, bukan `krsService` langsung dari halaman — supaya caching, loading, dan error state konsisten.

## 5. Validasi Form — Wajib Zod

- Gunakan `react-hook-form` + `@hookform/resolvers/zod` untuk semua form.
- Schema Zod ditaruh di `validations/<fitur>/`, satu file per resource atau per aksi (`createKrsSchema`, `updateKrsSchema`).
- Idealnya field & aturan di schema Zod selaras dengan schema Joi di backend, supaya pesan error konsisten antara client-side & server-side validation.

## 6. State Management Global — Wajib Zustand

- State global non-server (user login, sidebar open/close, filter yang perlu persist antar halaman) pakai `zustand`, satu file store per domain di `store/` (`auth.store.js`, `ui.store.js`), jangan satu store raksasa untuk semua hal.
- State server (data dari API) TIDAK masuk Zustand — itu sudah tanggung jawab React Query (poin 4). Zustand khusus untuk state klien murni.

## 7. Otorisasi di UI — CASL

- Definisikan/ambil ability CASL yang sama konsepnya dengan backend di `policies/`, dipakai untuk show/hide tombol, menu, atau route berdasarkan permission user.
- Bungkus elemen UI yang butuh permission dengan `<Can I="create" a="Krs">...</Can>` (`@casl/react`), jangan hardcode `if (user.role === 'admin')` tersebar di komponen.
- Route yang butuh permission dijaga satu wrapper `ProtectedRoute` di `routes/`, bukan dicek manual di tiap halaman.

## 8. Helper & Utils

- Logic yang berpotensi dipakai ulang (format tanggal, format currency, mapping status ke label/warna, dsb) ditaruh di `utils/` (generik) atau `helpers/` (spesifik domain) — jangan copy-paste ke banyak komponen.

## 9. Kerapian & Modularitas

- Satu file = satu tanggung jawab. Komponen yang sudah menangani banyak hal (fetch + form + tabel + modal) WAJIB dipecah.
- Penamaan konsisten: PascalCase untuk file komponen (`KrsTable.jsx`), camelCase untuk hook/fungsi/file non-komponen (`useKrsList.js`, `krs.service.js`).
- Import/export: named export untuk komponen kecil di `ui/`/`common/` (gampang di-refactor), default export boleh untuk komponen halaman (`pages/`).

## 10. Testing & Dokumentasi

- Setiap kali selesai membuat komponen penting/hook/util function, langsung buat test-nya (`vitest` + `@testing-library/react`) sebelum lanjut ke bagian berikutnya — minimal untuk logic non-trivial (bukan komponen display statis semata).
- Komponen di `components/ui/` dan `components/common/` sebaiknya punya dokumentasi singkat (JSDoc di atas komponen) berisi props yang diterima dan contoh pemakaian, karena dipakai lintas fitur.

## Checklist Sebelum Anggap Selesai

- [ ] Tidak ada markup/logic besar menumpuk di satu file `pages/`
- [ ] Komponen generik masuk `components/ui/` atau `components/common/`, bukan tercampur dengan komponen spesifik fitur
- [ ] Kredensial/URL dari `.env` (prefix `VITE_`) lewat `config/env.js`, tidak hardcode
- [ ] Pemanggilan API lewat `services/`, bukan langsung di komponen
- [ ] Data server pakai React Query, bukan `useEffect` manual
- [ ] Form pakai react-hook-form + Zod
- [ ] State global (bukan data server) pakai Zustand
- [ ] Permission dicek pakai CASL, bukan hardcode role
- [ ] Test ditulis untuk logic non-trivial
