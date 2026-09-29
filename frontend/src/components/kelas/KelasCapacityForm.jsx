import { Input } from "../ui/Input";
import { totalCapacityLabel } from "../../helpers/kelasCapacity";

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
      <div className="form-control gap-1">
        <span className="label-text text-sm font-medium">Kapasitas total (otomatis)</span>
        <output className="input input-bordered input-sm flex items-center bg-base-200/60">{totalCapacityLabel(values.jumlah_peserta_internal_max, values.jumlah_peserta_lintas_prodi_max)}</output>
      </div>
      <Input
        label="Kuota maksimum mahasiswa prodi sendiri"
        type="number"
        min="0"
        value={values.jumlah_peserta_internal_max ?? ""}
        onChange={set("jumlah_peserta_internal_max")}
      />
      <Input
        label="Kuota maksimum lintas prodi"
        type="number"
        min="0"
        value={values.jumlah_peserta_lintas_prodi_max ?? ""}
        onChange={set("jumlah_peserta_lintas_prodi_max")}
      />
      <p className="text-xs text-base-content/60 md:col-span-2">
        Kapasitas total dijumlah otomatis dari kuota internal dan lintas prodi.
        Nilai 0 pada kuota menutup kelompok tersebut; kosong berarti kelompok
        tanpa batas sehingga total juga tanpa batas.
      </p>
    </div>
  );
};
