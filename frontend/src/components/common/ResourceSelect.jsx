import { Select } from "../ui/Select";
import { useResourceQuery } from "../../hooks/useResourceQuery";

export const ResourceSelect = ({
  resource,
  label,
  value,
  onChange,
  name,
  placeholder = "Pilih",
  required = false,
  disabled = false,
  getValue = (row) => row.id,
  getLabel,
  params,
  size,
}) => {
  const { data = [] } = useResourceQuery(resource, { params });
  const resolveLabel =
    getLabel ||
    ((row) =>
      resource === "prodi"
        ? row.nama_singkat || row.kode_prodi || row.id
        : row.nama_resmi || row.nama || row.name || row.kode || row.id);
  const options = data.map((row) => ({
    value: getValue(row),
    label: resolveLabel(row),
  }));

  return (
    <Select
      label={label}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      required={required}
      disabled={disabled}
      size={size}
    />
  );
};
