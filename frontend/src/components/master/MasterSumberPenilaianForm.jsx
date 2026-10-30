import { Input } from "../ui/Input";

export const MasterSumberPenilaianForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

  return (
    <div className="space-y-3">
      <Input
        label="Kode Sumber *"
        name="kode"
        placeholder="Mis. UTS, UAS, PJBL, QUIZ"
        value={values.kode || ""}
        onChange={(e) =>
          onChange({ ...values, kode: e.target.value.toUpperCase() })
        }
        required
      />
      <Input
        label="Nama Sumber Penilaian *"
        name="nama"
        placeholder="Mis. UTS, UAS, Project, Quiz"
        value={values.nama || ""}
        onChange={set("nama")}
        required
      />
      <Input
        label="Keterangan"
        name="deskripsi"
        placeholder="Keterangan singkat komponen penilaian (opsional)..."
        value={values.deskripsi || ""}
        onChange={set("deskripsi")}
      />
    </div>
  );
};
