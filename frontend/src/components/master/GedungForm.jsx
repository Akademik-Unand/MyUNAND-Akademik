import { Input } from '../ui/Input';

export const GedungForm = ({ values, onChange }) => {
  const set = (key) => (event) => onChange({ ...values, [key]: event.target.value });
  return <div className="space-y-3">
    <Input label="Kode Gedung *" value={values.kode || ''} onChange={set('kode')} required />
    <Input label="Nama Gedung *" value={values.nama || ''} onChange={set('nama')} required />
    <Input label="Alamat" value={values.alamat || ''} onChange={set('alamat')} />
  </div>;
};
