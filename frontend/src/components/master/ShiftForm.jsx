import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { useResourceQuery } from "../../hooks/useResourceQuery";

export const ShiftForm = ({ values, onChange }) => {
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Select
        label="Sistem SKS *"
        placeholder="Pilih sistem"
        options={[
          { value: "2 SKS", label: "2 SKS" },
          { value: "3 SKS", label: "3 SKS" },
          { value: "Lainnya", label: "Lainnya" },
        ]}
        value={values.sistem_sks || ""}
        onChange={set("sistem_sks")}
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
