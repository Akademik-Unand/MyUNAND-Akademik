import { Input } from '../ui/Input';

export const JenjangForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input
        label="Kode Jenjang *"
        name="kode_jenjang"
        value={values.kode_jenjang || ''}
        onChange={set('kode_jenjang')}
        required
      />
      <Input
        label="Nama Jenjang *"
        name="nama_jenjang"
        value={values.nama_jenjang || ''}
        onChange={set('nama_jenjang')}
        required
      />
    </div>
  );
};
