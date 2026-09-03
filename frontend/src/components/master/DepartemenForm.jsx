import { Input } from '../ui/Input';

export const DepartemenForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input label="Kode Departemen *" name="kode" value={values.kode || ''} onChange={set('kode')} maxLength={15} required />
      <Input label="Fakultas *" name="fakultas" value={values.fakultas || ''} onChange={set('fakultas')} required />
      <Input label="Nama Resmi *" name="nama" value={values.nama || ''} onChange={set('nama')} required />
      <Input label="Nama Singkat" name="singkat" value={values.singkat || ''} onChange={set('singkat')} />
    </div>
  );
};
