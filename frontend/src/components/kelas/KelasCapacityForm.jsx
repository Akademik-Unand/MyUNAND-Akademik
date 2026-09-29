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
        label="Kapasitas total kelas"
        type="number"
        min="0"
        value={values.jumlah_peserta_max ?? ""}
        onChange={set("jumlah_peserta_max")}
      />
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
        Kapasitas total mencakup mahasiswa internal dan lintas prodi. Masing-masing
        kuota membatasi kelompoknya; kapasitas total tetap membatasi gabungannya.
        Kosong berarti tanpa batas kelompok tambahan; kuota kelompok 0 menutup
        kelompok tersebut. Kapasitas total 0 berarti tanpa batas total.
      </p>
    </div>
  );
};
