import { Select } from "../ui/Select";
import { useFilterOptions } from "../../hooks/useFilterOptions";

export const OfferingSettings = ({ values, onChange }) => {
  const raw = useFilterOptions();
  const semesterOptions = (raw.semesterRows || []).map((row) => ({
    value: row.id,
    label: `${row.jenisSemester?.nama || row.jenisSemester?.alias || "Semester"} ${row.tahun}${row.is_aktif ? " (Aktif)" : ""}`,
  }));

  const update = (changes) => onChange({ ...values, ...changes });
  const set = (key) => (event) => update({ [key]: event.target.value });

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <Select
        label="Semester *"
        value={values.semester_id || ""}
        onChange={set("semester_id")}
        options={semesterOptions}
        placeholder="Pilih Semester"
        disabled={!values.program_studi_id}
        required
      />
      {!values.program_studi_id && (
        <p className="text-xs text-base-content/60 md:col-span-3">
          Pilih program studi penyelenggara agar pilihan semester tersedia.
        </p>
      )}
      <fieldset className="md:col-span-3">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm mt-0.5"
            checked={values.akses !== "internal"}
            onChange={(event) =>
              update({
                akses: event.target.checked ? "semua" : "internal",
                ...(!event.target.checked ? { prodi_tujuan: [] } : {}),
              })
            }
            aria-label="Buka juga untuk mahasiswa prodi lain"
          />
          <span>
            <span className="block font-medium">Buka juga untuk mahasiswa prodi lain</span>
            <span className="block text-xs text-base-content/60">
              Penawaran untuk mahasiswa prodi penyelenggara tetap tersedia.
              Kuota lintas menjadi nilai awal, lalu dapat diatur sesuai kapasitas setiap kelas.
            </span>
          </span>
        </label>
      </fieldset>
      {values.akses !== "internal" && (
        <>
          <Select
            label="Prodi yang dapat mengakses"
            value={values.akses}
            onChange={set("akses")}
            options={[
              { value: "semua", label: "Semua program studi" },
              { value: "terpilih", label: "Program studi tertentu" },
            ]}
          />
          {values.akses === "terpilih" && (
        <fieldset className="md:col-span-3">
          <legend className="mb-2 text-sm font-medium">Pilih prodi tujuan *</legend>
          {raw.prodiRows.length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {raw.prodiRows
                .filter((row) => row.id !== values.program_studi_id)
                .map((row) => {
                  const checked = (values.prodi_tujuan || []).includes(row.id);
                  return (
                    <label key={row.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={checked}
                        onChange={() => {
                          const current = values.prodi_tujuan || [];
                          update({
                            prodi_tujuan: checked
                              ? current.filter((id) => id !== row.id)
                              : [...current, row.id],
                          });
                        }}
                      />
                      {row.nama_singkat || row.nama_resmi || row.kode_prodi}
                    </label>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-warning">Data program studi belum tersedia.</p>
          )}
          {!values.prodi_tujuan?.length && (
            <p className="mt-1 text-xs text-error">Pilih minimal satu program studi tujuan.</p>
          )}
        </fieldset>
          )}
        </>
      )}
    </div>
  );
};
