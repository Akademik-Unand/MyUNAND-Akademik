import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { ResourceSelect } from '../common/ResourceSelect';
import { semesterAkademikLabel } from '../../helpers/semesterProdi';
import { JENIS_PERIODE } from '../../helpers/academicPeriod';

export const PeriodeForm = ({ values, onChange }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3">
      <ResourceSelect
        resource="setting-semester"
        label="Semester *"
        value={values.semester_id || ''}
        onChange={set('semester_id')}
        placeholder="Pilih semester"
        getLabel={(row) => semesterAkademikLabel(row)}
        required
      />
      <Select
        label="Jenis *"
        name="jenis"
        value={values.jenis || ''}
        onChange={set('jenis')}
        placeholder="Pilih jenis"
        required
        options={[
          { value: JENIS_PERIODE.CPMK, label: 'CPMK' },
          { value: JENIS_PERIODE.NILAI, label: 'Nilai' },
        ]}
      />
      <Input
        label="Tanggal mulai *"
        name="tanggal_mulai"
        type="date"
        value={values.tanggal_mulai || ''}
        onChange={set('tanggal_mulai')}
        required
      />
      <Input
        label="Tanggal selesai *"
        name="tanggal_selesai"
        type="date"
        value={values.tanggal_selesai || ''}
        onChange={set('tanggal_selesai')}
        required
      />
    </div>
  );
};
