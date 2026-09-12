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
        label="Kapasitas maksimum (prodi sendiri)"
        type="number"
        min="0"
        value={values.jumlah_peserta_max ?? ""}
        onChange={set("jumlah_peserta_max")}
      />
      <p className="text-xs text-base-content/60 md:col-span-2">
        Kapasitas maksimum membatasi pendaftaran KRS reguler (mahasiswa prodi
        sendiri). Kosong atau 0 = tanpa batas. Mahasiswa lintas prodi memakai
        kuota lintas yang diatur di Penawaran MK — terpisah di luar kapasitas
        ini.
      </p>
    </div>
  );
};
