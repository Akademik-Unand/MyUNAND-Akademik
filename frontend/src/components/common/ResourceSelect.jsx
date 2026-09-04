import { Select } from '../ui/Select';
import { useResourceQuery } from '../../hooks/useResourceQuery';

export const ResourceSelect = ({
  resource,
  label,
  value,
  onChange,
  name,
  placeholder = 'Pilih',
  required = false,
  disabled = false,
  getValue = (row) => row.id,
  getLabel = (row) => row.nama_resmi || row.nama || row.name || row.kode || row.id,
  params,
  size,
}) => {
  const { data = [] } = useResourceQuery(resource, { params });
  const options = data.map((row) => ({ value: getValue(row), label: getLabel(row) }));

  return (
    <Select
      label={label}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      required={required}
      disabled={disabled}
      size={size}
    />
  );
};
