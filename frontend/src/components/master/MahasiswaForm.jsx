import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ResourceSelect } from "../common/ResourceSelect";

export const MahasiswaForm = ({ values, onChange }) => {
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Input
        label="NIM/NIU *"
        value={values.niu || ""}
        onChange={set("niu")}
        maxLength={20}
        required
      />
      <Input
        label="Nama *"
        value={values.nama || ""}
        onChange={set("nama")}
        maxLength={255}
        required
      />
      <Input
        label="Angkatan"
        type="number"
        value={values.angkatan ?? ""}
        onChange={set("angkatan")}
      />
      <ResourceSelect
        resource="prodi"
        label="Program Studi"
        value={values.program_studi_id || ""}
        onChange={set("program_studi_id")}
        getLabel={(row) => row.nama_singkat || row.nama_resmi || row.kode_prodi}
      />
      <Select
        label="Jenis Kelamin"
        value={values.jenis_kelamin || ""}
        onChange={set("jenis_kelamin")}
        placeholder="Pilih jenis kelamin"
        options={[
          { value: "L", label: "Laki-laki" },
          { value: "P", label: "Perempuan" },
        ]}
      />
    </div>
  );
};
