import { Input } from '../ui/Input';

export const JenisSemesterForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Input label="Nama *" name="nama" value={values.nama || ''} onChange={set('nama')} required />
      <Input label="Alias" name="alias" value={values.alias || ''} onChange={set('alias')} />
      <Input
        label="Urutan"
        name="urut"
        type="number"
        value={values.urut ?? 0}
        onChange={set('urut')}
      />
    </div>
  );
};
