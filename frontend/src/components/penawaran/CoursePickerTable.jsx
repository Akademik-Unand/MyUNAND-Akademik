import { DataTable } from "../common/DataTable";

/**
 * Pemilih mata kuliah untuk penawaran MK semester. Penawaran boleh memuat MK
 * berprasyarat (untuk mahasiswa prodi sendiri); larangan berprasyarat hanya
 * berlaku saat mahasiswa prodi lain mengambilnya (jalur lintas prodi).
 */
export const CoursePickerTable = ({
  courses,
  selected,
  quotas,
  defaultQuota,
  onToggle,
  onToggleAll,
  onQuotaChange,
}) => {
  const allSelected =
    courses.length > 0 && courses.every((row) => selected.includes(row.id));

  return (
    <DataTable
      data={courses}
      tableKey="course_pick_"
      rowKey={(row) => row.id}
      searchableFields={["kode_matakuliah", "nama_resmi"]}
      searchPlaceholder="Cari mata kuliah program studi..."
      emptyText="Pilih semester dan program studi untuk memuat mata kuliah."
      columns={[
        {
          header: (
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={allSelected}
              disabled={courses.length === 0}
              onChange={(event) => onToggleAll(event.target.checked)}
              aria-label="Pilih semua mata kuliah"
            />
          ),
          render: (row) => (
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selected.includes(row.id)}
              onChange={() => onToggle(row.id)}
              aria-label={`Pilih ${row.nama_resmi}`}
            />
          ),
        },
        { key: "kode_matakuliah", header: "Kode", sortable: true },
        {
          key: "nama_resmi",
          header: "Mata Kuliah",
          sortable: true,
          render: (row) => (
            <div className="flex items-center gap-2">
              <span>{row.nama_resmi}</span>
              {row.has_prasyarat && (
                <span
                  className="badge badge-warning badge-sm"
                  title="Mata kuliah berprasyarat tidak dapat dibuka untuk lintas prodi"
                >
                  Prasyarat
                </span>
              )}
            </div>
          ),
        },
        { key: "jumlah_sks_kurikulum", header: "SKS", sortable: true },
        {
          key: "semester_kurikulum",
          header: "Semester Kurikulum",
          sortable: true,
        },
        {
          key: "kuota_lintas_prodi",
          header: "Kapasitas Lintas",
          render: (row) =>
            row.has_prasyarat ? (
              <span className="text-xs font-medium text-base-content/50">
                Tidak dapat lintas
              </span>
            ) : (
              <input
                type="number"
                min="0"
                className="input input-sm w-24"
                value={quotas[row.id] ?? defaultQuota}
                disabled={!selected.includes(row.id)}
                onChange={(event) => onQuotaChange(row.id, event.target.value)}
                aria-label={`Kuota ${row.nama_resmi}`}
              />
            ),
        },
      ]}
    />
  );
};
