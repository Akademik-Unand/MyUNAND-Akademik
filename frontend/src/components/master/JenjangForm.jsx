import { Input } from '../ui/Input';

export const JenjangForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input label="Kode Jenjang *" name="kode" value={values.kode || ''} onChange={set('kode')} required />
      <Input label="Nama Jenjang *" name="nama" value={values.nama || ''} onChange={set('nama')} required />
    </div>
  );
};
