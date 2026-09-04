import { Input } from '../ui/Input';
import { ResourceSelect } from '../common/ResourceSelect';

export const KurikulumForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3 max-w-2xl">
      <ResourceSelect
        resource="prodi"
        label="Program Studi *"
        value={values.program_studi_id || ''}
        onChange={set('program_studi_id')}
        placeholder="Pilih program studi"
        required
      />
      <Input label="Nama Kurikulum *" value={values.nama || ''} onChange={set('nama')} required />
      <Input
        label="Tahun Kurikulum *"
        type="number"
        value={values.tahun || ''}
        onChange={set('tahun')}
        required
      />
      <Input
        label="Masa Studi Ideal *"
        type="number"
        value={values.masa_studi_ideal ?? ''}
        onChange={set('masa_studi_ideal')}
        required
      />
      <Input
        label="Masa Studi Maksimum *"
        type="number"
        value={values.masa_studi_maksimal ?? ''}
        onChange={set('masa_studi_maksimal')}
        required
      />
    </div>
  );
};
