import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { useResourceQuery } from "../../hooks/useResourceQuery";

export const ShiftForm = ({ values, onChange }) => {
  const { data: fakultasRows = [] } = useResourceQuery("fakultas");
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });

  const fakultasOptions = fakultasRows.map((row) => ({
    value: row.id,
    label: `${row.nama_resmi || row.nama_singkat || row.kode_fakultas}${row.nama_singkat ? ` (${row.nama_singkat})` : ""}`,
  }));

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Select
        label="Fakultas *"
        placeholder="Pilih fakultas"
        options={fakultasOptions}
        value={values.fakultas_id || ""}
        onChange={set("fakultas_id")}
        required
      />
      <Input
        label="Kode Shift *"
        placeholder="mis. Shift 1"
        maxLength={50}
        value={values.kode || ""}
        onChange={set("kode")}
        required
      />
      <Input
        label="Jam mulai *"
        type="time"
        value={values.jam_mulai || ""}
        onChange={set("jam_mulai")}
        required
      />
      <Input
        label="Jam selesai *"
        type="time"
        value={values.jam_selesai || ""}
        onChange={set("jam_selesai")}
        required
      />
      <p className="text-xs text-base-content/60 md:col-span-2">
        Shift adalah slot waktu standar per fakultas. Saat mengisi jadwal kelas,
        admin cukup memilih shift — jam mulai/selesai otomatis mengikuti master
        ini.
      </p>
    </div>
  );
};
