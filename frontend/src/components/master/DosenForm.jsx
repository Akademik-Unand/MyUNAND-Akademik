import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";

export const DosenForm = ({ values, onChange }) => {
  const academic = useAcademicFilter({
    keys: ["fakultas", "departemen", "prodi"],
  });
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });
  const setAcademic = (key) => (event) => {
    const field = academic.fields.find((item) => item.name === key);
    field?.onChange(event);
    if (key === "prodi") set("program_studi_id")(event);
  };
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {academic.fields.map((field) => (
        <Select
          key={field.name}
          label={`${field.label}${field.name === "prodi" ? " *" : ""}`}
          options={field.options}
          value={
            field.name === "prodi"
              ? values.program_studi_id || field.value
              : field.value
          }
          onChange={setAcademic(field.name)}
          disabled={field.disabled}
          placeholder={field.placeholder}
          required={field.name === "prodi"}
        />
      ))}
      <Input
        label="NIP *"
        value={values.nip || ""}
        onChange={set("nip")}
        required
      />
      <Input label="Nama" value={values.nama || ""} onChange={set("nama")} />
      <Input label="NIDN" value={values.nidn || ""} onChange={set("nidn")} />
      <Input
        label="NIP Lama"
        value={values.nip_lama || ""}
        onChange={set("nip_lama")}
      />
      <Input
        label="NIP Baru"
        value={values.nip_baru || ""}
        onChange={set("nip_baru")}
      />
    </div>
  );
};
