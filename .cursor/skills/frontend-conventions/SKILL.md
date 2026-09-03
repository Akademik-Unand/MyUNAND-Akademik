---
name: frontend-conventions
description: Aturan wajib dan struktur folder untuk frontend project ini (React + Vite, konsumsi API backend Express). Gunakan skill ini SETIAP kali membuat, mengedit, atau meninjau kode frontend — komponen baru, halaman, hook, pemanggilan API, form, chart, loading state, atau pengecekan permission di UI. Wajib dicek juga saat menulis test komponen. Jangan generate kode frontend tanpa membaca skill ini terlebih dahulu.
---

# Frontend Conventions — React (Vite)

Skill ini adalah rulebook wajib untuk kode frontend di project ini, konsisten dengan konvensi backend (lihat skill `backend-conventions`). Prinsip utama: **modular & atomic** — tidak ada logika, style, atau markup besar yang menumpuk jadi satu file raksasa.

## 1. Struktur Folder

```
src/
├── components/
│   ├── ui/            # atom paling dasar: Button, Input, Badge, Modal, Spinner, Skeleton, Icon — tanpa logic bisnis
│   ├── common/         # gabungan beberapa ui/ jadi unit yang lebih besar tapi masih generik (SearchBar, DataTable, Pagination, ConfirmDeleteModal)
│   └── <fitur>/        # komponen spesifik satu fitur, misal components/krs/KrsTable.jsx
├── pages/              # halaman/route level — komposisi dari components, tempat manggil hook & service
├── layouts/            # shell halaman (MainLayout, AuthLayout, Sidebar, Navbar)
├── hooks/              # custom hooks reusable (useAuth, useDebounce, useConfirmDelete, dll)
├── services/           # semua pemanggilan API
├── store/              # Zustand store (state global)
├── validations/         # schema Zod per resource/form
├── utils/              # fungsi murni reusable (format tanggal, currency, dll)
├── helpers/            # helper spesifik domain (mapping data API -> bentuk UI, mapping data ke format ApexCharts)
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
components/ui/Icon.jsx
components/ui/Skeleton.jsx
```

`components/common/` boleh menggabungkan beberapa `ui/` jadi komponen yang lebih kompleks tapi tetap tidak terikat satu fitur (misalnya `DataTable`, `ConfirmDeleteModal` dipakai di banyak halaman).

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
  remove: (id) => apiClient.delete(`/krs/${id}`),
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

## 7. Chart — Wajib ApexCharts

- Semua kebutuhan visualisasi data (grafik, dashboard) pakai `apexcharts` + `react-apexcharts`, jangan campur dengan library chart lain supaya konsisten tema & style di seluruh aplikasi.
- Bungkus tiap chart jadi komponen sendiri di `components/<fitur>/` atau `components/common/` (misal `RevenueChart.jsx`), jangan taruh konfigurasi `options`/`series` ApexCharts langsung di dalam `pages/`.
- Mapping data API ke format `series`/`categories` yang dibutuhkan ApexCharts dilakukan di `helpers/`, bukan inline di komponen chart — supaya komponen chart tetap murni terima props data yang sudah rapi.
- Untuk chart yang dipakai berulang dengan style sama (misal semua bar chart dashboard), buat komponen wrapper generik (`components/common/BarChart.jsx`) yang menerima `series`/`categories` sebagai props, supaya konfigurasi tema tidak diulang-ulang di tiap tempat.

## 8. Loading State — Wajib Skeleton

- Untuk state loading data (list, detail, dashboard), gunakan **skeleton loading** (`components/ui/Skeleton.jsx`, bisa custom atau pakai `react-loading-skeleton`), BUKAN spinner polos di tengah layar, supaya layout tidak "loncat" saat data selesai dimuat.
- Bentuk skeleton mengikuti bentuk konten aslinya (skeleton tabel menyerupai baris tabel, skeleton card menyerupai card), ditaruh berdampingan dengan komponen aslinya di folder yang sama atau sebagai varian dari komponen tersebut (misal `KrsTable.jsx` render `KrsTableSkeleton` saat `isLoading`).
- Spinner (`components/ui/Spinner.jsx`) tetap boleh dipakai khusus untuk aksi singkat seperti submit form/tombol (loading button), bukan untuk loading data halaman/list.

## 9. Konfirmasi Hapus — Wajib Modal

