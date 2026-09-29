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
  onToggle,
  onToggleAll,
  onQuotaChange,
  showCrossEnrollment = false,
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
          key: "jumlah_peserta_max_default",
          header: "Total Awal (otomatis)",
          render: (row) => {
            const internal = quotas[row.id]?.internal ?? row.jumlah_peserta_internal_max_default ?? row.jumlah_peserta_max_default ?? 40;
            const cross = !showCrossEnrollment || row.has_prasyarat
              ? 0
              : quotas[row.id]?.external ?? row.kuota_lintas_prodi ?? 0;
            return <span className="text-sm font-semibold tabular-nums">{Number(internal || 0) + Number(cross || 0)}</span>;
          },
        },
        {
          key: "jumlah_peserta_internal_max_default",
          header: "Kuota Internal Awal",
          render: (row) => (
            <input
              type="number"
              min="0"
              className="input input-sm w-24"
              value={quotas[row.id]?.internal ?? row.jumlah_peserta_internal_max_default ?? 40}
              disabled={!selected.includes(row.id)}
              onChange={(event) => onQuotaChange(row.id, "internal", event.target.value)}
              aria-label={`Kuota internal awal ${row.nama_resmi}`}
            />
          ),
        },
        ...(showCrossEnrollment ? [{
          key: "kuota_lintas_prodi",
          header: "Kuota Lintas Awal",
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
                value={quotas[row.id]?.external ?? row.kuota_lintas_prodi ?? 0}
                disabled={!selected.includes(row.id)}
                onChange={(event) => onQuotaChange(row.id, "external", event.target.value)}
                aria-label={`Kuota lintas awal ${row.nama_resmi}`}
              />
            ),
        }] : []),
      ]}
    />
  );
};
