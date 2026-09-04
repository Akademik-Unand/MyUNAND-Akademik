import { Input } from '../ui/Input';
import { ResourceSelect } from '../common/ResourceSelect';

export const SettingSemesterForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-4 max-w-2xl">
      <Input
        label="Tahun *"
        type="number"
        value={values.tahun || ''}
        onChange={set('tahun')}
        placeholder="2025"
        required
      />
      <ResourceSelect
        resource="jenis-semester"
        label="Jenis Semester *"
        value={values.jenis_semester_id || ''}
        onChange={set('jenis_semester_id')}
        placeholder="Pilih jenis semester"
        getLabel={(row) => row.nama || row.alias}
        required
      />
      <Input
        label="Tanggal mulai"
        type="date"
        value={values.tanggal_mulai || ''}
        onChange={set('tanggal_mulai')}
      />
      <Input
        label="Tanggal selesai"
        type="date"
        value={values.tanggal_selesai || ''}
        onChange={set('tanggal_selesai')}
      />
    </div>
  );
};
