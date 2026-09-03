import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export const ProdiForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3 max-w-2xl">
      <Input label="Kode Prodi *" value={values.kode || ''} onChange={set('kode')} maxLength={15} required />
      <Select
        label="Jenjang"
        value={values.jenjang || ''}
        onChange={set('jenjang')}
        placeholder="Pilih jenjang"
        options={[
          { value: 'S1', label: 'S1' },
          { value: 'S2', label: 'S2' },
          { value: 'S3', label: 'S3' },
          { value: 'D3', label: 'D3' },
        ]}
      />
      <Input label="Model ID" type="number" value={values.model || ''} onChange={set('model')} />
      <Input label="Universitas ID" type="number" value={values.univ || ''} onChange={set('univ')} />
      <Input label="Fakultas ID *" type="number" value={values.fakultas || ''} onChange={set('fakultas')} required />
      <Input label="Departemen ID" type="number" value={values.departemen || ''} onChange={set('departemen')} />
      <Input label="Nama Resmi *" value={values.nama || ''} onChange={set('nama')} required />
      <Input label="Nama Singkat" value={values.singkat || ''} onChange={set('singkat')} />
    </div>
  );
};