- Setiap aksi hapus data (delete) WAJIB melewati modal konfirmasi terlebih dahulu, tidak boleh langsung hapus dari klik tombol.
- Gunakan satu komponen generik `components/common/ConfirmDeleteModal.jsx` yang dipakai ulang di semua fitur (menerima props judul, pesan, dan callback `onConfirm`), jangan bikin modal konfirmasi terpisah-pisah tiap fitur.
- Idealnya dibungkus custom hook (`hooks/useConfirmDelete.js`) yang menggabungkan state buka/tutup modal + pemanggilan `service.remove()` + invalidate cache React Query setelah berhasil, supaya komponen tabel/list tinggal panggil satu fungsi.

## 10. Icon — Wajib Iconify

- Semua icon di aplikasi pakai `@iconify/react` (`<Icon icon="mdi:trash-can" />`), jangan campur dengan icon library lain (react-icons, heroicons, dll) supaya konsisten dan tidak menambah bundle size dari banyak sumber.
- Bungkus pemakaian Iconify lewat komponen `components/ui/Icon.jsx` (wrapper tipis di atas `@iconify/react`) supaya kalau suatu saat ganti sumber icon set, cukup ubah satu file.
- Pilih satu icon set utama secara konsisten (misal `mdi` atau `lucide` dari koleksi Iconify) untuk keseragaman visual, hindari mencampur banyak icon set berbeda gaya dalam satu halaman.

## 11. Notifikasi — Wajib Sonner

- Semua notifikasi/feedback aksi (sukses simpan, gagal request, konfirmasi delete berhasil, dll) pakai `sonner` (`toast.success(...)`, `toast.error(...)`), jangan pakai `alert()` bawaan browser atau library toast lain.
- Pasang satu komponen `<Toaster />` di root aplikasi (`App.jsx` atau `main.jsx`), jangan render `<Toaster />` berulang di tiap halaman.
- Standarisasi pesan: pakai pesan `message` yang sudah dikirim backend (format response poin 5 di `backend-conventions`) untuk `toast.success`/`toast.error`, jangan hardcode pesan berbeda di FE supaya konsisten dengan yang dicatat backend.
- Idealnya trigger toast dipusatkan di interceptor `apiClient.js` untuk error umum (misal error 500/network), sementara toast sukses aksi spesifik (create/update/delete) dipanggil dari hook/handler terkait aksinya masing-masing.

## 12. Otorisasi di UI — CASL

- Definisikan/ambil ability CASL yang sama konsepnya dengan backend di `policies/`, dipakai untuk show/hide tombol, menu, atau route berdasarkan permission user.
- Bungkus elemen UI yang butuh permission dengan `<Can I="create" a="Krs">...</Can>` (`@casl/react`), jangan hardcode `if (user.role === 'admin')` tersebar di komponen.
- Route yang butuh permission dijaga satu wrapper `ProtectedRoute` di `routes/`, bukan dicek manual di tiap halaman.

## 13. Helper & Utils

- Logic yang berpotensi dipakai ulang (format tanggal, format currency, mapping status ke label/warna, mapping data ke format ApexCharts, dsb) ditaruh di `utils/` (generik) atau `helpers/` (spesifik domain) — jangan copy-paste ke banyak komponen.

## 14. Kerapian & Modularitas

- Satu file = satu tanggung jawab. Komponen yang sudah menangani banyak hal (fetch + form + tabel + modal) WAJIB dipecah.
- Penamaan konsisten: PascalCase untuk file komponen (`KrsTable.jsx`), camelCase untuk hook/fungsi/file non-komponen (`useKrsList.js`, `krs.service.js`).
- Import/export: named export untuk komponen kecil di `ui/`/`common/` (gampang di-refactor), default export boleh untuk komponen halaman (`pages/`).

## 15. Testing & Dokumentasi

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
- [ ] Chart pakai ApexCharts, data sudah dimapping lewat helper
- [ ] Loading data pakai skeleton, bukan spinner polos (spinner khusus aksi tombol)
- [ ] Aksi hapus lewat ConfirmDeleteModal, tidak langsung hapus
- [ ] Icon pakai Iconify lewat komponen Icon wrapper
- [ ] Notifikasi aksi (sukses/error) pakai Sonner, bukan alert() atau library lain
- [ ] Permission dicek pakai CASL, bukan hardcode role
- [ ] Test ditulis untuk logic non-trivial
