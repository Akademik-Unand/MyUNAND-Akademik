---
name: frontend-conventions
description: Aturan wajib frontend React + Vite (DaisyUI 5, DataTable, React Query, mock adapter). Gunakan SETIAP kali membuat, mengedit, atau meninjau kode frontend — halaman list/tabel, hook, service API, form, chart, modal, loading, atau permission. Jangan generate kode frontend tanpa membaca skill ini terlebih dahulu.
---

# Frontend Conventions — React (Vite)

Skill ini adalah rulebook wajib untuk kode frontend, konsisten dengan `backend-conventions`. Prinsip utama: **modular & atomic** — tidak ada logika, style, atau markup besar yang menumpuk jadi satu file raksasa.

## 1. Struktur Folder

```
src/
├── components/
│   ├── ui/            # atom: Button, Input, Badge, Modal, Drawer, Skeleton
│   ├── common/        # DataTable, ConfirmDeleteModal, PageHeader, RowActions
│   └── <fitur>/       # spesifik domain, misal components/mk-semester/
├── pages/             # per domain, selaras backend: auth, master, semester, kurikulum, perkuliahan, nilai, evaluasi, iam
│   ├── auth/
│   ├── master/
│   ├── semester/
│   ├── kurikulum/
│   ├── perkuliahan/
│   ├── nilai/
│   ├── evaluasi/
│   └── iam/
│   # DashboardPage, NotFoundPage, PlaceholderPage tetap di root pages/
├── layouts/
├── hooks/
│   └── table/         # useTableParams, pagination/search/sort/filters (URL)
├── services/          # api.js (pintu akses) + mockAdapter.js
├── store/             # Zustand (bukan data server)
├── validations/
├── utils/             # queryRows.js, formatter murni
├── helpers/
├── constants/         # mockData, navigation, theme
├── config/            # env.js (VITE_*)
├── policies/
├── routes/
└── main.jsx / App.jsx
```

`components/ui/` tidak boleh import `services/` atau `store/`. `pages/` compose hook + komponen, bukan tempat markup tabel/form panjang.

## 2. Styling — Tailwind 4 + DaisyUI 5

Tema hidup di `src/index.css` (`@import "tailwindcss"`, `@plugin "daisyui"`, `@plugin "daisyui/theme"`). Hanya dua tema: `myunand` (terang, default) dan `myunand-dark`. Jangan tambah tema DaisyUI bawaan (`light`, `corporate`, `dark`). Ukuran huruf diatur lewat `ui.store` (`--app-font-size` pada `html`) dari menu Kemudahan.

Pakai token DaisyUI (`btn`, `input`, `select`, `table`, `badge`, `tooltip`, `tabs-box`). Jangan warna/radius acak di luar token.

Kelas DaisyUI 4 yang dilarang: `form-control`, `label-text`, `input-bordered` / `select-bordered`, `tabs-boxed`. Ganti dengan `fieldset`/`label`, `input`/`select` polos, `tabs tabs-box`.

Hindari "AI slop": bold merata, radius `xl`+, hover di setiap card, border warna-warni, icon dengan background pelangi.

## 3. Konfigurasi (.env)

Baca lewat `src/config/env.js`, bukan `import.meta.env` tersebar.

- `VITE_USE_MOCK` — default `true`. Data list/CRUD lewat mock adapter.
- `VITE_API_BASE_URL` — untuk klien API asli nanti (default `/api`).

Sediakan `frontend/.env.example`. Jangan hardcode URL/key.

## 4. Service API

Satu pintu: `services/api.js`. Komponen/hook tidak boleh `fetch`/`axios` langsung.

| Fungsi | Dipakai untuk |
|---|---|
| `listResource(resource, params)` | halaman tabel (paginated) |
| `getResourceRows(resource)` | tampilan non-tabel (matriks, form pilihan) |
| `createResourceItem` / `updateResourceItem` / `deleteResourceItem` | CRUD |
| `replaceResourceRows` | ganti seluruh list (misal atur transkrip) |

Selama `env.useMock`, semua itu di `services/mockAdapter.js`. Resource baru: daftarkan di adapter (`idKey`, `searchable`) + baris di `constants/mockData.js`.

Saat API asli hidup: isi cabang non-mock di `api.js` saja. Halaman tidak berubah. Endpoint non-CRUD boleh punya `services/<fitur>/*.service.js`.

## 5. Data Fetching — React Query

`QueryClientProvider` sudah di `App.jsx`. Jangan `useEffect` + `useState` untuk data server.

- List DataTable: `useTableQuery(resource, params)` — query key `['table', resource, params]`, `keepPreviousData`.
- Semua baris: `useResourceQuery(resource)` — key `[resource, 'all']`.
- Mutasi: `useResourceMutations(resource)` — invalidate kedua key di atas + toast Sonner.

Jangan tulis `useQuery` duplikat untuk pola list standar.

## 6. Validasi Form — Zod

`react-hook-form` + `@hookform/resolvers/zod`. Schema di `validations/<fitur>/`. Selaraskan dengan Joi backend.

## 7. State Global — Zustand

Hanya state klien (auth, sidebar, tema terang/gelap, ukuran huruf). Data API tetap di React Query. Filter/sort/page tabel **bukan** Zustand — itu URL (poin 13).

## 8. Chart — ApexCharts

`apexcharts` + `react-apexcharts`. Mapping `series`/`categories` di `helpers/`, bukan di `pages/`.

