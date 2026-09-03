import { Input } from '../ui/Input';

export const FakultasForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input label="Kode Fakultas *" name="kode" value={values.kode || ''} onChange={set('kode')} maxLength={15} required />
      <Input label="Universitas" name="universitas" value={values.universitas || ''} onChange={set('universitas')} />
      <Input label="Nama Resmi *" name="nama" value={values.nama || ''} onChange={set('nama')} required />
      <Input label="Nama Singkat" name="singkat" value={values.singkat || ''} onChange={set('singkat')} />
    </div>
  );
};
