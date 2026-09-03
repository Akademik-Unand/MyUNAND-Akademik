import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const JenisSemesterForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <Select
        label="Kategori *"
        value={values.kategori || ''}
        onChange={set('kategori')}
        placeholder="Pilih kategori"
        options={[
          { value: 'Reguler', label: 'Reguler' },
          { value: 'Pendek', label: 'Pendek' },
        ]}
      />
      <Input label="Periode *" value={values.periode || ''} onChange={set('periode')} placeholder="Semester I" required />
      <Input label="Label *" value={values.label || ''} onChange={set('label')} placeholder="Ganjil" required />
      <Input label="Label Singkat" value={values.singkat || ''} onChange={set('singkat')} placeholder="Smt-I" />
    </div>
  );
};
