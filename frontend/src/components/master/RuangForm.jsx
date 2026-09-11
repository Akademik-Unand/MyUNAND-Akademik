import { Input } from "../ui/Input";
import { ResourceSelect } from "../common/ResourceSelect";

export const RuangForm = ({ values, onChange }) => {
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });
  return (
    <div className="space-y-3">
      <ResourceSelect
        resource="gedung"
        label="Gedung *"
        value={values.gedung_id || ""}
        onChange={set("gedung_id")}
        required
      />
      <Input
        label="Kode Ruang *"
        value={values.kode || ""}
        onChange={set("kode")}
        required
      />
      <Input
        label="Nama Ruang *"
        value={values.nama || ""}
        onChange={set("nama")}
        required
      />
      <Input
        label="Kapasitas"
        type="number"
        min="0"
        value={values.kapasitas ?? 0}
        onChange={set("kapasitas")}
      />
    </div>
  );
};
