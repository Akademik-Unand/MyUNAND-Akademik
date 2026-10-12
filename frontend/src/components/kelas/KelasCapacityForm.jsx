import { Input } from "../ui/Input";

export const KelasCapacityForm = ({ values, onChange }) => {
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Input
        label="Kapasitas minimum"
        type="number"
        min="0"
        value={values.jumlah_peserta_min ?? ""}
        onChange={set("jumlah_peserta_min")}
      />
      <Input
        label="Kuota maksimum kelas"
        type="number"
        min="0"
        value={values.jumlah_peserta_max ?? ""}
        onChange={set("jumlah_peserta_max")}
        required
      />
      <p className="text-xs text-base-content/60 md:col-span-2">
        Kuota internal dan lintas prodi mengikuti pengaturan global mata kuliah.
        Jumlah kuota seluruh kelas harus sama dengan kuota global.
      </p>
    </div>
  );
};