## 9. Loading — Skeleton

Halaman/list: skeleton (`PageSkeleton`, baris tabel DataTable). Spinner hanya di tombol submit. Saat refetch tabel, redupkan isi (`opacity`) jangan kosongkan baris.

## 10. Overlay — Modal, Drawer, Hapus

- Modal: `<dialog>` native + `showModal()` / `close()` (`components/ui/Modal.jsx`). Jangan pola checkbox DaisyUI lama.
- Drawer: struktur `drawer` resmi, portal ke `body`.
- Hapus: selalu `ConfirmDeleteModal` (membungkus Modal).
- Tooltip aksi baris: `tooltip` + `data-tip` (`RowActions` / `IconButton`).

## 11. Icon — lucide-react

Satu sumber: `lucide-react`. Jangan campur Iconify / react-icons. Ukuran lewat prop `size`, warna lewat token (`text-primary`, `text-base-content/60`).

## 12. Notifikasi — Sonner

Satu `<Toaster />` di root. Sukses mutasi dari `useResourceMutations` / handler aksi. Error jaringan idealnya di klien API. Jangan `alert()`.

## 13. Tabel — DataTable wajib

Semua list resource pakai `components/common/DataTable.jsx`. Jangan `<table>` manual untuk daftar yang perlu cari/sort/page.

### Cara pakai

```jsx
<DataTable
  resource="prodi"
  tableKey="prodi_"          // prefix URL; wajib beda kalau >1 tabel per halaman
  columns={columns}
  rowKey={(row) => row.kode}
  searchPlaceholder="Cari prodi..."
/>
```

Mode klien (tanpa resource): `data={rows}` + `searchableFields={['nama']}`. Jangan mengirim `data` dan `resource` sekaligus.

DataTable sudah memanggil `useTableParams`. Jangan buat hook params per fitur.

### Kontrak query (FE → mock/API)

```
{ page, limit, search, sortBy, sortOrder, filter: { field: value } }
```

URL (dengan prefix `tableKey`):

- `prodi_page`, `prodi_limit`, `prodi_search`
- `prodi_sortBy`, `prodi_sortOrder`
- `prodi_filter.status=Aktif` → objek `filter: { status: 'Aktif' }`

Search di-debounce di `hooks/table/useTableSearch.js`. Sort kolom: asc → desc → lepas. Filter kolom lewat `column.filter` (`type: 'select' | 'text'`).

Envelope list:

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

`useTableQuery` menerima `pagination` atau alias `meta`. Backend kirim `pagination` sebagai sibling `data` (lihat `backend-conventions`).

### Kolom

```js
{
  key: 'nama',              // wajib untuk sort/filter
  header: 'Nama',
  sortable: true,
  filter: { type: 'select', options: ['Aktif', 'Nonaktif'] },
  render: (row, idx) => row.nama,
  className: '',            // <th>
  cellClassName: '',        // <td>
}
```

Kolom aksi di kanan, pakai `RowActions`. Dua tabel satu halaman: `tableKey` berbeda (`mk_`, `tr_`).

Empty state wajib (bukan tabel kosong). Master CRUD list: `MasterListPage` (modal create/edit + drawer detail + DataTable).

## 14. Otorisasi — CASL

`<Can I="create" a="Fakultas">` dari `permissions[]` user (format `{subject}.{action}`), bukan `if (user.role === 'admin')`. User bisa **multi-role**; ability = gabungan permission. Route lewat `ProtectedRoute`.

Pengelolaan akses: halaman matriks role × permission (`/pengaturan/peran`, wajib kotak cari name/description/group/subject) dan list user dengan assign banyak role (`/pengaturan/pengguna`). Jejak aktivitas (`/pengaturan/aktivitas`) read-only — DataTable tanpa tambah/ubah/hapus. Data lewat `services/api.js` (mock atau API). Jangan hardcode grant di komponen.

Hapus data master di UI memanggil `delete` — backend yang soft-delete. Jangan janjikan hapus permanen di copy tombol.

## 15. Helper & Utils

Formatter generik → `utils/`. Mapping domain/chart → `helpers/`. Logika query baris (search/filter/sort/page) → `utils/queryRows.js` (dipakai mock + mode klien).

## 16. Kerapian

Satu file satu tanggung jawab. PascalCase komponen, camelCase hook/service. Named export untuk `ui/`/`common/`.

## 17. Testing

Logic non-trivial: `vitest` + Testing Library. Komponen `ui/`/`common/` punya JSDoc props.

## Checklist

- [ ] Tidak ada markup/logic besar menumpuk di `pages/`
- [ ] URL/kredensial lewat `config/env.js`
- [ ] Data lewat `services/api.js` (mock atau API), bukan fetch di komponen
- [ ] List pakai `<DataTable resource="..." />`, state di URL, bukan Zustand
- [ ] Resource baru terdaftar di `mockAdapter` + `mockData`
- [ ] Mutasi lewat `useResourceMutations`, hapus lewat `ConfirmDeleteModal`
- [ ] Modal pakai `<dialog>` + `showModal()`, bukan checkbox
- [ ] Icon lucide-react, toast Sonner, chart ApexCharts, loading skeleton
- [ ] Kelas DaisyUI 5 (`tabs-box`, tanpa `*-bordered` / `form-control`)
- [ ] Form Zod, permission CASL (saat fitur itu disentuh)
