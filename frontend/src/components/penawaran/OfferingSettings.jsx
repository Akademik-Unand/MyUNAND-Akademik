import { Input } from "../ui/Input";
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
      <Input
        label="Kapasitas Lintas Prodi *"
        type="number"
        min="0"
        value={values.kuota_lintas_prodi}
        onChange={set("kuota_lintas_prodi")}
        required
      />
      <Select
        label="Akses *"
        value={values.akses}
        onChange={set("akses")}
        options={[
          { value: "semua", label: "Semua Program Studi" },
          { value: "terpilih", label: "Program Studi Terpilih" },
        ]}
      />
    </div>
  );
};
